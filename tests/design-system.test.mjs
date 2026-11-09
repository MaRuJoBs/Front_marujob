import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { parse, compileScript } from 'vue/compiler-sfc'
import { build } from 'vite'
import vue from '@vitejs/plugin-vue'
import { createRenderer, h, nextTick, ref, ssrContextKey } from 'vue'

// Compila templates de cliente: ssrLoadModule só produz ssrRender, inadequado
// para o renderer de interação. Usa o compiler distribuído com o próprio Vue.
const cache = new URL('../node_modules/.cache/feat48-compiled/', import.meta.url)
mkdirSync(cache, { recursive: true })
const load = async (name) => {
  const source = readFileSync(new URL(`../src/components/ui/${name}.vue`, import.meta.url), 'utf8')
  const { descriptor, errors } = parse(source)
  assert.deepEqual(errors, [])
  const result = compileScript(descriptor, { id: name, inlineTemplate: true })
  const target = new URL(`${name}.mjs`, cache)
  writeFileSync(
    target,
    result.content.replace(/import ['"]\.\.\/\.\.\/styles\/tokens.css['"]/g, ''),
  )
  return (await import(target.href)).default
}
const Button = await load('BaseButton')
const Input = await load('BaseInput')
const Card = await load('BaseCard')

// Mesmo renderer Vue usado pela infraestrutura existente, sem dependência de DOM externa.
const renderer = createRenderer({
  createElement: (tag) => ({ tag, props: {}, children: [] }),
  createText: (text) => ({ text }),
  createComment: (text) => ({ comment: text }),
  setText: (node, text) => (node.text = text),
  setElementText: (node, text) => (node.text = text),
  patchProp: (node, key, old, value) => (node.props[key] = value),
  insert(node, parent) {
    if (!parent.children.includes(node)) parent.children.push(node)
  },
  remove() {},
  parentNode: () => null,
  nextSibling: () => null,
})
function mount(component, props = {}, slots = {}) {
  const root = { children: [] }
  const app = renderer.createApp({ render: () => h(component, props, slots) })
  app.provide(ssrContextKey, {})
  app.mount(root)
  return { root, app }
}
function find(node, tag) {
  if (node.tag === tag) return node
  return node.children?.map((child) => find(child, tag)).find(Boolean)
}
function content(node) {
  return [node.text || '', ...(node.children || []).map(content)].join('')
}

test('botão: todas as variantes/tamanhos, slot, tipo seguro e evento de clique', () => {
  for (const variant of ['primary', 'secondary', 'outline', 'text']) {
    for (const size of ['small', 'medium', 'large']) {
      let clicks = 0
      const { root, app } = mount(
        Button,
        { variant, size, onClick: () => clicks++ },
        { default: () => 'Salvar' },
      )
      const button = find(root, 'button')
      assert.equal(button.props.type, 'button')
      assert.match(button.props.class, new RegExp(`mrj-button--${variant}`))
      assert.match(button.props.class, new RegExp(`mrj-button--${size}`))
      assert.match(content(button), /Salvar/)
      button.props.onClick({})
      assert.equal(clicks, 1)
      app.unmount()
    }
  }
})

test('botão: disabled e loading bloqueiam eventos e expõem estado acessível', () => {
  for (const state of [{ disabled: true }, { loading: true }]) {
    let clicks = 0
    let prevented = false
    const { root, app } = mount(Button, { ...state, onClick: () => clicks++ })
    const button = find(root, 'button')
    assert.equal(button.props.disabled, true)
    button.props.onClick({ preventDefault: () => (prevented = true) })
    assert.equal(clicks, 0)
    assert.equal(prevented, true)
    if (state.loading) {
      assert.equal(button.props['aria-busy'], true)
      assert.equal(find(root, 'span').props.role, 'status')
      assert.match(content(root), /Carregando/)
    }
    app.unmount()
  }
})

test('campo: label, ajuda e erro associados; atributos repassados ao input', () => {
  const { root, app } = mount(Input, {
    id: 'email',
    label: 'E-mail',
    type: 'email',
    required: true,
    disabled: true,
    help: 'Use seu e-mail profissional',
    error: 'Informe um e-mail válido',
    name: 'email',
    autocomplete: 'email',
    'aria-describedby': 'externo',
  })
  const input = find(root, 'input')
  assert.equal(find(root, 'label').props.for, 'email')
  assert.equal(input.props.id, 'email')
  assert.equal(input.props.name, 'email')
  assert.equal(input.props.autocomplete, 'email')
  assert.equal(input.props.required, true)
  assert.equal(input.props.disabled, true)
  assert.equal(input.props['aria-invalid'], 'true')
  assert.equal(input.props['aria-describedby'], 'externo email-help email-error')
  assert.match(content(root), /obrigatório/)
  app.unmount()
})

test('campo: v-model atualiza valor e IDs automáticos são únicos na aplicação', async () => {
  const value = ref('antes')
  const description = ref('ajuda-externa')
  const { root, app } = mount({
    render: () =>
      h(Input, {
        label: 'Nome',
        modelValue: value.value,
        'aria-describedby': description.value,
        'onUpdate:modelValue': (next) => (value.value = next),
      }),
  })
  const input = find(root, 'input')
  assert.equal(input.props.value, 'antes')
  input.props.onInput({ target: { value: 'depois' } })
  await nextTick()
  assert.equal(value.value, 'depois')
  assert.equal(input.props.value, 'depois')
  description.value = 'outra-ajuda'
  await nextTick()
  assert.equal(input.props['aria-describedby'], 'outra-ajuda')
  app.unmount()
  const pair = mount({
    render: () => h('div', [h(Input, { label: 'A' }), h(Input, { label: 'B' })]),
  })
  const nodes = pair.root.children[0].children.filter((node) => node.tag === 'div')
  const ids = nodes.map((node) => find(node, 'input').props.id)
  assert.equal(ids.length, 2)
  assert.equal(new Set(ids).size, 2)
  pair.app.unmount()
})

test('card: slots e elevação opcionais, sem semântica interativa', () => {
  const { root, app } = mount(
    Card,
    { elevated: true },
    { header: () => 'Título', default: () => 'Conteúdo', footer: () => 'Rodapé' },
  )
  const card = find(root, 'div')
  assert.match(card.props.class, /mrj-card--elevated/)
  assert.match(content(card), /TítuloConteúdoRodapé/)
  assert.equal(card.props.role, undefined)
  app.unmount()
})

const css = readFileSync(new URL('../src/styles/tokens.css', import.meta.url), 'utf8')
const tokens = [...css.matchAll(/(--mrj-[\w-]+):\s*([^;]+);/g)]
const values = new Map(tokens.map(([, key, value]) => [key, value.trim()]))
test('tokens: escopo opt-in, sem duplicações na escala e sem referências quebradas', () => {
  const base = css.split('@media')[0]
  const declarations = [...base.matchAll(/(--mrj-[\w-]+):/g)].map((match) => match[1])
  assert.equal(new Set(declarations).size, declarations.length)
  assert.doesNotMatch(css.replace(/\/\*[\s\S]*?\*\//g, ''), /:root/)
  assert.match(css, /prefers-reduced-motion/)
  for (const name of ['BaseButton', 'BaseInput', 'BaseCard']) {
    const source = readFileSync(
      new URL(`../src/components/ui/${name}.vue`, import.meta.url),
      'utf8',
    )
    for (const [, token] of source.matchAll(/var\((--mrj-[\w-]+)\)/g)) {
      assert.ok(values.has(token), `${name}: ${token} ausente`)
    }
  }
})

function luminance(hex) {
  const channels = hex.match(/[a-f\d]{2}/gi).map((part) => {
    const value = parseInt(part, 16) / 255
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
  })
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722
}
function contrast(a, b) {
  const light = luminance(a)
  const dark = luminance(b)
  return (Math.max(light, dark) + 0.05) / (Math.min(light, dark) + 0.05)
}
test('contraste: pares de texto AA e borda/foco >= 3:1 nas superfícies previstas', () => {
  const color = (name) => {
    const value = values.get(`--mrj-color-${name}`)
    return value.startsWith('var(') ? values.get(value.slice(4, -1)) : value
  }
  for (const background of ['primary', 'primary-hover', 'primary-active']) {
    assert.ok(contrast(color('on-primary'), color(background)) >= 4.5, background)
  }
  for (const background of ['surface', 'background', 'secondary', 'secondary-hover']) {
    for (const foreground of ['text', 'text-secondary', 'danger', 'success', 'warning']) {
      assert.ok(
        contrast(color(foreground), color(background)) >= 4.5,
        `${foreground}/${background}`,
      )
    }
    for (const foreground of ['border', 'focus']) {
      assert.ok(contrast(color(foreground), color(background)) >= 3, `${foreground}/${background}`)
    }
  }
  console.log(
    'Contraste mínimo texto secundário/superfície:',
    contrast(color('text-secondary'), color('surface')).toFixed(2),
  )
})

test('build isolado: os três SFCs e seus estilos compilam pelo Vite sem integrar páginas', async () => {
  const components = ['BaseButton', 'BaseInput', 'BaseCard']
  const buildEntry = new URL('entry.mjs', cache)
  writeFileSync(
    buildEntry,
    components
      .map(
        (name) =>
          `export { default as ${name} } from ${JSON.stringify(new URL(`../src/components/ui/${name}.vue`, import.meta.url).pathname)}`,
      )
      .join('\n'),
  )
  const result = await build({
    configFile: false,
    logLevel: 'error',
    plugins: [vue()],
    build: {
      outDir: 'node_modules/.cache/feat48-build',
      emptyOutDir: true,
      lib: { entry: buildEntry.pathname, formats: ['es'], fileName: 'ui' },
      rollupOptions: { external: ['vue'] },
    },
  })
  const output = result[0].output
  assert.ok(output.some((item) => item.type === 'asset' && item.fileName.endsWith('.css')))
  const entry = output.find((item) => item.type === 'chunk' && item.isEntry)
  for (const name of components) assert.ok(entry.exports.includes(name))
})
