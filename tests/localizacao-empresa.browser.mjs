// Chromium real com componentes reais; GPS, geocodificação e API empresarial isolados.
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { setTimeout as wait } from 'node:timers/promises'
import { createServer } from 'vite'
import vue from '@vitejs/plugin-vue'

const folder = resolve('node_modules/.cache/feat58-browser')
mkdirSync(folder, { recursive: true })
const runner = `
import {createApp,nextTick} from 'vue'
import {createPinia} from 'pinia'
import {createRouter,createMemoryHistory} from 'vue-router'
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome'
import {library} from '@fortawesome/fontawesome-svg-core'
import {fas} from '@fortawesome/free-solid-svg-icons'
import {AxiosError} from 'axios'
import App from '/src/App.vue'
import {routes} from '/src/router/routes.js'
import {sessao,limparSessao} from '/src/services/authSession.js'
import api from '/src/services/api.js'
import geo from '/src/services/geocodingApi.js'
import '/src/assets/main.css'
import '@fortawesome/fontawesome-free/css/all.min.css'
library.add(fas)
window.banco={empresa:1,name:'Empresa de teste',cidade:'Blumenau',uf:'SC'}
window.chamadas=[];window.falha=null;window.ignorar=false
window.gpsRequests=0;window.gpsFailure=null;window.deferGps=false;window.deferReverse=false
Object.defineProperty(navigator,'geolocation',{configurable:true,value:{getCurrentPosition(ok,erro){
 window.gpsRequests++
 if(window.gpsFailure){erro({code:window.gpsFailure});return}
 const pos={coords:{latitude:-26.3,longitude:-48.8,accuracy:5},timestamp:Date.now()}
 if(window.deferGps)window.liberarGps=()=>ok(pos);else ok(pos)
}}})
geo.reverse=async()=>{
 if(window.deferReverse)await new Promise(resolve=>window.liberarEndereco=resolve)
 return {cidade:'Joinville',uf:'SC',label:'Joinville, SC'}
}
api.defaults.adapter=async config=>{
 window.chamadas.push({method:config.method,url:config.url,data:config.data})
 if(config.method==='patch'){
  if(window.falha)throw new AxiosError('Falha isolada','ERR_BAD_RESPONSE',config,null,{status:window.falha,data:{cidade:['Cidade inválida no teste.']},headers:{},config})
  if(!window.ignorar)Object.assign(window.banco,JSON.parse(config.data))
 }
 return {config,status:200,data:{...window.banco},headers:{}}
}
localStorage.setItem('token','f58-somente-teste')
sessao.tipo='empresa';sessao.usuario={id:1,groups:['Empresa']}
const router=createRouter({history:createMemoryHistory(),routes})
await router.push('/empresa/perfil');await router.isReady()
createApp(App).use(createPinia()).use(router).component('FontAwesomeIcon',FontAwesomeIcon).mount('#app')
window.router=router;window.sair=limparSessao
await nextTick();document.body.dataset.ready='true'
`
const vite = await createServer({
  configFile: false,
  resolve: { alias: { '@': resolve('src') } },
  optimizeDeps: { noDiscovery: true, include: [] },
  plugins: [
    vue(),
    {
      name: 'f58-localizacao-test',
      resolveId: (id) => (id === '/__f58.js' ? '\0f58' : undefined),
      load: (id) => (id === '\0f58' ? runner : undefined),
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url !== '/') return next()
          res.setHeader('Content-Type', 'text/html; charset=utf-8')
          res.end(
            '<!doctype html><html lang="pt-BR"><meta name="viewport" content="width=device-width,initial-scale=1"><title>FEAT-58 teste local</title><div id="app"></div><script type="module" src="/__f58.js"></script></html>',
          )
        })
      },
    },
  ],
  server: { host: '127.0.0.1', port: 5198, strictPort: true },
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
    '--remote-debugging-port=19458',
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
      resolve: (value) => {
        clearTimeout(timer)
        resolve(value)
      },
      reject: (error) => {
        clearTimeout(timer)
        reject(error)
      },
    })
    ws.send(JSON.stringify({ id: key, method, params }))
  })
}
async function evaluate(expression) {
  const r = await cdp('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
  assert.ok(!r.exceptionDetails, JSON.stringify(r.exceptionDetails))
  return r.result.value
}
async function until(expression) {
  for (let i = 0; i < 100; i++) {
    if (await evaluate(expression)) return
    await wait(50)
  }
  assert.fail('Timeout: ' + expression)
}
async function click(text) {
  assert.ok(
    await evaluate(
      `(()=>{const b=[...document.querySelectorAll('button')].find(b=>b.textContent.trim()===${JSON.stringify(text)});if(!b||b.disabled)return false;b.click();return true})()`,
    ),
    text,
  )
  await wait(30)
}
async function open(width = 375) {
  await cdp('Emulation.setDeviceMetricsOverride', {
    width,
    height: 812,
    deviceScaleFactor: 1,
    mobile: false,
  })
  await cdp('Page.navigate', { url: 'http://127.0.0.1:5198/' })
  await until(
    'document.body?.dataset.ready==="true" && !!document.querySelector(".cabecalho-institucional")',
  )
  await click('Editar informações')
}
const record = (name) => results.push(name)
try {
  let target
  for (let i = 0; i < 80; i++) {
    try {
      target = (await (await fetch('http://127.0.0.1:19458/json/list')).json()).find(
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
    if (msg.method === 'Runtime.consoleAPICalled' && ['error', 'warning'].includes(msg.params.type))
      errors.push(msg.params.args.map((a) => a.value || a.description).join(' '))
    if (item) {
      pending.delete(msg.id)
      msg.error ? item.reject(Error(JSON.stringify(msg.error))) : item.resolve(msg.result)
    }
  }
  await cdp('Page.enable')
  await cdp('Runtime.enable')
  for (const width of [320, 375, 768, 1440]) {
    await open(width)
    assert.equal(await evaluate('window.gpsRequests'), 0)
    assert.equal(
      await evaluate(
        '!!document.querySelector("[role=combobox], [data-cidade-manual], .empresa-localizacao select")',
      ),
      false,
    )
    assert.equal(
      await evaluate('document.documentElement.scrollWidth>innerWidth'),
      false,
      `overflow ${width}`,
    )
    await click('Usar minha localização atual')
    await until('!!document.querySelector(".confirmada")')
    assert.ok(
      await evaluate(
        'document.querySelector(".cidade-atual").textContent.includes("Joinville — SC")',
      ),
    )
    assert.equal(await evaluate('window.gpsRequests'), 1)
    assert.equal(await evaluate('window.chamadas.filter(c=>c.method==="patch").length'), 0)
    if (width === 375) {
      await evaluate('scrollTo(0,0)')
      if (!process.argv.includes('--sem-capturas')) {
        const { data } = await cdp('Page.captureScreenshot', {
          format: 'png',
          captureBeyondViewport: true,
        })
        writeFileSync(resolve(folder, 'editar-perfil-empresa.png'), Buffer.from(data, 'base64'))
      }
    }
    await click('Salvar alterações')
    await until('!!document.querySelector(".cabecalho-institucional")')
    assert.equal(await evaluate('window.banco.cidade'), 'Joinville')
    assert.deepEqual(
      await evaluate('JSON.parse(window.chamadas.find(c=>c.method==="patch").data)'),
      { cidade: 'Joinville' },
    )
    if (width === 375) {
      await evaluate('scrollTo(0,0)')
      if (!process.argv.includes('--sem-capturas')) {
        const { data } = await cdp('Page.captureScreenshot', {
          format: 'png',
          captureBeyondViewport: true,
        })
        writeFileSync(resolve(folder, 'perfil-empresa.png'), Buffer.from(data, 'base64'))
      }
    }
    await evaluate('window.router.push("/empresa/configuracoes")')
    await wait(50)
    await evaluate('window.router.push("/empresa/perfil")')
    await until('!!document.querySelector(".cabecalho-institucional")')
    assert.ok(
      await evaluate(
        'document.querySelector(".localizacao").textContent.includes("Joinville — SC")',
      ),
    )
    record(
      `GPS, cidade/UF, PATCH mínimo, releitura, ausência de seleção manual e largura ${width}px`,
    )
  }

  await open()
  await evaluate('window.gpsFailure=1')
  await click('Usar minha localização atual')
  assert.ok(
    await evaluate(
      'document.querySelector(".empresa-localizacao .erro").textContent.includes("negou")',
    ),
  )
  assert.ok(
    await evaluate('document.querySelector(".cidade-atual").textContent.includes("Blumenau")'),
  )
  await evaluate('window.gpsFailure=null;window.deferGps=true;window.deferReverse=true')
  await click('Usar minha localização atual')
  assert.ok(
    await evaluate(
      'document.querySelector(".btn-gps").disabled && document.querySelector(".btn-gps").textContent.includes("Obtendo localização")',
    ),
  )
  await click('Salvar alterações')
  assert.equal(await evaluate('window.chamadas.filter(c=>c.method==="patch").length'), 0)
  await evaluate('window.liberarGps()')
  await until('document.querySelector(".btn-gps").textContent.includes("Identificando cidade")')
  await evaluate('window.liberarEndereco()')
  await until('!!document.querySelector(".confirmada")')
  assert.equal(
    await evaluate('document.querySelector(".empresa-localizacao .erro").textContent.trim()'),
    '',
  )
  await evaluate('window.falha=503')
  await click('Salvar alterações')
  assert.ok(
    await evaluate('!!document.querySelector(".confirmada") && !!document.querySelector("form")'),
  )
  await evaluate('window.falha=null;window.ignorar=true')
  await click('Salvar alterações')
  assert.ok(
    await evaluate(
      'document.body.textContent.includes("O servidor não confirmou a localização enviada")',
    ),
  )
  await evaluate('window.ignorar=false')
  await click('Salvar alterações')
  await until('!!document.querySelector(".cabecalho-institucional")')
  assert.equal(await evaluate('window.banco.cidade'), 'Joinville')
  record(
    'Permissão negada, nova tentativa, estados do GPS/geocodificador, bloqueio durante captura, falha no PATCH e resposta sem persistência',
  )

  await click('Editar informações')
  await click('Remover localização')
  await click('Descartar alteração de localização')
  await click('Cancelar')
  assert.equal(await evaluate('window.banco.cidade'), 'Joinville')
  await click('Editar informações')
  await click('Remover localização')
  await click('Salvar alterações')
  await until('!!document.querySelector(".cabecalho-institucional")')
  assert.equal(await evaluate('window.banco.cidade'), '')
  assert.equal(await evaluate('window.banco.uf'), '')
  record('Descartar, cancelar e remover a localização')

  await open()
  await evaluate('window.deferReverse=true')
  await click('Usar minha localização atual')
  await until('document.querySelector(".btn-gps").textContent.includes("Identificando cidade")')
  await click('Descartar alteração de localização')
  await evaluate('window.liberarEndereco()')
  await wait(30)
  assert.equal(await evaluate('!!document.querySelector(".confirmada")'), false)
  assert.ok(
    await evaluate('document.querySelector(".cidade-atual").textContent.includes("Blumenau")'),
  )
  record('Descartar GPS em andamento ignora resposta atrasada e preserva localização')
  assert.deepEqual(errors, [])
} finally {
  writeFileSync(resolve(folder, 'results.json'), JSON.stringify({ results, errors }, null, 2))
  if (ws?.readyState === WebSocket.OPEN) {
    await cdp('Browser.close').catch(() => {})
    ws.close()
  }
  chrome.kill()
  await vite.close()
}
console.log(
  `${results.length} cenários FEAT-58 aprovados; ${errors.length} erros/avisos de console.`,
)
