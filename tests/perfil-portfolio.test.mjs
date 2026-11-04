// API simulada exclusivamente no teste; não publica projetos nem cria contas reais.
import test, { beforeEach, after } from 'node:test'
import assert from 'node:assert/strict'
import axios from 'axios'
import { setImmediate as esperar } from 'node:timers/promises'
import { createServer } from 'vite'
import { createRenderer, h, nextTick } from 'vue'
import { createRouter, createMemoryHistory, RouterView } from 'vue-router'

const storage = new Map()
globalThis.localStorage = {
  getItem: (k) => storage.get(k) ?? null,
  setItem: (k, v) => storage.set(k, v),
  removeItem: (k) => storage.delete(k),
}
globalThis.window = new EventTarget()
const vite = await createServer({
  configFile: false,
  mode: 'test',
  optimizeDeps: { noDiscovery: true, include: [] },
  server: { middlewareMode: true, watch: null, ws: false },
  appType: 'custom',
})
const { default: api } = await vite.ssrLoadModule('/src/services/api.js')
const { sessao } = await vite.ssrLoadModule('/src/services/authSession.js')
const { usePortfolioForm } = await vite.ssrLoadModule('/src/composables/usePortfolioForm.js')
const { listarPortfolios, normalizarTags, obterPortfolio, salvarPortfolio } =
  await vite.ssrLoadModule('/src/services/portfolioService.js')
const { resolverImagem } = await vite.ssrLoadModule('/src/utils/imagens.js')
let chamadas, transporte
const projeto = (id = 1) => ({
  id,
  titulo: `Projeto ${id}`,
  categoria: 'Website',
  descricao: 'Descrição',
  tags: ['Vue.js'],
  link: '',
  imagem: '/media/projeto.png',
})
api.defaults.adapter = async (config) => {
  chamadas.push(config)
  const { data, status = 200 } = await transporte(config)
  return { config, data, status, headers: {}, statusText: '' }
}
const falhar = (config, status, data = {}) => {
  throw new axios.AxiosError(
    'Falha simulada',
    'ERR_TEST',
    config,
    null,
    status ? { status, data } : undefined,
  )
}
const adiar = () => {
  let resolve
  const promise = new Promise((r) => {
    resolve = r
  })
  return { promise, resolve }
}
const renderer = createRenderer({
  createElement: () => ({ children: [] }),
  createText: () => ({}),
  createComment: () => ({}),
  setText() {},
  setElementText() {},
  patchProp() {},
  insert(c, p) {
    p.children.push(c)
    c.parent = p
  },
  remove(c) {
    if (c.parent) c.parent.children = c.parent.children.filter((item) => item !== c)
  },
  parentNode: (c) => c.parent,
  nextSibling: () => null,
})
async function montar(path = '/portfolio/adicionar') {
  let estado
  const componente = {
    setup() {
      estado = usePortfolioForm()
      return () => h('div')
    },
  }
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/portfolio/adicionar', component: componente },
      { path: '/portfolio/:id/editar', component: componente },
      { path: '/portfolio', component: { render: () => h('div') } },
    ],
  })
  const app = renderer.createApp({ render: () => h(RouterView) })
  app.use(router)
  await router.push(path)
  app.mount({ children: [] })
  await esperar()
  return { estado, router, fechar: () => app.unmount() }
}
function preencher(e) {
  e.titulo.value = ' Meu projeto '
  e.categoria.value = 'Website'
  e.descricao.value = ' Descrição do projeto '
}
beforeEach(() => {
  storage.clear()
  sessao.usuario = { id: 40 }
  sessao.tipo = 'usuario'
  sessao.revisao++
  chamadas = []
  transporte = (c) => ({ data: projeto(Number(c.url.split('/').at(-2)) || 1) })
})
after(async () => {
  await vite.close()
  delete globalThis.localStorage
  delete globalThis.window
})

test('imagens relativas usam a origem da API; URLs externas são preservadas e protocolos inválidos rejeitados', () => {
  for (const path of ['/media/foto.png', 'media/foto.png'])
    assert.equal(
      resolverImagem(path, 'https://api.example/api/'),
      'https://api.example/media/foto.png',
    )
  assert.equal(
    resolverImagem('https://lh3.googleusercontent.com/a/foto'),
    'https://lh3.googleusercontent.com/a/foto',
  )
  assert.equal(resolverImagem('/media/foto.png', '/api/'), 'http://localhost/media/foto.png')
  for (const path of [
    null,
    {},
    '',
    'javascript:alert(1)',
    'data:text/html,abc',
    'https://user:password@example.com/photo',
  ])
    assert.equal(resolverImagem(path), null)
})
test('tags aceitam JSON e array, removendo duplicatas e dados inválidos', () => {
  assert.deepEqual(normalizarTags('["Vue.js", " Vue.js ", null, ""]'), ['Vue.js'])
  for (const tags of ['{', '{}', null, {}]) assert.deepEqual(normalizarTags(tags), [])
})
test('portfólios consultam páginas posteriores com deduplicação e preservam tags', async () => {
  transporte = (c) => ({
    data: {
      results: c.url.includes('page=2')
        ? [projeto(1), { ...projeto(27), tags: '["Figma"]' }]
        : [projeto(1)],
      next: c.url.includes('page=2') ? null : '?page=2',
    },
  })
  const projetos = await listarPortfolios()
  assert.deepEqual(
    projetos.map((p) => p.id),
    [1, 27],
  )
  assert.deepEqual(projetos[1].tags, ['Figma'])
  assert.deepEqual(
    chamadas.map((c) => c.url),
    ['portfolios/', 'portfolios/?page=2'],
  )
})
for (const next of [
  'https://externo.invalid/api/portfolios/?page=2',
  '/api/usuarios/',
  'portfolios/',
])
  test(`paginação insegura ou repetida não é seguida: ${next}`, async () => {
    transporte = () => ({ data: { results: [projeto()], next } })
    await assert.rejects(listarPortfolios(), /inválida|repetida/)
    assert.equal(chamadas.length, 1)
  })
test('lista inválida e detalhe com ID diferente são erros, sem projetos fictícios', async () => {
  transporte = () => ({ data: {} })
  await assert.rejects(listarPortfolios(), /inválida/)
  transporte = () => ({ data: projeto(2) })
  await assert.rejects(obterPortfolio(1), /outro projeto/)
})
test('lista pendente de outra sessão é descartada', async () => {
  const bloqueio = adiar()
  transporte = async () => {
    await bloqueio.promise
    return { data: [projeto()] }
  }
  const carga = listarPortfolios()
  await esperar()
  sessao.usuario = { id: 41 }
  bloqueio.resolve()
  await assert.rejects(carga, /sessão/)
})
test('campos obrigatórios, limites e link inválido não enviam POST', async () => {
  const { estado: e, fechar } = await montar()
  try {
    assert.deepEqual(e.tags.value, [])
    await e.salvarProjeto()
    assert.match(e.erro.value, /Preencha/)
    preencher(e)
    e.titulo.value = 'a'.repeat(256)
    await e.salvarProjeto()
    assert.match(e.erro.value, /255/)
    preencher(e)
    e.link.value = 'javascript:alert(1)'
    await e.salvarProjeto()
    assert.match(e.erro.value, /link/)
    assert.equal(chamadas.length, 0)
  } finally {
    fechar()
  }
})
test('POST multipart inclui imagem, tags reais, link normalizado e só navega depois de 201', async () => {
  transporte = () => ({ data: projeto(27), status: 201 })
  const { estado: e, router, fechar } = await montar()
  try {
    preencher(e)
    e.link.value = 'example.com/projeto'
    e.novaTag.value = 'Vue.js'
    e.selecionarImagem({
      target: {
        files: [new File(['teste'], 'capa.png', { type: 'image/png' })],
        value: 'capa.png',
      },
    })
    await e.salvarProjeto()
    const c = chamadas[0]
    assert.equal(c.method, 'post')
    assert.equal(c.url, 'portfolios/')
    assert.equal(c.data.get('titulo'), 'Meu projeto')
    assert.equal(c.data.get('link'), 'https://example.com/projeto')
    assert.deepEqual(JSON.parse(c.data.get('tags')), ['Vue.js'])
    assert.equal(c.data.get('imagem').name, 'capa.png')
    assert.equal(e.mostrarSucesso.value, true)
    await e.salvarProjeto()
    assert.equal(chamadas.length, 1)
    await new Promise((r) => setTimeout(r, 850))
    assert.equal(router.currentRoute.value.path, '/portfolio')
  } finally {
    fechar()
  }
})
for (const status of [400, 403, 500, 0])
  test(`falha ${status} na gravação mantém campos e mostra erro sem sucesso`, async () => {
    transporte = (c) => falhar(c, status, { imagem: ['Arquivo inválido.'] })
    const { estado: e, router, fechar } = await montar()
    try {
      preencher(e)
      await e.salvarProjeto()
      assert.ok(e.erro.value)
      if (status === 400) assert.match(e.erro.value, /Imagem: Arquivo inválido/)
      assert.equal(e.titulo.value, ' Meu projeto ')
      assert.equal(e.mostrarSucesso.value, false)
      assert.equal(e.salvando.value, false)
      assert.equal(router.currentRoute.value.path, '/portfolio/adicionar')
    } finally {
      fechar()
    }
  })
test('cliques concorrentes enviam somente um POST e resposta após troca de conta não redireciona', async () => {
  const bloqueio = adiar()
  transporte = async () => {
    await bloqueio.promise
    return { data: projeto(), status: 201 }
  }
  const { estado: e, router, fechar } = await montar()
  try {
    preencher(e)
    const salvar = e.salvarProjeto()
    await e.salvarProjeto()
    await esperar()
    assert.equal(chamadas.length, 1)
    sessao.usuario = { id: 41 }
    sessao.revisao++
    await nextTick()
    bloqueio.resolve()
    await salvar
    assert.equal(e.mostrarSucesso.value, false)
    assert.equal(router.currentRoute.value.path, '/portfolio/adicionar')
    assert.equal(e.titulo.value, '')
  } finally {
    fechar()
  }
})
test('edição busca o ID, envia PATCH sem reenviar imagem antiga e reinicia ao trocar rota', async () => {
  const { estado: e, router, fechar } = await montar('/portfolio/27/editar')
  try {
    assert.equal(e.titulo.value, 'Projeto 27')
    assert.ok(e.preview.value.endsWith('/media/projeto.png'))
    transporte = () => ({ data: projeto(27) })
    await e.salvarProjeto()
    const c = chamadas.at(-1)
    assert.equal(c.method, 'patch')
    assert.equal(c.url, 'portfolios/27/')
    assert.equal(c.data.has('imagem'), false)
    transporte = () => ({ data: projeto(28) })
    await router.push('/portfolio/28/editar')
    await esperar()
    assert.equal(e.titulo.value, 'Projeto 28')
    assert.equal(e.mostrarSucesso.value, false)
    await router.push('/portfolio/adicionar')
    await esperar()
    assert.equal(e.titulo.value, '')
    assert.equal(e.editando.value, false)
  } finally {
    fechar()
  }
})
test('resposta sem confirmação de gravação não gera sucesso', async () => {
  transporte = () => ({ data: projeto(), status: 200 })
  await assert.rejects(salvarPortfolio(null, new FormData()), /não confirmou/)
})

test('falha ao carregar edição mantém salvamento bloqueado até uma leitura válida', async () => {
  transporte = (c) => falhar(c, 404)
  const { estado: e, fechar } = await montar('/portfolio/27/editar')
  try {
    assert.equal(e.bloqueado.value, true)
    preencher(e)
    await e.salvarProjeto()
    assert.equal(chamadas.length, 1)
    assert.match(e.erro.value, /não está disponível/)
    transporte = () => ({ data: projeto(27) })
    await e.carregarProjeto()
    assert.equal(e.bloqueado.value, false)
    assert.equal(e.titulo.value, 'Projeto 27')
  } finally {
    fechar()
  }
})

test('revalidar o perfil da mesma conta não apaga o projeto em preenchimento', async () => {
  const { estado: e, fechar } = await montar()
  try {
    preencher(e)
    sessao.usuario = { id: 40, name: 'Nome atualizado' }
    await nextTick()
    assert.equal(e.titulo.value, ' Meu projeto ')
    assert.equal(chamadas.length, 0)
  } finally {
    fechar()
  }
})
