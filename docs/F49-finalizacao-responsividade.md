# F49 · Finalização da responsividade

## Base e escopo

A branch local `F49-finalizacao` parte de `origin/DEV` em `916f304`. A `FEAT-49` original tinha 29 commits a menos e nenhum commit exclusivo. A busca por complementar a F49 encontrou a branch histórica e o PR #97 já integrado. A DEV também inclui F48, F50, as duas entregas F51, F52, F57 e o PR #106 da F60, incluindo a correção do footer em `/notificacoes`. [PR #97](https://github.com/MaRuJoBs/Front_marujob/pull/97) · [PR #106](https://github.com/MaRuJoBs/Front_marujob/pull/106)

O shell de até 75rem, o conteúdo compacto de 26,25rem e o opt-in de layout amplo a partir de 48rem continuam disponíveis. Nenhuma rota nova recebeu o opt-in. A composição mais larga de páginas já utilizáveis, como as duas homes e o gerenciamento empresarial, fica para a revisão visual da F59. Formulários, perfis, listagens, mensagens e notificações mantêm as colunas atuais.

## Diagnóstico e correções

| Área                                               | Estado encontrado                    | Decisão                                                                                                                               |
| -------------------------------------------------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| Shell, design system, headers e navegação          | Implementada                         | Preservar a coluna de leitura, foco visível, regras por papel, reserva local e opt-in amplo.                                          |
| Home, oportunidades, favoritos, perfil e portfólio | Implementada no layout existente     | Manter os layouts F50. Verificar o último controle e a largura útil na matriz.                                                        |
| Lista de mensagens                                 | Com regressão em viewport baixo      | Corrigir a área rolável para que a última conversa inteira fique acessível acima do footer.                                           |
| Conversa aberta                                    | Implementada no layout existente     | Preservar tela cheia, composer, rolagem e ausência de footer. Teclado virtual físico pendente.                                        |
| Notificações de freelancer e empresa               | Implementada no frontend             | Preservar a correção F60, histórico, avisos de chat, diálogos e indicadores. Push real continua dependente de ambiente B60 com VAPID. |
| Páginas empresariais e formulários                 | Implementada no layout compacto      | Manter o trabalho de F51, F45 e F58. Verificar o layout com fixtures e separar problemas anteriores de roteiros legados.              |
| Login, cadastro e senhas                           | Implementada no layout existente     | Manter o fluxo de autenticação. Google real e teclado de aparelhos físicos pendentes de validação.                                    |
| Teste isolado da F48 no Windows                    | Com regressão na execução do harness | Converter URLs de arquivo com `fileURLToPath` para o Vite. Componentes e tokens permanecem intactos.                                  |

Em `/mensagens`, a 390 × 320 px, o cabeçalho e os filtros ocupavam espaço fixo e apenas o trecho das conversas rolava. A última ação tinha 76 px de altura. Mesmo no fim da rolagem interna, apenas 43 px ficavam visíveis como freelancer e 52 px como empresa. A reserva da lista também considerava a altura nominal do shell sem o deslocamento inferior real da barra.

`shell.css` expõe a altura ocupada pela barra de cada papel. `MensagensView.vue` usa esse valor e a área segura para encerrar a lista antes do footer. Em viewports de até 26rem de altura, `RoomList.vue` coloca cabeçalho, filtros e conversas na mesma área rolável. Em alturas maiores, a lista de conversas continua com rolagem própria. As barras, a lógica do chat e a conversa aberta continuam com os comportamentos anteriores.

## Matriz e evidências

A matriz usa rotas reais da SPA e fixtures locais. A sessão e o transporte ficam em memória e a leitura simulada da conversa não escreve fora do processo. As onze larguras são 320, 360, 375, 390, 420, 430, 768, 1024, 1280, 1440 e 1920 px. Tablets são emulados a 768 × 1024 e 1024 × 768. A largura de 390 px também é executada nas alturas de 320, 600 e 700 px e a última usa 34 px de área segura inferior emulada. A matriz geométrica usa preferência de movimento reduzido para medir o layout em repouso. A suíte visual existente continua exercitando o layout com animações.

| Papel      | Rotas                                                                                                                                                                 |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Público    | Login e cadastros de freelancer e empresa                                                                                                                             |
| Freelancer | Home, lista e detalhe de oportunidades, favoritos, perfil e edição, portfólio e formulários, notificações, lista e conversa aberta, definir e trocar senha            |
| Empresa    | Home e gerenciamento, criar, editar e detalhar vaga, busca e perfil público de freelancer, perfil institucional, configurações, notificações, lista e conversa aberta |

A matriz verifica overflow do documento, controles fora da largura útil, tamanho da coluna, alinhamento e presença do footer, último controle após rolar e a fração visível da última conversa. A suíte padrão também verifica navegação por teclado, ação final, rota ampla experimental, `hideFooter` e resultados de formulários. A regressão da F60 verifica a reserva inferior, os badges, leitura e push simulado.

Capturas e medições ficam sob `node_modules/.cache/feat49-browser/`. A captura anterior do chat em viewport baixo está em `matriz-dev-chat/matriz-usuario--mensagens-390x320.png`. A correspondente da revisão está em `matriz-atual/matriz-usuario--mensagens-390x320.png`. Cada pasta mantém o JSON `matriz-atual.json` com a altura visível e a altura total da ação.

As comparações visuais com snapshots anteriores ao redesenho F50/F51 continuam disponíveis com `--comparar-baseline-historica`. Por padrão, a suíte verifica a geometria das páginas atuais. A largura de um card da Home redesenhada diverge da captura antiga e não é usada como critério da finalização atual.

## Resultados e arquivos

| Verificação                                                 | Resultado                                                                                                                                                                                                               |
| ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm test`                                                  | 275 aprovados                                                                                                                                                                                                           |
| `npm run build`                                             | Aprovado, com `dist/sw.js` e 95 entradas de precache                                                                                                                                                                    |
| `node --test tests/design-system.test.mjs`                  | 8 de 8 no Windows. Antes da correção do caminho, 7 de 8 com `UNRESOLVED_ENTRY`                                                                                                                                          |
| Matriz atual                                                | 406 de 406 combinações. As larguras do shell e da coluna coincidem com as 406 medições da DEV de partida                                                                                                                |
| Lista de conversas em 390 × 320 px                          | 76 de 76 px da última ação visíveis após rolar, nos dois papéis                                                                                                                                                         |
| Diretório público e localização empresarial                 | Roteiros de navegador aprovados com fixtures                                                                                                                                                                            |
| `node tests/responsividade.browser.mjs`                     | Aprovado, 122 registros                                                                                                                                                                                                 |
| `node tests/notificacoes.browser.mjs --pwa`                 | 36 de 36 cenários. Worker de produção aprovado com push simulado, clique interno e navegação offline                                                                                                                    |
| `node tests/acessibilidade.browser.mjs --interactions-only` | Parou na expectativa legada de `aria-busy=true` durante o carregamento inicial de notificações da empresa. A DEV de partida já apresenta o carregamento por `role=status` e reserva `aria-busy` dos cards para mutações |
| `node tests/gerenciamentoVagas.browser.mjs`                 | Guard e transição criação/edição aprovados. O roteiro parou na expectativa histórica de seis campos obrigatórios. A modalidade segue opcional no contrato atual                                                         |

Arquivos de aplicação alterados: `RoomList.vue`, `MensagensView.vue` e `shell.css`. A cobertura usa `responsividade.browser.mjs` e `fixtures/responsividade.js`. `freelancers-publicos.browser.mjs` verifica os cinco destinos reais do footer após a F57, incluindo Avisos. `design-system.test.mjs` usa caminhos de arquivo válidos no Windows mantendo a mesma compilação e as mesmas assertions.

**Classificação: FINALIZADA COM RESSALVAS.** A geometria e as jornadas executadas passaram na matriz atual. Permanecem pendentes a homologação física em Android e iPhone, a interação com teclado virtual e leitor de tela reais, Google e Web Push reais, além da revisão das duas expectativas legadas acima. A redução de viewport e a área segura foram emuladas no Chrome.

## Reprodução e proposta de PR

```powershell
npm test
npm run build
node --test tests/design-system.test.mjs
node tests/responsividade.browser.mjs
node tests/responsividade.browser.mjs --matriz-atual
node tests/notificacoes.browser.mjs --pwa
```

Sugestão de título do PR para DEV

> F49 · finaliza a auditoria responsiva e corrige a lista de conversas em telas baixas

Sugestão de descrição

> Corrige a rolagem da lista de mensagens em viewports baixos e calcula o limite inferior com a altura real da barra. Preserva o shell compacto, as páginas redesenhadas, a conversa em tela cheia e o footer da F60. Amplia a matriz visual de rotas atuais e corrige a execução isolada da F48 no Windows.
