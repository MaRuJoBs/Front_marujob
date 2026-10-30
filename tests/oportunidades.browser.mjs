// Teste visual opcional: CHROME_BIN=/caminho/chrome node tests/oportunidades.browser.mjs
// API simulada somente no servidor de teste; componentes e estilos reais do frontend.
import assert from 'node:assert/strict'
import { spawn, execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { createServer } from 'vite'
import vue from '@vitejs/plugin-vue'

const chrome = process.env.CHROME_BIN || '/mnt/c/Program Files/Google/Chrome/Application/chrome.exe'
assert.ok(existsSync(chrome), 'Configure CHROME_BIN com um navegador Chrome disponível.')
const artefatos = resolve('node_modules/.cache/feat37-redesign')
mkdirSync(artefatos, { recursive: true })
const caminhoChrome = (path) =>
  chrome.endsWith('.exe') && process.platform !== 'win32'
    ? execFileSync('wslpath', ['-w', path], { encoding: 'utf8' }).trim()
    : path
const roteiro = `
import { createApp, nextTick } from 'vue'
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
library.add(fas)
localStorage.clear()
sessao.usuario = { id: 37, name: 'Conta de teste', groups: ['Usuário'] }
sessao.tipo = 'usuario'
const consultas = []
let incompleto=false, longo=false
const item = id => incompleto ? {id,titulo:'Campos opcionais ausentes',descricao:null,tag:null,preco:null,tempo:null} : ({id, titulo:longo ? 'TítuloExtensoSemEspaços'.repeat(30) : 'Projeto de identidade visual', descricao:'Desenvolver a identidade visual de um projeto e organizar os arquivos finais.', tag:'design', preco:'200.00', tempo:'20'})
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
  conferir(cartao.getBoundingClientRect().height<215,'Card compacto')
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
  conferir(JSON.parse(localStorage.getItem('favoritos')).includes(1),'Favorito local')
  await router.push('/oportunidade/1');await esperar(()=>document.querySelector('.informacoes-card'))
  conferir(document.querySelector('.favorito').getAttribute('aria-pressed')==='true','Favorito nos detalhes')
  longo=true
  await router.push('/freelances');await esperar(()=>document.querySelector('.vaga'))
  conferir(document.documentElement.scrollWidth<=innerWidth,'Título extenso sem transbordamento')
  longo=false
  await router.push('/oportunidade/1');await esperar(()=>document.querySelector('.informacoes-card'))
  await router.push('/freelances');await esperar(()=>document.querySelector('.vaga'))
 } else {
  conferir(!!document.querySelector('.btn-candidatar[aria-describedby]'),'Botão de candidatura')
  const fimBlocos=document.querySelector('.blocos').getBoundingClientRect().bottom
  const inicioAcoes=document.querySelector('.acoes').getBoundingClientRect().top
  conferir(inicioAcoes-fimBlocos<=32,'Sem vazio exagerado antes da candidatura')
  conferir(!document.querySelector('.contato button:not(:disabled)'),'Sem mensagem simulada')
  conferir(!document.body.textContent.includes('Centro, SP'),'Sem localização fictícia')
  document.querySelector('.favorito').click();await nextTick()
  conferir(JSON.parse(localStorage.getItem('favoritos')).includes(11),'Favorito nos detalhes')
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
  server: { host: '0.0.0.0', port: 5187, strictPort: true, hmr: false },
})
await vite.listen()
// A emulação via CDP evita o viewport mínimo de 500 px do Chrome desktop.
const pastaWindows = caminhoChrome(artefatos).replaceAll("'", "''")
const powershellExe = '/mnt/c/Windows/System32/WindowsPowerShell/v1.0/powershell.exe'
function encerrarNavegadoresDoTeste() {
  const comando = `Get-CimInstance Win32_Process -Filter "Name='chrome.exe'" | Where-Object { $_.CommandLine -and $_.CommandLine.Contains('${pastaWindows}') } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }`
  execFileSync(
    powershellExe,
    [
      '-NoProfile',
      '-NonInteractive',
      '-EncodedCommand',
      Buffer.from(comando, 'utf16le').toString('base64'),
    ],
    { timeout: 20000, stdio: 'ignore' },
  )
}
encerrarNavegadoresDoTeste()
const perfil = caminhoChrome(resolve(artefatos, 'perfil-cdp'))
const navegador = spawn(
  chrome,
  [
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    `--user-data-dir=${perfil}`,
    '--remote-debugging-port=19437',
    'about:blank',
  ],
  { windowsHide: true, stdio: ['ignore', 'ignore', 'pipe'] },
)
let diagnostico = ''
navegador.stderr.on('data', (c) => (diagnostico += c))
writeFileSync(
  resolve(artefatos, 'comparacao.html'),
  `<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>FEAT-37 — Comparação visual</title><style>body{margin:0;padding:32px;background:#f5f0fc;color:#533581;font:15px Arial}h1{font-size:22px}h2{font-size:17px}section{display:grid;grid-template-columns:repeat(2,minmax(0,375px));gap:24px;align-items:start;margin-bottom:40px}img{display:block;width:100%;height:auto;border:1px solid #d8c9e7;border-radius:8px}p{line-height:1.5;max-width:770px}@media(max-width:600px){body{padding:16px}section{gap:12px}}</style><h1>FEAT-37 — Referências e reconstrução</h1><p>Esquerda: referência original, incluindo a moldura da captura. Direita: interface local a 375 px, com API simulada exclusivamente no teste. Campos sem contrato não foram copiados.</p><h2>Listagem</h2><section><div><p>Referência</p><img src="../../../telas/Captura de tela 2026-10-30 171627.png" alt="Referência da listagem"></div><div><p>Resultado local</p><img src="listagem-375.png" alt="Listagem reconstruída"></div></section><h2>Detalhes</h2><section><div><p>Referência</p><img src="../../../telas/Captura de tela 2026-10-30 171653.png" alt="Referência dos detalhes"></div><div><p>Resultado local</p><img src="detalhes-375.png" alt="Detalhes reconstruídos"></div></section></html>`,
)
const powershell = `
$ErrorActionPreference='Stop'
$ProgressPreference='SilentlyContinue'
$target=$null
for($i=0;$i -lt 60;$i++) {
 try { $targets=Invoke-RestMethod 'http://127.0.0.1:19437/json/list' -UseBasicParsing; foreach($candidate in $targets){if($candidate.type -eq 'page'){$target=$candidate;break}}; if($target){break} } catch {}
 Start-Sleep -Milliseconds 100
}
if(-not $target){throw 'Chrome não disponibilizou a depuração'}
$ws=New-Object System.Net.WebSockets.ClientWebSocket
$ws.ConnectAsync([Uri]([string]@($target.webSocketDebuggerUrl)[0]),[Threading.CancellationToken]::None).GetAwaiter().GetResult()|Out-Null
$script:sequencia=0
function Invoke-CDP($metodo,$parametros) {
 $script:sequencia++
 $id=$script:sequencia
 $json=@{id=$id;method=$metodo;params=$parametros}|ConvertTo-Json -Depth 20 -Compress
 $bytes=[Text.Encoding]::UTF8.GetBytes($json)
 $segmento=New-Object 'System.ArraySegment[byte]' -ArgumentList (,$bytes)
 $ws.SendAsync($segmento,[Net.WebSockets.WebSocketMessageType]::Text,$true,[Threading.CancellationToken]::None).GetAwaiter().GetResult()|Out-Null
 while($true) {
  $stream=New-Object IO.MemoryStream
  do {
   $buffer=New-Object byte[] 65536
   $parte=New-Object 'System.ArraySegment[byte]' -ArgumentList (,$buffer)
   $recebido=$ws.ReceiveAsync($parte,[Threading.CancellationToken]::None).GetAwaiter().GetResult()
   $stream.Write($buffer,0,$recebido.Count)
  } while(-not $recebido.EndOfMessage)
  $mensagem=[Text.Encoding]::UTF8.GetString($stream.ToArray())|ConvertFrom-Json
  $stream.Dispose()
  if($mensagem.id -eq $id) {
   if($mensagem.error){throw ($mensagem.error|ConvertTo-Json -Compress)}
   return $mensagem.result
  }
 }
}
try {
 Invoke-CDP 'Page.enable' @{}|Out-Null
 foreach($tela in @('listagem','detalhes')) {
  foreach($largura in @(320,375,390,430,768,1440)) {
   Invoke-CDP 'Emulation.setDeviceMetricsOverride' @{width=$largura;height=1000;deviceScaleFactor=1;mobile=($largura -lt 500)}|Out-Null
   Invoke-CDP 'Page.navigate' @{url="http://localhost:5187/__feat37?screen=$tela"}|Out-Null
   $estado=$null
   for($tentativa=0;$tentativa -lt 200;$tentativa++) {
    Start-Sleep -Milliseconds 100
    $resultado=Invoke-CDP 'Runtime.evaluate' @{expression="JSON.stringify({estado:document.body?.dataset.feat37,erro:document.body?.dataset.erro,largura:innerWidth})";returnByValue=$true}
    if($resultado.result.value){$estado=$resultado.result.value|ConvertFrom-Json}
    if($estado.estado -eq 'pass' -or $estado.estado -eq 'fail'){break}
   }
   if($estado.estado -ne 'pass'){throw "Falhou $tela largura $largura : $($estado|ConvertTo-Json -Compress)"}
   if($estado.largura -ne $largura){throw "Viewport incorreto: $($estado.largura), esperado $largura"}
   $captura=Invoke-CDP 'Page.captureScreenshot' @{format='png';captureBeyondViewport=$false}
   [IO.File]::WriteAllBytes("${pastaWindows}\\$tela-$largura.png",[Convert]::FromBase64String($captura.data))
   Write-Output "PASSOU $tela $largura px"
  }
 }
 Invoke-CDP 'Emulation.setDeviceMetricsOverride' @{width=900;height=1000;deviceScaleFactor=1;mobile=$false}|Out-Null
 Invoke-CDP 'Page.navigate' @{url=([Uri]'${pastaWindows}\\comparacao.html').AbsoluteUri}|Out-Null
 Start-Sleep -Milliseconds 800
 $medidas=Invoke-CDP 'Page.getLayoutMetrics' @{}
 $comparacao=Invoke-CDP 'Page.captureScreenshot' @{format='png';captureBeyondViewport=$true;clip=@{x=0;y=0;width=900;height=[Math]::Ceiling($medidas.cssContentSize.height);scale=1}}
 [IO.File]::WriteAllBytes("${pastaWindows}\\comparacao.png",[Convert]::FromBase64String($comparacao.data))
 Write-Output 'Comparacao lado a lado capturada'
} finally {$ws.Dispose()}
`
try {
  assert.ok(
    chrome.endsWith('.exe'),
    'Este roteiro usa a ponte CDP do Chrome Windows via PowerShell.',
  )
  const resultado = await new Promise((resolve, reject) => {
    const child = spawn(
      '/mnt/c/Windows/System32/WindowsPowerShell/v1.0/powershell.exe',
      [
        '-NoProfile',
        '-NonInteractive',
        '-EncodedCommand',
        Buffer.from(powershell, 'utf16le').toString('base64'),
      ],
      { stdio: ['ignore', 'pipe', 'pipe'] },
    )
    let stderr = ''
    child.stdout.on('data', (c) => process.stdout.write(c))
    child.stderr.on('data', (c) => (stderr += c))
    const timer = setTimeout(() => {
      child.kill()
      reject(Error('Teste excedeu 180 segundos'))
    }, 180000)
    child.on('error', (e) => {
      clearTimeout(timer)
      reject(e)
    })
    child.on('exit', (code) => {
      clearTimeout(timer)
      resolve({ code, stderr })
    })
  })
  assert.equal(resultado.code, 0, resultado.stderr + diagnostico.slice(-800))
  console.log('12/12 cenários de navegador aprovados. Capturas e comparacao.html: ' + artefatos)
} finally {
  navegador.kill()
  encerrarNavegadoresDoTeste()
  await vite.close()
}
