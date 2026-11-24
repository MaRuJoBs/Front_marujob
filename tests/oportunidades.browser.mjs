// Teste visual opcional: CHROME_BIN=/caminho/chrome node tests/oportunidades.browser.mjs
// API simulada somente no servidor de teste; componentes e estilos reais do frontend.
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { setTimeout as wait } from 'node:timers/promises'
import { createServer } from 'vite'
import vue from '@vitejs/plugin-vue'

const chrome = process.env.CHROME_BIN || 'C:/Program Files/Google/Chrome/Application/chrome.exe'
assert.ok(existsSync(chrome), 'Configure CHROME_BIN com um navegador Chrome disponível.')
const artefatos = resolve('node_modules/.cache/feat37-redesign')
mkdirSync(artefatos, { recursive: true })
const roteiro = `
import { createApp, nextTick } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import App from '/src/App.vue'
import Listagem from '/src/views/FreelancesView.vue'
import Detalhes from '/src/components/OportunidadeDetalheComponent.vue'
import api from '/src/services/api.js'
import { sessao } from '/src/services/authSession.js'
import '/src/assets/main.css'
import '@fortawesome/fontawesome-free/css/all.min.css'
library.add(fas)
localStorage.clear()
sessao.usuario = { id: 37, name: 'Conta de teste', groups: ['Usuário'] }
sessao.tipo = 'usuario'
const consultas = []
let incompleto=false, longo=false, fechada=false
const item = id => incompleto ? {id,titulo:'Campos opcionais ausentes',descricao:null,tag:null,preco:null,tempo:null} : ({
 id, titulo:longo ? 'TítuloExtensoSemEspaços'.repeat(30) : 'Projeto de identidade visual',
 descricao:'Desenvolver a identidade visual de um projeto e organizar os arquivos finais.',
 tag:'design', preco:'200.00', tempo:'20', status:fechada && id===2?'encerrada':undefined,
 ...(id===1?{empresa:10,empresa_nome:'Estúdio Um',empresa_foto:location.origin+'/src/assets/images/logo.png'}:{}),
 ...(id===2?{empresa:20,empresa_nome:'Estúdio Dois',empresa_foto:location.origin+'/src/assets/images/slogan.png'}:{}),
})
api.defaults.adapter = async config => {
  consultas.push(config)
  const page = Number(config.params?.page || 1)
  const data = config.url === 'freelances/'
    ? {count:11,next:page===1?'?page=2':null,previous:page===2?'?page=1':null,results:Array.from({length:page===1?10:1},(_,i)=>item((page-1)*10+i+1))}
    : item(Number(config.url.split('/').at(-2)))
  return {config,data,status:200,headers:{},statusText:''}
}
const router = createRouter({history:createMemoryHistory(),routes:[{path:'/freelances',component:Listagem},{path:'/oportunidade/:id',component:Detalhes}]})
const app = createApp(App)
app.use(createPinia())
app.component('FontAwesomeIcon',FontAwesomeIcon)
app.use(router)
const screen = new URLSearchParams(location.search).get('screen')
const esperar = async teste => {for(let i=0;i<200;i++){if(teste())return;await new Promise(r=>setTimeout(r,10))}throw Error('Tempo esgotado')}
const conferir = (valor,mensagem) => {if(!valor)throw Error(mensagem)}
try {
 await router.push(screen==='detalhes'?'/oportunidade/11':'/freelances')
 app.mount('#app')
 await esperar(()=>document.querySelector(screen==='detalhes'?'.informacoes-card':'.vaga'))
 if(screen==='listagem') {
  conferir(document.querySelectorAll('.vaga').length===10,'Primeira página')
  const cartao=document.querySelector('.vaga')
  const logos=[...document.querySelectorAll('.vaga .empresa-vaga img')]
  await esperar(()=>logos.length===2 && logos.every(img=>img.naturalWidth>0))
  conferir(logos[0].src.endsWith('/logo.png') && logos[1].src.endsWith('/slogan.png'),'Logos ligados ao dono de cada vaga')
  conferir(cartao.querySelector('.empresa-vaga').textContent.includes('Estúdio Um'),'Nome público da empresa')
  conferir(!!document.querySelectorAll('.vaga')[2].querySelector('.empresa-vaga-logo[role=img]'),'Sem imagem usa ícone neutro')
  const altura=cartao.getBoundingClientRect().height
  conferir(altura<=innerHeight/3,'Card ocupa no máximo um terço do viewport de teste: '+altura+'px')
  const informacoes=cartao.querySelector('.info').getBoundingClientRect()
  const botaoDetalhes=cartao.querySelector('.details').getBoundingClientRect()
  conferir(botaoDetalhes.top>=informacoes.bottom-1,'Botão sem sobreposição às informações')
  document.querySelector('.escolher-tag').click();await nextTick();await nextTick()
  conferir(!!document.querySelector('#filtro-tag'),'Chip abre os filtros existentes')
  document.querySelector('.botao-fechar').click();await nextTick()
  document.querySelector('.paginacao button:last-child').click()
  await esperar(()=>document.querySelectorAll('.vaga').length===1)
  conferir(document.querySelector('.paginacao button:last-child').disabled,'Última página')
  const busca=document.querySelector('.busca input');busca.value='designer';busca.dispatchEvent(new Event('input',{bubbles:true}))
  await esperar(()=>document.querySelectorAll('.vaga').length===10)
  conferir(consultas.at(-1).params.search==='designer' && consultas.at(-1).params.page===1,'Pesquisa reinicia página')
  busca.value='';busca.dispatchEvent(new Event('input',{bubbles:true}));await new Promise(r=>setTimeout(r,400))
  document.querySelector('.botao-filtro').click();await nextTick();await nextTick()
  conferir(document.activeElement.id==='filtro-tag','Foco nos filtros')
  conferir(document.querySelector('.filtros-painel').getBoundingClientRect().width<=innerWidth,'Largura dos filtros')
  document.querySelector('.botao-fechar').click();await nextTick()
  document.querySelector('.vaga .favorito').click();await nextTick()
  conferir(JSON.parse(localStorage.getItem('marujobs:favoritos:usuario:37')).includes(1),'Favorito local')
  await router.push('/oportunidade/1');await esperar(()=>document.querySelector('.informacoes-card'))
  conferir(document.querySelector('.favorito').getAttribute('aria-pressed')==='true','Favorito nos detalhes')
  conferir(document.querySelector('.empresa-vaga').textContent.includes('Estúdio Um'),'Identidade da empresa nos detalhes')
  longo=true
  await router.push('/freelances');await esperar(()=>document.querySelector('.vaga'))
  fechada=true
  await router.push('/oportunidade/2');await esperar(()=>document.querySelector('.informacoes-card'))
  conferir(document.querySelector('.btn-candidatar').disabled &&
    document.querySelector('.btn-candidatar').textContent.includes('indisponível'),'Vaga encerrada bloqueia candidatura')
  await router.push('/freelances');await esperar(()=>document.querySelector('.vaga'))
  conferir(document.querySelectorAll('.vaga').length===9,'Vaga encerrada sai da lista aberta')
  conferir(document.documentElement.scrollWidth<=innerWidth,'Título extenso sem transbordamento')
  longo=false
  await router.push('/oportunidade/1');await esperar(()=>document.querySelector('.informacoes-card'))
  await router.push('/freelances');await esperar(()=>document.querySelector('.vaga'))
 } else {
  conferir(!!document.querySelector('.btn-candidatar[aria-describedby]'),'Botão de candidatura')
  const fimBlocos=document.querySelector(innerWidth>=1024?'.topo':'.blocos').getBoundingClientRect().bottom
  const inicioAcoes=document.querySelector('.acoes').getBoundingClientRect().top
  conferir(inicioAcoes-fimBlocos<=32,'Sem vazio exagerado antes da candidatura')
  conferir(!document.querySelector('.contato button:not(:disabled)'),'Sem mensagem simulada')
  conferir(!document.body.textContent.includes('Centro, SP'),'Sem localização fictícia')
  document.querySelector('.favorito').click();await nextTick()
  conferir(JSON.parse(localStorage.getItem('marujobs:favoritos:usuario:37')).includes(11),'Favorito nos detalhes')
  incompleto=true
  await router.push('/oportunidade/12');await esperar(()=>document.querySelector('.informacoes-card'))
  conferir(!document.querySelector('.sobre'),'Descrição nula omitida')
  conferir(!document.querySelector('.lista-info .info-item'),'Tag e tempo nulos omitidos')
  conferir(document.querySelector('.preco').textContent.includes('Não informado'),'Preço nulo')
  incompleto=false
  await router.push('/oportunidade/11');await esperar(()=>document.querySelector('.sobre'))
 }
 conferir(document.documentElement.scrollWidth<=innerWidth,'Sem rolagem horizontal')
 document.body.dataset.feat37='pass'
 document.body.dataset.viewport=String(innerWidth)
} catch(error){document.body.dataset.feat37='fail';document.body.dataset.erro=error.message}
`
const vite = await createServer({
  configFile: false,
  cacheDir: resolve('node_modules/.cache/f43/vite-oportunidades'),
  optimizeDeps: { noDiscovery: true, include: [] },
  plugins: [
    vue(),
    {
      name: 'feat37-visual',
      configureServer(server) {
        server.middlewares.use('/__feat37', (_req, res) => {
          res.setHeader('Content-Type', 'text/html')
          res.end(
            '<!doctype html><html lang="pt-BR"><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0"><div id="app"></div><script type="module" src="/@id/virtual:feat37"></script></body></html>',
          )
        })
      },
      resolveId(id) {
        if (id === 'virtual:feat37') return '\0feat37'
      },
      load(id) {
        if (id === '\0feat37') return roteiro
      },
    },
  ],
  resolve: { alias: { '@': resolve('src') } },
  server: { host: '127.0.0.1', port: 5187, strictPort: true, hmr: false },
})
await vite.listen()
// A emulação via CDP evita o viewport mínimo de 500 px do Chrome desktop.
const navegador = spawn(chrome, [
  '--headless=new',
  '--disable-gpu',
  '--no-first-run',
  '--no-default-browser-check',
  '--remote-debugging-port=19437',
  `--user-data-dir=${resolve(artefatos, 'perfil-cdp')}`,
  'about:blank',
], { windowsHide: true, stdio: 'ignore' })
let ws
let sequencia = 0
const pendentes = new Map()
const erros = []

function cdp(method, params = {}) {
  const id = ++sequencia
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      pendentes.delete(id)
      reject(Error('CDP timeout: ' + method))
    }, 15000)
    pendentes.set(id, resposta => {
      clearTimeout(timer)
      resposta.error ? reject(Error(resposta.error.message)) : resolve(resposta.result)
    })
    ws.send(JSON.stringify({ id, method, params }))
  })
}

try {
  let alvo
  for (let i = 0; i < 100 && !alvo; i++) {
    const resposta = await fetch('http://127.0.0.1:19437/json/list').catch(() => null)
    if (resposta?.ok) alvo = (await resposta.json()).find(pagina => pagina.type === 'page')
    if (!alvo) await wait(150)
  }
  assert.ok(alvo, 'Chrome nao disponibilizou a depura??o')
  ws = new WebSocket(alvo.webSocketDebuggerUrl)
  await new Promise((resolve, reject) => {
    ws.onopen = resolve
    ws.onerror = reject
  })
  ws.onmessage = ({ data }) => {
    const mensagem = JSON.parse(data)
    if (mensagem.method === 'Runtime.exceptionThrown') erros.push(mensagem.params.exceptionDetails)
    pendentes.get(mensagem.id)?.(mensagem)
    pendentes.delete(mensagem.id)
  }
  await cdp('Page.enable')
  await cdp('Runtime.enable')
  for (const tela of ['listagem', 'detalhes']) {
    for (const largura of [320, 375, 390, 430, 768, 1440]) {
      await cdp('Emulation.setDeviceMetricsOverride', {
        width: largura, height: 1000, deviceScaleFactor: 1, mobile: largura < 500,
      })
      const url = `http://127.0.0.1:5187/__feat37?screen=${tela}&largura=${largura}`
      await cdp('Page.navigate', { url })
      let estado
      for (let i = 0; i < 200 && !estado?.resultado; i++) {
        const leitura = await cdp('Runtime.evaluate', {
          expression: `location.href === ${JSON.stringify(url)} && ({
            resultado: document.body?.dataset.feat37, erro: document.body?.dataset.erro, largura: innerWidth,
          })`,
          returnByValue: true,
        }).catch(() => null)
        estado = leitura?.result.value
        if (!estado?.resultado) await wait(100)
      }
      assert.equal(estado?.resultado, 'pass', `${tela}, ${largura}px: ${estado?.erro || 'tempo esgotado'}`)
      assert.equal(estado.largura, largura)
      if (process.argv.includes('--capturas')) {
        const foto = await cdp('Page.captureScreenshot', { format: 'png' })
        writeFileSync(resolve(artefatos, `${tela}-${largura}.png`), Buffer.from(foto.data, 'base64'))
      }
      console.log('PASSOU', tela, largura)
    }
  }
  assert.deepEqual(erros, [])
  console.log('12/12 cenarios simulados de oportunidades aprovados.')
} finally {
  if (ws?.readyState === WebSocket.OPEN)
    ws.send(JSON.stringify({ id: ++sequencia, method: 'Browser.close' }))
  ws?.close()
  navegador.kill()
  await vite.close()
}
