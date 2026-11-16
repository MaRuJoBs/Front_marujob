# FEAT-52 — Acessibilidade, feedback e usabilidade

Responsável: João. Revisão posterior: equipe. Auditoria iniciada em 16/11/2026.

## Base e anti-duplicação

- Raiz confirmada: `C:/Users/jpbac/OneDrive/Documentos/TCC/Front_marujob`.
- Comandos iniciais: `git rev-parse --show-toplevel`, `git status --short`, `git branch --show-current`, `git fetch origin --prune`.
- Árvore inicialmente limpa; branch existente `FEAT-52`, igual a `origin/DEV`, commit `eda1b48c3adef11c2b06a3848cb67590d8b63d75`. Uma única worktree listada; nenhuma worktree adicional utilizada.
- Fetch inicialmente negado na escrita de `.git/FETCH_HEAD`; repetido com autorização e concluído com saída 0. DEV não modificada.
- GitHub CLI ausente. Conector GitHub consultado: nenhum PR aberto e nenhum PR F52 em todos os estados. `git log --all --grep='FEAT-52\|F52'` sem resultados; nenhuma branch remota F52. Histórico e implementações inspecionados antes das alterações.

| Dependência | PR                                                         | Evidência GitHub                                            | Evidência Git                                         |
| ----------- | ---------------------------------------------------------- | ----------------------------------------------------------- | ----------------------------------------------------- |
| F50         | [#99](https://github.com/MaRuJoBs/Front_marujob/pull/99)   | `merged: true`, `merged_at: 2026-11-12T23:28:14Z`, base DEV | `4ec7922` alcançável de `origin/DEV`; merge `2b5b02c` |
| F51         | [#100](https://github.com/MaRuJoBs/Front_marujob/pull/100) | `merged: true`, `merged_at: 2026-11-16T18:42:24Z`, base DEV | `a5cf812` alcançável de `origin/DEV`; merge `eda1b48` |

Ambos os `git merge-base --is-ancestor` retornaram 0. F52 inicialmente **PARCIAL**: há soluções reutilizáveis, mas faltam correções abaixo. Nenhum P0 identificado na inspeção inicial.

## Matriz inicial por componente

| Arquivo/componente                                                                    | Estado inicial / evidência                                                                                                                           | Impacto e prioridade                                           | Solução delimitada                                                                                       |
| ------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `ui/BaseInput.vue`, `BaseButton.vue`, `BaseCard.vue`                                  | JÁ IMPLEMENTADO: `useId`, labels, dicas, erros, loading, bloqueio e foco nos controles base                                                          | Preservar                                                      | Reutilizar tokens; sem novo sistema de componentes                                                       |
| `login.vue`                                                                           | PARCIAL: labels sem `for`; `outline: none`; imagens sem alt; erro geral sem associação                                                               | P1: identificação e foco; P2: anúncios                         | Associar campos/dicas/erros, foco e loading; manter serviço e Google                                     |
| `RegisterComponent.vue`, `RegisterEmpComponent.vue`                                   | PARCIAL: foto em `div @click`, input hidden, labels sem associação e botão dentro de link                                                            | P1: foto inacessível ao teclado e campos sem nome programático | Botão nativo de foto, link único de retorno, IDs por instância, instruções e erros associados            |
| `DefinirSenhaComponent.vue`, `TrocarSenhaComponent.vue`                               | PARCIAL: labels soltos, outline removido, retorno sem nome na troca                                                                                  | P1: campos e teclado                                           | Associar labels/erros/instruções; anunciar processamento; nomear retorno                                 |
| `App.vue`, `styles/shell.css`                                                         | PARCIAL: navegação existente via Vue Router; sem salto ao conteúdo ou foco após mudança de página; foco só em alguns componentes                     | P1: repetição da navegação e perda de orientação               | Salto ao conteúdo e foco no título/conteúdo após mudança de path; fallback de foco com tokens existentes |
| `Footer.vue`, `FooterEmpresaComponent.vue`                                            | PARCIAL: links reais e `aria-current` do RouterLink; landmarks footer usados como navegação; texto inativo claro (`#8b7bb5`, `#897ba6`)              | P1: contraste; P2: semântica                                   | Navegação semântica, ícones decorativos e tom roxo existente mais escuro                                 |
| `Filtros.vue`                                                                         | PARCIAL: labels, Tab/Shift+Tab, Escape e retorno já implementados; erro de faixa não associado aos campos                                            | P2: identificação do erro                                      | Preservar interação F50, associar erro de preço                                                          |
| `FiltrosPortifolio.vue`                                                               | NÃO IMPLEMENTADO no comportamento modal: overlay sem dialog, Escape, foco inicial, contenção ou retorno                                              | P1: teclado sai do painel e leitor ignora contexto             | Usar dialog nativo como nas confirmações existentes, preservando painel e filtragem                      |
| `HomeComponent.vue`, `OportunidadeComponent.vue`, `OportunidadeDetalheComponent.vue`  | PARCIAL: links/cards reais, paginação, retry, estados e candidatura já existentes; busca só com aria-label e placeholder; busy ausente em resultados | P1: label visível; P2: estado ocupado                          | Label de busca visível e busy nos resultados; preservar candidatura e animações                          |
| `FavoritoButton.vue`, `FavoritosComponent.vue`, `stores/favoritos.js`                 | JÁ IMPLEMENTADO: botão nativo, nome e pressed, persistência local, erros e oportunidades indisponíveis                                               | Sem defeito de envio assíncrono: favoritos são locais          | Preservar store; busy no carregamento da lista                                                           |
| `PerfilComponent.vue`, `PortfolioComponent.vue`, `PortfolioDetalheComponent.vue`      | PARCIAL: loading/erro/retry/vazio e links reais; raízes div; portfólio salta h1→h4; pesquisa sem label visível                                       | P2: landmarks/hierarquia; P1: label                            | Semântica, label e busy sem mudar CRUD                                                                   |
| `EditarPerfil.vue`                                                                    | PARCIAL: maioria dos labels/erros já associados; cidade sem label visível, localização/habilidades sem describedby; foto usa inputs ocultos por CSS  | P1: seleção de foto/teclado; P2: mensagens                     | Corrigir associações e acesso aos inputs, expansão/foco e anúncios locais                                |
| `PortfolioAdicionarComponent.vue`                                                     | PARCIAL: validações/disabled/sucesso real existentes; erros por campo sem describedby; upload sem nome programático                                  | P1: erro inacessível; P2: loading                              | Associar erros e instruções, nomear upload, busy/status; preservar salvamento                            |
| `ConfirmarExclusaoVaga.vue`, `ConfirmarExclusaoProjeto.vue`, `NotificacoesDialog.vue` | JÁ IMPLEMENTADO: dialog nativo, confirmação contextual, Escape, foco inicial/retorno, erro e bloqueio                                                | P2: retorno após remoção do acionador de projeto               | Preservar confirmações; garantir fallback de foco após exclusão de projeto                               |
| `HomeEmpresaComponent.vue`, `CriarVagaComponent.vue`, `DetalheVagaEmpresaView.vue`    | JÁ IMPLEMENTADO em ações: busca, filtros, criar/editar/excluir reais, labels, validação, retry, sucesso confirmado e prevenção de duplicidade        | P2: busy de carregamento no formulário                         | Preservar F51 e serviços; complementar busy quando ausente                                               |
| `PerfilEmpresaView.vue`, `NotificacoesEmpresaView.vue`                                | PARCIAL: BaseInput, erros, sucesso, decisões com confirmação, retry e estados já presentes; busy geral de carregamento ausente                       | P2: estado ocupado                                             | Complementar busy; preservar propriedade, autorizações e decisões                                        |
| `CameraCapture.vue`                                                                   | PARCIAL: mídia encerrada no fechamento, mensagens reais de falha; sem anúncio de abertura                                                            | P2: loading                                                    | Busy/status e ícones decorativos                                                                         |
| `MensagensView.vue`                                                                   | BLOQUEADO para fluxo funcional: rota existente contém apenas título                                                                                  | Outra FEAT; não é chat funcional                               | Documentar, sem inventar interação                                                                       |
| Diretório de freelancers                                                              | BLOQUEADO por ausência de rota/implementação: `/freelances` lista oportunidades                                                                      | Outra FEAT                                                     | Nenhuma tela ou endpoint novo                                                                            |

## Limites da auditoria

Inspeção de código das rotas efetivas, componentes, composables, stores e serviços existentes. Componentes legados sem rota (`PortfolioEditarComponent.vue`, `VagasComponent.vue`) não representam jornadas disponíveis e não serão reimplementados. Nenhum acesso a Back_Marujob. Sem alteração de autenticação, JWT, URLs, payloads, serviços, permissões, regras de candidatura/favoritos/perfil/notificações ou layout F50/F51.

## Correções entregues

- Labels visíveis e associados em login, cadastros, senhas, buscas de vagas/projetos/cidade e filtros empresariais. `useId` nos formulários de acesso garante IDs distintos entre instâncias. Dicas e erros ligados por `aria-describedby`; `aria-invalid` acompanha a validação local existente, sem transformar falha de rede em erro de preenchimento.
- Seleção de foto dos cadastros por botão nativo, retorno ao login por um único link e alternativas textuais nas imagens. No perfil, os inputs de arquivo já eram focáveis e tinham `:focus-within`: essa solução foi preservada. Foi acrescentado direcionamento de foco ao expandir as opções/câmera e retorno ao cancelar/fechar por Escape.
- Foco visível com tokens existentes e contraste em duas superfícies; margem de rolagem para controles próximos da navegação fixa. Salto ao conteúdo e foco no h1 após mudança de path; quando o conteúdo ainda está carregando, foco na região de conteúdo identificada. Query/filtros não roubam foco. Não há nova estratégia de autenticação ou alteração de rotas.
- Filtros de portfólio em `dialog` nativo, com nome, foco inicial, Escape, retorno ao acionador e fundo inerte. O navegador pode receber Tab em sua própria interface; nenhum controle da página de fundo recebe foco. Filtragem e apresentação do painel preservadas.
- Navegações inferiores em `nav`, com ícones decorativos e `aria-current` mantido pelo RouterLink. Landmarks principais corrigidos nos componentes de perfil/portfólio/acesso; títulos de cards do portfólio passam de h4 a h2, mantendo sua tipografia local.
- Formulários de perfil e projeto usam submit nativo com `novalidate`, mantendo as validações e bloqueios dos composables. A busca de cidade intercepta Enter para pesquisar sem enviar o perfil. Tags/habilidades têm remoção com alvo de 44px de largura; altura de 44px já vinha da F50. Login tem alvo de campo de pelo menos 44px.
- Loading com `aria-busy` nos contêineres pertinentes e status textual nas operações sem anúncio prévio. Mantidos erros, tentativas novamente e sucessos confirmados dos fluxos existentes. Os favoritos continuam locais; não foi inventada uma gravação remota.
- Após exclusão confirmada de projeto, se o acionador foi removido, o foco vai para o resultado da operação. Cancelar continua retornando ao acionador. As confirmações de vaga e decisões de candidatura existentes foram preservadas.

Arquivos de produto alterados: `App.vue`, `styles/shell.css`, `login.vue`, `RegisterComponent.vue`, `RegisterEmpComponent.vue`, `DefinirSenhaComponent.vue`, `TrocarSenhaComponent.vue`, `Footer.vue`, `FooterEmpresaComponent.vue`, `Filtros.vue`, `FiltrosPortifolio.vue`, `CameraCapture.vue`, `HomeComponent.vue`, `HomeEmpresaComponent.vue`, `OportunidadeComponent.vue`, `OportunidadeDetalheComponent.vue`, `FavoritosComponent.vue`, `PerfilComponent.vue`, `EditarPerfil.vue`, `PortfolioComponent.vue`, `PortfolioAdicionarComponent.vue`, `PortfolioDetalheComponent.vue`, `ConfirmarExclusaoProjeto.vue`, `CriarVagaComponent.vue`, `PerfilEmpresaView.vue`, `NotificacoesEmpresaView.vue`. Componentes ficam em `src/components`, views em `src/views`.

Testes: novo `tests/acessibilidade.browser.mjs`; seletores de `tests/perfil-portfolio.browser.mjs` e `tests/notificacoes.browser.mjs` atualizados de `footer` para `nav.app-navigation`, mantendo a exigência de uma navegação e o acionamento real de logout. Nenhuma asserção funcional removida. Parte do diff dos dois formulários decorre da indentação do conteúdo dentro de `<form>`, sem reescrever composables.

## Contraste e alvos

Cálculo sRGB por luminância relativa, razão `(Lclara + 0,05) / (Lescura + 0,05)`. Razões arredondadas apenas para apresentação. As mudanças usam tons roxos e cores de feedback já existentes no projeto.

| Par                                          | Antes                        | Depois | Critério      |
| -------------------------------------------- | ---------------------------- | ------ | ------------- |
| Navegação freelancer / `#e9e4f5`             | 3,02:1                       | 6,94:1 | Texto 4,5:1   |
| Navegação empresa / `#eae1f3`                | 3,04:1                       | 6,81:1 | Texto 4,5:1   |
| Placeholder login / `#d9d9d9`                | 1,99:1                       | 5,28:1 | Texto 4,5:1   |
| Erro login / branco                          | 4,00:1                       | 7,20:1 | Texto 4,5:1   |
| Erro troca de senha / `#e8e1f2`              | 3,39:1                       | 5,65:1 | Texto 4,5:1   |
| Sucesso troca de senha / `#e8e1f2`           | 3,27:1                       | 6,87:1 | Texto 4,5:1   |
| Ajuda definir senha / branco                 | 4,10:1                       | 8,63:1 | Texto 4,5:1   |
| Borda dos campos de acesso / cinza `#d6d6d6` | Sem borda suficiente         | 3,64:1 | Controle 3:1  |
| Foco fallback roxo / branco                  | Faltava em controles legados | 8,23:1 | Indicador 3:1 |
| Foco F50 / branco                            | Preservado                   | 7,27:1 | Indicador 3:1 |

O roteiro F52 também calcula razões a partir de `getComputedStyle` da navegação e do placeholder/borda do login, exigindo 4,5:1 e 3:1. Mede campos de login e todos os itens das duas navegações em pelo menos 44×44 CSS px. A matriz em 320px verifica reflow sem scroll horizontal; não equivale a teste manual de zoom. Não se declara certificação AA integral de todos os estados, imagens ou gradientes do produto.

## Testes, resultados e evidências

Ambiente: Windows, PowerShell, Node 22.14.0, Chrome headless com perfil próprio. Inspecionados `package.json`, scripts e dependências antes de executar testes. `npm.ps1` é bloqueado pela política de execução local; utilizado `npm.cmd`, sem mudar essa política. `NODE_OPTIONS=--preserve-symlinks --preserve-symlinks-main` ou os flags equivalentes do Node preservam a resolução das dependências deste workspace.

| Comando/roteiro                                                                                            | Resultado real                                                                                                                                                                                                |
| ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm.cmd test`                                                                                             | **227/227 aprovados**                                                                                                                                                                                         |
| `node --test tests/perfil-empresa.test.mjs tests/design-system.test.mjs tests/complementos-vagas.test.mjs` | **22/23 aprovados**, falha de caminho Windows no build isolado descrita abaixo                                                                                                                                |
| `npm.cmd run build`                                                                                        | **Aprovado**, geração PWA; aviso preexistente de caniuse-lite desatualizado, sem atualizar dependências                                                                                                       |
| `node tests/acessibilidade.browser.mjs`                                                                    | **102 verificações aprovadas**, zero erros/avisos JS coletados; 19 rotas × quatro larguras, IDs, labels, landmarks, teclado, modal, exclusão, loading/erro/vazio, foco após navegação e contrastes computados |
| `node tests/freelancer-visual.browser.mjs --checks-only`                                                   | **Aprovado**, seleção/valores antigos/payloads/filtros/preços preservados e movimento reduzido F50                                                                                                            |
| `node tests/favoritos.browser.mjs`                                                                         | **13/13 cenários e 20 verificações de layout aprovados**                                                                                                                                                      |
| `node tests/perfil-portfolio.browser.mjs`                                                                  | **24/24 cenários responsivos aprovados**, confirmação/cancelamento de exclusão preservados                                                                                                                    |
| `node tests/notificacoes.browser.mjs`                                                                      | **20/20 cenários aprovados**, incluindo decisões, conflito, sessão e logout                                                                                                                                   |
| `node tests/gerenciamentoVagas.browser.mjs`                                                                | **Falha preexistente reproduzida em origin/DEV**, descrita abaixo                                                                                                                                             |
| Prettier nos arquivos alterados e `git diff --check`                                                       | Verificados antes do commit; sem erros de whitespace                                                                                                                                                          |
| Lint / axe / Lighthouse                                                                                    | Nenhum script lint configurado e ferramentas axe/Lighthouse não instaladas; nenhuma dependência acrescentada                                                                                                  |

Execuções de build/navegador precisaram de autorização fora do sandbox: o esbuild recebeu acesso negado e o controle CDP expirou no ambiente restrito. As execuções autorizadas usaram os mesmos arquivos e testes. A primeira execução F50 coincidiu com formatação/HMR e falhou na lista de habilidades; repetida com os arquivos estáveis, passou sem modificar suas asserções. O roteiro F52 foi corrigido para enviar caracteres/códigos nativos de teclado e para testar as sessões e estados que as fixtures de fato representam; não houve handler de teclado artificial nos botões do produto.

Falhas remanescentes, sem correção fora do escopo:

1. **Build isolado F48 em Windows:** `tests/design-system.test.mjs` usa `buildEntry.pathname` e `URL.pathname` dos imports como caminho de arquivo. O Rollup procura `../../../../../../C:/Users/.../entry.mjs` e retorna `UNRESOLVED_ENTRY`. O teste e os componentes UI não foram alterados; 22 verificações complementares e o build de produção passaram. Não é uma falha de compilação do produto.
2. **Roteiro de gerenciamento de vagas:** espera exatamente seis `.msg-erro` após submit vazio. O contrato atual tem modalidade opcional. A mesma espera expirou com os componentes lidos diretamente de `origin/DEV` por plugin Vite somente de leitura, sem checkout, merge ou alteração de arquivos. Log local de reprodução: `node_modules/.cache/f52-vagas-baseline.log`; roteiro temporário: `node_modules/.cache/f52-vagas-baseline.mjs`. As validações de vagas existentes passaram nos testes Node. O roteiro completo de gerenciamento permanece pendente de atualização em trabalho próprio.

Evidências locais ignoradas pelo Git:

- `node_modules/.cache/f52-unit.log`, `f52-extra.log`, `f52-build.log`, `f52-browser.log`, `f52-f50.log`, `f52-favoritos.log`, `f52-perfil-portfolio.log`, `f52-notificacoes.log`, `f52-gerenciamentoVagas.log`, `f52-vagas-baseline.log`.
- `node_modules/.cache/feat52-browser/results.json`: checkpoints, larguras, estados e contrastes renderizados. `contrastes.json`: cálculo adicional de pares antes/depois (o último par registra o diagnóstico inicial da ajuda de senha, corrigido depois).
- Capturas `portfolio-dialog-teclado.png`, `portfolio-filtros-fechados.png`, `cadastro-320.png` na mesma pasta. Inspecionadas visualmente as capturas reais do modal focado e cadastro a 320px; não é uma sessão manual de navegação. As capturas completas incluem o conteúdo abaixo do viewport, enquanto o dialog ocupa o viewport ativo.
- Artefatos adicionais nos caches dos roteiros existentes F38/F40/F44/F50. Não adicionar node_modules, dist, screenshots, `.env`, credenciais ou os roteiros temporários ao commit.

## Aceite e revisão pendente

Situação final da F52: **PARCIAL** quanto à homologação integral; correções de frontend justificadas implementadas e validadas nos limites acima. Nenhum bloqueador P0/P1 observado nos caminhos exercitados. **PRONTO PARA REVISÃO da equipe**, com as duas falhas de infraestrutura/roteiro explicitadas, sem declarar conformidade AA integral ou homologação com backend.

| Requisito                            | Classificação final e evidência                                                                                                        |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| Labels/instruções/erros associados   | JÁ IMPLEMENTADO nas correções auditadas; IDs/labels e validação de projeto exercitados                                                 |
| Foco visível e teclado               | JÁ IMPLEMENTADO; Tab, Shift+Tab, Enter, Espaço, Escape, salto e retorno verificados no Chromium                                        |
| Modais/menus e ações destrutivas     | JÁ IMPLEMENTADO nos componentes existentes; preservadas confirmações, fallback após exclusão confirmado no transporte local            |
| Semântica/nome acessível/estado      | JÁ IMPLEMENTADO nas lacunas corrigidas; um main por rota auditada, nav e aria-current, IDs sem duplicação                              |
| Contraste e toque                    | PARCIAL para conformidade integral; pares revisados e alvos indicados medidos, demais combinações/dispositivos precisam de homologação |
| Loading/erro/sucesso/vazio           | JÁ IMPLEMENTADO nos fluxos exercitados; sucessos continuam dependentes da confirmação do serviço existente                             |
| Botões/links reais                   | JÁ IMPLEMENTADO nos fluxos funcionais existentes; Mensagens/diretório permanecem dependências documentadas                             |
| Contrato API/F50/F51/DEV preservados | JÁ IMPLEMENTADO: sem diff em serviços, stores, composables, router ou dependências; sem alteração da DEV                               |
| Responsividade e regressão           | PARCIAL para homologação integral: matrizes headless aprovadas; roteiro de vagas preexistente e dispositivo real pendentes             |
| Build/testes                         | JÁ IMPLEMENTADO com resultados/falhas documentados na tabela de testes                                                                 |
| Google/contas reais/leitores de tela | BLOQUEADO para homologação real por ausência de contas/ambiente de teste fornecidos; SDK e API isolados nos testes                     |

- [x] Labels/instruções e erros ligados nas correções.
- [x] Foco visível, teclado e modais auditados no navegador headless.
- [x] Contraste conferido nos pares revisados e alvos de toque indicados medidos.
- [x] Loading acessível e mensagens reais nos fluxos existentes.
- [x] Confirmações destrutivas, botões e links dos fluxos funcionais preservados.
- [x] Responsividade automatizada preservada; build aprovado.
- [x] Testes existentes aprovados ou falhas documentadas/reproduzidas.
- [x] Nenhuma mudança em contrato API, backend ou DEV; identidade F50/F51 preservada.
- [ ] Homologação humana com NVDA/VoiceOver, Google real, contas seguras e celular físico.
- [ ] Atualizar os dois roteiros preexistentes com problemas de plataforma/expectativa.

Roteiro manual reproduzível: iniciar com `npm run dev`; usar somente contas seguras de teste fornecidas pela equipe. Percorrer login/cadastro/Google/logout; navegar com Tab/Shift+Tab, acionar botões com Enter/Espaço; abrir filtros, usar Escape e conferir retorno; tentar salvar formulário inválido, verificar anúncio e associação do erro; com transporte/ambiente controlado, simular rede/503 e repetir sem perder dados; cancelar e confirmar exclusão de projeto de teste; repetir aprovação/recusa em candidatura de teste com autorização; revisar 320px e zoom 200%/400% e leitor de tela. Não executar exclusões/decisões reais em dados de produção para homologar esta FEAT.

Não foi identificada correção que exija modificar backend. Mensagens e diretório dependem de outras FEATs. Integrações reais de Google, API e câmera dependem do ambiente de homologação e permissões do dispositivo.

Destino de revisão: `FEAT-52` → `DEV`. Título: **FEAT-52: acessibilidade, feedback e revisão de usabilidade**. Nenhum merge, deploy, force push ou rebase destrutivo autorizado/executado nesta entrega.
