import test, { after, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'vite'
import vue from '@vitejs/plugin-vue'
import { createRenderer, h, nextTick, ssrContextKey } from 'vue'
import { createRouter, createMemoryHistory } from 'vue-router'
import { resolve } from 'node:path'
import { setTimeout as esperar } from 'node:timers/promises'
const storage = new Map()
globalThis.localStorage = {
  getItem: (k) => storage.get(k) ?? null,
  setItem: (k, v) => storage.set(k, v),
  removeItem: (k) => storage.delete(k),
}
const vite = await createServer({
  configFile: false,
  plugins: [vue()],
  resolve: { alias: { '@': resolve('src') } },
  optimizeDeps: { noDiscovery: true, include: [] },
  server: { middlewareMode: true, watch: null, ws: false },
  appType: 'custom',
})
const load = (p) => vite.ssrLoadModule('/src/' + p)
const { default: api } = await load('services/api.js')
const { sessao, limparSessao } = await load('services/authSession.js')
const service = await load('services/perfilPortfolioService.js')
const utils = await load('utils/perfilPortfolio.js')
const { usePerfilPortfolio } = await load('composables/usePerfilPortfolio.js')
const { useEditarPerfil } = await load('composables/useEditarPerfil.js')
const { useProjetoFormulario } = await load('composables/useProjetoFormulario.js')
const { useProjetoDetalhe } = await load('composables/useProjetoDetalhe.js')
const { usePerfilImagem } = await load('composables/usePerfilImagem.js')
const { usePerfilHabilidades } = await load('composables/usePerfilHabilidades.js')
const { usePerfilLocalizacao } = await load('composables/usePerfilLocalizacao.js')
const { default: geo } = await load('services/geocodingApi.js')
const { default: axios } = await import('axios')
let chamadas, transporte, user, projetos, revogadas
const renderer = createRenderer({
  createElement: () => ({ children: [] }),
  createText: () => ({}),
  createComment: () => ({}),
  setText() {},
  setElementText() {},
  patchProp() {},
  insert(c, p) {
    p.children.push(c)
  },
  remove() {},
  parentNode: () => null,
  nextSibling: () => null,
})
async function montar(use, path = '/portfolio/adicionar') {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/portfolio/adicionar', component: {} },
      { path: '/portfolio/:id/editar', component: {} },
      { path: '/portfolio/:id', component: {} },
      { path: '/perfil', component: {} },
    ],
  })
  await router.push(path)
  await router.isReady()
  let e
  const app = renderer.createApp({
    setup() {
      e = use()
      return () => h('div')
    },
  })
  app.provide(ssrContextKey, { modules: new Set() })
  app.use(router)
  app.mount({ children: [] })
  if (e.carregar) await e.carregar()
  if (e.carregarPerfil) await e.carregarPerfil()
  await esperar(30)
  return { e, router, fechar: () => app.unmount() }
}
function falhar(status, data = {}) {
  const e = new Error('teste')
  e.response = { status, data }
  throw e
}
api.defaults.adapter = async (c) => {
  chamadas.push(c)
  const r = await transporte(c)
  return { config: c, status: r?.status || 200, data: r?.data ?? r, headers: {}, statusText: '' }
}
beforeEach(() => {
  limparSessao()
  storage.set('token', 'teste')
  chamadas = []
  revogadas = []
  user = {
    id: 1,
    name: 'Nome real',
    profissao: 'Profissão real',
    localizacao: 'Cidade, SC',
    sobre: 'Descrição real',
    telefone: '123',
    email: 'e@teste.com',
    habilidades: ['Vue'],
    profile_image: '/media/foto.png',
  }
  projetos = [
    {
      id: 1,
      titulo: 'Projeto real',
      categoria: 'Categoria',
      descricao: 'Descrição',
      tags: ['Vue'],
      imagem: '/media/projeto.png',
      link: '',
    },
  ]
  transporte = (c) => {
    if (c.url === 'usuarios/me/') {
      if (c.method === 'patch')
        Object.assign(
          user,
          typeof c.data === 'string' ? JSON.parse(c.data) : Object.fromEntries(c.data),
        )
      return { ...user }
    }
    if (c.method === 'delete') {
      projetos = []
      return { status: 204, data: '' }
    }
    if (c.method === 'post') {
      const data = typeof c.data === 'string' ? JSON.parse(c.data) : Object.fromEntries(c.data)
      projetos.push({ id: 2, ...data })
      return { status: 201, data: projetos.at(-1) }
    }
    if (c.method === 'patch') {
      Object.assign(
        projetos[0],
        typeof c.data === 'string' ? JSON.parse(c.data) : Object.fromEntries(c.data),
      )
      return projetos[0]
    }
    return /portfolios\/\d+\//.test(c.url)
      ? { ...projetos.find((p) => p.id === Number(c.url.match(/portfolios\/(\d+)\//)[1])) }
      : { results: projetos, next: null, count: projetos.length }
  }
  URL.createObjectURL = () => 'blob:teste'
  URL.revokeObjectURL = (v) => revogadas.push(v)
})
after(async () => {
  await vite.close()
  delete globalThis.localStorage
})
test('perfil e portfólio carregam dados reais, quantidade e limpam no logout', async () => {
  const { e, fechar } = await montar(usePerfilPortfolio)
  try {
    assert.equal(e.usuario.value.name, user.name)
    assert.equal(e.usuario.value.profissao, user.profissao)
    assert.equal(e.usuario.value.localizacao, user.localizacao)
    assert.equal(e.usuario.value.sobre, user.sobre)
    assert.equal(e.projetos.value.length, 1)
    limparSessao()
    assert.equal(e.usuario.value, null)
    assert.deepEqual(e.projetos.value, [])
  } finally {
    fechar()
  }
})
test('resposta atrasada não atualiza outra conta nem consulta próxima página', async () => {
  let responder
  transporte = () => new Promise((r) => (responder = r))
  const pendente = service.listarProjetos()
  await esperar(5)
  limparSessao()
  responder({ results: projetos, next: '?page=2' })
  await assert.rejects(pendente)
  assert.equal(chamadas.length, 1)
})
test('paginação completa, contagem e proteção de origem e ciclos', async () => {
  transporte = (c) => ({
    results: [{ id: c.url.includes('page=2') ? 11 : 1 }],
    next: c.url.includes('page=2') ? null : '?page=2',
    count: 2,
  })
  assert.deepEqual(
    (await service.listarProjetos()).map((p) => p.id),
    [1, 11],
  )
  transporte = () => ({ results: [], next: 'https://terceiro.test/api/portfolios/' })
  await assert.rejects(service.listarProjetos())
  transporte = () => ({ results: [], next: '?page=2' })
  await assert.rejects(service.listarProjetos())
})
test('PATCH usa somente campos editáveis e preserva omitidos', async () => {
  await service.atualizarPerfil({
    name: 'Novo',
    perfil_configurado: true,
    groups: ['admin'],
    email: 'outro',
  })
  assert.deepEqual(JSON.parse(chamadas.at(-1).data), { name: 'Novo' })
  assert.equal((await service.consultarPerfil()).profissao, 'Profissão real')
})
test('edição perfil salva valores reais e mantém dados com erro 400', async () => {
  const { e, fechar } = await montar(useEditarPerfil)
  try {
    e.nome.value = 'Alterado'
    await e.salvarPerfil()
    assert.equal(e.nome.value, 'Alterado')
    assert.equal((await service.consultarPerfil()).name, 'Alterado')
    e.nome.value = 'Rascunho'
    transporte = () => falhar(400, { name: ['Inválido'] })
    await e.salvarPerfil()
    assert.equal(e.nome.value, 'Rascunho')
    assert.equal(e.camposErro.value.name, 'Inválido')
  } finally {
    fechar()
  }
})
test('sessão trocada durante salvamento não altera usuário nem navegação', async () => {
  const { e, router, fechar } = await montar(useEditarPerfil)
  try {
    let responder
    transporte = () => new Promise((r) => (responder = r))
    const pendente = e.salvarPerfil()
    await esperar(5)
    limparSessao()
    responder(user)
    await pendente
    assert.equal(e.nome.value, '')
    assert.equal(sessao.usuario, null)
    assert.equal(router.currentRoute.value.path, '/portfolio/adicionar')
  } finally {
    fechar()
  }
})
for (const status of [0, 400, 401, 403, 404, 413, 500, 503])
  test(`erro ${status} é comunicado e permite nova tentativa`, async () => {
    transporte = () => (status ? falhar(status) : Promise.reject(new Error('rede')))
    const { e, fechar } = await montar(usePerfilPortfolio)
    try {
      assert.ok(e.erro.value)
      assert.equal(e.usuario.value, null)
      if (!status) assert.match(e.erro.value, /conexão/)
    } finally {
      fechar()
    }
  })
test('foto valida formato/tamanho, preserva cancelamento e libera URLs', async () => {
  const { e, fechar } = await montar(usePerfilImagem)
  e.carregarImagem('/media/antiga.png')
  const antiga = e.previewImagem.value
  e.selecionarImagem({ target: { files: [], value: '' } })
  assert.equal(e.previewImagem.value, antiga)
  e.definirImagem(new File(['x'], 'x.gif', { type: 'image/gif' }))
  assert.ok(e.erroImagem.value)
  assert.equal(e.previewImagem.value, antiga)
  assert.ok(utils.validarImagem({ type: 'image/png', size: 5242881 }))
  e.definirImagem(new File(['x'], 'x.png', { type: 'image/png' }))
  assert.equal(e.previewImagem.value, 'blob:teste')
  e.definirImagem(new File(['y'], 'y.webp', { type: 'image/webp' }))
  assert.equal(revogadas.length, 1)
  fechar()
  assert.equal(revogadas.length, 2)
})
test('multipart serializa habilidades e tags uma vez e omite imagem ausente', async () => {
  const file = new File(['x'], 'x.png', { type: 'image/png' })
  for (const [campos, lista, imagem] of [
    [utils.camposPerfil, 'habilidades', 'profile_image'],
    [utils.camposProjeto, 'tags', 'imagem'],
  ]) {
    const form = utils.payloadPermitido(
      { [lista]: ['Vue', 'API'], [imagem]: file, usuario: 9 },
      campos,
    )
    assert.deepEqual(JSON.parse(form.get(lista)), ['Vue', 'API'])
    assert.ok(form.get(imagem) instanceof Blob)
    assert.equal(form.get('usuario'), null)
    assert.deepEqual(utils.payloadPermitido({ [lista]: [] }, campos), { [lista]: [] })
  }
})
test('habilidades incluem, removem, rejeitam vazias, duplicadas e limites', async () => {
  const { e, fechar } = await montar(usePerfilHabilidades)
  try {
    e.carregarHabilidades(['Vue'])
    for (const v of ['', 'vue', 'x'.repeat(101)]) {
      e.novaHabilidade.value = v
      e.adicionarHabilidade()
      assert.equal(e.habilidades.value.length, 1)
    }
    e.novaHabilidade.value = 'API'
    e.adicionarHabilidade()
    assert.equal(e.habilidades.value.length, 2)
    e.removerHabilidade('Vue')
    assert.deepEqual(e.habilidades.value, ['API'])
    assert.ok(utils.validarLista(Array.from({ length: 51 }, (_, i) => String(i))))
  } finally {
    fechar()
  }
})
test('URLs de mídia e links externos aceitam HTTP/HTTPS, rejeitam protocolos e caminhos locais', () => {
  assert.equal(
    utils.imagemUrl('/media/x.jpg', 'https://api.test/api/'),
    'https://api.test/media/x.jpg',
  )
  assert.equal(
    utils.imagemUrl('https://res.cloudinary.com/x', '/api/'),
    'https://res.cloudinary.com/x',
  )
  for (const p of ['javascript:alert(1)', 'file:///x', 'C:\\foto.jpg'])
    assert.equal(utils.imagemUrl(p, '/api/'), '')
  assert.equal(utils.linkSeguro('javascript:alert(1)'), '')
  assert.ok(utils.linkSeguro('https://example.com'))
})
test('criação inicia tags vazias, valida e bloqueia envio repetido após 201', async () => {
  const { e, fechar } = await montar(useProjetoFormulario)
  try {
    assert.deepEqual(e.tags.value, [])
    await e.salvarProjeto()
    assert.equal(chamadas.length, 0)
    e.titulo.value = 'Novo'
    e.categoria.value = 'Web'
    e.descricao.value = 'Descrição'
    e.novaTag.value = 'API'
    e.adicionarTag()
    e.novaTag.value = 'api'
    e.adicionarTag()
    assert.deepEqual(e.tags.value, ['API'])
    e.removerTag(0)
    await e.salvarProjeto()
    await e.salvarProjeto()
    assert.equal(chamadas.filter((c) => c.method === 'post').length, 1)
    assert.deepEqual(JSON.parse(chamadas.find((c) => c.method === 'post').data).tags, [])
    assert.ok(e.mostrarSucesso.value)
    assert.equal((await service.consultarProjeto(2)).titulo, 'Novo')
  } finally {
    fechar()
  }
})
test('edição envia PATCH, preserva imagem omitida e permite limpar tags', async () => {
  const { e, fechar } = await montar(useProjetoFormulario, '/portfolio/1/editar')
  try {
    assert.equal(e.titulo.value, 'Projeto real')
    assert.ok(e.preview.value.endsWith('/media/projeto.png'))
    e.tags.value = []
    e.titulo.value = 'Editado'
    await e.salvarProjeto()
    const c = chamadas.find((c) => c.method === 'patch')
    assert.equal(c.url, 'portfolios/1/')
    assert.equal(JSON.parse(c.data).imagem, undefined)
    assert.deepEqual(JSON.parse(c.data).tags, [])
    assert.equal((await service.consultarProjeto(1)).imagem, '/media/projeto.png')
  } finally {
    fechar()
  }
})
test('rotas criação, edição A, edição B e resposta atrasada mantêm estados isolados', async () => {
  const { e, router, fechar } = await montar(useProjetoFormulario)
  try {
    let responder
    transporte = () => new Promise((r) => (responder = r))
    await router.push('/portfolio/1/editar')
    await esperar(5)
    assert.equal(e.pronto.value, false)
    transporte = () => ({ id: 2, titulo: 'Segundo', tags: ['API'] })
    await router.push('/portfolio/2/editar')
    await esperar(10)
    responder({ id: 1, titulo: 'Antigo', tags: ['antiga'] })
    await esperar(5)
    assert.equal(e.titulo.value, 'Segundo')
    await router.push('/portfolio/adicionar')
    await esperar(5)
    assert.equal(e.titulo.value, '')
    assert.deepEqual(e.tags.value, [])
    assert.equal(e.editando.value, false)
  } finally {
    fechar()
  }
})
test('storage 503 mantém rascunho e não confirma sucesso', async () => {
  const { e, fechar } = await montar(useProjetoFormulario)
  try {
    e.titulo.value = 'Rascunho'
    e.categoria.value = 'Web'
    e.descricao.value = 'Texto'
    transporte = () => falhar(503)
    await e.salvarProjeto()
    assert.equal(e.titulo.value, 'Rascunho')
    assert.match(e.erro.value, /Armazenamento/)
    assert.equal(e.mostrarSucesso.value, false)
  } finally {
    fechar()
  }
})
test('exclusão cancelada não envia; confirmação bloqueia duplicatas e aguarda 204', async () => {
  const { e, fechar } = await montar(useProjetoDetalhe, '/portfolio/1')
  try {
    await e.excluirProjeto()
    assert.equal(chamadas.filter((c) => c.method === 'delete').length, 0)
    e.mostrarModalExcluir.value = true
    let responder
    transporte = () => new Promise((r) => (responder = r))
    const pendente = e.excluirProjeto()
    await e.excluirProjeto()
    await esperar(5)
    assert.equal(e.projeto.value.id, 1)
    responder({ status: 204, data: '' })
    await pendente
    assert.equal(e.projeto.value, null)
    assert.ok(e.sucesso.value)
    assert.equal(chamadas.filter((c) => c.method === 'delete').length, 1)
  } finally {
    fechar()
  }
})
test('projeto de terceiro 403 não habilita formulário', async () => {
  transporte = () => falhar(403)
  const { e, fechar } = await montar(useProjetoFormulario, '/portfolio/1/editar')
  try {
    assert.equal(e.pronto.value, false)
    assert.match(e.erro.value, /permissão/)
  } finally {
    fechar()
  }
})
test('busca manual, GPS, geocoder e troca manual limpam metadados', async () => {
  const search = geo.search,
    reverse = geo.reverse
  const nav = Object.getOwnPropertyDescriptor(globalThis, 'navigator')
  Object.defineProperty(globalThis, 'navigator', {
    configurable: true,
    value: {
      geolocation: {
        getCurrentPosition: (ok) =>
          ok({ coords: { latitude: -26, longitude: -48, accuracy: 5 }, timestamp: Date.now() }),
      },
    },
  })
  geo.search = async () => [{ nome: 'Cidade, SC' }]
  geo.reverse = async () => ({ label: 'Cidade GPS, SC' })
  const { e, fechar } = await montar(usePerfilLocalizacao)
  try {
    e.pesquisaCidade.value = 'Cidade'
    await e.buscarCidades()
    assert.equal(e.resultadosCidades.value.length, 1)
    await e.usarLocalizacaoAtual()
    assert.equal(e.latitude.value, -26)
    assert.equal(e.localizacao.value, 'Cidade GPS, SC')
    assert.ok(e.dataLocalizacao.value)
    e.selecionarCidade({ nome: 'Manual, SC' })
    assert.equal(e.localizacao.value, 'Manual, SC')
    for (const v of [e.latitude, e.longitude, e.precisao, e.dataLocalizacao])
      assert.equal(v.value, null)
    e.carregarLocalizacao({ localizacao: 'Manual, SC', latitude: null })
    assert.equal(e.localizacao.value, 'Manual, SC')
    geo.reverse = async () => {
      throw Error('rede')
    }
    await e.usarLocalizacaoAtual()
    assert.ok(e.erroLocalizacao.value)
    assert.equal(e.localizacao.value, 'Manual, SC')
    globalThis.navigator.geolocation.getCurrentPosition = (_, erro) => erro({ code: 1 })
    await e.usarLocalizacaoAtual()
    assert.match(e.locationError.value, /negou/)
  } finally {
    fechar()
    geo.search = search
    geo.reverse = reverse
    if (nav) Object.defineProperty(globalThis, 'navigator', nav)
    else delete globalThis.navigator
  }
})
test('Nominatim usa cliente externo sem Authorization do MaRuJoB', async () => {
  const original = axios.defaults.adapter
  let config
  axios.defaults.adapter = async (c) => {
    config = c
    return { status: 200, data: [], headers: {}, config: c }
  }
  try {
    await geo.search('Cidade')
    assert.equal(config.headers.Authorization, undefined)
    assert.equal(config.withCredentials, false)
    assert.match(config.url, /nominatim/)
  } finally {
    axios.defaults.adapter = original
  }
})
test('componentes de perfil, portfólio e câmera compilam sem erros', async () => {
  const { parse, compileScript, compileTemplate } = await import('@vue/compiler-sfc')
  const { readFileSync } = await import('node:fs')
  for (const nome of [
    'PerfilComponent',
    'EditarPerfil',
    'PortfolioComponent',
    'PortfolioAdicionarComponent',
    'PortfolioDetalheComponent',
    'CameraCapture',
    'ConfirmarExclusaoProjeto',
  ]) {
    const file = resolve('src/components/' + nome + '.vue')
    const { descriptor, errors } = parse(readFileSync(file, 'utf8'))
    assert.deepEqual(errors, [])
    const script = compileScript(descriptor, { id: nome })
    assert.ok(script.content)
    assert.deepEqual(
      compileTemplate({ source: descriptor.template.content, filename: file, id: nome }).errors,
      [],
    )
  }
})
test('upload perfil e projeto persistem URLs do servidor, listas e substituições após GET', async () => {
  let perfil = { ...user },
    projeto = { ...projetos[0] }
  transporte = (c) => {
    const alvo = c.url === 'usuarios/me/' ? perfil : projeto
    if (c.method === 'patch') {
      const dados = typeof c.data === 'string' ? JSON.parse(c.data) : Object.fromEntries(c.data)
      for (const campo of ['habilidades', 'tags'])
        if (typeof dados[campo] === 'string') dados[campo] = JSON.parse(dados[campo])
      for (const campo of ['profile_image', 'imagem'])
        if (dados[campo] instanceof Blob)
          dados[campo] = 'https://res.cloudinary.com/test/' + dados[campo].name
      Object.assign(alvo, dados)
    }
    return { ...alvo }
  }
  const file = new File(['conteudo'], 'nova.webp', { type: 'image/webp' })
  await service.atualizarPerfil({ profile_image: file, habilidades: ['API'] })
  assert.deepEqual((await service.consultarPerfil()).habilidades, ['API'])
  assert.match((await service.consultarPerfil()).profile_image, /nova.webp$/)
  await service.salvarProjeto(1, { imagem: file, tags: [] })
  assert.deepEqual((await service.consultarProjeto(1)).tags, [])
  assert.match((await service.consultarProjeto(1)).imagem, /nova.webp$/)
  const segunda = new File(['outra'], 'segunda.png', { type: 'image/png' })
  await service.salvarProjeto(1, { imagem: segunda, tags: ['API'] })
  assert.match((await service.consultarProjeto(1)).imagem, /segunda.png$/)
  await service.salvarProjeto(1, { titulo: 'Mantém imagem' })
  assert.match((await service.consultarProjeto(1)).imagem, /segunda.png$/)
})
test('falha na verificação após POST não libera criação duplicada', async () => {
  const { e, fechar } = await montar(useProjetoFormulario)
  try {
    e.titulo.value = 'Novo'
    e.categoria.value = 'Web'
    e.descricao.value = 'Texto'
    transporte = (c) =>
      c.method === 'post'
        ? { status: 201, data: { id: 2, titulo: 'Novo', tags: [] } }
        : Promise.reject(Error('rede'))
    await e.salvarProjeto()
    assert.ok(e.mostrarSucesso.value)
    await e.salvarProjeto()
    assert.equal(chamadas.filter((c) => c.method === 'post').length, 1)
    assert.match(e.erro.value, /salvo/)
  } finally {
    fechar()
  }
})
test('câmera trata permissão, indisponibilidade, captura, fechamento e stream atrasado', async () => {
  const { default: Camera } = await load('components/CameraCapture.vue')
  const nav = Object.getOwnPropertyDescriptor(globalThis, 'navigator'),
    doc = globalThis.document
  let paradas = 0,
    emitidos = []
  const stream = () => ({ getTracks: () => [{ stop: () => paradas++ }] })
  const media = {
    getUserMedia: async () => {
      const e = Error()
      e.name = 'NotAllowedError'
      throw e
    },
  }
  Object.defineProperty(globalThis, 'navigator', {
    configurable: true,
    value: { mediaDevices: media },
  })
  const { e, fechar } = await montar(() =>
    Camera.setup({}, { expose() {}, emit: (...args) => emitidos.push(args) }),
  )
  try {
    await e.abrirCamera()
    assert.match(e.erro.value, /negada/)
    media.getUserMedia = undefined
    await e.abrirCamera()
    assert.match(e.erro.value, /disponível/)
    media.getUserMedia = async () => stream()
    e.videoRef.value = { srcObject: null, play: async () => {}, videoWidth: 10, videoHeight: 10 }
    await e.abrirCamera()
    assert.equal(e.cameraAtiva.value, true)
    globalThis.document = {
      createElement: () => ({
        getContext: () => ({ drawImage() {} }),
        toBlob: (callback) => callback(new Blob(['foto'], { type: 'image/jpeg' })),
      }),
    }
    await e.fotografar()
    assert.equal(emitidos[0][0], 'captured')
    assert.equal(emitidos[0][1].type, 'image/jpeg')
    assert.equal(paradas, 1)
    await e.abrirCamera()
    e.fecharCamera()
    assert.equal(paradas, 2)
    assert.equal(emitidos.at(-1)[0], 'close')
    let responder
    media.getUserMedia = () => new Promise((r) => (responder = r))
    const pendente = e.abrirCamera()
    fechar()
    responder(stream())
    await pendente
    assert.equal(paradas, 3)
  } finally {
    fechar()
    if (nav) Object.defineProperty(globalThis, 'navigator', nav)
    else delete globalThis.navigator
    globalThis.document = doc
  }
})
test('troca de sessão antes do interceptor não envia mutação com novas credenciais', async () => {
  const pendente = service.atualizarPerfil({ name: 'Conta anterior' })
  limparSessao()
  storage.set('token', 'nova-conta')
  await assert.rejects(pendente)
  assert.equal(chamadas.length, 0)
})
test('vazio é distinto de erro e tentativa posterior recupera os dados reais', async () => {
  transporte = (c) => (c.url === 'usuarios/me/' ? user : { results: [], next: null, count: 0 })
  const { e, fechar } = await montar(usePerfilPortfolio)
  try {
    assert.deepEqual(e.projetos.value, [])
    assert.equal(e.erro.value, '')
    transporte = () => falhar(500)
    await e.carregar()
    assert.ok(e.erro.value)
    transporte = (c) =>
      c.url === 'usuarios/me/' ? user : { results: projetos, next: null, count: 1 }
    await e.carregar()
    assert.equal(e.projetos.value.length, 1)
    assert.equal(e.erro.value, '')
  } finally {
    fechar()
  }
})
