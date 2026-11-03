// Teste local de UI com Axios simulado; nenhum contato real é aberto.
import { createServer } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'node:path'
import { mkdirSync, writeFileSync, existsSync } from 'node:fs'
import { spawn } from 'node:child_process'
import assert from 'node:assert/strict'
import { setTimeout as esperar } from 'node:timers/promises'
const chrome = process.env.CHROME_BIN || 'C:/Program Files/Google/Chrome/Application/chrome.exe'
assert.ok(existsSync(chrome), 'Configure CHROME_BIN.')
const pasta = resolve('node_modules/.cache/feat44-browser')
mkdirSync(pasta, { recursive: true })
const roteiro = `
import {createApp,h,nextTick} from 'vue'
import {createRouter,createMemoryHistory} from 'vue-router'
import {createPinia} from 'pinia'
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome'
import {library} from '@fortawesome/fontawesome-svg-core'
import {fas} from '@fortawesome/free-solid-svg-icons'
import axios from 'axios'
import '/src/assets/main.css'
import '@fortawesome/fontawesome-free/css/all.min.css'
import App from '/src/App.vue'
import {routes} from '/src/router/routes.js'
import {instalarProtecao} from '/src/router/authGuard.js'
import api from '/src/services/api.js'
import {sessao} from '/src/services/authSession.js'
library.add(fas);api.defaults.baseURL='/api/'
const scenario=new URLSearchParams(location.search).get('scenario')||'lista'
const profissional={id:7,name:'Profissional de teste com nome extenso',profissao:'Especialista em desenvolvimento e design',habilidades:['Vue.js','API','Acessibilidade'],profile_image:'/__imagem44',email:'email-privado@teste.invalid',telefone:'telefone-privado',latitude:-26.12345,groups:['administrativo']}
let lista=[
{id:31,candidatura:12,status:'pendente',lida:false},
{id:32,candidatura:13,status:'aprovada',lida:false},
{id:33,candidatura:14,status:'aprovada',lida:true},
{id:34,candidatura:15,status:'recusada',lida:true},
{id:45,candidatura:29,status:'pendente',lida:false}
].map(n=>({...n,freelancer:7,freelancer_detalhes:profissional,oportunidade:45,oportunidade_titulo:'Oportunidade com título longo para teste de quebra de linha e layout compacto',candidatura_criado_em:'2026-11-03T12:00:00-03:00',criado_em:'2026-11-03T13:00:00-03:00'}))
const requests=[];let falha=scenario==='erro'
sessao.usuario={id:80,name:'Empresa de teste',groups:['Empresa']};sessao.tipo='empresa';localStorage.setItem('token','jwt-somente-teste')
function candidatura(n){return {id:n.candidatura,freelancer:n.freelancer,oportunidade:n.oportunidade,status:n.status,freelancer_detalhes:profissional,whatsapp:{disponivel:n.status==='aprovada'&&n.candidatura!==14,modo:'link',url:n.status==='aprovada'&&n.candidatura!==14?'https://wa.me/5547999999999?text=Ol%C3%A1%21+Teste':null,mensagem_enviada:false}}}
function erro(c,status){throw new axios.AxiosError('erro de teste','ERR_BAD_RESPONSE',c,null,{status,data:{detail:'erro de teste'},config:c,headers:{}})}
api.defaults.adapter=async config=>{
 requests.push({url:config.url,method:config.method,params:config.params})
 let data,status=200
 if(config.url==='notificacoes/') {
  if(falha)erro(config,503)
  const filtered=scenario==='vazio'?[]:lista.filter(n=>!config.params.status||n.status===config.params.status)
  const p=config.params.page||1,per=4,count=filtered.length
  const params=config.params.status?'&status='+config.params.status:''
  data={count,results:filtered.slice((p-1)*per,p*per),next:p*per<count?'?page='+(p+1)+params:null,previous:p>1?'?page='+(p-1)+params:null}
 } else if(config.url.includes('/marcar-lida/')) {const id=Number(config.url.split('/')[1]);const n=lista.find(n=>n.id===id);n.lida=true;data={...n}}
 else if(config.url.startsWith('candidaturas/')) {
  const id=Number(config.url.split('/')[1]),n=lista.find(n=>n.candidatura===id)
  if(config.method==='post') {
   await new Promise(r=>setTimeout(r,100))
   if(scenario==='conflito'){n.status='recusada';erro(config,409)}
   n.status=config.url.includes('/aprovar/')?'aprovada':'recusada'
  }
  data=candidatura(n)
 } else if(config.url==='freelances/')data={count:0,results:[],next:null,previous:null}
 else if(config.url==='usuarios/me/')data=sessao.usuario
 else throw Error('Requisição não esperada '+config.url)
 return {config,status,data,headers:{},statusText:''}
}
const testRoutes=routes.map(r=>r.name==='login'?{...r,component:{render:()=>h('p','Entre novamente')}}:r)
const router=createRouter({history:createMemoryHistory(),routes:testRoutes});instalarProtecao(router)
await router.push('/empresa/notificacoes');await router.isReady()
const app=createApp(App);app.use(createPinia());app.use(router);app.component('FontAwesomeIcon',FontAwesomeIcon);app.mount('#app')
await new Promise(r=>setTimeout(r,180));await nextTick();await document.fonts.ready
window.teste={router,requests,set falha(v){falha=v}}
document.body.dataset.pronto='sim'
`
const vite = await createServer({
  configFile: false,
  plugins: [
    vue(),
    {
      name: 'feat44-harness',
      resolveId(id) {
        if (id === '/__runner44.js') return '\0feat44-runner'
      },
      load(id) {
        if (id === '\0feat44-runner') return roteiro
      },
      configureServer(s) {
        s.middlewares.use('/__imagem44', (req, res) => {
          res.setHeader('Content-Type', 'image/svg+xml')
          res.end(
            '<svg xmlns="http://www.w3.org/2000/svg" width="60" height="100"><rect width="100%" height="100%" fill="#ba9ee0"/><circle cx="30" cy="30" r="15" fill="#7548bd"/></svg>',
          )
        })
        s.middlewares.use('/__feat44', (req, res) => {
          res.setHeader('Content-Type', 'text/html;charset=utf-8')
          res.end(
            '<!doctype html><html lang="pt-BR"><meta name="viewport" content="width=device-width,initial-scale=1"><body><div id="app"></div><script type="module" src="/__runner44.js"></script></body></html>',
          )
        })
      },
    },
  ],
  resolve: { alias: { '@': resolve('src') } },
  server: { host: '127.0.0.1', port: 5194, strictPort: true },
  appType: 'custom',
})
await vite.listen()
const proc = spawn(
  chrome,
  [
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    `--user-data-dir=${pasta}/chrome-profile`,
    '--remote-debugging-port=19444',
    'about:blank',
  ],
  { windowsHide: true, stdio: 'ignore' },
)
let ws,
  id = 0
const pendentes = new Map()
async function cdp(method, params = {}) {
  const n = ++id
  return new Promise((resolve, reject) => {
    pendentes.set(n, { resolve, reject })
    ws.send(JSON.stringify({ id: n, method, params }))
  })
}
async function avaliar(expression) {
  const r = await cdp('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
  if (r.exceptionDetails) throw Error(JSON.stringify(r.exceptionDetails))
  return r.result.value
}
async function aguardar(expression) {
  for (let i = 0; i < 100; i++) {
    if (await avaliar(expression)) return
    await esperar(40)
  }
  throw Error('Timeout: ' + expression)
}
async function foto(nome) {
  const r = await cdp('Page.captureScreenshot', { format: 'png' })
  writeFileSync(resolve(pasta, nome + '.png'), Buffer.from(r.data, 'base64'))
}
const clicarTexto = (selector, texto) =>
  avaliar(
    `(()=>{const el=[...document.querySelectorAll(${JSON.stringify(selector)})].find(el=>el.textContent.trim()===${JSON.stringify(texto)});el.focus();el.click()})()`,
  )
const semOverflow = async () =>
  assert.ok(
    await avaliar('document.documentElement.scrollWidth<=innerWidth'),
    'Overflow horizontal',
  )
try {
  let target
  for (let i = 0; i < 80; i++) {
    try {
      target = (await (await fetch('http://127.0.0.1:19444/json/list')).json()).find(
        (t) => t.type === 'page',
      )
      if (target) break
    } catch {}
    await esperar(100)
  }
  assert.ok(target, 'Chrome indisponível')
  ws = new WebSocket(target.webSocketDebuggerUrl)
  await new Promise((r, j) => {
    ws.onopen = r
    ws.onerror = j
  })
  ws.onmessage = (event) => {
    const m = JSON.parse(event.data),
      p = pendentes.get(m.id)
    if (p) {
      pendentes.delete(m.id)
      m.error ? p.reject(Error(JSON.stringify(m.error))) : p.resolve(m.result)
    }
  }
  await cdp('Page.enable')
  let total = 0
  for (const largura of [320, 375, 768, 1280])
    for (const scenario of ['lista', 'vazio', 'erro', 'conflito', 'sessao']) {
      await cdp('Emulation.setDeviceMetricsOverride', {
        width: largura,
        height: 1000,
        deviceScaleFactor: 1,
        mobile: largura < 500,
      })
      await cdp('Page.navigate', { url: 'http://127.0.0.1:5194/__feat44?scenario=' + scenario })
      await aguardar("document.body.dataset.pronto==='sim'")
      await semOverflow()
      assert.equal(await avaliar("document.querySelectorAll('footer').length"), 1)
      assert.ok(
        await avaliar(
          'document.querySelector(\'.empresa-header a[aria-label="Notificações de candidaturas"]\')!==null',
        ),
      )
      if (scenario === 'lista') {
        await aguardar(
          "document.querySelectorAll('.card').length===4 && document.querySelectorAll('.whatsapp').length===1",
        )
        assert.ok(
          await avaliar(
            "!document.body.innerText.includes('email-privado')&&!document.body.innerText.includes('telefone-privado')&&!document.body.innerText.includes('-26.12345')",
          ),
        )
        assert.ok(
          await avaliar("document.querySelector('.resumo').textContent.includes('5 notificações')"),
        )
        await foto('lista-' + largura)
        await clicarTexto('.card:first-child button', 'Visualizar candidato')
        await aguardar(
          "document.querySelector('dialog')?.open && !document.querySelector('dialog [role=status]')",
        )
        assert.ok(
          await avaliar("document.querySelector('dialog').innerText.includes('Acessibilidade')"),
        )
        assert.equal(await avaliar('document.activeElement.textContent.trim()'), 'Fechar')
        assert.equal(await avaliar("document.querySelector('dialog img').naturalWidth>0"), true)
        await semOverflow()
        await foto('candidato-' + largura)
        await cdp('Input.dispatchKeyEvent', {
          type: 'keyDown',
          key: 'Escape',
          code: 'Escape',
          windowsVirtualKeyCode: 27,
        })
        await cdp('Input.dispatchKeyEvent', {
          type: 'keyUp',
          key: 'Escape',
          code: 'Escape',
          windowsVirtualKeyCode: 27,
        })
        await aguardar("!document.querySelector('dialog')")
        assert.equal(
          await avaliar('document.activeElement.textContent.trim()'),
          'Visualizar candidato',
        )
        await clicarTexto('.card:first-child button', 'Marcar como lida')
        await aguardar(
          "document.querySelector('.card:first-child .leitura').textContent.includes('Lida')",
        )
        assert.ok(
          await avaliar(
            "window.teste.requests.some(r=>r.method==='patch'&&r.url==='notificacoes/31/marcar-lida/')",
          ),
        )
        await clicarTexto('.paginacao button', 'Próxima')
        await aguardar("document.querySelector('.resumo')?.textContent.includes('Página 2')")
        await clicarTexto('.filtros button', 'Pendentes')
        await aguardar(
          "document.querySelector('.resumo')?.textContent.includes('Página 1') && document.querySelectorAll('.card').length===2",
        )
        await clicarTexto('.card:first-child button', 'Aprovar')
        await aguardar("document.querySelector('dialog')?.open")
        assert.equal(await avaliar('document.activeElement.textContent.trim()'), 'Cancelar')
        await clicarTexto('dialog button', 'Cancelar')
        assert.equal(await avaliar("window.teste.requests.filter(r=>r.method==='post').length"), 0)
        await clicarTexto('.card:first-child button', 'Aprovar')
        await clicarTexto('dialog button', 'Confirmar aprovação')
        await aguardar("document.querySelector('dialog button.principal')?.disabled===true")
        await aguardar(
          "!document.querySelector('dialog') && document.querySelector('.sucesso')?.textContent.includes('aprovada') && document.querySelectorAll('.card').length===1",
        )
        assert.ok(
          await avaliar("window.teste.requests.some(r=>r.url==='candidaturas/12/aprovar/')"),
        )
        await clicarTexto('.filtros button', 'Aprovadas')
        await aguardar(
          "document.querySelectorAll('.card').length===3 && document.querySelectorAll('.whatsapp').length===2",
        )
        const link = await avaliar(
          "({href:document.querySelector('.whatsapp').getAttribute('href'),target:document.querySelector('.whatsapp').target,rel:document.querySelector('.whatsapp').rel})",
        )
        assert.equal(link.href, 'https://wa.me/5547999999999?text=Ol%C3%A1%21+Teste')
        assert.equal(link.target, '_blank')
        assert.ok(link.rel.includes('noopener') && link.rel.includes('noreferrer'))
        assert.ok(!link.href.includes('jwt'))
        await foto('aprovadas-' + largura)
        await clicarTexto('.filtros button', 'Pendentes')
        await aguardar(
          "document.querySelectorAll('.card').length===1 && document.querySelector('.card .status').textContent==='Pendente'",
        )
        await clicarTexto('.card button', 'Recusar')
        await clicarTexto('dialog button', 'Confirmar recusa')
        await aguardar(
          "document.querySelector('.sucesso')?.textContent.includes('recusada') && !document.querySelector('dialog')",
        )
        assert.ok(
          await avaliar("window.teste.requests.some(r=>r.url==='candidaturas/29/recusar/')"),
        )
        assert.ok(
          await avaliar("window.teste.requests.every(r=>!r.url.startsWith('https://wa.me'))"),
        )
      } else if (scenario === 'vazio') {
        assert.ok(
          await avaliar("document.body.innerText.includes('Nenhuma notificação por enquanto')"),
        )
        await foto('vazio-' + largura)
      } else if (scenario === 'erro') {
        assert.ok(
          await avaliar(
            "document.querySelector('[role=alert]').textContent.includes('temporariamente')",
          ),
        )
        await foto('erro-' + largura)
        await avaliar('window.teste.falha=false')
        await clicarTexto('.estado button', 'Tentar novamente')
        await aguardar("document.querySelectorAll('.card').length===4")
      } else if (scenario === 'conflito') {
        await clicarTexto('.card:first-child button', 'Aprovar')
        await clicarTexto('dialog button', 'Confirmar aprovação')
        await aguardar(
          "!document.querySelector('dialog') && document.querySelector('.card:first-child .status')?.textContent==='Recusada'",
        )
        assert.ok(
          await avaliar(
            "document.querySelector('[role=alert]').textContent.includes('já foi analisada')",
          ),
        )
        assert.equal(await avaliar("window.teste.requests.filter(r=>r.method==='post').length"), 1)
        await foto('conflito-' + largura)
      } else {
        await clicarTexto('footer button', 'Sair')
        await aguardar("window.teste.router.currentRoute.value.name==='login'")
        assert.ok(
          await avaliar(
            "!document.body.innerText.includes('Profissional de teste')&&!document.querySelector('.whatsapp')",
          ),
        )
      }
      await semOverflow()
      console.log('PASSOU', scenario, largura)
      total++
    }
  console.log(total + '/20 cenários de navegador aprovados; artefatos: ' + pasta)
} finally {
  ws?.close()
  proc.kill()
  await vite.close()
}
