# FEAT-49 — Responsividade global

> Registro da implementação inicial do PR #97. A auditoria posterior identificou
> regressões de proporção e reserva inferior. O comportamento corrigido e as novas
> evidências estão em [Auditoria de regressões](FEAT-49-auditoria-regressoes.md).

## Preparação e auditoria

Repositório MaRuJoBs/Front_marujob, worktree única, inicialmente limpa na FEAT-47.
`git fetch origin --prune` executado. Branch FEAT-49 criada após autorização com
`git switch -c FEAT-49 origin/DEV`, base `dc33fe9235e6b544a7fdc1cd6a3273925d83adea`.
Nenhum trabalho preexistente sobrescrito; sem rebase, commit, push, merge ou deploy.

Consulta GitHub: `GET /repos/MaRuJoBs/Front_marujob/pulls?state=all&per_page=100&page=1`:
39 PRs (menos de uma página), nenhum aberto, 37 com merged_at e dois fechados sem
merge (#1 e #15). Títulos, corpos e branches pesquisados por responsividade, layout,
shell, tablet, desktop e F45–F51. Branches locais/remotas e histórico de todos os refs
inspecionados. Nenhuma implementação F49 equivalente localizada.

Dependências confirmadas por merged_at: F38/#92 (04/11), F42/#95 (10/11),
F46/#94 (09/11), F47/#96 (10/11), F48/#93 (09/11), em 2026, presentes na DEV.
F45 não localizada em PR/branch/commit sob esse nome; não há rota de diretório
profissional no routes.js. F50/F51 não localizadas nem incorporadas informalmente.
Esses merges não comprovam todos os fluxos funcionais: testes executados abaixo.

Classificação inicial: **PARCIAL**. Media queries locais, EmpresaHeader, safe area
empresarial e tokens F48 já existiam. App limitava todas as rotas a 420px; ambos os
footers fixos tinham o mesmo limite e não havia reserva inferior global. Header
usava slogan de 370px com margem de 10vw, podendo ultrapassar o celular pequeno.
EmpresaHeader só reduzia sua marca abaixo de 360px, insuficiente com botão Voltar.

## Implementação e limites

- `src/App.vue`: ativa tokens F48 via `.mrj-ui`, importa shell.css, agrupa RouterView
  (inclusive páginas com múltiplas raízes) e reserva navegação somente nas rotas
  autenticadas que não usam hideFooter. Remove reset scoped redundante que anulava
  padding do shell; o reset global existente permanece. Nenhuma mudança de sessão.
- `src/styles/shell.css`: shell fluido centralizado até 75rem (1200px), altura mínima
  100dvh com fallback 100vh, min-width:0 no conteúdo, reserva de 85px + safe area.
  Navegação fixa acompanha o shell, sem ocultar overflow para disfarçar problemas.
  A partir de 48rem, links ficam em linha, reutilizando o breakpoint do BaseCard F48.
  Altura de 85px preserva a dimensão anterior do footer freelancer; empresa passa
  de 76 para 85px para compartilhar a reserva. Não há novo sistema de cores/tokens.
- `Header.vue`: slogan fluido até 370px, altura limitada entre 200 e 320px, logo
  dentro do container, ação Favoritos com nome acessível, alvo mínimo e foco F48.
- `EmpresaHeader.vue`: adapta marca e espaçamentos até 479px, preservando links e
  botão Voltar. Nenhuma segunda navegação criada.
- `Footer.vue` / `FooterEmpresaComponent.vue`: classe estrutural compartilhada e
  identificação acessível. Links, logout, ícones e regras de exibição preservados.
- `tests/responsividade.browser.mjs`: Chrome/CDP e Vite já disponíveis, sem novas
  dependências. Usa App/headers/footers reais com sessão e transporte em memória.

Impacto: mobile mantém navegação inferior; tablet/desktop aproveitam até 1200px,
com links horizontais e rodapé alinhado. Páginas não recebem grid/refatoração local.
Riscos: ativação das variáveis F48 por herança e remoção do limite de 420px expõem
limitações locais antes mascaradas. Há padding inferior local em páginas antigas;
somado à reserva global pode deixar espaço extra, intencionalmente não removido
nesta entrega para evitar alterações indiscriminadas em F50/F51.

## Evidências e testes

Comandos executados:

- `npm test`: 227/227 aprovados.
- `node --test tests/*.test.mjs`: 248/249 aprovados. Falha conhecida F48:
  `UNRESOLVED_ENTRY`, `Could not resolve entry module
  "../../../../C:/Users/Ricardo/Documents/Front_marujob/node_modules/.cache/feat48-compiled/entry.mjs"`.
  Uso de URL.pathname em Windows, não modificado pela F49.
- `npm run build` com NODE_OPTIONS temporário
  `--preserve-symlinks --preserve-symlinks-main`: aprovado fora do sandbox.
  Dentro dele: `Cannot read directory "../..": Access is denied` e falha para
  resolver vite.config.js. Nenhuma configuração global alterada. Aviso Browserslist
  desatualizado permanece, sem atualizar dependências.
- `node tests/responsividade.browser.mjs`: 10 cenários de shell (duas contas ×
  360/390/768/1024/1440px), com ausência de overflow, largura disponível descontando
  scrollbar Windows, alvos ≥44px, foco por teclado, clique em links e troca de rota,
  hideFooter sem reserva e última ação visível após rolagem até o fim.
  Menu details é fixture de teste, não novo menu de produto.
- Mais 20 cenários com páginas reais: /home, /freelances, /homeEmpresa e /criar-vaga
  nos mesmos breakpoints, API simulada com listas vazias; sem overflow horizontal.
  Isso não valida cards preenchidos, todos os menus de páginas ou backend real.
- `git diff --check`: sem erros. `git diff --stat` e `git status --short` revisados.

Screenshots e resultados locais em `node_modules/.cache/feat49-browser/`:
`usuario-{largura}.png`, `empresa-{largura}.png`,
`real-home-{largura}.png`, `real-freelances-{largura}.png`,
`real-homeEmpresa-{largura}.png`, `real-criar-vaga-{largura}.png` e `results.json`.
Capturas inspecionadas em celular e desktop. Artefatos ignorados pelo Git; podem
ser regenerados pelo comando. Teste inicial no sandbox não conseguiu abrir CDP;
repetição autorizada fora dele funcionou. Ajustes do teste descontaram scrollbar
Windows e acionaram teclado antes de verificar :focus-visible.

## Pendências e entrega

- F50/F51: larguras locais de 420px em listagem/favoritos/portfólio, grids e
  composição de páginas desktop, botões e overlays específicos. Nenhuma página
  ou fluxo de negócio alterado. A home empresa ainda estica seu botão local.
- Safe area implementada em CSS; teclado virtual e aparelhos físicos com notch
  não testados. Chrome headless desktop não representa esses recursos físicos.
- Testes reais autenticados com backend, todos os estados preenchidos/erro e
  revisão visual da equipe permanecem necessários. Sem afirmação de validação
  completa de todos os fluxos só por build ou presença de arquivos.
- Diff verificável: `git diff origin/DEV -- src/App.vue src/components/Header.vue
  src/components/EmpresaHeader.vue src/components/Footer.vue src/components/FooterEmpresaComponent.vue`.
  Novos arquivos shell.css, teste browser e este relatório estão sem staging e
  devem ser incluídos na revisão diretamente. Nenhum service/store/payload alterado.

**Veredito: PRONTA COM RESSALVAS para revisão**, pelos limites locais de F50/F51,
teste F48 incompatível com Windows e validação física/manual pendente.
Após a revisão, o usuário autorizou commit, push e abertura do PR. Título:
`FEAT-49: implementar responsividade global do frontend`, base DEV, compare FEAT-49.
