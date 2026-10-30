# FEAT-35 — Criação de vagas

Implementação de código exclusivamente no frontend `Front_marujob`, na branch já ativa `FEAT-35`. O estado inicial do frontend estava limpo. Posteriormente, o usuário autorizou explicitamente uma exceção para recuperar o banco local vazio do backend. Essa operação está descrita abaixo e não alterou código Django. Não foram executados commit, push, merge, troca de branch ou publicação real de vagas.

## Análise e reaproveitamento

Foi localizada no histórico a implementação `bb4d44a`, com `src/components/CriarVagaComponent.vue`, `src/views/CriarVagaView.vue` e a rota `/CriarVaga`. Esses arquivos não estavam presentes na árvore inicial da FEAT-35. A tela foi retomada nos mesmos caminhos, aproveitando sua organização em campos, seções, ações e identidade visual; o fluxo anterior sem requisição foi substituído pela publicação integrada.

Foram reutilizados a instância Axios de `src/services/api.js`, a sessão de `authService`, os guards existentes, Pinia, a página `/homeEmpresa`, os recursos visuais do projeto e as categorias usadas em `Filtros.vue`. `src/services/freelanceService.js` já existia, mas estava vazio.

## Contrato verificado

Consultas exclusivamente de leitura à API local:

- `GET /api/schema/?format=json` retornou HTTP 200.
- `OPTIONS /api/freelances/` retornou HTTP 200 e confirmou os campos de POST e seus limites.
- Endpoint de publicação: **POST `/api/freelances/`**, com JSON e JWT enviado pela instância Axios existente.
- Criação confirmada somente com **HTTP 201**. Nenhum campo de identidade, empresa ou privilégio é enviado pelo formulário.

| Campo da tela             | Campo enviado | Formato e validação                                               |
| ------------------------- | ------------- | ----------------------------------------------------------------- |
| Título da vaga            | `titulo`      | Texto aparado, obrigatório, até 100 caracteres                    |
| Categoria                 | `tag`         | Valor de uma opção já utilizada pelos filtros, até 50 caracteres  |
| Descrição da oportunidade | `descricao`   | Texto aparado, obrigatório no frontend, até 200 caracteres        |
| Pagamento                 | `preco`       | String decimal, não negativa, até 8 dígitos inteiros e 2 decimais |
| Duração estimada em horas | `tempo`       | String numérica positiva, até 50 caracteres                       |

O frontend aceita vírgula ou ponto no pagamento e na duração. O pagamento é enviado com ponto e exatamente duas casas, sem conversão monetária por ponto flutuante. Valores em notação científica, texto, sinais negativos, separadores de milhares e precisão monetária superior a duas casas são recusados.

`descricao` e `tag` são opcionais no contrato local, mas obrigatórios no formulário conforme os requisitos desta funcionalidade. A API permite apenas um pagamento. Não há campo de faixa mínima/máxima nesse contrato.

A pedido do usuário, o formulário também exige a modalidade **Remoto, Híbrido ou Presencial**, inicialmente sem seleção. Como não existe um campo próprio na API, a modalidade é salva como texto no início de `descricao` (`Modalidade: Remoto`, seguido de uma linha em branco e da descrição digitada). O contador e a validação reservam o espaço desse prefixo para respeitar o limite total de 200 caracteres. Trocar de modalidade não corta o texto já digitado: o formulário pede sua revisão se exceder o novo limite. O JSON continua enviando apenas os cinco campos existentes, sem alterar o backend.

## Fluxo implementado

1. A empresa acessa **Criar nova vaga** em `/homeEmpresa`.
2. `/criar-vaga` usa os guards existentes com `requiresAuth` e `tipo: empresa`. `/CriarVaga` permanece como alias histórico.
3. O formulário apresenta labels associados aos campos, indicação de obrigatoriedade, select inicialmente vazio, limites, erros abaixo dos campos e foco no primeiro campo inválido.
4. A tela mantém o formato de celular em qualquer navegador: largura máxima de 420 px centralizada, igual às demais páginas do aplicativo. O formulário usa uma coluna, campos de 16 px e botões de pelo menos 48 px, inclusive no computador. A ação de publicar fica fixa no rodapé, limitada aos mesmos 420 px, com espaço reservado no conteúdo e suporte à área segura do celular. O layout largo e a prévia lateral não são exibidos.
5. Durante a publicação, os campos e as ações ficam desabilitados, há indicador e texto de carregamento, e novos envios são bloqueados.
6. Após HTTP 201, o estado local recebe os dados retornados, o formulário é limpo e a empresa é redirecionada para `/homeEmpresa`, com confirmação e cartão da última publicação.
7. Foram retirados os dois cartões fixos de vagas dessa seção do início da empresa. A confirmação usa a resposta da API; não inventa localização, modalidade, data ou status da vaga.

O cartão do início mostra somente a última publicação feita nesta sessão. Não representa um histórico completo nem uma lista de vagas ativas. A mensagem de confirmação pode ser dispensada.

## Erros, sessão e preservação de dados

- **400:** mensagens dos campos da API são associadas aos campos da tela, incluindo `tag` como categoria; erros gerais também são exibidos.
- **401:** a renovação e o encerramento da sessão continuam a cargo da infraestrutura de autenticação existente. O rascunho em memória pode ser retomado pela mesma conta ao voltar à tela.
- **403:** mensagem de falta de permissão para publicar com a conta atual.
- **500 e demais erros de servidor:** mensagem de indisponibilidade com dados preservados.
- **Falha de conexão:** nenhuma confirmação de publicação é apresentada e os dados continuam no formulário.
- **Resposta sem 201:** não produz sucesso fictício; orienta conferir a publicação antes de reenviar.
- **Logout ou troca de conta durante o POST:** a resposta não exibe dados da conta anterior nem redireciona a conta seguinte.
- Rascunho e confirmação existem apenas em memória, sem persistência em localStorage. Trocar de conta limpa os dados da empresa anterior. Recarregar a página perde o rascunho.

## Limitações e pendências do contrato

### Ambiente local com banco vazio

Em uma investigação posterior de erro 500 no login Google, a API respondeu normalmente ao schema (200) e ao método não permitido de Google (405), mas `GET /api/freelances/` retornou `OperationalError: no such table: core_freelance`. A configuração exposta nessa resposta identifica SQLite e o arquivo `db.sqlite3`.

A inspeção do arquivo local foi feita com uma conexão SQLite `mode=ro`: o banco estava com 0 bytes, sem tabelas e sem histórico de migrations. Isso impede a consulta das vagas e dos usuários. O diagnóstico Google enviado pelo usuário indica que a requisição chega à API e recebe 500; a ausência das tabelas precisa ser resolvida no ambiente do backend antes de homologar os fluxos reais.

O usuário autorizou explicitamente a recuperação local. Foi preservada uma cópia do arquivo vazio e recuperado o banco versionado no HEAD do backend, após `PRAGMA quick_check` retornar `ok`. A cópia continha 11 usuários, 20 oportunidades e 1 portfólio; essas contagens foram preservadas na recuperação. O plano de migrations estava vazio: nenhuma migration precisou ser executada.

A restauração usou o mecanismo transacional de backup do SQLite e manteve cópias em `.git/recovery/20261030-160251-277481` do backend, fora dos arquivos publicáveis. A integridade final retornou `ok`, o banco local voltou a ter 159.744 bytes e `GET /api/freelances/` voltou a responder 200. Nenhum código Django, configuração, produção ou conta de usuário foi modificado pela recuperação. Dados criados depois do snapshot versionado não podem ser recuperados a partir desse snapshot; nenhuma conta nova foi criada nesta operação. O login Google real precisa de uma nova tentativa com consentimento do usuário.

### Campos ainda não suportados

Os campos abaixo não existem no schema nem nos metadados de POST consultados. Eles não são coletados como se pudessem ser publicados, nem enviados sob nomes inventados:

- Tipo de contratação.
- Requisitos e benefícios separados.
- Nível de experiência e jornada de trabalho.
- Pagamento mínimo e máximo.

Comparação mínimo/máximo e suporte estruturado à modalidade dependem de um contrato futuro. A modalidade já é validada e publicada como texto legível na descrição, conforme explicado acima; não permite filtros estruturados por modalidade no servidor. Os demais campos sem suporte não são incorporados à descrição.

Uma futura FEAT-34 pode ampliar o contrato. O serviço e o mapeamento do payload estão separados da tela para receber esses campos quando forem oficialmente suportados. O gerenciamento e a consulta das vagas de uma empresa também dependem de um contrato que identifique e filtre a propriedade das oportunidades; a listagem geral não foi usada como se fosse um histórico privado.

Não foram testadas permissões do servidor por POST real nem a criação real com credenciais de uma empresa. As permissões do frontend são complementares às do servidor. A prevenção de duplo clique não substitui idempotência do servidor: em um timeout ou queda de conexão depois do processamento, é necessário conferir a publicação antes de repetir.

## Arquivos modificados

- `package.json`: inclui os testes da FEAT-35 no comando de testes.
- `src/router/routes.js`: rota protegida e alias histórico.
- `src/services/freelanceService.js`: publicação com Axios existente e confirmação de HTTP 201.
- `src/components/HomeEmpresaComponent.vue`: acesso à criação, confirmação e dados da última publicação.
- `src/components/FooterEmpresaComponent.vue`: limita a largura à tela e considera a área segura do celular, evitando rolagem horizontal depois da publicação.

## Arquivos criados

- `src/components/CriarVagaComponent.vue` — tela retomada no caminho histórico.
- `src/views/CriarVagaView.vue` — view retomada no caminho histórico.
- `src/composables/useCriarVaga.js` — submissão, carregamento, erros e navegação.
- `src/stores/vagas.js` — rascunho e última publicação por conta, em memória.
- `src/utils/vagaForm.js` — categorias, limites, validação, payload e mensagens.
- `tests/vagas.test.mjs` — testes automatizados do frontend.
- `tests/vagas.browser.mjs` — verificação manual automatizada em Chrome isolado.
- Este relatório.

## Testes e resultados

- **67 testes automatizados passaram:** os 43 testes de autenticação existentes e 24 testes da FEAT-35. Incluem campos obrigatórios, espaços, categoria, as três modalidades, limites incluindo o prefixo da modalidade, troca de modalidade sem perda de texto, pagamento e duração, payload, JWT, prevenção de duplicação, confirmação somente após 201, erros 400/401/403/500 e de conexão, nova tentativa, preservação do rascunho, permissões e troca de conta.
- **Navegador:** passou a verificação de renderização, campos, select, foco, bloqueio de visitante/freelancer, pagamento negativo, publicação duplicada, campos desabilitados, erro 400, dados preservados, sucesso e redirecionamento após 201.
- **Responsividade:** sem rolagem horizontal em 320, 375, 390, 430, 768 e 1440 px. O teste também confirma texto dos campos com pelo menos 16 px, botão de publicação visível e com pelo menos 48 px no celular, e início da empresa sem transbordamento após a publicação. Capturas de desktop e celular foram inspecionadas visualmente.
- **Build:** `npm run build` passou.
- Nos testes, o transporte da API é substituído apenas no processo ou no perfil isolado do navegador. Nenhum dado fictício é inserido na aplicação real e nenhuma vaga é criada no servidor.

Comandos de reprodução no Windows:

```text
npm.cmd test
npm.cmd run build
node tests/vagas.browser.mjs
```

O teste de navegador usa Chrome local, um perfil isolado em `node_modules/.cache/feat35-navegador`, um servidor exclusivamente do frontend na porta 5186 e interceptação de todas as chamadas `/api/`. Não requer senha nem altera a API. `CHROME_BIN` permite informar outro caminho do executável. As capturas ficam nesse diretório ignorado pelo Git.

## Isolamento

Todos os arquivos de código criados ou modificados pertencem à raiz Git do frontend. A conferência usa `git diff --name-only` para arquivos rastreados e `git ls-files --others --exclude-standard` para arquivos novos. A única exceção posterior, autorizada explicitamente pelo usuário, foi a recuperação de `db.sqlite3` e a preservação de cópias locais dentro de `.git/recovery` do backend. Nenhum arquivo de código do backend foi modificado nesta tarefa.
