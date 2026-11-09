// Demonstração/teste local isolado. Nenhuma rota ou página da aplicação é alterada.
import assert from 'node:assert/strict'
import { spawn, execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { setTimeout as wait } from 'node:timers/promises'
import { createServer } from 'vite'
import vue from '@vitejs/plugin-vue'

// Modo manual persistente: não depende de Chrome headless nem CDP.
if (process.argv.includes('--serve')) {
  const { startDemoServer } = await import('./design-system.demo.mjs')
  await startDemoServer()
  await new Promise(() => {})
}

const chrome =
  process.env.CHROME_BIN ||
  [
    '/usr/bin/chromium',
    '/usr/bin/google-chrome',
    '/mnt/c/Program Files/Google/Chrome/Application/chrome.exe',
  ].find(existsSync)
assert.ok(chrome && existsSync(chrome), 'Configure CHROME_BIN com um navegador disponível.')
const folder = resolve('node_modules/.cache/feat48-browser')
mkdirSync(folder, { recursive: true })
const runner = `
import {createApp,ref} from 'vue'
import '/src/assets/main.css'
import BaseButton from '/src/components/ui/BaseButton.vue'
import BaseInput from '/src/components/ui/BaseInput.vue'
import BaseCard from '/src/components/ui/BaseCard.vue'
window.clicks=0
createApp({components:{BaseButton,BaseInput,BaseCard},setup(){return {value:ref(''),clicked:()=>window.clicks++}},template:
\`<main>
<h1>MaRuJoBs — componentes base</h1>
<div class="buttons"><BaseButton id="primary" @click="clicked">Primário</BaseButton><BaseButton variant="secondary">Secundário</BaseButton><BaseButton variant="outline">Contorno</BaseButton><BaseButton variant="text">Texto</BaseButton></div>
<div class="buttons"><BaseButton size="small">Pequeno</BaseButton><BaseButton size="large">Grande</BaseButton><BaseButton id="disabled" disabled @click="clicked">Desabilitado</BaseButton><BaseButton id="loading" loading @click="clicked">Salvar</BaseButton></div>
<BaseCard elevated><template #header><h2>Dados profissionais</h2></template>
<BaseInput id="name" v-model="value" label="Nome" help="Informe o nome profissional" required/><p id="model">{{value}}</p>
<BaseInput label="E-mail" type="email" error="Informe um e-mail válido"/>
<BaseInput label="Indisponível" disabled placeholder="Campo desabilitado"/>
<template #footer>Conteúdo do rodapé</template></BaseCard>
<p id="legacy">Elemento fora do escopo dos tokens</p>
</main>\`}).mount('#app')
await document.fonts.ready
document.body.dataset.ready='true'
`
const vite = await createServer({
  configFile: false,
  // Este runner usa template em string; os componentes continuam sendo SFCs reais.
  resolve: { alias: [{ find: /^vue$/, replacement: 'vue/dist/vue.esm-bundler.js' }] },
  optimizeDeps: { noDiscovery: true, include: [] },
  plugins: [
    vue(),
    {
      name: 'feat48-harness',
      resolveId(id) {
        if (id === '/__feat48.js') return '\0feat48'
      },
      load(id) {
        if (id === '\0feat48') return runner
      },
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url !== '/') return next()
          res.setHeader('Content-Type', 'text/html')
          res.end(
            '<!doctype html><html lang="pt-BR"><meta name="viewport" content="width=device-width, initial-scale=1"><title>FEAT-48</title><style>body{background:#eee7f4}main{max-width:760px;margin:auto;padding:24px;display:grid;gap:24px}h1{font:600 24px Arial;color:#533581}h2{font:600 18px Arial}.buttons{display:flex;flex-wrap:wrap;gap:12px}</style><div id="app"></div><script type="module" src="/__feat48.js"></script></html>',
          )
        })
      },
    },
  ],
  server: { host: '127.0.0.1', port: 5198, strictPort: true },
  appType: 'custom',
})
await vite.listen()
let profile = resolve(folder, 'chrome-profile')
if (chrome.startsWith('/mnt/') && chrome.endsWith('.exe')) {
  profile = execFileSync('wslpath', ['-w', profile], { encoding: 'utf8' }).trim()
}
const processChrome = spawn(
  chrome,
  [
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    `--user-data-dir=${profile}`,
    '--remote-debugging-port=19448',
    'about:blank',
  ],
  { stdio: 'ignore' },
)
let ws
let id = 0
const pending = new Map()
const errors = []
processChrome.on('error', (error) => errors.push(error.message))
async function cdp(method, params = {}) {
  const key = ++id
  return Promise.race([
    new Promise((resolve, reject) => {
      pending.set(key, { resolve, reject })
      ws.send(JSON.stringify({ id: key, method, params }))
    }),
    wait(10000).then(() => {
      throw Error(`CDP timeout: ${method}`)
    }),
  ])
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
try {
  let target
  for (let attempt = 0; attempt < 50; attempt++) {
    try {
      target = (
        await (
          await fetch('http://127.0.0.1:19448/json/list', { signal: AbortSignal.timeout(500) })
        ).json()
      ).find((item) => item.type === 'page')
      if (target) break
    } catch {}
    await wait(100)
  }
  assert.ok(target, `Chrome/CDP indisponível. ${errors.join('; ')}`)
  ws = new WebSocket(target.webSocketDebuggerUrl)
  await new Promise((resolve, reject) => {
    ws.onopen = resolve
    ws.onerror = reject
  })
  ws.onmessage = ({ data }) => {
    const message = JSON.parse(data)
    if (message.method === 'Runtime.exceptionThrown') errors.push(JSON.stringify(message.params))
    const item = pending.get(message.id)
    if (item) {
      pending.delete(message.id)
      message.error
        ? item.reject(Error(JSON.stringify(message.error)))
        : item.resolve(message.result)
    }
  }
  await cdp('Page.enable')
  await cdp('Runtime.enable')
  for (const width of [375, 768, 1280]) {
    await cdp('Emulation.setDeviceMetricsOverride', {
      width,
      height: 1100,
      deviceScaleFactor: 1,
      mobile: false,
    })
    await evaluate("if (document.body) document.body.dataset.ready = 'false'")
    await cdp('Page.navigate', { url: 'http://127.0.0.1:5198/' })
    let ready = false
    for (let attempt = 0; attempt < 100; attempt++) {
      ready = await evaluate('document.body?.dataset.ready === "true"')
      if (ready) break
      await wait(100)
    }
    assert.ok(ready, 'Componentes não renderizaram')
    assert.equal(
      await evaluate('document.documentElement.scrollWidth <= innerWidth'),
      true,
      `Overflow ${width}`,
    )
    assert.equal(
      await evaluate(
        "getComputedStyle(document.querySelector('#legacy')).getPropertyValue('--mrj-color-primary').trim()",
      ),
      '',
    )
    assert.equal(
      await evaluate("getComputedStyle(document.querySelector('#primary')).backgroundColor"),
      'rgb(110, 74, 183)',
    )
    await cdp('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Tab', windowsVirtualKeyCode: 9 })
    await cdp('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Tab', windowsVirtualKeyCode: 9 })
    assert.equal(await evaluate('document.activeElement.id'), 'primary')
    assert.equal(await evaluate('getComputedStyle(document.activeElement).outlineStyle'), 'solid')
    const focus = await cdp('Page.captureScreenshot', {
      format: 'png',
      captureBeyondViewport: true,
    })
    writeFileSync(resolve(folder, `focus-${width}.png`), Buffer.from(focus.data, 'base64'))
    await cdp('Input.dispatchKeyEvent', {
      type: 'keyDown',
      key: 'Enter',
      windowsVirtualKeyCode: 13,
    })
    await cdp('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Enter', windowsVirtualKeyCode: 13 })
    assert.equal(await evaluate('window.clicks'), 1)
    assert.equal(
      await evaluate(
        "document.querySelector('#disabled').disabled && document.querySelector('#loading').disabled",
      ),
      true,
    )
    await evaluate(
      "document.querySelector('#disabled').click();document.querySelector('#loading').click()",
    )
    assert.equal(await evaluate('window.clicks'), 1)
    await evaluate(
      "const field=document.querySelector('#name');field.value='João';field.dispatchEvent(new Event('input',{bubbles:true}))",
    )
    assert.equal(await evaluate("document.querySelector('#model').textContent"), 'João')
    assert.equal(await evaluate("document.querySelector('[aria-invalid=true]').labels.length"), 1)
    const bounds = await evaluate(
      "JSON.stringify(document.querySelector('#primary').getBoundingClientRect().toJSON())",
    )
    const rect = JSON.parse(bounds)
    await cdp('Input.dispatchMouseEvent', { type: 'mouseMoved', x: rect.x + 5, y: rect.y + 5 })
    await wait(200)
    assert.equal(
      await evaluate("getComputedStyle(document.querySelector('#primary')).backgroundColor"),
      'rgb(99, 54, 158)',
    )
    const screenshot = await cdp('Page.captureScreenshot', {
      format: 'png',
      captureBeyondViewport: true,
    })
    writeFileSync(
      resolve(folder, `components-${width}.png`),
      Buffer.from(screenshot.data, 'base64'),
    )
    await cdp('Emulation.setEmulatedMedia', {
      features: [{ name: 'prefers-reduced-motion', value: 'reduce' }],
    })
    assert.equal(
      await evaluate("getComputedStyle(document.querySelector('#primary')).transitionDuration"),
      '0s, 0s',
    )
    console.log(
      `PASS ${width}px: render, slots, teclado/foco, clique, disabled/loading, v-model, hover, movimento reduzido, isolamento e overflow`,
    )
  }
  assert.deepEqual(errors, [])
  console.log(`Screenshots: ${folder}`)
} finally {
  if (ws?.readyState === WebSocket.OPEN) {
    await cdp('Browser.close').catch(() => {})
    ws.close()
  }
  processChrome.kill()
  await vite.close()
}
