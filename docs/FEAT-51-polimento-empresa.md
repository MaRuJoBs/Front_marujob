# FEAT-51 — Polimento visual da empresa

> **Situação vigente: correção estrutural da Home e validação na rota real `localhost:5173`, mantendo shell compacto de 420px.** Consulte “Correção da Home na aplicação real — 2026-11-16”. As galerias anteriores e decisões de layout wide são histórico; a comparação vigente está em `artifacts/FEAT-51/correcao-home-figma/comparacao.html`.

**Estado atual: implementação visual realizada sob contrato provisório expressamente autorizado para a FEAT-51; APTA COM RESSALVAS para revisão.** O registro A–J abaixo preserva a auditoria inicial; o bloqueio por Figma foi superado. Resultados atuais estão em “Implementação após autorização”.

Auditoria inicial em 2026-11-11. **Classificação inicial: BLOQUEADA por contrato visual não localizado. Classificação final: NÃO APTA PARA REVISÃO da implementação.** Este documento entrega o diagnóstico; não representa implementação visual ou aceite da equipe.

## A. Repositório

- Raiz Git: `/mnt/c/Users/omtra/OneDrive/Documentos/Front_marujob`.
- Branch: `FEAT-51`, já existente; commit inicial `be21c6ae456d023881d9860981f61b325270472b`.
- Estado inicial limpo; sem merge/rebase pendente ou conflitos reportados por `git status`.
- `DEV`, `origin/DEV` e `FEAT-51` locais coincidem; divergência 0/0. `git ls-remote` confirmou o mesmo SHA da DEV remota. Não foi necessário fetch ou atualizar branches.
- Uma worktree listada, neste diretório. Isso não comprova exclusividade de processos externos; nenhuma worktree adicional ou agente foi utilizado.
- Estado final: somente este documento novo, sem staging; aplicação preservada.

## B. Anti-duplicação

Consultados branches locais/remotos disponíveis, histórico de todos os refs, componentes, tokens, documentação e testes. GitHub consultado com `gh pr list --state all --limit 200`, incluindo título, corpo, branch, estado e `mergedAt`: 40 PRs retornados, nenhum aberto. Busca por FEAT-51/F51, polimento visual empresa, UI empresarial, company dashboard, employer interface, company visual polish, design system integration e responsive company pages não identificou entrega equivalente. A referência a F51 no PR #97 é uma pendência, não implementação.

A consulta inicial falhou por DNS no sandbox; a repetição com permissão funcionou. Não foram consultados trabalhos não publicados, comentários de todos os PRs ou material externo da equipe. Nenhum link Figma foi localizado nos arquivos pesquisados nem nos títulos/corpos dos PRs retornados. A ferramenta de documentos conectados não encontrou sessões.

Branches locais: DEV, FEAT-48 e FEAT-51. Refs remotos locais relevantes: FEAT-35, FEAT-36, FEAT-44, FEAT-48 e DEV. Consulta remota direta pelos nomes DEV/FEAT-45/FEAT-50/FEAT-51 retornou apenas DEV; ausência desses nomes não prova ausência de trabalho sob outro nome. Nenhum commit equivalente F45/F50/F51 foi localizado no histórico pesquisado.

## C. Dependências

Merges abaixo confirmados no GitHub e presentes no histórico da DEV. Integração não equivale a homologação completa dos fluxos.

| FEAT | Estado e escopo real                                                                                      | PR / merged_at UTC                                                             |
| ---- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| 35   | Integrada: criação de vagas; commit `d8791f8`                                                             | [#87](https://github.com/MaRuJoBs/Front_marujob/pull/87), 2026-10-30T19:23:01Z |
| 36   | Integrada: listagem, detalhe, edição e exclusão de vagas                                                  | [#89](https://github.com/MaRuJoBs/Front_marujob/pull/89), 2026-10-30T21:41:49Z |
| 44   | Integrada: notificações, análise de candidaturas e contato autorizado; `8976773`                          | [#91](https://github.com/MaRuJoBs/Front_marujob/pull/91), 2026-11-03T18:13:26Z |
| 45   | Integração não localizada; diretório profissional não identificado nas rotas                              | Sem PR identificado                                                            |
| 46   | Integrada: perfil institucional e configurações da empresa, não perfis públicos de freelancers; `4c3e7e6` | [#94](https://github.com/MaRuJoBs/Front_marujob/pull/94), 2026-11-09T19:40:58Z |
| 47   | Integrada: modalidade, cidade, UF e status estruturados de vagas; `a950133`, `fe98cf9`                    | [#96](https://github.com/MaRuJoBs/Front_marujob/pull/96), 2026-11-10T17:36:30Z |
| 48   | Integrada: tokens opt-in e BaseButton/BaseInput/BaseCard; `7e56184`; contrato provisório                  | [#93](https://github.com/MaRuJoBs/Front_marujob/pull/93), 2026-11-09T17:59:12Z |
| 49   | Integrada: shell, navegação responsiva e correções de proporção; `b4d9021`, `0dbc3aa`                     | [#97](https://github.com/MaRuJoBs/Front_marujob/pull/97), 2026-11-11T11:17:33Z |
| 50   | Implementação/integração não localizada nas evidências consultadas                                        | Sem PR identificado; trabalho externo não descartado                           |

F45 ausente bloqueia apenas o polimento do diretório. Perfis públicos não estão comprovados pela F46 e ficam fora da implementação disponível. Home, vagas, notificações e perfil institucional existem e podem receber polimento após aprovação do contrato visual.

## D. Contrato e diagnóstico inicial

Não há referência Figma acessível identificada. `docs/FEAT-48-design-system.md` registra autorização provisória **exclusiva da FEAT-48**; não autoriza redesenhar F51. Proposta pendente de autorização: preservar a composição existente e padronizar apenas estilos locais com os tokens reais da F48, sem criar novas medidas atribuídas ao Figma.

Auditoria estática dos arquivos reais:

| Tela / arquivos                                                | Estrutura e estados existentes                                                                                                                                        | Pendências para polimento e validação                                                                                                                                                    |
| -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/homeEmpresa`: HomeEmpresaView.vue / HomeEmpresaComponent.vue | Header empresarial; saudação, criação, última vaga, lista, busca/categoria, confirmação, loading, erro/retry e vazio; exclusão em dialog                              | Cores e espaçamentos literais; textos de 11–13px; foco local existente; botão de fechar aviso de senha sem nome acessível específico; verificar textos/preços extensos e ações em 320px  |
| `/criar-vaga` e `/editar-vaga/:id`: CriarVagaComponent.vue     | Mesmo componente e composables distintos; grupos de campos, labels, validação por campo, erro geral com foco, disabled/loading, sucesso, prévia real do preenchimento | Estilos locais extensos sem tokens; barra fixa de ações limitada a 420px; tipografia auxiliar chega a 9–10px; verificar scroll, teclado virtual, contraste e prévia sem alterar bindings |
| `/empresa/vagas/:id`: DetalheVagaEmpresaView.vue               | Resumo, descrição, complementos condicionais, grid de informações, loading, erro/retry e ações                                                                        | Literais de cores/raios; grid de duas colunas inclusive no celular; quebra de texto prevista, mas precisa de validação visual                                                            |
| `/empresa/notificacoes`: NotificacoesEmpresaView.vue           | Filtros por status, paginação, cards, indicador não lida, loading/vazio/erro/sucesso, ações e detalhes profissionais autorizados                                      | Paleta local; foco já existente; padronizar apresentação sem alterar aprovação/recusa/leitura/contato; testar nomes extensos e todos os estados                                          |
| `/empresa/perfil`: PerfilEmpresaView.vue                       | `.mrj-ui`, BaseCard, BaseButton e BaseInput; dados, edição, upload, cancelamento e estados                                                                            | Já reutiliza F48; evitar substituições desnecessárias. Campos e layout devem ser comparados à referência antes de mudar                                                                  |
| `/empresa/configuracoes`: ConfiguracoesEmpresaView.vue         | `.mrj-ui`, BaseCard/BaseButton; link de retorno e ação de senha                                                                                                       | Já utiliza tokens; revisão visual de espaçamento e teclado pendente                                                                                                                      |
| ConfirmarExclusaoVaga.vue / NotificacoesDialog.vue             | Dialog nativo, foco inicial/restauração, Escape condicionado, scroll, limite de altura, ações disabled e erros                                                        | Estilos literais; validar contraste, viewport baixa e foco. Preservar confirmações e processamento                                                                                       |

Não foi criada nova listagem, perfil, notificação ou serviço. `/freelances` não deve ser confundida com diretório de profissionais. Componentes freelancer permanecem fora do escopo.

F49 importa tokens em App.vue, mas não ativa `.mrj-ui` em toda a aplicação: perfil/configurações ativam localmente; navegação tem aplicação própria. Tokens reais incluem `--mrj-color-primary`, `--mrj-color-surface`, `--mrj-color-text`, `--mrj-color-border`, `--mrj-color-focus`, `--mrj-space-4`, `--mrj-radius-md` e `--mrj-shadow-card`. Nenhum token novo foi criado/reutilizado pela F51 nesta etapa.

F49 mantém `.app-content` em até 26.25rem (420px); ampliação pelo mecanismo atual exige `meta.layout: 'wide'` no router. Como o usuário proibiu router/App/CSS global/header/footer, a proposta disponível mantém esse limite e melhora disposição local dentro dele. Layout amplo depende de decisão separada; não será contornado por CSS que escape do container.

## E. Implementação

Somente este documento foi criado. Nenhum template, componente ou estilo de aplicação alterado. Nenhuma regra de negócio, validação, evento, payload, autenticação, permissão, dado ou navegação modificada. Não há melhoria visual entregue nesta etapa bloqueada.

## F. Validação

- `npm test`: saída 0; **7 entradas de arquivo aprovadas, 0 falhas**, conforme o runner desta execução. Não atribuir a esta execução o total histórico de 227 testes.
- `npm run build`: saída 0, 220 módulos transformados, PWA gerada com 81 entradas. Aviso não bloqueante: caniuse-lite desatualizado. Dependências não atualizadas.
- Node v24.22.1 / npm 11.19.1. Nenhuma dependência instalada.
- Sem script de lint. `format` modifica todo `src/`, portanto não foi executado para evitar edições fora de escopo.
- `git diff --check`: aprovado; documento novo também revisado diretamente, pois arquivos não rastreados não aparecem no diff comum.
- Nenhum teste visual executado ou screenshot produzido nesta auditoria. Nenhuma comparação Figma, validação responsiva ou certificação WCAG declarada. `command -v` não localizou chromium/chromium-browser/google-chrome; o harness existente aponta por padrão para executável Windows. Não foi tentado iniciá-lo nesta etapa bloqueada.
- Testes browser existentes de vagas, gerenciamento, notificações e responsividade foram identificados, não executados. Testes autenticados reais não realizados; nenhum dado de produção alterado.

Roteiro após desbloqueio: para cada tela e dialog, usar ambiente isolado e fixtures existentes; comparar referência aprovada e renderização em 320/375/390/430/768/1024/1280px; conferir estados preenchido/vazio/erro/loading/sucesso, textos longos, scroll horizontal, ações finais visíveis e viewport baixa; capturar screenshots. Conferir Tab/Shift+Tab, Enter/Escape, restauração de foco, labels e mensagens; medir contraste de texto comum ≥4,5:1, texto grande ≥3:1 e controles essenciais ≥3:1 quando aplicável. Exercitar criação/edição/cancelamento e filtros/paginação/decisões apenas com transporte isolado. Documentar separadamente qualquer correção funcional necessária.

## G. Contratos de API

Nenhum contrato ou serviço foi alterado. O histórico da F47 documenta ambiguidade entre modalidade legada e remoção intencional; permanece fora do escopo visual. Nenhuma nova incompatibilidade foi comprovada por integração real nesta auditoria.

## H. Riscos

- Críticos/altos introduzidos: nenhum identificado, pois não houve alteração de aplicação.
- Confirmado, alto para aceite: ausência de contrato visual aprovado impede comprovar fidelidade e executar o polimento autorizado.
- Confirmados, médios: F45 não identificada; F46 não corresponde aos perfis públicos planejados; conteúdo limitado pelo shell; validação visual/acessibilidade pendente.
- Potenciais, médios: divergência futura do Figma, overflow em dados extremos e sobreposição com trabalho F50 não publicado. Não tratar como falhas reproduzidas.
- Baixo confirmado: aviso de Browserslist no build.

## I. Git e isolamento final

Revisados status, diff comum, estatística e arquivo novo. Somente `docs/FEAT-51-polimento-empresa.md` deve aparecer como não rastreado; diff comum/stat vazio é esperado. Nenhuma alteração preexistente havia para descartar. Artefatos de build ignorados não incluídos. Nenhum backend acessado ou modificado; sem serviços, rotas, CSS global, App, header/footer ou componentes freelancer alterados. Sem segredos/dados fictícios adicionados. Sem staging, commit, push, merge, rebase, PR ou deploy.

## J. Classificação final e desbloqueio

**NÃO APTA PARA REVISÃO da implementação.** Auditoria documental disponível; FEAT-51 visual **BLOQUEADA** até receber link/frames Figma aprovados e acessíveis ou autorização explícita de contrato alternativo para esta FEAT. Testes/build aprovados da base não substituem validação visual.

Proposta concreta alternativa: usar identidade atual e tokens F48 apenas nas páginas empresariais auditadas, preservar o limite de 420px imposto pela F49 e todos os fluxos, ajustar CSS local e o mínimo de template para acessibilidade; manter diretório e perfis públicos fora enquanto não comprovados. Não alterar arquivos globais ou router. Após autorização, implementar, validar e atualizar este relatório com resultados reais. Aprovação da equipe, integração futura à DEV e aceite final continuam pendentes.

## Implementação após autorização — FEAT-51

O usuário autorizou expressamente a identidade atual e os tokens F48 como contrato provisório **específico da FEAT-51**, preservando o limite global de 420px. Isso desbloqueou o polimento sem presumir aprovação Figma. A auditoria anterior foi preservada como registro histórico; suas afirmações de ausência de implementação e de testes visuais descrevem somente aquela etapa.

### Reconfirmação e limites

Mesma raiz, branch FEAT-51 e HEAD `be21c6a`. Estado inicial desta continuação: somente o documento de auditoria não rastreado, preservado e atualizado. DEV/FEAT-51 locais continuam em divergência 0/0; integrações verificadas na auditoria anterior e presentes na base, sem nova consulta remota nesta continuação. Nenhuma troca de branch ou worktree. F45 e F50 continuam sem implementação identificada; diretório e perfis públicos não foram criados nem revisados. F46 é perfil institucional empresarial.

### Arquivos e antes/depois

| Arquivo                                    | Antes                                                                                                   | Implementação final                                                                                                                                                                                                                           |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/components/HomeEmpresaComponent.vue`  | Fundo com imagem mais intensa, cores locais, textos auxiliares de 11–13px, estados simples              | Imagem suavizada com blend local, tokens, saudação destacada, cards com sombra consistente, auxiliares de 14px, estado de loading/erro em painel, preços com quebra, busca legível; fechar aviso com nome acessível e alvo ampliado           |
| `src/components/CriarVagaComponent.vue`    | Textos auxiliares de 9–13px, campos com borda transparente, pares de campos apertados a partir de 400px | Tokens e bordas contrastantes, auxiliares de 14px, grupos legíveis, uma coluna dentro do shell, feedback/disabled/foco consistentes; barra fixa mantém largura e reserva existente. Afeta criação e edição pelo componente real compartilhado |
| `src/views/DetalheVagaEmpresaView.vue`     | Título disputava largura com preço; cores e blocos locais                                               | Resumo em grid com preço na segunda linha, título com mais espaço, cards/separadores consistentes, informações em uma coluna abaixo de 360px, exclusão em cor semântica                                                                       |
| `src/views/NotificacoesEmpresaView.vue`    | Paleta própria, textos pequenos e regras primárias superadas pelo seletor genérico de botão             | Cards/sombras/tipografia F48, cabeçalho com wrap, filtros selecionados e Aprovar com precedência correta, estados semânticos preservados, hover/foco/disabled consistentes                                                                    |
| `src/views/PerfilEmpresaView.vue`          | Já usava BaseCard/BaseButton/BaseInput e tokens                                                         | Reutilização preservada; título separado do conteúdo, informações com divisores, feedback em superfície, ações adaptáveis, upload apresentado com controle consistente e link externo com alvo mínimo de 44px                                 |
| `src/views/ConfiguracoesEmpresaView.vue`   | Já usava BaseCard/BaseButton; título e link com pouco espaçamento                                       | Hierarquia e espaçamento local, link de retorno com alvo de 44px e sublinhado legível                                                                                                                                                         |
| `src/components/ConfirmarExclusaoVaga.vue` | Paleta local e botões de largura intrínseca                                                             | `.mrj-ui` próprio, tokens, título com peso consistente, ações flexíveis com quebra, erro semântico, dimensões/scroll nativos preservados                                                                                                      |
| `src/components/NotificacoesDialog.vue`    | Paleta e tipografia próprias                                                                            | `.mrj-ui` próprio, superfície/bordas/raios/foco F48, botões adaptáveis, mensagens legíveis; fluxo profissional/contato intacto                                                                                                                |
| `tests/empresa-visual.browser.mjs`         | Não existia matriz empresarial específica                                                               | Harness Vue/Vite/Chrome-CDP baseado na infraestrutura existente, com fixtures isoladas, sete páginas, estados, foco e modais; captura antes por `git show`, sem trocar arquivos da worktree                                                   |
| `docs/FEAT-51-polimento-empresa.md`        | Auditoria bloqueada                                                                                     | Histórico preservado e resultados reais da implementação registrados nesta seção                                                                                                                                                              |

Templates alterados somente para ativar `.mrj-ui`, apresentar estados da home e nomear o fechamento de aviso. O Prettier também redistribuiu uma linha textual do template. Comparação automatizada dos blocos `<script setup>` dos oito componentes com HEAD confirmou conteúdo idêntico. Nenhum binding, evento, condição ou dado de negócio alterado. Nenhum endpoint, serviço, payload, validação, sessão, permissão ou rota modificado.

### Design System e FEAT-49/50

Tokens já importados por App.vue foram ativados localmente nos roots empresariais e nos dois dialogs. O escopo `.mrj-ui` fornece as variáveis por herança; dialogs recebem escopo próprio e mantêm tokens mesmo no top layer nativo. Nenhum import global foi adicionado. Perfil e configurações continuam usando os BaseCard/BaseButton/BaseInput existentes; não houve troca indiscriminada de controles com lógica de domínio.

Tokens reutilizados: `--mrj-color-primary`, `primary-hover`, `on-primary`, `secondary`, `secondary-hover`, `background`, `surface`, `text`, `text-secondary`, `border`, `border-subtle`, `focus`, `danger`, `success`; `--mrj-font-family`, `font-size-sm`, `font-weight-semibold`, `line-height`; `--mrj-space-2/3/4/6`; `--mrj-radius-md/lg`; `--mrj-shadow-card`; `--mrj-focus-width/offset`; `--mrj-control-height-md`; `--mrj-disabled-opacity`. Nomes com sufixo abreviado nesta lista mantêm o prefixo da família correspondente no CSS real. Nenhuma variável nova inventada.

App, router, tokens, shell, header e footer permanecem idênticos ao HEAD. A matriz de navegador verificou conteúdo até 420px inclusive em 768/1024/1280px. A experiência desktop continua centralizada e estreita por decisão explícita; ampliação exige proposta futura separada. Nenhum componente exclusivo freelancer ou componente base compartilhado foi modificado; impacto de F50 evitado pelo escopo local.

### Testes e build

| Verificação                                                  | Resultado                                                                                                                                            |
| ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm test` após implementação                                | Aprovado: 7 entradas de arquivo, 0 falhas, como reportado pelo runner neste ambiente                                                                 |
| `node tests/vagas.test.mjs`                                  | 74/74 casos aprovados; inclui criação, edição, propriedade, payloads, exclusão, erros e transições SPA; já incluído em npm test, não somar novamente |
| `node tests/perfil-empresa.test.mjs`                         | 5/5 aprovados: consulta, edição/cancelamento, upload, validação e autorização                                                                        |
| `node tests/complementos-vagas.test.mjs`                     | 9/9 aprovados fora do sandbox. A primeira execução parou por `spawnSync git EPERM`; repetição autorizada confirmou aprovação                         |
| `node tests/notificacoes.browser.mjs` com CHROME_BIN Linux   | 20/20 cenários aprovados: lista/vazio/erro/conflito/sessão em 320/375/768/1280px; API simulada                                                       |
| `node tests/empresa-visual.browser.mjs`                      | 112 verificações aprovadas: 91 combinações de página/estado/largura e 21 verificações adicionais de perfil em edição e dialogs                       |
| Captura anterior `F51_BASE=HEAD F51_WIDTHS=375,1280`         | 14 verificações/capturas aprovadas usando componentes da base por leitura; sem checkout ou alteração de arquivos                                     |
| Repetição específica de detalhes após ajuste final do resumo | Aprovado: 14 verificações de página e modal nas sete larguras, após o ajuste final                                                                   |
| `npm run build`                                              | Aprovado, 220 módulos e PWA com 81 entradas; aviso de Browserslist/caniuse-lite antigo permanece                                                     |
| Prettier                                                     | Oito componentes e novo harness formatados e conferidos; sem script de lint no projeto                                                               |
| `git diff --check`                                           | Aprovado; novos arquivos também inspecionados diretamente                                                                                            |

Falhas preexistentes mantidas visíveis: `tests/vagas.browser.mjs` e `tests/gerenciamentoVagas.browser.mjs` interrompem ao aguardar `.msg-erro.length === 6`. Modalidade é opcional na F47, e os testes ainda exigem a contagem antiga. O gerenciamento foi reproduzido com os componentes originais do HEAD carregados por plugin temporário de leitura; falhou no mesmo ponto após passar por bloqueio de visitante/freelancer e transição criação → edição A → edição B → criação. A cópia temporária está somente em `node_modules/.cache/feat51-gerenciamento-baseline.mjs`, ignorada pelo Git. Nenhuma expectativa dos testes existentes foi alterada. A regressão completa desses dois roteiros não é declarada aprovada; atualização contratual dos testes deve ser separada. Os 74 casos de vagas e os 9 de complementos aprovam o contrato atual e preservação dos fluxos.

### Validação visual e acessibilidade

Chromium Linux já instalado foi utilizado após a tentativa com Chrome Windows não disponibilizar CDP. O sandbox bloqueou abertura de servidor local por EPERM; execução fora dele foi autorizada. Não houve instalação de pacote ou uso de conta real.

Matriz real em **320, 375, 390, 430, 768, 1024 e 1280px**, altura 900px, desktop headless: home, criação, edição, detalhes, notificações, perfil e configurações. Home e notificações exercitadas também em vazio, erro e loading. Perfil em edição, dialog de exclusão e confirmação de candidatura verificados em cada largura. Checagens: ausência de overflow horizontal, controles dentro da viewport, alvos essenciais mínimos, tokens ativos, foco visível por Tab, abertura/foco/Escape dos dialogs e conteúdo sem ampliação do shell. A checagem automatizada revelou alvo pequeno no website e um alinhamento incorreto de configurações durante a implementação; ambos corrigidos e a matriz repetida com aprovação.

Capturas inspecionadas de formulário, perfil em edição, configurações, home, notificações e dialogs em mobile e desktop. Na revisão de detalhes, o título longo foi separado do preço em um grid local, seguido de repetição específica. Não houve comparação com Figma. Screenshots de página inteira podem mostrar o footer fixo na posição da viewport original no meio da imagem; isso não significa que ele esteja inserido no fluxo do documento. Conteúdo inferior continua acessível por scroll com as reservas existentes.

Contraste calculado pela luminância relativa sRGB para os principais pares opacos:

| Par                                               | Razão  |
| ------------------------------------------------- | ------ |
| Texto secundário `#5c3a8b` / superfície `#f6f1fa` | 7,76:1 |
| Texto `#533581` / fundo `#eee7f4`                 | 7,92:1 |
| Branco / primária `#6e4ab7`                       | 6,31:1 |
| Borda `#796197` / superfície `#f6f1fa`            | 4,76:1 |
| Erro `#b30000` / superfície                       | 6,47:1 |
| Sucesso `#195539` / fundo existente `#e9f8ee`     | 7,97:1 |

Isso verifica os pares principais; não representa certificação WCAG completa de todas as combinações, imagens de fundo, hover, disabled, leitor de tela ou navegação assistiva. Foco e labels existentes foram preservados; o botão de fechar aviso ganhou nome acessível. Aparelhos físicos, teclado virtual, safe area real e viewport baixa não foram homologados nesta etapa.

Artefatos ignorados: `node_modules/.cache/feat51-browser/antes/`, `depois/`, `results.json` e `results-selecao.json`; notificações em `node_modules/.cache/feat44-browser/`. Reprodução:

```bash
CHROME_BIN=/caminho/para/chrome node tests/empresa-visual.browser.mjs
F51_BASE=HEAD F51_WIDTHS=375,1280 CHROME_BIN=/caminho/para/chrome node tests/empresa-visual.browser.mjs
F51_PATHS=/empresa/vagas/2 CHROME_BIN=/caminho/para/chrome node tests/empresa-visual.browser.mjs
```

O harness mantém o transporte em memória para todos os estados e não escreve em API real. Fixtures foram adicionadas apenas ao teste, nunca à aplicação de produção.

### Riscos, pendências e classificação atual

- Críticos/altos introduzidos: nenhum identificado pelas verificações realizadas.
- Médios confirmados: dois roteiros browser antigos incompatíveis com a validação F47; revisão definitiva Figma/equipe e homologação autenticada com backend real pendentes.
- Médios potenciais: comportamento em dispositivos físicos/teclado virtual e combinações visuais não cobertas; não foram reproduzidos como regressões.
- Baixos confirmados: aviso caniuse-lite; largura desktop de 420px mantida por requisito, sem proposta de ampliação aplicada.
- Dependências pendentes: diretório F45 e perfis públicos não comprovados; F50 não localizada, sem edições em área freelancer.

**APTA COM RESSALVAS para revisão da implementação visual**, sob o contrato provisório autorizado. Não é aceite Figma, integração DEV ou conclusão definitiva. O usuário deve revisar esta entrega antes de qualquer commit. Nenhum commit/push/merge/rebase/PR/deploy executado.

Estado final esperado e conferido: oito componentes modificados, documento de auditoria preservado/atualizado e um novo teste visual (dez arquivos); nenhum staging. Scripts Vue, serviços, contratos de API e todos os arquivos proibidos preservados. Artefatos de build e capturas não versionados.

### Encerramento após retomada da revisão

Retomada realizada na mesma FEAT-51, HEAD `be21c6a`, com as oito alterações de componentes e os dois arquivos novos preservados. Nenhuma reimplementação ou nova alteração de aplicação foi necessária. Foram consultados os resultados existentes: `depois/results.json` contém 112 verificações nas sete larguras; `depois/results-selecao.json` contém 14 verificações finais de detalhes e modal nas mesmas larguras. Esses testes de navegador foram executados antes da interrupção e não foram repetidos nesta retomada, pois não houve mudança de aplicação desde então.

Concluída a inspeção das capturas antes/depois da home em 375px e das capturas finais de detalhes em 375px e configurações em 320px, complementando as inspeções já registradas. Confirmadas a suavização do fundo, legibilidade dos cards, separação de título/preço e organização das configurações. Não foram identificados novos ajustes visuais necessários nesta revisão.

Reexecutados nesta retomada: `npm test` (7 entradas aprovadas, zero falhas), `npm run build` (saída 0, 220 módulos, PWA com 81 entradas), Prettier nos dez arquivos (aprovado) e `git diff --check` (aprovado). O aviso de caniuse-lite permanece. Comparação dos oito scripts Vue e dos atributos de eventos, bindings e diretivas com HEAD confirmou preservação integral. Não foram repetidos os testes específicos já aprovados nem os dois roteiros browser com falha preexistente documentada.

Estado final: oito componentes modificados e dois arquivos novos, sem staging; relatório finalizado. Sem alterações em App, router, services, CSS global, headers, footers, backend ou componentes exclusivos de freelancers. Sem commit, push, merge, rebase, PR ou deploy. Mantida a classificação **APTA COM RESSALVAS**, aguardando revisão do usuário/equipe.

## Correções após revisão dos screenshots — 2026-11-11

Esta seção substitui o encerramento anterior quanto à necessidade de ajustes. Antes de editar, confirmados raiz `/mnt/c/Users/omtra/OneDrive/Documentos/Front_marujob`, branch `FEAT-51` e as oito alterações Vue preexistentes, além de `artifacts/`, deste documento e do harness não rastreados. Tudo preservado, sem staging.

### Problemas confirmados e ajustes locais

- Home: o flex permitia que preço e título dividissem a mesma linha, comprimindo títulos em determinados cards. Cabeçalho agora tem título e preço em linhas próprias, sem truncar dados. Em 320px, o ícone deixa de consumir a coluna lateral. Ações ficam em grade: Editar/Excluir na primeira linha e Ver detalhes ocupando a segunda. A ordem de teclado e DOM foi preservada.
- Detalhes de vaga: já separava título e preço; mantido. Reservas inferiores locais existentes da home (104px), notificações (104px) e perfil (100px) foram mantidas e verificadas por rolagem, sem aumentar espaçamento sem necessidade.
- Upload: textos nativos dependiam do idioma do navegador. Apresentação local agora tem “Selecionar imagem”, estado em português e nome completo do arquivo selecionado. Input real continua focável, dentro do fieldset disabled, com label, indicador de foco no wrapper, change original, accept e validações. Nenhum serviço/composable/contrato modificado.

### Limitação da FEAT-49 e FIX proposta

Confirmada em `src/styles/shell.css`: `.app` define `--mrj-content-width: 26.25rem` e `.app-content` usa esse máximo. Em desktop, `.app--wide` amplia para o shell de 75rem, mas `src/App.vue` só ativa a classe com `$route.meta.layout === 'wide'`; rotas empresariais em `src/router/routes.js` não fazem esse opt-in. Histórico: commits FEAT-49 `b4d9021` e `0dbc3aa`, merge `be21c6a`.

Proposta separada **FIX — largura desktop do shell empresarial**: revisar metadados das rotas em `src/router/routes.js`, habilitar o modo wide apenas nas páginas preparadas e validar `.app-content` e navegação inferior em `src/styles/shell.css` / `src/App.vue`. Avaliar os limites locais de cada página e barra fixa do formulário junto à ampliação. Esses três arquivos foram somente lidos; nenhuma ampliação global ou escape do container foi aplicada na FEAT-51. A aparência estreita em 1440px permanece uma limitação confirmada da FEAT-49.

### Método de comparação e reprodução

Comparação com capturas preservadas em `screenshots/mobile`, `tablet`, `desktop` e `antes-depois`. Novas capturas de viewport real em `artifacts/FEAT-51/screenshots/revisao/depois/`, sem sobrescrever as anteriores. Sufixo `-scroll` mostra a posição real após rolagem e antes do clique; `-dialog` registra modal aberto. Capturas antigas de página completa podem mostrar o footer fixo no meio da imagem por composição da captura; isso, isoladamente, não demonstra inacessibilidade. O teste atual verifica `elementFromPoint` antes de cliques CDP para detectar sobreposição real.

Matriz: 320×900, 375×812, 390×844, 768×1024 e 1440×900, Chromium Linux headless, shell e rotas reais, transporte isolado em memória. Não é integração autenticada com backend nem homologação em aparelho físico. Nenhum dado de teste foi incluído na aplicação.

```bash
CHROME_BIN=/home/omtramos/.cache/ms-playwright/chromium-1254/chrome-linux64/chrome F51_OUTPUT=artifacts/FEAT-51/screenshots/revisao node tests/empresa-visual.browser.mjs
```

O servidor local falhou inicialmente com EPERM no sandbox; repetição fora dele solicitada pela ferramenta. Nenhuma dependência instalada.

A primeira execução passou pelas quatro primeiras resoluções e pelos estados preenchido/vazio/erro de notificações em 1440px, mas parou no limite de espera de inicialização (5s) ao abrir o estado loading seguinte. Não houve assertion de layout nesse ponto; execução parcial não contabilizada como matriz aprovada. Aumentada tolerância do harness para 20s e repetida a matriz completa, incluindo cliques de Editar/Ver detalhes/Excluir na última vaga, retorno pela navegação inferior, preenchimento de título/Voltar e abertura de confirmação tanto para Aprovar quanto para Recusar. As decisões não são submetidas e as exclusões são canceladas.

A rodada ampliada seguinte identificou uma espera insuficiente no próprio harness: após clique em Editar, a assertion leu `/homeEmpresa` antes de concluir o carregamento da rota lazy. Substituídas esperas fixas por polling explícito da rota (até 10s). Na repetição, a sequência da última vaga em 320px passou: abrir/cancelar exclusão → Ver detalhes → Início no footer → Editar. Comparação visual inspecionada do card de 320px confirma títulos inteiros, preços em linha independente e ações distribuídas, com última ação acima do footer após scroll.

Verificações de comandos desta revisão: `npm test` saiu com código 0 (7 entradas de arquivo, 7 aprovadas, zero falhas); `npm run build` saiu com código 0 (220 módulos, PWA 81 entradas). Mantido o aviso de caniuse-lite desatualizado. Prettier aprovado nos oito Vue e no harness; documento formatado localmente. `git diff --check` aprovado. Nenhuma edição de aplicação após esses testes. Arquivos globais, router, serviços e composables sem diff; staging vazio. Sem commit, push, merge, deploy ou adição de artifacts ao Git.

### Resultado final desta revisão

Matriz completa repetida com saída 0: **80 verificações aprovadas** nas cinco resoluções exigidas; nenhum erro JavaScript coletado, overflow horizontal ou controle fora da largura visível. Inclui estados preenchido/vazio/erro/loading de home e notificações, edição de perfil, validação de arquivo inválido e seleção de imagem com nome exibido, foco por Tab, dialogs/foco/Escape, rolagem e clique real sem sobreposição nas ações finais. Campos de título e retorno dos formulários, Editar/Ver detalhes/Excluir da última vaga, navegação Início e confirmações Aprovar/Recusar exercitados em cada resolução. Resultados em `artifacts/FEAT-51/screenshots/revisao/depois/results.json`.

**Notificações 375×812: acessíveis por scroll real**, com Aprovar e Recusar acima da navegação após rolagem; nenhuma alteração local necessária. Ausência na captura inicial não é defeito de acesso. Reservas inferiores existentes foram suficientes. Comparados visualmente cards de 320/375px, notificações iniciais versus roladas de 375px, perfil em edição, dialog em 768px e coluna desktop de 1440px com os screenshots anteriores. Capturas de viewport evitam interpretar a composição de página completa como sobreposição permanente.

Entrega local concluída para os problemas corrigíveis no escopo FEAT-51. **Permanece a largura desktop da FEAT-49**, com FIX separada proposta acima, sem autorização presumida para modificar shell/router. Testes de navegador usam transporte isolado; upload persistido no backend e aparelhos físicos não foram homologados. Sem commit ou alteração em serviços/regras de negócio.

## Finalização e homologação — 2026-11-12

### Git, preservação e escopo

Executados antes de editar: `git rev-parse --show-toplevel`, `git branch --show-current`, `git status --short --untracked-files=all` e `git log -3 --oneline`. Raiz atual `/mnt/c/users/omtra/onedrive/documentos/front_marujob` (mesmo diretório Windows, grafia normalizada), branch `FEAT-51`, HEAD `be21c6ae456d023881d9860981f61b325270472b`. `DEV` e `origin/DEV` locais apontam para esse mesmo SHA; sem consulta remota nesta etapa. Sem MERGE_HEAD, rebase-merge ou rebase-apply. Nenhuma troca de branch ou alteração da DEV.

Estado inicial: oito Vue modificados, documento e harness novos, pasta artifacts não rastreada com screenshots e perfis Chromium antigos. Arquivos preexistentes preservados. Não havia outro processo Node/Chrome ativo na sessão inspecionada, e havia apenas o processo Codex desta sessão. Isso não prova exclusividade de outros ambientes; hashes dos oito componentes conferidos novamente e idênticos aos do início. Nenhum agente adicional foi usado.

**Nesta retomada não foi necessário alterar a aplicação:** revisão e testes confirmaram as correções locais já implementadas. Alterados somente o teste próprio da FEAT-51 e este relatório. O harness agora cobre sete resoluções, coleta warnings/errors do console, usa perfis temporários fora de artifacts, seleciona 39 screenshots finais e contém um modo de fluxos com mutações exclusivamente em memória. O transporte visual compartilhado continua sem permitir escritas; o modo funcional utiliza um adapter separado dentro do próprio teste. Não foram alterados serviços, payloads da aplicação, autenticação, permissões, endpoints, backend, router, App ou CSS global.

### Situação final das telas

| Tela / arquivo                                         | Revisão e evidência desta execução                                                                                                                                                                                                                                        | Situação                                                                                                      |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Home / `HomeEmpresaComponent.vue`                      | Título e preço em linhas separadas, título completo, grade Editar/Excluir + Ver detalhes, ícone acima do conteúdo em 320px; busca, seis vagas de teste, última oportunidade, estados vazio/erro/loading, scroll até última ação e navegação real                          | Correções anteriores preservadas; sem novo defeito local confirmado                                           |
| Criação / `CriarVagaComponent.vue`                     | Labels, campos opcionais, erro dos cinco obrigatórios, foco no primeiro erro, valor negativo, preenchimento, POST 201 estruturado, erro 400, loading, disabled e bloqueio de duplicidade                                                                                  | Aprovada no transporte isolado                                                                                |
| Edição / mesmo componente                              | Valores existentes carregados, título/preço preservados, cancelamento sem PATCH, erro 400 sem perda de campos, bloqueio duplicado, PATCH só de título e listagem atualizada                                                                                               | Aprovada no transporte isolado                                                                                |
| Detalhes / `DetalheVagaEmpresaView.vue`                | Título e valor separados, textos extensos, informações e complementos, ações após scroll; exclusão cancelada e confirmada, erro e nova tentativa                                                                                                                          | Aprovada dentro do shell atual                                                                                |
| Notificações / `NotificacoesEmpresaView.vue`           | Lista, leitura, detalhes profissionais, Aprovar/Recusar acessíveis após scroll, confirmação, erro e estado visual atualizado; 20 cenários existentes adicionais cobrem vazio/erro/conflito/sessão                                                                         | Aprovada no transporte isolado; ausência de ações no primeiro enquadramento de 375×812 não é inacessibilidade |
| Perfil / `PerfilEmpresaView.vue`                       | Visualização, edição por Espaço, cancelamento sem escrita, nome obrigatório, arquivo inválido, abertura real do seletor nativo interceptado pelo CDP, PNG válido com nome extenso, indicação de foco, erro 400 preservando arquivo, PATCH multipart e atualização do nome | Aprovada no transporte isolado; persistência real do arquivo no backend não homologada                        |
| Configurações / `ConfiguracoesEmpresaView.vue`         | Texto, botão e retorno; Alterar senha navega para `/trocar-senha?origem=configuracoes-empresa`                                                                                                                                                                            | Aprovada; esta tela não contém formulário próprio. Troca efetiva de senha não executada                       |
| `ConfirmarExclusaoVaga.vue` / `NotificacoesDialog.vue` | Abertura, posicionamento, foco inicial, Tab dentro do dialog, Escape, restauração de foco, cancelamento e confirmações; ações de exclusão e decisão exercitadas em memória                                                                                                | Aprovados nos cenários testados                                                                               |

Capturas de criação/edição mostram campos de uma linha com texto parcialmente visível: o valor completo é preservado no controle e pode ser percorrido durante a edição. Não é truncamento do dado. Capturas de viewport e cliques após scroll confirmam acesso ao conteúdo sob a área inicial do footer; uma composição de página completa com footer fixo não foi usada como prova isolada de sobreposição permanente.

### Desktop/tablet: diagnóstico definitivo e menor FIX segura

- Regra exata: `src/styles/shell.css`, `.app { --mrj-content-width: 26.25rem }`, consumida por `.app-content { width: 100%; max-width: var(--mrj-content-width); margin-inline: auto }`. O pai limita os descendentes a 420px.
- `src/App.vue` ativa `.app--wide` somente quando `$route.meta.layout === 'wide'`. O CSS já amplia esse modo para `--mrj-shell-width: 75rem` em `min-width: 48rem` e reorganiza a navegação inferior.
- `src/router/routes.js` não fornece `layout: 'wide'` às sete rotas empresariais auditadas: home, criação, edição, detalhes, notificações, perfil e configurações. Não foi encontrada rota ativa usando esse opt-in. A exceção estrutural existe, mas não está habilitada nessas páginas.
- Confirmado por medidas reais: `.app-content` = **420px em 768×1024, 1024×768 e 1440×900**. Logo, também afeta tablet. Mobile acompanha a largura disponível.
- Perfil/configurações têm máximo local de 760px, que não supera o máximo do ancestral; a barra fixa de criação/edição possui seu próprio `width: min(100%, 420px)` em `CriarVagaComponent.vue`. Apenas ampliar um componente filho ou mudar esse máximo local não resolve o ancestral.

**Não há solução local correta que amplie o container pai mantendo os arquivos proibidos intactos.** Nenhum `!important`, margem negativa, largura de viewport para escapar do pai, seletor global ou outra sobreposição improvisada foi usado.

FIX proposta: **“FIX FEAT-49 — ativar e homologar layout amplo empresarial”**. Menor alteração estrutural: metadados `layout: 'wide'` apenas nas rotas empresariais preparadas em `src/router/routes.js`, reutilizando App e shell existentes. Não é necessário modificar App/CSS global só para ativar o mecanismo. A FIX deve também adaptar e homologar os estilos locais da listagem/formulário/notificações e a largura/alinhamento da barra fixa em `CriarVagaComponent.vue`; manter o limite de leitura de perfil/configurações quando apropriado. `src/App.vue` e `src/styles/shell.css` são envolvidos no diagnóstico, sem necessidade de edição presumida. Testar navegação, cabeçalho, grids e ações nas sete resoluções; ampliar só o router sem essa validação não conclui a correção visual.

**Ordem recomendada:** essa FIX deve estar integrada antes da homologação visual definitiva e do aceite/merge da FEAT-51 em DEV, com repetição da matriz no layout amplo. Ela não impede um commit local isolado desta FEAT-51 sob as limitações explícitas; não foi criada, integrada ou aplicada nesta etapa.

### Investigação dos dois roteiros antigos

Os arquivos são `tests/vagas.browser.mjs` (FEAT-35) e `tests/gerenciamentoVagas.browser.mjs` (FEAT-36). Não são testes criados pela FEAT-47; suas expectativas ficaram incompatíveis com a evolução da FEAT-47.

Reproduzidos **quatro resultados com saída 1**: cada roteiro na worktree FEAT-51 e em baseline com os componentes Vue da `DEV` lidos por `git show`, sem trocar arquivos ou branch. Cópias instrumentadas em `node_modules/.cache/feat51-final/` mantêm todas as expectativas originais; adicionam apenas diagnóstico no timeout e plugin de leitura do baseline. Serviços/utils da worktree são idênticos à DEV. Evidências em `vagas-worktree.log`, `vagas-DEV.log`, `gerenciamentoVagas-worktree.log`, `gerenciamentoVagas-DEV.log` e `diagnostico-results.json` nesse diretório ignorado.

| Expectativa antiga                                               | Aplicação atual e baseline DEV                                                                                                               | Conclusão                                                                                                                    |
| ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `.msg-erro.length === 6` após formulário vazio, linhas 185 e 245 | **5 erros:** `titulo-erro`, `categoria-erro`, `descricao-erro`, `preco-erro`, `tempo-erro`; foco em `vaga-titulo`. Modalidade vazia é válida | Mesma falha reproduzida nos quatro casos; preexistente à FEAT-51                                                             |
| Descrição começar com `Modalidade: Remoto\n\n`, linhas 276 e 347 | F47 envia `modalidade` em campo próprio e descrição intacta, confirmado no novo fluxo POST 201 e nos testes F47                              | Expectativa antiga adicional identificada estaticamente; os roteiros originais não chegam a essa assertion por pararem antes |
| Lista exata de chaves do payload, linhas 268 e 331               | Payload atual inclui os campos estruturados opcionais preenchidos, além dos campos legados obrigatórios                                      | Necessária atualização contratual em FIX própria, sem remover validações                                                     |
| Layout desktop obrigatoriamente ≤420px, linhas 207 e 267         | Continua verdadeiro hoje, mas conflita com a futura ampliação solicitada                                                                     | Deve ser revisto junto da FIX desktop, não preservado como requisito definitivo                                              |

A F47 testa explicitamente que modalidade/cidade/UF vazias são aceitas e que descrição não recebe prefixo. Os **9/9 casos F47** e **74/74 casos de vagas** passaram. Nenhuma regressão introduzida pela FEAT-51 foi detectada nessa comparação. Os dois roteiros antigos **continuam falhando e não são declarados aprovados**. Proposta separada: atualizar obrigatoriedade, payload estruturado e asserts de largura de acordo com os contratos atuais, preservando seus cenários de negócio. Nenhum teste antigo foi alterado ou apagado.

### Resultados reais desta execução

| Comando / grupo                                            | Resultado                                                                                                                                      |
| ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm test`                                                 | Saída 0: **7 entradas de arquivo**, 7 aprovadas, 0 falhas                                                                                      |
| `node tests/vagas.test.mjs`                                | **74/74 casos**, saída 0; já cobertos por npm test, não somar novamente                                                                        |
| `node tests/complementos-vagas.test.mjs`                   | **9/9 casos**, saída 0 após repetir fora do sandbox a comparação Git bloqueada por EPERM                                                       |
| `node tests/perfil-empresa.test.mjs`                       | **5/5 casos**, saída 0                                                                                                                         |
| `F51_FUNCTIONAL=1 … node tests/empresa-visual.browser.mjs` | **13/13 grupos de fluxos**, saída 0, com mutações apenas em memória                                                                            |
| `F51_FINAL=1 … node tests/empresa-visual.browser.mjs`      | **112/112 verificações**, saída 0 nas sete resoluções; 91 combinações de página/estado/resolução e 21 verificações de perfil em edição/dialogs |
| `node tests/notificacoes.browser.mjs`                      | **20/20 cenários**, saída 0 na repetição serial, sem modificar o teste                                                                         |
| Roteiros antigos de vagas/gerenciamento                    | **2 falhas preexistentes**, reproduzidas também na DEV; 4 execuções diagnósticas com saída 1, detalhes acima                                   |
| `npm run build`                                            | Saída 0, **220 módulos**, PWA **81 entradas**; aviso caniuse-lite desatualizado mantido                                                        |
| Auditoria Vue                                              | **8/8 componentes** compilados (script/template/style); scripts idênticos a HEAD, eventos/v-model/bindings de negócio preservados              |

Matriz executada: **320×900, 375×812, 390×844, 430×932, 768×1024, 1024×768 e 1440×900**. Checagens de overflow horizontal, controles dentro da largura, alvos de pelo menos 24px, tokens ativos, foco por Tab, dialogs/foco/Escape, busca, campos, ações e navegação. Cliques CDP usam coordenadas e `elementFromPoint` após `scrollIntoView`, verificando sobreposição real. Console monitorado: nenhum erro JavaScript ou warning/error coletado nas execuções finais do harness F51.

Intercorrências transparentes: servidor e sockets bloqueados por EPERM no sandbox foram repetidos com autorização fora dele. A primeira rodada de fluxos parou na ativação por Enter porque o harness não enviava o texto da tecla; corrigido o evento CDP e repetidos todos os 13 grupos com aprovação, incluindo Enter e Espaço reais. A primeira tentativa do roteiro de notificações excedeu os 4s de inicialização ao executar em paralelo com outro Vite; a repetição serial passou nos 20 cenários sem editar aplicação ou expectativas. Não contabilizar as tentativas interrompidas como aprovadas.

### Acessibilidade e evidências visuais

Labels e associações dos campos preservados e revisados; input de upload real, focável e associado a Logotipo, mensagem de arquivo em português e feedback de validação. Verificados Tab, Escape, Enter na confirmação de recusa, Espaço na edição do perfil, foco inicial/restaurado nos dialogs, indicação de foco no upload e disabled durante processamento. Auditoria dos scripts e eventos comprova que as melhorias de apresentação não substituíram os handlers de negócio.

Contraste dos principais pares opacos recalculado: secundário/superfície **7,76:1**, texto/fundo **7,92:1**, branco/primária **6,31:1**, erro/superfície **6,47:1**, sucesso/fundo **7,97:1**. Não representa certificação completa WCAG, leitor de tela, dispositivo físico, teclado virtual ou todos os estados de hover/disabled/imagens de fundo. Figma definitivo não foi validado: permanece o contrato visual provisório autorizado.

**39 PNGs finais**, 13 por categoria, em `artifacts/FEAT-51/screenshots/final/mobile/`, `tablet/` e `desktop/`, com manifesto de dimensões/origem e `results.json`. Capturas representativas em 375×812, 768×1024 e 1440×900; as sete resoluções foram efetivamente exercitadas, sem gerar outra centena de imagens. Home e gerenciamento são duas posições de scroll da mesma tela. **Todas usam fixtures de teste, nunca dados de produção.** Perfis Chromium novos ficam em diretórios temporários fora de artifacts. As capturas/perfis antigos permanecem preservados.

Inspeção visual comparou as capturas existentes e `revisao/depois/` às finais: cards mobile com títulos/valores separados e ações distribuídas; criação/edição com valores íntegros; notificações antes/depois do scroll; perfil em edição/upload português; configurações, detalhes e dialog de exclusão. A largura desktop continua sendo a pendência visível diagnosticada, e não foi declarada corrigida.

Reprodução (usar o Chromium disponível no ambiente):

```bash
CHROME_BIN=/caminho/chrome F51_FINAL=1 F51_OUTPUT=artifacts/FEAT-51/screenshots/final node tests/empresa-visual.browser.mjs
CHROME_BIN=/caminho/chrome F51_FUNCTIONAL=1 F51_OUTPUT=node_modules/.cache/feat51-final/fluxos node tests/empresa-visual.browser.mjs
```

### Backend real, dependências e decisão de commit

Sondagem somente de conexão local, sem credenciais/dados: **connection refused** em 127.0.0.1:8000, :8001 e :8080 fora do sandbox. Não há backend de testes confirmado nessas portas nem conta descartável homologada nesta sessão. Não foi iniciado/modificado backend ou usado serviço remoto. Nenhuma persistência real, entrega de imagem ao armazenamento, aprovação/exclusão real ou troca de senha real foi executada. Isso não impediu os testes locais independentes.

**Classificação: APTA COM RESSALVAS para commit local.** Não há bloqueio técnico local novo confirmado na FEAT-51; é seguro preparar um commit com seleção explícita dos dez arquivos abaixo, mantendo documentadas a FIX desktop, os dois roteiros antigos e a homologação real pendente. Não equivale a aceite visual amplo ou homologação Figma/backend. Recomenda-se integrar a FIX de layout antes do aceite/merge final da FEAT-51.

Arquivos do futuro commit (sem staging nesta etapa):

1. `src/components/HomeEmpresaComponent.vue`
2. `src/components/CriarVagaComponent.vue`
3. `src/views/DetalheVagaEmpresaView.vue`
4. `src/views/NotificacoesEmpresaView.vue`
5. `src/views/PerfilEmpresaView.vue`
6. `src/views/ConfiguracoesEmpresaView.vue`
7. `src/components/ConfirmarExclusaoVaga.vue`
8. `src/components/NotificacoesDialog.vue`
9. `tests/empresa-visual.browser.mjs` (novo)
10. `docs/FEAT-51-polimento-empresa.md` (novo)

Excluir do commit: **toda a pasta artifacts**, incluindo screenshots, perfis/cache Chromium antigos e manifestos; `node_modules`, `dist`, caches, temporários, `.env` e credenciais. Nenhum desses foi adicionado ao staging. Nenhum arquivo apagado, commit, push, PR, merge, rebase ou deploy realizado.

Conferência final: Prettier **aprovado nos dez arquivos do futuro commit**, `node --check tests/empresa-visual.browser.mjs` aprovado e `git diff --check` aprovado. Branch/HEAD inalterados; oito Vue modificados preexistentes com hashes preservados, dois arquivos próprios novos e artifacts não rastreada. Staging vazio. Nenhum arquivo excluído. Checklist de escopo, telas, ações, upload, modais, sete resoluções, dependências, testes, build, formatação e documentação concluído dentro das limitações registradas; nenhuma regressão nova detectada nos cenários executados.

## Últimas correções de acessibilidade antes do commit — 2026-11-12

Esta seção atualiza a auditoria independente: os dois problemas locais então encontrados foram corrigidos, sem refazer telas ou alterar regras de negócio.

Antes de editar, reconfirmados repositório Front_marujob, branch FEAT-51 e staging vazio. As oito alterações Vue anteriores, o harness, o relatório e artifacts foram preservados. Nenhuma troca de branch, staging, commit, push, PR, merge, rebase ou deploy.

### Correções

- `HomeEmpresaComponent.vue`: movido o link Ver detalhes para depois do botão Excluir no DOM. A ordem passa a ser **Editar → Excluir → Ver detalhes**, igual à disposição visual. A grade existente foi mantida: Editar/Excluir na primeira linha e Ver detalhes na segunda. Não foi usado tabindex positivo. Links, textos completos, evento de exclusão, permissões e modais permanecem intactos.
- `PerfilEmpresaView.vue`: adicionado `aria-label="Selecionar imagem do logotipo"` ao input nativo de arquivo. O nome acessível agora inclui o texto da ação visível e sua finalidade. Mantidos label Logotipo, input real, accept, change original, fieldset disabled, validação, nome do arquivo, feedback de erro, indicação de foco e envio multipart. Nenhum serviço ou composable alterado.
- `tests/empresa-visual.browser.mjs`: adicionadas verificações de ordem geométrica versus DOM, sequência real de Tab com foco visível e ausência de tabindex positivo nos três controles. Adicionada leitura da árvore de acessibilidade pelo CDP, verificando o nome exato do input em edição de perfil e no fluxo de upload. Isso cobre os dois problemas que os testes anteriores não detectavam.

Arquivos alterados nesta continuação: esses dois componentes, o teste próprio e este relatório. Todos os demais arquivos de aplicação preservados.

### Validação após as duas correções

| Verificação desta continuação                                        | Resultado real                                                                                                                                                                   |
| -------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm test`                                                           | Saída 0: 7 entradas de arquivo aprovadas, zero falhas                                                                                                                            |
| `npm run build`                                                      | Saída 0: 220 módulos, PWA 81 entradas; aviso caniuse-lite mantido                                                                                                                |
| Matriz visual F51 em 320×900, 375×812, 768×1024 e 1440×900           | **64/64 verificações aprovadas**, saída 0                                                                                                                                        |
| Ordem visual e teclado                                               | **Editar → Excluir → Ver detalhes** nas quatro larguras, com Tab real, foco visível e sem tabindex positivo                                                                      |
| Árvore de acessibilidade                                             | Nome exato **Selecionar imagem do logotipo**, verificado pelo Chromium nas quatro larguras e no fluxo de upload                                                                  |
| Fluxos F51 com transporte isolado                                    | **13/13 grupos aprovados**, incluindo seletor nativo, arquivo inválido/PNG válido, nome extenso, erro 400, cancelamento, envio multipart, criação/edição/exclusão e notificações |
| Prettier                                                             | Dez arquivos da FEAT-51 aprovados                                                                                                                                                |
| `node --check tests/empresa-visual.browser.mjs` e `git diff --check` | Aprovados                                                                                                                                                                        |

Evidências geradas fora do repositório: `/tmp/feat51-a11y-final-visual/` (`results.json`, manifesto e capturas selecionadas) e `/tmp/feat51-a11y-final-fluxos/depois/results.json`. Comparadas com as capturas atuais da auditoria anterior: **35/39 PNGs idênticos em bytes**. Os três screenshots de gerenciamento diferentes mostram o foco visível adicional no footer após Tab; o dialog mobile restante foi inspecionado sem mudança de composição. Layout, espaçamentos e disposição dos botões foram preservados. Sem erros JavaScript ou warning/error de console coletados nas execuções finais do harness.

**Resultado: os dois problemas locais de acessibilidade foram eliminados; FEAT-51 pronta para commit local com as ressalvas externas já documentadas.** Nenhuma regressão detectada nos cenários executados. Permanecem fora desta correção: FIX de largura desktop/opt-in wide da FEAT-49, atualização dos dois testes antigos incompatíveis com a FEAT-47 e homologação com backend real/Figma definitivo. Esses dois roteiros antigos não foram alterados nem repetidos nesta continuação; suas falhas preexistentes continuam registradas na auditoria. O transporte dos fluxos permanece simulado, sem alteração de dados reais.

Estado final: mesmos oito Vue modificados e dois arquivos próprios novos do futuro commit; somente os quatro arquivos citados acima mudaram nesta continuação. Staging vazio; artifacts, screenshots, caches e arquivos temporários não adicionados ao Git. Nenhum commit executado.

## Incorporação da correção desktop à FEAT-51

O usuário autorizou expressamente incorporar as alterações não commitadas da FIX-49 à própria FEAT-51 e criar um único novo commit local, preservando o commit de polimento `c45ac1991066f483e9060a7e2824930d0c1a18c1`. Não haverá commit na branch FIX-49 nesta etapa, nem push, PR ou merge na DEV.

Origem preservada: `/mnt/c/users/omtra/onedrive/documentos/Front_marujob-worktrees/FIX-49-layout-desktop-empresa`, branch FIX-49-layout-desktop-empresa, HEAD be21c6a. Destino: worktree original Front_marujob na FEAT-51, inicialmente limpo em c45ac19. DEV e origin/DEV confirmadas na base comum be21c6ae456d023881d9860981f61b325270472b.

A integração usou comparação textual de três vias com essa DEV comum. Finais CRLF/LF foram normalizados em cópias temporárias para evitar conflito artificial de arquivos inteiros. Os sete resultados de aplicação/testes combinaram sem conflitos de conteúdo e coincidiram com o worktree de integração previamente validado. Não foram copiados componentes completos da FIX por cima dos componentes polidos da FEAT-51. A documentação técnica FIX-49 foi incorporada como registro da causa e evolução.

Alterações incorporadas:

- `src/router/routes.js`: layout wide nas sete rotas empresariais, preservando autenticação, tipo de conta, aliases e hideFooter.
- `HomeEmpresaComponent.vue`: saudação/última vaga em duas colunas, filtros proporcionais e gerenciamento em duas colunas no tablet e três a partir de 1200px. Mantidos títulos/preços separados e ordem DOM/Tab Editar → Excluir → Ver detalhes.
- `CriarVagaComponent.vue`: formulário com máximo de 64rem, grupos duplos a partir de 768px e barra fixa alinhada à largura do conteúdo. Sem reativar prévia oculta ou alterar campos, validação e handlers.
- `DetalheVagaEmpresaView.vue`: largura de leitura de 64rem e informações em três colunas a partir de 768px.
- `NotificacoesEmpresaView.vue`: cards em duas colunas e filtros proporcionais em tablet/desktop.
- `tests/notificacoes.test.mjs` e `tests/perfil-empresa.test.mjs`: somente layout wide acrescentado ao meta esperado; verificações de permissão intactas.

App, shell global, headers/footers, serviços, composables, endpoints e regras de negócio não foram alterados. Os componentes de perfil/configurações e ambos os dialogs existentes na FEAT-51 foram preservados integralmente. O upload em português, seu nome acessível, multipart, estados e a navegação mobile continuam os mesmos. As novas regras visuais começam em 48rem; freelancer permanece no layout anterior.

A limitação empresarial de 420px deixa de ser pendência externa: a correção está nesta FEAT-51. O registro técnico de causa está em `docs/FIX-49-layout-desktop-empresa.md`. Permanecem pendentes backend real, dispositivo físico/Figma definitivo e a atualização própria dos dois roteiros browser antigos com expectativas incompatíveis F47. Nenhum desses roteiros foi modificado para forçar aprovação.

### Validação final da integração na própria FEAT-51

| Verificação executada                                              | Resultado                                                                                                                                 |
| ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `npm test`                                                         | 227 testes aprovados, zero falhas, cancelamentos ou skips                                                                                 |
| Notificações / perfil / complementos de vagas, execução específica | 42/42, 5/5 e 9/9 aprovados (também abrangidos pela suíte)                                                                                 |
| `npm run build`                                                    | Aprovado; 220 módulos, PWA 81 entradas. Aviso de atualização caniuse-lite, sem falha                                                      |
| Chromium: área empresarial                                         | 112/112 verificações nas sete resoluções solicitadas                                                                                      |
| Chromium: fluxos funcionais isolados                               | 13/13 grupos: criação, edição, exclusão, cancelamentos, erros, duplicidade, notificações, perfil, seletor nativo e multipart              |
| Chromium: freelancer                                               | 28/28 verificações de Home, freelances, favoritos e perfil nas mesmas sete resoluções                                                     |
| Auditoria Vue e rotas                                              | Scripts, bindings, templates e CSS compilados; somente layout alterado nos metadados de sete rotas; autenticação e permissões preservadas |

Viewports reais: 320×900, 375×812, 390×844, 430×932, 768×1024, 1024×768 e 1440×900. Conteúdo empresarial medido na Home: 305, 360, 375, 415, 753, 1009 e 1200px respectivamente (scrollbar do navegador descontada onde presente). A grade passa a duas colunas no tablet e três no desktop amplo. Nenhum overflow horizontal detectado; rolagem até ações finais, barra fixa, modais, Tab real Editar → Excluir → Ver detalhes e nome acessível “Selecionar imagem do logotipo” aprovados. Sem erro inesperado de JavaScript/console detectado pelo harness. Capturas atuais usam dados de teste e foram revisadas com o diagnóstico antes/depois; capturas de página inteira não substituíram os testes de rolagem.

Evidências locais, fora do commit: `../Front_marujob-worktrees/FIX-49-layout-desktop-empresa-validacao/feat51-integracao-final/`, com `unit/`, `build/`, `browser-empresa/`, `fluxos/` e `browser-freelancer/`. O harness temporário foi executado pelo cache ignorado; o teste temporário original da FEAT-51 não foi modificado nem versionado. Os oito arquivos da origem FIX, os seis arquivos protegidos no destino e 273 PNGs existentes foram conferidos por SHA-256 e preservados.

Escopo do novo commit: router, quatro componentes/views empresariais, dois testes preexistentes e as duas documentações técnicas (nove arquivos). Sem App/shell global, serviços, dependências, credenciais ou arquivos gerados. Prettier nos nove arquivos e `git diff --check` aprovados antes do staging. A revisão do índice repete a checagem antes do commit.

**Resultado da integração: apta para commit local.** Não houve regressão nos cenários executados. A largura desktop está resolvida nesta funcionalidade; backend real, dispositivo físico/Figma definitivo e roteiros browser antigos incompatíveis da FEAT-47 continuam com as limitações registradas, sem alegação de homologação real. O commit de polimento anterior e a branch/worktree FIX permanecem preservados; nenhuma alteração na DEV, push ou PR nesta etapa.

Comparação de capturas: das 21 imagens com correspondente na pasta `fix49-qa/antes`, as sete telas principais em 375px permaneceram idênticas em bytes; as demais refletem a ampliação de tablet/desktop. Inspecionadas também a Home desktop, o formulário tablet e o modal de aprovação mobile atuais.

## Mobile first e perfil institucional — 2026-11-16

Esta etapa é independente dos aceites históricos acima. Início na FEAT-51 em
`c4037d1`, com árvore limpa; commits `c45ac19` e `c4037d1` preservados. Nenhuma
instrução AGENTS.md/SKILL.md local aplicável foi encontrada. Nenhuma alteração
na DEV, backend, serviços, composables, autenticação ou perfil do usuário.

### Diagnóstico e implementação

Comparados no Chromium os componentes reais `PerfilComponent.vue` e
`PerfilEmpresaView.vue`, com fixtures existentes e transporte Axios em memória.
O perfil empresarial anterior concentrava logotipo, nome, apresentação, dados e
edição em um único card; a ação de editar ficava no final. A largura local máxima
era 760px, mesmo com shell wide. A edição mantinha o título grande em 320px e as
ações dependiam da quebra flexível.

O novo cabeçalho institucional reúne logotipo proporcional, nome, área e
localização disponíveis e ação de edição no início. Cards separados apresentam
“Sobre a empresa” e “Informações empresariais”. Não foram acrescentados campos,
documentos privados, métricas ou funcionalidades. Sem descrição, a interface
informa a ausência, sem inventar conteúdo. A identidade de organização é
preservada pelo logotipo quadrado e informações institucionais, sem copiar
habilidades, portfólio ou estatísticas pessoais.

Do perfil de usuário foram aproveitados a hierarquia de apresentação, superfícies
lilás, seções arredondadas e títulos roxos. A implementação usa os tokens opt-in
FEAT-48 e BaseCard/BaseButton/BaseInput existentes; nenhum componente compartilhado
foi alterado. O perfil do usuário foi somente lido e capturado.

Mobile: composição vertical, nome com quebra, logotipo de 88px, editar ocupando a
largura do cabeçalho. Em 320px, título reduzido e Salvar/Cancelar empilhados. A
reserva inferior inclui safe area. Tablet/desktop: cabeçalho horizontal, logo de
112px, cards em duas colunas, largura de leitura até 1120px e formulário até 52rem.
Upload, labels, erros, disabled, loading, handlers, v-model e nome acessível
“Selecionar imagem do logotipo” preservados. Script do componente sem alterações.

Auditados também Home/gerenciamento, criação, edição, detalhes de vaga,
notificações, configurações e dialogs. As capturas inspecionadas em 320px mostram
cards legíveis, título/preço separados, ações de vagas organizadas, formulário
vertical, filtros de notificações em duas colunas e confirmação dentro da
viewport. Não foi identificado conflito que justificasse desfazer a correção
desktop ou refazer essas telas. Ausência de overflow não foi o único critério:
foram examinadas capturas e exercitadas rolagem, clique e teclado.

`layout: 'wide'` permanece nas rotas. O shell ativa a largura ampla somente em
48rem; em mobile mantém limite de 420px. Nenhum estilo global ou `!important`
foi acrescentado.

### Evidências e reprodução

Evidências desta etapa em `/tmp/feat51-mobile-20261116/`, fora do Git. Capturas
anteriores preservadas. Referência do usuário mobile/desktop em
`referencia/depois/referencia-usuario-{375,1440}.png`; empresa antes em
`antes/antes/empresa-perfil-{320,375}-filled.png`; demais evidências e resultados
por lote. Todas as imagens mostram fixtures, não dados reais. O nome de pessoa
na fixture empresarial preexistente é dado de teste; o componente usa o nome
recebido do serviço, sem substituição artificial.

Roteiro temporário: `node_modules/.cache/feat51-mobile-audit.mjs`, não versionado.
Cópia do harness existente com altura de 800px para 360px, captura adicional do
perfil do usuário e limite esperado do shell atualizado para 1200px em desktop.
O teste versionado ainda exige no máximo 420px; sua execução inicial parou nessa
asserção obsoleta em 1440px. Não houve alteração de teste preexistente para forçar
aprovação. API simulada, mesmos componentes/rotas/shell reais. Chromium Linux
1254 já instalado. Sandbox bloqueou a porta Vite com EPERM: execuções de navegador
necessitaram autorização fora do sandbox. Chrome Windows não conectou ao CDP;
utilizado Chromium Linux. Execuções interrompidas com sinal 143 não contam como
aprovação; build repetido com sucesso.

### Resultado da validação desta etapa

- `npm test`: saída 0; sete arquivos aprovados, zero falhas no resumo desta
  execução Node 26. Não se reutilizou a contagem histórica de 227 testes.
- `node --test tests/perfil-empresa.test.mjs tests/design-system.test.mjs`:
  saída 0, dois arquivos aprovados.
- `npm run build`: saída 0 na repetição; PWA 81 entradas. Aviso preexistente de
  caniuse-lite desatualizado. Sem atualização de dependências.
- Chromium: 89 verificações concluídas em quatro lotes: 19 em 320px (incluindo
  loading/erro e listas vazias), 20 em 360/375px, 20 em 390/430px e 30 em
  768/1024/1440px. Alturas: 900, 800, 812, 844, 932, 1024, 768 e 900px,
  respectivamente. Sete rotas, incluindo Home e gerenciamento na mesma página.
- Sem overflow horizontal, controles fora da largura ou erros inesperados de
  JavaScript/console coletados nos lotes concluídos. Conferidos foco visível por
  Tab, ordem Editar/Excluir/Ver detalhes, nome acessível do upload, abertura e
  fechamento de dialogs e navegação real no router. Capturas no fim da página em
  320px confirmam que o último contato e os cards finais ficam acima do footer.
- Fluxos em Chromium: 13/13 grupos aprovados, incluindo criação, edição,
  exclusão, notificações, cancelamento/validação do perfil, upload pelo seletor
  nativo, arquivo inválido, PNG válido, nome extenso, foco, loading/disabled,
  erro 400, prevenção de duplicidade e salvamento multipart em memória.
- Inspeção visual direta: referência do usuário em 375/1440px; empresa antes em
  320px; depois em 320/768/1440px, visualização/edição; Home e gerenciamento,
  criação, detalhe, notificações, configurações e modal de aprovação em 320px;
  Home ampla em 1440px. As demais dimensões foram exercitadas pelo Chromium e
  capturadas; não se afirma aceite humano definitivo de cada imagem.
- Script do perfil empresarial comparado a HEAD: idêntico. Perfil do usuário,
  router, tokens, componentes compartilhados, serviços, payloads e validações
  sem diff. Somente `src/views/PerfilEmpresaView.vue` e esta documentação
  modificados; staging vazio, sem commit/push/PR/merge.

Arquivos de resultados: `depois/depois/results.json` (360/375),
`lote-390-430/depois/results.json`, `lote-desktop/depois/results.json`,
`lote-320/depois/results.json` e `fluxos/depois/results.json`, sob a raiz das
evidências. Screenshots antes desktop em
`antes-desktop/antes/empresa-perfil-1440-filled.png`. Screenshots depois mobile
em `lote-320/depois/empresa-perfil-320-filled.png` e
`depois/depois/empresa-perfil-375-filled.png`; desktop em
`lote-desktop/depois/empresa-perfil-1440-filled.png`.

**Classificação: APTA COM RESSALVAS para revisão visual.** As verificações locais
concluídas passaram. Backend/armazenamento reais não foram homologados: toda
mutação utilizou adapter em memória. Teclado virtual e dispositivo físico não
foram reproduzidos; teclado real de automação CDP (Tab, Escape, Enter, Espaço)
foi exercitado. O teste browser versionado ainda contém a expectativa antiga de
420px em desktop e requer manutenção separada. Figma não foi usado como fonte;
a referência foi o perfil do usuário existente, conforme solicitado. Nenhuma
aprovação visual definitiva ou autorização de commit é presumida.

Cópia persistida das evidências em `artifacts/FEAT-51/mobile-first-20261116/`,
confirmada como ignorada pelo Git, sem apagar ou sobrescrever capturas anteriores.
Prettier nos dois arquivos modificados e `git diff --check`: aprovados.

## Contrato vigente: aplicativo compacto também no computador — 2026-11-16

Esta seção substitui a decisão anterior de ampliar a área empresarial: por nova
orientação do usuário, todas as telas empresariais devem manter aparência de
aplicativo em uma coluna, inclusive em monitor desktop. A integração histórica
wide permanece documentada acima, mas não representa mais o resultado desejado.

### Segurança e causa

Branch FEAT-51 em `c4037d1`, commits anteriores preservados. No início havia
alterações locais em `.env`, `PerfilEmpresaView.vue` e nesta documentação. `.env`
não foi lido ou editado. O novo cabeçalho institucional e cards do perfil foram
preservados. Nenhum AGENTS.md/SKILL.md local aplicável localizado. Sem troca de
branch, reset, rebase, merge, staging, commit, push ou PR.

A causa do dashboard largo era dupla: sete rotas ativavam `meta.layout: 'wide'`,
e o shell aumentava o conteúdo para 75rem (1200px) a partir de 48rem de viewport.
Adicionalmente, Home, formulários, detalhes, notificações e perfil ativavam grades
e espaçamentos desktop por media queries da janela. Somente limitar o container
não corrigiria essas grades nem a barra fixa dos formulários.

### Correção

- Removido `layout: 'wide'` das sete rotas empresariais, mantendo paths, nomes,
  autenticação, tipo de conta e `hideFooter`.
- `.app--empresa` define `--mrj-shell-width: 26.25rem` (420px). O contrato global
  opt-in wide continua disponível para outros contextos; nenhuma regra do perfil
  do usuário foi alterada. O fundo externo discreto existente foi preservado.
- Removidas somente as composições desktop empresariais: Home/gerenciamento em
  duas/três colunas, formulários duplos e barra de ações de 64rem, detalhes em três
  colunas, notificações em duas colunas e perfil com cards lado a lado.
- Header e footer existentes acompanham o container, sem alterar links ou
  controles. A navegação mantém ícones acima dos textos, aba ativa, foco e safe
  area. A barra fixa de publicar/atualizar volta ao limite de 420px.
- Home mantém boas-vindas, criar vaga, última vaga e gerenciamento em fluxo
  vertical; sem vagas usa o estado vazio existente. Não foram criadas métricas ou
  vagas fictícias na aplicação. A altura mínima apenas mantém o fundo preenchido,
  sem distribuir blocos artificialmente pela altura.
- Perfil mantém cabeçalho institucional, logo, nome, setor/localização disponíveis,
  editar no início, Sobre a empresa e Informações empresariais empilhados. Upload
  acessível, formulário, salvar/cancelar, erros e carregamento preservados.
- Modal de exclusão limitado a 388px (shell menos 32px), para não ultrapassar a
  largura do aplicativo em desktop. Modal de notificações já tinha máximo de
  400px e foi preservado. Sem `!important`.
- Testes de rota atualizados para o contrato compacto, com regressão para as sete
  rotas e manutenção de autenticação/hideFooter. O harness local ignorado agora inclui
  360x800 e confere centralização, alinhamento de header/footer e coluna única.
  O teste de shell FEAT-49 distingue o limite empresarial (420px) do opt-in wide
  genérico (1200px). Nenhum teste foi relaxado para ignorar falhas de usabilidade.

Scripts dos seis componentes alterados comparados a HEAD: idênticos. Não houve
alteração de serviços, composables, validações, payloads ou backend.

### PWA: aparência versus janela instalada

A aparência compacta funciona numa aba comum. Ela não remove a interface do
Chrome. Para abrir sem abas e barra de endereço é necessário abrir a PWA instalada.

Configuração existente preservada:

- `public/manifest.webmanifest`, referenciado por `index.html`.
- `display: standalone`, `start_url: /`, `scope: /`.
- Ícones PNG 192x192 e 512x512, ambos com `purpose: any maskable`.
- `vite.config.js`: manifesto estático (`manifest: false`), autoUpdate,
  service worker de produção e precache Workbox; SW de desenvolvimento desativado.
- Limpeza de service worker antigo no Vite dev já existente; não foi alterada.

Verificado o build servido localmente em preview: manifesto idêntico ao público,
ícones servidos com status 200 e dimensões corretas, service worker `/sw.js` ativo
no Chromium com escopo `/`. Não foi instalada uma aplicação no sistema operacional
nem homologado o servidor de produção. A captura do preview continua sendo uma
aba de navegador (`standalone: false`), como esperado.

Para testar a configuração de produção localmente: `npm run build`, depois
`npm run preview -- --host 127.0.0.1`. No Chrome, abrir o endereço informado pelo
Vite. Para uso publicado, abrir a URL HTTPS do MaRuJoBs. Escolher o ícone de
instalação na barra de endereço quando disponível ou menu ⋮ → Transmitir, salvar
e compartilhar → Instalar página como app. Confirmar a instalação e abrir pelo
atalho criado ou por `chrome://apps`. O nome do menu pode variar com idioma/versão.
Não usar `npm run dev` para homologar cache/offline de produção, pois o SW está
desativado nesse modo. Autenticação e conteúdo que dependem da API continuam
precisando de conexão; precache não significa funcionamento offline de todas as
funcionalidades.

Referência do procedimento: [Ajuda oficial do Chrome](https://support.google.com/chrome/answer/9658361).

### Evidências

Raiz nova, ignorada pelo Git: `artifacts/FEAT-51/app-shell-20261116/`.
`antes/desktop/` e `antes/mobile/` preservam cópias das capturas da etapa anterior,
sem apagar originais. As pastas por lote contêm as telas atuais, modais,
formulários, edição do perfil e resultados. `pwa/` contém o resultado do preview.
As páginas usam os componentes Vue, rotas e shell reais com adapter Axios em
memória, sem credenciais ou mutações reais. O nome empresarial de pessoa que
aparece nas capturas vem da fixture preexistente, não de dado inventado no produto.

### Validação do contrato compacto

| Viewport   | Largura de conteúdo medida na Home com vagas |
| ---------- | -------------------------------------------- |
| 320 × 900  | 305px                                        |
| 360 × 800  | 345px                                        |
| 375 × 812  | 360px                                        |
| 390 × 844  | 375px                                        |
| 430 × 932  | 415px                                        |
| 768 × 1024 | 420px                                        |
| 1024 × 768 | 420px                                        |
| 1440 × 900 | 420px                                        |

Os primeiros valores descontam a scrollbar clássica de 15px usada pelo Chromium
na emulação; o limite de layout é `min(largura disponível, 420px)`. Na Home vazia
sem scrollbar o aplicativo ocupa 420px em 1440px. Header e navegação têm exatamente
a largura/posição horizontal do conteúdo; centralização verificada com tolerância
inferior a 1px.

- `npm test`: saída 0, sete arquivos aprovados, zero falhas no resumo Node 26.
- Testes específicos de perfil empresarial e design system: saída 0, dois
  arquivos aprovados, incluindo o novo contrato das sete rotas.
- `npm run build`: saída 0, PWA com 81 entradas; aviso preexistente de caniuse-lite.
- Chromium empresarial: 92 verificações de tela/estado/layout concluídas nas oito
  resoluções; centralização, header/footer, coluna única, ausência de overflow,
  controles na viewport, Tab e foco visível. Nos lotes desktop foram exercitados
  também os estados vazio, loading e erro da Home e notificações.
- O primeiro lote 320/360 usa cópia temporária que registra geometria e métricas
  separadamente: 40 registros representam 20 verificações, sem duplicar a contagem.
  Demais lotes: 20 em 375/390, 20 em 430/768 e 32 em 1024/1440.
- Fluxos funcionais: 13/13 aprovados, com publicação, edição, exclusão,
  notificações, cancelar/validar/salvar perfil, seletor nativo, arquivo inválido,
  PNG válido, nome extenso, multipart, loading/disabled, erro 400 e prevenção de
  duplicidade. Tab, Escape, Enter e Espaço exercitados pelo CDP. As ações finais
  foram alcançadas por rolagem e clique com verificação de sobreposição real.
- Sem erros inesperados de JavaScript/console coletados nas execuções empresariais
  concluídas. Nenhuma requisição de mutação ao backend real: transporte em memória.
- Inspeção visual direta das capturas: Home mobile e tablet/desktop, estado vazio
  desktop, formulários tablet, perfil desktop e confirmação de notificações.
  Comparação com as capturas largas anteriores confirma o shell compacto; as demais
  imagens continuam disponíveis para revisão humana. Não é aprovação visual
  definitiva de todas as imagens nem homologação de dispositivo físico.

Arquivos de aplicação alterados: `src/router/routes.js`, `src/styles/shell.css`,
`src/components/HomeEmpresaComponent.vue`, `src/components/CriarVagaComponent.vue`,
`src/components/ConfirmarExclusaoVaga.vue`, `src/views/DetalheVagaEmpresaView.vue`,
`src/views/NotificacoesEmpresaView.vue`, `src/views/PerfilEmpresaView.vue`.
Testes rastreados atualizados: `tests/notificacoes.test.mjs`,
`tests/perfil-empresa.test.mjs`, `tests/responsividade.browser.mjs`.
Documentação: este arquivo. O harness `tests/empresa-visual.browser.mjs` já era
local e ignorado por `.git/info/exclude`; foi ajustado para a auditoria e continua
fora do Git, assim como os scripts de cache, screenshots, JSONs e logs. Nenhum
arquivo ignorado foi forçado ao índice. `.env` permanece como alteração
preexistente, fora deste escopo.

Regressão preexistente de shell executada com `F49_AUDIT=0`: saída 0. Dez
combinações de shell/navegação (usuário e empresa em cinco larguras), incluindo
rota sintética wide, e vinte aberturas de páginas reais sem overflow. O modo de
auditoria extensa F49 ficou desativado; a matriz empresarial completa foi
executada separadamente acima. Log em `validacao/shell-regression.log`.

`git diff --check` global aponta **`.env:2: new blank line at EOF`**. Essa alteração
já existia antes da tarefa e foi preservada, sem inspecionar seu conteúdo. A
checagem limitada aos demais arquivos (`git diff --check -- . ':!.env'`) passou.
Não se declara aprovação global ocultando essa ressalva.

**Classificação: APTA COM RESSALVAS para revisão.** Layout compacto e fluxos locais
aprovados; permanecem backend/armazenamento reais, instalação da PWA no sistema e
dispositivo físico sem homologação. Nenhum commit, push, PR ou alteração na DEV.

Teste adicional de toque no Chromium em 375×812 (`mobile: true`): navegação pela
aba Perfil, abertura da edição e Cancelar aprovados com eventos touchStart/touchEnd.
Evidências em `toque/depois/`. Isso não substitui teste em aparelho físico.
Prettier aprovado nos arquivos de implementação/testes e na documentação.

## Redesign baseado na imagem de referência — 2026-11-16

### Fonte visual, segurança e precisão

Referência localizada após indicação do usuário: `referencias/image.png`, PNG de
1143×645 com Home empresarial, freelancers, vagas, perfil/edição, filtros,
cadastro e detalhes. A imagem foi efetivamente aberta e comparada às telas reais.
Recortes ampliados por canvas do Chromium foram usados somente para inspeção e
preservados em `artifacts/FEAT-51/redesign-figma/depois/referencia-*.png`.
A imagem não foi usada como fundo ou screenshot substituindo componentes da UI.
Não há arquivo/frame original do projeto Figma identificado; o texto minúsculo e
os valores da imagem não permitem extração confiável de medidas ou fonte.
A skill figma-design-to-code foi consultada; neste caso a instrução explícita do
usuário é implementar pela imagem disponível. Não foi atribuída uma consulta ao
Figma ou uma fidelidade pixel a pixel que não ocorreu.

Início na FEAT-51 em `c4037d1`, com alterações anteriores de shell/perfil e `.env`
preservadas. `referencias/` é diretório local não rastreado, fornecido pelo usuário.
Nenhum AGENTS.md/SKILL.md local aplicável encontrado. `.env` não foi aberto/editado.
Não houve checkout, reset, rebase, merge, staging, commit, push, PR ou alteração da
DEV. Cópias dos oito componentes no início desta etapa foram guardadas no cache
ignorado para comparação, sem substituir ou apagar trabalhos anteriores.

### Diferenças e decisões por tela

| Tela               | Diferença observada                                                                                    | Implementação                                                                                                                                                                                                                                                                     |
| ------------------ | ------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Header e navegação | Header de 92px e marca muito grande para a densidade da referência; aba ativa indicada apenas pela cor | Header de 76px, marca e controles proporcionais, mesma imagem local de ondas, tokens FEAT-48 e áreas de toque de 44px. Footer lilás com destaque de superfície na aba ativa, ícones/textos preservados e sombra discreta                                                          |
| Home               | Saudação/CTA grandes, notas em cards extras e gerenciamento com descrição sempre extensa               | Saudação de 20px, CTA proporcional ao conteúdo, nota auxiliar sem card, estado vazio com ícone e texto existentes. A explicação técnica do maior ID saiu do produto; o algoritmo permanece idêntico e está documentado abaixo                                                     |
| Vagas da empresa   | Cards mais altos que os compactos da referência                                                        | Ícone roxo, borda de destaque, sombras removidas, chips de categoria/tempo e modalidade/localização quando a resposta já contém esses dados. Descrição integral em details/summary nativo, sem truncamento; Editar/Excluir/Ver detalhes permanecem na ordem DOM e visual anterior |
| Perfil empresarial | Hero alto, logotipo acima de todo o conteúdo e ação muito afastada do nome                             | Logotipo ao lado de nome/setor/localização, placeholder institucional com ícone de empresa, edição próxima dos dados, cards empilhados Sobre/Informações com títulos e ícones consistentes. Nenhum dado privado ou campo novo                                                     |
| Editar perfil      | Prévia afastada dos controles e blocos redundantes                                                     | Prévia e controles de logotipo no mesmo grupo, campos verticais com labels próximas, seções claras, Salvar/Cancelar de largura total, erros e estados preservados                                                                                                                 |
| Criar/editar vaga  | Títulos decorativos repetidos e campos muito espaçados                                                 | Removido o bloco “SUA OPORTUNIDADE / Vamos aos detalhes”, mantidos indicação de obrigatórios e legendas semânticas. Inputs com 44px e fonte de 16px, textareas confortáveis, espaçamento menor e formulário em uma coluna                                                         |
| Detalhes           | Cards e resumo mais altos/pesados que a referência                                                     | Resumo com ícone roxo, títulos e preço separados, cards com padding menor e sem sombra, informações existentes em grade de pares compactos, sem inventar campos ausentes                                                                                                          |
| Notificações       | Densidade e pesos maiores que a linguagem de cards da referência                                       | Título, cards e espaços compactados; estados, botões e filtros de situação mantidos. A referência não contém uma tela específica de notificações: a composição usa a linguagem compartilhada, sem alegar reprodução direta de frame                                               |
| Configurações      | Tipografia e fundo destoavam do conjunto novo                                                          | Mesmo fundo lilás, títulos proporcionais e sem alteração da ação existente. Também não há frame específico desta tela na imagem                                                                                                                                                   |
| Filtros            | Mockup contém opções adicionais indisponíveis no frontend atual                                        | Preservados somente busca/categoria das vagas e filtros de situação das notificações. Não foi criado drawer, filtros novos ou comportamento sem contrato                                                                                                                          |

Foram reutilizados os tokens opt-in FEAT-48 e BaseCard/BaseInput/BaseButton.
Nenhum token global ou componente base foi modificado; ajustes são locais aos
componentes empresariais. Não foi criado outro design system ou usado !important.
A paleta existente foi priorizada sobre cores estimadas de pixels da imagem para
preservar consistência e contraste. Não se reproduziram avaliações, estrelas,
quantidades, listas de freelancers ou vagas dentro do perfil sem dados/fluxo já
existente. Cadastro e telas de usuário/freelancer não foram redesenhados.

A Home continua selecionando o maior ID como aproximação da última vaga,
exatamente como antes; não houve alteração de regra ou promessa de ordenação por
data. A descrição expansível é apresentação local de conteúdo já existente e
suporta clique, Tab, Enter/Espaço nativos; nenhuma requisição adicional é feita.

### Preservação funcional e layout

Scripts dos oito componentes comparados às cópias do início desta etapa:
**idênticos**. Serviços Axios, endpoints, autenticação, permissões, payloads,
composables, regras e validações sem alteração. Nome acessível “Selecionar imagem
do logotipo”, input nativo focável, validação, estados disabled/loading e multipart
preservados. Nenhuma alteração no perfil do usuário, PWA ou configuração de build.

O shell de 420px e as sete rotas sem wide da etapa anterior foram preservados.
Header, conteúdo e footer com a mesma largura/posição horizontal, centralizados.
Matriz real: 320×900, 360×800, 375×812, 390×844, 430×932, 768×1024,
1024×768 (adicional) e 1440×900. Na Home preenchida: 305, 345, 360, 375, 415,
420, 420 e 420px de conteúdo, respectivamente. Os primeiros valores descontam a
scrollbar clássica de 15px da emulação Chromium; o contrato é ocupar o disponível
até 420px. Nenhuma grade empresarial larga reativada.

### Testes e evidências finais

- `npm test`: saída 0, sete arquivos aprovados, zero falhas no resumo Node 26.
- Testes específicos de perfil empresarial/design system: saída 0, dois arquivos
  aprovados. Nenhum teste rastreado foi alterado nesta etapa.
- `npm run build`: execução serial final aprovada, PWA com 81 entradas. A execução
  paralela anterior foi interrompida com sinal 143 após compilar; não foi contada
  como aprovada. Aviso preexistente de caniuse-lite desatualizado, sem atualizar
  dependências.
- Chromium empresarial: 110 verificações de tela/estado/layout concluídas:
  32 em 320/375px, 30 em 360/390/430px e 48 em 768/1024/1440px. Incluem foco
  visível, ordem de Tab, header/footer, alinhamento, coluna única, ausência de
  overflow, abertura/fechamento de descrições, modais e rolagem até ações finais.
- Fluxos em memória: 13/13 grupos aprovados, incluindo criar/editar/excluir,
  notificações, validar/cancelar/salvar perfil, seletor nativo de arquivo, PNG
  válido/arquivo inválido, nome extenso, erro 400, duplicidade e multipart.
- Teste adicional: perfil sem dados opcionais/logotipo, erro e loading em 375px;
  navegação, editar e cancelar por touchStart/touchEnd em emulação mobile;
  galeria HTML local com imagens carregadas e troca de tela/resolução. Sete
  verificações concluídas nesse roteiro.
- Sem erros inesperados de JavaScript ou console coletados nos roteiros
  empresariais concluídos. Nenhuma homologação de API real ou armazenamento.
- O teste adicional de descrição por mouse mudou a modalidade de entrada antes
  da asserção de foco por teclado; a primeira tentativa parou em focus-visible.
  A cópia temporária foi corrigida para enviar Tab real antes de conferir foco.
  A asserção foi mantida e a matriz foi repetida com sucesso, sem alterar CSS ou
  testes rastreados para mascarar a falha.

Capturas reais antes/depois, resultados e galeria estão em
`artifacts/FEAT-51/redesign-figma/`, ignorada pelo Git:

- `antes/`: estado compacto anterior desta mesma worktree em 320/375/1440px.
- `depois/mobile-320-375-final/`: capturas finais pequenas, visualização/edição e
  fim das páginas; estados vazios/loading/erro e modais.
- `depois/mobile-360-390-430/` e `depois/tablet-desktop/`: matriz restante.
- `depois/fluxos/` e `depois/toque-galeria/`: verificações adicionais.
- `galeria.html`: 30 comparações antes/depois em 320/375/1440px; todos os links
  conferidos e trocas de tela/resolução exercitadas no Chromium.
- `referencia.png`: cópia da imagem fornecida, sem alterar o original.

Capturas preliminares também preservadas; as pastas com “final” e os lotes
indicados acima são a evidência vigente. Recortes ampliados não aumentam a
resolução da referência nem representam acesso ao arquivo Figma original.
A inspeção visual direta incluiu a referência e seus recortes, perfil antes/depois
em 320/375px e em 1440px, edição e ações finais em 320/375px, Home e gerenciamento,
criação, detalhes e notificações. Não é aceite definitivo de todas as capturas.

### Arquivos desta etapa

- `src/components/EmpresaHeader.vue`
- `src/components/FooterEmpresaComponent.vue`
- `src/components/HomeEmpresaComponent.vue`
- `src/components/CriarVagaComponent.vue`
- `src/views/PerfilEmpresaView.vue`
- `src/views/DetalheVagaEmpresaView.vue`
- `src/views/NotificacoesEmpresaView.vue`
- `src/views/ConfiguracoesEmpresaView.vue`
- Este relatório.

As demais alterações rastreadas no Git são das etapas anteriores e foram
preservadas. Harnesses e arquivos temporários continuam no cache ignorado; nenhum
screenshot, foto, JSON de validação, log, dist, node_modules, .env ou credencial
foi adicionado ao índice. `referencias/` permanece não rastreado e não deve integrar
o futuro commit.

Regressão final de usuário/freelancer e shell: saída 0 em
`F49_PATHS=/perfil,/freelances node tests/responsividade.browser.mjs`, incluindo
auditoria dessas duas telas em sete larguras, shell/navegação de usuário e empresa
e aberturas reais de Home/freelances/criação. Nenhuma mudança nas telas de usuário.

Prettier aprovado nos oito componentes; documentação formatada. A execução global
de `git diff --check` continua apontando somente a linha vazia extra no fim do
`.env` preexistente (`.env:2: new blank line at EOF`). O arquivo foi preservado,
sem abrir seu conteúdo. `git diff --check -- . ':!.env'` aprovado.

**Avaliação: APTA COM RESSALVAS PARA REVISÃO VISUAL.** A composição está mais próxima
da referência, com mudanças estruturais no perfil, edição, densidade de cards e
navegação, e os fluxos locais passaram. A precisão continua limitada à imagem
panorâmica de baixa resolução. Aprovação visual do usuário, backend/armazenamento
reais e dispositivo físico permanecem pendentes. Nada foi commitado ou publicado.

## Correção da Home na aplicação real — 2026-11-16

### Diagnóstico objetivo antes da correção

A validação anterior foi insuficiente: o harness de componentes não demonstrava
o que a instância Vite da porta 5173 estava efetivamente servindo. Também foram
preservados na Home uma composição de card grande para a última vaga, descrição
extensa e blocos independentes, em vez dos painéis e linhas compactas da primeira
tela da referência. Ajustes de densidade não corrigiram essa estrutura.

Reconfirmados raiz Front_marujob, FEAT-51 e HEAD `c4037d1`; todas as alterações
locais anteriores preservadas. `referencias/image.png` foi novamente aberta e
comparada à Home. Não há arquivo Figma original: os limites da imagem de
1143×645 permanecem. O componente que renderiza `/homeEmpresa` é
`HomeEmpresaView.vue`, que compõe `EmpresaHeader.vue` e `HomeEmpresaComponent.vue`.

A inspeção da rota real comprovou um segundo problema, independente da decisão
visual: o Vite estava na raiz correta, mas respondia com o módulo compilado antigo.
O pedido normal de `HomeEmpresaComponent.vue`, inclusive com `?t=...`, não tinha
`painel-vagas`; a leitura `?raw&diagnostico=...` e um novo ID de módulo já continham
a estrutura atual. Isso caracteriza resultado de transformação desatualizado no
servidor, não apenas cache do navegador. O perfil Chromium era novo, com zero
service workers registrados e nenhum controller antes/depois; não há evidência
para atribuir esse caso à PWA. Não foram inspecionados ou limpos perfis pessoais.

Foi confirmada a linha de comando e a pasta da instância na porta 5173. Apenas
esse Vite foi reiniciado, na mesma porta, com `CHOKIDAR_USEPOLLING=true` e intervalo
de 300ms no ambiente do processo. `vite.config.js` e `.env` permaneceram intactos.
Após isso, pedidos normais e a rota real passaram a mostrar os módulos atuais.
Uma alteração posterior de CSS gerou evento HMR no log, sem outro restart,
confirmando que a atualização passou a ser percebida. Nada foi apagado de caches,
storage, dados ou configurações do usuário. O servidor foi deixado em execução.

### Mudanças concretas de composição

- Hero de boas-vindas com a arte local existente, descrição de apoio e CTA
  integrado de largura proporcional ao conteúdo do aplicativo.
- Painel “Última vaga publicada” com linha clicável: ícone, título completo,
  preço ao lado, categoria/tempo/modalidade e destino existente Ver detalhes.
  Removida a descrição extensa dessa prévia; o conteúdo integral permanece na
  tela real de detalhes e isso foi verificado pelo navegador.
- Gerenciamento em painel próprio, filtros existentes e linhas de vagas compactas.
  Categoria, tempo, modalidade e localização disponíveis continuam apresentados;
  nenhum campo ou endpoint novo. Preço agrupado ao título e metadados abaixo.
- Editar, Excluir e Ver detalhes em uma barra de três ações de pelo menos 44px,
  na mesma ordem visual e de Tab. Não há tabindex positivo ou truncamento de
  títulos; o caso com título extenso foi mantido entre os dados de teste.
- Estado sem vagas compacto, com ícone, mensagem clara e a ação existente de
  publicação. O espaço restante resulta da altura da janela e do footer fixo;
  não há card artificialmente esticado, vagas, métricas ou freelancers fictícios.
- Busca com texto curto e campos de 16px, para legibilidade e uso mobile.

O perfil/edição e as outras telas foram revistos na aplicação real. A composição
institucional anterior foi preservada. Uma falha real foi eliminada no perfil:
os ícones building/circle-info eram referidos por strings, mas não registrados em
`main.js`. O harness anterior adicionava todos os ícones e mascarava essa falha.
Agora são importados diretamente no componente, como já ocorria com o ícone de
configurações. Antes foram coletados oito avisos “Could not find one or more
icon(s)” nas quatro aberturas do perfil; na rodada final real: zero.

Somente `HomeEmpresaComponent.vue`, `PerfilEmpresaView.vue` e este relatório
foram alterados nesta continuação. Script da Home idêntico à cópia do início;
no perfil, apenas imports/referências visuais de ícones. Não houve mudança em
serviços, Axios, autenticação, permissões, endpoints, regras, payloads, validações,
router, PWA ou perfil do usuário. As demais modificações no Git são anteriores.

### Validação real e comparação mensurável

Usado Chromium Linux com perfil temporário próprio. Foram carregados o
`index.html`, `src/main.js`, App, router `createWebHistory` e guards reais em
`http://localhost:5173/homeEmpresa`. As requisições XHR/Fetch de API foram
interceptadas por CDP, com conta empresarial e três vagas controladas; não foi
substituído o bootstrap por um runner Vue, nem alterada a API da aplicação.
GET/OPTIONS foram respondidos em memória e mutações de rede ficaram bloqueadas.
Os mesmos dados foram usados antes/depois. A primeira configuração do transporte
bloqueava preflight OPTIONS; foi corrigida no script temporário, sem alterar
serviço ou guard da aplicação.

Foram capturados viewport e página inteira em 320×900, 375×812, 390×844 e 1440×900,
com e sem vagas, e perfil antes/depois. As novas capturas esperam decodificação
de imagens e confirmam carregamento dos fundos do header/hero. A primeira captura
nova, prematura, sem esses assets decodificados foi preservada como intermediária;
`depois-final/` é a evidência vigente. O widget Vue DevTools visível nas capturas
reais pertence ao ambiente de desenvolvimento, sem CSS de ocultação no produto.

| Largura da janela | Última vaga antes → depois | Altura da página com três vagas antes → depois |
| ----------------- | -------------------------- | ---------------------------------------------- |
| 320px             | 240,6 → 128,2px            | 2047 → 1414px                                  |
| 375px             | 218,2 → 121,8px            | 1835 → 1354px                                  |
| 390px             | 218,2 → 121,8px            | 1835 → 1334px                                  |
| 1440px            | 195,8 → 121,8px            | 1784 → 1296px                                  |

As medidas são da conta controlada, não promessas para qualquer conteúdo. O
shell mediu 305/360/375/420px nas quatro larguras (scrollbar clássica descontada
nos menores casos); header/footer alinhados e centralização conferida. Nenhum
wide reativado. A referência e os screenshots lado a lado mostram mudança de
composição, não somente de bordas/padding. A referência tem outras seções sem
suporte de dados no escopo, que não foram inventadas para preencher a página.

### Resultados dos testes desta continuação

- Rota real: **45 checkpoints concluídos**, com zero avisos/erros JavaScript
  coletados. Incluem quatro resoluções, Home com/sem vagas, perfil/edição,
  criação/edição de vaga, detalhes, notificações, configurações, modais, rolagem
  até ações finais, mouse, Tab com foco visível e navegação do footer por toque.
- Formulário preenchido com eventos de teclado do Chromium e cancelado sem
  escrita. Exclusão/aprovação abertas e fechadas por Escape; ações alcançadas
  por scrollIntoView e verificação de elementFromPoint, sem depender de clique
  que atravesse elementos sobrepostos.
- Fluxos complementares no adapter isolado: **13/13 grupos aprovados**, incluindo
  criar/editar/excluir, notificações, cancelamento/validação/salvamento de perfil,
  arquivo inválido/PNG válido, seletor nativo, nome extenso, loading/disabled,
  erro 400, duplicidade e multipart. Não representam backend real homologado.
- `npm test`: saída 0, sete arquivos aprovados, zero falhas no resumo Node 26.
- Testes específicos de perfil empresarial/design system: saída 0, dois arquivos
  aprovados. Nenhum teste rastreado alterado para forçar resultado.
- `npm run build`: saída 0, PWA com 81 entradas; aviso preexistente de caniuse-lite.
- Prettier nos arquivos desta continuação aprovado. `git diff --check` global
  continua apontando somente a linha vazia extra do `.env` preexistente;
  `git diff --check -- . ':!.env'` passou. O conteúdo de `.env` não foi aberto,
  alterado ou incluído no relatório.
- Comparação HTML local testada no Chromium, com quatro resoluções e alternância
  viewport/página completa. As capturas completas usam a largura útil sem
  scrollbar; o teste temporário foi ajustado para conferir essa dimensão real.

### Evidências e pendências

Raiz local ignorada pelo Git: `artifacts/FEAT-51/correcao-home-figma/`.

- `referencia.png`: cópia da referência original, preservada.
- `antes/`: screenshots da versão efetivamente exibida em 5173 antes desta correção,
  Home com/sem vagas e perfil. `results.json` registra o hash do módulo antigo e
  os avisos de ícones. Diagnósticos intermediários foram preservados.
- `depois-final/`: capturas finais das rotas reais, com viewport e página inteira;
  `results.json` registra módulo novo, métricas, assets, requests por caminho,
  ausência de SW e console sem avisos. Sem credenciais nos dados de teste.
- `fluxos/depois/results.json`: treze fluxos isolados complementares.
- `comparacao.html`: referência, Home antiga, nova com/sem vagas e perfil antigo/novo
  lado a lado; seletor de resolução e captura completa. `comparacao-preview.png`
  permite prévia rápida. `galeria-validacao.json` registra o teste da galeria.
- `validacao/`: logs de testes/build e evidências de atualização dos módulos.

**Avaliação: APTA COM RESSALVAS PARA REVISÃO VISUAL.** A Home atual é estruturalmente
mais próxima da referência e foi conferida criticamente no endereço real, com
mudanças visíveis e mensuráveis. A resolução da imagem não permite alegar
fidelidade exata. Permanecem aprovação visual do usuário, backend/armazenamento
reais e dispositivo físico sem homologação. Nenhum commit, push, PR, merge, rebase
ou alteração da DEV. Screenshots e arquivos locais anteriores preservados.
