# FEAT-36 — Gerenciamento das vagas da empresa

## Estado atual da revisão do PR #89

Os oito complementos já estão implementados na DEV remota do backend, commit
`d7e692c36ad9534c73a297b4c59246c6828ba84a` (PR #17). Model, serializer,
view e migration foram conferidos por leitura, sem modificar ou executar o
backend. Nomes, tipos e opções coincidem com o frontend; veja o
[contrato confirmado e fontes](FEAT-36-contrato-complementos.md).
Não foi comprovado deploy, aplicação de migrations ou CRUD no ambiente publicado.
As consultas de schema local descritas abaixo são diagnósticos históricos e não
descrevem a DEV remota atual nem certificam produção.

O problema de reutilização do formulário foi reproduzido no Chrome: após
`/criar-vaga` → `/editar-vaga/3601`, a mesma view manteve o título e composable de
criação. `CriarVagaView` agora usa uma chave reativa no componente filho composta
por modo, ID da vaga, ID/tipo da conta e revisão de sessão. A view permanece
montada, mas cada contexto recebe um formulário novo e o composable correto.
Fazer apenas `editando` virar computed não resolveria a seleção do composable
realizada no setup; por isso o ciclo de vida do filho é isolado.

POST/PATCH em andamento têm trava compartilhada por sessão, conta, método e ID
(no caso de PATCH), preservada ao sair e voltar à tela. Uma nova instância de
edição aguarda o PATCH anterior antes de recarregar a vaga. Instâncias desmontadas
não podem iniciar envios ou aplicar erros/respostas em outro contexto. Consultas
obsoletas são descartadas; rascunho de criação nunca é preenchido por uma edição.
O aviso de POST com complementos não confirmados também sobrevive à troca de
rotas na mesma sessão, impedindo republicação do mesmo rascunho.

Foram alinhados dois limites de validação: ano zero não é uma data válida no
contrato Django; alterar o mínimo acima de um máximo intacto deve continuar
gerando erro no frontend, mesmo que o máximo não entre no PATCH.

Esta revisão parte de árvore limpa na `FEAT-36` e deixa as correções apenas no
working tree, sem commit, push, merge ou deploy. O PR remoto #89 não é atualizado
automaticamente. As seções seguintes registram a implementação e suas etapas anteriores.

### Validação da revisão

- Linha de base: `npm test`, **119 aprovados, zero falhas**.
- Reprodução anterior à correção: Chrome falhou aguardando o título de edição
  após `router.push('/editar-vaga/3601')` vindo da criação; o modo permaneceu antigo.
- Após correção: `npm test`, **128 aprovados, zero falhas** (9 regressões adicionais).
- `node tests/gerenciamentoVagas.browser.mjs`: sucesso. Navega diretamente
  criação → edição A → edição B → criação com a mesma instância de view,
  verifica rascunho próprio preservado e nenhuma publicação durante a navegação;
  depois exercita POST, PATCH, detalhes, exclusão e layout com API simulada.
- `npm run build`: sucesso, incluindo PWA. Persiste aviso não bloqueante de
  Browserslist desatualizado, sem alteração de dependências nesta revisão.
- `git diff --check`: sucesso, sem erros de whitespace.

As regressões Node também cobrem POST/PATCH corretos, instâncias desmontadas,
respostas atrasadas de outro ID/conta, troca de conta, travas através da remontagem,
recarregamento após PATCH pendente, aviso de publicação parcial, opções exatas,
defaults retornados e validação da faixa/data. Nenhum teste chama a API real.

Arquivos desta revisão: `CriarVagaView.vue`, novo `useChaveFormularioVaga.js`,
`useCriarVaga.js`, `useEditarVaga.js`, `stores/vagas.js`, `utils/vagaForm.js`,
os dois testes de vagas/gerenciamento e os dois documentos FEAT-36.

## Diagnóstico e escopo

Branch `FEAT-36`, criada de `origin/DEV` atualizado, com árvore inicialmente limpa.
Frontend exclusivamente. A entrega inicial foi posteriormente publicada no PR #89
por autorização do usuário; a revisão atual não faz novas operações de publicação.

Os caminhos indicados na tarefa foram confirmados. `HomeEmpresaView.vue` compõe o
header e a Home; `CriarVagaView.vue` envolve o formulário. A Home dependia de
`ultimaPublicada` em memória e apresentava recomendações fictícias. O serviço
de vagas só publicava. O Axios centralizado já gerenciava JWT e refresh;
`authSession.js` oferecia identidade validada e revisão para isolamento de sessão.
Esses mecanismos foram reutilizados, assim como o guard e as validações existentes.

## Arquivos

| Arquivo | Alteração |
| --- | --- |
| `src/components/HomeEmpresaComponent.vue` | Histórico real, estados, ações e diálogo; remove recomendações simuladas |
| `src/components/CriarVagaComponent.vue` | Formulário compartilhado entre criação e edição |
| `src/composables/useEditarVaga.js` | Consulta, autorização, preenchimento, validação e salvamento |
| `src/stores/gerenciamentoVagas.js` | Listagem, última vaga, exclusão e mensagens; limpeza síncrona de sessão |
| `src/stores/vagas.js` | Limpeza síncrona da confirmação temporária ao mudar sessão |
| `src/services/freelanceService.js` | Listagem paginada, detalhe próprio, PATCH e DELETE |
| `src/utils/vagaForm.js` | Conversão legada, PATCH de campos alterados e duração sem unidade duplicada |
| `src/router/routes.js` | Nova rota protegida de edição |
| `tests/vagas.test.mjs` | Regressões com transporte Axios em memória |
| `tests/vagas.browser.mjs` | Fixture de publicação compatível com histórico persistente |
| `tests/gerenciamentoVagas.browser.mjs` | Chrome real com API interceptada; criação, histórico, edição, exclusão e layout |

`api.js`, `authService.js`, `authSession.js`, `authGuard.js`, o composable de criação
e as views existentes mantêm seus contratos. Nenhuma dependência adicionada.

## Contrato

No diagnóstico inicial, o schema local foi consultado, sem credenciais, em
`GET http://127.0.0.1:8000/api/schema/?format=json` (200).
Confirmou `empresa` inteiro, somente leitura e anulável; título até 100,
descrição até 200, tag até 50, preço decimal e tempo textual até 50.
`OPTIONS /api/freelances/` retornou 401 sem autenticação. Não foram realizadas
escritas reais nem leitura de arquivos do backend.

| Método | Endpoint | Confirmação |
| --- | --- | --- |
| GET | `/api/freelances/` | Envelope paginado |
| GET | `/api/freelances/{id}/` | Detalhe e verificação de propriedade |
| PATCH | `/api/freelances/{id}/` | HTTP 200 |
| DELETE | `/api/freelances/{id}/` | HTTP 204 |
| POST existente | `/api/freelances/` | HTTP 201 |

Exemplo ilustrativo do contrato, sem uso como dado da aplicação:

```json
{
  "count": 25,
  "next": "http://127.0.0.1:8000/api/freelances/?page=2",
  "previous": null,
  "results": [{"id": 12, "empresa": 7, "titulo": "Desenvolver um site", "descricao": "Modalidade: Remoto\n\nDescrição", "tag": "Desenvolvimento Web", "preco": "1500.00", "tempo": "40"}]
}
```

## Listagem, paginação e sessão

Ao entrar em `/homeEmpresa`, a lista é consultada novamente. Percorrem-se todas
as páginas sequencialmente; nenhuma lista parcial é apresentada como completa.
Cada resultado é filtrado por `empresa` igual ao `sessao.usuario.id` validado,
com normalização para comparação de IDs. `empresa=null` nunca é própria.
O `count` geral não é apresentado como total da empresa; o contador usa a lista filtrada.

`next` pode ser absoluto da mesma origem da API, relativo à raiz ou à consulta.
É validado contra origem e caminho exato da coleção configurada no Axios.
Credenciais na URL, fragmentos, outra origem ou outro recurso são rejeitados;
o cliente recebe apenas `freelances/?...`, evitando duplicação de `/api/`.
Há detecção de páginas repetidas e deduplicação de IDs. Falhas em qualquer página
geram erro com nova tentativa, sem histórico incompleto ou dados inventados.

ID, tipo e revisão são conferidos antes/depois das operações. A store limpa dados,
seleção e mensagens de forma síncrona em logout ou troca de conta. Consultas
concorrentes têm sequência; respostas antigas não substituem a mais recente.
Revisões antigas não continuam paginação ou mutações na nova sessão.
Tokens e refresh continuam exclusivamente no cliente Axios existente.

## Edição

`/editar-vaga/:id` exige autenticação e grupo empresa. A tela carrega o detalhe
e bloqueia o formulário até confirmar o proprietário. O serviço consulta novamente
o detalhe antes de PATCH/DELETE; vaga alheia não gera requisição de mutação.
Isso complementa, mas não substitui, autorização por objeto no servidor.

O formulário existente é reutilizado, sem duplicação. PATCH permite
`titulo`, `descricao`, `tag`, `preco`, `tempo` e os oito complementos do contrato
confirmado; nunca envia `empresa`.
Somente os campos alterados são enviados. Pagamento alterado é normalizado;
valores legados intactos, inclusive categoria fora da lista ou duração textual,
são preservados. O seletor mostra a categoria legada atual.

Apenas `Modalidade: Remoto\n\n`, `Modalidade: Híbrido\n\n` e
`Modalidade: Presencial\n\n` no início são extraídos. Texto arbitrário ou prefixos
incompletos ficam intactos. Ao salvar uma mudança de descrição/modalidade, gera-se
um único prefixo. Sem prefixo reconhecido, exige seleção explícita. Textos longos
nunca são truncados pelo formulário de edição; mudanças incompatíveis com os
limites pedem correção, mantendo o conteúdo digitado. Valores intactos não são
reescritos pelo PATCH.

Após 200, a store é atualizada, há confirmação acessível e retorno à Home, que
consulta novamente a API. Falhas 400 são mapeadas aos campos; 401/403/404/5xx e
rede têm mensagens específicas. Falha não apaga o formulário; submissão simultânea
é bloqueada. Resposta de uma tela desmontada não força navegação.

## Exclusão e estados

O diálogo nativo identifica a vaga, avisa que a ação é irreversível e que
candidaturas vinculadas poderão ser removidas permanentemente. Não inventa
quantidade de candidaturas. Cancelar/Escape não enviam DELETE. Foco inicial em
Cancelar, confinamento nativo do foco e restauração ao acionador; após remover
o card, foco retorna ao título da seção.

Durante a exclusão, botões e Escape ficam bloqueados. Só após 204 o card é
removido, a contagem e a última vaga são recalculadas e o sucesso é anunciado.
Falhas mantêm a vaga e apresentam erro no diálogo; sessão encerrada limpa dados.

A Home distingue carregamento, vazio com CTA `/criar-vaga`, erro com nova tentativa
e sucesso com `role="status"`. Textos usam interpolação Vue, sem HTML da API.
Preço reutiliza `formatarPagamento`; duração numérica ganha horas, duração textual
é mostrada intacta. Recomendações fictícias foram removidas.

## Limitações e pendências

- A API não filtra exclusivamente o proprietário: percorrer todas as páginas
  custa mais requisições. Um endpoint de vagas próprias melhoraria eficiência.
- A data de publicação agora existe na DEV do backend, mas é opcional e escolhida
  pela empresa. A seção de última vaga da Home continua usando maior ID como
  aproximação explicitada na interface; não há garantia de ordenação cronológica.
- Não existem status, localização, contagem de candidatos ou modalidade separada.
- Candidaturas podem ser removidas por CASCADE. Nenhuma regra de retenção alterada.
- Recomendações de profissionais aguardam contrato real de uma futura funcionalidade.
- Paginação não fornece snapshot: alterações concorrentes no servidor podem afetar
  páginas; nova consulta reconcilia o histórico.
- Permissões reais do servidor e CRUD autenticado devem ser homologados com conta
  de teste autorizada; esta entrega não usa credenciais nem altera dados reais.
- Mantido o layout compacto do projeto (máximo 420px, inclusive em desktop).

## Validação

Antes das alterações: `npm test` **67/67**, sem falhas. Build inicial bloqueado
pelo sandbox do esbuild; repetido com permissão, concluiu com sucesso.

Testes após implementação usam Node Test Runner, Vue renderer e Axios em memória,
sem API real. O teste de navegador intercepta todas as chamadas de API e cobre
também a criação anterior, validação, erro 400, pagamento, prevenção de envio
duplo, confirmação, histórico após reload, isolamento, edição, exclusão,
aviso de candidaturas, Escape, foco e ausência de rolagem horizontal.

Chrome executado em 375, 768 e 1280px para Home, diálogo e edição; criação também
em 320, 375, 390, 430, 768 e 1440px. Capturas em
`node_modules/.cache/feat36-navegador/`, fora do Git. Capturas de Home, diálogo e
edição foram inspecionadas visualmente. Campos legíveis e botões de pelo menos
44px; layout compacto preservado. Resultado final dos comandos registrado abaixo.

| Comando final | Resultado |
| --- | --- |
| `npm test` | **90 testes aprovados, 0 falhas** (67 anteriores e 23 novos) |
| `npm run build` | **Sucesso**, incluindo geração PWA; aviso não bloqueante de base Browserslist antiga |
| `node tests/gerenciamentoVagas.browser.mjs` | **Sucesso** em todos os fluxos e larguras descritos |
| `git diff --check` | **Sucesso**, sem erros de whitespace |

Houve correções durante a validação: imports assíncronos dos testes foram movidos
para a preparação inicial do runner; textos foram corrigidos para UTF-8; a
comparação de foco do navegador passou a aparar espaços do texto gerados pelo
formatador. Nenhum teste foi desabilitado. O sandbox bloqueou inicialmente o
esbuild e o Chrome; ambos foram repetidos com permissão e concluíram.

## Ajuste visual conforme referências locais

Após a primeira entrega, foram inspecionadas as três imagens fornecidas em
`C:/Users/Ricardo/Documents/ImagemCodex`. O visual da área da empresa foi
aproximado dessas referências: cabeçalho compacto com marca e fundo roxo,
paleta lilás, cards claros arredondados com ícone de pasta, etiquetas de categoria,
campos suaves e barra inferior centralizada. O formato compacto até 420px foi
mantido também no desktop, conforme as referências móveis e o padrão do projeto.

`EmpresaHeader.vue` é compartilhado pela Home e pelo formulário; somente
`HomeEmpresaView.vue` passa a usá-lo, preservando o header das telas freelancer.
`FooterEmpresaComponent.vue` recebeu ajustes de cor, centralização e foco.
O CSS antigo das duas telas foi substituído para remover regras duplicadas e
estilos das recomendações que não existem mais. A Home também oferece busca
por título/descrição/tag e filtro pelas categorias das vagas reais da empresa;
esses filtros são limpos quando a sessão muda.

Os campos ausentes no contrato que aparecem nas imagens (requisitos, benefícios,
faixa salarial etc.) não foram simulados. Edição, publicação e confirmação de
exclusão continuam usando os mesmos contratos e proteções.

Validação do ajuste: 90 testes Node aprovados; build de produção com PWA concluído;
Chrome com dados interceptados passou nos fluxos e larguras anteriores, incluindo
busca sem resultados e limpeza da busca. Capturas atualizadas em
`node_modules/.cache/feat36-navegador/`.

## Página de detalhes da oportunidade

A rota `/empresa/vagas/:id` (`detalhe-vaga-empresa`) permite abrir uma vaga pelos
títulos dos cards (inclusive a última publicação) ou pelo botão **Ver detalhes**.
É protegida para empresas autenticadas; não modifica a rota de detalhes freelancer.

`DetalheVagaEmpresaView.vue` segue a referência da terceira imagem fornecida:
cabeçalho compacto, resumo com ícone/título/empresa/pagamento, bloco de descrição,
grade de informações e ações inferiores. Para os dados da vaga, exibe os campos reais:
descrição completa, categoria, pagamento, duração e modalidade se reconhecida
no prefixo do frontend. A descrição legada é preservada.

Após nova comparação com a referência, a estrutura foi completada com os blocos
**Descrição da vaga**, **Requisitos**, **Benefícios** e uma grade de seis cartões
na ordem da imagem: **Data de publicação**, **Categoria**, **Faixa salarial**,
**Tipo de trabalho**, **Nível de experiência** e **Jornada de trabalho**.
Naquela etapa, o schema local foi novamente consultado (HTTP 200): requisitos, benefícios,
data de publicação, faixa salarial, tipo de trabalho, nível de experiência e
jornada estavam ausentes. Atualmente esses espaços usam os valores da API quando
retornados, ou **Não disponível** quando vazios/nulos, sem atribuir valores inventados.
Categoria mostra a tag real; pagamento único, duração estimada e modalidade
identificada ficam no resumo. Preço único não representa uma faixa salarial;
duração estimada do projeto não representa jornada ou tipo de contratação.
O selo de destaque da imagem não foi atribuído às vagas sem suporte no contrato.
Na área da empresa, a ação do desenho de candidatura é substituída por editar;
as rotas e ações freelancer continuam preservadas.

`useDetalheVagaEmpresa.js` consulta o detalhe próprio da API, inclusive ao acessar
diretamente a URL ou recarregar. Não depende do histórico da store. Oferece
loading, erro e nova tentativa; verifica propriedade no serviço e descarta
respostas após troca de rota, logout, troca de conta ou desmontagem da tela.

Editar encaminha ao formulário existente. Excluir usa o novo componente
compartilhado `ConfirmarExclusaoVaga.vue`, também utilizado pela Home, preservando
aviso de candidaturas, foco, Escape e bloqueio de cliques repetidos. Após 204,
retorna à Home com sucesso e listagem atualizada.

Validação após inclusão: **96 testes Node aprovados, sem falhas**. Foram adicionados
testes de carregamento sem store prévia, mudança de ID, erros 403/404/500 com
nova tentativa, propriedade alheia, resposta atrasada e proteção da rota.
O teste de navegador também cobre abertura pelo título e pelo botão, reload do
detalhe, edição e exclusão a partir da página; verifica os três blocos, os seis
rótulos na ordem da referência e os cinco cartões de dados indisponíveis.
Capturas de detalhes em
375/768/1280px ficam em `node_modules/.cache/feat36-navegador/detalhe-*.png`.

Resumo Git atualizado: 10 arquivos rastreados modificados e 8 novos (cabeçalho,
diálogo compartilhado, dois composables, store, view de detalhes, teste de
navegador e este documento). Nenhum arquivo do backend alterado.

## Formulário dos complementos

Em solicitação posterior, o usuário autorizou preparar os novos campos no
frontend para conectá-los ao backend depois. Essa ampliação substitui a decisão
anterior de manter apenas espaços estáticos com `Não disponível`.

Criação e edição agora aceitam requisitos, benefícios, tipo de contratação,
nível de experiência, jornada, data de publicação e extremos da faixa salarial.
São opcionais para preservar vagas antigas; valores preenchidos são enviados
em campos JSON separados. O pagamento e a duração originais permanecem.
Os detalhes passam a mostrar os novos valores quando retornados pela API.

O contrato foi confirmado na DEV remota do backend durante a revisão: consulte
[FEAT-36-contrato-complementos.md](FEAT-36-contrato-complementos.md) para nomes,
tipos, validações, exemplo de POST, limpeza via PATCH e tratamento de respostas
que ignorem os campos. A disponibilidade publicada continua sem homologação.
Não houve alteração no backend nem persistência simulada.

Validação desta ampliação: **104 testes aprovados, 0 falhas**; Chrome com
transporte simulado confirmou payload, retorno dos complementos, reabertura da
edição, renderização dos detalhes e layout em 375/768/1280px. Build de produção
e PWA concluídos; `git diff --check` sem erros.
