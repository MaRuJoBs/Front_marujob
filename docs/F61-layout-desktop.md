# F61 · Layout completo para desktop

> **Ponto de retomada.** Situação atual: **Fases 2–6 concluídas · aguardando a aprovação da PARADA 2.** Fases 7 (integração/testes/capturas finais) e 8 (documentação final) pendentes. Branch `feat-61` criada a partir de `origin/DEV` (`4906dae`) por pedido do usuário.

## Fase 0 · Git e branch

| Verificação | Resultado |
| --- | --- |
| Repositório | `Front_marujob` (`origin https://github.com/MaRuJoBs/Front_marujob.git`) |
| Branch atual | `DEV`, HEAD `4906dae` = `origin/DEV` após `git fetch origin --prune` |
| Alterações locais preexistentes | `M .env` e `?? referencias/` (`footer.png`, `image.png`, mockups mobile do Figma). **Não foram tocadas.** |
| Branch/PR de F61 ou desktop | Nenhuma branch `F61`/`feat-61`. Existe `FIX-49-layout-desktop-empresa`, já incorporada à DEV via FEAT-51 (ancestral de `origin/DEV`). PRs com "desktop": nenhum de F61 |
| Worktrees | DEV (esta), FEAT-57, FEAT-60, FIX-49 (diretório removido) e dois `/tmp` *prunable*. Nenhum em uso pela F61 |

Branch criada com `git switch -c feat-61 origin/DEV`, a pedido do usuário. Como o HEAD já era `origin/DEV`, nenhum arquivo mudou. O `.env` modificado e os arquivos não rastreados continuam como estavam, sem commit. O upstream automático (`origin/DEV`) foi removido com `git branch --unset-upstream`, a pedido do usuário. Ele só será configurado no push, com `git push -u origin feat-61`, quando o usuário autorizar.

### Histórico relevante

- **F49** (PR #97, #107): shell com coluna de `26.25rem` (420 px) e o modo `.app--wide` opt-in por `route.meta.layout === 'wide'` (75 rem a partir de 48 rem).
- **FIX-49 / F51** (`c4037d1`): habilitou `wide` nas rotas empresariais. **`a5cf812` (F51 final) reverteu para o shell compacto** e criou o teste `rotas empresariais preservam o shell de aplicativo sem layout wide` (`tests/perfil-empresa.test.mjs:172`).
- **F59** (`027887e`): ativou `wide` na Home freelancer. **`b01eb74` reverteu** (removeu `layout: 'wide'` de `/home` e o ajuste do Footer) porque o resultado ampliado gerou elementos gigantes. Hoje **nenhuma rota usa `wide`**.
- **F56/chat**: `/mensagens` é uma coluna `position: fixed` com a largura do app. Com `?room=`, o `App.vue` esconde o rodapé e a conversa ocupa a tela.

## Fase 1 · Diagnóstico e baseline

### Shell atual

| Regra | Onde | Classificação |
| --- | --- | --- |
| `.app` `--mrj-content-width: 26.25rem` → `.app-content max-width` | `shell.css` | **Adaptar**: limite continua até 1023 px nas páginas não migradas; amplia no desktop por opt-in |
| `.app--wide` (75 rem a partir de 48 rem) por `meta.layout === 'wide'` | `App.vue`, `shell.css` | **Reaproveitar** como opt-in por rota |
| `.app--navigation` padding inferior, `--mrj-page-reserve`, `paginasComReserva` | `App.vue`, `shell.css` | **Exclusiva do mobile/tablet**: no desktop sem barra inferior a reserva zera |
| `.app--empresa` força `--mrj-shell-width: 26.25rem` | `shell.css` | **Adaptar**: só abaixo de 1024 px |
| `.app .app-navigation` fixa, centrada, safe area | `shell.css`, `Footer.vue`, `FooterEmpresaComponent.vue` | **Exclusiva do mobile/tablet**: oculta ≥ 1024 px |
| `rodapeOculto` (`hideFooter` ou `mensagens?room=`) | `App.vue` | **Preservar** para a barra inferior; a navegação desktop usa outra condição |
| `.mensagens` `position: fixed`, largura do app, `visualViewport` para teclado | `MensagensView.vue` | **Exclusiva do mobile**; no desktop vira grade de duas colunas no fluxo |
| Foco no `h1` a cada troca de rota, link "Pular para o conteúdo" | `App.vue` | **Reaproveitar** |

### Baseline de testes (DEV `4906dae`, sem alterações)

Ambiente: WSL2 (5 GB), Node 26.13.1. O Chrome do Windows não é acessível pelo CDP a partir do WSL (rede NAT). Por isso os roteiros usaram o Chromium Linux já existente no cache do Playwright (`~/.cache/ms-playwright/chromium-1254`, nada instalado), via `CHROME_BIN` apontando para um *wrapper* local, fora do repositório. O wrapper coloca o perfil do navegador no disco Linux (o perfil em `/mnt/c` causava timeouts de CDP) e espelha `DevToolsActivePort`. Execuções uma de cada vez.

| Comando | Resultado | Observação |
| --- | --- | --- |
| `npm test` | **275/275** | |
| `npm run build` | **OK**, precache 95 entradas | |
| `node tests/responsividade.browser.mjs` | **OK** | duas primeiras tentativas com timeout de ambiente (perfil em `/mnt/c`); aprovado com perfil no disco Linux |
| `node tests/responsividade.browser.mjs --matriz-atual` | **OK** | |
| `node tests/freelancer-visual.browser.mjs` | **OK** | |
| `node tests/freelancers-publicos.browser.mjs` | **OK** | |
| `node tests/localizacao-empresa.browser.mjs` | **OK** | |
| `node tests/notificacoes.browser.mjs --pwa` | **OK** | 1ª execução falhou só porque o wrapper não espelhava `DevToolsActivePort` |
| `node tests/acessibilidade.browser.mjs` | **Falha preexistente F43** | `:417` `aria-busy` em `/empresa/notificacoes` |
| `node tests/gerenciamentoVagas.browser.mjs` | **Falha preexistente F43** | espera 6 erros obrigatórios; contrato atual tem 5 |
| `node tests/vagas.browser.mjs` | **Falha preexistente F43** | mesma expectativa de 6 obrigatórios |
| `node tests/empresa-visual.browser.mjs` | **Falha preexistente** | `:322` espera a barra empresarial encostada nas bordas (`left 0`, 305 px); a barra hoje é flutuante (`left 12`, 281 px) |
| `node tests/perfil-portfolio.browser.mjs` | **Falha preexistente (harness)** | o runner monta `App.vue` sem Pinia; o App usa stores desde F56/F57 |
| `node tests/favoritos.browser.mjs` | **Falha preexistente** | etapas 1–4 aprovadas; falha na troca de sessão: "A sessão foi encerrada ou substituída" |
| `node tests/design-system.browser.mjs` | **Falha preexistente** | `:200`, a mesma já registrada na F59 (clique após Enter via CDP) |
| `node tests/oportunidades.browser.mjs` | **Não executável no ambiente** | exige ponte CDP do Chrome Windows via PowerShell |

### Capturas "antes"

`docs/evidencias/f61/completo/antes/` (movidas de `docs/F61/screenshots/antes/` a pedido do usuário), geradas por `node tests/f61-capturas.browser.mjs --fase antes` (novo, só leitura, shell/rotas/componentes reais com fixtures em memória `tests/fixtures/f61-desktop.js`). 19 telas × 390×844, 1366×768 e 1920×1080, viewport (`<tela>-<largura>.png`) e página inteira (`-completa.png`), mais `medidas.json`. 0 erros de navegador, 0 overflow horizontal. Telas: Home freelancer, Oportunidades, Detalhe, Favoritos, Perfil, Portfólio, Mensagens lista/conversa (freelancer e empresa), Notificações (freelancer e empresa), Home empresa (inclui o gerenciamento de vagas na captura completa), Criar vaga, Busca de freelancers, Perfil empresarial, Login, Cadastro freelancer e empresa.

**Medida:** `.app-content` = **420 px em todas as 19 telas a 1366 e 1920 px**; barra inferior flutuante presente no desktop; nenhuma navegação desktop.

### Diagnóstico por página

Mobile hoje: coluna fluida até 420 px, barra inferior flutuante. Desktop hoje (todas): mesma coluna de 420 px centralizada, ~70% da tela vazia, barra inferior flutuando sobre o conteúdo.

| Página | Problema no desktop | Solução planejada | Arquivos | Risco |
| --- | --- | --- | --- | --- |
| Shell/navegação | Barra de app de celular, sem navegação desktop | Sidebar desktop ≥ 1024 px configurada por tipo de conta; barra inferior oculta ≥ 1024 px | `App.vue`, `shell.css`, `tokens.css`, novo `DesktopNav.vue` + `navegacaoDesktop.js` | Médio (shell de todas as rotas) |
| Home freelancer | Título e cards num tubo de 420 px | Hero compacto (título `clamp()` com teto e `max-width` em `ch`), destaques em grade, grid 2–3 colunas | `HomeComponent.vue`, `routes.js` | **Alto** (regressão da F59) |
| Oportunidades | Lista de uma coluna | Grid `minmax()` 2–3 colunas; busca/filtros no cabeçalho em linha | `OportunidadeComponent.vue` | Médio |
| Detalhe da oportunidade | Coluna única; `OportunidadeDetalheView` com 420 px | Coluna principal + lateral (pagamento, modalidade, candidatura) | `OportunidadeDetalheComponent.vue` | Médio (candidatura) |
| Favoritos | `FavoritosView .page { max-width: 420px }` | Grid de cards | `FavoritosComponent.vue`, `FavoritosView.vue` | Baixo |
| Perfil / Portfólio | Coluna única | Cabeçalho + seções em 2 colunas; grid de projetos com `aspect-ratio` | `PerfilComponent.vue`, `PortfolioComponent.vue`, `PortfolioDetalheComponent.vue` | Baixo |
| Mensagens | Lista **ou** conversa, coluna de 420 px fixa | Duas colunas (`RoomList` + `ChatPane`) no fluxo ≥ 1024 px | `MensagensView.vue`, `App.vue` | **Alto** (chat) |
| Notificações | Coluna única | Largura de leitura + cards em 2 colunas | `NotificacoesFreelancerView.vue`, `NotificacoesEmpresaView.vue` | Baixo |
| Home empresa / gerenciamento | Painel espremido | Painel: boas-vindas + última vaga lado a lado, filtros em linha, grid de vagas | `HomeEmpresaComponent.vue` | Médio |
| Criar/editar vaga, detalhe | Formulário longo de uma coluna; barra fixa de 420 px | Grupos em 2 colunas onde fizer sentido; barra alinhada ao conteúdo | `CriarVagaComponent.vue`, `DetalheVagaEmpresaView.vue` | Médio (sem tocar validação) |
| Busca de freelancers / perfil público | 1 coluna (CSS próprio já prevê 1100 px, mas o ancestral limita) | Grid de cards | `freelancers-publicos.css`, views | Baixo |
| Perfil empresarial / configurações | Limitado pelo ancestral (local 760 px) | Liberar ancestral; seções em 2 colunas | `PerfilEmpresaView.vue`, `ConfiguracoesEmpresaView.vue` | Baixo |
| Login / cadastros / senhas | Formulário de celular no meio da tela | Painel de marca + cartão de formulário (≤ 28–32 rem) | `login.vue`, `Register*.vue`, `DefinirSenha`, `TrocarSenha` | Médio (Google) |

### Arquitetura proposta (para aprovação)

1. **`src/components/DesktopNav.vue`** + **`src/components/navegacaoDesktop.js`**: um único componente; os itens por tipo (`usuario`/`empresa`) ficam num array de configuração. Usa `router-link` (com `aria-current="page"`), `<nav aria-label>`, `IndicadorAvisos` (reutiliza as stores) e o `logout` existente para "Sair". Sidebar **fixa à esquerda** (≈ 15 rem; 16 rem ≥ 1440 px), com marca no topo.
2. **`App.vue`**: renderiza `DesktopNav` quando há sessão e a rota não é pública. Classe `.app--desktop-nav`. A barra inferior continua com a regra atual (`rodapeOculto`) e é ocultada por CSS ≥ 1024 px. Abaixo de 1024 px a sidebar fica `display: none` (fora da árvore de acessibilidade): **nunca duas navegações visíveis**.
3. **`shell.css`**: ≥ 1024 px, `.app` passa a ser grade `sidebar | conteúdo`; `.app-content` com `max-width` controlado por tokens (≈ 72 rem; 80 rem ≥ 1440 px; centralizado, sem esticar > 1920 px). Reserva da barra inferior e `.app--empresa` compacto só abaixo de 1024 px. Páginas **não migradas** continuam em 420 px dentro da área de conteúdo até serem adaptadas (opt-in `meta.layout: 'wide'`, rota a rota).
4. **`tokens.css`**: novo bloco de layout (`--mrj-layout-sidebar-width`, `--mrj-layout-content-max`, `--mrj-layout-content-max-wide`, `--mrj-layout-gutter`), escopado em `.app` (sem publicar em `:root`, mantendo o contrato opt-in da F48). Breakpoints documentados ali (custom properties não funcionam em `@media`): 48 rem (768), 64 rem (1024), 90 rem (1440), 120 rem (1920).
5. **Chat**: `MensagensView` ganha um booleano reativo de `matchMedia('(min-width: 64rem)')`; no desktop renderiza `RoomList` (`active-id` = sala da URL) + `ChatPane` ou um estado "selecione uma conversa", na mesma instância e com o mesmo store. O WebSocket continua sendo aberto só no `App.vue`, então não há conexão duplicada. Abaixo de 1024 px o template atual fica intacto.

### Pontos que exigem decisão

- **"Gerenciar vagas" (empresa)** não tem rota própria: é a seção "Vagas da empresa" de `/homeEmpresa`. Proposta: não criar rota; registrar como pendência (ou link para `/homeEmpresa#vagas-empresa`, se aprovado).
- **"Configurações" (empresa)** existe (`/empresa/configuracoes`). Todas as rotas do freelancer existem.
- **Contratos de teste que mudam**: `tests/perfil-empresa.test.mjs:172` exige que as rotas empresariais **não** tenham `layout: 'wide'` (decisão F51), e `tests/notificacoes.test.mjs:173/756` + `tests/perfil-empresa.test.mjs:146` comparam o `meta` inteiro. Ao migrar as rotas, essas expectativas precisam ser atualizadas para o novo contrato desktop (mantendo `requiresAuth`/`tipo`/`hideFooter`).
- **Roteiros de navegador com expectativas de 420 px no desktop** (`responsividade`, `empresa-visual`) precisarão de atualização na Fase 7, mantendo as verificações mobile.

## PARADA 1 · decisões do usuário

1. Sidebar fixa à esquerda: aprovada.
2. "Gerenciar vagas" = link âncora `/homeEmpresa#vagas-empresa`; "Painel" e "Gerenciar vagas" nunca ficam `aria-current` ao mesmo tempo.
3. Contratos de teste podem ser atualizados. Em `tests/perfil-empresa.test.mjs:172` a intenção da F51 (área empresarial compacta) deve continuar verificada abaixo de 1024 px.
4. Avaliar sidebar recolhida (ícones + dica) entre 1024 e 1279 px. Chat em duas colunas comprovado em 1024×768.
5. Evidências no padrão da F59: `docs/evidencias/f61/`. Conjunto completo em `docs/evidencias/f61/completo/`, fora do git via `.git/info/exclude` (o `.gitignore` não foi alterado). No final, só uma seleção (telas principais em 390 e 1366, antes e depois) em `docs/evidencias/f61/antes/` e `docs/evidencias/f61/depois/`.
6. Causa da falha do `favoritos.browser.mjs`: ver abaixo.

### Causa da falha do `favoritos.browser.mjs` (preexistente, não é do WSL)

O roteiro (`tests/favoritos.browser.mjs:298`) executa `feat38.sair(); feat38.entrar(38)` sem aguardar o `sair()`. Desde a F60 (`ca038c7`), `logout()` (`src/services/authService.js:124`) é assíncrono quando há Web Push: `encerrarPush()` devolve uma promessa e só no `.then(finalizar)` o `limparSessao()` incrementa `sessao.revisao`. O `login()` seguinte guarda a revisão antes disso. Quando o logout pendente termina, a revisão muda e `login`/`iniciarSessao` rejeitam com "A sessão foi encerrada ou substituída." (guarda intencional contra sessões concorrentes). `pushSuportado()` é verdadeiro em qualquer Chrome em contexto seguro (`127.0.0.1`), inclusive no Windows. Portanto a falha é determinística e vem do roteiro F38 escrito para o logout síncrono. Não é efeito do ambiente WSL nem da F61.

## Fase 2 · Shell e navegação desktop

### Arquivos

| Arquivo | Mudança |
| --- | --- |
| `src/styles/tokens.css` | Bloco `.app` com tokens de layout (`--mrj-layout-sidebar-compact` 4.5rem, `--mrj-layout-sidebar-expanded` 15rem, `--mrj-layout-content-max` 72rem, `--mrj-layout-content-max-wide` 80rem, `--mrj-layout-gutter`) e a tabela de breakpoints em comentário. Sem `:root` |
| `src/styles/shell.css` | Só `@media (min-width: 64rem/80rem/90rem)` com `.app--desktop-nav`: `padding-left` da sidebar, reservas da barra inferior zeradas, barra inferior oculta, largura de conteúdo desktop para rotas `wide` |
| `src/components/navegacaoDesktop.js` (novo) | Configuração dos itens por tipo de conta (somente rotas existentes) e `itemAtivo()`: um único item ativo, desempatado pelo hash |
| `src/components/DesktopNav.vue` (novo) | Sidebar única para freelancer e empresa. `<nav aria-label>`, `aria-current="page"` só no item ativo (a marca usa `router-link custom` para não receber `aria-current`), indicadores via `IndicadorAvisos`, "Sair" (empresa, mesma ação do footer). 1024–1279 px recolhida: rótulo visualmente oculto, mas no DOM (nome acessível com a contagem de não lidos), exibido como dica no `:hover`/`:focus-visible`. ≥ 1280 px expandida |
| `src/components/IndicadorAvisos.vue` | Prop `candidaturasEmpresa` (só `contador.total`) para "Notificações" da empresa. As variantes existentes não mudam |
| `src/App.vue` | `navegacaoDesktop = sessao.usuario && !route.meta.publica` → classe `.app--desktop-nav` + `<DesktopNav>` antes do conteúdo (ordem de Tab: pular conteúdo → navegação → página). `rodapeOculto` e a barra inferior intocados |
| `src/components/HomeEmpresaComponent.vue` | `id="vagas-empresa"` na seção "Vagas da empresa" (`h2 tabindex="-1"`). Com `#vagas-empresa`, após carregar, rola e foca a seção (ou "Última vaga publicada" quando não há vagas). Ao voltar para "Painel", volta ao topo |

Nome acessível dos itens recolhidos: usado o texto do rótulo (oculto visualmente) em vez de `aria-label`. Um `aria-label` substituiria o conteúdo e o leitor de tela perderia a contagem de não lidos (", 2 avisos não lidos") que o `IndicadorAvisos` acrescenta. O resultado acessível é o mesmo nome ("Mensagens, 2 avisos não lidos").

Nenhuma rota recebeu `layout: 'wide'` nesta fase: as páginas continuam com 420 px dentro da área de conteúdo até serem adaptadas (Fases 3–6).

### Validação

| Verificação | Resultado |
| --- | --- |
| `npm test` | 275/275 |
| `npm run build` | OK. Precache 94 entradas (antes 95). Diferença de 1 arquivo no particionamento de chunks do Vite, ainda não investigada. Revisar na Fase 7 |
| Capturas `node tests/f61-capturas.browser.mjs --fase fase2 --larguras 390,1024,1366,1920` | Home freelancer, Home empresa, Mensagens (conversa freelancer, lista empresa), Gerenciar vagas e foco por teclado na sidebar. 0 overflow. Navegação desktop visível e barra inferior oculta em ≥ 1024. O inverso em 390 |
| **Mobile 390 px idêntico ao "antes"** | `cmp` byte a byte: home freelancer, conversa, home empresa e lista de mensagens da empresa, viewport e página inteira: **8/8 idênticos** |
| `aria-current` | 1 por página: Início, Painel, Mensagens, Gerenciar vagas (`/homeEmpresa#vagas-empresa`, seção rolada até o topo) |
| `node tests/responsividade.browser.mjs` e `--matriz-atual` | **Falham só em ≥ 1024 px**, como esperado: ainda verificam o contrato compacto (barra inferior e shell de 420/1200 px no desktop). Nenhuma falha em 320–768 px. Atualização do contrato desktop na Fase 7, mantendo as verificações mobile |

## Fase 3 · Páginas do freelancer

### Home (`/home`), ponto de risco da F59

Causa do erro da F59: `.home-hero h1 { font-size: clamp(2.375rem, 6.5cqw, 4.25rem) }` com `container-type` no hero. Com o hero de ~1200 px, `6.5cqw` chegava ao teto de 68 px. A regra mobile foi mantida. Só a partir de 48rem/64rem a fonte passa a ter um teto baixo e fixo.

| Arquivo | Mudança |
| --- | --- |
| `src/router/routes.js` | `/home` com `layout: 'wide'` |
| `src/components/HomeComponent.vue` | `@media (min-width: 48rem)`: padding 32 px, título `clamp(2.375rem, 4.5cqw, 3rem)` com `max-width: 18ch`, destaques com os 2 cards do slide lado a lado. `@media (min-width: 64rem)`: cabeçalho próprio (logo + Favoritos) oculto (a sidebar tem marca e Favoritos), título `clamp(2.5rem, 1.6rem + 1.4vw, 3.25rem)` (40 px em 1024, ~45 px em 1366, 52 px em 1920) com `max-width: 20ch`, descrição `max-width: 52ch`, grid "Mais oportunidades" com 3 colunas. Lógica (`slides`, `jobsHome`, carrossel, favoritos) intocada |
| `src/styles/shell.css` | Fundo contínuo `--mrj-layout-page-background` (≥ 64rem, freelancer). Removidas as regras F49 `.app--wide .app-navigation .item { flex-direction: row … }`: projetadas para uma barra larga que não existe mais, colocavam ícone e rótulo em linha dentro da barra flutuante de 396 px no tablet (rótulos sobrepostos em 768 px). Ícone sobre rótulo, como no mobile |
| `src/styles/tokens.css` | `--mrj-layout-page-background: #f7f8fc` |

Medidas (`node tests/f61-capturas.browser.mjs --fase fase3-home`): conteúdo 390 → 768 → 952 → 1126 → 1280 px em 390/768/1024/1366/1920. 0 overflow. **390 px idêntico byte a byte ao "antes"** (viewport e página inteira). Carrossel rolado até o fim: indicador no 3º ponto em 390/1024/1366/1920, sem erros de navegador. `npm test` 275/275. `npm run build` OK (precache 94).

Nas capturas de página inteira (`-completa.png`) a sidebar fixa aparece só na altura do viewport. É um efeito de `captureBeyondViewport` com elemento `position: fixed`, não do layout real.

### Fim de linha (pedido do usuário após a aprovação da Home)

Um `+65 −65` no `tokens.css` vinha de um estado intermediário em que o arquivo inteiro foi regravado com CRLF. O blob no repositório é LF (`git ls-files --eol`: `i/lf`), e o arquivo foi deixado em LF, idêntico ao commit fora das linhas da F61. Conferido em todos os arquivos alterados: `git diff --numstat` igual com e sem `--ignore-cr-at-eol` e `git diff --check` limpo. A partir daí, os arquivos que já estavam em CRLF na cópia de trabalho (ex.: `src/views/FavoritosView.vue`, `w/crlf`) continuam em CRLF: o script de inserção de CSS preserva o fim de linha encontrado. O diff deles mostra só as linhas adicionadas.

### Demais páginas do freelancer

Padrão: opt-in `layout: 'wide'` na rota e CSS só em `@media (min-width: 48rem)`/`(min-width: 64rem)` no estilo local do componente. Os grids `minmax()` da F50 já existiam: o limite estava no shell (420 px). No desktop a reserva da barra inferior (`padding-bottom` 104–120 px, `25vh`) vira 56 px e `min-height: 100dvh` vira `auto`.

| Página | Rotas | Desktop |
| --- | --- | --- |
| Oportunidades | `freelances` | Grid `minmax(19rem)` → 2 colunas (1024), 3 (1366/1920). Busca e descrição com `max-width: 44rem`. A dica "Salve oportunidades" (após o 2º card no DOM) vai para cima do grid via `order`, sem abrir buraco. Filtros (overlay `Filtros.vue`, já com regra ≥ 768 px) e lógica intactos |
| Detalhe | `oportunidade` | Grid de duas colunas só com CSS (`.blocos { display: contents }`): principal = sobre, requisitos, benefícios; lateral = candidatura (topo) e informações principais/pagamento. Linha final `1fr` absorve a altura da lateral. Ordem do DOM e da leitura inalterada. Candidatura, Conversar e estados intactos |
| Favoritos | `favoritos` | `FavoritosView .page { max-width: 420px }` só abaixo de 48rem. Grid `minmax(19rem)` em 3 colunas |
| Perfil | `perfil`, `editar-perfil` | Cabeçalho em cartão arredondado, seções `minmax(26rem)` em 2 colunas, portfólio em 3. Edição com largura de formulário `48rem` |
| Portfólio | `portfolio`, `portfolioAdicionar`, `portfolioEditar`, `portfolioDetalhe` | Grid de projetos `minmax(16rem)` em 3 colunas, imagens com o `aspect-ratio`/`object-fit` existentes. Detalhe e formulários com `48rem`. Upload, permissões e persistência intocados |
| Notificações | `notificacoes-freelancer` | Largura de leitura `64rem`, histórico em grid `minmax(20rem)`. Marcar lida, contadores e Web Push intocados |

## Fase 4 · Páginas da empresa

`layout: 'wide'` nas 9 rotas empresariais. Abaixo de 1024 px a área continua compacta: `.app--empresa { --mrj-shell-width: 26.25rem }` limita o modo wide (conteúdo = 420 px em 768 px, medido). Só a regra desktop da F61 (`.app--desktop-nav.app--wide`, ≥ 64rem) amplia.

| Página | Desktop |
| --- | --- |
| `EmpresaHeader.vue` | Oculto ≥ 64rem: marca, voltar ao início e sino com indicador estão na sidebar (Painel, Notificações) |
| Home/painel (`homeEmpresa`) | Grid: boas-vindas + "Criar nova vaga" ao lado da última vaga; "Vagas da empresa" em largura total com busca e categoria lado a lado e vagas em grid `minmax(20rem)` (3 colunas em 1366). Só dados existentes, sem contadores novos. Editar/Excluir/Ver detalhes, estados e dialog intactos |
| Criar/editar vaga | Conteúdo `64rem`, formulário + dica lateral (sticky). Fieldsets em grade de 2 colunas: categoria+modalidade, cidade+UF, tipo de contratação+nível, jornada+data, faixa salarial mín.+máx., pagamento+duração. Título e textos longos em largura total (`:has(#vaga-titulo, textarea)`). Barra fixa mobile vira rodapé do formulário (Voltar / Publicar). Validação, obrigatoriedade, payload e limites intocados. A prévia oculta continua oculta |
| Detalhe da vaga | Largura de leitura `60rem`, informações em grid |
| Busca de freelancers / perfil público | `freelancers-publicos.css`: lista em grid `minmax(22rem)`, seletor de categoria `24rem`, reserva da barra removida. Botão de chat e dados expostos inalterados |
| Perfil empresarial / configurações / localização | Perfil `64rem` com seções em 2 colunas. Configurações mantêm `760px` de leitura. Permissões e privacidade de localização intocadas |
| Notificações/candidaturas | `72rem`, filtros com largura do rótulo, candidaturas em grid `minmax(22rem)`. Aprovar/recusar, Conversar, marcar lida intactos |

### Contratos de teste atualizados (autorizados na PARADA 1)

- `tests/notificacoes.test.mjs` (empresa e freelancer) e `tests/perfil-empresa.test.mjs` (guard de `/empresa/perfil`): o `meta` esperado inclui `layout: 'wide'`. As verificações de `requiresAuth`, `tipo` e dos redirecionamentos do guard permanecem.
- `tests/perfil-empresa.test.mjs`: "rotas empresariais preservam o shell de aplicativo sem layout wide" (F51) → "rotas empresariais: shell compacto abaixo de 1024px e layout amplo só no desktop". **Motivo:** a F51 proibia `layout: 'wide'` para manter a empresa compacta. A F61 precisa do opt-in para o desktop, mas a intenção continua: o teste agora exige que `.app--empresa` fixe `--mrj-shell-width: 26.25rem` fora do bloco `@media (min-width: 64rem)` de `shell.css`, e que nenhuma regra de largura desktop (`--mrj-layout-content-max`, `.app--desktop-nav`) apareça antes desse bloco. Continua verificando as 9 rotas, `requiresAuth` e `hideFooter` de criação/edição. A medida real (420 px em 390/768 px) fica com os roteiros de navegador.

## Fase 5 · Chat e notificações

- `src/composables/useMediaQuery.js` (novo): `matchMedia` reativo, estado só visual.
- `src/views/MensagensView.vue`: com `(min-width: 64rem)`, renderiza `RoomList` (`active-id` = `?room=`) e, ao lado, `ChatPane`, "Abrindo conversa…" ou "Selecione uma conversa". Fora disso, o template mobile original sem nenhuma alteração. Mesmo store e mesmos handlers (`selectRoom` → `router.push({ query: { room } })`). O WebSocket continua só no `App.vue`. No desktop a área é fixa à direita da sidebar (`left: var(--mrj-layout-sidebar)`), na altura da janela, com rolagem independente da lista e do histórico. O ajuste de `visualViewport` (teclado virtual) é aplicado só no mobile.
- `App.vue`: a navegação desktop independe de `rodapeOculto`, então a conversa aberta mantém a sidebar no desktop e continua em tela cheia, sem rodapé, no mobile.

Verificação (`--fase fase5`, 390/768/1024/1280×720/1366/1920): **1 WebSocket** criado em todos os cenários. Conversa aberta e janela redimensionada 1366 → 390 → 1366 (e a partir de cada largura): rota `/mensagens?room=42` e conversa preservadas. Clicar em outra conversa na lista (desktop): rota `?room=43`, item ativo atualizado, lista visível. Lista/conversa mobile (freelancer e empresa) idênticas byte a byte ao "antes".

## Fase 6 · Login, cadastro e senhas

- `App.vue`: classe `.app--publica` (de `meta.publica`, já existente). `shell.css` ≥ 64rem: `max-width: none` para que a página pública componha o desktop com seu próprio fundo.
- `login.vue`: marca e "Entrar" à esquerda, formulário em cartão branco à direita (`22–26rem`), conjunto `60rem` centralizado.
- `RegisterComponent.vue`/`RegisterEmpComponent.vue`: apresentação à esquerda e formulário (`24–30rem`) à direita, conteúdo centralizado em `66rem`.
- `definir-senha` (já centralizado em 400 px) e `trocar-senha` (`36rem`) com `layout: 'wide'`: ocupam a área ao lado da sidebar.
- Autenticação, Google, campos e mensagens intocados.

## Capturas "depois" (PARADA 2)

`node tests/f61-capturas.browser.mjs --fase depois --larguras 390,1024,1366,1920`: 33 telas, 132 combinações, **0 overflow, 0 erros de navegador**. **As 38 capturas de 390 px das 19 telas do "antes" (viewport e página inteira) são idênticas byte a byte.** `npm test` 275/275. `npm run build` OK.

## Pendências registradas

- **`tests/favoritos.browser.mjs:298`** (preexistente, fora do escopo da F61, não corrigida): `feat38.sair(); feat38.entrar(38)` sem aguardar o logout assíncrono introduzido pela F60 (`ca038c7`). Correção sugerida para uma FEAT própria: aguardar `feat38.sair()` no roteiro antes de `entrar`.
- **Precache 95 → 94** (`npm run build`): explicação definitiva prevista para a Fase 7.
