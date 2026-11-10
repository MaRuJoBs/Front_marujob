# FEAT-47 — Complementos das oportunidades

Branch `FEAT-47`, criada a partir de `origin/DEV` atualizada em 10/11/2026,
commit `d08cb7a` (merge da F42, PR #95). Contrato conferido nos models,
serializer, migração e testes do [PR B47 #20](https://github.com/MaRuJoBs/Back_marujob/pull/20).

## Implementação

Já existiam criação/edição, requisitos, benefícios, contratação, experiência,
jornada, data e faixa salarial. Esses campos e os composables foram reaproveitados.

- Modalidade agora é opcional e enviada em campo próprio, sem prefixar a descrição.
- Cidade opcional (100 caracteres, normalização NFC e caracteres aceitos pelo backend),
  seleção das 27 UFs e status publicada/encerrada/cancelada integrados ao formulário.
- Criação começa como publicada; edição conserva o status recebido.
- PATCH e sua allowlist incluem os quatro campos e enviam somente alterações.
  Campos opcionais podem ser limpos explicitamente sem apagar os demais.
- Erros 400 dos novos campos aparecem junto aos respectivos controles.
  A verificação de persistência existente também compara os novos campos com a resposta
  da API; stores continuam recebendo os objetos retornados pelo servidor.
- Detalhes do freelancer mostram complementos preenchidos; preço principal continua
  separado da faixa salarial. Detalhes da empresa incluem localização e status,
  preservando suas ações. Cards mostram modalidade, localização e status de forma compacta.
- Candidaturas e favoritos preservados; status é informativo e não bloqueia ações.
  HomeEmpresa, autenticação, notificações e design system global não foram alterados.

## Compatibilidade

A modalidade estruturada tem prioridade. O prefixo exato `Modalidade: …` seguido
de duas quebras de linha funciona como fallback de leitura. Salvar outro campo ou
trocar para outra modalidade não regrava a descrição. Ao limpar explicitamente uma
modalidade com prefixo legado, o PATCH também envia o corpo da descrição sem esse
prefixo. Isso impede que a modalidade reapareça após um GET. O corpo não editado é
enviado sem truncamento ou trim adicional pelo frontend (o serializer B47 pode
aparar espaços externos). A ajuda do formulário explica esse efeito.
Se a pessoa alterar a descrição, o novo texto é enviado independentemente da modalidade.
Não há migração automática de vagas antigas nem mudança nas regras das F35/F36/F38/F42.

### Limitação contratual

O model, a migration 0021 e o serializer do backend B47 (commit
`d5c829f708577cebc565d9acee1d474d9fadde08`) usam `modalidade: ''` tanto para
legados quanto para remoções. Não existe marcador de migração/intenção. Um GET com
campo vazio e prefixo é indistinguível, inclusive se a modalidade foi removida por
outro cliente sem atualizar a descrição. O fallback continua interpretando esse caso
como legado; não há estado inventado nem armazenamento local para contornar isso.

Alternativas: retirar o fallback perderia a apresentação estruturada de vagas antigas;
introduzir um marcador exigiria evolução futura do backend, fora deste escopo;
retirar apenas o prefixo na remoção explícita é compatível com os campos atuais.
Esta última é a solução adotada. Não há como conservar o prefixo persistido e ao
mesmo tempo distinguir a remoção em todos os clientes usando somente o contrato atual.
Texto digitado explicitamente na descrição que reproduza o prefixo exato continuará
sujeito ao fallback, pois a API não informa sua intenção.

Na remoção, a confirmação também compara a descrição devolvida pelo servidor;
resposta que conserva o prefixo não confirma sucesso no formulário. UF/status com
espaços são rejeitados localmente, em acordo com os ChoiceFields B47: antes eram
validados após trim, mas enviados sem trim e recusados pelo backend.

## Arquivos

- `src/utils/vagaForm.js`
- `src/services/freelanceService.js`
- `src/components/CriarVagaComponent.vue`
- `src/components/OportunidadeDetalheComponent.vue`
- `src/components/OportunidadeComponent.vue`
- `src/views/DetalheVagaEmpresaView.vue`
- `tests/complementos-vagas.test.mjs`
- `tests/vagas.test.mjs` (expectativas ajustadas ao contrato estruturado)
- Este documento.

## Validação

- Auditoria final em 10/11/2026: repositório/origin conferidos, árvore inicialmente
  limpa, `git fetch origin` executado, branch FEAT-47 confirmada. HEAD e origin/FEAT-47
  em `a950133`; origin/DEV em `d08cb7a`. Nove arquivos no diff original do PR #96,
  lidos e comparados. Nenhuma alteração local alheia à tarefa encontrada.
- `node --test tests/complementos-vagas.test.mjs`: 9/9 aprovados.
- `node --test tests/complementos-vagas.test.mjs tests/vagas.test.mjs tests/oportunidades.test.mjs tests/oportunidades-integracao.test.mjs tests/favoritos.test.mjs tests/notificacoes.test.mjs`:
  159/159 aprovados. Inclui PATCH/novo GET de remoção legada, servidor ignorando
  descrição, erros 400 estruturados, transições de status e candidatura com os três
  status informativos, sem POST duplicado. Compilação SFC não substitui inspeção visual.
- `npm test`: 227/227 aprovados.
- `node --test tests/*.test.mjs`: 248/249 aprovados.
- `node --test tests/design-system.test.mjs`: 7/8 aprovados. A falha isolada F48
  permanece: `UNRESOLVED_ENTRY`, `Could not resolve entry module
  "../../../../C:/Users/Ricardo/Documents/Front_marujob/node_modules/.cache/feat48-compiled/entry.mjs"`.
  O teste usa `URL.pathname` (resultando em `/C:/...`) na entrada e imports do build.
  `git diff origin/DEV -- tests/design-system.test.mjs src/components/ui src/styles/tokens.css`
  vazio: arquivos idênticos à DEV, sem relação com a FEAT-47. Nenhum deles alterado.
- `npm run build`: aprovado. Neste Windows, o npm referencia outro perfil através de
  um link do NVM; a execução exigiu `NODE_OPTIONS=--preserve-symlinks --preserve-symlinks-main`
  e permissão fora do sandbox. Configurações do projeto permaneceram intactas.
  Tentativa no sandbox falhou com `Cannot read directory "../..": Access is denied`
  e `Could not resolve .../vite.config.js`; a repetição autorizada fora dele aprovou.
- `git diff --check`: sem erros de whitespace.

## Pendências

Validação manual com backend autenticado e inspeção visual em celular não foram
executadas. Os testes usam dados locais, sem gravar oportunidades reais.
O build avisa que a base Browserslist está desatualizada; dependências não foram alteradas.
Após a auditoria, o usuário autorizou commit e atualização do PR #96. As correções
serão incorporadas à FEAT-47 e enviadas para origin/FEAT-47, com atualização da
descrição do PR para registrar esta validação. Sem merge ou deploy solicitado.

Veredito local: **PRONTO COM RESSALVAS**, após incorporar estas correções ao PR.
Ressalvas: ambiguidade da API descrita acima, teste F48 incompatível com caminhos
Windows e validação manual pendente com ambas as contas/backend e em celular.
