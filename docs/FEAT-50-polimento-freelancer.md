# FEAT-50 — Interface do freelancer

Data: 11/11/2026; revisão em 12/11/2026. Branch: `FEAT-50`. Base integrada: `be21c6ae456d023881d9860981f61b325270472b`.

## A. Status e escopo atual

**Situação inicial: PARCIALMENTE IMPLEMENTADA.** As telas e integrações já existiam; F48 e F49 forneceram tokens e shell. A primeira iteração local foi revisada pelo usuário, que solicitou uma aparência atual de plataforma, seletores de tags, apresentações separadas para tags/preços e animação na Home. Esta entrega incorpora essas solicitações.

**Situação final: interface local renovada e verificações aprovadas; F50 ainda não CONCLUÍDA.** Faltam referência Figma, decisão sobre composição desktop ampla, aprovação da equipe e integração/aceitação na DEV.

O título da Home agora é **“Seu próximo projeto começa aqui.”**, com fonte de 38px no espaço mobile e limite de 68px para espaço amplo. Entrada de 1,1 segundo, destaque atrasado em 180ms e movimento de cor em ciclo suave de 12 segundos. `prefers-reduced-motion` desativa as animações.

Escopo adicional autorizado pelo usuário:

- Tags por seleção em oportunidades, habilidades do perfil e projetos.
- “Selecionar tag” abre somente tags; “Filtros” abre tags e preços mínimo/máximo.
- Aplicação explícita; alterar ou limpar apenas a tag preserva os preços existentes.
- Reformulação visual dos cabeçalhos, cards e formulários, preservando os componentes funcionais.
- Pesquisa de oportunidades exibida somente no campo de busca, sem repetir o texto como etiqueta.
- Entradas ao rolar a Home, cards em sequência e efeitos em botões e ícones, respeitando movimento reduzido inclusive quando a preferência muda com a página aberta.

Auditoria inicial:

- Raiz: `C:/Users/jpbac/OneDrive/Documentos/TCC/Front_marujob`.
- Branch `FEAT-50` já existente; estado limpo antes da primeira iteração. As alterações seguintes pertencem a este trabalho e foram preservadas.
- `HEAD`, `DEV` e `origin/DEV` em `be21c6a`, sem diferença inicial em `DEV...HEAD`.
- Uma worktree listada. O serviço de tarefas identificou esta como a única tarefa ativa neste diretório; isso não comprova ausência de editores externos não expostos pelo serviço.
- Nenhum `AGENTS.md` aplicável localizado nos diretórios consultados.
- GitHub CLI ausente do PATH. Conector GitHub usado somente para leitura de PRs/dependências: nenhum PR aberto ou PR da F50 retornado. Integração confirmada com `merged: true` e `merged_at`, não apenas estado fechado.
- Nenhuma criação/troca de branch, integração, staging, commit, push, PR, merge ou deploy realizada.

## B. Dependências verificadas

Todas estão integradas na DEV e presentes na ancestralidade da base local. Isso comprova integração do código, não homologação com backend/dispositivos reais.

| FEAT | PR | `merged_at` UTC | Commit da entrega | Evidência na base |
| --- | --- | --- | --- | --- |
| F49 | [#97](https://github.com/MaRuJoBs/Front_marujob/pull/97) | 2026-11-11T11:17:33Z | `0dbc3aa` e `b4d9021` | Merge `be21c6a`; shell fluido, conteúdo preservado em 420px e opção `meta.layout: 'wide'` |
| F48 | [#93](https://github.com/MaRuJoBs/Front_marujob/pull/93) | 2026-11-09T17:59:12Z | `7e56184` | Merge `01394e0`; `src/styles/tokens.css` e componentes UI |
| F38 | [#92](https://github.com/MaRuJoBs/Front_marujob/pull/92) | 2026-11-04T16:06:29Z | `6f095e3` e `16d07db` | Merge `b692e87`; botão/store de favoritos compartilhados e correções de perfil/portfólio |
| F42 | [#95](https://github.com/MaRuJoBs/Front_marujob/pull/95) | 2026-11-10T16:52:10Z | `ba9ce48` | Merge `d08cb7a`; candidatura em detalhe, composable e serviço |
| F47 | [#96](https://github.com/MaRuJoBs/Front_marujob/pull/96) | 2026-11-10T17:36:30Z | `a950133` e `fe98cf9` | Merge `dc33fe9`; complementos estruturados e modalidade legada |
| F40 | [#90](https://github.com/MaRuJoBs/Front_marujob/pull/90) | 2026-11-03T17:47:13Z | `e712839` | Merge `10975eb`; perfil e portfólio com dados reais |

F48 usa contrato provisório. Seus nomes e escala de espaços, raios, alturas e foco são reutilizados. A paleta solicitada, Poppins, superfícies neutras e sombras suaves são aplicados somente aos componentes do freelancer, pelo arquivo `freelancer.css` importado com `<style scoped src>`. Não há alteração de CSS global existente nem ativação de tokens em `:root`.

## C. Arquivos e resultado visual

| Arquivo | Problema e alteração |
| --- | --- |
| `src/components/HomeComponent.vue` | Cabeçalho e hero renovados; título solicitado, maior e animado; destaque respeita movimento reduzido. Cards com ícone/categoria, título em até três linhas, valor formatado, duração alinhada e CTA leve. Dados, ranking, slides e quantidade de oportunidades preservados |
| `src/components/OportunidadeComponent.vue` | Cabeçalho mais leve, busca, resumo de resultados e grid adaptável. Cards padronizados, preços com moeda, título com tratamento para textos longos e CTA. Tags das oportunidades carregadas alimentam o seletor e o botão específico abre somente tags |
| `src/components/Filtros.vue` | Texto livre substituído por `select`; opções reutilizam `categoriasVaga`, tags recebidas e seleção atual. Duas apresentações do mesmo painel: tags isoladas ou tags com preços. Foco/Tab/Escape/retorno adaptados ao select e ao acionador original; aplicar/limpar tag mantém preços |
| `src/components/FavoritosComponent.vue` | Mesma identidade dos cards, preços e CTAs; grid adaptável, títulos tratados e estados mantidos. Store e persistência intactos |
| `src/components/PerfilComponent.vue` | Cabeçalho claro, foto/ícones, hierarquia e seções organizadas; habilidades e projetos com apresentação consistente. Dados e autenticação preservados |
| `src/components/EditarPerfil.vue` | Formulário agrupado com labels, foco e erros; habilidades por seleção, sem digitação livre. Itens já cadastrados são mantidos, opções selecionadas não se repetem e habilidades antigas removidas podem ser selecionadas novamente durante a edição. O composable original continua validando, adicionando, removendo e salvando |
| `src/components/PortfolioComponent.vue` | Cabeçalho claro, busca acessível, grid e imagens proporcionais; cards e estados renovados. Mesma pesquisa e lista de projetos |
| `src/components/FiltrosPortifolio.vue` | Mantém categorias/tecnologias derivadas dos projetos e checkboxes existentes; nomes acessíveis, foco, seleção e painel adaptados |
| `src/components/PortfolioDetalheComponent.vue` | Imagem e descrição legíveis; informações opcionais vazias ocultas visualmente; ações consistentes e retorno nomeado. CRUD intacto |
| `src/components/PortfolioAdicionarComponent.vue` | Categoria e tecnologias/tags por seleção; categoria e tags antigas carregadas permanecem representadas. Seleção usa os métodos de validação/adição originais. Formulário e prévia reorganizados para ocupar o espaço disponível |
| `src/views/HomeView.vue` | Passa a apresentar o cabeçalho local da Home; `Header.vue` compartilhado permanece intacto |
| `src/views/FreelancesView.vue` | Remove o limite local redundante de 420px, mantendo a largura imposta pelo shell da F49 |
| `src/styles/freelancer.css` | Apresentação comum às telas autorizadas, importada com escopo Vue. Reutiliza tokens F48 e evita repetir a mesma base visual em nove componentes |
| `src/utils/tags.js` | Opções sugeridas da interface e deduplicação de opções. Não é catálogo oficial da API nem dados fictícios de usuários. Complementa opções com valores reais já carregados; não faz requisições |
| `tests/favoritos.browser.mjs` | Interação atualizada para `change` do select; verificação de títulos passou a consultar `h2`, evitando asserção vazia no seletor antigo |
| `tests/freelancer-visual.browser.mjs` | Páginas e shell reais com transporte isolado. Verifica apresentações dos filtros, preservação de preços, habilidades, valores antigos, payloads existentes, movimento reduzido e responsividade |
| Este relatório | Auditoria, resultados, evidências e pendências atualizados |

Não foram alterados App, router, tokens globais existentes, componentes da empresa, dependências, stores, composables, serviços ou backend. As alterações de lógica local são limitadas à interação expressamente solicitada: selecionar/adicionar/remover opções, alternar a apresentação do painel e apresentar valores.

Risco de conflito: nenhum PR aberto foi retornado na consulta; estes arquivos foram historicamente modificados por F38/F40/F42/F47. Trabalho futuro nesses componentes exige coordenação. A edição real de projeto continua usando `PortfolioAdicionarComponent.vue`; os antigos `PortfolioEditarComponent.vue`/`PortfolioEditarView.vue`, fora da rota efetiva, permanecem intactos.

## D. Comparação visual

Figma não fornecido nem encontrado no repositório/PRs consultados. Não foi declarada correspondência com frames aprovados. A direção visual atual segue os pedidos posteriores do usuário.

- [Galeria local antes/depois](../node_modules/.cache/feat50-visual/comparacao.html).
- [Resultados antes](../node_modules/.cache/feat50-visual/antes/results.json) e [resultados depois](../node_modules/.cache/feat50-visual/depois/results.json).
- [Contrastes de referência](../node_modules/.cache/feat50-visual/contrastes.json).

Dez rotas: Home, oportunidades, detalhe, favoritos, perfil, edição do perfil, portfólio, detalhe de projeto, adicionar e editar projeto. Verificadas em **375, 430, 768, 1024 e 1440px**. Também há 19 estados de conteúdo vazio/carregamento/erro, cinco apresentações completas dos filtros em viewport de 600px de altura, seleção só de tags, habilidades, projetos, foco, erro e movimento reduzido.

O roteiro final possui **79 registros aprovados**. A galeria contém 74 pares com a base original, além das novas capturas de seleção e validação. Capturas completas mostram a navegação fixa na posição do primeiro viewport; o roteiro verifica separadamente a última ação após rolar ao final e a visibilidade do botão Aplicar acima da navegação.

**Desktop amplo permanece pendente.** O shell da F49 limita o conteúdo a 420px enquanto a rota não opta por `meta.layout: 'wide'`. A autorização específica para editar o arquivo compartilhado de rotas foi solicitada e não recebida. Os grids e formulários locais aproveitam espaço disponível, mas esta entrega não afirma que a composição desktop ampla está ativa. O router e o shell não foram contornados com CSS global.

## E. Validações reais

| Verificação | Resultado |
| --- | --- |
| Build | **APROVADO** — `npm.cmd run build`, saída 0, incluindo PWA; execução autorizada fora da sandbox com `NODE_OPTIONS=--preserve-symlinks --preserve-symlinks-main` temporário. Aviso preexistente de Browserslist antigo mantido |
| Lint | **NÃO EXECUTADO** — não existe script de lint no `package.json` |
| Testes automatizados | **APROVADO — 227/227**, `npm.cmd test` |
| Favoritos no navegador | **APROVADO — 13/13 cenários e 20 verificações de layout**, incluindo o filtro nativo por seleção |
| Perfil/portfólio no navegador | **APROVADO — 24/24 cenários responsivos** |
| Roteiro visual F50 | **APROVADO — 79 registros**, incluindo aplicação explícita, preservação de preços ao alterar/limpar tag e retorno de foco ao acionador correto |
| Seleção e contratos | **APROVADO nos cenários isolados** — habilidades sem duplicação; opção antiga recuperável; PATCH de perfil com array de strings; POST de projeto com categoria/tags no mesmo formato; categoria e tags antigas representadas na edição |
| Inspeção visual | **APROVADO no escopo local** — capturas reais de Chrome revisadas; Figma **NÃO EXECUTADO** por ausência de material |
| Responsividade | **APROVADO no layout atual** nas cinco larguras; sem overflow horizontal indevido, imagens quebradas ou ações finais cobertas. Desktop amplo pendente |
| Animação | **APROVADO** — título, entradas ao rolar, cards em sequência e desativação sob movimento reduzido, inclusive ao mudar a preferência com a página aberta |
| `git diff --check` | **APROVADO** — sem erros de whitespace |

Dados simulados existem somente no roteiro de teste. As mutações do cenário de seleção são respondidas por adapter em memória; não acessam API ou contas reais. Backend, uploads reais, câmera, GPS, teclado virtual e persistência remota dependem de homologação própria. Os testes existentes de integração e as validações originais dos composables foram mantidos.

Na revisão de 12/11, o build com PWA e os **227 testes automatizados** passaram novamente. O roteiro `--checks-only` passou com **11 registros**, incluindo busca sem etiqueta, limpeza da pesquisa, animações ao rolar e mudança de preferência de movimento. Essa execução atualizou o arquivo local `depois/results.json`; os 79 registros acima se referem à execução completa anterior.

## F. Riscos e pendências

1. Figma e aprovação visual final da equipe não estão disponíveis.
2. Ativação desktop ampla depende da autorização pendente para `src/router/routes.js`, seguida de nova validação no shell amplo.
3. Sugestões de habilidades/tecnologias são opções do frontend. Um futuro catálogo oficial deve substituí-las quando existir contrato próprio, preservando valores antigos.
4. A consulta de oportunidades não oferece, no frontend atual, endpoint de catálogo de tags. O seletor reúne as categorias já existentes e tags da página carregada; não afirma descobrir todas as tags históricas de todas as páginas.
5. Acessibilidade foi melhorada e verificada nos cenários descritos; não há certificação WCAG completa nem teste com leitor de tela/dispositivos físicos.
6. O filtro de portfólio já não possuía contenção completa de Tab/Escape e gestão de foco. Essa mudança funcional permanece separada.
7. Limitações de homologação e falha Windows no build isolado F48 documentadas pelas dependências não foram corrigidas aqui; o build da aplicação passou.
8. F50 só pode ser marcada CONCLUÍDA após aprovação, integração do PR à DEV e aceitação dos testes. Não houve publicação.

## G. Diff e entrega

**18 arquivos no escopo do commit**: 11 componentes, duas views do freelancer, base de estilos scoped, opções de tags, dois roteiros de navegador e este relatório.

- [Patch completo local](../node_modules/.cache/feat50-visual/FEAT-50.patch), incluindo novos arquivos.
- `git diff` e `git diff --stat`: arquivos rastreados.
- `git status --short`: também identifica os quatro arquivos novos.

Comandos principais:

```powershell
git rev-parse --show-toplevel
git status --short
git branch --show-current
git worktree list --porcelain
git log DEV --oneline -20
git rev-parse HEAD DEV origin/DEV
git diff --stat DEV...HEAD
npm.cmd test
# Execução autorizada fora da sandbox para build/Chrome:
$env:NODE_OPTIONS='--preserve-symlinks --preserve-symlinks-main'
npm.cmd run build
node tests/freelancer-visual.browser.mjs --baseline
node tests/freelancer-visual.browser.mjs
npm.cmd run test:favoritos:browser
npm.cmd run test:perfil-portfolio:browser
git diff --check
git diff --stat
git diff
```

`--baseline` lê `be21c6a` sem trocar branch; pode ser substituído por `F50_BASE_REF`. `--checks-only` executa as verificações de interação, filtros, seleção, foco e animação. PNGs e JSONs são regeneráveis pelo roteiro. Galeria, logs e auxiliares locais ficam em `node_modules/.cache/`, ignorado pelo Git.

Em 12/11/2026, o usuário autorizou commit e abertura de PR. A entrega segue pela branch `FEAT-50` para revisão na `DEV`, com push necessário à abertura do PR. Merge e deploy não fazem parte desta solicitação.
