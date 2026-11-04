// Navegador real, componentes/rotas/autenticação reais e transporte Axios simulado.
// As oportunidades abaixo são fixtures exclusivas dos testes; nenhuma API real é acessada.
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { setTimeout as aguardar } from 'node:timers/promises'
import { createServer } from 'vite'
import vue from '@vitejs/plugin-vue'

const chrome = process.env.CHROME_BIN || 'C:/Program Files/Google/Chrome/Application/chrome.exe'
assert.ok(existsSync(chrome), 'Configure CHROME_BIN com o caminho do Chrome.')
const artefatos = resolve('node_modules/.cache/feat38-navegador')
mkdirSync(artefatos, { recursive: true })
const roteiro = `
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import axios from 'axios'
import App from '/src/App.vue'
import { routes } from '/src/router/routes.js'
import { instalarProtecao } from '/src/router/authGuard.js'
import { login, logout } from '/src/services/authService.js'
import { sessao } from '/src/services/authSession.js'
import api from '/src/services/api.js'
import { useFavoritosStore } from '/src/stores/favoritos.js'
import '/src/assets/main.css'
import '@fortawesome/fontawesome-free/css/all.min.css'

library.add(fas)
let conta = 38
let longo = false
let atraso = 0
let cenarioLista = 'normal'
const falhas = new Map(), consultas = []
const item = id => ({ id, titulo: longo ? 'TituloExtensoSemEspacos'.repeat(35) : 'Oportunidade de teste #' + id, descricao: 'Descrição de teste', tag: 'design', preco: '2500.00', tempo: 20 })
api.defaults.adapter = async config => {
  const url = new URL(config.url, 'https://teste.invalid/api/')
  consultas.push({ url: url.pathname, params: config.params, method: config.method })
  if (atraso) await new Promise(r => setTimeout(r, atraso))
  const status = falhas.get(url.pathname)
  if (status !== undefined) throw new axios.AxiosError('Falha de teste', 'ERR_TEST', config, null, status ? {status, data: {}} : undefined)
  let data
  if (url.pathname.endsWith('/token/')) data = {access:'token-exclusivo-do-teste', refresh:'refresh-exclusivo-do-teste'}
  else if (url.pathname.endsWith('/usuarios/me/')) data = {id:conta,name:'Conta de teste',groups:['Usuário']}
  else if (url.pathname.endsWith('/freelances/')) {
    const page = Number(config.params?.page || url.searchParams.get('page') || 1)
    data = cenarioLista === 'vazia'
      ? {count:0, next:null, previous:null, results:[]}
      : cenarioLista === 'invalida'
        ? {results:null}
        : {count:3, next:page===1?'?page=2':null, previous:page===2?'?page=1':null,results:(page===1?[1,2]:[27]).map(item)}
  } else if (/\\/freelances\\/\\d+\\/$/.test(url.pathname)) data = item(Number(url.pathname.split('/').at(-2)))
  else throw Error('Requisição inesperada no teste: ' + url.pathname)
  return {config,data,status:200,headers:{},statusText:''}
}
if (!localStorage.getItem('token')) {
  localStorage.setItem('token', 'token-exclusivo-do-teste')
  localStorage.setItem('refresh', 'refresh-exclusivo-do-teste')
}
const app = createApp(App)
app.component('FontAwesomeIcon', FontAwesomeIcon)
app.use(createPinia())
const router = createRouter({history:createMemoryHistory(), routes})
instalarProtecao(router)
app.use(router)
await router.push('/home')
await router.isReady()
app.mount('#app')
const store = useFavoritosStore()
window.feat38 = {
  store, consultas, falhas,
  ir: path => router.push(path),
  rota: () => router.currentRoute.value.path,
  sair: logout,
  entrar: async id => {conta=id; await login('conta@teste.invalid','senha-exclusiva-do-teste'); await router.push('/home')},
  longo: valor => {longo=valor},
  atraso: valor => {atraso=valor},
  cenarioLista: valor => {cenarioLista=valor},
  sessao,
}
document.body.dataset.pronto = 'sim'
`

const vite = await createServer({
  configFile: false,
  mode: 'test',
  plugins: [
    vue(),
    {
      name: 'feat38-navegador',
      configureServer(server) {
        server.middlewares.use('/__feat38', (_req, res) => {
          res.setHeader('Content-Type', 'text/html')
          res.end(
            '<!doctype html><html lang="pt-BR"><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0"><div id="app"></div><script type="module" src="/@id/virtual:feat38"></script></body></html>',
          )
        })
      },
      resolveId(id) {
        if (id === 'virtual:feat38') return '\0feat38'
      },
      load(id) {
        if (id === '\0feat38') return roteiro
      },
    },
  ],
  resolve: { alias: { '@': resolve('src') } },
  server: { host: '127.0.0.1', port: 5188, strictPort: true, hmr: false },
})
await vite.listen()
const navegador = spawn(
  chrome,
  [
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    '--remote-debugging-port=9342',
    '--user-data-dir=' + resolve(artefatos, 'perfil'),
    'about:blank',
  ],
  { windowsHide: true, stdio: 'ignore' },
)
let socket
try {
  let targets
  for (let i = 0; i < 100; i++) {
    try {
      targets = await (await fetch('http://127.0.0.1:9342/json/list')).json()
      break
    } catch {
      await aguardar(100)
    }
  }
  assert.ok(targets, 'Não foi possível iniciar o navegador.')
  socket = new WebSocket(targets.find((t) => t.type === 'page').webSocketDebuggerUrl)
  await new Promise((resolve, reject) => {
    socket.addEventListener('open', resolve, { once: true })
    socket.addEventListener('error', reject, { once: true })
  })
  let sequencia = 0
  const pendentes = new Map(),
    erros = []
  function enviar(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = ++sequencia
      const timer = setTimeout(() => {
        pendentes.delete(id)
        reject(Error('CDP excedeu o tempo: ' + method))
      }, 20_000)
      pendentes.set(id, {
        resolve: (value) => {
          clearTimeout(timer)
          resolve(value)
        },
        reject,
      })
      socket.send(JSON.stringify({ id, method, params }))
    })
  }
  socket.addEventListener('message', (event) => {
    const m = JSON.parse(event.data)
    if (m.id) {
      const p = pendentes.get(m.id)
      pendentes.delete(m.id)
      if (m.error) p?.reject(Error(m.error.message))
      else p?.resolve(m.result)
    }
    if (m.method === 'Runtime.exceptionThrown')
      erros.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text)
  })
  await enviar('Runtime.enable')
  await enviar('Page.enable')
  async function avaliar(expression) {
    const r = await enviar('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true,
    })
    if (r.exceptionDetails)
      throw Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text)
    return r.result.value
  }
  async function esperar(expression) {
    for (let i = 0; i < 150; i++) {
      if (await avaliar(expression)) return
      await aguardar(100)
    }
    throw Error('Tempo esgotado: ' + expression)
  }
  const clicar = (seletor) => avaliar(`document.querySelector(${JSON.stringify(seletor)}).click()`)
  async function ir(path, pronto) {
    await avaliar(`feat38.ir(${JSON.stringify(path)})`)
    await esperar(pronto)
  }
  async function capturar(nome) {
    const captura = await enviar('Page.captureScreenshot', {
      format: 'png',
      captureBeyondViewport: false,
    })
    writeFileSync(resolve(artefatos, nome + '.png'), Buffer.from(captura.data, 'base64'))
  }
  await enviar('Emulation.setDeviceMetricsOverride', {
    width: 375,
    height: 900,
    deviceScaleFactor: 1,
    mobile: true,
  })
  await enviar('Page.navigate', { url: 'http://127.0.0.1:5188/__feat38' })
  await esperar(
    "document.body?.dataset.pronto === 'sim' && !!document.querySelector('.card .favorito')",
  )
  await avaliar(
    'localStorage.removeItem("marujobs:favoritos:usuario:38"); localStorage.removeItem("marujobs:favoritos:usuario:39"); feat38.store.carregarFavoritos()',
  )

  await clicar('.card .favorito')
  await esperar("[...document.querySelectorAll('.home .favorito[aria-pressed=true]')].length === 2")
  assert.equal(await avaliar('feat38.rota()'), '/home')
  assert.equal(
    await avaliar("document.querySelector('.card .favorito i').classList.contains('fa-solid')"),
    true,
  )
  assert.equal(
    await avaliar(
      "getComputedStyle(document.querySelector('.card .favorito i'),'::before').fontWeight",
    ),
    '900',
  )
  await ir('/freelances', "document.querySelectorAll('.vaga').length === 2")
  assert.equal(
    await avaliar("document.querySelector('.vaga .favorito').getAttribute('aria-pressed')"),
    'true',
  )
  await clicar('.paginacao button:last-child')
  await esperar(
    "document.querySelectorAll('.vaga').length === 1 && document.querySelector('.vaga h2').textContent.includes('#27')",
  )
  await clicar('.vaga .favorito')
  await ir('/oportunidade/27', "!!document.querySelector('.informacoes-card')")
  assert.equal(
    await avaliar("document.querySelector('.favorito').getAttribute('aria-pressed')"),
    'true',
  )
  await clicar('.favorito')
  await clicar('.favorito')
  await ir('/oportunidade/28', "document.querySelector('h1')?.textContent.includes('#28')")
  await clicar('.favorito')
  console.log('PASSOU 1–4: Home, listagem, detalhes e sincronização, incluindo página 2.')

  await ir(
    '/favoritos',
    "document.querySelectorAll('.bloco-vaga .details').length === 3 && !feat38.store.carregando",
  )
  const antes = await avaliar(
    'feat38.consultas.filter(c => /freelances\\/\\d+\\/$/.test(c.url)).length',
  )
  await ir('/home', "!!document.querySelector('.home')")
  await ir('/favoritos', "document.querySelectorAll('.bloco-vaga').length === 3")
  assert.equal(
    await avaliar('feat38.consultas.filter(c => /freelances\\/\\d+\\/$/.test(c.url)).length'),
    antes,
  )
  await clicar('.bloco-vaga:nth-of-type(2) .favorito')
  await esperar(
    "document.querySelectorAll('.bloco-vaga').length === 2 && !feat38.store.ehFavorito(27)",
  )
  await ir('/freelances', "document.querySelectorAll('.vaga').length === 2")
  await clicar('.paginacao button:last-child')
  await esperar("document.querySelector('.vaga h2')?.textContent.includes('#27')")
  assert.equal(
    await avaliar("document.querySelector('.vaga .favorito').getAttribute('aria-pressed')"),
    'false',
  )
  assert.equal(
    await avaliar("document.querySelector('.vaga .favorito i').classList.contains('fa-regular')"),
    true,
  )
  assert.equal(
    await avaliar(
      "getComputedStyle(document.querySelector('.vaga .favorito i'),'::before').fontWeight",
    ),
    '400',
  )
  await enviar('Page.reload')
  await esperar("document.body?.dataset.pronto === 'sim' && !!document.querySelector('.home')")
  assert.deepEqual(await avaliar('[...feat38.store.favoritos]'), [1, 28])
  await avaliar('feat38.sair()')
  await esperar("feat38.rota() === '/'")
  assert.deepEqual(await avaliar('[...feat38.store.favoritos]'), [])
  await avaliar('feat38.entrar(39)')
  assert.deepEqual(await avaliar('[...feat38.store.favoritos]'), [])
  await clicar('.mini-card .favorito')
  await avaliar('feat38.sair(); feat38.entrar(38)')
  await esperar("!!document.querySelector('.home .card')")
  assert.deepEqual(await avaliar('[...feat38.store.favoritos]'), [1, 28])
  console.log('PASSOU 5–8: remoção, recarga real, logout/login A–B–A, favoritos paginados e cache.')

  await avaliar(
    "feat38.falhas.set('/api/freelances/404/',404); feat38.falhas.set('/api/freelances/500/',0); feat38.store.adicionarFavorito(404); feat38.store.adicionarFavorito(500); feat38.atraso(350)",
  )
  await ir('/favoritos', "document.body.textContent.includes('Carregando oportunidades favoritas')")
  assert.equal(
    await avaliar("document.body.textContent.includes('Você ainda não adicionou')"),
    false,
  )
  await esperar("!feat38.store.carregando && document.querySelectorAll('.bloco-vaga').length === 4")
  assert.equal(
    await avaliar("document.body.textContent.includes('não está mais disponível')"),
    true,
  )
  assert.equal(await avaliar("document.body.textContent.includes('Verifique sua conexão')"), true)
  assert.deepEqual(await avaliar('[...feat38.store.favoritos]'), [1, 28, 404, 500])
  await avaliar(
    "feat38.atraso(0); [...document.querySelectorAll('.bloco-vaga')].find(e => e.textContent.includes('#404')).querySelector('.favorito').click()",
  )
  await esperar(
    "!feat38.store.ehFavorito(404) && document.querySelectorAll('.bloco-vaga').length === 3",
  )
  await avaliar(
    "feat38.falhas.clear(); document.querySelector('.bloco-vaga .estado button').click()",
  )
  await esperar(
    "!feat38.store.carregando && feat38.store.oportunidadesFavoritas.every(e => e.status === 'disponivel')",
  )
  await avaliar("for(let i=0;i<101;i++) document.querySelector('.bloco-vaga .favorito').click()")
  assert.equal(
    await avaliar('new Set(feat38.store.favoritos).size === feat38.store.favoritos.length'),
    true,
  )
  console.log(
    'PASSOU 9–11: carregamento, 404 removível, falha temporária/recuperação e cliques rápidos.',
  )

  await ir('/freelances', "!!document.querySelector('.vaga')")
  await avaliar(
    "const busca=document.querySelector('.busca input'); busca.value='designer'; busca.dispatchEvent(new Event('input',{bubbles:true}))",
  )
  await esperar("feat38.consultas.at(-1).params?.search === 'designer'")
  await clicar('.botao-filtro')
  await esperar("!!document.querySelector('#filtro-tag')")
  await avaliar(
    "const campo=document.querySelector('#filtro-tag');campo.value='design';campo.dispatchEvent(new Event('input',{bubbles:true}));document.querySelector('.filtros-painel').requestSubmit()",
  )
  await esperar("feat38.consultas.at(-1).params?.tag === 'design'")
  assert.equal(await avaliar('feat38.consultas.at(-1).params.page'), 1)
  await clicar('.vaga .details')
  await esperar("!!document.querySelector('.informacoes-card')")
  assert.ok((await avaliar('feat38.rota()')).startsWith('/oportunidade/'))
  console.log('PASSOU 13: busca, filtros, paginação e navegação para detalhes preservados.')

  await avaliar('feat38.longo(true)')
  for (const largura of [320, 375, 768, 1024, 1440]) {
    await enviar('Emulation.setDeviceMetricsOverride', {
      width: largura,
      height: 1000,
      deviceScaleFactor: 1,
      mobile: largura < 768,
    })
    for (const [tela, path, seletor] of [
      ['home', '/home', '.home .favorito'],
      ['listagem', '/freelances', '.vaga .favorito'],
      ['detalhes', '/oportunidade/28', '.informacoes-card'],
      ['favoritos', '/favoritos', '.bloco-vaga'],
    ]) {
      await ir(path, `!!document.querySelector(${JSON.stringify(seletor)})`)
      if (tela === 'favoritos')
        await avaliar('feat38.store.carregarOportunidades({recarregar:true})')
      assert.equal(
        await avaliar('document.documentElement.scrollWidth <= innerWidth'),
        true,
        `${tela}: overflow em ${largura}px`,
      )
      assert.equal(
        await avaliar(
          "[...document.querySelectorAll('button.favorito')].every(b => { const r=b.getBoundingClientRect(); return r.width>=44 && r.height>=44 && r.left>=0 && r.right<=innerWidth })",
        ),
        true,
        `${tela}: área de toque em ${largura}px`,
      )
      if (tela === 'favoritos') {
        assert.equal(
          await avaliar(
            "[...document.querySelectorAll('.bloco-vaga .favorito i')].every(i => getComputedStyle(i,'::before').fontWeight === '900')",
          ),
          true,
          'Favoritos devem ter o coração preenchido',
        )
        assert.equal(
          await avaliar(
            "[...document.querySelectorAll('.bloco-vaga h3')].every(h => h.getBoundingClientRect().height < 90)",
          ),
          true,
          'Títulos extensos devem manter o card compacto',
        )
        assert.equal(
          await avaliar(
            "[...document.querySelectorAll('.parte-inferior')].every(e => {const a=e.querySelector('.details').getBoundingClientRect(),b=e.querySelector('.price').getBoundingClientRect();return a.right<=b.left || a.bottom<=b.top || b.bottom<=a.top})",
          ),
          true,
          `Favoritos: sobreposição em ${largura}px`,
        )
      }
      await capturar(`${tela}-${largura}`)
    }
    console.log(`PASSOU 12: quatro páginas responsivas em ${largura}px, com títulos extensos.`)
  }
  await avaliar('for(const id of [...feat38.store.favoritos]) feat38.store.removerFavorito(id)')
  await esperar(
    "document.body.textContent.includes('Você ainda não adicionou nenhuma oportunidade')",
  )
  await clicar('.estado .details')
  await esperar("feat38.rota() === '/freelances' && !!document.querySelector('.vaga')")
  for (const [status, mensagem] of [
    [0, 'Não foi possível conectar à API'],
    [403, 'Sua conta não tem permissão'],
    [500, 'Não foi possível carregar as oportunidades'],
  ]) {
    await avaliar(`feat38.falhas.set('/api/freelances/', ${status})`)
    await ir('/home', "!!document.querySelector('.erro-jobs')")
    assert.equal(await avaliar(`document.querySelector('.erro-jobs').textContent.includes(${JSON.stringify(mensagem)})`), true)
    assert.equal(await avaliar("!!document.querySelector('.vazio-jobs')"), false)
    assert.equal(await avaliar("!!document.querySelector('.contador')"), false)
    await avaliar('feat38.falhas.clear(); feat38.atraso(350)')
    const consultasAntes = await avaliar("feat38.consultas.filter(c => c.url === '/api/freelances/').length")
    await avaliar("{const botao=document.querySelector('.erro-jobs button');botao.click();botao.click()}")
    await esperar("!!document.querySelector('.estado-jobs[role=status]')")
    assert.equal(await avaliar("!!document.querySelector('.vazio-jobs')"), false)
    await esperar("document.querySelectorAll('.home .card').length === 2 && !document.querySelector('.estado-jobs')")
    assert.equal(await avaliar("feat38.consultas.filter(c => c.url === '/api/freelances/').length"), consultasAntes + 1)
    await avaliar('feat38.atraso(0)')
    await ir('/freelances', "!!document.querySelector('.vaga')")
  }
  await avaliar("feat38.cenarioLista('vazia')")
  await ir('/home', "!!document.querySelector('.vazio-jobs')")
  assert.equal(await avaliar("!!document.querySelector('.erro-jobs')"), false)
  assert.equal(await avaliar("document.querySelectorAll('.home .card').length"), 0)
  await ir('/freelances', "document.body.textContent.includes('Nenhuma oportunidade encontrada')")
  await avaliar("feat38.cenarioLista('invalida')")
  await ir('/home', "document.querySelector('.erro-jobs')?.textContent.includes('listagem inválida')")
  await avaliar("feat38.cenarioLista('normal')")
  await clicar('.erro-jobs button')
  await esperar("document.querySelectorAll('.home .card').length === 2 && !document.querySelector('.estado-jobs')")
  console.log('PASSOU: Home distingue rede/403/500/resposta inválida de lista vazia, mostra carregamento e recupera com uma única consulta por nova tentativa.')
  assert.deepEqual(erros, [], erros.join('\n'))
  console.log('PASSOU: estado vazio, link para explorar e ausência de exceções JavaScript.')
  console.log(
    '13/13 cenários funcionais e 20 verificações de layout aprovados. Capturas: ' + artefatos,
  )
} finally {
  socket?.close()
  navegador.kill()
  await vite.close()
}
