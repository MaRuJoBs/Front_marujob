// F61: capturas antes/depois do layout desktop com o shell, o router e os componentes reais.
// Sessão, API e WebSocket em memória (tests/fixtures/f61-desktop.js); nenhuma conta real.
// Uso: node tests/f61-capturas.browser.mjs --fase antes|depois|<etapa> [--somente nome1,nome2] [--larguras 390,1366]
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { setTimeout as wait } from 'node:timers/promises'
import { createServer } from 'vite'
import vue from '@vitejs/plugin-vue'

const arg = (nome, padrao) => {
  const i = process.argv.indexOf(nome)
  return i > -1 ? process.argv[i + 1] : padrao
}
const fase = arg('--fase', 'depois')
assert.ok(/^[a-z0-9-]+$/.test(fase), 'Use --fase antes|depois|<etapa>')
const somente = arg('--somente', '')
  .split(',')
  .filter(Boolean)
const viewports = {
  390: { width: 390, height: 844, mobile: true },
  768: { width: 768, height: 1024, mobile: false },
  1024: { width: 1024, height: 768, mobile: false },
  1280: { width: 1280, height: 720, mobile: false },
  1366: { width: 1366, height: 768, mobile: false },
  1920: { width: 1920, height: 1080, mobile: false },
}
const larguras = arg('--larguras', '390,1366,1920').split(',').map(Number)
const pasta = resolve('docs/evidencias/f61/completo', fase)
mkdirSync(pasta, { recursive: true })
const portaVite = 5261
const portaChrome = 19661

const telas = [
  ['home-freelancer', 'usuario', '/home'],
  ['oportunidades', 'usuario', '/freelances'],
  ['oportunidade-detalhe', 'usuario', '/oportunidade/2'],
  ['favoritos', 'usuario', '/favoritos'],
  ['perfil-freelancer', 'usuario', '/perfil'],
  ['portfolio', 'usuario', '/portfolio'],
  ['portfolio-detalhe', 'usuario', '/portfolio/1'],
  ['portfolio-adicionar', 'usuario', '/portfolio/adicionar'],
  ['editar-perfil', 'usuario', '/editar-perfil'],
  ['mensagens-lista', 'usuario', '/mensagens'],
  ['mensagens-conversa', 'usuario', '/mensagens?room=42'],
  ['notificacoes-freelancer', 'usuario', '/notificacoes'],
  ['home-empresa', 'empresa', '/homeEmpresa'],
  ['criar-vaga', 'empresa', '/criar-vaga'],
  ['editar-vaga', 'empresa', '/editar-vaga/2'],
  ['detalhe-vaga-empresa', 'empresa', '/empresa/vagas/2'],
  ['busca-freelancers', 'empresa', '/empresa/freelancers'],
  ['perfil-empresa', 'empresa', '/empresa/perfil'],
  ['configuracoes-empresa', 'empresa', '/empresa/configuracoes'],
  ['perfil-publico-freelancer', 'empresa', '/empresa/freelancers/7'],
  ['notificacoes-empresa', 'empresa', '/empresa/notificacoes'],
  ['mensagens-empresa-lista', 'empresa', '/mensagens'],
  ['mensagens-empresa-conversa', 'empresa', '/mensagens?room=42'],
  ['login', 'publico', '/login'],
  ['cadastro-freelancer', 'publico', '/register'],
  ['cadastro-empresa', 'publico', '/registerEmpresa'],
  ['definir-senha', 'usuario', '/definir-senha'],
  ['trocar-senha', 'usuario', '/trocar-senha'],
  ['gerenciar-vagas', 'empresa', '/homeEmpresa#vagas-empresa'],
  // Conversa aberta e janela redimensionada desktop → mobile → desktop: mesma conversa, um socket.
  ['chat-redimensionar', 'usuario', '/mensagens?room=42', '', 0, [390, 1366]],
  // Troca de conversa pela lista no desktop: a URL muda e a lista continua visível.
  [
    'chat-trocar-conversa',
    'usuario',
    '/mensagens?room=42',
    "(async()=>{[...document.querySelectorAll('.rooms button, .rooms a')].find(e=>e.textContent.includes('Página institucional'))?.click();await new Promise(r=>setTimeout(r,800))})()",
  ],
  // Carrossel de destaques rolado até o último slide (scroll snap + indicador).
  [
    'home-carrossel',
    'usuario',
    '/home',
    "(async()=>{const c=document.querySelector('.slide-scroll');c.scrollIntoView({block:'center'});c.scrollLeft=c.scrollWidth;await new Promise(r=>setTimeout(r,600))})()",
  ],
  // Dica da sidebar recolhida: Tab real a partir da marca até o item Mensagens (1024–1279px).
  ['sidebar-foco', 'usuario', '/home', "document.querySelector('.desktop-nav__marca')?.focus()", 4],
]

// Estados complementares (pedido da revisão da PARADA 2). path|cenario usa as fixtures de estado.
export const estados = [
  ['estado-filtros-abertos', 'usuario', '/freelances', "(async()=>{const e=[...document.querySelectorAll('button')].find(e=>e.textContent.trim().startsWith('Filtros'));e?.scrollIntoView({block:'center'});e?.click();await new Promise(r=>setTimeout(r,700))})()"],
  ['estado-editar-projeto', 'usuario', '/portfolio/1/editar'],
  ['estado-favoritos-vazio', 'usuario', '/favoritos|vazio'],
  ['estado-portfolio-vazio', 'usuario', '/portfolio|vazio'],
  ['estado-painel-sem-vagas', 'empresa', '/homeEmpresa|vazio'],
  ['estado-candidatura-aprovar', 'empresa', '/empresa/notificacoes', "(async()=>{const e=[...document.querySelectorAll('button')].find(e=>e.textContent.trim().startsWith('Aprovar'));e?.scrollIntoView({block:'center'});e?.click();await new Promise(r=>setTimeout(r,700))})()"],
  ['estado-confirmar-exclusao', 'empresa', '/homeEmpresa', "(async()=>{const e=[...document.querySelectorAll('.lista-vagas button')].find(e=>e.textContent.trim().startsWith('Excluir'));e?.scrollIntoView({block:'center'});e?.click();await new Promise(r=>setTimeout(r,700))})()"],
  ['estado-localizacao-empresa', 'empresa', '/empresa/perfil', "(async()=>{const e=[...document.querySelectorAll('button')].find(e=>e.textContent.trim().startsWith('Editar informações'));e?.scrollIntoView({block:'center'});e?.click();await new Promise(r=>setTimeout(r,700))})()"],
  ['estado-chat-sem-conversas', 'usuario', '/mensagens|sem-conversas'],
  ['estado-chat-reconectando', 'usuario', '/mensagens|reconectando'],
  ['estado-login-erro', 'publico', '/login', "(async()=>{const i=[...document.querySelectorAll('input')];const set=(el,v)=>{el.value=v;el.dispatchEvent(new Event('input'))};set(i[0],'conta@teste.invalid');set(i[1],'senha-de-teste');document.querySelector('form').requestSubmit();await new Promise(r=>setTimeout(r,900))})()"],
  ['estado-cadastro-erro', 'publico', '/register', "(async()=>{document.querySelector('form').noValidate=true;document.querySelector('form').requestSubmit();await new Promise(r=>setTimeout(r,700))})()"],
  ['estado-home-carregando', 'usuario', '/home|carregando'],
  ['estado-home-erro', 'usuario', '/home|erro'],
  ['estado-oportunidades-erro', 'usuario', '/freelances|erro'],
  ['estado-painel-carregando', 'empresa', '/homeEmpresa|carregando'],
  ['estado-notificacoes-empresa-erro', 'empresa', '/empresa/notificacoes|erro'],
]

const todas = process.argv.includes('--estados') ? estados : telas
const selecionadas = todas.filter(([nome]) => !somente.length || somente.includes(nome))

const runner = `
import {createApp} from 'vue'
import {createPinia} from 'pinia'
import {createRouter,createMemoryHistory} from 'vue-router'
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome'
import {library} from '@fortawesome/fontawesome-svg-core'
import {fas} from '@fortawesome/free-solid-svg-icons'
import App from '/src/App.vue'
import {sessao} from '/src/services/authSession.js'
import {routes} from '/src/router/routes.js'
import api from '/src/services/api.js'
import {instalarFixturesF61} from '/tests/fixtures/f61-desktop.js'
import '/src/assets/main.css'
import '@fortawesome/fontawesome-free/css/all.min.css'
library.add(fas)
const q=new URLSearchParams(location.search)
const tipo=q.get('tipo')
localStorage.clear()
if(tipo!=='publico'){
 sessao.usuario={id:49,name:'Conta de teste'};sessao.tipo=tipo
 localStorage.setItem('token','teste-local')
}
const cenario=q.get('cenario')||''
const fixture=instalarFixturesF61(api,cenario)
if(sessao.usuario) Object.assign(sessao.usuario,fixture.usuario)
window.WebSocket=class {
 static OPEN=1
 readyState=0
 constructor(){window.__sockets=(window.__sockets||0)+1;queueMicrotask(()=>{if(cenario==='reconectando'){this.readyState=3;this.onclose?.({code:1006,reason:''})}else{this.readyState=1;this.onopen?.()}})}
 send(){}
 close(){this.readyState=3}
}
const router=createRouter({history:createMemoryHistory(),routes})
await router.push(q.get('path'))
await router.isReady()
createApp(App).use(createPinia()).use(router).component('FontAwesomeIcon',FontAwesomeIcon).mount('#app')
window.testRouter=router
await document.fonts.ready
document.body.dataset.ready='true'
`

const vite = await createServer({
  configFile: false,
  logLevel: 'error',
  resolve: { alias: { '@': resolve('src') } },
  optimizeDeps: { noDiscovery: true, include: [] },
  plugins: [
    vue(),
    {
      name: 'f61-capturas',
      resolveId(id) {
        if (id === '/__f61.js') return '\0f61'
      },
      load(id) {
        if (id === '\0f61') return runner
      },
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (!req.url.startsWith('/?')) return next()
          res.setHeader('Content-Type', 'text/html')
          res.end(
            '<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"><link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet"><div id="app"></div><script type="module" src="/__f61.js"></script></html>',
          )
        })
      },
    },
  ],
  server: { host: '127.0.0.1', port: portaVite, strictPort: true },
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
    '--hide-scrollbars',
    `--user-data-dir=${resolve('node_modules/.cache/f61-browser/profile')}`,
    `--remote-debugging-port=${portaChrome}`,
    'about:blank',
  ],
  { stdio: 'ignore', windowsHide: true },
)
let ws
let seq = 0
const pendentes = new Map()
const erros = []
async function cdp(method, params = {}) {
  const key = ++seq
  return new Promise((ok, falha) => {
    const timer = setTimeout(() => {
      pendentes.delete(key)
      falha(Error('CDP timeout: ' + method))
    }, 30000)
    pendentes.set(key, {
      ok: (v) => {
        clearTimeout(timer)
        ok(v)
      },
      falha,
    })
    ws.send(JSON.stringify({ id: key, method, params }))
  })
}
async function avaliar(expression) {
  const r = await cdp('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
  assert.ok(!r.exceptionDetails, JSON.stringify(r.exceptionDetails))
  return r.result.value
}
const medidas = []
try {
  let alvo
  for (let i = 0; i < 100 && !alvo; i++) {
    try {
      alvo = (await (await fetch(`http://127.0.0.1:${portaChrome}/json/list`)).json()).find(
        (x) => x.type === 'page',
      )
    } catch {}
    if (!alvo) await wait(150)
  }
  assert.ok(alvo, 'Chrome indisponível')
  ws = new WebSocket(alvo.webSocketDebuggerUrl)
  await new Promise((ok, falha) => {
    ws.onopen = ok
    ws.onerror = falha
  })
  ws.onmessage = ({ data }) => {
    const m = JSON.parse(data)
    const item = pendentes.get(m.id)
    if (m.method === 'Runtime.exceptionThrown') erros.push(JSON.stringify(m.params).slice(0, 400))
    if (item) {
      pendentes.delete(m.id)
      m.error ? item.falha(Error(JSON.stringify(m.error))) : item.ok(m.result)
    }
  }
  await cdp('Page.enable')
  await cdp('Runtime.enable')
  await cdp('Emulation.setEmulatedMedia', {
    features: [{ name: 'prefers-reduced-motion', value: 'reduce' }],
  })
  for (const largura of larguras) {
    const vp = viewports[largura]
    assert.ok(vp, 'Largura sem viewport definido: ' + largura)
    await cdp('Emulation.setDeviceMetricsOverride', {
      width: vp.width,
      height: vp.height,
      deviceScaleFactor: 1,
      mobile: vp.mobile,
    })
    for (const [nome, tipo, path, acao, tabs = 0, redimensionar = []] of selecionadas) {
      await cdp('Page.navigate', {
        url: `http://127.0.0.1:${portaVite}/?tipo=${tipo}&path=${encodeURIComponent(path.split('|')[0])}&cenario=${path.split('|')[1] ?? ''}`,
      })
      let pronto = false
      for (let i = 0; i < 300 && !pronto; i++) {
        pronto = await avaliar('document.body?.dataset.ready === "true"').catch(() => false)
        if (!pronto) await wait(100)
      }
      assert.ok(pronto, 'Página não carregou: ' + path)
      await wait(1500)
      if (!path.includes('#') && !acao) await avaliar('scrollTo(0,0)')
      if (acao) await avaliar(acao)
      for (const w of redimensionar) {
        await cdp('Emulation.setDeviceMetricsOverride', {
          width: w,
          height: viewports[w]?.height ?? vp.height,
          deviceScaleFactor: 1,
          mobile: w < 768,
        })
        await wait(700)
      }
      if (redimensionar.length)
        await cdp('Emulation.setDeviceMetricsOverride', {
          width: vp.width,
          height: vp.height,
          deviceScaleFactor: 1,
          mobile: vp.mobile,
        })
      for (let i = 0; i < tabs; i++) {
        for (const type of ['rawKeyDown', 'keyUp'])
          await cdp('Input.dispatchKeyEvent', { type, key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 })
      }
      await wait(200)
      const medida = await avaliar(`(() => {
        const r = (s) => { const e = document.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect(); return {left:Math.round(b.left), width:Math.round(b.width), top:Math.round(b.top), height:Math.round(b.height), visivel: getComputedStyle(e).display !== 'none' && b.width > 0} }
        return {
          overflowX: document.documentElement.scrollWidth > innerWidth,
          scrollHeight: document.documentElement.scrollHeight,
          conteudo: r('.app-content'),
          navInferior: r('.app-navigation'),
          navDesktop: r('.desktop-nav'),
          sockets: window.__sockets || 0,
          rota: window.testRouter?.currentRoute.value.fullPath,
          chat: {
            desktop: !!document.querySelector('.mensagens--desktop'),
            lista: !!document.querySelector('.mensagens .rooms'),
            conversa: !!document.querySelector('.mensagens__conversa'),
            ativa: document.querySelector('.rooms [aria-current]')?.textContent?.trim().slice(0, 40) ?? null,
          },
          slideAtivo: [...document.querySelectorAll('.pontos-rolagem span')].findIndex((e) => e.classList.contains('active')),
          ativos: [...document.querySelectorAll('.desktop-nav [aria-current="page"]')].map((e) => e.textContent.trim()),
        }
      })()`)
      const base = `${nome}-${largura}`
      const tela = await cdp('Page.captureScreenshot', { format: 'png' })
      writeFileSync(resolve(pasta, base + '.png'), Buffer.from(tela.data, 'base64'))
      const completa = await cdp('Page.captureScreenshot', {
        format: 'png',
        captureBeyondViewport: true,
      })
      writeFileSync(resolve(pasta, base + '-completa.png'), Buffer.from(completa.data, 'base64'))
      medidas.push({ nome, tipo, path, largura, ...medida })
      console.log(
        'CAPTURA',
        base,
        'overflow:',
        medida.overflowX,
        'conteudo:',
        medida.conteudo?.width,
        'navInferior:',
        medida.navInferior?.visivel ?? false,
        'navDesktop:',
        medida.navDesktop?.visivel ?? false,
        'ativo:',
        medida.ativos.join('|') || '-',
        'sockets:',
        medida.sockets,
        'rota:',
        medida.rota,
        'chat:',
        JSON.stringify(medida.chat),
      )
    }
  }
  writeFileSync(resolve(pasta, 'medidas.json'), JSON.stringify({ medidas, erros }, null, 2))
  if (erros.length) console.log('ERROS DE NAVEGADOR', erros.length, erros.slice(0, 3))
} finally {
  ws?.close()
  chrome.kill()
  await vite.close()
}
