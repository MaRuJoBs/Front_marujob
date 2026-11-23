import test, { after, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'vite'
import { createRenderer, h, nextTick } from 'vue'
const storage = new Map()
globalThis.localStorage = {
  getItem: (k) => storage.get(k) ?? null,
  setItem: (k, v) => storage.set(k, v),
  removeItem: (k) => storage.delete(k),
}
const vite = await createServer({
  configFile: false,
  optimizeDeps: { noDiscovery: true },
  server: { middlewareMode: true, watch: null, ws: false },
  appType: 'custom',
})
const navegadorOriginal = Object.getOwnPropertyDescriptor(globalThis, 'navigator')
after(() => {
  if (navegadorOriginal) Object.defineProperty(globalThis, 'navigator', navegadorOriginal)
  else delete globalThis.navigator
  return vite.close()
})
const load = (p) => vite.ssrLoadModule('/src/' + p)
const { default: api } = await load('services/api.js')
const { sessao, limparSessao } = await load('services/authSession.js')
const { usePerfilEmpresa } = await load('composables/usePerfilEmpresa.js')
const { default: geocodingApi } = await load('services/geocodingApi.js')
const { payloadPerfil, validarPerfil } = await load('services/empresaPerfilService.js')
const { protegerRota } = await load('router/authGuard.js')
const { routes } = await load('router/routes.js')
const renderer = createRenderer({
  createElement: () => ({}),
  createText: () => ({}),
  createComment: () => ({}),
  setText() {},
  setElementText() {},
  patchProp() {},
  insert() {},
  remove() {},
  parentNode() {},
  nextSibling() {},
})
function montar() {
  let estado
  const app = renderer.createApp({
    setup() {
      estado = usePerfilEmpresa()
      return () => h('div')
    },
  })
  app.mount({})
  return { estado, fechar: () => app.unmount() }
}
let banco, chamadas, falha
beforeEach(async () => {
  Object.defineProperty(globalThis, 'navigator', {
    configurable: true,
    value: {
      geolocation: {
        getCurrentPosition: (ok) =>
          ok({ coords: { latitude: -26, longitude: -48, accuracy: 5 }, timestamp: Date.now() }),
      },
    },
  })
  geocodingApi.reverse = async () => ({ cidade: 'Joinville', uf: 'SC' })
  limparSessao()
  await nextTick()
  storage.set('token', 'teste')
  sessao.tipo = 'empresa'
  sessao.usuario = { id: 1, groups: ['Empresa'] }
  banco = { empresa: 1, name: 'Empresa teste', cidade: '', uf: '', profile_image: null }
  chamadas = []
  falha = null
  api.defaults.adapter = async (config) => {
    chamadas.push(config)
    if (falha) {
      const e = Error('simulado')
      if (falha !== 'rede') e.response = { status: falha, data: { cidade: ['Cidade inválida.'] } }
      throw e
    }
    if (config.method === 'patch') Object.assign(banco, JSON.parse(config.data))
    return { config, status: 200, headers: {}, data: { ...banco } }
  }
})
test('carrega, altera somente campos necessários, salva e relê; cancelar restaura', async () => {
  const { estado: e, fechar } = montar()
  try {
    await e.carregar()
    assert.equal(e.perfil.value.name, banco.name)
    e.editando.value = true
    await e.localizacao.usarLocalizacaoAtual()
    await Promise.all([e.salvar(), e.salvar()])
    assert.equal(chamadas.filter((c) => c.method === 'patch').length, 1)
    assert.deepEqual(JSON.parse(chamadas[1].data), { cidade: 'Joinville', uf: 'SC' })
    assert.equal(e.perfil.value.cidade, 'Joinville')
    assert.ok(e.sucesso.value)
    await e.carregar()
    assert.equal(e.form.value.cidade, 'Joinville')
    e.form.value.cidade = 'Outro'
    e.cancelar()
    assert.equal(e.form.value.cidade, 'Joinville')
    assert.ok(chamadas.every((c) => c.url === 'empresas/me/'))
  } finally {
    fechar()
  }
})
test('valida nome, UF e protocolo; upload multipart e remoção JSON sem campos privados', () => {
  assert.equal(
    Object.keys(validarPerfil({ name: '', uf: 'XX', website: 'javascript:alert(1)' })).length,
    3,
  )
  const original = { name: 'Empresa', profile_image: '/logo.png' }
  assert.deepEqual(payloadPerfil(original, original, null), { profile_image: null })
  const payload = payloadPerfil(
    { ...original, empresa: 9, privilegio: true },
    original,
    new Blob(['imagem'], { type: 'image/png' }),
  )
  assert.ok(payload instanceof FormData)
  assert.deepEqual([...payload.keys()], ['profile_image'])
})
test('erros 400, 403, 503 e rede preservam formulário e permitem nova tentativa', async () => {
  const { estado: e, fechar } = montar()
  try {
    await e.carregar()
    e.editando.value = true
    await e.localizacao.usarLocalizacaoAtual()
    for (const status of [400, 403, 503, 'rede']) {
      falha = status
      await e.salvar()
      assert.ok(e.erro.value)
      assert.equal(e.form.value.cidade, 'Joinville')
      assert.equal(e.editando.value, true)
      assert.equal(e.salvando.value, false)
      if (status === 400) assert.equal(e.erros.value.cidade, 'Cidade inválida.')
    }
    falha = null
    await e.salvar()
    assert.equal(e.perfil.value.cidade, 'Joinville')
  } finally {
    fechar()
  }
})
test('guard restringe rota a empresa e redireciona visitante', async () => {
  const rota = routes.find((r) => r.path === '/empresa/perfil')
  // F61: layout desktop opt-in; a proteção por tipo de conta continua a mesma.
  assert.deepEqual(rota.meta, { requiresAuth: true, tipo: 'empresa', layout: 'wide' })
  sessao.tipo = 'usuario'
  assert.equal((await protegerRota({ ...rota, query: {} })).path, '/home')
  limparSessao()
  assert.equal((await protegerRota({ ...rota, query: {} })).name, 'login')
})
test('401 encerra a sessão pelo interceptor existente', async () => {
  const { estado: e, fechar } = montar()
  try {
    await e.carregar()
    api.defaults.adapter = async (config) => {
      const error = Error('sessão expirada')
      error.config = config
      error.response = { status: 401, data: {} }
      throw error
    }
    await e.carregar()
    await nextTick()
    assert.equal(storage.get('token'), undefined)
    assert.equal(e.perfil.value, null)
    assert.equal((await protegerRota({ meta: { requiresAuth: true }, query: {} })).name, 'login')
  } finally {
    fechar()
  }
})

// F51 definiu a área empresarial como aplicativo compacto. A F61 mantém isso abaixo de 1024px e
// libera a largura desktop só com a navegação lateral (≥ 64rem). O opt-in `layout: 'wide'` não
// amplia a empresa no mobile/tablet porque `.app--empresa` fixa o shell em 26.25rem fora do bloco
// desktop; a medida real em 390/768px fica com tests/responsividade.browser.mjs.
test('rotas empresariais: shell compacto abaixo de 1024px e layout amplo só no desktop', async () => {
  const empresariais = routes.filter((rota) => rota.meta?.tipo === 'empresa')
  assert.equal(empresariais.length, 9)
  for (const rota of empresariais) {
    assert.equal(rota.meta.requiresAuth, true, rota.path)
    assert.equal(rota.meta.layout, 'wide', rota.path)
  }
  for (const path of ['/criar-vaga', '/editar-vaga/:id']) {
    assert.equal(routes.find((rota) => rota.path === path).meta.hideFooter, true)
  }
  const { readFile } = await import('node:fs/promises')
  const shell = (await readFile(new URL('../src/styles/shell.css', import.meta.url), 'utf8'))
    .replace(/\/\*[\s\S]*?\*\//g, '')
  const desktop = shell.indexOf('@media (min-width: 64rem)')
  assert.ok(desktop > 0, 'bloco desktop do shell')
  const empresa = shell.match(/\.app--empresa\s*\{[^}]*\}/)
  assert.ok(empresa && shell.indexOf(empresa[0]) < desktop, 'regra compacta fora do bloco desktop')
  assert.match(empresa[0], /--mrj-shell-width:\s*26\.25rem/)
  // A largura desktop do conteúdo e a sidebar só existem dentro de media queries ≥ 64rem.
  const antesDoDesktop = shell.slice(0, desktop)
  assert.doesNotMatch(antesDoDesktop, /--mrj-layout-content-max/)
  assert.doesNotMatch(antesDoDesktop, /app--desktop-nav/)
})
