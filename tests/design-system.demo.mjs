import { createServer } from 'vite'
import vue from '@vitejs/plugin-vue'

export async function startDemoServer() {
  const server = await createServer({
    configFile: false,
    appType: 'custom',
    optimizeDeps: { noDiscovery: true, include: [] },
    plugins: [
      vue(),
      {
        name: 'feat48-manual-demo',
        resolveId(id) {
          if (id === '/__feat48-demo.js') return '\0feat48-demo'
        },
        load(id) {
          if (id === '\0feat48-demo') {
            return `import { createApp } from 'vue'
import Demo from '/tests/fixtures/DesignSystemDemo.vue'
createApp(Demo).mount('#app')`
          }
        },
        configureServer(vite) {
          vite.middlewares.use((req, res, next) => {
            if (req.url?.split('?')[0] !== '/') return next()
            res.setHeader('Content-Type', 'text/html; charset=utf-8')
            res.end(`<!doctype html><html lang="pt-BR"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>MaRuJoBs — demonstração FEAT-48</title></head>
<body><div id="app"></div><script type="module" src="/__feat48-demo.js"></script></body></html>`)
          })
        },
      },
    ],
    server: { host: '127.0.0.1', port: 5199, strictPort: true },
  })
  await server.listen()
  console.log('\nFEAT-48 — demonstração local (Ctrl+C para encerrar)')
  server.printUrls()
  for (const signal of ['SIGINT', 'SIGTERM']) {
    process.once(signal, async () => {
      await server.close()
      process.exit(0)
    })
  }
  return server
}
