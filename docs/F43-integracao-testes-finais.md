# F43 · Integração e testes finais do frontend

## Base e ambiente

- Branch `F43` criada sobre `origin/DEV` em `2d9ee34`. O PR #110 já integra a F61, incluindo `f2885df`. A busca de branches, commits e PRs por F43 e variantes encontrou apenas referências à tarefa em relatórios anteriores.
- A árvore inicial tinha somente capturas F61 locais. O trabalho se limita ao repositório frontend, sem alterações em ambientes nem dados do backend.
- Baseline local em Node 22 e Chrome: 275/275 em `npm test`, build Vite aprovado com 94 entradas no precache.

## Diagnóstico e correções

| Prioridade | Área | Reprodução, causa e correção |
| --- | --- | --- |
| P1 | Rolagem do chat | A F61 registrou exceção intermitente ao trocar de rota na matriz. Um evento de rolagem enfileirado podia chegar após o desmontar da lista, com a referência ao elemento já nula. O handler agora encerra nesse caso e mantém o cálculo de proximidade do fim quando há elemento. |
| P1 · teste | Notificações empresariais | A baseline falhou ao exigir `aria-busy` na carga inicial. O carregamento da lista já é anunciado por `role=status`. O teste passou a verificar o indicador específico de candidaturas, seu texto e visibilidade. As demais rotas mantêm as assertivas anteriores. |
| P1 · teste | Vagas | A baseline de criação falhou esperando seis erros. `validarVaga()` define título, categoria, descrição, preço e duração como obrigatórios. Os roteiros verificam os nomes exatos, foco no erro, ação de toque com o mínimo atual de 44 px e formulário dentro do limite desktop de 64 rem. O contrato de publicação exige os campos estruturados de modalidade, cidade, UF e status com a descrição intacta. O destaque de confirmação é verificado no cabeçalho atual do painel. |
| P1 · teste | Perfil e portfólio | A baseline falhou na montagem de `/perfil`. O harness passou a instalar Pinia antes do router, seguindo o bootstrap de produção. |
| P1 · teste | Isolamento dos favoritos | A F61 reproduziu corrida entre logout e nova sessão. O roteiro agora aguarda o logout assíncrono antes de criar a próxima sessão. |
| P2 · teste | Enter no design system | A falha histórica foi observada na baseline. O harness envia eventos de tecla CDP com os dados do Enter, mantendo a verificação de foco e clique real. |
| P1 · teste | Roteiros empresariais e oportunidades | `empresa-visual.browser.mjs` está ausente na base. A cobertura empresarial usa a matriz, gerenciamento, notificações e localização. A ponte PowerShell da listagem e detalhes de oportunidades foi substituída por CDP nativo em Node para executar os cenários no Chrome local. |

## Integração e segurança

O ambiente de desenvolvimento aponta para `http://127.0.0.1:8000/api/`. A consulta real e sem credenciais a `/api/freelances/` retornou HTTP 401 com desafio Bearer. O preflight de `http://localhost:5173` respondeu 200 e autorizou o cabeçalho `Authorization`. Isso confirma conectividade, CORS para essa origem e exigência de sessão nesse endpoint. Os fluxos autenticados e a confirmação de permissões cruzadas no Django precisam de contas autorizadas.

A configuração de produção usa HTTPS na API. O frontend calcula o esquema WebSocket a partir da mesma base e usa a camada Axios para sessão e serviços. O repositório tem regra de rewrite SPA em `vercel.json` e build Workbox com manifesto e Service Worker. Google, upload, WebSocket e push reais ficam para homologação em ambiente e conta autorizados.

Os testes unitários exercitam guards por papel e visitante, refresh concorrente, resposta de sessão antiga, logout, 401 e 403, senha e contrato do Google com simuladores. Os roteiros do navegador usam fixtures. O isolamento verificado no frontend não implica cobertura das permissões de objeto do servidor.

## Matriz do TCC

| Funcionalidade | Freelancer | Empresa | Teste | Resultado |
| --- | --- | --- | --- | --- |
| Login e sessão | Entrar e sair | Entrar e sair | Unitário com Axios simulado, guards e revogação de sessão | APROVADO SIMULADO |
| Cadastro | Conta freelancer | Conta empresa | Validação e contratos simulados | APROVADO SIMULADO |
| Oportunidades | Consultar e filtrar | Consultar e gerenciar as próprias | Navegador e testes de contratos | APROVADO SIMULADO para consulta, filtros, paginação, publicação, edição e exclusão. |
| Candidaturas | Enviar e consultar | Analisar e decidir | Testes de contratos e notificações, transporte simulado | APROVADO SIMULADO nos contratos unitários. Jornada completa depende de homologação. |
| Chat | Lista e conversa | Lista e conversa | Store, eventos e navegador com socket simulado | APROVADO SIMULADO |
| Notificações | Histórico e leitura | Histórico e decisões | Testes unitários e acessibilidade no navegador | APROVADO SIMULADO |
| Perfil e portfólio | Editar e gerenciar projetos | Editar e consultar profissional público | Testes unitários, diretório e formulário no navegador | APROVADO SIMULADO nos contratos e diretório. Roteiro legado avaliado separadamente abaixo. |
| Web Push real | Receber no dispositivo | — | Navegador inscrito em ambiente autorizado | BLOQUEADO |
| Favoritos | Persistência e isolamento | — | Navegador com troca de conta simulada | APROVADO SIMULADO |
| Responsividade | Mobile e desktop | Mobile e desktop | Navegador com dados simulados | APROVADO SIMULADO |
| Proteção da lista de vagas sem sessão | Sem sessão | Sem sessão | GET real à API local | APROVADO REAL |
| Jornada autenticada de ponta a ponta | Candidatura, resultado e chat | Publicação, decisão e chat | API e socket de desenvolvimento, com contas autorizadas | BLOQUEADO |

## Homologação e demonstração

Preparar duas contas freelancer e duas empresa de teste e confirmar a disponibilidade antes da apresentação. Ensaiar publicação, candidatura, decisão, notificação e troca de mensagens com recarregamento. Conferir upload, Google e push no domínio autorizado, além de zoom real em 200% e teclado virtual em aparelho. Os logs locais de execução ficam em `node_modules/.cache/f43/`.

## Resultados confirmados no navegador

- `node tests/acessibilidade.browser.mjs --sem-capturas`: 102 verificações, zero erros ou avisos de console.
- `node tests/design-system.browser.mjs --sem-capturas`: três larguras, incluindo ativação por Enter, foco visível e movimento reduzido.
- `node tests/responsividade.browser.mjs --sem-capturas` e `--matriz-atual --sem-capturas`: as duas suítes passaram. A matriz tem 493 combinações, sem exceção de rolagem do chat nesta execução.
- `node tests/f61-capturas.browser.mjs --sem-capturas`: rodadas direcionadas do chat exercitaram troca de sala, rascunho, um socket durante redimensionamento, retorno mobile, lista vazia e reconexão com histórico simulado.
- `node tests/favoritos.browser.mjs`: 13 cenários de funcionamento e 20 verificações de layout. Essa execução já incorporava a espera pelo logout e acionou o lote legado de imagens no cache local. Os retestes usam `--sem-capturas`, e as imagens locais ficam fora do diff.
- `node tests/oportunidades.browser.mjs --sem-capturas`: 12 cenários de listagem e detalhe, incluindo paginação, busca, filtros, favorito compartilhado e dados opcionais.
- `node tests/freelancers-publicos.browser.mjs --sem-capturas`: diretório, paginação, retorno, perfil indisponível, contato e filtragem de dados privados simulados.
- `node tests/localizacao-empresa.browser.mjs --sem-capturas`: sete cenários simulados, zero erros ou avisos de console.
- Testes finais `npm test` e `npm run build`: 275/275 e 94 entradas no precache. `node --test tests/design-system.test.mjs tests/complementos-vagas.test.mjs tests/freelancers-publicos.test.mjs`: 24/24 após executar fora do sandbox por restrição do esbuild.
- `node tests/freelancer-visual.browser.mjs --sem-capturas`: aprovado, incluindo estados vazios, erros, filtros e formulários.
- `node tests/vagas.browser.mjs --sem-capturas`: aprovado com guard de visitante e freelancer, validação por campo, seis larguras, bloqueio de envio duplicado, erro simulado 400 e confirmação 201 com a oportunidade no painel.
- `node tests/gerenciamentoVagas.browser.mjs --sem-capturas`: aprovado com navegação entre formulários, busca, edição e exclusão simuladas, recarregamento, isolamento de vaga de outra empresa, Escape e retorno de foco.

## Limitações e pendências

- `node tests/notificacoes.browser.mjs --pwa --sem-capturas`: os retestes não completaram a inicialização do harness no Chrome. A execução isolada com `--somente-pwa` também expirou no CDP ao consultar o worker. O build e o precache passaram. Ciclo de atualização, push e offline ficam sem aprovação nesta revisão.
- `node tests/perfil-portfolio.browser.mjs --sem-capturas`: a montagem passou a usar Pinia, rotas reais e transporte isolado. O reteste legado expirou em `Runtime.evaluate`. A checagem de prévia do arquivo no roteiro legado fica sem aceite. O roteiro visual complementar passou, e os testes unitários cobrem upload, substituição, URL retornada e persistência simulada.
- O roteiro legado `empresa-visual.browser.mjs` continua ausente. A responsividade empresarial é exercitada pela matriz atual e os testes de UI específicos.
- Sem contas de teste provisionadas nesta execução, a persistência real, a candidatura completa, o envio bilateral de mensagens, o isolamento de objetos no Django e o aceite em domínio publicado continuam bloqueados. Zoom nativo a 200%, login real do Google, câmera e teclado virtual em aparelhos não foram executados.

**Veredito — PARCIAL.** Há cobertura simulada ampla e a integração HTTP básica do ambiente local respondeu como esperado. O aceite para a apresentação ainda depende da jornada autenticada completa e do reteste PWA.

**Título de PR sugerido** — F43 · Corrige regressões e valida a integração do frontend

**Descrição** — Corrige a referência de rolagem no chat após mudança de rota, atualiza contratos e bootstrap dos testes do navegador e documenta os resultados de regressão e os bloqueios de homologação com API, WebSocket e Web Push. Base `DEV`.
