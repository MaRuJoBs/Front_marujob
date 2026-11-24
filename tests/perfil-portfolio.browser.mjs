// Navegador local com API simulada: não acessa contas ou storage de produção.
import { createServer } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'node:path'
import { mkdirSync, mkdtempSync, writeFileSync, existsSync } from 'node:fs'
import { spawn } from 'node:child_process'
import assert from 'node:assert/strict'
import { setTimeout as esperar } from 'node:timers/promises'
const chrome = process.env.CHROME_BIN || 'C:/Program Files/Google/Chrome/Application/chrome.exe'
assert.ok(existsSync(chrome), 'Configure CHROME_BIN.')
const pasta = resolve('node_modules/.cache/feat40-browser')
mkdirSync(pasta, { recursive: true })
const roteiro = `
import {createApp,nextTick} from 'vue'
import {createPinia} from 'pinia'
import {createRouter,createMemoryHistory} from 'vue-router'
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome'
import {library} from '@fortawesome/fontawesome-svg-core'
import {fas} from '@fortawesome/free-solid-svg-icons'
import '/src/assets/main.css'
import '@fortawesome/fontawesome-free/css/all.min.css'
import App from '/src/App.vue'
import {routes} from '/src/router/routes.js'
import api from '/src/services/api.js'
import {sessao} from '/src/services/authSession.js'
library.add(fas)
api.defaults.baseURL='/api/'
const user={id:1,name:'Nome de teste visual',profissao:'Profissão cadastrada',localizacao:'Cidade cadastrada, SC',sobre:'Descrição profissional de teste visual. '.repeat(10),email:'email.longo@exemplo.test',telefone:'123',habilidades:['Vue','API'],profile_image:'/__imagem40?aspect=portrait'}
const projeto={id:1,titulo:'Projeto com título longo '.repeat(5),categoria:'Categoria cadastrada',descricao:'Descrição longa. '.repeat(30),tags:['Vue','API'],link:'https://example.com',imagem:'/__imagem40?aspect=wide'}
sessao.usuario=user;sessao.tipo='usuario';localStorage.setItem('token','somente-teste')
window.WebSocket=class {
 static OPEN=1
 readyState=0
 constructor(){queueMicrotask(()=>{this.readyState=1;this.onopen?.()})}
 send(){}
 close(){this.readyState=3}
}
let deletes=0
api.defaults.adapter=async config=>{
 let data,status=200
 if(config.url==='usuarios/me/') data=user
 else if(config.method==='delete'){deletes++;data='';status=204}
 else if(config.url.includes('/1/'))data=projeto
 else data={count:2,next:config.url.includes('page=2')?null:'?page=2',results:[{...projeto,id:config.url.includes('page=2')?2:1}]}
 return {config,status,data,headers:{},statusText:''}
}
const router=createRouter({history:createMemoryHistory(),routes})
await router.push(new URLSearchParams(location.search).get('route')||'/perfil');await router.isReady()
const app=createApp(App);app.use(createPinia());app.use(router);app.component('FontAwesomeIcon',FontAwesomeIcon);app.mount('#app')
await new Promise(r=>setTimeout(r,150));await nextTick();await document.fonts.ready
await Promise.all([...document.images].map(img=>{
 img.loading='eager'
 return img.complete?Promise.resolve():new Promise(r=>{img.onload=r;img.onerror=r})
}))
if([...document.images].some(img=>!img.naturalWidth)) throw Error('Fixture de imagem não carregou')
window.teste={router,get deletes(){return deletes}}
document.body.dataset.pronto='sim'
`
const vite = await createServer({
  configFile: false,
  cacheDir: resolve('node_modules/.cache/f43/vite-perfil-portfolio'),
  optimizeDeps: { noDiscovery: true, include: [] },
  plugins: [
    vue(),
    {
      name: 'feat40-harness',
      resolveId(id) {
        if (id === '/__runner40.js') return '\0feat40-runner'
      },
      load(id) {
        if (id === '\0feat40-runner') return roteiro
      },
      configureServer(s) {
        s.middlewares.use('/__imagem40', (req, res) => {
          const portrait = req.url.includes('portrait')
          res.setHeader('Content-Type', 'image/svg+xml')
          res.end(
            '<svg xmlns="http://www.w3.org/2000/svg" width="' +
              (portrait ? 40 : 300) +
              '" height="' +
              (portrait ? 120 : 80) +
              '"><rect width="100%" height="100%" fill="#b9a0e8"/><circle cx="20" cy="30" r="15" fill="#663399"/></svg>',
          )
        })
        s.middlewares.use('/__feat40', (req, res) => {
          res.setHeader('Content-Type', 'text/html; charset=utf-8')
          res.end(
            '<!doctype html><html lang="pt-BR"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0}*{box-sizing:border-box}</style><body><div id="app"></div><script type="module" src="/__runner40.js"></script></body></html>',
          )
        })
      },
    },
  ],
  resolve: { alias: { '@': resolve('src') } },
  server: { host: '127.0.0.1', port: 5290, strictPort: true },
  appType: 'custom',
})
await vite.listen()
const proc = spawn(
  chrome,
  [
    '--headless=new',
    '--disable-gpu',
    '--disable-background-timer-throttling',
    '--disable-renderer-backgrounding',
    '--no-first-run',
    '--no-default-browser-check',
    `--user-data-dir=${mkdtempSync(resolve(pasta, 'chrome-profile-'))}`,
    '--remote-debugging-port=19694',
    'about:blank',
  ],
  { windowsHide: true, stdio: 'ignore' },
)
let ws,
  id = 0
const pendentes = new Map()
const erros = []
async function cdp(method, params = {}) {
  const numero = ++id
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      pendentes.delete(numero)
      reject(Error('CDP timeout: ' + method))
    }, 20000)
    pendentes.set(numero, { resolve, reject, timer })
    ws.send(JSON.stringify({ id: numero, method, params }))
  })
}
async function avaliar(expression) {
  const r = await cdp('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
  if (r.exceptionDetails) throw Error(JSON.stringify(r.exceptionDetails))
  return r.result.value
}
try {
  let target
  for (let i = 0; i < 80; i++) {
    try {
      target = (await (await fetch('http://127.0.0.1:19694/json/list')).json()).find(
        (t) => t.type === 'page',
      )
      if (target) break
    } catch {}
    await esperar(100)
  }
  assert.ok(target, 'Depuração Chrome indisponível')
  ws = new WebSocket(target.webSocketDebuggerUrl)
  await new Promise((r, j) => {
    ws.onopen = r
    ws.onerror = j
  })
  ws.onmessage = (event) => {
    const m = JSON.parse(event.data)
    if (m.method === 'Runtime.exceptionThrown')
      erros.push(m.params.exceptionDetails.exception?.description ?? m.params.exceptionDetails.text)
    const p = pendentes.get(m.id)
    if (p) {
      clearTimeout(p.timer)
      pendentes.delete(m.id)
      m.error ? p.reject(Error(JSON.stringify(m.error))) : p.resolve(m.result)
    }
  }
  await cdp('Page.enable')
  await cdp('Runtime.enable')
  let total = 0
  for (const largura of [320, 375, 768, 1280])
    for (const route of [
      '/perfil',
      '/editar-perfil',
      '/portfolio',
      '/portfolio/adicionar',
      '/portfolio/1/editar',
      '/portfolio/1',
    ]) {
      await cdp('Emulation.setDeviceMetricsOverride', {
        width: largura,
        height: 900,
        deviceScaleFactor: 1,
        mobile: largura < 500,
      })
      const url = 'http://127.0.0.1:5290/__feat40?route=' + encodeURIComponent(route) + '&largura=' + largura
      await cdp('Page.navigate', { url })
      let pronto = false
      for (let i = 0; i < 100; i++) {
        await esperar(100)
        const leitura = await cdp('Runtime.evaluate', {
          expression: `location.href === ${JSON.stringify(url)} && document.body?.dataset.pronto === 'sim'`,
          returnByValue: true,
        })
        pronto = leitura.result?.value === true
        if (pronto) break
      }
      assert.ok(pronto, route + ' carregamento. Exceções: ' + erros.join('; '))
      const medidas = await avaliar(
        '({largura:innerWidth,scroll:document.documentElement.scrollWidth,texto:document.body.innerText})',
      )
      assert.ok(
        medidas.scroll <= medidas.largura,
        route + ' overflow ' + largura + ' ' + medidas.scroll,
      )
      assert.ok(!medidas.texto.includes('falta alterar'))
      assert.equal(await avaliar("Boolean(document.querySelector('.app-navigation')?.getClientRects().length)"), largura < 1024)
      assert.equal(await avaliar("Boolean(document.querySelector('.desktop-nav')?.getClientRects().length)"), largura >= 1024)
      if (route === '/editar-perfil' && largura < 500) {
        await cdp('Emulation.setDeviceMetricsOverride', {
          width: largura,
          height: 400,
          deviceScaleFactor: 1,
          mobile: true,
        })
        assert.ok(
          await avaliar(
            "document.querySelector('input').focus();document.querySelector('input').scrollIntoView();document.documentElement.scrollWidth<=innerWidth",
          ),
        )
        await cdp('Emulation.setDeviceMetricsOverride', {
          width: largura,
          height: 900,
          deviceScaleFactor: 1,
          mobile: true,
        })
        await avaliar('scrollTo(0,0)')
      }
      if (route === '/portfolio/1') {
        await avaliar("document.querySelector('button.excluir').click()")
        assert.equal(await avaliar("document.querySelector('dialog').open"), true)
        assert.equal(await avaliar('document.activeElement.textContent.trim()'), 'Cancelar')
        if (!process.argv.includes('--sem-capturas')) {
          const shot = await cdp('Page.captureScreenshot', { format: 'png' })
          writeFileSync(
            resolve(pasta, 'dialogo-' + largura + '.png'),
            Buffer.from(shot.data, 'base64'),
          )
        }
        await avaliar("document.querySelector('dialog button').click()")
        assert.equal(await avaliar('window.teste.deletes'), 0)
      }
      if (route === '/portfolio/adicionar' && largura === 375) {
        const { root } = await cdp('DOM.getDocument')
        const { nodeId } = await cdp('DOM.querySelector', { nodeId: root.nodeId, selector: 'input[type=file]' })
        assert.ok(nodeId, 'Campo de imagem do projeto')
        await cdp('DOM.setFileInputFiles', {
          nodeId, files: [resolve('src/assets/images/logo.png')],
        })
        assert.ok(await avaliar(`(async () => {
          await new Promise(r => setTimeout(r, 150))
          return [...document.images].some(img => img.src.startsWith('blob:') && img.naturalWidth > 0)
        })()`), 'O arquivo aceito aparece na prévia do projeto')
      }
      if (!process.argv.includes('--sem-capturas')) {
        const shot = await cdp('Page.captureScreenshot', { format: 'png' })
        writeFileSync(
          resolve(pasta, route.replaceAll('/', '-') + '-' + largura + '.png'),
          Buffer.from(shot.data, 'base64'),
        )
      }
      console.log('PASSOU', route, largura)
      total++
    }
  assert.deepEqual(erros, [])
  console.log(total + '/24 cenários responsivos aprovados.')
} finally {
  ws?.close()
  proc.kill()
  await vite.close()
}
