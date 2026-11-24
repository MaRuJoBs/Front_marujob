import test, { after } from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'vite'

globalThis.localStorage = { getItem: () => null, removeItem() {} }
const vite = await createServer({
  server: { middlewareMode: true },
  appType: 'custom',
  optimizeDeps: { noDiscovery: true, include: [] },
})
after(() => vite.close())
const { default: api } = await vite.ssrLoadModule('/src/services/api.js')
const { sessao } = await vite.ssrLoadModule('/src/services/authSession.js')
const service = await vite.ssrLoadModule('/src/services/freelancersPublicosService.js')
const publico = {
  id: 7,
  nome: 'Teste de transporte',
  habilidades: ['Vue'],
  email: 'privado',
  latitude: 10,
  password: 'privado',
}
function empresa() {
  sessao.tipo = 'empresa'
  sessao.usuario = { id: 1 }
}
test('projeção pública elimina dados privados e rejeita links perigosos', () => {
  const perfil = service.perfilPublico(
    {
      ...publico,
      descricao: 'Descrição',
      portfolio: [
        { id: 2, titulo: 'Projeto de teste', link: 'javascript:alert(1)', email: 'privado' },
        { id: 3, titulo: 'Projeto privado', publico: false },
        { id: 4, titulo: 'Projeto público', publico: true },
      ],
    },
    true,
  )
  assert.equal(perfil.email, undefined)
  assert.equal(perfil.latitude, undefined)
  assert.equal(perfil.password, undefined)
  assert.deepEqual(perfil.portfolio.map(({ id }) => id), [2, 4])
  assert.equal(perfil.portfolio[0].link, null)
  assert.equal(perfil.portfolio[0].email, undefined)
  assert.equal(service.linkPublico('https://example.org/projeto'), 'https://example.org/projeto')
  assert.equal(service.linkPublico('https://user:senha@example.org'), null)
})
test('filtros cumulativos, trim e paginação real sem percorrer páginas', async () => {
  empresa()
  let chamadas = 0
  api.defaults.adapter = async (config) => {
    chamadas++
    assert.equal(config.url, 'freelancers/')
    assert.deepEqual(config.params, {
      search: 'Vue',
      profissao: 'Dev',
      cidade: 'Blumenau',
      habilidade: 'JS',
      page: 2,
    })
    return {
      config,
      status: 200,
      data: { count: 3, next: null, previous: '/api/freelancers/?page=1', results: [publico] },
    }
  }
  const data = await service.listarFreelancers({
    search: ' Vue ',
    profissao: 'Dev',
    cidade: 'Blumenau',
    habilidade: 'JS',
    page: 2,
  })
  assert.equal(chamadas, 1)
  assert.equal(data.previous, true)
  assert.equal(data.next, false)
  assert.equal(data.results[0].email, undefined)
})
test('vazio, formato inválido, filtros inválidos e páginas inválidas', async () => {
  empresa()
  api.defaults.adapter = async (config) => ({
    config,
    status: 200,
    data: { count: 0, results: [] },
  })
  assert.deepEqual((await service.listarFreelancers()).results, [])
  await assert.rejects(service.listarFreelancers({ page: 0 }))
  await assert.rejects(service.listarFreelancers({ cidade: 'a'.repeat(121) }))
  api.defaults.adapter = async (config) => ({ config, status: 200, data: [] })
  await assert.rejects(service.listarFreelancers())
})
test('detalhe por ID, opcionais, ID inválido e identidade divergente', async () => {
  empresa()
  api.defaults.adapter = async (config) => {
    assert.equal(config.url, 'freelancers/7/')
    return { config, status: 200, data: publico }
  }
  const data = await service.obterFreelancer(7)
  assert.deepEqual(data.portfolio, [])
  assert.equal(data.foto_perfil, null)
  await assert.rejects(service.obterFreelancer('../me'), (e) => e.response.status === 404)
  await assert.rejects(service.obterFreelancer('07'))
  api.defaults.adapter = async (config) => ({ config, status: 200, data: { id: 8 } })
  await assert.rejects(service.obterFreelancer(7))
})
test('recusa outra sessão e descarta resposta de conta anterior', async () => {
  sessao.tipo = 'usuario'
  await assert.rejects(service.listarFreelancers())
  empresa()
  api.defaults.adapter = async (config) => {
    sessao.revisao++
    return { config, status: 200, data: { count: 1, results: [publico] } }
  }
  await assert.rejects(service.listarFreelancers())
})
test('mensagens para 400, 401, 403, 404, servidor e rede', () => {
  for (const status of [400, 401, 403, 404, 500])
    assert.ok(service.erroFreelancers({ response: { status } }))
  assert.ok(service.erroFreelancers({}))
})
test('rotas integradas exigem autenticação e tipo empresa', async () => {
  const { routes } = await vite.ssrLoadModule('/src/router/routes.js')
  for (const name of ['busca-freelancers', 'perfil-publico-freelancer', 'projeto-publico-freelancer']) {
    const route = routes.find((item) => item.name === name)
    assert.equal(route.meta.requiresAuth, true)
    assert.equal(route.meta.tipo, 'empresa')
  }
})
