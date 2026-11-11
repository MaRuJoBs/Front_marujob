# FEAT-49 — Auditoria de proporções e regressões

## Estado e método

Repositório `MaRuJoBs/Front_marujob`, branch `FEAT-49`, worktree única e inicialmente
limpa. `git fetch origin --prune` executado. PR #97 aberto, base `dc33fe9`, HEAD
`b4d9021`, iguais aos refs remotos conferidos; nenhuma alteração posterior encontrada.
Não houve checkout da DEV, nova branch, staging, commit, push, merge ou deploy.

Comparação em Chrome real/headless entre base `dc33fe9`, PR original `b4d9021` e
árvore corrigida. Um plugin Vite lê apenas os seis arquivos estruturais de cada
snapshot com `git show`, mantendo o restante do código/fixtures idêntico e a DEV
intacta. Não usa CSS injetado para fingir o estado antigo.

Onze rotas × sete larguras: 320, 360, 390, 420, 768, 1024 e 1440px. Altura padrão
900px, scrollbar Windows descontada na largura útil (390px pode fornecer 375px
úteis). Tema e fontes do mesmo harness em todas as versões; não é comparação com
um dispositivo físico nem aprovação por Figma. Fixtures com seis vagas, títulos
curtos/longos, valores, descrição, requisitos, benefícios e três projetos com imagens
locais, perfil freelancer e empresarial. Não há solicitações de escrita à API:
o adapter do teste rejeita qualquer método diferente de GET.

## A. Diagnóstico comprovado

1. **Estiramento indevido em desktop.** O conteúdo herdou os 1200px do shell mesmo
   sem adaptação dos componentes mobile. Em 1440px, o card da home empresarial mudou
   de 388 × 194,59px para 1168 × 131,80px. A redução das quebras de texto diminuiu a
   altura enquanto a largura triplicou: causa concreta da aparência achatada.
2. **Slogan mobile menor e deslocado.** Em 390px, passou de 370px para 343px, devido
   aos novos paddings de 16px e à retirada da margem superior anterior.
3. **Reserva duplicada.** Em 390px, home: scrollHeight 1606 → 1691; home empresarial:
   2478 → 2563. Os 85px extras vieram do shell sobre páginas que já reservavam espaço.
4. **Clamp altera outras alturas de viewport.** Com largura 390px, altura 600:
   header 198 → 200px; altura 1200: 396 → 320px. Na altura padrão 900, ambos têm
   297px: o clamp não explica sozinho o achatamento observado nesse cenário.
5. **Footer empresarial aumentado.** A altura passou de 76 para 85px, sem necessidade
   para as páginas mobile. A distribuição dos links também mudou.

Hipóteses delimitadas: os cards da home medidos em 360/390/420px não mudaram de tamanho
no PR original; não há evidência de achatamento universal em mobile. No portfólio,
a reserva adicional introduziu scrollbar vertical e reduziu a largura útil a 390px:
é outro efeito da reserva duplicada, também eliminado na correção. `.app-content`
não comprimiu a altura dos cards por flex. `index.html` já possui viewport correto;
base.css/main.css/tokens.css não foram alterados pela F49. Tokens `.mrj-ui` só
declaram variáveis, mas sua ativação no App expunha essas variáveis a seletores
legados que usam var() (por exemplo perfil empresarial); o escopo global foi
retirado preventivamente, sem atribuir a ele todas as mudanças visuais.

## B–C. Correções restritas ao shell

- **App.vue:** separa shell de conteúdo; mantém `.app-content` e a lógica de footer,
  sem mudar sessão ou rotas. Páginas com reserva local conhecida ≥100px são
  identificadas por nome no shell. Importa tokens, mas não aplica `.mrj-ui` no App.
- **shell.css:** shell continua fluido até 75rem/1200px; conteúdo legado e navegação
  permanecem centralizados até 26,25rem/420px. Não se trata de reinstalar o limite no
  shell global. Em ≥768px, `meta.layout: 'wide'` permite conteúdo/navegação amplos
  **apenas quando uma futura página estiver preparada**. Nenhuma rota de produção
  foi alterada nem optada por antecipação; a capacidade é testada numa rota local.
- A reserva inferior é `max(0, footer + safe-area - reserva-local)`. Footer freelancer
  85px, empresa 76px. Rotas conhecidas contribuem com mínimo conservador de 100px;
  Favoritos usa seu valor real de 25vh, inclusive em viewports baixas; novas rotas
  sem reserva mantêm a proteção integral do shell. Não há padding
  negativo nem remoção indiscriminada dos paddings das páginas.
- **Header.vue:** restaura 33vh, posição original da logo e margem do slogan; mantém
  acessibilidade adicionada na F49. O slogan tem limite real de 100% para corrigir
  excesso nos celulares menores; conserva 370px em 390/420px. Sua margem é limitada
  a 42px em telas largas, pois 10vw não deve crescer indefinidamente com o viewport
  quando o conteúdo ainda é mobile. Sobreposição intencional da home permanece.
- **EmpresaHeader.vue:** restaura marca original quando não existe Voltar. Redução
  entre 360 e 419px fica restrita ao caso com Voltar; mantém regra antiga <360px.
- **Footer.vue / FooterEmpresaComponent.vue:** recebem `.mrj-ui` localmente, assim
  como o Header, para usar foco/espaços F48 sem vazar variáveis sobre as páginas.
- **tests/responsividade.browser.mjs** e **tests/fixtures/responsividade.js**:
  snapshots, conteúdo preenchido, proporções, altura do header, navegação ampla
  opt-in, isolamento de tokens, erros e preenchimento de formulário. Cenários
  anteriores de sessão local, navegação, foco, hideFooter e final da página mantidos.

Nenhum service, store, endpoint, contrato, permissão, rota ou página individual
modificado. Sem dependências novas. Sem overflow-x:hidden para encobrir defeitos.

## D. Medidas após a correção

| Rota/largura | Base | PR original | Correção |
| --- | --- | --- | --- |
| Home, 390px, card | 339 × 107,78 | 339 × 107,78 | 339 × 107,78 |
| Home, 390px, slogan | 370 | 343 | 370 |
| Home, 390px, scrollHeight | 1606 | 1691 | 1606 |
| Home empresa, 390px, scrollHeight | 2478 | 2563 | 2478 |
| Home empresa, 1440px, card | 388 × 194,59 | 1168 × 131,80 | 388 × 194,59 |
| Perfil, 1440px, card | 386,39 × 75,98 | 1104 × 75,98 | 386,39 × 75,98 |
| Header em viewport 390 × 600 | 198 | 200 | 198 |
| Header em viewport 390 × 1200 | 396 | 320 | 396 |

Todas as 44 combinações mobile (11 rotas × 320/360/390/420) tiveram scrollHeight
igual ao da base nas fixtures. As dimensões dos cards encontrados e comparáveis
foram verificadas com tolerância <1px. As 77 páginas preenchidas corrigidas não
apresentaram overflow horizontal. Isso não equivale a identidade pixel a pixel:
alvos acessíveis e correções necessárias para telas pequenas foram mantidos.

Artefatos locais regeneráveis em `node_modules/.cache/feat49-browser/`:

- `dc33fe9/`, `b4d9021/`, `corrigido/`: screenshots `home-390.png`,
  `homeEmpresa-1440.png`, `portfolio-390.png` etc., e `results.json` com retângulos,
  scrollHeight, dimensões naturais de imagens, grid e tamanho de fonte medidos.
- `corrigido/comparacao-home-390.png`, `comparacao-home-420.png`,
  `comparacao-homeEmpresa-1440.png`, `comparacao-portfolio-390.png`: lado a lado,
  sempre base / PR original / correção. HTMLs adjacentes permitem inspeção ampliada.
- Formulários têm capturas adicionais `criar-vaga-{largura}-form-{0,1}.png`, com
  preenchimento parcial/erros e preenchimento completo, sem enviar o formulário.

## E. Execução e reprodução

- `npm test`: **227/227 aprovados**.
- `node --test tests/*.test.mjs`: **248/249 aprovados**; única falha preexistente
  F48 `UNRESOLVED_ENTRY`, caminho
  `../../../../C:/Users/Ricardo/Documents/Front_marujob/node_modules/.cache/feat48-compiled/entry.mjs`.
  F48 não foi alterada para contornar a falha Windows.
- `npm run build`: aprovado fora do sandbox, com NODE_OPTIONS temporário
  `--preserve-symlinks --preserve-symlinks-main`. Nenhuma configuração global mudou.
  Browserslist desatualizada continua como aviso.
- `node tests/responsividade.browser.mjs`: 30 cenários anteriores + 77 cenários
  preenchidos, sete sequências de formulário (validação, parcial, completo) e duas
  alturas adicionais de header e viewport baixa de Favoritos (reserva 25vh).
  117 registros de resultado, sem falhas na execução.
- `git diff --check`: aprovado; revisar também `git diff --stat` e `git status --short`.

Para regenerar snapshots no PowerShell, definir `$env:F49_REF='dc33fe9'` e executar
o script; repetir com `b4d9021`. Remover a variável com `Remove-Item Env:F49_REF` e
executar novamente para validar/capturar a árvore local. `F49_PATHS` permite filtrar
rotas numa recaptura; sem ela são onze rotas. `F49_AUDIT=0` executa apenas os 30
cenários anteriores. `F49_COMPARE_ONLY=1` regenera somente os comparativos a partir
dos PNGs existentes. Não requer worktree, alteração da DEV ou acesso à API real.

## F–G. Pendências e veredito

F50/F51 continuam responsáveis por grids, distribuição desktop, botões e overlays
de cada página. Elas devem optar por layout amplo apenas após adaptação, e atualizar
o contrato de reserva no shell se removerem paddings locais. Até lá, páginas ainda
mobile não são esticadas; desktop mantém a apresentação estreita intencionalmente.

Safe areas reais, notch, teclado virtual e todos os estados de backend autenticado
precisam de validação física/manual. O teste usa Chrome desktop com scrollbar e
dados simulados, não substitui aprovação visual da equipe. Notificações e outras
rotas fora das onze capturadas têm regressão funcional coberta pela suíte, sem
afirmação de validação visual completa.

**PRONTO COM RESSALVAS**, para a versão local após revisão e incorporação no PR #97.
As correções devem integrar o PR existente #97. Commit e push autorizados pelo
usuário em 11/11/2026. A documentação inicial foi mantida como histórico,
com link para esta auditoria que a substitui quanto ao comportamento corrigido.
