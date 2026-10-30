# Integração dos campos complementares da vaga

O usuário autorizou preparar o frontend para os campos da referência visual.
Este documento é a **proposta de contrato para implementação no backend**,
não uma descrição de funcionalidades já existentes no servidor.
Nenhum arquivo do backend foi alterado.

## Campos enviados

Continuam sendo usados POST `/api/freelances/`, PATCH e GET
`/api/freelances/{id}/`, com o Axios e JWT existentes. Os cinco campos antigos
permanecem: `titulo`, `descricao`, `tag`, `preco`, `tempo`. Modalidade continua
no prefixo reconhecido de `descricao`; não se propõe alterá-la nesta integração.

| Campo JSON | Tipo/formato proposto | Regra do frontend |
| --- | --- | --- |
| `requisitos` | string | Opcional, até 1000 caracteres |
| `beneficios` | string | Opcional, até 1000 caracteres |
| `tipo_contratacao` | string | CLT, PJ, Autônomo, Temporário, Estágio, Outros |
| `nivel_experiencia` | string | Iniciante, Júnior, Pleno, Sênior, Especialista |
| `jornada_trabalho` | string | Opcional, até 100 caracteres |
| `data_publicacao` | string `YYYY-MM-DD` ou null | Data opcional selecionada pela empresa, sem preenchimento fictício automático |
| `salario_minimo` | string decimal ou null | De 0 a 99999999.99, até 2 casas decimais |
| `salario_maximo` | string decimal ou null | Mesmo limite; maior ou igual ao mínimo |

Os campos são opcionais para preservar publicação e edição de vagas antigas.
Se informar faixa salarial, preencher os dois extremos. Vírgula digitada é
convertida para ponto no JSON, preservando centavos. `preco` é o pagamento único
do contrato anterior e continua obrigatório: não é substituído pela faixa salarial.
`tempo` é a duração do projeto em horas, distinta da jornada de trabalho.

Se o backend preferir gerar `data_publicacao` automaticamente, é necessário
alinhar o contrato e tornar esse campo somente leitura no frontend antes de
integrar. Atualmente o formulário permite informá-lo explicitamente, como os
demais dados solicitados. Não há data inventada para oportunidades antigas.

## Exemplo de POST

Exemplo documental, sem publicação real:

```json
{
  "titulo": "Desenvolver uma página",
  "descricao": "Modalidade: Remoto\n\nDesenvolvimento de uma página responsiva.",
  "tag": "Desenvolvimento Web",
  "preco": "1500.00",
  "tempo": "40",
  "requisitos": "Conhecimento em Vue e acessibilidade.",
  "beneficios": "Horário flexível.",
  "tipo_contratacao": "PJ",
  "nivel_experiencia": "Pleno",
  "jornada_trabalho": "Segunda a sexta, das 9h às 18h",
  "data_publicacao": "2026-10-30",
  "salario_minimo": "2000.50",
  "salario_maximo": "3500.00"
}
```

Campo complementar vazio é omitido no POST. No PATCH, só são enviados campos
alterados; limpar texto envia `""`, limpar data ou preço da faixa envia `null`.
Campos complementares intactos são omitidos, inclusive valores legados fora
das opções atuais. Textos carregados não são truncados silenciosamente.
Não são enviados `empresa`, `id`, permissões ou status para transferir propriedade.

## Resposta esperada

Após POST 201/PATCH 200, o servidor deve retornar os dados persistidos, incluindo
os campos complementares enviados. GET de detalhe e itens paginados de listagem
também devem incluir esses campos para que apareçam após recarregar e na edição.
Um datetime ISO em `data_publicacao` também é lido; o formulário usa os primeiros
10 caracteres e a tela mostra `DD/MM/YYYY`, sem deslocamento de fuso do dia.

O backend deve validar campos, valores monetários, extremos da faixa, permissões
por proprietário e datas. Erros de validação podem seguir o padrão existente:

```json
{
  "requisitos": ["Revise os requisitos."],
  "salario_maximo": ["O máximo deve ser maior ou igual ao mínimo."]
}
```

Esses erros são associados aos campos corretos. Campos digitados são mantidos.
Não deve haver fallback que envie novamente a vaga sem os complementos.

## Enquanto o backend ainda não suporta os campos

O frontend já permite preencher, validar, enviar, carregar e apresentar os dados.
Ele **não simula persistência** com localStorage nem usa o rascunho como resposta
real da API. Os detalhes mostram `Não disponível` para dados não retornados.

HTTP 201/200 sozinho pode não significar que campos novos foram aceitos: alguns
serializers ignoram propriedades desconhecidas. O frontend compara os valores
enviados com os retornados, normalizando preços/datas:

- POST com campos ignorados: informa que a vaga foi publicada, mas os complementos
  não foram confirmados; mantém rascunho em memória e mostra os valores em um
  painel expansível para consulta/cópia. Bloqueia republicação nessa tela para
  evitar duplicação. Não redireciona automaticamente.
- PATCH com campos ignorados: mostra aviso e mantém o formulário aberto e intacto;
  permite tentar novamente após integração, sem anunciar salvamento completo.
- Sucesso com campos retornados: fluxo normal de confirmação e retorno à Home.
- 400/rede/5xx: mantém os dados e exibe erro, sem segunda requisição automática.

Rascunho em memória não é backup permanente: pode ser perdido ao recarregar ou
encerrar a sessão. Valores complementares só persistem após implementação no backend.

## Arquivos preparados

- `src/utils/vagaForm.js`: definições, opções, validação, payloads, hidratação,
  formatação e verificação de campos não confirmados.
- `src/components/CriarVagaComponent.vue`: campos acessíveis compartilhados por
  criação/edição, sem duplicação de formulário.
- `src/services/freelanceService.js`: allowlist de campos do PATCH ampliada.
- `src/composables/useCriarVaga.js`, `useEditarVaga.js` e `src/stores/vagas.js`:
  tratamento de respostas e preservação dos dados não confirmados.
- `src/views/DetalheVagaEmpresaView.vue`: requisitos, benefícios e grade do layout
  passam a usar os valores da API, com fallback honesto para vagas antigas.

Testes Node e Chrome usam transporte simulado, incluindo resposta futura com os
novos campos. Nenhum dado real, credencial ou arquivo de produção foi modificado.
