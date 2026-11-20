// Preview isolado: usa autenticação existente e API real, sem alterar rotas do produto.
import { createServer } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'node:path'
const html = `<!doctype html><html lang="pt-BR"><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet"><title>F45 — Preview isolado</title><div id="app"></div><script type="module">
import {createApp,h,resolveComponent} from 'vue'
import {createRouter,createWebHistory} from 'vue-router'
import {createPinia} from 'pinia'
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome'
import {library} from '@fortawesome/fontawesome-svg-core'
import {fas} from '@fortawesome/free-solid-svg-icons'
import Busca from '/src/views/BuscaFreelancersView.vue'
import Perfil from '/src/views/PerfilPublicoFreelancerView.vue'
import Login from '/src/views/LoginView.vue'
import Mensagens from '/src/views/MensagensView.vue'
import {instalarProtecao} from '/src/router/authGuard.js'
import '/src/assets/main.css'
library.add(fas)
const router=createRouter({history:createWebHistory(),routes:[{path:'/',name:'login',component:Login,meta:{publica:true}},{path:'/homeEmpresa',redirect:'/empresa/freelancers'},{path:'/empresa/freelancers',component:Busca,meta:{requiresAuth:true,tipo:'empresa'}},{path:'/empresa/freelancers/:id',component:Perfil,meta:{requiresAuth:true,tipo:'empresa'}},{path:'/mensagens',name:'mensagens',component:Mensagens,meta:{requiresAuth:true}}]})
instalarProtecao(router)
createApp({render:()=>h(resolveComponent('RouterView'))}).use(createPinia()).use(router).component('FontAwesomeIcon',FontAwesomeIcon).mount('#app')
</script></html>`
const server = await createServer({
  configFile: false,
  plugins: [
    vue(),
    {
      name: 'preview-f45',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url === '/' || req.url?.startsWith('/empresa/')) {
            server
              .transformIndexHtml(req.url, html)
              .then((page) => {
                res.setHeader('Content-Type', 'text/html; charset=utf-8')
                res.end(page)
              })
              .catch(next)
          } else next()
        })
      },
    },
  ],
  resolve: { alias: { '@': resolve('src') } },
  server: { port: 5174, strictPort: true },
  optimizeDeps: { include: ['vue', 'vue-router', 'axios'] },
})
await server.listen()
server.printUrls()
