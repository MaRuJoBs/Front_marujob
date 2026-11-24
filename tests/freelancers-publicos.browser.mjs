import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { setTimeout as wait } from 'node:timers/promises'
import { createServer } from 'vite'
import vue from '@vitejs/plugin-vue'

const folder = resolve('node_modules/.cache/f45-browser')
mkdirSync(folder, { recursive: true })
const runner = `
import {createApp} from 'vue'
import {createRouter,createWebHistory} from 'vue-router'
import {createPinia} from 'pinia'
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome'
import {library} from '@fortawesome/fontawesome-svg-core'
import {fas} from '@fortawesome/free-solid-svg-icons'
import App from '/src/App.vue'
import {routes} from '/src/router/routes.js'
import {instalarProtecao} from '/src/router/authGuard.js'
import '/src/assets/main.css'
import api from '/src/services/api.js'
import {sessao} from '/src/services/authSession.js'
window.chamadas=[];window.modo='normal'
api.defaults.baseURL=location.origin+'/api/'
window.perfilProprio={id:1,name:'Profissional de teste',profissao:'Desenvolvimento',habilidades:['Vue'],localizacao:'Cidade privada',sobre:'Sobre profissional',telefone:'',perfil_publico:false,cidade_publica:''}
window.trocarParaFreelancer=()=>{sessao.tipo='usuario';sessao.usuario=window.perfilProprio}
sessao.tipo='empresa';sessao.usuario={id:1}
localStorage.setItem('token','f45-transporte-isolado')
library.add(fas)
api.defaults.adapter=async config=>{
 window.chamadas.push({url:config.url,params:config.params})
 if(config.url==='usuarios/me/') {
  if(config.method==='patch')Object.assign(window.perfilProprio,JSON.parse(config.data))
  return {config,status:200,data:{...window.perfilProprio}}
 }
 if(window.modo==='erro') {const e=new Error('teste');e.response={status:500};throw e}
 if(window.modo==='404') {const e=new Error('teste');e.response={status:404};throw e}
 const params={...config.params}
 if(params.habilidade==='Vue')await new Promise(r=>setTimeout(r,800))
 const pessoa={id:7,nome:params.habilidade||'Profissional de teste',profissao:'Desenvolvimento',cidade:'Blumenau',habilidades:['Vue'],foto_perfil:location.origin+'/src/assets/images/perfil.png',email:'NAO-EXIBIR',latitude:10}
 return {config,status:200,data:config.url==='freelancers/'?{count:window.modo==='vazio'?0:3,next:params.page===1?'?page=2':null,previous:params.page===2?'?page=1':null,results:window.modo==='vazio'?[]:[pessoa]}:{...pessoa,descricao:'Descrição pública',portfolio:[
  {id:1,titulo:'Projeto publicado de teste',publico:true,categoria:'Web',descricao:'Descrição completa do projeto',tags:['Vue','CSS'],imagem:'src/assets/images/perfil.png',link:'https://example.org/projeto'},
  {id:2,titulo:'Projeto privado de teste',publico:false},
  {id:3,titulo:'Outro projeto',link:'javascript:alert(1)'},
 ]}}
}
const router=createRouter({history:createWebHistory(),routes})
instalarProtecao(router)
await router.replace(location.pathname==='/'?'/mensagens':location.pathname+location.search);await router.isReady()
window.router=router
createApp(App).use(createPinia()).use(router).component('FontAwesomeIcon',FontAwesomeIcon).mount('#app')
`
const vite = await createServer({
  configFile: false,
  resolve: { alias: { '@': resolve('src') } },
  plugins: [
    vue(),
    {
      name: 'f45-browser',
      resolveId: (id) => (id === '/__f45.js' ? '\0f45' : undefined),
      load: (id) => (id === '\0f45' ? runner : undefined),
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url !== '/' && !req.url.startsWith('/empresa/freelancers/')) return next()
          res.setHeader('Content-Type', 'text/html; charset=utf-8')
          res.end(
            '<!doctype html><html lang="pt-BR"><meta name="viewport" content="width=device-width,initial-scale=1"><div id="app"></div><script type="module" src="/__f45.js"></script></html>',
          )
        })
      },
    },
  ],
  server: { host: '127.0.0.1', port: 5195, strictPort: true },
  optimizeDeps: { noDiscovery: true, include: [] },
})
await vite.listen()
const chrome = spawn(
  process.env.CHROME_BIN || 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  [
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    `--user-data-dir=${resolve(folder, 'profile')}`,
    '--remote-debugging-port=19445',
    'about:blank',
  ],
  { stdio: 'ignore', windowsHide: true },
)
let ws,
  id = 0
const pending = new Map(),
  errors = []
function cdp(method, params = {}) {
  return new Promise((resolve, reject) => {
    const key = ++id
    const timer = setTimeout(() => reject(Error(method + ' timeout')), 15000)
    pending.set(key, {
      resolve: (v) => {
        clearTimeout(timer)
        resolve(v)
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
async function until(expression) {
  for (let i = 0; i < 120; i++) {
    if (await evaluate(expression)) return
    await wait(50)
  }
  assert.fail(expression)
}
async function click(text) {
  await evaluate(
    `Array.from(document.querySelectorAll('button')).find(b=>b.textContent.includes(${JSON.stringify(text)})).click()`,
  )
}
async function input(value) {
  await evaluate(
    `{const e=document.querySelector('select');e.value=${JSON.stringify(value)};e.dispatchEvent(new Event('change',{bubbles:true}))}`,
  )
}
try {
  let target
  for (let i = 0; i < 80; i++) {
    try {
      target = (await (await fetch('http://127.0.0.1:19445/json/list')).json()).find(
        (t) => t.type === 'page',
      )
    } catch {}
    if (target) break
    await wait(100)
  }
  assert.ok(target)
  ws = new WebSocket(target.webSocketDebuggerUrl)
  await new Promise((r, j) => {
    ws.onopen = r
    ws.onerror = j
  })
  ws.onmessage = ({ data }) => {
    const m = JSON.parse(data),
      p = pending.get(m.id)
    if (m.method === 'Runtime.exceptionThrown') errors.push(m.params)
    if (p) {
      pending.delete(m.id)
      m.error ? p.reject(Error(JSON.stringify(m.error))) : p.resolve(m.result)
    }
  }
  await cdp('Page.enable')
  await cdp('Runtime.enable')
  await cdp('Page.navigate', { url: 'http://127.0.0.1:5195/' })
  await until('document.querySelectorAll(".footer a")[1]?.textContent.includes("Freelancers")')
  await evaluate('document.querySelectorAll(".footer a")[1].click()')
  await until('document.querySelector(".profissional h2")')
  assert.equal(await evaluate('document.querySelectorAll("input").length'), 0)
  assert.equal(
    await evaluate('document.querySelector(".categoria-profissional").textContent'),
    'Desenvolvimento',
  )
  assert.equal(await evaluate('window.chamadas[0].params.search'), undefined)
  await click('Chat')
  await until('window.router.currentRoute.value.name==="mensagens"')
  assert.equal(await evaluate('window.router.currentRoute.value.query.freelancer'), '7')
  await evaluate('window.router.back()')
  await until('document.querySelector(".profissional h2")')
  for (const width of [320, 375, 768, 1440]) {
    await cdp('Emulation.setDeviceMetricsOverride', {
      width,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false,
    })
    assert.equal(await evaluate('document.documentElement.scrollWidth<=innerWidth'), true)
    assert.equal(
      await evaluate(
        'document.querySelector(".footer").getBoundingClientRect().bottom <= innerHeight - 10',
      ),
      true,
    )
    assert.equal(
      await evaluate('document.querySelector(".cidade-profissional").textContent.trim()'),
      'Blumenau',
    )
    assert.equal(
      await evaluate('document.querySelector(".especialidades-profissional").textContent.trim()'),
      'Vue',
    )
    await until('document.querySelector(".profissional-linha img")?.naturalWidth > 0')
    assert.equal(
      await evaluate(`{
      const foto=document.querySelector('.profissional-linha img').getBoundingClientRect();
      const nome=document.querySelector('.nome-profissional').getBoundingClientRect();
      foto.right + 6 <= nome.left
    }`),
      true,
      `Foto não invade o nome em ${width}px`,
    )
    if (!process.argv.includes('--sem-capturas')) {
      const shot = await cdp('Page.captureScreenshot', { format: 'png' })
      writeFileSync(resolve(folder, `lista-${width}.png`), Buffer.from(shot.data, 'base64'))
    }
  }
  await click('Próxima')
  await until('document.querySelector(".paginacao [aria-current=page]")?.textContent.includes("2")')
  await click('Anterior')
  await until('document.querySelector(".paginacao [aria-current=page]")?.textContent.includes("1")')
  await input('Vue')
  await wait(100)
  await input('UI/UX')
  await until('document.querySelector(".profissional h2")?.textContent==="UI/UX"')
  await wait(850)
  assert.equal(await evaluate('document.querySelector(".profissional h2").textContent'), 'UI/UX')
  assert.equal(await evaluate('window.chamadas.at(-1).params.page'), 1)
  await until('document.querySelector(".profissional h2")')
  await evaluate('document.querySelector(".nome-profissional").click()')
  await until('document.body.textContent.includes("Descrição pública")')
  assert.equal(await evaluate('document.body.textContent.includes("Projeto publicado de teste")'), true)
  assert.equal(await evaluate('document.body.textContent.includes("Projeto privado de teste")'), false)
  assert.equal(await evaluate('document.body.textContent.includes("NAO-EXIBIR")'), false)
  assert.equal(await evaluate('document.querySelectorAll("a[href^=javascript]").length'), 0)
  const caminhoProjeto = '/empresa/freelancers/7/portfolio/1'
  assert.equal(await evaluate('document.querySelectorAll(".projeto-card-link a").length'), 0)
  await until('document.querySelector(".projeto-card-link img")?.naturalWidth > 0')
  assert.equal(await evaluate('new URL(document.querySelector(".projeto-card-link").href).pathname'), caminhoProjeto)
  await evaluate('document.querySelector(".projeto-card-link").click()')
  await until('document.querySelector(".projeto-detalhe h1")?.textContent==="Projeto publicado de teste"')
  assert.equal(await evaluate('location.pathname'), caminhoProjeto)
  assert.equal(await evaluate('document.querySelector(".projeto-detalhe .descricao").textContent'), 'Descrição completa do projeto')
  assert.deepEqual(await evaluate('[...document.querySelectorAll(".projeto-detalhe .habilidades li")].map(el=>el.textContent)'), ['Vue', 'CSS'])
  assert.equal(await evaluate('document.querySelector(".projeto-detalhe .sobretitulo").textContent'), 'Web')
  await until('document.querySelector(".projeto-detalhe img")?.naturalWidth > 0')
  assert.deepEqual(
    await evaluate('(()=>{const a=document.querySelector(".projeto-detalhe a");return [a.href,a.target,a.rel]})()'),
    ['https://example.org/projeto', '_blank', 'noopener noreferrer'],
  )
  for (const width of [320, 1440]) {
    await cdp('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: width < 500 })
    assert.equal(await evaluate('document.documentElement.scrollWidth <= innerWidth'), true)
  }
  await cdp('Page.reload')
  await until('document.querySelector(".projeto-detalhe h1")?.textContent==="Projeto publicado de teste"')
  assert.equal(await evaluate('location.pathname'), caminhoProjeto)
  assert.match(await evaluate('document.querySelector(".projeto-detalhe header").textContent'), /Profissional de teste/)
  await evaluate('document.querySelector(".voltar-perfil").click()')
  await until('location.pathname==="/empresa/freelancers/7" && document.querySelector(".projeto-card-link")')
  await evaluate('document.querySelector(".diretorio > button").focus()')
  await cdp('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 })
  assert.equal(await evaluate('document.activeElement.matches(".projeto-card-link:focus-visible") && getComputedStyle(document.activeElement).outlineStyle==="solid"'), true)
  await cdp('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 })
  await until('document.querySelector(".projeto-detalhe h1")')
  await cdp('Page.navigate', { url: 'http://127.0.0.1:5195/empresa/freelancers/7/portfolio/2' })
  await until('location.pathname.endsWith("/portfolio/2") && document.querySelector("[role=alert] h1")?.textContent==="Projeto não encontrado ou indisponível"')
  assert.equal(await evaluate('window.chamadas.some(({url})=>url.startsWith("portfolios/"))'), false)
  await evaluate('window.modo="404";window.router.push("/empresa/freelancers/7?revogado=1")')
  await until('document.body.textContent.includes("Perfil indisponível")')
  await evaluate('window.router.push("/empresa/freelancers/7/portfolio/1")')
  await until('document.querySelector("[role=alert] h1")?.textContent==="Projeto não encontrado ou indisponível"')
  await evaluate('window.modo="normal";window.router.push("/empresa/freelancers/7?habilidade=UI%2FUX")')
  await until('document.querySelector(".projeto-card-link")')
  await click('Voltar')
  await until('document.querySelector("select")?.value==="UI/UX"')
  await until('document.querySelector(".profissional h2")')
  await evaluate('window.modo="vazio"')
  await input('Design Gráfico')
  await until('document.body.textContent.includes("Nenhum freelancer disponível nesta categoria")')
  await input('')
  await until('document.body.textContent.includes("Nenhum freelancer publicou o perfil")')
  await evaluate('window.modo="erro"')
  await input('React')
  await until('document.querySelector("[role=alert]")')
  await evaluate('window.modo="normal"')
  await click('Tentar novamente')
  await until('document.querySelector(".profissional h2")')
  await evaluate('window.modo="404";window.router.push("/empresa/freelancers/999")')
  await until('document.body.textContent.includes("Perfil indisponível")')
  await evaluate(
    'window.modo="normal";window.trocarParaFreelancer();window.router.push("/editar-perfil")',
  )
  await until(
    'document.querySelector("#perfil-publico") && !document.querySelector("#perfil-publico").disabled',
  )
  assert.equal(await evaluate('document.querySelector("#perfil-publico").checked'), false)
  await evaluate('window.router.push("/empresa/freelancers/7/portfolio/1")')
  await until('location.pathname==="/home"')
  assert.equal(await evaluate('Boolean(document.querySelector(".projeto-detalhe"))'), false)
  await evaluate('window.router.push("/editar-perfil")')
  await until('document.querySelector("#perfil-publico") && !document.querySelector("#perfil-publico").disabled')
  assert.equal(await evaluate('document.querySelector("#cidade-publica").value'), '')
  await evaluate('document.querySelector("#perfil-publico").click()')
  await click('Salvar alterações')
  await until('document.body.textContent.includes("Perfil atualizado com sucesso")')
  assert.equal(await evaluate('window.perfilProprio.perfil_publico'), true)
  assert.equal(await evaluate('window.perfilProprio.cidade_publica'), '')
  await evaluate('document.querySelector("#perfil-publico").click()')
  await click('Salvar alterações')
  await until(
    '!window.perfilProprio.perfil_publico && !document.querySelector("#perfil-publico").disabled',
  )
  assert.deepEqual(
    await evaluate(
      '[...document.querySelectorAll(".footer a.item")].map(link => link.getAttribute("href"))',
    ),
    ['/home', '/freelances', '/mensagens', '/notificacoes', '/perfil'],
  )
  for (const width of [320, 375, 768, 1440]) {
    await cdp('Emulation.setDeviceMetricsOverride', {
      width,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false,
    })
    assert.equal(
      await evaluate(`{
      const footer = document.querySelector('.footer').getBoundingClientRect();
      const sidebar = document.querySelector('.desktop-nav').getBoundingClientRect();
      const conteudo = document.querySelector('.app-content').getBoundingClientRect();
      ${width >= 1024
        ? 'footer.width === 0 && sidebar.width === 240 && conteudo.left >= sidebar.right'
        : 'sidebar.width === 0 && footer.width > 0 && footer.left >= 10 && footer.right <= innerWidth - 10 && footer.bottom <= innerHeight - 10'}
    }`),
      true,
      `Navegação do usuário em ${width}px`,
    )
  }
  assert.deepEqual(errors, [])
  console.log(
    'PASSOU: lista automática sem pesquisa, categorias, troca rápida sem resposta antiga, paginação, Chat com ID correto, retorno preservado, vazio/erro/404, privacidade e quatro larguras; transporte isolado.',
  )
} finally {
  ws?.close()
  chrome.kill()
  await vite.close()
}
