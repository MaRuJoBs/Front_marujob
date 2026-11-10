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
de duas quebras de linha funciona como fallback de leitura. Sua remoção é somente
visual/no formulário: salvar outro campo ou mudar modalidade não regrava a descrição.
Se a pessoa alterar a descrição, o novo texto é enviado independentemente da modalidade.
Não há migração automática de vagas antigas nem mudança nas regras das F35/F36/F38/F42.

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

- `node --test tests/complementos-vagas.test.mjs`: quatro testes aprovados — criação,
  edição parcial, legado e regressão F42/F38 com compilação dos componentes alterados.
- Suíte ampliada (`node --test tests/*.test.mjs`): 239 de 240 aprovados, incluindo
  os 74 testes de vagas/complementos. O teste de build isolado do design system F48
  falha por resolução de caminho Windows (`UNRESOLVED_ENTRY`), fora dos arquivos alterados.
- `npm run build`: aprovado. Neste Windows, o npm referencia outro perfil através de
  um link do NVM; a execução exigiu `NODE_OPTIONS=--preserve-symlinks --preserve-symlinks-main`
  e permissão fora do sandbox. Configurações do projeto permaneceram intactas.
- `git diff --check`: sem erros de whitespace.

## Pendências

Validação manual com backend autenticado e inspeção visual em celular não foram
executadas. Os testes usam dados locais, sem gravar oportunidades reais.
O build avisa que a base Browserslist está desatualizada; dependências não foram alteradas.
Commit, push e PR autorizados pelo usuário.
