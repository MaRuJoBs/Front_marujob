// Verificação visual isolada. Não envia nenhuma requisição à API real.
// Executar manualmente: node tests/vagas.browser.mjs
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { setTimeout as aguardar } from 'node:timers/promises'
import { createServer } from 'vite'
import vue from '@vitejs/plugin-vue'

const chrome = process.env.CHROME_BIN || 'C:/Program Files/Google/Chrome/Application/chrome.exe'
assert.ok(
  existsSync(chrome),
  'Configure CHROME_BIN com o caminho do Chrome para executar esta verificação.',
)
const artefatos = resolve('node_modules/.cache/feat35-navegador')
mkdirSync(artefatos, { recursive: true })
const vite = await createServer({
  configFile: false,
  plugins: [vue()],
  mode: 'development',
  resolve: { alias: { '@': resolve('src') } },
  server: { host: '127.0.0.1', port: 5186, strictPort: true, hmr: false },
})
await vite.listen()
const origem = 'http://127.0.0.1:5186'
const navegador = spawn(
  chrome,
  [
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    '--remote-debugging-port=9340',
    '--user-data-dir=' + resolve(artefatos, 'perfil'),
    'about:blank',
  ],
  { windowsHide: true, stdio: 'ignore' },
)
let socket
let conta = null
let modoPublicacao = 400
let publicacoes = 0
let ultimoPayload
let scriptInicial

try {
  let targets
  for (let tentativa = 0; tentativa < 60; tentativa++) {
    try {
      targets = await (await fetch('http://127.0.0.1:9340/json/list')).json()
      break
    } catch {
      await aguardar(100)
    }
  }
  assert.ok(targets, 'Não foi possível iniciar o navegador de teste.')
  socket = new WebSocket(targets.find((target) => target.type === 'page').webSocketDebuggerUrl)
  await new Promise((resolve, reject) => {
    socket.addEventListener('open', resolve, { once: true })
    socket.addEventListener('error', reject, { once: true })
  })
  let sequencia = 0
  const pendentes = new Map()
  const falhas = []
  function enviar(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = ++sequencia
      pendentes.set(id, { resolve, reject })
      socket.send(JSON.stringify({ id, method, params }))
    })
  }
  socket.addEventListener('message', async (event) => {
    const mensagem = JSON.parse(event.data)
    if (mensagem.id) {
      const tarefa = pendentes.get(mensagem.id)
      pendentes.delete(mensagem.id)
      if (mensagem.error) tarefa?.reject(new Error(mensagem.error.message))
      else tarefa?.resolve(mensagem.result)
    }
    if (mensagem.method === 'Runtime.exceptionThrown')
      falhas.push(
        mensagem.params.exceptionDetails.exception?.description ||
          mensagem.params.exceptionDetails.text,
      )
    if (mensagem.method !== 'Fetch.requestPaused') return
    const { requestId, request } = mensagem.params
    try {
      let status = 200
      let data = {}
      const path = new URL(request.url).pathname
      if (request.method === 'OPTIONS') status = 204
      else if (path.endsWith('/usuarios/me/'))
        data = {
          id: 35,
          name: 'Empresa de teste FEAT-35',
          groups: [conta === 'empresa' ? 'Empresa' : 'Usuário'],
        }
      else if (path.endsWith('/freelances/') && request.method === 'POST') {
        publicacoes++
        ultimoPayload = JSON.parse(request.postData)
        status = modoPublicacao
        data =
          status === 201
            ? { id: 3501, ...ultimoPayload }
            : { preco: ['Revise o pagamento informado.'] }
        await aguardar(800)
      } else data = { count: 0, next: null, previous: null, results: [] }
      await enviar('Fetch.fulfillRequest', {
        requestId,
        responseCode: status,
        responseHeaders: [
          { name: 'Content-Type', value: 'application/json' },
          { name: 'Access-Control-Allow-Origin', value: origem },
          { name: 'Access-Control-Allow-Headers', value: 'authorization,content-type' },
          { name: 'Access-Control-Allow-Methods', value: 'GET,POST,OPTIONS' },
        ],
        body: Buffer.from(status === 204 ? '' : JSON.stringify(data)).toString('base64'),
      })
    } catch (error) {
      falhas.push(error.message)
    }
  })
  await enviar('Runtime.enable')
  await enviar('Page.enable')
  await enviar('Fetch.enable', { patterns: [{ urlPattern: '*/api/*', requestStage: 'Request' }] })
  async function avaliar(expression) {
    const resposta = await enviar('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true,
    })
    if (resposta.exceptionDetails)
      throw new Error(
        resposta.exceptionDetails.exception?.description || 'Falha ao avaliar a página.',
      )
    return resposta.result.value
  }
  async function esperar(expression) {
    for (let tentativa = 0; tentativa < 120; tentativa++) {
      if (await avaliar(expression)) return
      await aguardar(100)
    }
    throw new Error('Tempo esgotado: ' + expression)
  }
  async function abrir(tipo) {
    conta = tipo
    if (scriptInicial)
      await enviar('Page.removeScriptToEvaluateOnNewDocument', { identifier: scriptInicial })
    const source = `if(location.origin===${JSON.stringify(origem)}){localStorage.clear();${tipo ? "localStorage.setItem('token','token-exclusivo-do-navegador-de-teste');localStorage.setItem('refresh','refresh-exclusivo-do-navegador-de-teste');" : ''}}`
    scriptInicial = (await enviar('Page.addScriptToEvaluateOnNewDocument', { source })).identifier
    await enviar('Page.navigate', { url: origem + '/criar-vaga' })
    await esperar(
      tipo === 'empresa'
        ? "!!document.querySelector('#vaga-titulo')"
        : tipo === 'usuario'
          ? "location.pathname==='/home' && !!document.querySelector('.home')"
          : "location.pathname==='/' && !!document.querySelector('.paginaLogin')",
    )
  }

  await abrir(null)
  assert.equal(await avaliar('!!document.querySelector(\'a[href="/criar-vaga"]\')'), false)
  await abrir('usuario')
  assert.equal(await avaliar('!!document.querySelector(\'a[href="/criar-vaga"]\')'), false)
  console.log('PASSOU: visitante e freelancer não acessam a criação.')
  await abrir('empresa')
  assert.equal(await avaliar("document.querySelector('#vaga-categoria').value"), '')
  assert.equal(await avaliar("document.querySelector('#vaga-modalidade').value"), '')
  assert.deepEqual(
    await avaliar(
      "Array.from(document.querySelector('#vaga-modalidade').options).slice(1).map(opcao => opcao.value)",
    ),
    ['Remoto', 'Híbrido', 'Presencial'],
  )
  await avaliar("document.querySelector('form').requestSubmit()")
  await esperar("document.querySelectorAll('.msg-erro').length===6")
  assert.equal(await avaliar('document.activeElement.id'), 'vaga-titulo')
  console.log('PASSOU: renderização, placeholder do select, campos obrigatórios e foco no erro.')

  for (const largura of [1440, 768, 430, 390, 375, 320]) {
    await enviar('Emulation.setDeviceMetricsOverride', {
      width: largura,
      height: 1000,
      deviceScaleFactor: 1,
      mobile: largura < 500,
    })
    await aguardar(120)
    const dimensoes = await avaliar(
      '({largura:innerWidth,conteudo:document.documentElement.scrollWidth})',
    )
    assert.ok(
      dimensoes.conteudo <= dimensoes.largura,
      `Rolagem horizontal em ${largura}px: ${JSON.stringify(dimensoes)}`,
    )
    const larguraTela = await avaliar(
      "document.querySelector('.criar-vaga').getBoundingClientRect().width",
    )
    assert.ok(larguraTela <= 420, 'A tela deve manter o formato de celular também no computador.')
    if (largura <= 900) {
      const celular = await avaliar(
        `(()=>{const botao=document.querySelector('.acoes .btn-publicar');const caixa=botao.getBoundingClientRect();return {altura:caixa.height,inicio:caixa.top,fim:caixa.bottom,viewport:innerHeight,fonte:parseFloat(getComputedStyle(document.querySelector('#vaga-titulo')).fontSize)};})()`,
      )
      assert.ok(celular.altura >= 48, 'Botão precisa ser confortável para toque.')
      assert.ok(
        celular.inicio >= 0 && celular.fim <= celular.viewport,
        'Publicar deve permanecer visível no celular.',
      )
      assert.ok(celular.fonte >= 16, 'Campos precisam de texto legível no celular.')
    }
    if (largura === 1440 || largura === 390) {
      const captura = await enviar('Page.captureScreenshot', {
        format: 'png',
        captureBeyondViewport: true,
      })
      writeFileSync(
        resolve(artefatos, largura === 1440 ? 'desktop.png' : 'celular.png'),
        Buffer.from(captura.data, 'base64'),
      )
    }
  }
  console.log(
    'PASSOU: layout em 320, 375, 390, 430, 768 e 1440 px; campos legíveis e botão acessível no celular.',
  )

  async function preencher(preco) {
    await avaliar(
      `(()=>{const campos=${JSON.stringify({ 'vaga-titulo': 'Oportunidade de teste isolado', 'vaga-categoria': 'Desenvolvimento Web', 'vaga-modalidade': 'Remoto', 'vaga-descricao': 'Texto usado exclusivamente no navegador de teste, sem publicação real.', 'vaga-preco': preco, 'vaga-tempo': '20' })};for(const[id,valor]of Object.entries(campos)){const campo=document.getElementById(id);campo.value=valor;campo.dispatchEvent(new Event(campo.tagName==='SELECT'?'change':'input',{bubbles:true}));}})()`,
    )
  }
  await preencher('-10')
  await avaliar("document.querySelector('form').requestSubmit()")
  await esperar("!!document.querySelector('#preco-erro')")
  assert.equal(publicacoes, 0)
  await preencher('1500,50')
  await avaliar(
    "document.querySelector('form').requestSubmit();document.querySelector('form').requestSubmit()",
  )
  await esperar(
    "document.querySelector('.btn-publicar')?.disabled && document.querySelector('.btn-publicar')?.textContent.includes('Publicando')",
  )
  assert.equal(await avaliar("document.querySelector('#vaga-titulo').matches(':disabled')"), true)
  await esperar("document.querySelector('#preco-erro')?.textContent.includes('Revise o pagamento')")
  assert.equal(publicacoes, 1)
  assert.equal(await avaliar("document.querySelector('#vaga-preco').value"), '1500,50')
  assert.equal(
    await avaliar("document.querySelector('#vaga-titulo').value"),
    'Oportunidade de teste isolado',
  )
  console.log(
    'PASSOU: pagamento negativo, envio duplicado, carregamento, erro 400 e preservação dos dados.',
  )

  modoPublicacao = 201
  await avaliar("document.querySelector('form').requestSubmit()")
  await esperar(
    "location.pathname==='/homeEmpresa' && !!document.querySelector('.confirmacao-publicacao')",
  )
  assert.equal(publicacoes, 2)
  assert.deepEqual(Object.keys(ultimoPayload).sort(), [
    'descricao',
    'preco',
    'tag',
    'tempo',
    'titulo',
  ])
  assert.equal(ultimoPayload.preco, '1500.50')
  assert.ok(ultimoPayload.descricao.startsWith('Modalidade: Remoto\n\n'))
  assert.ok([...ultimoPayload.descricao].length <= 200)
  assert.equal(
    await avaliar("document.querySelector('.vaga-publicada h4').textContent"),
    'Oportunidade de teste isolado',
  )
  assert.equal(
    await avaliar('document.documentElement.scrollWidth <= innerWidth'),
    true,
    'O início da empresa também precisa caber no celular.',
  )
  assert.ok(falhas.length === 0, falhas.join('\n'))
  console.log('PASSOU: confirmação após 201, redirecionamento e exibição dos dados retornados.')
  console.log(
    'Nenhuma vaga real foi criada. Todas as chamadas à API foram interceptadas em memória.',
  )
  console.log('Capturas: ' + artefatos)
} finally {
  socket?.close()
  navegador.kill()
  await vite.close()
}
