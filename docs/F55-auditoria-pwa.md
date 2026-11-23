# F55 · Auditoria, segurança e estabilidade do PWA

## Base e diagnóstico

A branch local `F55` parte de `origin/DEV` em `b20aaa8`. Os merges #106 e #107 incluem o worker, o histórico e os indicadores da F60, além da auditoria responsiva da F49. A consulta de branches e PRs por F55 encontrou a auditoria pendente. [F60](https://github.com/MaRuJoBs/Front_marujob/pull/106) · [F49](https://github.com/MaRuJoBs/Front_marujob/pull/107)

| Área                               | Estado da DEV auditada                                                                                                                                                                                                                                                                                 |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Manifesto, ícones e worker inicial | Implementados. O manifesto está em `/manifest.webmanifest`, com nome e nome curto MaruJobs, descrição, tema roxo, fundo branco, `standalone` e início e escopo em `/`. Os ícones existentes são PNG 192 e 512 com `any maskable`. O HTML já tinha ícone de toque e metadados da Tela de Início no iOS. |
| Atualização                        | Com regressão. `skipWaiting()` deixava a versão nova assumir abas antigas durante a sessão. O teste do worker anterior reproduziu a ausência do estado de espera após recuperar uma instalação interrompida. A ativação do Workbox também podia eliminar entradas usadas por abas com bundles antigos. |
| Cache e offline                    | Parcial. A SPA já funcionava a partir do precache. A lista de exclusão de navegação não correspondia a caminhos como `/api?...`, porque o Workbox avalia caminho e consulta. O glob também abrangia arquivos na raiz e em diretórios alheios aos assets do build.                                      |
| Web Push                           | Implementado com integração F60. Parcial na validação da entrada do worker, que aceitava identificadores fora do contrato e podia tentar coerção de um evento que não fosse string.                                                                                                                    |
| Homologação pública                | Bloqueada no endereço consultado. A homepage declarada do frontend retornou HTTP 404 para `/`, `/sw.js` e `/manifest.webmanifest`. O OpenAPI da API configurada respondeu 200, mas o VAPID público, o histórico e as inscrições responderam 404.                                                       |

## Correções e estratégia

- **Atualização.** `vite.config.js` usa `registerType: 'prompt'` com o registro estático de sempre. O worker baixa a nova versão em segundo plano e segue o estado de espera nativo até o encerramento das páginas controladas pela versão anterior. A interface continua no documento atual durante a espera. `clientsClaim()` passa o controle no momento da ativação, inclusive na primeira instalação. A ativação limpa entradas obsoletas pelo Workbox. Uma falha ao baixar um asset deixa a versão anterior ativa. [Ciclo de vida do Service Worker](https://web.dev/articles/service-worker-lifecycle) · [Vite PWA e worker customizado](https://vite-pwa-org.netlify.app/guide/inject-manifest)
- **Precache.** A lista de inclusão cobre a shell, o script público de registro, o manifesto, os dois ícones e os assets estáticos produzidos em `assets/`. O worker de produção mantém `injectManifest` e escopo raiz. A regra de navegação exclui API, mídia dinâmica, WebSocket e caminhos de arquivos estáticos, inclusive com query string. Os recursos públicos que existem no precache continuam acessíveis. Cache Storage recebe entradas estáticas do build. JWT, dados de conta e respostas privadas seguem o fluxo de rede e sessão da aplicação.
- **Manifesto.** `index.html` passa a declarar a cor de tema já usada pelo manifesto. O desenho dos ícones foi inspecionado visualmente. O teste lê os PNGs no navegador, confirma dimensão e opacidade e mede a arte em relação ao círculo seguro de 40% do lado. [Ícones maskable](https://web.dev/articles/maskable-icon)
- **Push.** `sw.js` valida tipo de evento, ID inteiro positivo e título e corpo não vazios. Aprovação e recusa usam o texto do servidor, ícone público e tag estável. O clique usa a rota interna `/notificacoes`, e as mensagens do worker à SPA mantêm a atualização de histórico e badge. VAPID, consentimento, espera após 429, inscrição e limpeza de sessão continuam sob o fluxo da F60. [Unidade 8 do curso](https://eduardo-da-silva.github.io/desenvolvimento-mobile/unidade8/) · [Relatório F60](F60-notificacoes-push-freelancer.md)

O proxy em desenvolvimento e a API configurada em produção permanecem os mesmos. O registro do worker segue desabilitado em `npm run dev`, onde a rotina existente limita a limpeza ao worker e precache deste projeto no escopo atual. O preview testa a distribuição de produção. A configuração Vercel foi inspecionada e permanece com fallback de SPA. Os tipos MIME e a disponibilidade nas URLs publicadas precisam ser conferidos novamente após o ambiente voltar a servir o deploy.

## Verificação local e desempenho

- `npm test` passou com 275 testes, incluindo autenticação simulada, troca de conta, expiração, chat, permissão negada, ausência de suporte, limitação 429 e rotação VAPID.
- `npm run build` gerou `dist/sw.js` com 95 entradas de precache, aproximadamente 1.899 KiB. O principal bundle tem 343,87 kB, ou 117,17 kB gzip. Os maiores PNGs emitidos têm 369,64 e 245,62 kB. A fonte sólida Font Awesome tem 119,16 kB. O manifesto e os assets do build carregaram com MIME esperado no preview.
- `npm run dev` serviu o manifesto com HTTP 200 e o HTML de desenvolvimento com o cliente Vite. O HTML não injetou o registrador de produção.
- Na execução final local do Chrome, com fontes e SDK externos bloqueados para isolar o build, o LCP foi de 200 ms, o CLS observado foi de aproximadamente 0,00007 e o DevTools registrou 222 ms de tarefas, incluindo 33 ms de scripts e 30 ms de layout. É uma amostra sintética da página inicial, sem métricas de campo ou INP. A duplicidade de referências externas de Font Awesome e os assets grandes aparecem no diagnóstico. Os estilos existentes continuam sendo servidos como antes.
- Os ícones de 192 e 512 px são opacos. A arte mediu aproximadamente 69,3 px e 184,6 px de raio, dentro dos limites seguros de 76,8 e 204,8 px, respectivamente.
- A suíte padrão da F49 e a matriz complementar de 406 combinações passaram. A matriz inclui rolagem em telas baixas, conversa sem footer e central da F60 com footer.
- `node tests/notificacoes.browser.mjs --pwa` passou no Chrome, com 36 cenários de interface e a auditoria do worker gerado. Também verificou descarte de payloads inválidos, mensagem de renovação, escopo único, ausência de respostas privadas no Cache Storage e ativação da nova versão com limpeza da shell anterior.
- A suíte de PWA no Edge passou com instalabilidade reconhecida, cache estático, offline, retomada, aprovação e recusa simuladas, URL externa descartada e atualização em duas abas após falha de precache. A versão anterior preservou o campo de teste e a revisão nova removeu a shell antiga na ativação.
- O preview por `npm run preview` respondeu HTTP 200 com `text/javascript` para `/sw.js`, `application/manifest+json` para o manifesto e `text/html` para o deep link de notificações.

Arquivos modificados: `index.html`, `vite.config.js`, `src/sw.js` e `tests/notificacoes.browser.mjs`, além deste relatório. O teste utiliza o build real e simula a entrega de push, as respostas privadas de teste e uma segunda versão com falha temporária na shell.

Comandos de regressão: `npm test`, `npm run build`, `node tests/notificacoes.browser.mjs --pwa`, `node tests/responsividade.browser.mjs` e `node tests/responsividade.browser.mjs --matriz-atual`. Para repetir no Edge, defina `CHROME_BIN` com o caminho de `msedge.exe` e rode a suíte de notificações com `--pwa --somente-pwa`. Os logs de execução da auditoria estão sob `node_modules/.cache/f55-*.log`.

## Limites e classificação

**CONCLUÍDA COM RESSALVAS.** A produção foi auditada em build local. Chrome e Edge reconheceram a aplicação como instalável via DevTools. O comando experimental de instalação nativa `PWA.install` estava indisponível na sessão headless usada, portanto a criação de uma janela standalone pelo sistema operacional e a abertura offline a partir de um atalho instalado permanecem pendentes.

**PENDENTE DE HOMOLOGAÇÃO FÍSICA:** Android, iPhone, Safari iOS, notificações com tela bloqueada, modo standalone em dispositivos móveis, segundo plano e transição Wi-Fi/rede móvel. Firefox não foi localizado. A cobertura de área segura e de resoluções é de emulação. A entrega real de push, inscrição na B60, o Google real e as transições autenticadas ponta a ponta dependem dos ambientes publicados. A F60 cobre os contratos e a revisão de sessão com dependências simuladas. A troca de versão fica pendente enquanto houver uma janela da revisão anterior aberta. Notificações já em trânsito seguem a limitação documentada na F60.

## Homologação manual

1. Execute `npm ci`, `npm run build` e `npm run preview`. Abra o endereço localhost indicado. Confira em DevTools o manifesto, os ícones, a instalação, o único worker e seu escopo.
2. Instale pelo menu do navegador compatível. Abra em modo standalone, passe para offline e recarregue uma rota protegida. A shell deve abrir e a rota deve continuar protegida. Ações dependentes da API só devem confirmar sucesso com resposta real. Reative a rede e repita a consulta.
3. Com duas abas abertas, publique uma nova revisão no ambiente de teste e solicite atualização em DevTools. Confirme que o worker aguarda e que os campos preenchidos permanecem intactos. Feche as duas abas ou janelas do app e reabra para validar a nova versão. Repita com um recurso temporariamente indisponível durante a instalação.
4. Em HTTPS com a B60 acessível, use duas contas de teste. Autorize push em uma conta freelancer, aprove e recuse duas candidaturas pela conta empresa e valide tela bloqueada, app em segundo plano, clique, histórico e badge. Teste desligar, sair offline, trocar de conta no dispositivo e alternar conexão. Valide também a expiração e o refresh JWT.
5. Repita em Android e no iPhone. No iPhone com iOS compatível, adicione o app à Tela de Início antes de solicitar permissão para push. Valide orientação, área segura e retorno ao app em ambos. [WebKit sobre Web Push](https://webkit.org/blog/13966/webkit-features-in-safari-16-4/)

## Proposta de PR

**Título sugerido** — F55 · protege o cache e preserva abas durante atualizações do PWA.

**Descrição sugerida** — Mantém o worker da F60 e a shell offline. A atualização aguarda as abas anteriores, o precache usa uma lista explícita de recursos públicos, a navegação exclui caminhos privados e o worker valida o payload antes de exibir a notificação. A auditoria inclui o build publicado localmente, verificações de instalação, atualização em duas abas, falha de precache e Web Push simulado.
