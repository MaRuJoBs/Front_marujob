// Shell real, rotas locais e sessão em memória; nenhuma API ou conta real é utilizada.
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { setTimeout as wait } from 'node:timers/promises'
import { createServer } from 'vite'
import vue from '@vitejs/plugin-vue'

const folder = resolve('node_modules/.cache/feat49-browser')
mkdirSync(folder, { recursive: true })
const runner = `
import {createApp,h} from 'vue'
import {createPinia} from 'pinia'
import {createRouter,createMemoryHistory} from 'vue-router'
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome'
import {library} from '@fortawesome/fontawesome-svg-core'
import {fas} from '@fortawesome/free-solid-svg-icons'
import App from '/src/App.vue'
import Header from '/src/components/Header.vue'
import EmpresaHeader from '/src/components/EmpresaHeader.vue'
import {sessao} from '/src/services/authSession.js'
import {routes as realRoutes} from '/src/router/routes.js'
import api from '/src/services/api.js'
import '/src/assets/main.css'
library.add(fas)
const tipo=new URLSearchParams(location.search).get('tipo') || 'usuario'
const realPath=new URLSearchParams(location.search).get('path')
sessao.usuario={id:49,name:'Conta de teste'};sessao.tipo=tipo
localStorage.setItem('token','teste-local')
api.defaults.adapter=async config=>({config,status:200,headers:{},data:{count:0,results:[],next:null,previous:null}})
const Page={setup(){return ()=>h('div',[
 h(tipo==='empresa'?EmpresaHeader:Header,{voltar:true}),
 h('main',{style:'padding:16px;min-height:1200px'},[
 h('h1','Responsividade global — '+tipo),
 h('p','Shell e navegação reais. Conteúdo de teste local.'),
 h('details',[h('summary','Menu de teste'),h('a',{href:'#fim'},'Ir ao final')]),
 h('label',{for:'campo'},'Campo de teste'),h('input',{id:'campo'}),
 h('button',{id:'fim',style:'display:block;margin-top:950px'},'Última ação')])])}}
const router=createRouter({history:createMemoryHistory(),routes:realPath?realRoutes:[
 ...['/home','/homeEmpresa','/mensagens','/perfil','/freelances','/favoritos','/empresa/perfil','/empresa/notificacoes'].map(path=>({path,component:Page})),
 {path:'/',component:Page,meta:{hideFooter:true}}]})
await router.push(realPath || (tipo==='empresa'?'/homeEmpresa':'/home'))
await router.isReady()
createApp(App).use(createPinia()).use(router).component('FontAwesomeIcon',FontAwesomeIcon).mount('#app')
window.testRouter=router
await document.fonts.ready
document.body.dataset.ready='true'
`
const vite = await createServer({
  configFile: false,
  resolve: { alias: { '@': resolve('src') } },
  optimizeDeps: { noDiscovery: true, include: [] },
  plugins: [
    vue(),
    {
      name: 'feat49-shell-test',
      resolveId(id) {
        if (id === '/__feat49.js') return '\0feat49'
      },
      load(id) {
        if (id === '\0feat49') return runner
      },
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (!req.url.startsWith('/?')) return next()
          res.setHeader('Content-Type', 'text/html')
          res.end(
            '<!doctype html><html lang="pt-BR"><meta name="viewport" content="width=device-width, initial-scale=1"><div id="app"></div><script type="module" src="/__feat49.js"></script></html>',
          )
        })
      },
    },
  ],
  server: { host: '127.0.0.1', port: 5197, strictPort: true },
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
    '--remote-debugging-port=19449',
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
  const key = ++id
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      pending.delete(key)
      reject(Error('CDP timeout: ' + method))
    }, 10000)
    pending.set(key, {
      resolve: (value) => {
        clearTimeout(timer)
        resolve(value)
      },
      reject,
    })
    ws.send(JSON.stringify({ id: key, method, params }))
  })
}
async function evaluate(expression) {
  const r = await cdp('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
  assert.ok(!r.exceptionDetails, JSON.stringify(r.exceptionDetails))
  return r.result.value
}
try {
  let target
  for (let i = 0; i < 80; i++) {
    try {
      target = (await (await fetch('http://127.0.0.1:19449/json/list')).json()).find(
        (x) => x.type === 'page',
      )
    } catch {}
    if (target) break
    await wait(100)
  }
  assert.ok(target, 'Chrome indisponível: ' + errors.join(';'))
  ws = new WebSocket(target.webSocketDebuggerUrl)
  await new Promise((resolve, reject) => {
    ws.onopen = resolve
    ws.onerror = reject
  })
  ws.onmessage = ({ data }) => {
    const m = JSON.parse(data),
      item = pending.get(m.id)
    if (m.method === 'Runtime.exceptionThrown') errors.push(JSON.stringify(m.params))
    if (item) {
      pending.delete(m.id)
      m.error ? item.reject(Error(JSON.stringify(m.error))) : item.resolve(m.result)
    }
  }
  await cdp('Page.enable')
  await cdp('Runtime.enable')
  for (const tipo of ['usuario', 'empresa'])
    for (const width of [360, 390, 768, 1024, 1440]) {
      await cdp('Emulation.setDeviceMetricsOverride', {
        width,
        height: 900,
        deviceScaleFactor: 1,
        mobile: false,
      })
      await cdp('Page.navigate', { url: 'http://127.0.0.1:5197/?tipo=' + tipo })
      let ready = false
      for (let i = 0; i < 100; i++) {
        ready = await evaluate('document.body?.dataset.ready === "true"')
        if (ready) break
        await wait(100)
      }
      assert.ok(ready, 'Shell não carregou')
      await wait(150)
      assert.equal(
        await evaluate('document.documentElement.scrollWidth <= innerWidth'),
        true,
        `overflow ${tipo} ${width}`,
      )
      const shell = await evaluate('document.querySelector(".app").getBoundingClientRect().width')
      assert.equal(shell, Math.min(await evaluate('document.documentElement.clientWidth'), 1200))
      assert.equal(
        await evaluate(
          '[...document.querySelectorAll(".app-navigation .item")].every(e=>{const r=e.getBoundingClientRect();return r.width>=44&&r.height>=44&&r.left>=0&&r.right<=innerWidth})',
        ),
        true,
      )
      await evaluate('document.querySelector("details summary").click()')
      assert.equal(await evaluate('document.querySelector("details").open'), true)
      const shot = await cdp('Page.captureScreenshot', { format: 'png' })
      writeFileSync(resolve(folder, `${tipo}-${width}.png`), Buffer.from(shot.data, 'base64'))
      await evaluate('window.scrollTo(0,document.documentElement.scrollHeight)')
      assert.equal(
        await evaluate(
          'document.querySelector("#fim").getBoundingClientRect().bottom <= document.querySelector(".app-navigation").getBoundingClientRect().top',
        ),
        true,
        'footer cobre final',
      )
      await cdp('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Tab', windowsVirtualKeyCode: 9 })
      await cdp('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Tab', windowsVirtualKeyCode: 9 })
      await evaluate('document.querySelector(".app-navigation a").focus()')
      assert.equal(await evaluate('getComputedStyle(document.activeElement).outlineStyle'), 'solid')
      await evaluate('document.querySelectorAll(".app-navigation a")[1].click()')
      assert.equal(
        await evaluate('window.testRouter.currentRoute.value.path'),
        tipo === 'empresa' ? '/mensagens' : '/freelances',
      )
      await evaluate('window.testRouter.push("/")')
      assert.equal(await evaluate('document.querySelector(".app-navigation") === null'), true)
      assert.equal(
        await evaluate('getComputedStyle(document.querySelector(".app")).paddingBottom'),
        '0px',
      )
      results.push({ tipo, width, shell, overflow: false, navigation: true, endVisible: true })
      console.log('PASS', tipo, width)
    }
  assert.deepEqual(errors, [])
  for (const [tipo, path] of [
    ['usuario', '/home'],
    ['usuario', '/freelances'],
    ['empresa', '/homeEmpresa'],
    ['empresa', '/criar-vaga'],
  ]) {
    for (const width of [360, 390, 768, 1024, 1440]) {
      await cdp('Emulation.setDeviceMetricsOverride', {
        width,
        height: 900,
        deviceScaleFactor: 1,
        mobile: false,
      })
      await cdp('Page.navigate', {
        url: 'http://127.0.0.1:5197/?tipo=' + tipo + '&path=' + encodeURIComponent(path),
      })
      let ready = false
      for (let i = 0; i < 100; i++) {
        ready = await evaluate('document.body?.dataset.ready === "true"')
        if (ready) break
        await wait(100)
      }
      assert.ok(ready, 'Página real não carregou: ' + path)
      await wait(150)
      const overflow = await evaluate('document.documentElement.scrollWidth > innerWidth')
      assert.equal(overflow, false, `Overflow em ${path} a ${width}px`)
      const shot = await cdp('Page.captureScreenshot', { format: 'png' })
      writeFileSync(
        resolve(folder, `real-${path.slice(1)}-${width}.png`),
        Buffer.from(shot.data, 'base64'),
      )
      results.push({ tipo, path, width, overflow })
      console.log('REAL', path, width, 'overflow:', overflow)
    }
  }
  assert.deepEqual(errors, [])
  writeFileSync(resolve(folder, 'results.json'), JSON.stringify(results, null, 2))
} finally {
  if (ws?.readyState === WebSocket.OPEN) {
    await cdp('Browser.close').catch(() => {})
    ws.close()
  }
  chrome.kill()
  await vite.close()
}
