# FEAT-51 — Polimento visual da empresa

> **Situação vigente em 2026-11-12: APTA COM RESSALVAS para commit local.** Os dois apontamentos locais de acessibilidade foram corrigidos na continuação registrada em “Últimas correções de acessibilidade antes do commit”; as ressalvas externas permanecem. A seção “Finalização e homologação — 2026-11-12” ao final contém os resultados desta execução. As auditorias anteriores são histórico; não substituem esta conclusão. A largura desktop continua dependendo de FIX separada.

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
