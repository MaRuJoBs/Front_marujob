import test, { beforeEach, after } from 'node:test'
import assert from 'node:assert/strict'
import { setImmediate as aguardar } from 'node:timers/promises'
import axios from 'axios'
import { createServer } from 'vite'
import { createRouter, createMemoryHistory } from 'vue-router'
import { createRenderer, h, nextTick } from 'vue'

// Doubles somente no transporte HTTP e no SDK externo: nenhum servidor é criado.
const armazenamento = new Map()
globalThis.localStorage = {
  getItem: (key) => armazenamento.get(key) ?? null,
  setItem: (key, value) => armazenamento.set(key, String(value)),
  removeItem: (key) => armazenamento.delete(key),
}
globalThis.window = new EventTarget()
let inicializacoes = 0
let renderizacoes = 0
let callbackGoogle
window.google = globalThis.google = {
  accounts: {
    id: {
      initialize: (config) => {
        inicializacoes++
        callbackGoogle = config.callback
      },
      renderButton: () => {
        renderizacoes++
      },
      disableAutoSelect: () => {},
      cancel: () => {},
    },
  },
}

let transporte
const chamadas = []
const adapterOriginal = axios.defaults.adapter
axios.defaults.adapter = async (config) => {
  chamadas.push(config)
  assert.ok(transporte, 'Requisição inesperada: ' + config.url)
  return transporte(config)
}
const resposta = (config, data = {}, status = 200) => ({
  config,
  data,
  status,
  headers: {},
  statusText: '',
})
const falhar = (config, status = 401, data = { detail: 'Credenciais inválidas.' }) => {
  throw new axios.AxiosError(
    'HTTP ' + status,
    'ERR_BAD_REQUEST',
    config,
    null,
    resposta(config, data, status),
  )
}
const adiar = () => {
  let resolve
  const promise = new Promise((r) => {
    resolve = r
  })
  return { promise, resolve }
}
const corpo = (config) => (typeof config.data === 'string' ? JSON.parse(config.data) : config.data)
const perfil = (tipo = 'usuario') => ({
  id: 1,
  email: 'teste@example.com',
  name: 'Teste',
  groups: [tipo === 'empresa' ? 'Empresa' : 'Usuário'],
})
const tokens = { access: 'access-inicial', refresh: 'refresh-inicial' }

// Vite carrega os módulos reais com import.meta.env, sem instalar outro test runner.
const vite = await createServer({
  configFile: false,
  mode: 'test',
  optimizeDeps: { noDiscovery: true, include: [] },
  server: { middlewareMode: true, watch: null },
  appType: 'custom',
})
const auth = await vite.ssrLoadModule('/src/services/authService.js')
const session = await vite.ssrLoadModule('/src/services/authSession.js')
const { default: api, renovarAccessToken } = await vite.ssrLoadModule('/src/services/api.js')
const guards = await vite.ssrLoadModule('/src/router/authGuard.js')
const { routes } = await vite.ssrLoadModule('/src/router/routes.js')
const { mensagensErro } = await vite.ssrLoadModule('/src/utils/authErrors.js')
const { useCadastro } = await vite.ssrLoadModule('/src/composables/useCadastro.js')
const googleUtils = await vite.ssrLoadModule('/src/utils/googleAuth.js')
const { limparPwaDesenvolvimento } = await vite.ssrLoadModule('/src/utils/devServiceWorker.js')
const { resumirCredencialGoogle, diagnosticoFalhaGoogle } = await vite.ssrLoadModule(
  '/src/utils/googleDiagnostics.js',
)

const criarRouter = () =>
  createRouter({
    history: createMemoryHistory(),
    routes: routes.map((route) => (route.component ? { ...route, component: {} } : route)),
  })

// Renderer mínimo para executar os composables com o ciclo de vida do Vue.
const renderer = createRenderer({
  createElement: () => ({ children: [], isConnected: true }),
  createText: (text) => ({ text }),
  createComment: () => ({}),
  setText: () => {},
  setElementText: () => {},
  patchProp: () => {},
  insert: (child, parent) => {
    parent.children.push(child)
    child.parent = parent
  },
  remove: () => {},
  parentNode: (node) => node.parent,
  nextSibling: () => null,
})
async function montarCadastro(tipo) {
  let cadastro
  const router = criarRouter()
  const app = renderer.createApp({
    setup() {
      cadastro = useCadastro(tipo)
      return () => h('div', { ref: cadastro.googleButton })
    },
  })
  app.use(router)
  app.mount({ children: [] })
  await aguardar()
  return { cadastro, router, desmontar: () => app.unmount() }
}

beforeEach(async () => {
  await nextTick()
  auth.logout()
  armazenamento.clear()
  chamadas.length = 0
  transporte = null
})
after(async () => {
  axios.defaults.adapter = adapterOriginal
  await vite.close()
  delete globalThis.window
  delete globalThis.google
  delete globalThis.localStorage
})

test('identifica grupos por nome e objeto, com acentos; rejeita grupos ausentes e ambíguos', () => {
  assert.equal(session.identificarTipo(perfil()), 'usuario')
  assert.equal(session.identificarTipo({ groups: [{ id: 2, name: 'Empresa' }] }), 'empresa')
  assert.equal(session.identificarTipo({ groups: [' usuario '] }), 'usuario')
  for (const groups of [undefined, [], [1], ['Administrador'], ['Usuário', 'Empresa']]) {
    assert.equal(session.identificarTipo({ groups }), null)
  }
})

for (const tipo of ['usuario', 'empresa']) {
  test(`login de ${tipo} valida /me/ e escolhe a página correta`, async () => {
    transporte = (config) =>
      config.url === 'token/' ? resposta(config, tokens) : resposta(config, perfil(tipo))
    await auth.login('  teste@example.com  ', 'senha123')
    assert.equal(corpo(chamadas[0]).email, 'teste@example.com')
    assert.equal(chamadas[0].headers.Authorization, undefined)
    assert.equal(chamadas[1].url, 'usuarios/me/')
    assert.equal(chamadas[1].headers.Authorization, 'Bearer access-inicial')
    assert.equal(auth.sessao.tipo, tipo)
    assert.equal(auth.paginaInicial(), tipo === 'empresa' ? '/homeEmpresa' : '/home')
  })

  test(`cadastro ${tipo} envia multipart, evita envio duplo e faz login`, async () => {
    const pendente = adiar()
    transporte = async (config) => {
      if (config.url === 'registro/') {
        assert.equal(config.headers.Authorization, undefined)
        assert.equal(config.data.get('tipo'), tipo)
        assert.equal(config.data.get('name'), 'Nome Teste')
        await pendente.promise
        return resposta(config, {}, 201)
      }
      return resposta(config, config.url === 'token/' ? tokens : perfil(tipo))
    }
    const { cadastro, router, desmontar } = await montarCadastro(tipo)
    try {
      cadastro.name.value = ' Nome Teste '
      cadastro.email.value = 'teste@example.com'
      cadastro.senha.value = cadastro.confirmarSenha.value = 'senha123'
      const envio = cadastro.criarConta()
      await aguardar()
      assert.equal(cadastro.loading.value, true)
      await cadastro.criarConta()
      pendente.resolve()
      await envio
      assert.equal(chamadas.filter((c) => c.url === 'registro/').length, 1)
      assert.equal(cadastro.loading.value, false)
      assert.equal(router.currentRoute.value.path, auth.paginaInicial())
    } finally {
      desmontar()
    }
  })
}

test('cadastro valida campos e mantém erros de validação retornados pela API', async () => {
  const { cadastro, desmontar } = await montarCadastro('usuario')
  try {
    await cadastro.criarConta()
    assert.equal(chamadas.length, 0)
    assert.equal(cadastro.erros.value.length, 3)
    cadastro.name.value = 'Nome'
    cadastro.email.value = 'teste@example.com'
    cadastro.senha.value = 'senha123'
    cadastro.confirmarSenha.value = 'diferente'
    await cadastro.criarConta()
    assert.match(cadastro.erros.value[0], /coincidem/)
    cadastro.confirmarSenha.value = 'senha123'
    transporte = (config) =>
      falhar(config, 400, { password: ['Senha muito comum.'], email: ['Formato inválido.'] })
    await cadastro.criarConta()
    assert.deepEqual(
      [...cadastro.erros.value],
      ['Senha: Senha muito comum.', 'E-mail: Formato inválido.'],
    )
    assert.equal(cadastro.loading.value, false)
  } finally {
    desmontar()
  }
})

test('conta criada com falha no login não provoca um segundo cadastro', async () => {
  transporte = (config) => (config.url === 'registro/' ? resposta(config, {}, 201) : falhar(config))
  const { cadastro, desmontar } = await montarCadastro('empresa')
  try {
    cadastro.name.value = 'Empresa'
    cadastro.email.value = 'teste@example.com'
    cadastro.senha.value = cadastro.confirmarSenha.value = 'senha123'
    await cadastro.criarConta()
    await cadastro.criarConta()
    assert.equal(chamadas.filter((c) => c.url === 'registro/').length, 1)
    assert.equal(cadastro.contaCriada.value, true)
    assert.match(cadastro.erros.value[0], /Sua conta foi criada/)
  } finally {
    desmontar()
  }
})

test('login inválido não renova tokens nem cria sessão', async () => {
  transporte = (config) => falhar(config)
  await assert.rejects(auth.login('teste@example.com', 'errada'))
  assert.equal(chamadas.length, 1)
  assert.equal(session.obterAccessToken(), null)
  assert.equal(auth.sessao.usuario, null)
})

test('resposta sem grupo não libera acesso nem deixa sessão parcial', async () => {
  transporte = (config) => resposta(config, config.url === 'token/' ? tokens : { id: 1 })
  await assert.rejects(auth.login('teste@example.com', 'senha123'), { code: 'AUTH_GROUP_MISSING' })
  assert.equal(session.obterRefreshToken(), null)
  assert.equal(auth.sessao.usuario, null)
})

test('tokens ausentes na resposta de login não são gravados como undefined', async () => {
  transporte = (config) => resposta(config, { access: 'access' })
  await assert.rejects(auth.login('teste@example.com', 'senha123'))
  assert.equal(session.obterAccessToken(), null)
  assert.equal(session.obterRefreshToken(), null)
})

test('logout durante login pendente impede reabertura da sessão', async () => {
  const pendente = adiar()
  transporte = async (config) => {
    await pendente.promise
    return resposta(config, tokens)
  }
  const login = auth.login('teste@example.com', 'senha123')
  await aguardar()
  auth.logout()
  pendente.resolve()
  await assert.rejects(login)
  assert.equal(session.obterAccessToken(), null)
})

test('Google reutiliza uma inicialização e envia o tipo e a intenção de cadastro', async () => {
  const antes = inicializacoes
  const antesRender = renderizacoes
  await googleUtils.configurarGoogle({ isConnected: true }, () => {})
  let recebido
  await googleUtils.configurarGoogle({ isConnected: true }, (response) => {
    recebido = response.credential
  })
  callbackGoogle({ credential: 'credencial-google' })
  assert.equal(recebido, 'credencial-google')
  assert.ok(inicializacoes <= 1)
  assert.equal(inicializacoes - antes, antes ? 0 : 1)
  assert.equal(renderizacoes - antesRender, 2)
  for (const tipo of [null, 'usuario', 'empresa']) {
    auth.logout()
    transporte = (config) =>
      resposta(
        config,
        config.url === 'auth/google/'
          ? { ...tokens, precisa_definir_senha: true }
          : perfil(tipo || 'usuario'),
      )
    await auth.loginComGoogle('credencial-google', tipo, tipo !== null)
    const config = chamadas.findLast((c) => c.url === 'auth/google/')
    assert.deepEqual(corpo(config), {
      credential: 'credencial-google',
      tipo,
      cadastro: tipo !== null,
    })
    assert.equal(config.headers.Authorization, undefined)
    assert.equal(auth.sessao.precisaDefinirSenha, true)
    assert.equal(auth.sessao.tipo, tipo || 'usuario')
  }
  googleUtils.desativarGoogle()
  recebido = null
  callbackGoogle({ credential: 'ignorar-apos-desmontar' })
  assert.equal(recebido, null)
})

test('erro 400 do Google é exibido e não dispara refresh', async (t) => {
  t.mock.method(console, 'warn', () => {})
  transporte = (config) => falhar(config, 400, { error: 'Token Google inválido.' })
  await assert.rejects(auth.loginComGoogle('credencial'), (error) => {
    assert.deepEqual(mensagensErro(error), ['Token Google inválido.'])
    assert.equal(error.authStage, 'google')
    return true
  })
  assert.equal(chamadas.length, 1)
  await assert.rejects(auth.loginComGoogle(''))
  assert.equal(chamadas.length, 1)
})

test('restaura sessão após recarregar, sem confiar em perfil persistido', async () => {
  session.salvarTokens(tokens)
  localStorage.setItem('precisa_definir_senha', 'true')
  transporte = (config) => resposta(config, perfil('empresa'))
  const usuarios = await Promise.all([auth.restaurarSessao(), auth.restaurarSessao()])
  assert.equal(chamadas.length, 1)
  assert.equal(usuarios[0].id, 1)
  assert.equal(auth.sessao.tipo, 'empresa')
  assert.equal(auth.sessao.precisaDefinirSenha, true)
})

test('restaura sessão com somente refresh', async () => {
  localStorage.setItem('refresh', tokens.refresh)
  transporte = (config) =>
    resposta(config, config.url === 'token/refresh/' ? { access: 'novo' } : perfil())
  await auth.restaurarSessao()
  assert.deepEqual(
    chamadas.map((c) => c.url),
    ['token/refresh/', 'usuarios/me/'],
  )
  assert.equal(chamadas[1].headers.Authorization, 'Bearer novo')
})

test('401 simultâneos compartilham um refresh e respeitam rotação do token', async () => {
  session.salvarTokens(tokens)
  const pendente = adiar()
  transporte = async (config) => {
    if (config.url === 'token/refresh/') {
      await pendente.promise
      return resposta(config, { access: 'novo', refresh: 'rotacionado' })
    }
    if (config.headers.Authorization !== 'Bearer novo') falhar(config)
    return resposta(config)
  }
  const requisicoes = Promise.all([api.get('privado/1/'), api.get('privado/2/')])
  await aguardar()
  assert.equal(chamadas.filter((c) => c.url === 'token/refresh/').length, 1)
  pendente.resolve()
  await requisicoes
  assert.equal(chamadas.length, 5)
  assert.equal(session.obterRefreshToken(), 'rotacionado')
})

test('401 atrasado reutiliza access já renovado sem renovar novamente', async () => {
  session.salvarTokens(tokens)
  const atrasada = adiar()
  transporte = async (config) => {
    if (config.url === 'token/refresh/') return resposta(config, { access: 'novo' })
    if (config.headers.Authorization !== 'Bearer novo') {
      if (config.url === 'atrasada/') await atrasada.promise
      falhar(config)
    }
    return resposta(config)
  }
  const lenta = api.get('atrasada/')
  await api.get('rapida/')
  atrasada.resolve()
  await lenta
  assert.equal(chamadas.filter((c) => c.url === 'token/refresh/').length, 1)
})

test('segundo 401 após refresh encerra sessão sem loop', async () => {
  session.salvarTokens(tokens)
  transporte = (config) =>
    config.url === 'token/refresh/' ? resposta(config, { access: 'novo' }) : falhar(config)
  await assert.rejects(api.get('privado/'))
  assert.equal(chamadas.length, 3)
  assert.equal(session.obterAccessToken(), null)
})

test('refresh inválido limpa todos os dados de autenticação', async () => {
  session.salvarTokens({ ...tokens, precisa_definir_senha: true })
  transporte = (config) => falhar(config, config.url === 'token/refresh/' ? 400 : 401)
  await assert.rejects(api.get('privado/'))
  assert.equal(chamadas.length, 2)
  assert.equal(armazenamento.size, 0)
  assert.equal(auth.sessao.tipo, null)
})

test('refresh sem access válido é rejeitado sem gravar valores inválidos', async () => {
  session.salvarTokens(tokens)
  transporte = (config) => resposta(config, { access: 'undefined' })
  await assert.rejects(renovarAccessToken())
  assert.equal(armazenamento.size, 0)
})

test('falha de rede na renovação preserva tokens para nova tentativa', async () => {
  session.salvarTokens(tokens)
  transporte = (config) => {
    if (config.url === 'token/refresh/')
      throw new axios.AxiosError('Network Error', 'ERR_NETWORK', config)
    falhar(config)
  }
  await assert.rejects(api.get('privado/'))
  assert.equal(session.obterRefreshToken(), tokens.refresh)
  assert.equal(chamadas.length, 2)
})

test('logout durante refresh não permite restaurar tokens pela resposta antiga', async () => {
  session.salvarTokens(tokens)
  const pendente = adiar()
  transporte = async (config) => {
    if (config.url !== 'token/refresh/') falhar(config)
    await pendente.promise
    return resposta(config, { access: 'antigo-renovado', refresh: 'antigo-refresh' })
  }
  const requisicao = api.get('privado/')
  await aguardar()
  auth.logout()
  pendente.resolve()
  await assert.rejects(requisicao)
  assert.equal(session.obterAccessToken(), null)
  assert.equal(chamadas.length, 2)
})

test('401 de outra conta não encerra a sessão atual', async () => {
  session.salvarTokens(tokens)
  const pendente = adiar()
  transporte = async (config) => {
    await pendente.promise
    falhar(config)
  }
  const antiga = api.get('privado/')
  await aguardar()
  session.salvarTokens({ access: 'conta-b', refresh: 'refresh-b' })
  pendente.resolve()
  await assert.rejects(antiga)
  assert.equal(session.obterAccessToken(), 'conta-b')
  assert.equal(chamadas.length, 1)
})

test('rotas públicas não recebem Authorization nem provocam renovação', async () => {
  session.salvarTokens(tokens)
  transporte = (config) => falhar(config)
  for (const url of ['token/', 'registro/', '/api/auth/google/', 'token/refresh/?origem=teste']) {
    await assert.rejects(api.post(url))
  }
  assert.equal(chamadas.length, 4)
  assert.ok(chamadas.every((c) => c.headers.Authorization === undefined))
  assert.equal(session.obterAccessToken(), tokens.access)
})

test('erro 403 de permissão não renova tokens nem encerra sessão', async () => {
  session.salvarTokens(tokens)
  transporte = (config) => falhar(config, 403)
  await assert.rejects(api.get('privado/'))
  assert.equal(chamadas.length, 1)
  assert.equal(session.obterAccessToken(), tokens.access)
})

test('todas as páginas privadas bloqueiam visitantes, incluindo URLs diretas', async () => {
  const router = criarRouter()
  router.beforeEach(guards.protegerRota)
  for (const route of routes.filter((r) => r.meta?.requiresAuth)) {
    await router.push(route.path.replace(':id', '123'))
    assert.equal(router.currentRoute.value.name, 'login', route.path)
  }
  assert.equal(chamadas.length, 0)
})

for (const tipo of ['usuario', 'empresa']) {
  test(`rotas de ${tipo} redirecionam áreas exclusivas da outra conta e páginas públicas`, async () => {
    session.salvarTokens(tokens)
    transporte = (config) => resposta(config, perfil(tipo))
    const router = criarRouter()
    router.beforeEach(guards.protegerRota)
    const bloqueadas = routes.filter(
      (r) => r.meta?.publica || (r.meta?.tipo && r.meta.tipo !== tipo),
    )
    for (const route of bloqueadas) {
      await router.push(route.path.replace(':id', '123'))
      assert.equal(router.currentRoute.value.path, tipo === 'empresa' ? '/homeEmpresa' : '/home')
    }
    await router.push('/mensagens')
    assert.equal(router.currentRoute.value.path, '/mensagens')
    assert.equal(chamadas.length, 1)
  })
}

test('falha de conexão durante restauração bloqueia a página sem apagar refresh', async () => {
  session.salvarTokens(tokens)
  transporte = (config) => {
    throw new axios.AxiosError('Network Error', 'ERR_NETWORK', config)
  }
  const router = criarRouter()
  router.beforeEach(guards.protegerRota)
  await router.push('/home')
  assert.equal(router.currentRoute.value.name, 'login')
  assert.equal(router.currentRoute.value.query.motivo, 'conexao')
  assert.equal(session.obterRefreshToken(), tokens.refresh)
  assert.equal(chamadas.length, 1)
})

test('logout em uma página aberta redireciona para login e impede voltar à página privada', async () => {
  session.salvarTokens(tokens)
  transporte = (config) => resposta(config, perfil('empresa'))
  const router = criarRouter()
  const parar = guards.instalarProtecao(router)
  try {
    await router.push('/homeEmpresa')
    auth.logout()
    await nextTick()
    await aguardar()
    assert.equal(router.currentRoute.value.name, 'login')
    await router.push('/homeEmpresa')
    assert.equal(router.currentRoute.value.name, 'login')
    assert.equal(armazenamento.size, 0)
  } finally {
    parar()
  }
})

test('definição e troca de senha usam sessão autenticada e atualizam o aviso', async () => {
  session.salvarTokens({ ...tokens, precisa_definir_senha: true })
  transporte = (config) => resposta(config)
  await auth.definirSenha('nova-senha-123')
  await auth.trocarSenha('senha-atual', 'outra-senha-123')
  assert.equal(auth.sessao.precisaDefinirSenha, false)
  assert.equal(localStorage.getItem('precisa_definir_senha'), 'false')
  assert.deepEqual(corpo(chamadas[0]), { senha: 'nova-senha-123' })
  assert.deepEqual(corpo(chamadas[1]), {
    senha_atual: 'senha-atual',
    nova_senha: 'outra-senha-123',
  })
  assert.ok(chamadas.every((c) => c.headers.Authorization === 'Bearer access-inicial'))
})

function documentoGoogle() {
  const scripts = []
  globalThis.document = {
    querySelector: () => scripts.find((script) => !script.removido) || null,
    createElement: () =>
      Object.assign(new EventTarget(), {
        remove() {
          this.removido = true
        },
      }),
    head: { appendChild: (script) => scripts.push(script) },
  }
  return scripts
}

test('Google carrega o script sob demanda e compartilha o carregamento entre telas', async () => {
  const sdk = window.google
  const scripts = documentoGoogle()
  window.google = undefined
  try {
    const primeira = googleUtils.carregarGoogle()
    const segunda = googleUtils.carregarGoogle()
    assert.equal(primeira, segunda)
    assert.equal(scripts.length, 1)
    assert.equal(scripts[0].src, 'https://accounts.google.com/gsi/client')
    window.google = sdk
    scripts[0].dispatchEvent(new Event('load'))
    assert.equal(await primeira, sdk.accounts.id)
    assert.equal(await segunda, sdk.accounts.id)
  } finally {
    window.google = sdk
    delete globalThis.document
  }
})

test('Google permite tentar novamente após falha de rede sem recarregar a página', async () => {
  const sdk = window.google
  const scripts = documentoGoogle()
  window.google = undefined
  try {
    const primeira = googleUtils.carregarGoogle()
    const rejeicao = assert.rejects(primeira, /Verifique sua conexão ou bloqueadores/)
    scripts[0].dispatchEvent(new Event('error'))
    await rejeicao
    assert.equal(scripts[0].removido, true)
    const segunda = googleUtils.carregarGoogle()
    assert.equal(scripts.length, 2)
    window.google = sdk
    scripts[1].dispatchEvent(new Event('load'))
    assert.equal(await segunda, sdk.accounts.id)
  } finally {
    window.google = sdk
    delete globalThis.document
  }
})

test('Google libera nova tentativa após timeout em vez de ficar indisponível permanentemente', async () => {
  const sdk = window.google
  const scripts = documentoGoogle()
  window.google = undefined
  try {
    await assert.rejects(googleUtils.carregarGoogle({ timeoutMs: 20 }), /carregar o Google/)
    const segunda = googleUtils.carregarGoogle()
    assert.equal(scripts.length, 2)
    window.google = sdk
    scripts[1].dispatchEvent(new Event('load'))
    await segunda
  } finally {
    window.google = sdk
    delete globalThis.document
  }
})

test('Google não inicializa o botão de uma tela desmontada durante o carregamento', async () => {
  const sdk = window.google
  const scripts = documentoGoogle()
  window.google = undefined
  const antes = renderizacoes
  let ativo = true
  try {
    const configuracao = googleUtils.configurarGoogle(
      { isConnected: true },
      () => {},
      () => ativo,
    )
    ativo = false
    window.google = sdk
    scripts[0].dispatchEvent(new Event('load'))
    assert.equal(await configuracao, false)
    assert.equal(renderizacoes, antes)
  } finally {
    window.google = sdk
    delete globalThis.document
  }
})

const credencialDiagnostico = (claims) =>
  [
    Buffer.from('{"alg":"RS256"}').toString('base64url'),
    Buffer.from(JSON.stringify(claims)).toString('base64url'),
    'assinatura-de-teste',
  ].join('.')

test('Google rejeita credencial ausente ou objeto antes de enviar à API', async () => {
  for (const credential of [undefined, null, '', '   ', { credential: 'valor' }]) {
    await assert.rejects(auth.loginComGoogle(credential), /não retornou uma credencial/)
  }
  assert.equal(chamadas.length, 0)
})

test('Google envia credencial intacta sem JWT antigo mesmo com sessão existente', async () => {
  session.salvarTokens({ access: 'jwt-antigo', refresh: 'refresh-antigo' })
  transporte = (config) => resposta(config, config.url === 'auth/google/' ? tokens : perfil())
  const credential = 'credencial-google-recebida'
  await auth.loginComGoogle(credential)
  assert.equal(corpo(chamadas[0]).credential, credential)
  assert.equal(chamadas[0].headers.Authorization, undefined)
  assert.equal(chamadas[0].skipAuth, true)
  assert.equal(chamadas.filter((config) => config.url === 'token/refresh/').length, 0)
})

test('diagnóstico diferencia falha no JWT da aplicação de rejeição da credencial Google', async (t) => {
  const aviso = t.mock.method(console, 'warn', () => {})
  transporte = (config) => {
    if (config.url === 'auth/google/') return resposta(config, tokens)
    falhar(config, 401, { detail: 'Token inválido.' })
  }
  await assert.rejects(auth.loginComGoogle('credencial'), (error) => {
    assert.equal(error.authStage, 'sessao')
    assert.equal(error.config.url, 'token/refresh/')
    return true
  })
  const diagnostico = JSON.parse(aviso.mock.calls[0].arguments[1])
  assert.equal(diagnostico.etapa, 'sessao')
  assert.equal(diagnostico.status, 401)
  assert.equal(session.obterAccessToken(), null)
})

test('diagnóstico identifica audience, expiração e emissão futura sem autenticar claims', () => {
  const clientId = '123-cliente.apps.googleusercontent.com'
  const agora = 2000000000000
  const token = credencialDiagnostico({
    aud: clientId,
    iss: 'https://accounts.google.com',
    iat: agora / 1000 + 3,
    exp: agora / 1000 + 3600,
    email: 'pessoal@example.com',
    sub: 'identificador-pessoal',
  })
  const resumo = resumirCredencialGoogle(token, clientId, agora)
  assert.equal(resumo.clientIdCompativel, true)
  assert.equal(resumo.emissorGoogle, true)
  assert.equal(resumo.emitidoHaSegundos, -3)
  assert.equal(resumo.expiraEmSegundos, 3600)
  assert.equal(resumirCredencialGoogle(token, 'outro-cliente', agora).clientIdCompativel, false)
  assert.equal(resumirCredencialGoogle(token, clientId, agora + 7200000).expiraEmSegundos, -3600)
  assert.deepEqual(resumirCredencialGoogle('nao-e-jwt', clientId), { formatoJwt: false })
})

test('diagnóstico não inclui tokens, identidade ou conteúdo completo da resposta', () => {
  const token = credencialDiagnostico({
    aud: '123-cliente.apps.googleusercontent.com',
    iss: 'accounts.google.com',
    email: 'pessoal@example.com',
    name: 'Nome Pessoal',
    sub: 'identificador-pessoal',
  })
  const diagnostico = diagnosticoFalhaGoogle(
    {
      authStage: 'google',
      config: { url: 'auth/google/' },
      response: {
        status: 400,
        data: {
          error: `Token inválido ${token} pessoal@example.com`,
          access: 'access-secreto',
          refresh: 'refresh-secreto',
          name: 'Nome Pessoal',
        },
      },
    },
    token,
  )
  const serializado = JSON.stringify(diagnostico)
  for (const privado of [
    token,
    'pessoal@example.com',
    'Nome Pessoal',
    'identificador-pessoal',
    'access-secreto',
    'refresh-secreto',
  ]) {
    assert.equal(serializado.includes(privado), false)
  }
  assert.equal(diagnostico.status, 400)
})

async function comPwa(ambiente, executar) {
  const anteriores = Object.fromEntries(
    Object.keys(ambiente).map((key) => [key, Object.getOwnPropertyDescriptor(globalThis, key)]),
  )
  for (const [key, value] of Object.entries(ambiente))
    Object.defineProperty(globalThis, key, { configurable: true, value })
  try {
    await executar()
  } finally {
    for (const [key, descriptor] of Object.entries(anteriores)) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor)
      else delete globalThis[key]
    }
  }
}

test('limpeza PWA remove somente o worker e precache deste aplicativo', async () => {
  const scope = 'http://localhost:5173/'
  let reloads = 0
  let removidos = 0
  const cachesRemovidos = []
  const registro = {
    scope,
    active: { scriptURL: scope + 'sw.js' },
    unregister: async () => {
      removidos++
      return true
    },
  }
  const outro = {
    scope: scope + 'outro/',
    active: { scriptURL: scope + 'outro/sw.js' },
    unregister: () => assert.fail('Worker alheio'),
  }
  await comPwa(
    {
      navigator: {
        serviceWorker: {
          controller: registro.active,
          getRegistrations: async () => [registro, outro],
        },
      },
      location: {
        origin: scope.slice(0, -1),
        reload: () => {
          reloads++
        },
      },
      caches: {
        keys: async () => [
          'workbox-precache-v2-' + scope,
          'workbox-precache-v2-' + scope + 'outro/',
          'outro-cache',
        ],
        delete: async (nome) => {
          cachesRemovidos.push(nome)
        },
      },
    },
    async () => {
      assert.equal(await limparPwaDesenvolvimento(), true)
      assert.equal(removidos, 1)
      assert.equal(reloads, 1)
      assert.deepEqual(cachesRemovidos, ['workbox-precache-v2-' + scope])
    },
  )
})

test('limpeza PWA não recarrega ou apaga caches se não existir registro do aplicativo', async () => {
  await comPwa(
    {
      navigator: { serviceWorker: { getRegistrations: async () => [] } },
      location: { origin: 'http://localhost:5173', reload: () => assert.fail('Reload sem worker') },
      caches: { keys: () => assert.fail('Caches não relacionados') },
    },
    async () => assert.equal(await limparPwaDesenvolvimento(), false),
  )
})

test('restrição de acesso a service workers não impede iniciar o aplicativo', async () => {
  await comPwa(
    {
      navigator: {
        serviceWorker: {
          getRegistrations: async () => {
            throw new Error('Storage bloqueado')
          },
        },
      },
      location: { origin: 'http://localhost:5173' },
    },
    async () => assert.equal(await limparPwaDesenvolvimento(), false),
  )
})
