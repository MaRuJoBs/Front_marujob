// Componentes, router e Axios reais; contas, projetos e imagens simulados somente neste teste.
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { setTimeout as aguardar } from 'node:timers/promises'
import { createServer } from 'vite'
import vue from '@vitejs/plugin-vue'

const chrome = process.env.CHROME_BIN || 'C:/Program Files/Google/Chrome/Application/chrome.exe'
assert.ok(existsSync(chrome), 'Configure CHROME_BIN com o caminho do Chrome.')
const artefatos = resolve('node_modules/.cache/perfil-portfolio-navegador')
mkdirSync(artefatos, { recursive: true })
const png = readFileSync(resolve('public/icons/icon-192.png')).toString('base64')
const roteiro = `
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import axios from 'axios'
import App from '/src/App.vue'
import { routes } from '/src/router/routes.js'
import { instalarProtecao } from '/src/router/authGuard.js'
import { loginComGoogle, logout } from '/src/services/authService.js'
import { sessao } from '/src/services/authSession.js'
import api from '/src/services/api.js'
import '/src/assets/main.css'
import '@fortawesome/fontawesome-free/css/all.min.css'
library.add(fas)
let conta=440, foto=null, falha=null, atraso=0
const consultas=[]
const projeto=id=>({id,titulo:'Projeto de teste #'+id,categoria:'Website',descricao:'Descricao exclusiva do teste',tags:['Vue.js'],link:'https://example.com',imagem:'/media/projeto.png'})
const projetos=[projeto(1),projeto(27)]
localStorage.removeItem('token');localStorage.removeItem('refresh')
localStorage.removeItem('marujobs:foto-google:usuario:440')
localStorage.removeItem('marujobs:foto-google:usuario:441')
api.defaults.adapter=async config=>{
 const url=new URL(config.url,'https://teste.invalid/api/'), path=url.pathname
 consultas.push({path,method:config.method,form:config.data instanceof FormData,campos:config.data instanceof FormData?Object.fromEntries([...config.data.entries()].map(([k,v])=>[k,v instanceof File?v.name:v])):null})
 if(atraso) await new Promise(r=>setTimeout(r,atraso))
 if(path.endsWith('/portfolios/') && config.method==='post' && falha!==null) throw new axios.AxiosError('Falha simulada','ERR_TEST',config,null,falha?{status:falha,data:{imagem:['Arquivo recusado no teste.']}}:undefined)
 let data,status=200
 if(path.endsWith('/auth/google/'))data={access:'access-exclusivo-teste',refresh:'refresh-exclusivo-teste'}
 else if(path.endsWith('/usuarios/me/'))data={id:conta,name:'Conta de teste',email:'teste@example.com',groups:['Usuário'],profile_image:foto}
 else if(path.endsWith('/freelances/'))data={count:0,next:null,previous:null,results:[]}
 else if(path.endsWith('/portfolios/')){
  if(config.method==='post'){
   data={id:100,...Object.fromEntries(config.data.entries()),tags:JSON.parse(config.data.get('tags')),imagem:config.data.has('imagem')?'/media/projeto.png':null};projetos.push(data);status=201
  }else{const page=Number(url.searchParams.get('page')||1);data={count:projetos.length,next:page===1?'?page=2':null,previous:page===2?'?page=1':null,results:page===1?projetos.slice(0,1):projetos.slice(1)}}
 }else if(/\\/portfolios\\/\\d+\\/$/.test(path)){
  const id=Number(path.split('/').at(-2)), item=projetos.find(p=>p.id===id)
  if(config.method==='patch'){Object.assign(item,Object.fromEntries(config.data.entries()),{tags:JSON.parse(config.data.get('tags'))})}
  data=item
 }else throw Error('Consulta inesperada: '+path)
 return {config,data,status,headers:{},statusText:''}
}
await loginComGoogle('e30.'+btoa(JSON.stringify({iss:'https://accounts.google.com',picture:'https://lh3.googleusercontent.com/a/foto-teste'}))+'.assinaturaDeTeste')
const app=createApp(App);app.component('FontAwesomeIcon',FontAwesomeIcon);app.use(createPinia())
const router=createRouter({history:createMemoryHistory(),routes});instalarProtecao(router);app.use(router)
await router.push('/perfil');await router.isReady();app.mount('#app')
window.testePerfil={consultas,projetos,ir:p=>router.push(p),rota:()=>router.currentRoute.value.path,falhar:s=>{falha=s},atrasar:s=>{atraso=s},foto:v=>{foto=v},sessao,
 conta:async id=>{logout();conta=id;await loginComGoogle('credencial-sem-foto-do-teste');await router.push('/perfil')},
}
document.body.dataset.pronto='sim'
`
const vite = await createServer({
  configFile: false,
  mode: 'test',
  plugins: [
    vue(),
    {
      name: 'perfil-portfolio-teste',
      configureServer(server) {
        server.middlewares.use('/__perfil', (_req, res) => {
          res.setHeader('Content-Type', 'text/html')
          res.end(
            '<!doctype html><html lang="pt-BR"><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0"><div id="app"></div><script type="module" src="/@id/virtual:perfil"></script></body></html>',
          )
        })
      },
      resolveId(id) {
        if (id === 'virtual:perfil') return '\0perfil'
      },
      load(id) {
        if (id === '\0perfil') return roteiro
      },
    },
  ],
  resolve: { alias: { '@': resolve('src') } },
  server: { host: '127.0.0.1', port: 5189, strictPort: true, hmr: false },
})
await vite.listen()
const navegador = spawn(
  chrome,
  [
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    '--remote-debugging-port=9343',
    '--user-data-dir=' + resolve(artefatos, 'perfil'),
    'about:blank',
  ],
  { windowsHide: true, stdio: 'ignore' },
)
let socket
try {
  let targets
  for (let i = 0; i < 100; i++) {
    try {
      targets = await (await fetch('http://127.0.0.1:9343/json/list')).json()
      break
    } catch {
      await aguardar(100)
    }
  }
  assert.ok(targets, 'Chrome indisponível')
  socket = new WebSocket(targets.find((t) => t.type === 'page').webSocketDebuggerUrl)
  await new Promise((r, j) => {
    socket.addEventListener('open', r, { once: true })
    socket.addEventListener('error', j, { once: true })
  })
  let seq = 0
  const pendentes = new Map(),
    erros = []
  function enviar(method, params = {}) {
    return new Promise((r, j) => {
      const id = ++seq,
        t = setTimeout(() => {
          pendentes.delete(id)
          j(Error('Timeout CDP: ' + method))
        }, 20000)
      pendentes.set(id, {
        resolve: (v) => {
          clearTimeout(t)
          r(v)
        },
        reject: (e) => {
          clearTimeout(t)
          j(e)
        },
      })
      socket.send(JSON.stringify({ id, method, params }))
    })
  }
  socket.addEventListener('message', (event) => {
    const m = JSON.parse(event.data)
    if (m.id) {
      const p = pendentes.get(m.id)
      pendentes.delete(m.id)
      if (m.error) p?.reject(Error(m.error.message))
      else p?.resolve(m.result)
    }
    if (m.method === 'Runtime.exceptionThrown')
      erros.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text)
    if (m.method === 'Fetch.requestPaused')
      enviar('Fetch.fulfillRequest', {
        requestId: m.params.requestId,
        responseCode: m.params.request.url.includes('ausente') ? 404 : 200,
        responseHeaders: [{ name: 'Content-Type', value: 'image/png' }],
        body: m.params.request.url.includes('ausente') ? '' : png,
      }).catch((e) => erros.push(e.message))
  })
  const avaliar = async (expression) => {
    const r = await enviar('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true,
    })
    if (r.exceptionDetails)
      throw Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text)
    return r.result.value
  }
  async function esperar(expression) {
    for (let i = 0; i < 150; i++) {
      if (await avaliar(expression)) return
      await aguardar(100)
    }
    throw Error(
      'Tempo esgotado: ' +
        expression +
        ' ' +
        JSON.stringify(
          await avaliar(
            "({imagem:document.querySelector('.img-usu')?.innerHTML,erros:document.querySelector('[role=alert]')?.textContent})",
          ),
        ),
    )
  }
  const clicar = (s) => avaliar(`document.querySelector(${JSON.stringify(s)}).click()`)
  const ir = async (path, pronto) => {
    await avaliar(`testePerfil.ir(${JSON.stringify(path)})`)
    await esperar(pronto)
  }
  await enviar('Runtime.enable')
  await enviar('Page.enable')
  await enviar('Fetch.enable', {
    patterns: [{ urlPattern: '*googleusercontent.com/*' }, { urlPattern: '*/media/*' }],
  })
  await enviar('Page.navigate', { url: 'http://127.0.0.1:5189/__perfil' })
  await esperar(
    "document.body?.dataset.pronto==='sim' && !!document.querySelector('.img-usu img') && document.querySelectorAll('.portfolio-card').length===2",
  )
  assert.equal(
    await avaliar("document.querySelector('.img-usu img').src"),
    'https://lh3.googleusercontent.com/a/foto-teste',
  )
  assert.equal(
    await avaliar("document.querySelector('.img-usu img').referrerPolicy"),
    'no-referrer',
  )
  await avaliar("testePerfil.foto('/media/enviada.png')")
  await ir('/portfolio', "document.querySelectorAll('.grid .card').length===2")
  assert.ok(
    (await avaliar("document.querySelector('.avatar img').src")).endsWith('/media/enviada.png'),
  )
  await avaliar("testePerfil.foto('/media/ausente.png')")
  await ir('/perfil', "document.querySelector('.img-usu img')?.src.includes('googleusercontent')")
  console.log(
    'PASSOU: foto Google no perfil, foto enviada prioritária, fallback de imagem quebrada e projetos da página 2.',
  )
  await ir(
    '/editar-perfil',
    "document.querySelector('.foto-container img')?.src.includes('googleusercontent')",
  )

  await ir('/portfolio/adicionar', "!!document.querySelector('.formulario')")
  assert.equal(await avaliar("document.querySelectorAll('.tags .tag').length"), 0)
  await avaliar(
    "document.querySelector('#projeto-titulo').value='Projeto do navegador';document.querySelector('#projeto-titulo').dispatchEvent(new Event('input',{bubbles:true}));document.querySelector('#projeto-categoria').value='Website';document.querySelector('#projeto-categoria').dispatchEvent(new Event('change',{bubbles:true}));document.querySelector('#projeto-descricao').value='Descricao do projeto';document.querySelector('#projeto-descricao').dispatchEvent(new Event('input',{bubbles:true}));document.querySelector('#projeto-link').value='example.com/projeto';document.querySelector('#projeto-link').dispatchEvent(new Event('input',{bubbles:true}))",
  )
  await avaliar(
    `{const data=new DataTransfer();data.items.add(new File([Uint8Array.from(atob('${png}'),c=>c.charCodeAt(0))],'capa.png',{type:'image/png'}));const input=document.querySelector('input[type=file]');input.files=data.files;input.dispatchEvent(new Event('change',{bubbles:true}))}`,
  )
  await avaliar('testePerfil.falhar(400)')
  await clicar('.salvar')
  await esperar(
    "document.querySelector('[role=alert]')?.textContent.includes('Imagem: Arquivo recusado')",
  )
  assert.equal(
    await avaliar("document.querySelector('#projeto-titulo').value"),
    'Projeto do navegador',
  )
  assert.equal(await avaliar("!!document.querySelector('.toast-sucesso')"), false)
  await avaliar('testePerfil.falhar(null);testePerfil.atrasar(300)')
  await avaliar("{const b=document.querySelector('.salvar');b.click();b.click()}")
  await esperar("!!document.querySelector('.toast-sucesso')")
  await esperar(
    "testePerfil.rota()==='/portfolio' && document.querySelectorAll('.grid .card').length===3",
  )
  assert.equal(
    await avaliar(
      "testePerfil.consultas.filter(c=>c.method==='post' && c.path.endsWith('/portfolios/')).length",
    ),
    2,
  )
  assert.equal(
    await avaliar("testePerfil.consultas.findLast(c=>c.method==='post').campos.imagem"),
    'capa.png',
  )
  assert.equal(
    await avaliar("testePerfil.consultas.findLast(c=>c.method==='post').campos.link"),
    'https://example.com/projeto',
  )
  await avaliar('testePerfil.atrasar(0)')
  await clicar('.grid a[href="/portfolio/100"]')
  await esperar("document.querySelector('.cabecalho h1')?.textContent==='Projeto do navegador'")
  await clicar('.editar')
  await esperar("document.querySelector('#projeto-titulo')?.value==='Projeto do navegador'")
  await avaliar(
    "{const input=document.querySelector('#projeto-titulo');input.value='Projeto editado';input.dispatchEvent(new Event('input',{bubbles:true}))}",
  )
  await clicar('.salvar')
  await esperar(
    "testePerfil.rota()==='/portfolio' && document.body.textContent.includes('Projeto editado')",
  )
  await ir('/perfil', "document.body.textContent.includes('Projeto editado')")
  console.log(
    'PASSOU: upload multipart, erro 400 visível, campos preservados, POST único, gravação 201, edição PATCH e atualização de perfil/lista.',
  )
  await avaliar('testePerfil.conta(441)')
  await esperar("!!document.querySelector('.img-usu span')")
  assert.equal(await avaliar("!!document.querySelector('.img-usu img')"), false)
  await avaliar('testePerfil.conta(440)')
  await esperar("document.querySelector('.img-usu img')?.src.includes('googleusercontent')")
  console.log('PASSOU: foto isolada entre contas e restaurada ao retornar ao usuário.')
  for (const largura of [320, 375, 768, 1440]) {
    await enviar('Emulation.setDeviceMetricsOverride', {
      width: largura,
      height: 950,
      deviceScaleFactor: 1,
      mobile: largura < 768,
    })
    for (const [nome, path, seletor] of [
      ['perfil', '/perfil', '.img-usu'],
      ['portfolio', '/portfolio', '.grid .card'],
      ['adicionar', '/portfolio/adicionar', '.formulario'],
    ]) {
      await ir(path, `!!document.querySelector(${JSON.stringify(seletor)})`)
      assert.equal(
        await avaliar('document.documentElement.scrollWidth<=innerWidth'),
        true,
        `${nome}: overflow em ${largura}px`,
      )
      const shot = await enviar('Page.captureScreenshot', { format: 'png' })
      writeFileSync(resolve(artefatos, `${nome}-${largura}.png`), Buffer.from(shot.data, 'base64'))
    }
  }
  assert.deepEqual(erros, [])
  console.log(
    'PASSOU: 12 verificações de layout em Chrome, sem exceções JavaScript. Capturas: ' + artefatos,
  )
} finally {
  socket?.close()
  navegador.kill()
  await vite.close()
}
