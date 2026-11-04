# Correção de foto Google e cadastro de portfólio — 04/11/2026

O pedido posterior à FEAT-38 autorizou corrigir perfil/foto Google e adição de portfólio. A raiz `Front_marujob` e o estado inicial do Git foram conferidos; alterações preexistentes de favoritos, Home e `App.vue` foram preservadas. Nenhum repositório de backend foi aberto ou alterado.

## Diagnóstico

- Perfil e portfólio exibiam exclusivamente `profile_image`; a informação de foto recebida pelo login Google não tinha fallback visual quando esse campo vinha vazio ou a imagem falhava.
- URLs relativas de mídia eram concatenadas ou usadas diretamente de formas diferentes nas telas.
- O formulário capturava erros de POST/PATCH somente com `console.error`, sem feedback ao usuário. Não validava os campos obrigatórios e começava com quatro tags fictícias.
- O modo edição era definido somente na montagem. Mudanças de ID e de conta podiam manter campos antigos; o navegador também confirmou dados/foto antigos no perfil ao trocar de conta mantendo a rota.
- O perfil recuperava apenas a primeira página dos projetos e assumia sempre `results`; erros de listagem podiam ser confundidos com ausência de projetos.

A API local estava respondendo durante esta investigação: `OPTIONS /api/portfolios/` retornou **401** sem credenciais e `GET /api/schema/?format=json` retornou **200**. O schema confirmou os endpoints existentes de perfil, login Google e portfólios, POST **201**, PATCH **200**, paginação e campos `titulo` (255), `categoria` (100), `descricao`, `tags`, `link` (200) e `imagem`. Não foram usados tokens reais, criadas contas ou publicados projetos na API real.

## Implementação e arquivos

| Arquivo | Alteração nesta solicitação |
| --- | --- |
| `src/utils/imagens.js` | Resolve mídia relativa na origem da API e preserva URLs HTTP/HTTPS válidas. |
| `src/services/fotoGoogle.js` | Após login Google aceito e identificação via `/me/`, conserva somente a URL HTTPS da foto em domínio Googleusercontent, por ID de usuário. |
| `src/services/authService.js` | Integra o metadado visual após autenticação bem-sucedida; preserva login tradicional, endpoints, tokens e guards. |
| `src/components/PerfilAvatar.vue` | Prioriza foto enviada no perfil, tenta a foto Google se necessário e oferece estado sem imagem; usa `no-referrer`. |
| `src/components/PerfilComponent.vue` | Avatar compartilhado, carregamentos independentes de perfil/projetos, paginação, erros visíveis e limpeza ao mudar a sessão. Câmera navega à edição existente. |
| `src/components/PortfolioComponent.vue` | Avatar compartilhado, listagem paginada, estados de carregamento/erro/vazio, mídia normalizada e atualização ao trocar de conta. Profissão/localização agora vêm do perfil em vez de textos fixos. |
| `src/composables/usePerfilImagem.js` | Reutiliza o resolvedor de mídia, preservando seleção local e liberação de URLs temporárias. |
| `src/composables/useEditarPerfil.js` | Usa foto Google como alternativa visual e trata falha da imagem do perfil. |
| `src/components/EditarPerfil.vue` | Integra o fallback de imagem e `no-referrer` na prévia existente. |
| `src/services/portfolioService.js` | Reutiliza Axios central; consulta lista/detalhes, normaliza tags, segue paginação da mesma API, envia POST/PATCH e valida confirmação. Traduz falhas sem expor respostas HTML de erro. |
| `src/composables/usePortfolioForm.js` | Validação, FormData com arquivo, tags preenchidas pelo usuário, link com protocolo, preservação de campos em erro, bloqueio concorrente, reinicialização por ID/conta e descarte de respostas antigas. Edição bloqueada até carregar o projeto. |
| `src/components/PortfolioAdicionarComponent.vue` | Formulário existente integrado ao composable; erro acessível, carregamento, confirmação real e controles desabilitados durante envio. Sem tags fictícias; categoria legada preservada. |
| `src/components/PortfolioDetalheComponent.vue` | Serviço de detalhe, resolução de mídia, erros visíveis, atualização por ID/conta e proteção contra exclusão duplicada. |
| `tests/auth.test.mjs` | Dois novos testes de metadado visual: login aceito/recusado, isolamento e URLs inseguras. |
| `tests/perfil-portfolio.test.mjs` | 19 testes de formulário, transporte, paginação, mídia, validação, concorrência, sessão e confirmação. |
| `tests/perfil-portfolio.browser.mjs` | Chrome/CDP com componentes/rotas reais e transporte/imagens simulados; upload, criação, edição, perfil, contas e layout. |
| `package.json` | Inclui a suíte nova em `test` e adiciona `test:perfil-portfolio:browser`; nenhuma dependência instalada. |
| `docs/correcao-perfil-portfolio.md` | Este diagnóstico e evidências. |

O claim de foto é somente informação de apresentação; o frontend não usa seu conteúdo para autenticar ou autorizar usuários. A validação de identidade continua no servidor, conforme o [guia oficial Google](https://developers.google.com/identity/gsi/web/guides/verify-google-id-token). Não são persistidos a credencial Google, seu payload completo, e-mail ou senha junto da foto. A chave visual é `marujobs:foto-google:usuario:<id>`; falha ao gravá-la não impede o login. O perfil enviado manualmente continua prioritário.

## Validação executada

| Comando/verificação | Resultado |
| --- | --- |
| `npm.cmd test` | **Saída 0: 168 aprovados, 0 falhas/cancelados/ignorados.** |
| `npm.cmd run test:perfil-portfolio:browser` | **Saída 0.** Foto Google no perfil/edição, prioridade de foto enviada, fallback de imagem ausente, isolamento A–B–A, paginação de projetos, upload multipart, erro 400 com campos preservados, POST único/201, PATCH/200 e atualização no perfil/lista. |
| Layout no Chrome | **12 verificações aprovadas**: Perfil, Portfólio e Adicionar em 320, 375, 768 e 1440 px; sem overflow horizontal e sem exceções JavaScript. Capturas de Perfil 320, Portfólio 375 e Adicionar 320 inspecionadas visualmente. |
| `npm.cmd run test:favoritos:browser` | **Saída 0: 13/13 cenários e 20 verificações de layout aprovados**, incluindo a regressão da Home. |
| `npm.cmd run build` | **Saída 0**, Vite **7.3.2**, **192 módulos**, `✓ built in 3.88s`; PWA com **71 entradas** de precache e arquivos de service worker gerados. |
| `git diff --check` | Sem erros de whitespace. Não há script de lint configurado. |

Roteiros de navegador e build foram executados fora da sandbox pelo bloqueio já identificado do esbuild/Chrome na execução restrita. O aviso preexistente de Browserslist/caniuse-lite antiga permanece. Não foram alteradas configurações de produção, instaladas bibliotecas ou executados commit, push, merge ou deploy.

As rodadas intermediárias identificaram e corrigiram configuração de import no teste SSR, suporte de troca de rota no renderer de teste, resposta simulada de imagem 404 contendo indevidamente PNG válido e a atualização real do perfil ao trocar de conta na mesma rota. Não houve falhas na última execução de cada suíte. Artefatos de navegador ficam ignorados em `node_modules/.cache/perfil-portfolio-navegador/`.

## Limites e confirmação na conta real

**Correções frontend implementadas e verificadas; confirmação na conta real pendente.** Não foram realizados login Google interativo ou POST/PATCH/DELETE com a conta do usuário. Portanto, não se afirma que uma rejeição específica do servidor à conta foi resolvida sem observar sua resposta autenticada.

Para capturar a foto em uma sessão anterior à correção, é necessário sair e entrar novamente pelo Google. O fallback depende de o Google fornecer `picture` e de a URL da imagem responder; ele fica limitado ao navegador. Sincronização e armazenamento permanente dessa imagem no perfil da API dependem do backend, que não foi alterado. Se a foto já vier corretamente em `profile_image`, ela funciona diretamente sem o cache visual.

O formulário agora apresenta o motivo retornado pela API e mantém os campos preenchidos se a gravação falhar. Se a tentativa real ainda falhar, o texto exibido permitirá distinguir validação, permissão e indisponibilidade do servidor. Nenhuma oportunidade, conta ou projeto fictício foi inserido na aplicação; os exemplos novos existem somente nos testes.
