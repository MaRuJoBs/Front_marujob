# FEAT-38 — Favoritos do freelancer

## A. Diagnóstico

A raiz foi conferida com `pwd`, `git rev-parse --show-toplevel` e `git status --short`: `Front_marujob`. Havia uma alteração preexistente em `src/App.vue`; esse arquivo não foi editado nesta entrega.

Foram auditados `package.json`, Vite, `main.js`, router/guards, stores, serviços Axios/autenticação, persistência da sessão, componentes/views da Home, listagem, detalhes e favoritos, ícones e testes existentes. A autenticação restaura o perfil em `usuarios/me/`, mantém `sessao.usuario.id`, `sessao.tipo` e uma revisão reativa de sessão. Pinia já estava instalada na aplicação. Não existe contrato de endpoint de favoritos nos serviços ou na documentação do frontend auditado. O backend não foi acessado.

| Funcionalidade anterior | Classificação | Evidência / problema |
| --- | --- | --- |
| Favoritar na Home | Ausente | Os dois formatos de card não tinham coração. |
| Favoritar/desfavoritar na listagem e nos detalhes | Parcialmente implementada | Compartilhavam `useFavoritosLocais`, mas comparavam IDs sem normalização e usavam a chave global `favoritos`. |
| Fonte de verdade em todas as páginas | Parcialmente implementada | O composable tinha um ref compartilhado; `FavoritosComponent` tinha um array independente. Não havia store de favoritos. |
| IDs favoritos | Parcialmente implementada | Array persistido em `localStorage`, sem associação com o usuário. |
| Persistência após recarregar | Funcionando | Já existia no navegador; a página de favoritos não tratava JSON inválido ou indisponibilidade do storage. |
| Separação por usuário e limpeza no logout | Ausente | Contas diferentes compartilhavam a chave global. |
| Recuperação das oportunidades favoritas | Com defeito | Filtrava somente `data.results` de `GET freelances/`, omitindo páginas posteriores. |
| Página de favoritos | Parcialmente implementada | Removia somente do estado local da página; botão de detalhes e botão de lixeira não tinham ação. Faltavam vazio, carregamento, erro e vaga indisponível. |
| Sincronização entre dispositivos | Dependente do backend | Não há endpoint de favoritos integrado/documentado no frontend. |
| Axios, listagem, filtros, busca, paginação e detalhes | Funcionando | Serviços/rotas existentes reutilizados e cobertos pela regressão. |

Foram preservados o cliente Axios, os endpoints, os interceptors JWT, login tradicional/Google, guards, logout, busca, filtros, paginação e estrutura visual das páginas. Perfil e portfólio não foram modificados.

## B. Arquivos da entrega

| Arquivo | Alteração |
| --- | --- |
| `src/stores/favoritos.js` | Nova store Pinia: IDs normalizados, ações, autenticação, persistência por conta, cache, fila de consultas e estados de erro. |
| `src/composables/useFavoritosLocais.js` | Interface existente mantida como adaptador da store, sem array independente. |
| `src/components/FavoritoButton.vue` | Botão reutilizável, coração preenchido/contornado, área de 44 px, acessibilidade, hover/foco e interrupção de propagação. Usa os estilos FontAwesome já carregados por `main.js`. Corrige localmente a interferência do reset global sobre o peso do glifo. |
| `src/components/HomeComponent.vue` | Botão nos cards principais e compactos, feedback de persistência e ajustes locais para acomodar o coração no mobile. Link e botão são elementos irmãos. |
| `src/components/OportunidadeComponent.vue` | Listagem usa o botão compartilhado, preservando busca, filtros, cards e paginação. |
| `src/components/OportunidadeDetalheComponent.vue` | Detalhes usam o botão/estado compartilhados; consulta e navegação existentes preservadas. |
| `src/components/FavoritosComponent.vue` | Página existente integrada à store, consultas por ID, remoção imediata, links de detalhes, atualização/retry, estados diferenciados e correção da sobreposição entre preço e botão. Títulos limitados visualmente a duas linhas. |
| `src/views/FavoritosView.vue` | Removida constante de URL de produção sem uso. |
| `package.json` | Inclui a suíte de favoritos em `test` e adiciona `test:favoritos:browser`. Nenhuma dependência alterada. |
| `tests/oportunidades-integracao.test.mjs` | Testes existentes adaptados à Pinia e à chave autenticada; isolamento/limpeza entre testes. |
| `tests/oportunidades.browser.mjs` | Roteiro anterior adaptado à Pinia, chave por usuário e CSS dos ícones. |
| `tests/favoritos.test.mjs` | 19 testes de estado/persistência/transportes simulados, usando Node Test e Vite já existentes. |
| `tests/favoritos.browser.mjs` | Chrome headless/CDP com rotas, guards, login/logout, componentes e estilos reais; API simulada somente no teste. |
| `docs/FEAT-38-favoritos.md` | Diagnóstico, decisões, limitações e resultados desta entrega. |

## C. Arquitetura

`useFavoritosStore` é a fonte de verdade. O composable antigo retorna referências da mesma store; o botão reutilizável consulta as ações diretamente. Não há eventos globais manuais, reload para sincronizar nem chamadas remotas para pintar o coração.

IDs são inteiros positivos seguros. Strings numéricas são convertidas ao mesmo ID, valores inválidos são rejeitados e um `Set` evita duplicatas. A ordem de adição é mantida. As ações `adicionarFavorito`, `removerFavorito`, `toggleFavorito` e `ehFavorito` ficam centralizadas. A alteração reativa só é confirmada após a escrita síncrona em localStorage; uma falha preserva o estado anterior e apresenta feedback. Cliques rápidos são serializados naturalmente pela operação local síncrona.

Uma observação síncrona do identificador/tipo/revisão da sessão limpa IDs, cache e consultas pendentes ao sair ou trocar de conta. Respostas antigas são descartadas por identidade da tarefa e da conta, e as consultas são canceladas por `AbortController`. Nenhuma alteração no mecanismo de autenticação foi necessária.

## D. Persistência

- Estratégia: `localStorage`, com a chave `marujobs:favoritos:usuario:<id>`.
- O ID vem exclusivamente de `sessao.usuario.id`, restaurado pelo fluxo existente. JWT/e-mail não são usados como chave.
- Apenas freelancers identificados podem alterar favoritos, de acordo com os guards já existentes; não foi criado um modo anônimo.
- O carregamento é feito na inicialização da store e quando muda a sessão. Navegar entre componentes não relê nem substitui o estado.
- JSON inválido ou formato inesperado gera aviso e permite começar novos favoritos. IDs inválidos/duplicados são descartados durante a leitura.
- Falhas de leitura são diferenciadas de uma lista vazia e impedem sobrescrever dados que não puderam ser lidos. É possível tentar novamente.
- Falhas de gravação não deixam um coração com estado que não foi salvo.
- Logout limpa a memória, preservando os favoritos persistidos da conta anterior.
- Eventos nativos de armazenamento atualizam os consumidores da conta atual em outra aba.

A chave legada `favoritos` não possui proprietário verificável. Ela é mantida intacta, mas não é migrada automaticamente para a primeira conta que entrar, evitando atribuir os favoritos de outra pessoa ao usuário atual. As contas começam no armazenamento isolado; oportunidades antigas precisam ser salvas novamente.

Limitações: persistência restrita a este navegador/origem/perfil. Não sincroniza entre dispositivos, pode ser removida ao limpar dados do navegador e não oferece transações entre gravações simultâneas em abas diferentes.

## E. Paginação e disponibilidade

A página recupera cada ID salvo com `obterOportunidade(id)`, que já utiliza `GET freelances/{id}/` na instância Axios centralizada. O prefixo `/api/` continua vindo da configuração existente. Não percorre páginas nem carrega a listagem inteira.

Há deduplicação de consultas em andamento, limite global de quatro consultas simultâneas e cache de um minuto durante a sessão. A navegação de volta a favoritos dentro desse prazo reutiliza os dados. O botão de atualização ignora o prazo do cache. Remover um favorito invalida seus dados/consulta; expiração e atualização permitem detectar oportunidades que se tornaram indisponíveis.

Os estados de cada ID são `carregando`, `disponivel`, `indisponivel` e `erro`. HTTP 404/410 apresenta indisponibilidade e mantém o botão para remover o ID. Rede/403/500 apresentam erro e retry, preservando o ID. Falhas parciais não impedem os outros cards de aparecerem. Nenhum dado fictício foi adicionado à aplicação; fixtures existem exclusivamente nos testes.

## F. Testes e build

As ferramentas existentes foram reutilizadas: Node Test, Vite SSR, renderer Vue e Chrome/CDP. Nenhuma biblioteca instalada; não há script de lint configurado. O launcher `npm.cmd` foi usado porque o PowerShell bloqueia `npm.ps1` pela política de execução.

| Comando / verificação | Resultado |
| --- | --- |
| `npm.cmd test` | **147 testes aprovados; 0 falhas, 0 cancelados, 0 ignorados.** Inclui 19 testes específicos de favoritos e regressões de autenticação, vagas e oportunidades. |
| `npm.cmd run test:favoritos:browser` | **13/13 cenários funcionais e 20 verificações de layout aprovados** em Chrome headless. |
| `npm.cmd run build` | **Código de saída 0**; 186 módulos transformados; `✓ built in 2.91s`; saída em `dist`; PWA com 66 entradas de precache e `dist/sw.js`/`dist/workbox-8c29f6e4.js` gerados. |
| Prettier nos novos arquivos e arquivos substancialmente alterados | Executado com a instalação existente. Não foi aplicado um format geral ao projeto. |
| `git diff --check` | Sem erros de whitespace. |

O primeiro build na sandbox falhou com acesso negado ao resolver `vite.config.js` pelo esbuild. A repetição fora da sandbox passou. O build emitiu aviso de base Browserslist/caniuse-lite antiga; nenhuma configuração de produção foi alterada para suprimi-lo. `npm ls --depth=0` também identificou divergências preexistentes entre os FontAwesome instalados e as versões declaradas, além dos pacotes regular/brands SVG ausentes. Os ícones da entrega utilizam o CSS/webfonts já existentes, sem exigir instalar esses pacotes; build e testes usam as dependências locais disponíveis.

| Cenário exigido | Evidência executada |
| --- | --- |
| 1. Home | Chrome: clique no card principal atualiza também o card compacto, sem abrir detalhes. |
| 2. Listagem | Chrome: salva uma vaga da página 2 e a exibe em favoritos. |
| 3. Detalhes | Chrome: adiciona/remove diretamente; estado é observado nas outras rotas. |
| 4. Sincronização | Chrome e testes da store: Home/listagem/detalhes/favoritos compartilham o estado sem reload. |
| 5. Remoção | Chrome: remove em favoritos e confirma coração contornado ao voltar à listagem. |
| 6. Persistência | Chrome: recarga real do documento; suíte: recriação de Pinia restaura IDs normalizados/únicos. |
| 7. Troca de conta | Chrome: login/logout A–B–A pelo fluxo existente, com transporte simulado; suíte: limpeza síncrona e preservação das duas chaves. |
| 8. Paginação | Chrome: vaga 27 da página 2; suíte: IDs 27/99 buscados diretamente, sem consulta à primeira página. |
| 9. Vaga excluída | Chrome: 404 removível; suíte: 404/410, inclusive após recriar a aplicação. |
| 10. Erro de rede | Chrome e suíte: ID preservado e recuperação por retry; falhas parciais/403/500 também cobertas. |
| 11. Cliques rápidos | Chrome: 101 cliques; suíte: 1001 alternâncias, sem duplicatas ou chamadas remotas de escrita. |
| 12. Responsividade | Quatro páginas em 320, 375, 768, 1024 e 1440 px, títulos extensos, sem overflow horizontal, botões com 44 px e preço sem sobrepor detalhes. Capturas também inspecionadas visualmente. |
| 13. Regressão | Chrome: busca/filtros/paginação/detalhes e link do vazio; suíte completa: auth/guards e funcionalidades de vagas/oportunidades preservadas. |

Também foram verificados cache/requisições duplicadas, limite de concorrência, expiração/invalidação, respostas tardias e cancelamento, JSON corrompido, storage indisponível, IDs inválidos e identidade da resposta da API. No navegador foi verificado o peso do glifo renderizado (sólido 900/contornado 400), além do estado acessível `aria-pressed`. A revisão visual identificou a interferência do reset global e ela foi corrigida no escopo do botão, sem alterar o CSS global.

As rodadas iniciais expuseram ajustes necessários no roteiro: espera dos interceptors Axios, serialização de arrays Proxy pelo CDP, documento ainda sem body, limpeza das contas de teste entre execuções e seleção específica dos botões (excluindo o link de navegação no Header). Essas falhas foram corrigidas; nenhuma falha restante na rodada final.

Artefatos locais ignorados pelo Git: `node_modules/.cache/feat38-navegador/*.png` (20 capturas) e `node_modules/.cache/feat38-testes.log`.

Não executado: teste contra a API real/contas reais, login Google interativo e ensaio manual em dispositivos físicos. As respostas de API são simuladas somente nos testes, preservando o cliente Axios e os componentes reais. O roteiro visual legado `tests/oportunidades.browser.mjs` foi atualizado, mas não executado separadamente; sua cobertura de regressão relevante foi exercitada pelo novo roteiro no ambiente Windows.

## G. Backend

Não há dependência bloqueante para a persistência local autorizada nesta FEAT. Sincronização remota/entre dispositivos depende de um contrato real de favoritos a ser disponibilizado pelo backend. Nenhum endpoint foi inventado. O backend, outros repositórios e arquivos fora da raiz autorizada não foram acessados/modificados.

## H. Resultado e revisão

**CONCLUÍDA no escopo frontend com persistência local por usuário.** Os cenários solicitados foram implementados e verificados com a suíte automatizada e o navegador, sem problemas bloqueantes conhecidos nesse escopo. A ausência de sincronização remota e o tratamento conservador dos dados legados estão documentados acima.

Revisão final: estado compartilhado, imports, build, diff, caminhos e navegação conferidos. Alteração preexistente em `src/App.vue` preservada. Não foram criados arquivos Python/Django, diretórios de backend ou dependências novas. Não houve troca de branch, commit, push, merge, rebase ou deploy. Os arquivos gerados pelo build permanecem em `dist` ignorado pelo Git.

## I. Revalidação solicitada em 04/11/2026

A implementação descrita acima já estava presente no diretório de trabalho ao iniciar esta revisão. A raiz autorizada foi novamente confirmada com `pwd` e `git rev-parse --show-toplevel`; o `git status --short` inicial registrou todos os arquivos da entrega e `src/App.vue` como alterações preexistentes. Foram revisados novamente store, componentes, adaptador, autenticação, Axios, serviços de oportunidades, router, configuração do Vite, scripts e testes. Nenhuma reescrita funcional foi necessária; nesta revisão foi atualizado somente este relatório, além dos artefatos ignorados produzidos pelas validações.

| Verificação executada novamente | Resultado desta rodada |
| --- | --- |
| `npm.cmd test` | Código de saída **0**: **147 testes aprovados**, 0 falhas, 0 cancelados, 0 ignorados. |
| `npm.cmd run test:favoritos:browser` | Código de saída **0**: **13/13 cenários funcionais e 20 verificações de layout aprovados**, nas quatro páginas e larguras de 320, 375, 768, 1024 e 1440 px. |
| `npm.cmd run build` | Código de saída **0**: Vite **7.3.2**, **186 módulos transformados**, `✓ built in 3.29s`; PWA gerada com **66 entradas** de precache, `dist/sw.js` e `dist/workbox-8c29f6e4.js`. |
| `git diff --check` | Código de saída **0**, sem erros de whitespace. |
| Inspeção das capturas atuais | Conferidas visualmente `favoritos-320.png` e `home-375.png`, geradas nesta execução em `node_modules/.cache/feat38-navegador/`. |

As primeiras tentativas do build e do roteiro de navegador dentro da sandbox falharam por acesso negado no esbuild; o roteiro também excedeu o tempo de resposta do Chrome. Ambos foram repetidos com execução autorizada fora da sandbox e passaram. Permanece apenas o aviso de Browserslist/caniuse-lite desatualizado no build; não foram instaladas dependências ou alteradas configurações para suprimi-lo. Não há script de lint no projeto.

Esta revalidação usa componentes, rotas, sessão e Axios reais do frontend com respostas de API simuladas exclusivamente nos testes. Não comprova conectividade com a API real, login Google interativo ou uso em dispositivos físicos; esses ensaios continuam não executados. Nenhum endpoint de favoritos foi encontrado no contrato integrado/documentado do frontend; a persistência continua local, isolada por ID de usuário e limitada ao navegador.

**Resultado mantido: CONCLUÍDA no escopo frontend com persistência local por usuário**, com os limites de validação e de sincronização remota descritos acima. Não houve acesso ao backend, mudança de branch, commit, push, merge, rebase ou deploy.

## J. Investigação de oportunidades ausentes após login

Na investigação solicitada em seguida, confirmou-se que `.env.development` aponta para `http://127.0.0.1:8000/api/`. Um GET somente de leitura a `freelances/?page=1` retornou `ECONNREFUSED`, tanto dentro quanto fora da sandbox. Não havia frontend respondendo em `127.0.0.1:5173` no momento da verificação. Isso comprova indisponibilidade dos serviços nesses endereços neste ambiente; não identifica, por si só, a causa na sessão do usuário, cujo endereço no navegador e resposta HTTP autenticada ainda precisam ser confirmados. Nenhum servidor de backend foi iniciado ou repositório de backend acessado.

Foi encontrado e corrigido um defeito no frontend: a Home capturava falhas da consulta somente com `console.error`, deixando a área de cards vazia sem explicar o motivo. `HomeComponent.vue` agora reutiliza `listarOportunidades` e o tratamento de erros existente, apresenta carregamento, erro com nova tentativa e lista vazia como estados distintos. Oculta a contagem enquanto a consulta está pendente ou falhou, evita consultas concorrentes no retry e cancela a consulta ao desmontar. Autenticação, endpoints e configurações dos ambientes foram preservados.

`tests/favoritos.browser.mjs` foi ampliado com falhas de rede/403/500, payload inválido, lista realmente vazia e recuperação na Home, verificando que dois cliques rápidos em nova tentativa geram uma única consulta. A primeira rodada do novo roteiro parou por redeclaração de uma variável no contexto CDP; a variável foi isolada em bloco e a repetição passou nas novas verificações e nas verificações anteriores de favoritos/layout. `npm.cmd test` manteve **147 testes aprovados**. `npm.cmd run build` retornou **saída 0**, **186 módulos**, `✓ built in 3.03s`, com PWA gerada e **66 entradas** de precache. `git diff --check` passou.

A correção torna visível e recuperável uma falha antes silenciosa; ela não restabelece uma API indisponível nem altera permissões do servidor. A causa específica na conta real continua pendente da URL acessada e da resposta da consulta autenticada, sem solicitar senha ou token ao usuário.
