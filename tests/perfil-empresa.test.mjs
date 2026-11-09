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
after(() => vite.close())
const load = (p) => vite.ssrLoadModule('/src/' + p)
const { default: api } = await load('services/api.js')
const { sessao, limparSessao } = await load('services/authSession.js')
const { usePerfilEmpresa } = await load('composables/usePerfilEmpresa.js')
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
    e.form.value.cidade = 'Joinville'
    e.form.value.uf = 'SC'
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
    e.form.value.cidade = 'Joinville'
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
  assert.deepEqual(rota.meta, { requiresAuth: true, tipo: 'empresa' })
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
