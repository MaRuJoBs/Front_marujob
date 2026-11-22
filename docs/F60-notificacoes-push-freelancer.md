# F60 · Notificações de candidaturas e Web Push

## Base e contrato

A implementação parte de `origin/DEV` em `82ae435`, na branch `FEAT-60`. A FEAT-57 já fornecia a rota exclusiva do freelancer, o sino no rodapé e os avisos de chat. A central empresarial e seu contador continuam usando os serviços existentes. [PR #105](https://github.com/MaRuJoBs/Front_marujob/pull/105)

A integração foi conferida nas rotas, views e serializers da B60 na DEV do Django. O histórico e as inscrições pertencem ao freelancer autenticado pelo JWT. O Django registra a decisão da empresa, persiste a notificação e envia o push. O título da oportunidade já vem no texto persistido em `mensagem`. A B60 não fornece um campo separado de título da oportunidade. O link usa `oportunidade`, que pode ser nula quando a candidatura deixa de existir. [Documentação da B60](https://github.com/MaRuJoBs/Back_Marujob/blob/DEV/docs/B60-notificacoes-push-freelancer.md) · [Rotas](https://github.com/MaRuJoBs/Back_Marujob/blob/DEV/app/urls.py) · [Histórico](https://github.com/MaRuJoBs/Back_Marujob/blob/DEV/core/views/notificacao_freelancer.py) · [Inscrições](https://github.com/MaRuJoBs/Back_Marujob/blob/DEV/core/views/push_subscription.py)

| Método | Caminho relativo a `/api/`                    | Uso                                        |
| ------ | --------------------------------------------- | ------------------------------------------ |
| GET    | `notificacoes-freelancer/?page=N`             | Histórico por página na ordem do backend   |
| GET    | `notificacoes-freelancer/?lida=false`         | Usa o `count` global do filtro para o sino |
| PATCH  | `notificacoes-freelancer/{id}/marcar-lida/`   | Marca a notificação pelo seu ID, sem corpo |
| POST   | `notificacoes-freelancer/marcar-todas-lidas/` | Marca as não lidas da conta, sem corpo     |
| GET    | `push/vapid-public-key/`                      | Obtém a chave pública VAPID sem JWT        |
| POST   | `push/subscriptions/`                         | Envia `subscription.toJSON()` com JWT      |
| DELETE | `push/subscriptions/`                         | Envia `{"endpoint":"..."}` com JWT         |

A contagem e a página aberta se atualizam ao recuperar foco, visibilidade ou receber mensagem do Service Worker. Entrar na aplicação e abrir a central também consultam a API. O histórico permanece depois da leitura. O sino conta candidaturas e o ícone Mensagens conta o chat. `AvisosChat` continua na central com as conversas não lidas.

## Inscrição e sessão

A Home oferece o convite aos freelancers autenticados em navegadores com suporte. “Agora não” adia o convite por sete dias para aquela conta neste navegador. A central oferece a ativação posterior e a desativação do dispositivo. A permissão do navegador é solicitada no clique. Com permissão já concedida e sem desativação voluntária, a sessão autenticada sincroniza a inscrição após o login tradicional, Google ou restauração de sessão. A retomada verifica se a inscrição mudou e o evento de renovação solicita nova sincronização.

O cliente decodifica o ponto público VAPID em 65 bytes, reutiliza a inscrição vigente com a mesma chave e substitui inscrições expiradas ou de outra chave. A revisão de sessão e o cancelamento de requisições protegem a lista, o badge e as operações de push contra respostas atrasadas. Logout e substituição de conta tentam o DELETE antes de descartar o JWT, com limite de 2,5 segundos para a remoção remota. O cancelamento no navegador é tentado mesmo sem rede. Na expiração em uma SPA aberta, sem JWT, a limpeza local continua disponível. Uma entrega já em trânsito pode aparecer depois da saída, conforme o contrato B60.

Na mesma sessão, foco, visibilidade e retorno da conexão conferem a inscrição no navegador. Uma inscrição já confirmada com endpoint, expiração e chaves iguais não gera outro POST. A chave VAPID é consultada no primeiro cadastro, se a inscrição mudar ou quando voltar ao app após uma hora da última validação. A operação em andamento é compartilhada por gatilhos concorrentes. Falhas durante a revalidação mantêm a indicação de ativo enquanto a inscrição confirmada continuar válida. O cliente respeita `Retry-After` no HTTP 429 e, na ausência de um prazo futuro válido, espera um minuto antes de tentar novamente na mesma sessão. A próxima tentativa ocorre com um novo gatilho da aplicação.

## Service Worker

`vite.config.js` usa `injectManifest`. O build mantém `/sw.js`, escopo raiz, manifesto e ícones estáticos, atualização automática e precache do Workbox. O worker assume o controle ao ativar e usa a limpeza de caches antigos do Workbox, preservando a navegação offline da SPA. A API, a mídia dinâmica e o WebSocket ficam fora do fallback. Nenhuma resposta autenticada entra no cache do worker. O push usa o título e corpo fornecidos pelo Django, avisa as janelas abertas e abre ou foca `/notificacoes` na mesma origem ao clicar. O destino é definido no código, independentemente da URL no payload. [Unidade 8](https://eduardo-da-silva.github.io/desenvolvimento-mobile/unidade8/) · [Service Worker customizado](https://eduardo-da-silva.github.io/desenvolvimento-mobile/unidade8/tutorial/02-service-worker/) · [Permissão e inscrição](https://eduardo-da-silva.github.io/desenvolvimento-mobile/unidade8/tutorial/03-subscribe/)

## Como ver e homologar

Com uma API Django B60 disponível no endereço de desenvolvimento padronizado (`http://127.0.0.1:8000/api/`):

1. Execute `npm run dev`, entre com uma conta freelancer em `http://localhost:5173` e clique em **Avisos**. A URL direta é `http://localhost:5173/notificacoes`.
2. Para o teste do worker, faça o build de produção apontar para uma API B60 com CORS para a origem do preview. Exemplo no PowerShell, usando a API local.

   ```powershell
   $env:VITE_API_URL = 'http://127.0.0.1:8000/api/'
   npm run build
   npm run preview -- --host localhost
   ```

   Abra `http://localhost:4173/notificacoes`, autentique o freelancer e clique em **Ativar notificações**. Use outra sessão ou perfil de navegador para a empresa. No DevTools, em **Application → Service Workers**, confirme o controle por `sw.js`. O modo `npm run dev` mantém o worker desabilitado.

3. Em homologação, use duas candidaturas. Aprove uma e recuse outra na sessão empresarial. Na sessão freelancer, confira os dois avisos, o clique na central, a data, o nome da vaga, o badge e a persistência da leitura após recarregar. Teste também permissão negada, troca de conta e logout em apenas um dos dispositivos inscritos.
4. Repita em Chrome e Firefox desktop, Chrome Android e iPhone com um endereço HTTPS de homologação. No iPhone/iPad compatível, adicione o app à Tela de Início e solicite a permissão a partir do app instalado. Teste também com o app em segundo plano. Um IP da rede local em HTTP comum serve para avaliar a UI, mas não oferece o contexto seguro exigido pelo Push. [WebKit sobre Web Push no iOS e iPadOS](https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/)

Para reproduzir os testes de integração simulada e do worker gerado, execute `npm test`, `npm run build` e `node tests/notificacoes.browser.mjs --pwa`. O teste usa Chrome headless e pode receber o caminho do navegador em `CHROME_BIN`. Os dados e decisões simulados ficam nos testes.

## Arquivos e verificação

- A página `NotificacoesFreelancerView.vue` amplia a rota existente. `App.vue`, `Footer.vue` e `IndicadorAvisos.vue` atualizam os indicadores. `AvisosChat.vue` e as páginas da empresa foram reaproveitados.
- `notificacoesFreelancerService.js` encapsula o contrato do histórico. `notificacoesFreelancer.js` mantém paginação, leitura e contagem específicas do freelancer.
- `NotificationPrompt.vue` e `HomeComponent.vue` oferecem o convite e a configuração. `usePushNotifications.js` e `pushService.js` cuidam da inscrição. `authService.js` e `PerfilComponent.vue` integram a limpeza à troca de conta e à saída.
- `vite.config.js`, `sw.js` e `pushEvents.js` configuram o worker e a comunicação com a SPA. `package.json` e `package-lock.json` declaram os três módulos Workbox importados pelo worker e incluem a suíte nova.
- `npm test` executou 275 testes e passou todos, incluindo autenticação tradicional e Google com transporte simulado. O Chrome headless aprovou 30 cenários de interface entre 320 e 1280 px, com foco e visibilidade repetidos, histórico, leitura, contador, chat e fluxo da empresa.
- O build produziu `dist/sw.js` e `dist/registerSW.js`, com 95 entradas de precache. O Chrome executou push simulado de aprovação e recusa no worker de produção, verificou a notificação, o clique na rota interna mesmo com URL externa no payload, a mensagem à SPA e a navegação offline. A API privada ficou indisponível offline. O projeto oferece Prettier e não define um script de lint.

## Publicação e dependências

Na verificação, a API local recusou a conexão em `127.0.0.1:8000`. A API HTTPS registrada em `.env.production` respondeu HTTP 404 ao GET público de VAPID e à rota de histórico sem credenciais. A origem HTTPS informada como homepage no GitHub também respondeu HTTP 404 na raiz, em `/notificacoes` e no manifesto, com `X-Vercel-Error: DEPLOYMENT_NOT_FOUND` na raiz. A homologação real em navegadores e celulares físicos depende de um ambiente com frontend publicado, B60 acessível, migração aplicada, VAPID configurado e contas de teste. [Homepage informada pelo repositório](https://front-marujob-roan.vercel.app/)

Na revisão do PR #106, o bundle gerado por `npm run build` incluiu `https://marujob.class.fabricadesoftware.ifc.edu.br/api/`, conforme `.env.production`. O OpenAPI desse host respondeu HTTP 200 e publicou 17 caminhos, sem as rotas B60. `/api/usuarios/me/` respondeu 401 sem JWT e os caminhos de chave VAPID, histórico e inscrições responderam 404. Esses resultados indicam que as rotas ainda não estão expostas nesse endereço. A implementação da B60 responde 503 na consulta da chave pública quando o VAPID está indisponível. O estado das migrations, a configuração VAPID e o comportamento dos endpoints privados com JWT continuam pendentes de verificação no ambiente com a B60. [OpenAPI publicado](https://marujob.class.fabricadesoftware.ifc.edu.br/api/schema/?format=json) · [Contrato do endpoint VAPID](https://github.com/MaRuJoBs/Back_Marujob/blob/DEV/core/views/push_subscription.py)
