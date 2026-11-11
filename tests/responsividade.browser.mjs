// Shell real, rotas locais e sessão em memória; nenhuma API ou conta real é utilizada.
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { setTimeout as wait } from 'node:timers/promises'
import { createServer } from 'vite'
import vue from '@vitejs/plugin-vue'

const audit = process.env.F49_AUDIT !== '0'
const snapshot = process.env.F49_REF
const comparisonOnly = process.env.F49_COMPARE_ONLY === '1'
const folder = resolve('node_modules/.cache/feat49-browser', audit ? snapshot || 'corrigido' : '.')
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
import {instalarFixtures} from '/tests/fixtures/responsividade.js'
import '/src/assets/main.css'
library.add(fas)
const tipo=new URLSearchParams(location.search).get('tipo') || 'usuario'
const realPath=new URLSearchParams(location.search).get('path')
sessao.usuario={id:49,name:'Conta de teste'};sessao.tipo=tipo
localStorage.setItem('token','teste-local')
api.defaults.adapter=async config=>({config,status:200,headers:{},data:{count:0,results:[],next:null,previous:null}})
if(new URLSearchParams(location.search).has('filled')) Object.assign(sessao.usuario,instalarFixtures(api).usuario)
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
 {path:'/amplo',component:Page,meta:{layout:'wide'}},
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
    {
      name: 'feat49-read-only-snapshot',
      enforce: 'pre',
      load(id) {
        const path = id.replaceAll('\\', '/').split('?')[0]
        const root = resolve('.').replaceAll('\\', '/') + '/'
        if (!snapshot || id.includes('?') || !path.startsWith(root)) return
        const relative = path.slice(root.length)
        if (
          [
            'src/App.vue',
            'src/components/Header.vue',
            'src/components/EmpresaHeader.vue',
            'src/components/Footer.vue',
            'src/components/FooterEmpresaComponent.vue',
            'src/styles/shell.css',
          ].includes(relative)
        )
          return execFileSync('git', ['show', snapshot + ':' + relative], { encoding: 'utf8' })
      },
    },
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
  if (!snapshot && !comparisonOnly)
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
        await cdp('Input.dispatchKeyEvent', {
          type: 'keyDown',
          key: 'Tab',
          windowsVirtualKeyCode: 9,
        })
        await cdp('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Tab', windowsVirtualKeyCode: 9 })
        await evaluate('document.querySelector(".app-navigation a").focus()')
        assert.equal(
          await evaluate('getComputedStyle(document.activeElement).outlineStyle'),
          'solid',
        )
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
        await evaluate('window.testRouter.push("/amplo")')
        const available = await evaluate('document.documentElement.clientWidth')
        assert.equal(
          await evaluate('document.querySelector(".app-content").getBoundingClientRect().width'),
          Math.min(available, width >= 768 ? 1200 : 420),
        )
        assert.equal(
          await evaluate(
            'getComputedStyle(document.querySelector("main")).getPropertyValue("--mrj-font-family").trim()',
          ),
          '',
          'Tokens vazaram para página antiga',
        )
        console.log('PASS', tipo, width)
      }
  assert.deepEqual(errors, [])
  if (!snapshot && !comparisonOnly)
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
  if (audit && !comparisonOnly) {
    for (const [tipo, path] of [
      ['usuario', '/home'],
      ['usuario', '/freelances'],
      ['usuario', '/oportunidade/2'],
      ['usuario', '/favoritos'],
      ['usuario', '/perfil'],
      ['usuario', '/portfolio'],
      ['empresa', '/homeEmpresa'],
      ['empresa', '/criar-vaga'],
      ['empresa', '/editar-vaga/2'],
      ['empresa', '/empresa/vagas/2'],
      ['empresa', '/empresa/perfil'],
    ].filter(
      ([, path]) => !process.env.F49_PATHS || process.env.F49_PATHS.split(',').includes(path),
    ))
      for (const width of [320, 360, 390, 420, 768, 1024, 1440]) {
        await cdp('Emulation.setDeviceMetricsOverride', {
          width,
          height: 900,
          deviceScaleFactor: 1,
          mobile: false,
        })
        await cdp('Page.navigate', {
          url: 'http://127.0.0.1:5197/?filled=1&tipo=' + tipo + '&path=' + encodeURIComponent(path),
        })
        let ready = false
        for (let i = 0; i < 100; i++) {
          ready = await evaluate('document.body?.dataset.ready === "true"')
          if (ready) break
          await wait(50)
        }
        assert.ok(ready, path)
        await wait(200)
        await evaluate(
          'Promise.all([...document.images].map(e=>e.complete?Promise.resolve():new Promise(r=>{e.onload=r;e.onerror=r})))',
        )
        const metrics = await evaluate(`(()=>{
        const rect=s=>{const e=document.querySelector(s);if(!e)return null;const r=e.getBoundingClientRect(),c=getComputedStyle(e);return {x:r.x,y:r.y,width:r.width,height:r.height,paddingBottom:c.paddingBottom,fontSize:c.fontSize,columns:c.gridTemplateColumns}}
        return {viewport:innerWidth,client:document.documentElement.clientWidth,scrollWidth:document.documentElement.scrollWidth,scrollHeight:document.documentElement.scrollHeight,
          shell:rect('.app'),content:rect('.app-content'),header:rect('.header, .empresa-header'),slogan:rect('.slogan'),
          card:rect('.card, .job-card, .vaga, .box, .portfolio-card'),grid:rect('.grid-oportunidades'),
          footer:rect('footer'),main:rect('main'),images:[...document.querySelectorAll('img')].map(e=>({width:e.width,height:e.height,naturalWidth:e.naturalWidth,naturalHeight:e.naturalHeight}))}
      })()`)
        const file = path.slice(1).replaceAll('/', '-') + '-' + width
        const shot = await cdp('Page.captureScreenshot', { format: 'png' })
        writeFileSync(resolve(folder, file + '.png'), Buffer.from(shot.data, 'base64'))
        if (!snapshot) {
          assert.ok(metrics.scrollWidth <= width, 'Overflow em página preenchida: ' + path)
          assert.ok(
            metrics.card ||
              path.includes('vaga') ||
              path === '/favoritos' ||
              path === '/empresa/perfil',
            'Conteúdo preenchido ausente: ' + path,
          )
          assert.equal(
            await evaluate(
              'document.querySelector(".app-content").getBoundingClientRect().width <= 420',
            ),
            true,
            'Página mobile esticada',
          )
          if (path === '/home') {
            assert.ok(Math.abs(metrics.header.height - 297) < 1)
            if (width === 390 || width === 420) assert.equal(metrics.slogan.width, 370)
          }
          if (path === '/portfolio' || path === '/perfil' || path === '/empresa/perfil') {
            assert.ok(
              metrics.images.some((e) => e.naturalWidth > 0),
              'Imagens das fixtures não carregaram',
            )
          }
          const baselineFile = resolve('node_modules/.cache/feat49-browser/dc33fe9/results.json')
          if (existsSync(baselineFile)) {
            const baseline = JSON.parse(readFileSync(baselineFile, 'utf8')).find(
              (e) => e.path === path && e.width === width,
            )
            if (baseline?.card && metrics.card && width <= 420) {
              assert.ok(
                Math.abs(metrics.card.width - baseline.card.width) < 1,
                'Largura mobile alterada: ' + path,
              )
              assert.ok(
                Math.abs(metrics.card.height - baseline.card.height) < 1,
                'Altura mobile alterada: ' + path,
              )
            }
          }
        }
        results.push({ tipo, path, width, ...metrics })
        console.log(
          'AUDIT',
          snapshot || 'corrigido',
          path,
          width,
          metrics.shell.width,
          metrics.card?.width,
          metrics.scrollWidth > width ? 'OVERFLOW' : '',
        )
        if (!snapshot && path === '/criar-vaga') {
          await evaluate('document.querySelector("button[type=submit]").click()')
          assert.ok(
            (await evaluate('document.querySelectorAll("[aria-invalid=true]").length')) >= 5,
            'Validação não exibida',
          )
          const formStates = [
            { titulo: 'Página institucional', categoria: 'Desenvolvimento Web' },
            {
              titulo: 'Página institucional',
              categoria: 'Desenvolvimento Web',
              descricao: 'Criar uma aplicação acessível com catálogo de serviços.',
              preco: '1500,00',
              tempo: '40',
              modalidade: 'Remoto',
              cidade: 'Blumenau',
              uf: 'SC',
              status: 'publicada',
              requisitos: 'Vue e acessibilidade',
              beneficios: 'Horários flexíveis',
            },
          ]
          for (const [index, state] of formStates.entries()) {
            await evaluate(
              `(()=>{const state=${JSON.stringify(state)};for(const [name,value] of Object.entries(state)){const e=document.querySelector('[name="'+name+'"]');e.value=value;e.dispatchEvent(new Event(e.tagName==='SELECT'?'change':'input',{bubbles:true}));e.dispatchEvent(new Event('blur',{bubbles:true}))}})()`,
            )
            const shot = await cdp('Page.captureScreenshot', { format: 'png' })
            writeFileSync(
              resolve(folder, file + '-form-' + index + '.png'),
              Buffer.from(shot.data, 'base64'),
            )
          }
          assert.equal(
            await evaluate('document.querySelectorAll("[aria-invalid=true]").length'),
            0,
            'Formulário preenchido mantém erros',
          )
          results.push({ tipo, path, width, formStates: 3, validation: true })
        }
      }
  }
  assert.deepEqual(errors, [])
  if (audit && !comparisonOnly)
    for (const height of [600, 1200]) {
      await cdp('Emulation.setDeviceMetricsOverride', {
        width: 390,
        height,
        deviceScaleFactor: 1,
        mobile: false,
      })
      await cdp('Page.navigate', { url: 'http://127.0.0.1:5197/?filled=1&tipo=usuario&path=/home' })
      for (let i = 0; i < 100; i++) {
        if (await evaluate('document.body?.dataset.ready === "true"')) break
        await wait(50)
      }
      const headerHeight = await evaluate(
        'document.querySelector("header.header").getBoundingClientRect().height',
      )
      if (!snapshot)
        assert.ok(Math.abs(headerHeight - height * 0.33) < 1, 'Altura do header não acompanha 33vh')
      results.push({ path: '/home', width: 390, viewportHeight: height, headerHeight })
    }
  if (!snapshot && audit && !comparisonOnly) {
    await cdp('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 320,
      deviceScaleFactor: 1,
      mobile: false,
    })
    await cdp('Page.navigate', {
      url: 'http://127.0.0.1:5197/?filled=1&tipo=usuario&path=/favoritos',
    })
    for (let i = 0; i < 100; i++) {
      if (await evaluate('document.body?.dataset.ready === "true"')) break
      await wait(50)
    }
    assert.equal(
      await evaluate('getComputedStyle(document.querySelector(".app")).paddingBottom'),
      '5px',
      'Reserva 25vh deve acompanhar viewport baixa',
    )
    results.push({ path: '/favoritos', width: 390, viewportHeight: 320, paddingBottom: 5 })
  }
  if (!snapshot)
    for (const [page, width] of [
      ['home', 390],
      ['home', 420],
      ['homeEmpresa', 1440],
      ['portfolio', 390],
    ]) {
      const refs = ['dc33fe9', 'b4d9021', 'corrigido']
      const files = refs.map((ref) =>
        resolve('node_modules/.cache/feat49-browser', ref, `${page}-${width}.png`),
      )
      if (!files.every(existsSync)) continue
      const html = resolve(folder, `comparacao-${page}-${width}.html`)
      writeFileSync(
        html,
        `<!doctype html><meta charset="utf-8"><style>*{box-sizing:border-box}body{margin:0;display:flex;font:16px Arial;background:white}section{width:${width}px;flex:none}h2{height:30px;margin:0;font:16px Arial;text-align:center}img{display:block;width:100%}</style>` +
          files
            .map(
              (file, i) =>
                `<section><h2>${['Antes da F49', 'PR #97 original', 'Correção local'][i]}</h2><img src="data:image/png;base64,${readFileSync(file).toString('base64')}"></section>`,
            )
            .join(''),
      )
      await cdp('Emulation.setDeviceMetricsOverride', {
        width: width * 3,
        height: 930,
        deviceScaleFactor: 1,
        mobile: false,
      })
      await cdp('Page.navigate', { url: pathToFileURL(html).href })
      await wait(100)
      await evaluate(
        'Promise.all([...document.images].map(e=>e.complete?Promise.resolve():new Promise(r=>{e.onload=r;e.onerror=r})))',
      )
      const shot = await cdp('Page.captureScreenshot', { format: 'png' })
      writeFileSync(
        resolve(folder, `comparacao-${page}-${width}.png`),
        Buffer.from(shot.data, 'base64'),
      )
    }
  const resultsFile = resolve(folder, 'results.json')
  const previous =
    process.env.F49_PATHS && existsSync(resultsFile)
      ? JSON.parse(readFileSync(resultsFile, 'utf8')).filter(
          (old) =>
            !results.some(
              (r) =>
                r.path === old.path &&
                r.width === old.width &&
                r.viewportHeight === old.viewportHeight,
            ),
        )
      : []
  if (!comparisonOnly)
    writeFileSync(resultsFile, JSON.stringify([...previous, ...results], null, 2))
} finally {
  if (ws?.readyState === WebSocket.OPEN) {
    await cdp('Browser.close').catch(() => {})
    ws.close()
  }
  chrome.kill()
  await vite.close()
}
