// F50: páginas reais e shell integrado, transporte local compartilhado com a F49.
// Nenhuma conta ou API real é utilizada; mutações somente no transporte do cenário de seleção.
// --baseline lê a base integrada sem trocar branch nem alterar a árvore.
import assert from 'node:assert/strict'
import { spawn, execFileSync } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { setTimeout as wait } from 'node:timers/promises'
import { createServer } from 'vite'
import vue from '@vitejs/plugin-vue'

const baseline = process.argv.includes('--baseline')
const baselineRef = process.env.F50_BASE_REF || 'be21c6a'
const checksOnly = process.argv.includes('--checks-only')
const folder = resolve('node_modules/.cache/feat50-visual', baseline ? 'antes' : 'depois')
mkdirSync(folder, { recursive: true })
const runner = `
import {createApp,nextTick} from 'vue'
import {createPinia} from 'pinia'
import {createRouter,createMemoryHistory} from 'vue-router'
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome'
import {library} from '@fortawesome/fontawesome-svg-core'
import {fas} from '@fortawesome/free-solid-svg-icons'
import App from '/src/App.vue'
import {routes} from '/src/router/routes.js'
import {sessao} from '/src/services/authSession.js'
import api from '/src/services/api.js'
import {instalarFixtures} from '/tests/fixtures/responsividade.js'
import '/src/assets/main.css'
import '@fortawesome/fontawesome-free/css/all.min.css'
library.add(fas)
const params=new URLSearchParams(location.search),state=params.get('state')||'filled'
const fixture=instalarFixtures(api)
fixture.projetos[1].imagem=null
fixture.projetos[1].titulo='Projeto sem imagem com um título que precisa permanecer legível'
fixture.usuario.telefone='(47) 99999-9999'
if(state==='selection') {
 fixture.usuario.habilidades=['Vue','Conhecimento específico da conta']
 fixture.projetos[0].categoria='Categoria antiga'
 fixture.projetos[0].tags=['Tecnologia antiga']
}
sessao.usuario=fixture.usuario;sessao.tipo='usuario'
localStorage.setItem('token','teste-visual-local')
if(state==='empty') {fixture.jobs.splice(0);fixture.projetos.splice(0);localStorage.removeItem('marujobs:favoritos:usuario:49')}
const adapter=api.defaults.adapter
window.testRequests=[]
api.defaults.adapter=async config=>{
 window.testRequests.push({method:config.method,url:config.url,params:config.params,data:config.data})
 if(config.method!=='get') {
  if(state!=='selection')throw Error('Escrita proibida no teste visual')
  const data=typeof config.data==='string'?JSON.parse(config.data):config.data
  let result,status=200
  if(config.method==='patch'&&config.url==='usuarios/me/') {Object.assign(fixture.usuario,data);result=fixture.usuario}
  else if(config.method==='post'&&config.url==='portfolios/') {result={...data,id:4,usuario:49};fixture.projetos.push(result);status=201}
  else throw Error('Mutação não prevista no cenário de seleção')
  return {config,status,headers:{},data:result,statusText:''}
 }
 if(state==='loading')await new Promise(r=>setTimeout(r,60000))
 if(state==='error')throw Error('Falha simulada de transporte')
 return adapter(config)
}
const router=createRouter({history:createMemoryHistory(),routes})
await router.push(params.get('path')||'/home');await router.isReady()
createApp(App).use(createPinia()).use(router).component('FontAwesomeIcon',FontAwesomeIcon).mount('#app')
window.testRouter=router
await nextTick();await document.fonts.ready
document.body.dataset.ready='true'
`
const root = resolve('.').replaceAll('\\', '/') + '/'
const vite = await createServer({
  configFile: false,
  resolve: { alias: { '@': resolve('src') } },
  optimizeDeps: { noDiscovery: true, include: [] },
  plugins: [
    {
      name: 'f50-baseline',
      enforce: 'pre',
      load(id) {
        const file = id.replaceAll('\\', '/')
        if (!baseline || file.includes('?') || !file.startsWith(root)) return
        const path = file.slice(root.length)
        if (
          path.startsWith('src/components/') ||
          path === 'src/router/routes.js' ||
          path === 'src/views/HomeView.vue'
        )
          return execFileSync('git', ['show', baselineRef + ':' + path], { encoding: 'utf8' })
      },
    },
    vue(),
    {
      name: 'f50-visual-runner',
      resolveId(id) {
        if (id === '/__f50.js') return '\0f50'
      },
      load(id) {
        if (id === '\0f50') return runner
      },
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (!req.url.startsWith('/?')) return next()
          res.setHeader('Content-Type', 'text/html; charset=utf-8')
          res.end(
            '<!doctype html><html lang="pt-BR"><meta name="viewport" content="width=device-width, initial-scale=1"><link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet"><div id="app"></div><script type="module" src="/__f50.js"></script></html>',
          )
        })
      },
    },
  ],
  server: { host: '127.0.0.1', port: 5196, strictPort: true },
  appType: 'custom',
})
await vite.listen()
const chrome = spawn(
  process.env.CHROME_BIN || 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  [
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    `--user-data-dir=${resolve(folder, 'profile')}`,
    '--remote-debugging-port=19450',
    'about:blank',
  ],
  { stdio: 'ignore', windowsHide: true },
)
let ws,
  id = 0
const pending = new Map(),
  errors = [],
  results = []
chrome.on('error', (e) => errors.push(e.message))
async function cdp(method, params = {}) {
  return new Promise((resolve, reject) => {
    const key = ++id
    const timer = setTimeout(() => {
      pending.delete(key)
      reject(Error(method + ' timeout'))
    }, 15000)
    pending.set(key, {
      resolve: (r) => {
        clearTimeout(timer)
        resolve(r)
      },
      reject,
    })
    ws.send(JSON.stringify({ id: key, method, params }))
  })
}
async function evaluate(expression) {
  const result = await cdp('Runtime.evaluate', {
    expression,
    returnByValue: true,
    awaitPromise: true,
  })
  assert.ok(!result.exceptionDetails, JSON.stringify(result.exceptionDetails))
  return result.result.value
}
async function shot(name) {
  const { data } = await cdp('Page.captureScreenshot', {
    format: 'png',
    captureBeyondViewport: true,
  })
  writeFileSync(resolve(folder, name + '.png'), Buffer.from(data, 'base64'))
}
async function open(path, width, state = 'filled', height = 900) {
  await cdp('Emulation.setDeviceMetricsOverride', {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: false,
  })
  await cdp('Page.navigate', {
    url: `http://127.0.0.1:5196/?path=${encodeURIComponent(path)}&state=${state}`,
  })
  let ready = false
  for (let i = 0; i < 150; i++) {
    ready = await evaluate('document.body?.dataset.ready === "true"')
    if (ready) break
    await wait(100)
  }
  assert.ok(ready, 'Página não carregou: ' + path)
  await wait(path === '/home' ? 1500 : 250)
  await evaluate(
    'Promise.all([...document.images].map(e=>e.complete?Promise.resolve():new Promise(r=>{e.onload=r;e.onerror=r})))',
  )
}
try {
  let target
  for (let i = 0; i < 80; i++) {
    try {
      target = (await (await fetch('http://127.0.0.1:19450/json/list')).json()).find(
        (t) => t.type === 'page',
      )
    } catch {}
    if (target) break
    await wait(100)
  }
  assert.ok(target, 'Chrome indisponível: ' + errors.join('; '))
  ws = new WebSocket(target.webSocketDebuggerUrl)
  await new Promise((resolve, reject) => {
    ws.onopen = resolve
    ws.onerror = reject
  })
  ws.onmessage = ({ data }) => {
    const msg = JSON.parse(data),
      item = pending.get(msg.id)
    if (msg.method === 'Runtime.exceptionThrown') errors.push(JSON.stringify(msg.params))
    if (item) {
      pending.delete(msg.id)
      msg.error ? item.reject(Error(JSON.stringify(msg.error))) : item.resolve(msg.result)
    }
  }
  await cdp('Page.enable')
  await cdp('Runtime.enable')
  await cdp('Emulation.setFocusEmulationEnabled', { enabled: true })
  for (const path of checksOnly
    ? []
    : [
        '/home',
        '/freelances',
        '/oportunidade/2',
        '/favoritos',
        '/perfil',
        '/editar-perfil',
        '/portfolio',
        '/portfolio/1',
        '/portfolio/adicionar',
        '/portfolio/1/editar',
      ]) {
    for (const width of [375, 430, 768, 1024, 1440]) {
      await open(path, width)
      const metrics = await evaluate(`(()=>{
        const rect=e=>{const r=e.getBoundingClientRect();return {width:r.width,height:r.height}}
        return {scrollWidth:document.documentElement.scrollWidth,clientWidth:document.documentElement.clientWidth,
          content:rect(document.querySelector('.app-content')),
          cards:[...document.querySelectorAll('.mini-card,.vaga,.bloco-vaga,.grid .card')].map(rect),
          font:getComputedStyle(document.querySelector('main,.perfil,.editar-perfil,.portfolio,.portfolio-detalhe,.portfolio-add')).fontFamily,
          brokenImages:[...document.images].filter(e=>!e.naturalWidth).length,
          interactiveOverflow:[...document.querySelectorAll('main button,main a,fieldset button,fieldset input,fieldset textarea')].filter(e=>{const r=e.getBoundingClientRect();return !e.closest('.slide-scroll')&&r.width&&r.height&&(r.left<0||r.right>innerWidth)}).map(e=>e.textContent.trim())}
      })()`)
      if (!baseline) {
        assert.ok(metrics.scrollWidth <= width, `Overflow ${path} ${width}`)
        assert.equal(metrics.brokenImages, 0, `Imagem quebrada ${path}`)
        assert.deepEqual(metrics.interactiveOverflow, [], `Controle fora da tela ${path} ${width}`)
      }
      await shot(path.slice(1).replaceAll('/', '-') + '-' + width)
      if (!baseline) {
        const endSelectors = {
          '/home': '.btn-mais',
          '/freelances': '.paginacao',
          '/oportunidade/2': '.acoes',
          '/favoritos': '.bloco-vaga:last-child .details',
          '/perfil': '.config-item.sair',
          '/editar-perfil': '.btn-salvar',
          '/portfolio': '.grid .card:last-child',
          '/portfolio/1': '.acoes',
          '/portfolio/adicionar': '.acoes',
          '/portfolio/1/editar': '.acoes',
        }
        await evaluate('window.scrollTo(0,document.documentElement.scrollHeight)')
        assert.equal(
          await evaluate(
            `document.querySelector(${JSON.stringify(endSelectors[path])}).getBoundingClientRect().bottom <= document.querySelector('.app-navigation').getBoundingClientRect().top + 1`,
          ),
          true,
          `Navegação cobre ação final: ${path} ${width}`,
        )
      }
      results.push({ path, width, state: 'filled', ...metrics })
      console.log('LAYOUT', path, width, metrics.scrollWidth > width ? 'OVERFLOW' : 'OK')
    }
  }
  // Estados existentes, sem disparar salvamentos, candidaturas ou operações reais.
  for (const state of checksOnly ? [] : ['empty', 'loading', 'error']) {
    for (const path of [
      '/home',
      '/freelances',
      '/favoritos',
      '/perfil',
      '/editar-perfil',
      '/portfolio',
      '/portfolio/1',
    ]) {
      if (state === 'empty' && ['/editar-perfil', '/portfolio/1'].includes(path)) continue
      await open(path, 375, state)
      assert.equal(await evaluate('document.documentElement.scrollWidth <= innerWidth'), true)
      await shot(path.slice(1).replaceAll('/', '-') + '-' + state)
      results.push({ path, width: 375, state, overflow: false })
    }
  }
  for (const width of [375, 430, 768, 1024, 1440]) {
    await open('/freelances', width, 'filled', 600)
    await evaluate('document.querySelector(".botao-filtro").click()')
    await wait(300)
    const bounds = await evaluate(
      '(()=>{const r=document.querySelector(".filtros-painel").getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom}})()',
    )
    assert.ok(bounds.left >= 0 && bounds.right <= width && bounds.top >= 0 && bounds.bottom <= 600)
    assert.equal(await evaluate('document.activeElement.id'), 'filtro-tag')
    if (!baseline) {
      assert.equal(
        await evaluate(
          `(()=>{const e=document.querySelector('.aplicar'),r=e.getBoundingClientRect();return document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)?.closest('.aplicar')===e})()`,
        ),
        true,
        'Navegação cobre Aplicar filtros',
      )
    }
    await shot('filtros-' + width)
    await cdp('Input.dispatchKeyEvent', {
      type: 'keyDown',
      key: 'Escape',
      windowsVirtualKeyCode: 27,
    })
    assert.equal(await evaluate('document.querySelector(".filtros-painel") === null'), true)
    assert.equal(await evaluate('document.activeElement.classList.contains("botao-filtro")'), true)
    results.push({ path: 'filtros', width, state: 'open', bounds, keyboard: true })
  }
  if (!baseline) {
    await open('/freelances', 375)
    await evaluate(
      '(()=>{const e=document.querySelector("input[type=search]");e.value="aplicação web";e.dispatchEvent(new Event("input",{bubbles:true}))})()',
    )
    await wait(500)
    assert.equal(await evaluate('testRequests.at(-1).params.search'), 'aplicação web')
    assert.equal(
      await evaluate('document.querySelector("input[type=search]").value'),
      'aplicação web',
    )
    assert.equal(await evaluate('document.querySelector(".filtros-ativos")'), null)
    assert.equal(await evaluate('testRequests.at(-1).params.tag'), undefined)
    await shot('pesquisa-sem-tag')
    await evaluate(
      '(()=>{const e=document.querySelector("input[type=search]");e.value="";e.dispatchEvent(new Event("input",{bubbles:true}))})()',
    )
    await wait(500)
    assert.equal(await evaluate('testRequests.at(-1).params.search'), undefined)
    results.push({
      checks: 'Pesquisa permanece no campo, sem etiqueta; limpar refaz a consulta',
      passed: true,
    })

    await open('/freelances', 375, 'selection')
    const countBefore = await evaluate('testRequests.length')
    await evaluate('document.querySelector(".escolher-tag").click()')
    assert.equal(await evaluate('document.querySelector("#filtro-tag").tagName'), 'SELECT')
    assert.equal(await evaluate('document.querySelector("#preco-min")'), null)
    await evaluate(
      '(()=>{const e=document.querySelector("#filtro-tag");e.value="Mobile";e.dispatchEvent(new Event("change",{bubbles:true}))})()',
    )
    assert.equal(
      await evaluate('testRequests.length'),
      countBefore,
      'Abrir/escolher tag não deve aplicar filtros',
    )
    await evaluate('document.querySelector(".aplicar").click()')
    await wait(100)
    assert.equal(await evaluate('testRequests.at(-1).params.tag'), 'Mobile')
    assert.equal(await evaluate('document.activeElement.classList.contains("escolher-tag")'), true)
    await evaluate('document.querySelector(".botao-filtro").click()')
    assert.equal(
      await evaluate(
        '!!document.querySelector("#preco-min") && !!document.querySelector("#preco-max")',
      ),
      true,
    )
    await evaluate(
      'for(const [id,value] of [["preco-min","20"],["preco-max","500"]]){const e=document.getElementById(id);e.value=value;e.dispatchEvent(new Event("input",{bubbles:true}))};document.querySelector(".aplicar").click()',
    )
    await wait(100)
    await evaluate('document.querySelector(".escolher-tag").click()')
    await wait(300)
    await shot('tags-sem-preco')
    await evaluate(
      '(()=>{const e=document.querySelector("#filtro-tag");e.value="UI/UX";e.dispatchEvent(new Event("change",{bubbles:true}));document.querySelector(".aplicar").click()})()',
    )
    await wait(100)
    assert.deepEqual(await evaluate('testRequests.at(-1).params'), {
      page: 1,
      tag: 'UI/UX',
      preco_min: '20',
      preco_max: '500',
    })
    await evaluate('document.querySelector(".escolher-tag").click()')
    await wait(50)
    await evaluate('document.querySelector(".limpar").click()')
    await wait(100)
    assert.deepEqual(await evaluate('testRequests.at(-1).params'), {
      page: 1,
      preco_min: '20',
      preco_max: '500',
    })
    results.push({
      checks: 'Tag isolada, filtros completos, aplicação explícita e preços preservados',
      passed: true,
    })

    await open('/editar-perfil', 375, 'selection')
    assert.equal(await evaluate('document.querySelector("#perfil-habilidades").tagName'), 'SELECT')
    await evaluate(
      '(()=>{const e=document.querySelector("#perfil-habilidades");e.value="React";e.dispatchEvent(new Event("change",{bubbles:true}))})()',
    )
    await wait(50)
    assert.equal(await evaluate('document.querySelector("#perfil-habilidades").value'), '')
    assert.equal(
      await evaluate(
        '[...document.querySelectorAll(".habilidade")].some(e=>e.textContent.includes("React"))',
      ),
      true,
    )
    assert.equal(
      await evaluate(
        '[...document.querySelector("#perfil-habilidades").options].some(e=>e.value==="React")',
      ),
      false,
    )
    await evaluate(
      '[...document.querySelectorAll(".habilidade button")].find(e=>e.getAttribute("aria-label")==="Remover habilidade Conhecimento específico da conta").click()',
    )
    await wait(50)
    assert.equal(
      await evaluate(
        '[...document.querySelector("#perfil-habilidades").options].some(e=>e.value==="Conhecimento específico da conta")',
      ),
      true,
    )
    await evaluate(
      '(()=>{const e=document.querySelector("#perfil-habilidades");e.value="Conhecimento específico da conta";e.dispatchEvent(new Event("change",{bubbles:true}))})()',
    )
    await wait(50)
    await shot('perfil-selecao-habilidades')
    await evaluate('document.querySelector(".btn-salvar").click()')
    await wait(150)
    const savedProfile = await evaluate('JSON.parse(testRequests.find(e=>e.method==="patch").data)')
    assert.deepEqual(savedProfile.habilidades, ['Vue', 'React', 'Conhecimento específico da conta'])
    assert.equal(savedProfile.name, 'Marina Costa')
    results.push({
      checks: 'Seleção de habilidades, sem duplicação, valor antigo recuperável e PATCH existente',
      passed: true,
    })

    await open('/portfolio/1/editar', 375, 'selection')
    assert.equal(
      await evaluate('document.querySelector("#projeto-categoria").value'),
      'Categoria antiga',
    )
    assert.equal(await evaluate('document.querySelector("#projeto-tags").tagName'), 'SELECT')
    assert.equal(
      await evaluate('document.querySelector(".tags").textContent.includes("Tecnologia antiga")'),
      true,
    )
    await shot('portfolio-selecao-tags')
    await open('/portfolio/adicionar', 375, 'selection')
    await evaluate(
      'for(const [id,value] of [["projeto-titulo","Projeto por seleção"],["projeto-descricao","Descrição do projeto por seleção"]]){const e=document.getElementById(id);e.value=value;e.dispatchEvent(new Event("input",{bubbles:true}))};for(const [id,value] of [["projeto-categoria","Website"],["projeto-tags","Vue"]]){const e=document.getElementById(id);e.value=value;e.dispatchEvent(new Event("change",{bubbles:true}))}',
    )
    await wait(50)
    await evaluate('document.querySelector(".salvar").click()')
    await wait(150)
    const savedProject = await evaluate('JSON.parse(testRequests.find(e=>e.method==="post").data)')
    assert.deepEqual(savedProject.tags, ['Vue'])
    assert.equal(savedProject.categoria, 'Website')
    assert.equal(await evaluate('!!document.querySelector(".toast-sucesso")'), true)
    results.push({
      checks: 'Tags de projeto por seleção, categoria antiga preservada e POST existente',
      passed: true,
    })

    await open('/editar-perfil', 375)
    await evaluate('document.querySelector("input[aria-label=Nome]").focus()')
    const focus = await evaluate(
      `(()=>{const e=document.activeElement,c=getComputedStyle(e);return {tag:e.tagName,id:e.id,disabled:e.disabled,focus:e.matches(':focus'),visible:e.matches(':focus-visible'),outline:c.outline,token:c.getPropertyValue('--mrj-focus-width'),color:c.getPropertyValue('--mrj-color-focus')}})()`,
    )
    assert.match(focus.outline, /solid/, JSON.stringify(focus))
    await shot('editar-perfil-foco')
    await open('/portfolio/adicionar', 375)
    await evaluate('document.querySelector(".salvar").click()')
    assert.ok(await evaluate('document.querySelectorAll(".campo [role=alert]").length > 0'))
    await shot('portfolio-validacao')
    await open('/home', 375)
    assert.equal(
      await evaluate(
        'document.querySelector("#home-titulo").textContent.includes("Seu próximo projeto")',
      ),
      true,
    )
    assert.match(
      await evaluate('getComputedStyle(document.querySelector(".hero-linha")).animationName'),
      /hero-entrada/,
    )
    assert.ok(await evaluate('document.querySelectorAll(".mini-card.revelar-pendente").length > 0'))
    await evaluate(
      'document.querySelector(".mini-card:last-child").scrollIntoView({block:"center"})',
    )
    await wait(1100)
    assert.equal(
      await evaluate(
        'document.querySelector(".mini-card:last-child").classList.contains("revelar-visivel")',
      ),
      true,
    )
    assert.equal(
      await evaluate('getComputedStyle(document.querySelector(".mini-card:last-child")).opacity'),
      '1',
    )
    await shot('home-cards-animados')
    // A preferência também deve revelar imediatamente conteúdo que ainda aguardava a rolagem.
    await cdp('Emulation.setEmulatedMedia', {
      features: [{ name: 'prefers-reduced-motion', value: 'reduce' }],
    })
    assert.equal(
      await evaluate(
        '[...document.querySelectorAll(".home .revelar-pendente")].every(e=>getComputedStyle(e).opacity==="1" && getComputedStyle(e).transform==="none")',
      ),
      true,
    )
    await open('/freelances', 375)
    await evaluate('document.querySelector(".botao-filtro").click()')
    assert.equal(
      await evaluate('getComputedStyle(document.querySelector(".filtros-painel")).animationName'),
      'none',
    )
    await open('/home', 375)
    assert.equal(
      await evaluate('getComputedStyle(document.querySelector(".hero-linha")).animationName'),
      'none',
    )
    assert.equal(
      await evaluate(
        '[...document.querySelectorAll(".home-topbar,.hero-descricao,.hero-cta,.mini-card")].every(e=>getComputedStyle(e).animationName==="none" && getComputedStyle(e).opacity==="1")',
      ),
      true,
    )
    results.push({
      checks:
        'Entradas da Home, cards ao rolar e mudança de preferência respeitam movimento reduzido',
      passed: true,
    })
    results.push({ checks: 'focus, validation, reduced motion', passed: true })
  }
  assert.deepEqual(errors, [])
} finally {
  writeFileSync(
    resolve(folder, 'results.json'),
    JSON.stringify({ baseline, errors, results }, null, 2),
  )
  if (ws?.readyState === WebSocket.OPEN) {
    await cdp('Browser.close').catch(() => {})
    ws.close()
  }
  chrome.kill()
  await vite.close()
}
