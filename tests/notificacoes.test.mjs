import test, { after, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'vite'
import { createRenderer, h } from 'vue'
import { resolve } from 'node:path'
import { setTimeout as esperar } from 'node:timers/promises'
import { readFileSync } from 'node:fs'
import { parse, compileScript, compileTemplate } from '@vue/compiler-sfc'
const storage = new Map()
globalThis.localStorage = {
  getItem: (k) => storage.get(k) ?? null,
  setItem: (k, v) => storage.set(k, v),
  removeItem: (k) => storage.delete(k),
}
const vite = await createServer({
  configFile: false,
  resolve: { alias: { '@': resolve('src') } },
  optimizeDeps: { noDiscovery: true, include: [] },
  server: { middlewareMode: true, watch: null, ws: false },
  appType: 'custom',
})
const load = (path) => vite.ssrLoadModule('/src/' + path)
const { default: api } = await load('services/api.js')
const { sessao, limparSessao } = await load('services/authSession.js')
const service = await load('services/notificacoesService.js')
const utils = await load('utils/notificacoes.js')
const { useNotificacoesEmpresa } = await load('composables/useNotificacoesEmpresa.js')
const { protegerRota } = await load('router/authGuard.js')
const { routes } = await load('router/routes.js')
let chamadas, transporte, notificacoes, candidatura, acoes
const profissional = () => ({
  id: 7,
  name: 'Candidato real de teste',
  profissao: 'Profissão real',
  habilidades: ['Vue', 'API'],
  profile_image: '/media/foto.png',
})
const notificacao = (id = 31, cid = 12, status = 'pendente') => ({
  id,
  candidatura: cid,
  freelancer: 7,
  freelancer_detalhes: profissional(),
  oportunidade: 45,
  oportunidade_titulo: 'Oportunidade de teste',
  status,
  candidatura_criado_em: '2026-11-03T12:00:00-03:00',
  criado_em: '2026-11-03T13:00:00-03:00',
  lida: false,
})
const contato = 'https://wa.me/5547999999999?text=Ol%C3%A1%2C+profissional%21'
const respostaPagina = (
  items = notificacoes,
  next = null,
  previous = null,
  count = items.length,
) => ({ count, next, previous, results: items })
function falhar(status) {
  const e = Error('erro simulado')
  e.response = { status, data: { detail: 'detalhe interno não exibido' } }
  throw e
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
  },
  remove() {},
  parentNode: () => null,
  nextSibling: () => null,
})
function montar() {
  let e
  const app = renderer.createApp({
    setup() {
      e = useNotificacoesEmpresa()
      return () => h('div')
    },
  })
  app.mount({ children: [] })
  return { e, fechar: () => app.unmount() }
}
async function pronto(e) {
  for (let i = 0; i < 100; i++) {
    await esperar(2)
    if (!e.carregando.value && !Object.values(e.carregandoCandidato.value).some(Boolean)) return
  }
  throw Error('Estado não estabilizou')
}
const deferred = () => {
  let resolve
  const promise = new Promise((r) => (resolve = r))
  return { promise, resolve }
}
api.defaults.adapter = async (config) => {
  chamadas.push(config)
  const r = await transporte(config)
  return { config, status: r.statusCode || 200, statusText: '', headers: {}, data: r.data ?? r }
}
beforeEach(() => {
  limparSessao()
  storage.set('token', 'jwt-simulado')
  sessao.usuario = { id: 80, name: 'Empresa teste', groups: ['Empresa'] }
  sessao.tipo = 'empresa'
  api.defaults.baseURL = 'https://api.test/api/'
  chamadas = []
  acoes = []
  notificacoes = [notificacao()]
  candidatura = {
    id: 12,
    freelancer: 7,
    oportunidade: 45,
    status: 'pendente',
    freelancer_detalhes: profissional(),
    whatsapp: { disponivel: false, url: null, modo: 'link', mensagem_enviada: false },
  }
  transporte = (c) => {
    if (c.url === 'notificacoes/')
      return respostaPagina(
        notificacoes.filter((n) => !c.params.status || n.status === c.params.status),
      )
    if (c.url === 'notificacoes/31/') return { ...notificacoes[0] }
    if (c.url === 'notificacoes/31/marcar-lida/') {
      notificacoes[0].lida = true
      return { ...notificacoes[0] }
    }
    if (c.url === 'candidaturas/12/') return { ...candidatura }
    if (c.url === 'candidaturas/12/aprovar/' || c.url === 'candidaturas/12/recusar/') {
      acoes.push(c.url)
      candidatura.status = c.url.includes('aprovar') ? 'aprovada' : 'recusada'
      notificacoes[0].status = candidatura.status
      candidatura.whatsapp = {
        disponivel: candidatura.status === 'aprovada',
        url: candidatura.status === 'aprovada' ? contato : null,
        modo: 'link',
        mensagem_enviada: false,
      }
      return { ...candidatura }
    }
    throw Error('Endpoint inesperado ' + c.url)
  }
})
after(async () => {
  await vite.close()
  delete globalThis.localStorage
})
test('empresa carrega dados reais e contagem DRF sem confundir as datas', async () => {
  const { e, fechar } = montar()
  try {
    assert.equal(e.carregando.value, true)
    await pronto(e)
    assert.equal(e.notificacoes.value[0].freelancer_detalhes.name, 'Candidato real de teste')
    assert.equal(e.total.value, 1)
    assert.notEqual(
      e.notificacoes.value[0].candidatura_criado_em,
      e.notificacoes.value[0].criado_em,
    )
    assert.equal(chamadas[0].url, 'notificacoes/')
    assert.deepEqual(chamadas[0].params, { page: 1 })
  } finally {
    fechar()
  }
})
test('rota exige empresa; freelancer e anônimo não acessam', async () => {
  const rota = routes.find((r) => r.name === 'notificacoes-empresa')
  assert.equal(rota.path, '/empresa/notificacoes')
  assert.deepEqual(rota.meta, { requiresAuth: true, tipo: 'empresa' })
  assert.equal(await protegerRota({ ...rota, query: {} }), true)
  sessao.tipo = 'usuario'
  sessao.usuario = { id: 7, groups: ['Usuário'] }
  assert.deepEqual(await protegerRota({ ...rota, query: {} }), { path: '/home', replace: true })
  limparSessao()
  assert.deepEqual(await protegerRota({ ...rota, query: {} }), { name: 'login', replace: true })
})
test('serviço recusa anônimo, freelancer e IDs inválidos sem enviar requisição', async () => {
  for (const id of [0, -1, '../12', '12/aprovar', null, 1.2])
    await assert.rejects(service.decidirCandidatura(id, 'aprovar'))
  sessao.tipo = 'usuario'
  await assert.rejects(service.listarNotificacoes())
  limparSessao()
  await assert.rejects(service.consultarCandidatura(12))
  assert.equal(chamadas.length, 0)
})
test('lista vazia e erro recuperável têm estados independentes', async () => {
  transporte = () => respostaPagina([])
  const { e, fechar } = montar()
  try {
    await pronto(e)
    assert.deepEqual(e.notificacoes.value, [])
    assert.equal(e.erro.value, '')
    transporte = () => falhar(503)
    await e.carregar()
    assert.match(e.erro.value, /temporariamente/)
    transporte = () => respostaPagina([notificacao()])
    await e.carregar()
    assert.equal(e.notificacoes.value.length, 1)
    assert.equal(e.erro.value, '')
  } finally {
    fechar()
  }
})
for (const status of [400, 401, 403, 404, 409, 503, 500, 0])
  test(`mensagem compreensível para ${status}`, () => {
    const error = status ? { response: { status, data: { detail: 'segredo' } } } : Error('rede')
    const msg = utils.erroNotificacoes(error)
    assert.ok(msg)
    assert.ok(!msg.includes('segredo'))
    if (status === 0) assert.match(msg, /conexão/)
    if (status === 409) assert.match(msg, /analisada/)
  })
test('filtros consultam estados exatos e Todas omite status', async () => {
  const { e, fechar } = montar()
  try {
    await pronto(e)
    for (const status of ['pendente', 'aprovada', 'recusada', '']) {
      await e.filtrar(status)
      assert.deepEqual(chamadas.filter((c) => c.url === 'notificacoes/').at(-1).params, {
        page: 1,
        ...(status ? { status } : {}),
      })
    }
    await e.filtrar('aceita')
    assert.equal(e.filtro.value, '')
  } finally {
    fechar()
  }
})
test('paginação preserva filtro, ordenação, contagem e alcança página posterior', async () => {
  transporte = (c) =>
    respostaPagina(
      [notificacao(c.params.page === 2 ? 42 : 31, c.params.page === 2 ? 13 : 12)],
      c.params.page === 1 ? '?page=2&status=pendente' : null,
      c.params.page === 2 ? '?status=pendente' : null,
      11,
    )
  const { e, fechar } = montar()
  try {
    await pronto(e)
    await e.filtrar('pendente')
    assert.equal(e.proxima.value, 2)
    assert.equal(e.total.value, 11)
    await e.carregar(e.proxima.value)
    assert.equal(e.notificacoes.value[0].id, 42)
    assert.equal(e.anterior.value, 1)
    assert.deepEqual(chamadas.at(-1).params, { page: 2, status: 'pendente' })
  } finally {
    fechar()
  }
})
test('next externo, credenciais, caminho estranho e filtro trocado são rejeitados', async () => {
  for (const next of [
    'https://evil.test/api/notificacoes/?page=2',
    'https://api.test.evil/api/notificacoes/?page=2',
    'https://u:p@api.test/api/notificacoes/?page=2',
    '/api/usuarios/me/?page=2',
    '?page=2&status=recusada',
    '?page=2&token=segredo',
    '?page=1',
    '?page=-1',
    '?page=2&page=3',
  ]) {
    transporte = () => respostaPagina([notificacao()], next)
    await assert.rejects(service.listarNotificacoes({ status: 'pendente' }))
  }
  assert.ok(chamadas.every((c) => c.url === 'notificacoes/'))
})
test('troca rápida de filtro descarta lista antiga e reinicia página', async () => {
  const { e, fechar } = montar()
  try {
    await pronto(e)
    const antiga = deferred()
    transporte = (c) =>
      c.params.status === 'pendente'
        ? antiga.promise
        : respostaPagina([notificacao(32, 13, 'recusada')])
    const p = e.filtrar('pendente')
    await esperar(5)
    await e.filtrar('recusada')
    antiga.resolve(respostaPagina([notificacao()]))
    await p
    assert.equal(e.filtro.value, 'recusada')
    assert.equal(e.notificacoes.value[0].id, 32)
    assert.equal(e.pagina.value, 1)
  } finally {
    fechar()
  }
})
test('logout e troca de empresa limpam tudo e descartam resposta antiga', async () => {
  const { e, fechar } = montar()
  try {
    await pronto(e)
    e.visualizar(e.notificacoes.value[0])
    const antiga = deferred()
    transporte = () => antiga.promise
    const p = e.carregar()
    await esperar(5)
    limparSessao()
    assert.deepEqual(e.notificacoes.value, [])
    assert.equal(e.selecionada.value, null)
    assert.deepEqual(e.contatos.value, {})
    transporte = () => respostaPagina([notificacao(77, 19)])
    storage.set('token', 'jwt-novo')
    sessao.usuario = { id: 81, groups: ['Empresa'] }
    sessao.tipo = 'empresa'
    await pronto(e)
    antiga.resolve(respostaPagina([notificacao()]))
    await p
    assert.equal(e.notificacoes.value[0].id, 77)
  } finally {
    fechar()
  }
})
test('detalhes profissionais descartam privados e usam candidatura, nunca perfil de terceiros', async () => {
  notificacoes[0].freelancer_detalhes = {
    ...profissional(),
    email: 'privado',
    telefone: 'segredo',
    latitude: -26,
    groups: ['admin'],
  }
  candidatura.freelancer_detalhes = { ...notificacoes[0].freelancer_detalhes }
  const { e, fechar } = montar()
  try {
    await pronto(e)
    await e.visualizar(e.notificacoes.value[0])
    assert.deepEqual(Object.keys(e.selecionada.value.freelancer_detalhes).sort(), [
      'habilidades',
      'id',
      'name',
      'profile_image',
      'profissao',
    ])
    assert.ok(!JSON.stringify(e.selecionada.value).includes('segredo'))
    assert.ok(chamadas.some((c) => c.url === 'candidaturas/12/'))
    assert.ok(chamadas.every((c) => !c.url.includes('usuarios/')))
  } finally {
    fechar()
  }
})
for (const [acao, status] of [
  ['aprovar', 'aprovada'],
  ['recusar', 'recusada'],
])
  test(`${acao} usa ID da candidatura, aguarda 200 e persiste após GET`, async () => {
    const { e, fechar } = montar()
    try {
      await pronto(e)
      const n = e.notificacoes.value[0]
      e.pedirDecisao(n, acao)
      await e.confirmarDecisao()
      assert.equal(acoes[0], `candidaturas/12/${acao}/`)
      assert.equal(e.notificacoes.value[0].status, status)
      assert.match(e.feedback.value, new RegExp(status))
      assert.equal((await service.consultarNotificacao(31)).status, status)
      assert.equal((await service.consultarCandidatura(12)).status, status)
      e.pedirDecisao(e.notificacoes.value[0], acao === 'aprovar' ? 'recusar' : 'aprovar')
      assert.equal(e.confirmacao.value, null)
    } finally {
      fechar()
    }
  })
test('cancelar confirmação não envia decisão', async () => {
  const { e, fechar } = montar()
  try {
    await pronto(e)
    e.pedirDecisao(e.notificacoes.value[0], 'recusar')
    e.cancelarDecisao()
    await e.confirmarDecisao()
    assert.equal(acoes.length, 0)
  } finally {
    fechar()
  }
})
test('cliques repetidos não duplicam decisão e status não muda antes da resposta', async () => {
  const { e, fechar } = montar()
  try {
    await pronto(e)
    const antiga = transporte,
      pendente = deferred()
    transporte = (c) => (c.method === 'post' ? pendente.promise : antiga(c))
    e.pedirDecisao(e.notificacoes.value[0], 'aprovar')
    const p = e.confirmarDecisao()
    await esperar(5)
    await e.confirmarDecisao()
    assert.equal(e.processando.value[12], true)
    assert.equal(e.notificacoes.value[0].status, 'pendente')
    assert.equal(chamadas.filter((c) => c.method === 'post').length, 1)
    candidatura.status = 'aprovada'
    notificacoes[0].status = 'aprovada'
    pendente.resolve({ ...candidatura })
    await p
    assert.equal(e.notificacoes.value[0].status, 'aprovada')
  } finally {
    fechar()
  }
})
for (const acao of ['aprovar', 'recusar'])
  test(`falha de ${acao} mantém status e permite tentar novamente`, async () => {
    const { e, fechar } = montar()
    try {
      await pronto(e)
      transporte = () => falhar(503)
      e.pedirDecisao(e.notificacoes.value[0], acao)
      await e.confirmarDecisao()
      assert.equal(e.notificacoes.value[0].status, 'pendente')
      assert.ok(e.erroAcao.value)
      assert.equal(e.feedback.value, '')
      assert.equal(e.processando.value[12], false)
    } finally {
      fechar()
    }
  })
for (const acao of ['aprovar', 'recusar'])
  test(`409 em ${acao} reconsulta estado real sem repetir POST`, async () => {
    const { e, fechar } = montar()
    try {
      await pronto(e)
      const original = transporte
      transporte = (c) => {
        if (c.method === 'post') {
          candidatura.status = acao === 'aprovar' ? 'recusada' : 'aprovada'
          notificacoes[0].status = candidatura.status
          falhar(409)
        }
        return original(c)
      }
      e.pedirDecisao(e.notificacoes.value[0], acao)
      await e.confirmarDecisao()
      assert.equal(e.notificacoes.value[0].status, candidatura.status)
      assert.match(e.erroAcao.value, /analisada/)
      assert.equal(e.feedback.value, '')
      assert.equal(chamadas.filter((c) => c.method === 'post').length, 1)
      assert.ok(chamadas.some((c) => c.url === 'candidaturas/12/'))
    } finally {
      fechar()
    }
  })
test('409 com falha na reconsulta bloqueia decisão até atualização explícita', async () => {
  const { e, fechar } = montar()
  try {
    await pronto(e)
    transporte = (c) => falhar(c.method === 'post' ? 409 : 503)
    e.pedirDecisao(e.notificacoes.value[0], 'recusar')
    await e.confirmarDecisao()
    assert.equal(e.bloqueadas.value[12], true)
    assert.equal(e.confirmacao.value, null)
    e.pedirDecisao(e.notificacoes.value[0], 'aprovar')
    assert.equal(e.confirmacao.value, null)
  } finally {
    fechar()
  }
})
test('leitura usa ID da notificação, bloqueia repetição e não altera status', async () => {
  const { e, fechar } = montar()
  try {
    await pronto(e)
    const n = e.notificacoes.value[0]
    await e.marcarLida(n)
    assert.equal(chamadas.find((c) => c.method === 'patch').url, 'notificacoes/31/marcar-lida/')
    assert.equal(e.notificacoes.value[0].lida, true)
    assert.equal(e.notificacoes.value[0].status, 'pendente')
    assert.equal((await service.consultarNotificacao(31)).lida, true)
    await e.marcarLida(e.notificacoes.value[0])
    assert.equal(chamadas.filter((c) => c.method === 'patch').length, 1)
  } finally {
    fechar()
  }
})
test('falha de leitura mantém não lida e status original', async () => {
  const { e, fechar } = montar()
  try {
    await pronto(e)
    transporte = () => falhar(500)
    await e.marcarLida(e.notificacoes.value[0])
    assert.equal(e.notificacoes.value[0].lida, false)
    assert.equal(e.notificacoes.value[0].status, 'pendente')
    assert.ok(e.erroAcao.value)
  } finally {
    fechar()
  }
})
test('leitura ignora status de candidatura contido na resposta', async () => {
  const { e, fechar } = montar()
  try {
    await pronto(e)
    transporte = () => ({ ...notificacao(), lida: true, status: 'recusada' })
    await e.marcarLida(e.notificacoes.value[0])
    assert.equal(e.notificacoes.value[0].status, 'pendente')
    assert.equal(e.notificacoes.value[0].lida, true)
  } finally {
    fechar()
  }
})
test('WhatsApp só vem da candidatura aprovada, sem telefone privado em memória', async () => {
  notificacoes[0].status = candidatura.status = 'aprovada'
  notificacoes[0].whatsapp = { disponivel: true, url: 'https://evil.test' }
  candidatura.whatsapp = { disponivel: true, url: contato }
  candidatura.telefone = 'privado'
  const { e, fechar } = montar()
  try {
    await pronto(e)
    assert.equal(e.contatos.value[12].url, contato)
    assert.equal(e.notificacoes.value[0].whatsapp, undefined)
    assert.ok(chamadas.some((c) => c.url === 'candidaturas/12/'))
    assert.equal(chamadas.filter((c) => c.url.startsWith('http')).length, 0)
    assert.ok(!JSON.stringify(e.contatos.value).includes('jwt-simulado'))
    assert.equal(utils.normalizarCandidatura(candidatura).telefone, undefined)
  } finally {
    fechar()
  }
})
test('URL WhatsApp preserva mensagem e rejeita disponibilidade/status/protocolos/domínios/caminhos maliciosos', () => {
  const c = { status: 'aprovada', whatsapp: { disponivel: true, url: contato } }
  assert.equal(utils.urlWhatsApp(c), contato)
  for (const status of ['pendente', 'recusada'])
    assert.equal(utils.urlWhatsApp({ ...c, status }), '')
  assert.equal(utils.urlWhatsApp({ ...c, whatsapp: { ...c.whatsapp, disponivel: false } }), '')
  for (const url of [
    'http://wa.me/5547999999999',
    'https://wa.me.evil.test/5547999999999',
    'https://evil.test/5547999999999',
    'https://wa.me@evil.test/5547999999999',
    'https://user@wa.me/5547999999999',
    'https://wa.me:444/5547999999999',
    'javascript:alert(1)',
    'https://wa.me/abc',
    'https://wa.me/5547999999999/extra',
    'https://wa.me/5547999999999#token',
    'https://wa.me/%35%35%34%37%39%39%39%39%39%39%39%39%39',
  ])
    assert.equal(utils.urlWhatsApp({ ...c, whatsapp: { disponivel: true, url } }), '')
})
test('candidatura aprovada sem contato mostra indisponibilidade segura', async () => {
  notificacoes[0].status = candidatura.status = 'aprovada'
  const { e, fechar } = montar()
  try {
    await pronto(e)
    assert.equal(e.contatos.value[12].disponivel, false)
    assert.equal(e.contatos.value[12].url, null)
  } finally {
    fechar()
  }
})
test('resposta de candidato anterior não sobrescreve decisão confirmada', async () => {
  const { e, fechar } = montar()
  try {
    await pronto(e)
    const original = transporte,
      antiga = deferred()
    let primeira = true
    transporte = (c) => {
      if (c.url === 'candidaturas/12/' && primeira) {
        primeira = false
        return antiga.promise
      }
      return original(c)
    }
    const consulta = e.visualizar(e.notificacoes.value[0])
    await esperar(5)
    e.selecionada.value = null
    e.pedirDecisao(e.notificacoes.value[0], 'aprovar')
    await e.confirmarDecisao()
    antiga.resolve({ ...candidatura, status: 'pendente' })
    await consulta
    assert.equal(e.notificacoes.value[0].status, 'aprovada')
  } finally {
    fechar()
  }
})
test('troca de sessão antes de enviar decisão não usa token novo', async () => {
  const p = service.decidirCandidatura(12, 'aprovar')
  limparSessao()
  storage.set('token', 'outra-conta')
  await assert.rejects(p)
  assert.equal(chamadas.length, 0)
})
test('logout durante decisão descarta status e feedback atrasados', async () => {
  const { e, fechar } = montar()
  try {
    await pronto(e)
    const pende = deferred()
    transporte = () => pende.promise
    e.pedirDecisao(e.notificacoes.value[0], 'aprovar')
    const p = e.confirmarDecisao()
    await esperar(5)
    limparSessao()
    pende.resolve({ ...candidatura, status: 'aprovada' })
    await p
    assert.deepEqual(e.notificacoes.value, [])
    assert.equal(e.feedback.value, '')
    assert.equal(e.confirmacao.value, null)
    assert.deepEqual(e.contatos.value, {})
  } finally {
    fechar()
  }
})
test('data ausente/inválida não é inventada; data da candidatura usa pt-BR', () => {
  assert.equal(utils.dataCandidatura(null), '')
  assert.equal(utils.dataCandidatura('errada'), '')
  assert.match(utils.dataCandidatura(notificacao().candidatura_criado_em), /03\/11\/2026/)
  assert.notEqual(
    utils.dataCandidatura(notificacao().candidatura_criado_em),
    utils.dataCandidatura(notificacao().criado_em),
  )
})
test('resposta da decisão com ID incorreto ou status pendente não confirma sucesso', async () => {
  transporte = () => ({ ...candidatura, id: 31, status: 'aprovada' })
  await assert.rejects(service.decidirCandidatura(12, 'aprovar'))
  transporte = () => ({ ...candidatura, status: 'pendente' })
  await assert.rejects(service.decidirCandidatura(12, 'aprovar'))
})
test('componentes compilam, preservam navegação e não renderizam dados privados', () => {
  for (const nome of [
    'src/components/EmpresaHeader.vue',
    'src/components/NotificacoesDialog.vue',
    'src/views/NotificacoesEmpresaView.vue',
  ]) {
    const source = readFileSync(resolve(nome), 'utf8')
    const { descriptor, errors } = parse(source)
    assert.deepEqual(errors, [])
    compileScript(descriptor, { id: nome })
    assert.deepEqual(
      compileTemplate({ source: descriptor.template.content, filename: nome, id: nome }).errors,
      [],
    )
    if (!nome.includes('EmpresaHeader')) {
      assert.ok(!/freelancer_detalhes\.(email|telefone|latitude|longitude)/.test(source))
      assert.ok(!source.includes('to="/perfil"'))
    }
  }
  const source = readFileSync(resolve('src/views/NotificacoesEmpresaView.vue'), 'utf8')
  assert.ok(source.includes('rel="noopener noreferrer"'))
  assert.ok(source.includes('target="_blank"'))
  const footer = readFileSync(resolve('src/components/FooterEmpresaComponent.vue'), 'utf8')
  assert.ok(footer.includes('to="/mensagens"'))
})
test('estado atualizado enquanto a confirmação está aberta impede decisão sobre snapshot antigo', async () => {
  const { e, fechar } = montar()
  try {
    await pronto(e)
    e.pedirDecisao(e.notificacoes.value[0], 'aprovar')
    candidatura.status = 'recusada'
    await e.carregarCandidato(e.notificacoes.value[0])
    await e.confirmarDecisao()
    assert.equal(chamadas.filter((c) => c.method === 'post').length, 0)
    assert.equal(e.confirmacao.value, null)
    assert.equal(e.notificacoes.value[0].status, 'recusada')
    assert.match(e.erroAcao.value, /atualizado/)
  } finally {
    fechar()
  }
})
test('erro de reconsulta após decisão preserva confirmação e nunca repete POST', async () => {
  const { e, fechar } = montar()
  try {
    await pronto(e)
    const original = transporte
    transporte = (c) => (c.url === 'notificacoes/' ? falhar(503) : original(c))
    e.pedirDecisao(e.notificacoes.value[0], 'aprovar')
    await e.confirmarDecisao()
    assert.match(e.feedback.value, /aprovada/)
    assert.equal(e.confirmacao.value, null)
    assert.ok(e.erro.value)
    await e.confirmarDecisao()
    assert.equal(chamadas.filter((c) => c.method === 'post').length, 1)
  } finally {
    fechar()
  }
})
test('última página removida após decisão retorna à anterior preservando filtro', async () => {
  const { e, fechar } = montar()
  try {
    await pronto(e)
    const original = transporte
    transporte = (c) => {
      if (c.url === 'notificacoes/' && c.params.page === 2) {
        if (candidatura.status === 'pendente')
          return respostaPagina([notificacao()], null, '?page=1&status=pendente', 2)
        falhar(404)
      }
      if (c.url === 'notificacoes/' && c.params.page === 1)
        return respostaPagina(
          [notificacao(40, 20)],
          candidatura.status === 'pendente' ? '?page=2&status=pendente' : null,
          null,
          1,
        )
      return original(c)
    }
    await e.filtrar('pendente')
    await e.carregar(2)
    e.pedirDecisao(e.notificacoes.value[0], 'recusar')
    await e.confirmarDecisao()
    assert.equal(e.pagina.value, 1)
    assert.equal(e.filtro.value, 'pendente')
    assert.equal(e.notificacoes.value[0].id, 40)
    assert.equal(e.erro.value, '')
  } finally {
    fechar()
  }
})
