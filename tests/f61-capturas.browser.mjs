// F61: capturas antes/depois do layout desktop com o shell, o router e os componentes reais.
// Sessão, API e WebSocket em memória (tests/fixtures/f61-desktop.js); nenhuma conta real.
// Uso: node tests/f61-capturas.browser.mjs --fase antes|depois|<etapa> [--somente nome1,nome2] [--larguras 390,1366]
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
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
  320: { width: 320, height: 700, mobile: true },
  375: { width: 375, height: 812, mobile: true },
  390: { width: 390, height: 844, mobile: true },
  430: { width: 430, height: 932, mobile: true },
  768: { width: 768, height: 1024, mobile: false },
  820: { width: 820, height: 1180, mobile: false },
  1024: { width: 1024, height: 768, mobile: false },
  1280: { width: 1280, height: 720, mobile: false },
  1366: { width: 1366, height: 768, mobile: false },
  1440: { width: 1440, height: 900, mobile: false },
  1920: { width: 1920, height: 1080, mobile: false },
  2560: { width: 2560, height: 1440, mobile: false },
}
const larguras = arg('--larguras', '390,1366,1920').split(',').map(Number)
const validarLogin = process.argv.includes('--validar-login')
const semCapturas = process.argv.includes('--sem-capturas')
const pasta = resolve(arg('--saida', 'docs/evidencias/f61/completo'), fase)
mkdirSync(pasta, { recursive: true })
const portaVite = Number(process.env.F61_VITE_PORT || 5261)
const portaChrome = Number(process.env.F61_CHROME_PORT || 19661)

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
  ['chat-redimensionar', 'usuario', '/mensagens?room=42'],
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
  ['home-carrossel-entrada', 'usuario', '/home'],
  // Dica da sidebar recolhida: Tab real a partir da marca até o item Mensagens (1024–1279px).
  ['sidebar-foco', 'usuario', '/home', "document.querySelector('.desktop-nav__marca')?.focus()", 4],
  ['sidebar-hover', 'usuario', '/home'],
]

// Estados complementares (pedido da revisão da PARADA 2). path|cenario usa as fixtures de estado.
export const estados = [
  ['estado-filtros-abertos', 'usuario', '/freelances', "(async()=>{const e=[...document.querySelectorAll('button')].find(e=>e.textContent.trim().startsWith('Filtros'));e?.scrollIntoView({block:'center'});e?.click();await new Promise(r=>setTimeout(r,700))})()"],
  ['estado-filtros-sem-resultados', 'usuario', '/freelances', `(async () => {
    const abrir = document.querySelector('.botao-filtro')
    abrir.click()
    await new Promise(requestAnimationFrame)
    const preco = document.querySelector('#preco-min')
    preco.value = '999999'
    preco.dispatchEvent(new Event('input', { bubbles: true }))
    document.querySelector('.filtros-painel').requestSubmit()
    await new Promise(r => setTimeout(r, 600))
    return document.activeElement === abrir &&
      document.querySelector('.estado')?.textContent.includes('Nenhuma oportunidade encontrada')
  })()`],
  ['estado-detalhe-curto', 'usuario', '/oportunidade/2|detalhe-curto'],
  ['estado-detalhe-longo', 'usuario', '/oportunidade/2|detalhe-longo'],
  ['estado-editar-projeto', 'usuario', '/portfolio/1/editar'],
  ['estado-favoritos-vazio', 'usuario', '/favoritos|vazio'],
  ['estado-portfolio-vazio', 'usuario', '/portfolio|vazio'],
  ['estado-painel-sem-vagas', 'empresa', '/homeEmpresa|vazio'],
  ['estado-candidatura-aprovar', 'empresa', '/empresa/notificacoes', "(async()=>{const e=[...document.querySelectorAll('button')].find(e=>e.textContent.trim().startsWith('Aprovar'));e?.scrollIntoView({block:'center'});e?.click();await new Promise(r=>setTimeout(r,700))})()"],
  ['estado-confirmar-exclusao', 'empresa', '/homeEmpresa', "(async()=>{const e=[...document.querySelectorAll('.lista-vagas button')].find(e=>e.textContent.trim().startsWith('Excluir'));e?.scrollIntoView({block:'center'});e?.click();await new Promise(r=>setTimeout(r,700))})()"],
  ['estado-localizacao-empresa', 'empresa', '/empresa/perfil', "(async()=>{const e=[...document.querySelectorAll('button')].find(e=>e.textContent.trim().startsWith('Editar informações'));e?.scrollIntoView({block:'center'});e?.click();await new Promise(r=>setTimeout(r,700))})()"],
  ['estado-chat-sem-conversas', 'usuario', '/mensagens|sem-conversas'],
  ['estado-chat-reconectando', 'usuario', '/mensagens|reconectando'],
  ['estado-chat-conversa-reconectando', 'usuario', '/mensagens?room=42|reconectando'],
  ['estado-login-erro', 'publico', '/login', `(async () => {
    const form = document.querySelector('.form-card')
    const [email, senha] = form.querySelectorAll('input')
    for (const [campo, valor] of [[email, 'conta@teste.invalid'], [senha, 'senha-de-teste']]) {
      campo.value = valor
      campo.dispatchEvent(new Event('input', { bubbles: true }))
    }
    form.requestSubmit()
    await Promise.resolve()
    const carregando = form.getAttribute('aria-busy') === 'true' &&
      email.disabled && senha.disabled && form.querySelector('.btn-login').disabled
    await new Promise(r => setTimeout(r, 900))
    return carregando && form.getAttribute('aria-busy') === 'false' && !email.disabled && !senha.disabled
  })()`],
  ['estado-cadastro-erro', 'publico', '/register', "(async()=>{document.querySelector('form').noValidate=true;document.querySelector('form').requestSubmit();await new Promise(r=>setTimeout(r,700))})()"],
  ['estado-cadastro-empresa-erro', 'publico', '/registerEmpresa', "(async()=>{document.querySelector('form').noValidate=true;document.querySelector('form').requestSubmit();await new Promise(r=>setTimeout(r,700))})()"],
  ['estado-home-carregando', 'usuario', '/home|carregando'],
  ['estado-home-vazio', 'usuario', '/home|vazio'],
  ['estado-home-erro', 'usuario', '/home|erro'],
  ['estado-oportunidades-erro', 'usuario', '/freelances|erro'],
  ['estado-painel-carregando', 'empresa', '/homeEmpresa|carregando'],
  ['estado-notificacoes-empresa-erro', 'empresa', '/empresa/notificacoes|erro'],
  ...[0, 1, 7, 100].map(total => [`estado-sidebar-avisos-${total}`, 'usuario', `/home|avisos-${total}`]),
]

const todas = process.argv.includes('--estados') ? estados : telas
const selecionadas = todas.filter(([nome]) => !somente.length || somente.includes(nome))
assert.ok(selecionadas.length, 'Nenhuma tela selecionada')

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
document.body.dataset.ready=q.get('captura')
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
const pastaPerfis = resolve('node_modules/.cache/f61-browser')
mkdirSync(pastaPerfis, { recursive: true })
const perfilChrome = mkdtempSync(resolve(pastaPerfis, 'profile-'))
const chrome = spawn(
  process.env.CHROME_BIN || 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  [
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    ...(!validarLogin ? ['--hide-scrollbars'] : []),
    `--user-data-dir=${perfilChrome}`,
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
    features: [{ name: 'prefers-reduced-motion', value: validarLogin ? 'no-preference' : 'reduce' }],
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
    for (const [nome, tipo, path, acao, tabs = 0] of selecionadas) {
      const base = `${nome}-${largura}`
      await cdp('Page.navigate', {
        url: `http://127.0.0.1:${portaVite}/?captura=${base}&tipo=${tipo}&path=${encodeURIComponent(path.split('|')[0])}&cenario=${path.split('|')[1] ?? ''}`,
      })
      let pronto = false
      for (let i = 0; i < 300 && !pronto; i++) {
        pronto = await avaliar(`document.body?.dataset.ready === ${JSON.stringify(base)}`).catch(() => false)
        if (!pronto) await wait(100)
      }
      assert.ok(pronto, 'Página não carregou: ' + path)
      await wait(1500)
      if (validarLogin && nome === 'login') {
        const desktop = largura >= 1024
        const layout = await avaliar(`(() => {
          const titulo = document.querySelector('.text h1')
          const marca = document.querySelector('.header')
          const diagrama = document.querySelector('.ilustracao-login')
          const form = document.querySelector('.form-card').getBoundingClientRect()
          const limites = diagrama.getBoundingClientRect()
          return {
            decoracao: limites.width > 0,
            semOverflow: document.documentElement.scrollWidth <= innerWidth,
            semRolagemVertical: document.scrollingElement.scrollHeight <= innerHeight,
            marcaDestacada: limites.width > 0 && marca.querySelector('.logo-top').offsetWidth >= 76 &&
              marca.querySelector('.slogan').offsetWidth >= 180,
            formInteiro: form.left >= 0 && form.right <= innerWidth && form.top >= 0 && form.bottom <= innerHeight,
            espacamento: marca.getBoundingClientRect().bottom <= titulo.getBoundingClientRect().top,
            cenaContida: limites.width > 0 && limites.right <= form.left && limites.bottom <= innerHeight,
            ariaHidden: diagrama.getAttribute('aria-hidden'),
          }
        })()`)
        assert.deepEqual(layout, {
          decoracao: desktop, semOverflow: true, semRolagemVertical: true, marcaDestacada: desktop,
          formInteiro: true, espacamento: true,
          cenaContida: desktop, ariaHidden: 'true',
        }, `Layout do login em ${largura}px`)
        const estado = () => avaliar(`(() => {
          const painel = document.querySelector('.apresentacao')
          return {
            animacoes: painel.getAnimations({ subtree: true }).map(a => a.animationName).filter(Boolean),
            cabeca: getComputedStyle(painel.querySelector('.ilustracao-cabeca')).transform,
            mao: getComputedStyle(painel.querySelector('.ilustracao-mao')).transform,
          }
        })()`)
        const repouso = await estado()
        await avaliar('document.querySelector(".text h1").focus()')
        for (const type of ['rawKeyDown', 'keyUp']) {
          await cdp('Input.dispatchKeyEvent', { type, key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 })
        }
        assert.ok(await avaliar(`document.activeElement.matches('input[type="email"]:focus-visible')`),
          'Tab do t?tulo chega ao campo de e-mail')
        await wait(260)
        const email = await estado()
        await avaliar('document.querySelector("input[type=password]").focus()')
        await wait(260)
        const senha = await estado()
        await cdp('Input.insertText', { text: 'teste' })
        assert.equal(await avaliar('document.activeElement.value'), 'teste')
        await wait(110)
        const digitando = await estado()
        if (desktop) {
          assert.ok(repouso.animacoes.some(nome => nome.startsWith('apresentar-login')))
          assert.notEqual(email.cabeca, repouso.cabeca, 'O personagem reage ao e-mail')
          assert.notEqual(senha.cabeca, email.cabeca, 'O personagem reage de outro modo ? senha')
          assert.notEqual(digitando.mao, senha.mao, 'A m?o acompanha a digita??o')
          await wait(450)
          assert.equal((await estado()).mao, senha.mao, 'A m?o volta ao repouso')
        } else assert.deepEqual(digitando.animacoes, [])
        await cdp('Emulation.setEmulatedMedia', {
          features: [{ name: 'prefers-reduced-motion', value: 'reduce' }],
        })
        await cdp('Input.insertText', { text: ' visual' })
        assert.equal(await avaliar('document.activeElement.value'), 'teste visual')
        const reduzido = await estado()
        assert.deepEqual(reduzido.animacoes, [])
        assert.equal(reduzido.cabeca, 'none')
        assert.equal(reduzido.mao, 'none')
        await avaliar(`(() => {
          const campo = document.activeElement
          campo.value = ''
          campo.dispatchEvent(new Event('input', { bubbles: true }))
          campo.blur()
        })()`)
        if (!vp.mobile) {
          const ponto = await avaliar(`(() => {
            const r = document.querySelector('.btn-login').getBoundingClientRect()
            return { x: r.left + r.width / 2, y: r.top + r.height / 2 }
          })()`)
          await cdp('Input.dispatchMouseEvent', { type: 'mouseMoved', ...ponto })
          assert.ok(await avaliar('document.querySelector(".btn-login").matches(":hover")'))
          await cdp('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 0, y: 0 })
        }
        await cdp('Emulation.setEmulatedMedia', {
          features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }],
        })
        await wait(800)
      }
      if (!path.includes('#') && !acao) await avaliar('scrollTo(0,0)')
      if (acao) {
        const resultado = await avaliar(acao)
        if (nome === 'estado-filtros-sem-resultados') assert.equal(resultado, true, nome)
        if (nome === 'estado-login-erro') assert.equal(resultado, true, 'Loading e reativação dos campos')
      }
      if (nome === 'home-carrossel-entrada' && !vp.mobile) {
        const ponto = await avaliar(`(() => {
          const carrossel = document.querySelector('.slide-scroll')
          carrossel.scrollIntoView({ block: 'center' })
          carrossel.focus({ preventScroll: true })
          const r = carrossel.getBoundingClientRect()
          return { x: r.left + r.width / 2, y: r.top + r.height / 2 }
        })()`)
        for (const type of ['rawKeyDown', 'keyUp']) {
          await cdp('Input.dispatchKeyEvent', {
            type, key: 'ArrowRight', code: 'ArrowRight', windowsVirtualKeyCode: 39,
          })
        }
        await wait(500)
        const tecla = await avaliar('document.querySelector(".slide-scroll").scrollLeft')
        assert.ok(tecla > 0, 'A seta direita avança o carrossel focado')
        await cdp('Input.dispatchMouseEvent', {
          type: 'mouseWheel', ...ponto, deltaX: vp.width, deltaY: 0,
        })
        await wait(500)
        assert.ok(await avaliar(`document.querySelector(".slide-scroll").scrollLeft > ${tecla}`),
          'A rolagem horizontal com ponteiro avança o carrossel')
      }
      const largurasChat = nome === 'chat-redimensionar'
        ? [largura === 1024 ? 768 : largura >= 1024 ? 390 : 1366, largura]
        : []
      if (largurasChat.length) {
        assert.ok(await avaliar(`(() => {
          const campo = document.querySelector('.mensagens textarea')
          if (!campo) return false
          campo.value = 'Rascunho da F61'
          campo.dispatchEvent(new Event('input', { bubbles: true }))
          return true
        })()`), 'Compositor ausente antes de redimensionar')
      }
      for (const w of largurasChat) {
        await cdp('Emulation.setDeviceMetricsOverride', {
          width: w,
          height: viewports[w]?.height ?? vp.height,
          deviceScaleFactor: 1,
          mobile: viewports[w]?.mobile ?? false,
        })
        await wait(700)
        assert.deepEqual(await avaliar(`({
          rota: testRouter.currentRoute.value.fullPath,
          sockets: window.__sockets,
          desktop: Boolean(document.querySelector('.mensagens--desktop')),
          rascunho: document.querySelector('.mensagens textarea')?.value,
        })`), {
          rota: '/mensagens?room=42',
          sockets: 1,
          desktop: w >= 1024,
          rascunho: 'Rascunho da F61',
        }, `Chat ao redimensionar de ${largura} para ${w}`)
      }
      for (let i = 0; i < tabs; i++) {
        for (const type of ['rawKeyDown', 'keyUp'])
          await cdp('Input.dispatchKeyEvent', { type, key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 })
      }
      if (nome === 'sidebar-hover' && largura >= 1024) {
        const seletor = '.desktop-nav__item[href="/freelances"]'
        const alvo = await avaliar(`(() => {
          const item = document.querySelector('${seletor}')
          const r = item.getBoundingClientRect()
          return { x: r.left + r.width / 2, y: r.top + r.height / 2,
            normal: getComputedStyle(item).backgroundColor }
        })()`)
        await cdp('Input.dispatchMouseEvent', { type: 'mouseMoved', x: alvo.x, y: alvo.y })
        await wait(200)
        assert.ok(await avaliar(`(() => {
          const item = document.querySelector('${seletor}')
          const ativo = document.querySelector('.desktop-nav [aria-current=page]')
          const hover = getComputedStyle(item).backgroundColor
          return item.matches(':hover') && hover !== ${JSON.stringify(alvo.normal)} &&
            hover !== getComputedStyle(ativo).backgroundColor &&
            getComputedStyle(ativo, '::before').content !== 'none'
        })()`), 'A sidebar distingue os estados normal, hover e ativo')
      }
      if (nome === 'sidebar-foco' && largura >= 1024) {
        assert.ok(await avaliar(`document.activeElement.matches('.desktop-nav__item:focus-visible') &&
          getComputedStyle(document.activeElement).outlineStyle === 'solid'`), 'Foco visível na sidebar')
      }
      if (nome.startsWith('estado-sidebar-avisos-') && largura >= 1024) {
        const total = Number(nome.split('-').at(-1))
        const contador = await avaliar(`(() => {
          const item = document.querySelector('.desktop-nav__item[href="/mensagens"]')
          return [...item.querySelectorAll('.indicador')].map(badge => {
            const r = badge.getBoundingClientRect()
            const link = item.getBoundingClientRect()
            return { texto: badge.textContent, contido: r.left >= link.left && r.right <= link.right &&
              r.top >= link.top && r.bottom <= link.bottom }
          })
        })()`)
        assert.deepEqual(contador, total ? [{ texto: total > 99 ? '99+' : String(total), contido: true }] : [])
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
      const rotaEsperada = nome === 'chat-trocar-conversa' && largura >= 1024
        ? '/mensagens?room=43'
        : path.split('|')[0]
      assert.equal(medida.rota, rotaEsperada, `Rota da captura ${nome}`)
      if (nome === 'home-carrossel') {
        assert.equal(medida.slideAtivo, 2, 'Indicador do último slide')
      }
      if (nome === 'chat-trocar-conversa' && largura >= 1024) {
        assert.equal(medida.chat.lista, true)
        assert.match(medida.chat.ativa ?? '', /Página institucional/)
        assert.ok(await avaliar(`(() => {
          const painel = document.querySelector('.mensagens__conversa')?.textContent
          return painel?.includes('Mensagem exclusiva da página institucional.') &&
            !painel.includes('Posso enviar o cronograma amanhã cedo?')
        })()`), 'Histórico corresponde à conversa selecionada')
      }
      if (nome === 'estado-chat-conversa-reconectando') {
        assert.ok(await avaliar(`document.querySelector('.mensagens').textContent.includes('Reconectando') &&
          document.querySelector('.mensagens__conversa')?.textContent.includes('Posso enviar o cronograma amanhã cedo?')`),
        'O banner de reconexão preserva o histórico')
      }
      if (!semCapturas && (!validarLogin || [390, 1366, 1920].includes(largura))) {
        const tela = await cdp('Page.captureScreenshot', { format: 'png' })
        writeFileSync(resolve(pasta, base + '.png'), Buffer.from(tela.data, 'base64'))
        if (!validarLogin) {
          const completa = await cdp('Page.captureScreenshot', {
            format: 'png',
            captureBeyondViewport: true,
          })
          writeFileSync(resolve(pasta, base + '-completa.png'), Buffer.from(completa.data, 'base64'))
        }
      }
      if (nome === 'estado-login-erro') {
        assert.match(await avaliar('document.querySelector(".form-card [role=alert]")?.textContent ?? ""'),
          /E-mail ou senha inválidos/)
        if (largura >= 1024) {
          assert.ok(await avaliar('document.scrollingElement.scrollHeight <= innerHeight'),
            'O erro de login cabe na janela desktop')
        }
      }
      if (nome === 'sidebar-hover' && largura >= 1024)
        await cdp('Input.dispatchMouseEvent', { type: 'mouseMoved', x: vp.width - 1, y: 0 })
      if (nome === 'estado-filtros-sem-resultados') {
        assert.ok(await avaliar(`(async () => {
          const abrir = document.querySelector('.botao-filtro')
          abrir.click()
          await new Promise(requestAnimationFrame)
          document.querySelector('.filtros-painel .limpar').click()
          await new Promise(r => setTimeout(r, 600))
          if (document.querySelector('.filtros-ativos') ||
              !document.querySelector('article.vaga') ||
              document.activeElement !== abrir) return false
          abrir.click()
          await new Promise(requestAnimationFrame)
          document.querySelector('.botao-fechar').click()
          await new Promise(requestAnimationFrame)
          return !document.querySelector('.filtros-painel') && document.activeElement === abrir
        })()`), 'Limpar, fechar e devolver foco ao botão Filtros')
      }
      if (nome === 'chat-redimensionar' && largura < 1024) {
        await avaliar(`(async () => {
          document.querySelector('[aria-label="Voltar às conversas"]').click()
          await new Promise(requestAnimationFrame)
        })()`)
        assert.equal(await avaliar('testRouter.currentRoute.value.fullPath'), '/mensagens')
        assert.ok(await avaliar('Boolean(document.querySelector(".mensagens--lista .rooms"))'))
      }
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
  if (ws?.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ id: ++seq, method: 'Browser.close' }))
    await Promise.race([new Promise(ok => chrome.once('exit', ok)), wait(1000)])
  }
  ws?.close()
  chrome.kill()
  await vite.close()
}
