# F59 · Polimento visual geral

## Base e trabalhos anteriores

A branch local `F59` partiu de `origin/DEV` em `173b4ed`, após `git fetch origin --prune`. A árvore inicial estava limpa na F55. A busca de branches e PRs por F59 e polimento visual não encontrou trabalho equivalente. A atualização PWA da F55 está integrada no PR #108.

| Área | Diagnóstico na DEV | Decisão |
| --- | --- | --- |
| F48 · Tokens e componentes base | Correta no escopo opt-in | Preservar `tokens.css` e os estados de `BaseButton`, `BaseCard` e `BaseInput`. [PR #93](https://github.com/MaRuJoBs/Front_marujob/pull/93) |
| F49 · Shell e navegação | Correta na matriz, inclusive com pouca altura | Reutilizar o layout amplo opt-in para a Home. Preservar regras de safe area, reserva e `hideFooter`. [PR #97](https://github.com/MaRuJoBs/Front_marujob/pull/97) · [PR #107](https://github.com/MaRuJoBs/Front_marujob/pull/107) |
| F50 · Interface freelancer | Parcialmente padronizada. Grids da Home permaneciam empilhados no desktop | Ampliar apenas a Home e manter a paleta, a hierarquia e o movimento. [PR #99](https://github.com/MaRuJoBs/Front_marujob/pull/99) |
| F51 · Interface empresarial | Correta na geometria da matriz. A composição compacta é intencional | Manter o formato empresarial e o diretório F45. [PR #98](https://github.com/MaRuJoBs/Front_marujob/pull/98) · [PR #100](https://github.com/MaRuJoBs/Front_marujob/pull/100) · [PR #104](https://github.com/MaRuJoBs/Front_marujob/pull/104) |
| F52 · Acessibilidade | Parcialmente padronizada. Foco e diálogos presentes, com expectativa legada no roteiro de notificações empresariais | Preservar a apresentação do carregamento e os contratos dos formulários. A expectativa fica na F43. [PR #101](https://github.com/MaRuJoBs/Front_marujob/pull/101) |
| F55 · PWA | Correta na integração Git. Homologação física pendente | Validar o build e o worker com a suíte existente. [PR #108](https://github.com/MaRuJoBs/Front_marujob/pull/108) |
| F56 · Chat | Correta na geometria, com conversa em tela cheia e ação final visível na lista | Preservar por dependência do shell e do compositor. [PR #103](https://github.com/MaRuJoBs/Front_marujob/pull/103) · [PR #107](https://github.com/MaRuJoBs/Front_marujob/pull/107) |
| F57 e F60 · Avisos, candidaturas e Web Push | Corretas nos cenários geométricos e com indicadores distintos | Manter a central compacta e a posição do footer sobre a safe area. Push real depende de ambiente de homologação. [PR #105](https://github.com/MaRuJoBs/Front_marujob/pull/105) · [PR #106](https://github.com/MaRuJoBs/Front_marujob/pull/106) |

## Rotas e apresentação

As classificações de geometria se referem às rotas reais com dados de teste em memória. A matriz mede largura, presença e alinhamento da navegação, overflow, última ação e visibilidade da última conversa. Capturas amostrais complementam essas medições.

| Jornada e páginas | Classificação inicial | Decisão |
| --- | --- | --- |
| `/home` | Com inconsistência visual. Coluna de 420 px em desktop, selo sobre o ícone e seção de destaques vazia em estados sem dados | Ampliar com segurança |
| `/freelances`, `/oportunidade/:id`, `/favoritos` | Corretas na matriz. Colunas funcionam para a leitura de cards e detalhes | Manter compactas |
| `/perfil`, `/editar-perfil` | Corretas na geometria. Câmera física e teclado virtual pendentes | Manter compactas |
| `/portfolio`, `/portfolio/adicionar`, `/portfolio/:id`, `/portfolio/:id/editar` | Corretas na geometria com dados preenchidos. Formulários, dados longos e estados simulados também cobertos pelo roteiro F50 | Manter compactas |
| `/notificacoes` | Correta na matriz. Histórico, avisos do chat e inscrição Web Push têm áreas próprias | Manter compacta |
| `/mensagens` e `/mensagens?room=42`, nos dois papéis | Corretas na matriz. Última conversa integralmente alcançável em viewport baixo. Conversa aberta ocupa a tela | Preservar por dependência |
| `/homeEmpresa` e gerenciamento | Corretos na composição compacta F51, com títulos longos e ações separadas nos cards | Manter compactos |
| `/criar-vaga`, `/editar-vaga/:id`, `/empresa/vagas/:id` | Corretas na geometria. Expectativa histórica de obrigatoriedade reservada à F43 | Manter compactas |
| `/empresa/freelancers`, `/empresa/freelancers/:id` | Corretas na geometria com resultado e perfil público preenchidos | Manter compactas |
| `/empresa/perfil`, edição, `/empresa/configuracoes` e localização | Corretas na geometria das rotas. Permissões reais do dispositivo pendentes | Manter compactas |
| `/empresa/notificacoes` e candidaturas | Corretas na geometria. Cobertura interativa da F52 tem expectativa legada já registrada na F49 | Manter compactas |
| `/login`, `/register`, `/registerEmpresa` | Com inconsistência visual. O botão Google de 300 px saía da superfície dos cadastros em 320 px. As mensagens de carregamento herdavam texto claro no tema escuro do sistema, sobre o fundo lilás claro | Manter compactas e ajustar apresentação |
| `/definir-senha`, `/trocar-senha` | Corretas na geometria. Apresentação com teclado virtual pendente | Manter compactas |

## Correções e evidências

| Página e resoluções | Causa e ajuste | Resultado |
| --- | --- | --- |
| Home, 768 a 1920 px | `routes.js` ativa o layout amplo apenas na Home. `HomeComponent.vue` define duas colunas de destaque a partir de 768 px, mantém a medida mínima do grid e evita esticar os cards quando há poucos resultados | Coluna de 420 para 753 px em viewport de 768 px, 1009 px em 1024 px e 1200 px a partir de 1280 px. Grid com duas colunas no tablet de 768 px e três a partir de 1024 px |
| Home, 320 a 1920 px | `HomeComponent.vue` posiciona o ícone de fallback acima do selo, oculta a seção de destaques sem slides e calcula o indicador pelo passo efetivo entre slides, incluindo o gap | Matriz sem sobreposição entre selo e ícone. Vazio, carregamento e erro usam os estados existentes sem uma região de carrossel sem conteúdo |
| Home, desktop com títulos curtos e longos | `HomeComponent.vue` elimina a distribuição duplicada da margem automática entre resumo e ação. `Footer.vue` mantém ícone sobre rótulo na barra compacta mesmo dentro do shell amplo | Valores e botões de detalhe alinhados por linha. Barra centrada, com o deslocamento inferior original e os destinos existentes |
| Login e cadastros, 320 px e preferência escura | `googleAuth.js` usa a largura do contêiner no momento de renderização, limitada aos 300 px originais. `login.vue`, `RegisterComponent.vue` e `RegisterEmpComponent.vue` aplicam o token de texto do formulário | Botão Google dentro das superfícies em 320 px. Mensagens de progresso usam roxo escuro sobre lilás claro |
| Matriz de navegador | `tests/responsividade.browser.mjs` ajusta a largura esperada por rota, mede os grids e a sobreposição do selo e carrega o CSS FontAwesome usado em produção | 406 medições comparáveis. A largura de todas as outras rotas coincide com a DEV |

Comparações visuais:

- Fim da página em 1920 × 900, medido pela matriz de responsividade. [DEV](evidencias/f59/home-desktop-dev.png) · [F59](evidencias/f59/home-desktop-f59.png)
- Topo e selo em 768 px, capturados pelo roteiro visual F50. [DEV](evidencias/f59/home-tablet-dev.png) · [F59](evidencias/f59/home-tablet-f59.png)
- Botão Google no cadastro empresarial em 320 × 900. [DEV](evidencias/f59/cadastro-empresa-dev.png) · [F59](evidencias/f59/cadastro-empresa-f59.png)
- Mensagem de carregamento do login em 320 × 900 com preferência escura. O contraste calculado entre o texto e a superfície subiu de aproximadamente 1,1:1 para 7,3:1. [Antes](evidencias/f59/contraste-antes.png) · [Depois](evidencias/f59/contraste-f59.png)

Capturas complementares e medições em `node_modules/.cache`:

- Topo da Home pela matriz. [768 px](../node_modules/.cache/feat49-browser/f59-final/home-topo-768.png) · [320 px](../node_modules/.cache/feat49-browser/f59-final/home-topo-320.png)
- [Dados da DEV](../node_modules/.cache/feat49-browser/f59-dev/matriz-atual.json) · [Dados da F59](../node_modules/.cache/feat49-browser/f59-final/matriz-atual.json) · [Cadastro empresarial na DEV em 320 px](../node_modules/.cache/feat49-browser/f59-dev/matriz-publico--registerEmpresa-320x900.png)

A matriz inicial não carregava os ícones CSS FontAwesome. A inspeção do selo na DEV usa a captura F50 com FontAwesome e Poppins. As medições da matriz são geométricas e usam a fonte disponível no harness. As imagens no fim da página registram a última ação após rolar.

## Validação

Chrome headless em 320, 360, 375, 390, 420, 430, 768, 1024, 1280, 1440 e 1920 px, com 390 px também nas alturas de 320, 600 e 700 px. O cenário de 390 × 700 emula 34 px de área segura. A última ação das conversas manteve 76 de 76 px visíveis nos dois papéis em 390 × 320.

| Comando | Resultado |
| --- | --- |
| `npm test` | 275 aprovados na DEV e 275 na F59 |
| `npm run build` | Aprovado. `dist/sw.js` gerado com 95 entradas no precache |
| `node tests/responsividade.browser.mjs` | Aprovado. Shell, rolagem, foco, rotas preenchidas e navegação inferior |
| `node tests/responsividade.browser.mjs --matriz-atual` | 406 combinações aprovadas na DEV e na F59, incluindo ações finais, safe area e chat aberto |
| Matriz dos formulários públicos após ajuste de contraste | 42 combinações, com captura do botão Google e da mensagem de progresso em 320 px |
| `node tests/freelancer-visual.browser.mjs` | 80 registros sem erros de navegador. Inclui estados vazio, carregando e erro, dados longos, filtros e Escape, foco, formulários parcialmente preenchidos, sucesso simulado e movimento reduzido |
| `node tests/notificacoes.browser.mjs --pwa` | 36 de 36, incluindo leitura, sessão e avisos. Worker de produção validado com push simulado, clique interno, offline, precache interrompido e ativação após fechar a versão anterior |
| `node tests/notificacoes.browser.mjs --pwa --somente-pwa` | Regressão do worker aprovada no build final, após o ajuste de contraste |
| `node tests/acessibilidade.browser.mjs --interactions-only` | Falha preexistente em `/empresa/notificacoes`, na expectativa de `aria-busy` durante a carga inicial. Registrada na [auditoria F49](F49-finalizacao-responsividade.md) |
| `node tests/gerenciamentoVagas.browser.mjs` | Guard e transições entre criação e edição passaram. Falha preexistente no roteiro que espera seis campos obrigatórios, registrada na [auditoria F49](F49-finalizacao-responsividade.md) |
| `node tests/freelancers-publicos.browser.mjs` e `node tests/localizacao-empresa.browser.mjs` | Aprovados. Diretório, paginação, vazio, erro, 404, privacidade, chat e sete cenários de localização |
| `node --test tests/design-system.test.mjs` | 8 de 8 aprovados |
| `node tests/design-system.browser.mjs` | Com `CHROME_BIN` configurado, o harness isolado encontrou foco visível por Tab e falhou ao esperar um clique após enviar Enter via CDP. Os componentes base, o CSS global e o roteiro usados nesse harness são idênticos aos da DEV |

O atalho npm padrão apontava para o diretório de outro usuário do Windows. A execução usou `C:/Program Files/nodejs/npm.cmd`. O build e o Chrome exigiram execução fora da sandbox após erros de acesso e de CDP. Uma primeira execução de notificações recebeu um reload do Vite durante a edição.

## Homologação e integração

O escopo exercitado usa sessão, respostas de API e transporte simulados. A etapa final deve confirmar teclado virtual, câmera, geolocalização e leitor de tela em Android/iPhone, autenticação real do Google e Web Push com VAPID em HTTPS. O botão Google recebe a largura disponível quando é renderizado. O redimensionamento com o iframe já montado e a exibição de botões personalizados com conta Google ativa precisam de homologação. [Google Identity Services](https://developers.google.com/identity/gsi/web/reference/js-reference#width)

As expectativas históricas de `aria-busy` e quantidade de campos obrigatórios de vagas seguem para F43. Nenhum problema funcional novo foi demonstrado pelas verificações aprovadas.

**Classificação · FINALIZADA COM RESSALVAS.** A auditoria geométrica, as comparações visuais e as suítes principais passaram. Permanecem as limitações de homologação física e os três roteiros legados registrados na tabela.

**Título sugerido para DEV**

> F59 · melhora a composição responsiva da Home freelancer

**Descrição sugerida**

> Ativa o layout amplo existente somente na Home freelancer, alinha os cards e corrige a apresentação do carrossel. Ajusta o contraste das mensagens de progresso e o encaixe do botão Google em formulários estreitos. Registra a auditoria comparativa com a DEV e a verificação das jornadas de navegação, chat e PWA.
