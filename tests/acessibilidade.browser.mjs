// F52: Chromium real, rotas/componentes reais e transporte isolado.
// Fixtures somente no teste; nenhuma API, conta ou escrita externa é usada.
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { setTimeout as wait } from 'node:timers/promises'
import { createServer } from 'vite'
import vue from '@vitejs/plugin-vue'

const folder = resolve('node_modules/.cache/feat52-browser')
mkdirSync(folder, { recursive: true })
const runner = `
import {createApp,h,nextTick} from 'vue'
import {createPinia} from 'pinia'
import {createRouter,createMemoryHistory} from 'vue-router'
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome'
import {library} from '@fortawesome/fontawesome-svg-core'
import {fas} from '@fortawesome/free-solid-svg-icons'
import {AxiosError} from 'axios'
import App from '/src/App.vue'
import Register from '/src/components/RegisterComponent.vue'
import {routes} from '/src/router/routes.js'
import {sessao} from '/src/services/authSession.js'
import api from '/src/services/api.js'
import {instalarFixtures} from '/tests/fixtures/responsividade.js'
import '/src/assets/main.css'
import '@fortawesome/fontawesome-free/css/all.min.css'
library.add(fas)
// O SDK externo só é representado para evitar rede/contas Google no teste.
window.google={accounts:{id:{initialize(){},renderButton(el,opcoes){const b=document.createElement('button');b.type='button';b.textContent='Google (SDK isolado)';b.style.width=opcoes.width+'px';el.append(b)},disableAutoSelect(){},cancel(){}}}}
const params=new URLSearchParams(location.search),state=params.get('state')||'filled',path=params.get('path')||'/home'
const fixture=instalarFixtures(api)
fixture.projetos.forEach(p=>{p.categoria='Website';p.tags=['Vue']})
sessao.usuario=fixture.usuario;sessao.tipo=path.includes('Empresa')||path.startsWith('/empresa')||path==='/criar-vaga'||path.startsWith('/editar-vaga')?'empresa':'usuario'
localStorage.setItem('token','f52-somente-teste')
if(state==='empty'){fixture.jobs.splice(0);fixture.projetos.splice(0);localStorage.removeItem('marujobs:favoritos:usuario:49')}
const adapter=api.defaults.adapter
window.mutations=[];window.liberarMutacao=null
api.defaults.adapter=async config=>{
 if(config.method!=='get'){
  window.mutations.push({method:config.method,url:config.url})
  if(config.method==='delete' && window.permitirExclusao)return {config,status:204,data:'',headers:{}}
  await new Promise(r=>window.liberarMutacao=r)
  throw new AxiosError('Falha de teste','ERR_BAD_RESPONSE',config,null,{status:503,data:{detail:'Serviço indisponível no teste. Tente novamente.'},config,headers:{}})
 }
 if(state==='loading')await new Promise(()=>{})
 if(state==='error')throw new AxiosError('Sem rede no teste','ERR_NETWORK',config)
 return adapter(config)
}
const router=createRouter({history:createMemoryHistory(),routes:[...routes,{path:'/__duplo',component:{render:()=>h('div',[h(Register),h(Register)])}}]})
await router.push(path);await router.isReady()
createApp(App).use(createPinia()).use(router).component('FontAwesomeIcon',FontAwesomeIcon).mount('#app')
window.testRouter=router
await nextTick();await document.fonts.ready
document.body.dataset.ready='true'
`
const vite = await createServer({
  configFile: false,
  define: { 'import.meta.env.VITE_GOOGLE_CLIENT_ID': JSON.stringify('client-id-simulado') },
  resolve: { alias: { '@': resolve('src') } },
  optimizeDeps: { noDiscovery: true, include: [] },
  plugins: [
    vue(),
    {
      name: 'f52-test',
      resolveId: (id) => (id === '/__f52.js' ? '\0f52' : undefined),
      load: (id) => (id === '\0f52' ? runner : undefined),
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (!req.url.startsWith('/?')) return next()
          res.setHeader('Content-Type', 'text/html; charset=utf-8')
          res.end(
            '<!doctype html><html lang="pt-BR"><meta name="viewport" content="width=device-width,initial-scale=1"><title>F52 teste local</title><div id="app"></div><script type="module" src="/__f52.js"></script></html>',
          )
        })
      },
    },
  ],
  server: { host: '127.0.0.1', port: 5192, strictPort: true },
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
    '--remote-debugging-port=19452',
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
      reject(Error(method + ' timeout'))
    }, 15000)
    pending.set(key, {
      resolve: (result) => {
        clearTimeout(timer)
        resolve(result)
      },
      reject: (e) => {
        clearTimeout(timer)
        reject(e)
      },
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
async function key(key, modifiers = 0) {
  const virtualKey = { Enter: 13, Tab: 9, Escape: 27, ' ': 32 }[key]
  await cdp('Input.dispatchKeyEvent', {
    type: 'keyDown',
    key,
    code: key === ' ' ? 'Space' : key,
    modifiers,
    windowsVirtualKeyCode: virtualKey,
    text: key === 'Enter' ? '\r' : key === ' ' ? ' ' : undefined,
  })
  await cdp('Input.dispatchKeyEvent', {
    type: 'keyUp',
    key,
    code: key === ' ' ? 'Space' : key,
    modifiers,
    windowsVirtualKeyCode: virtualKey,
  })
  await wait(30)
}
async function open(path, width = 375, state = 'filled') {
  await cdp('Emulation.setDeviceMetricsOverride', {
    width,
    height: 812,
    deviceScaleFactor: 1,
    mobile: false,
  })
  await cdp('Page.navigate', {
    url: `http://127.0.0.1:5192/?path=${encodeURIComponent(path)}&state=${state}`,
  })
  let ready = false
  for (let i = 0; i < 120; i++) {
    ready = await evaluate('document.body?.dataset.ready === "true"')
    if (ready) break
    await wait(100)
  }
  assert.ok(ready, 'Timeout: ' + path)
  await wait(200)
}
async function shot(name) {
  if (process.argv.includes('--sem-capturas')) return
  const { data } = await cdp('Page.captureScreenshot', {
    format: 'png',
    captureBeyondViewport: true,
  })
  writeFileSync(resolve(folder, name + '.png'), Buffer.from(data, 'base64'))
}
const record = (checks, data = {}) => results.push({ checks, passed: true, ...data })
try {
  let target
  for (let i = 0; i < 80; i++) {
    try {
      target = (await (await fetch('http://127.0.0.1:19452/json/list')).json()).find(
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
  await cdp('Emulation.setFocusEmulationEnabled', { enabled: true })
  async function medirCadastro() {
    return evaluate(`(() => {
      const {left:painelEsquerda,right:painelDireita,bottom:painelBase,top:painelTopo} =
        document.querySelector('.cadastro-apresentacao').getBoundingClientRect();
      const form = document.querySelector('.cadastro form');
      const {left,right,top,width} = form.getBoundingClientRect();
      const controles = [...form.querySelectorAll('input:not([hidden]),button,a')];
      return {
        semOverflow: document.documentElement.scrollWidth <= innerWidth,
        duasColunas: painelDireita < left && Math.abs(painelTopo-top) < 200,
        empilhado: painelBase <= top && Math.abs(painelEsquerda-left) < 2,
        larguraConjunto: right-painelEsquerda,
        espacoColunas: left-painelDireita,
        camposInteiros: width > 0 && controles.every(el => {
          const rect = el.getBoundingClientRect();
          return rect.width > 0 && rect.left >= left && rect.right <= right + 1;
        }),
        campos: form.querySelectorAll('input').length,
        google: Boolean(form.querySelector('.google-login button')),
      };
    })()`)
  }
  for (const path of ['/register', '/registerEmpresa']) {
    for (const width of [320, 375, 390, 430, 768, 1024, 1366, 1440, 1920]) {
      await open(path, width)
      const layout = await medirCadastro()
      const cenario = `${path} em ${width}px — ${JSON.stringify(layout)}`
      assert.ok(layout.semOverflow && layout.camposInteiros && layout.google, cenario)
      assert.equal(layout.campos, 4, cenario)
      if (width >= 1024) {
        assert.ok(layout.duasColunas && layout.larguraConjunto <= 1101, cenario)
        assert.ok(layout.espacoColunas >= 32 && layout.espacoColunas <= 48, cenario)
      } else {
        assert.ok(layout.empilhado, cenario)
      }
      record('Cadastro responsivo com campos e Google visíveis', { path, width })
    }

    await cdp('Emulation.setDeviceMetricsOverride', { width: 960, height: 406, deviceScaleFactor: 2, mobile: false })
    const reflow = await medirCadastro()
    assert.ok(reflow.empilhado && reflow.semOverflow && reflow.camposInteiros, path)
    await cdp('Emulation.setDeviceMetricsOverride', { width: 390, height: 350, deviceScaleFactor: 1, mobile: true })
    await evaluate('document.querySelector(".btn-voltar").focus()')
    await key('Tab')
    assert.ok(await evaluate('document.activeElement.matches(".photo-box:focus-visible")'))
    await key('Tab')
    assert.ok(await evaluate('document.activeElement.matches("input[autocomplete=name]:focus-visible")'))

    const { root } = await cdp('DOM.getDocument')
    const { nodeId } = await cdp('DOM.querySelector', { nodeId: root.nodeId, selector: '.cadastro input[type=file]' })
    await cdp('DOM.setFileInputFiles', { nodeId, files: [resolve('src/assets/images/logo.png')] })
    for (let i = 0; i < 30 && !(await evaluate('document.querySelector(".preview-img")?.naturalWidth')); i++) {
      await wait(50)
    }
    assert.ok(await evaluate('document.querySelector(".preview-img")?.naturalWidth > 0'))
    await evaluate(`(() => {
      const campo = document.querySelector('input[id$="-confirmarSenha"]');
      campo.focus();campo.scrollIntoView({block:'center'});
      const form = campo.form;form.noValidate = true;form.requestSubmit();
    })()`)
    assert.ok(await evaluate(`(() => {
      const campo=document.activeElement,rect=campo.getBoundingClientRect();
      return campo.id.endsWith('-confirmarSenha') && rect.top>=0 && rect.bottom<=innerHeight;
    })()`))
    assert.match(await evaluate('document.querySelector(".cadastro [role=alert]").textContent'), /Nome é obrigatório/)
    assert.equal(await evaluate('mutations.length'), 0)
    await evaluate(`(() => {
      const form=document.querySelector('.cadastro form');
      const valores=['Nome de teste','cadastro@example.test','senha-de-teste','senha-de-teste'];
      [...form.querySelectorAll('input')].forEach((campo,index)=>{
        campo.value=valores[index];campo.dispatchEvent(new Event('input',{bubbles:true}));
      });
      form.requestSubmit();
    })()`)
    await wait(100)
    assert.ok(await evaluate(`(() => {
      const form=document.querySelector('.cadastro form');
      return form.getAttribute('aria-busy')==='true'
        && [...form.querySelectorAll('input')].every(campo=>campo.disabled)
        && form.querySelector('.criarConta').disabled
        && form.querySelector('.google-login').inert
        && [...form.querySelectorAll('[role=status]')].some(el=>el.textContent.includes('Aguarde'));
    })()`))
    await evaluate('liberarMutacao()')
    await wait(100)
    assert.match(await evaluate('document.querySelector(".cadastro [role=alert]").textContent'), /indisponível/)
    assert.ok((await medirCadastro()).semOverflow, path)
    await evaluate('document.querySelector(".btn-voltar").focus()')
    await key('Enter')
    for (let i = 0; i < 30 && await evaluate('testRouter.currentRoute.value.path !== "/"'); i++) {
      await wait(50)
    }
    assert.equal(await evaluate('testRouter.currentRoute.value.path'), '/')
    record('Cadastro com reflow de 200%, viewport reduzido, upload, teclado, voltar, erro e loading', { path })
  }
  const paths = [
    '/',
    '/register',
    '/registerEmpresa',
    '/definir-senha',
    '/trocar-senha',
    '/home',
    '/freelances',
    '/oportunidade/2',
    '/favoritos',
    '/perfil',
    '/editar-perfil',
    '/portfolio',
    '/portfolio/1',
    '/portfolio/adicionar',
    '/homeEmpresa',
    '/criar-vaga',
    '/empresa/perfil',
    '/empresa/configuracoes',
    '/empresa/notificacoes',
  ]
  for (const path of process.argv.includes('--interactions-only') ? [] : paths)
    for (const width of [320, 375, 768, 1440]) {
      await open(path, width)
      const audit = await evaluate(`(()=>{
      const visible=e=>e.getClientRects().length&&getComputedStyle(e).visibility!=='hidden'
      return {
        overflow:document.documentElement.scrollWidth>innerWidth,
        main:document.querySelectorAll('main').length,
        unlabeled:[...document.querySelectorAll('input:not([hidden]),select,textarea')].filter(visible).filter(e=>![...e.labels||[]].some(l=>l.textContent.trim())&&!e.getAttribute('aria-label')).map(e=>e.outerHTML),
        duplicateIds:[...document.querySelectorAll('[id]')].map(e=>e.id).filter((id,i,ids)=>ids.indexOf(id)!==i),
        positiveTabindex:[...document.querySelectorAll('[tabindex]')].filter(e=>Number(e.tabIndex)>0).length
      }
    })()`)
      assert.equal(audit.overflow, false, `${path} ${width}: overflow`)
      assert.equal(audit.main, 1, `${path}: landmark main`)
      assert.deepEqual(audit.unlabeled, [], `${path}: labels`)
      assert.deepEqual(audit.duplicateIds, [], `${path}: IDs`)
      assert.equal(audit.positiveTabindex, 0)
      record('Estrutura e largura', { path, width })
    }
  await open('/__duplo')
  assert.equal(
    await evaluate('new Set([...document.querySelectorAll("input[id]")].map(e=>e.id)).size'),
    8,
  )
  record('IDs únicos em duas instâncias de cadastro')

  await open('/')
  await key('Tab')
  assert.equal(await evaluate('document.activeElement.className'), 'saltar-conteudo')
  await key('Enter')
  assert.equal(await evaluate('document.activeElement.id'), 'conteudo-principal')
  await key('Tab')
  assert.equal(await evaluate('document.activeElement.type'), 'email')
  assert.equal(await evaluate('getComputedStyle(document.activeElement).outlineStyle'), 'solid')
  assert.ok(await evaluate('parseFloat(getComputedStyle(document.activeElement).outlineWidth)>=2'))
  record('Tab real, salto ao conteúdo e foco visível no login')
  await evaluate(
    `for(const [type,value]of [['email','teste@example.test'],['password','senha-de-teste']]){const e=document.querySelector('input[type='+type+']');e.value=value;e.dispatchEvent(new Event('input',{bubbles:true}))};document.querySelector('form').requestSubmit()`,
  )
  await wait(50)
  assert.equal(await evaluate('document.querySelector("form").getAttribute("aria-busy")'), 'true')
  await evaluate(
    'document.querySelector("form").dispatchEvent(new Event("submit",{bubbles:true,cancelable:true}))',
  )
  assert.equal(await evaluate('mutations.length'), 1)
  await evaluate('liberarMutacao()')
  await wait(100)
  assert.match(await evaluate('document.querySelector("[role=alert]").textContent'), /indisponível/)
  assert.equal(
    await evaluate('document.querySelector("input[type=email]").value'),
    'teste@example.test',
  )
  assert.equal(
    await evaluate('document.querySelector("input[type=password]").value'),
    'senha-de-teste',
  )
  record('Login: loading, bloqueio de duplicidade, erro 503 e dados preservados')

  const campoSenha = 'document.querySelector(".input-senha input")'
  const alternarSenha = 'document.querySelector(".alternar-senha")'
  async function verificarSenha(visivel, preenchida = true) {
    assert.deepEqual(
      await evaluate(`(()=>{const campo=${campoSenha},botao=${alternarSenha};return [
        campo.type, botao.getAttribute('aria-label'), botao.getAttribute('aria-pressed'),
        botao.querySelector('svg').dataset.icon,
        campo.value === ${preenchida ? 'window.senhaFixture' : "''"}
      ]})()`),
      visivel ? ['text', 'Ocultar senha', 'true', 'eye', true]
        : ['password', 'Mostrar senha', 'false', 'eye-slash', true],
    )
  }
  for (const width of [320, 1440]) {
    await open('/', width)
    await verificarSenha(false, false)
    assert.ok(await evaluate(`(()=>{const campo=${campoSenha},botao=${alternarSenha};
      const texto=campo.getBoundingClientRect(),alvo=botao.getBoundingClientRect();
      return texto.right<=alvo.left && alvo.width>=44 && alvo.height>=44
    })()`))
    const ponto = await evaluate(`(()=>{
      window.senhaFixture='senha-de-teste';
      const email=document.querySelector('input[type=email]'),campo=${campoSenha};
      email.value='teste@example.test';email.dispatchEvent(new Event('input',{bubbles:true}));
      campo.focus();campo.value=window.senhaFixture;campo.dispatchEvent(new Event('input',{bubbles:true}));
      const alvo=${alternarSenha}.getBoundingClientRect();
      return {x:alvo.left+alvo.width/2,y:alvo.top+alvo.height/2}
    })()`)
    if (width === 1440) {
      assert.match(
        await evaluate('getComputedStyle(document.querySelector(".ilustracao-mao")).animationName'),
        /^digitar-login(?:-|$)/,
      )
      assert.match(
        await evaluate('getComputedStyle(document.querySelector(".ilustracao-login")).animationName'),
        /^apresentar-login(?:-|$)/,
      )
    }
    await cdp('Input.dispatchMouseEvent', { type: 'mousePressed', button: 'left', clickCount: 1, ...ponto })
    await cdp('Input.dispatchMouseEvent', { type: 'mouseReleased', button: 'left', clickCount: 1, ...ponto })
    await verificarSenha(true)
    assert.ok(await evaluate(`document.activeElement === ${campoSenha}`))
    await evaluate(`${campoSenha}.setSelectionRange(window.senhaFixture.length, window.senhaFixture.length)`)
    await cdp('Input.insertText', { text: '!' })
    await evaluate("window.senhaFixture += '!'")
    await verificarSenha(true)
    if (width === 1440) {
      assert.notEqual(await evaluate('getComputedStyle(document.querySelector(".ilustracao-olhar")).transform'), 'none')
    }
    await key('Tab')
    assert.ok(await evaluate(`document.activeElement === ${alternarSenha} && document.activeElement.matches(':focus-visible')`))
    await key('Enter')
    await verificarSenha(false)
    await key(' ')
    await verificarSenha(true)
    await key(' ')
    await verificarSenha(false)
    assert.equal(await evaluate('mutations.length'), 0)
    await key('Enter')
    await verificarSenha(true)
    await evaluate(`(async()=>{await testRouter.push('/register');await testRouter.push('/')})()`)
    await verificarSenha(false, false)
  }
  record('Senha no login: ícones, valor preservado, foco, teclado, animações e remontagem')

  async function pontoDoControle(selector) {
    return evaluate(`(()=>{const el=document.querySelector(${JSON.stringify(selector)});
      el.scrollIntoView({block:'center'});const {left,top,width,height}=el.getBoundingClientRect();
      return {x:left+width/2,y:top+height/2}
    })()`)
  }
  async function clicarControle(selector) {
    const ponto = await pontoDoControle(selector)
    await cdp('Input.dispatchMouseEvent', { type: 'mousePressed', button: 'left', clickCount: 1, ...ponto })
    await cdp('Input.dispatchMouseEvent', { type: 'mouseReleased', button: 'left', clickCount: 1, ...ponto })
  }
  const semContorno = `(() => {
    const estilo = getComputedStyle(document.activeElement);
    return estilo.outlineStyle === 'none' || parseFloat(estilo.outlineWidth) === 0;
  })()`
  await open('/', 1440)
  await clicarControle('.input-senha input')
  assert.ok(await evaluate(`document.activeElement === ${campoSenha} && ${semContorno}`))
  await cdp('Input.insertText', { text: 'a' })
  assert.ok(await evaluate(semContorno))
  await key('Tab')
  assert.ok(await evaluate(`document.activeElement === ${alternarSenha} && !(${semContorno})`))
  await clicarControle('.btn-login')
  assert.ok(await evaluate(semContorno))
  await open('/home', 1440)
  await clicarControle('.desktop-nav a[href="/portfolio"]')
  for (let i = 0; i < 40 && !(await evaluate('document.querySelector("#pesquisa-projeto")')); i++) {
    await wait(50)
  }
  assert.equal(await evaluate('testRouter.currentRoute.value.path'), '/portfolio')
  assert.ok(await evaluate(semContorno))
  await clicarControle('#pesquisa-projeto')
  assert.equal(await evaluate('document.activeElement.id'), 'pesquisa-projeto')
  assert.ok(await evaluate(semContorno))
  assert.equal(await evaluate('getComputedStyle(document.querySelector(".input-busca")).outlineStyle'), 'none')
  await open('/home', 375)
  await cdp('Emulation.setTouchEmulationEnabled', { enabled: true })
  const toque = await pontoDoControle('.app-navigation a[href="/perfil"]')
  await cdp('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [toque] })
  await cdp('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  for (let i = 0; i < 40 && await evaluate('testRouter.currentRoute.value.path !== "/perfil"'); i++) {
    await wait(50)
  }
  assert.equal(await evaluate('testRouter.currentRoute.value.path'), '/perfil')
  assert.ok(await evaluate(semContorno))
  assert.equal(await evaluate('getComputedStyle(document.querySelector(".app-navigation a")).webkitTapHighlightColor'), 'rgba(0, 0, 0, 0)')
  await cdp('Emulation.setTouchEmulationEnabled', { enabled: false })
  record('Foco por mouse, toque e teclado no login, busca e navegação mobile e desktop')

  await open('/portfolio')
  await evaluate('document.querySelector(".botao-filtro").focus()')
  await key('Enter')
  assert.equal(
    await evaluate('!!document.querySelector("dialog:modal")'),
    true,
    JSON.stringify(
      await evaluate(
        '({active:document.activeElement.outerHTML,dialog:document.querySelector("dialog")?.outerHTML,expanded:document.querySelector(".botao-filtro").getAttribute("aria-expanded")})',
      ),
    ),
  )
  await evaluate('document.querySelector(".botao-aplicar").focus()')
  await key('Tab')
  // O dialog nativo permite passar pela interface do próprio navegador.
  // Nenhum controle da página de fundo pode receber foco nesse percurso.
  if (await evaluate('document.activeElement === document.body')) await key('Tab')
  assert.equal(await evaluate('document.activeElement.className'), 'botao-fechar')
  await key('Tab', 8)
  if (await evaluate('document.activeElement === document.body')) await key('Tab', 8)
  assert.equal(await evaluate('document.activeElement.className'), 'botao-aplicar')
  await shot('portfolio-dialog-teclado')
  await key('Escape')
  assert.equal(await evaluate('document.querySelector("dialog")'), null)
  assert.equal(await evaluate('document.activeElement.className'), 'botao-filtro')
  // Abrir com Espaço, aplicar checkbox e fechar com retorno.
  await key(' ')
  await evaluate(
    'document.querySelector("dialog input").click();document.querySelector(".botao-aplicar").click()',
  )
  assert.equal(await evaluate('document.activeElement.className'), 'botao-filtro')
  record('Filtro de portfólio: Enter/Espaço, Tab/Shift+Tab contidos, Escape e retorno/aplicação')
  await shot('portfolio-filtros-fechados')

  await open('/editar-perfil')
  await evaluate('document.querySelector(".botao-camera").focus()')
  await key('Enter')
  assert.equal(await evaluate('document.activeElement.type'), 'file')
  assert.equal(
    await evaluate('getComputedStyle(document.querySelector(".opcao-foto")).outlineStyle'),
    'solid',
  )
  await key('Escape')
  assert.equal(await evaluate('document.activeElement.className'), 'botao-camera')
  await evaluate('document.querySelector(".botao-camera").click()')
  await wait(30)
  await evaluate('document.querySelector("button.opcao-foto").click()')
  await wait(30)
  assert.match(await evaluate('document.activeElement.textContent'), /Abrir câmera/)
  await key('Escape')
  assert.equal(await evaluate('document.activeElement.className'), 'botao-camera')
  // Enter na busca da cidade nunca deve salvar o perfil.
  await evaluate('document.querySelector("#pesquisa-cidade").focus()')
  await key('Enter')
  assert.equal(await evaluate('mutations.length'), 0)
  record('Foto/câmera inline: foco inicial, Escape/retorno; busca não envia perfil')

  await open('/portfolio/adicionar')
  await evaluate('document.querySelector(".salvar").click()')
  await wait(50)
  assert.deepEqual(
    await evaluate(
      `[...document.querySelectorAll('[aria-invalid="true"]')].map(e=>e.getAttribute('aria-describedby')).filter(id=>!id||!document.getElementById(id))`,
    ),
    [],
  )
  assert.ok(await evaluate('document.querySelectorAll("[aria-invalid=true]").length>=3'))
  record('Projeto: campos obrigatórios e associação de todos os erros locais')

  await open('/portfolio/1')
  await evaluate('document.querySelector(".excluir").focus()')
  await key('Enter')
  assert.equal(await evaluate('!!document.querySelector("dialog:modal")'), true)
  await key('Escape')
  assert.equal(await evaluate('document.activeElement.className'), 'excluir')
  assert.equal(await evaluate('mutations.length'), 0)
  record('Exclusão de projeto: confirmação nativa, cancelar por Escape e retorno sem DELETE')
  await evaluate('window.permitirExclusao=true;document.querySelector(".excluir").click()')
  await wait(30)
  await evaluate('document.querySelector("dialog button:last-child").click()')
  await wait(100)
  assert.equal(await evaluate('mutations.length'), 1)
  assert.equal(await evaluate('document.activeElement.getAttribute("role")'), 'status')
  assert.match(await evaluate('document.activeElement.textContent'), /excluído com sucesso/)
  record('Exclusão confirmada em transporte local: foco no resultado após remover acionador')

  await open('/freelances')
  await evaluate('testRouter.push("/favoritos")')
  await wait(250)
  assert.equal(await evaluate('document.activeElement.tagName'), 'H1')
  assert.match(await evaluate('document.activeElement.textContent'), /Favoritos/)
  assert.equal(
    await evaluate('document.querySelector(".app-navigation a[aria-current=page]")'),
    null,
  )
  await evaluate('testRouter.push("/perfil")')
  await wait(250)
  assert.equal(
    await evaluate(
      'document.querySelector(".app-navigation a[aria-current=page]").getAttribute("href")',
    ),
    '/perfil',
  )
  record('Mudança de rota: foco no título/conteúdo e aria-current do RouterLink')

  for (const path of [
    '/freelances',
    '/perfil',
    '/portfolio',
    '/homeEmpresa',
    '/empresa/notificacoes',
  ]) {
    for (const state of ['empty', 'error', 'loading']) {
      await open(path, 320, state)
      if (state === 'empty') {
        assert.match(
          await evaluate('document.querySelector("main").textContent'),
          /nenhum|publique sua primeira|ainda não/i,
        )
        record('Estado vazio explica ausência e apresenta ações existentes', { path, state })
        continue
      }
      assert.ok(
        await evaluate(
          `document.querySelectorAll('${state === 'error' ? '[role=alert]' : '[role=status]'}').length>0`,
        ),
        `${path} ${state}`,
      )
      if (state === 'loading' && path === '/empresa/notificacoes') {
        assert.match(await evaluate('document.querySelector(".estado[role=status]")?.textContent ?? ""'),
          /Carregando notificações/)
        assert.ok(await evaluate('document.querySelector(".estado[role=status]")?.getClientRects().length'))
      } else if (state === 'loading')
        assert.ok(await evaluate('!!document.querySelector("[aria-busy=true]")'), path)
      record('Feedback de estado', { path, state })
    }
  }
  await open('/register', 320)
  await shot('cadastro-320')
  const contrast = (a, b) => {
    const lum = (color) =>
      color
        .match(/[\d.]+/g)
        .slice(0, 3)
        .map(Number)
        .map((v) => v / 255)
        .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
        .reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0)
    const [lo, hi] = [lum(a), lum(b)].sort((x, y) => x - y)
    return (hi + 0.05) / (lo + 0.05)
  }
  const contrasts = []
  for (const path of ['/home', '/homeEmpresa']) {
    await open(path)
    const colors = await evaluate(
      '({text:getComputedStyle(document.querySelector(".app-navigation .item:not([aria-current])")).color,background:getComputedStyle(document.querySelector(".app-navigation")).backgroundColor})',
    )
    const ratio = contrast(colors.text, colors.background)
    assert.ok(ratio >= 4.5, JSON.stringify(colors))
    assert.ok(
      await evaluate(
        '[...document.querySelectorAll(".app-navigation .item")].every(e=>e.getBoundingClientRect().height>=44&&e.getBoundingClientRect().width>=44)',
      ),
    )
    contrasts.push({ path, ...colors, ratio })
  }
  await open('/')
  const colors = await evaluate(
    '({text:getComputedStyle(document.querySelector("input"),"::placeholder").color,border:getComputedStyle(document.querySelector(".input")).borderTopColor,background:getComputedStyle(document.querySelector(".input")).backgroundColor})',
  )
  assert.ok(contrast(colors.text, colors.background) >= 4.5)
  assert.ok(contrast(colors.border, colors.background) >= 3)
  assert.ok(await evaluate('document.querySelector("input").getBoundingClientRect().height>=44'))
  contrasts.push({
    path: '/',
    ...colors,
    ratio: contrast(colors.text, colors.background),
    borderRatio: contrast(colors.border, colors.background),
  })
  record('Contraste computado da navegação/placeholder/borda; alvos de navegação/login >=44px', {
    contrasts,
  })
  // Viewport CSS de 320px equivale ao reflow de uma janela 1280px em zoom de 400%.
  // Não representa zoom manual nem dispositivo físico.
  record('Reflow em 320 CSS px; sem alegar zoom/dispositivo físico')
  assert.deepEqual(errors, [])
} finally {
  writeFileSync(resolve(folder, 'results.json'), JSON.stringify({ errors, results }, null, 2))
  if (ws?.readyState === WebSocket.OPEN) {
    await cdp('Browser.close').catch(() => {})
    ws.close()
  }
  chrome.kill()
  await vite.close()
}
console.log(
  `${results.length} verificações F52 aprovadas; ${errors.length} erros/avisos de console.`,
)
