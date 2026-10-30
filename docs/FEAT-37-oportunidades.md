# FEAT-37 — Oportunidades: integração e referências visuais

## Identificação e estado Git

- Raiz: `/mnt/c/Users/omtra/OneDrive/Documentos/Front_marujob`.
- Branch: `FEAT-37`. Commit de partida: `32a0a35d90983b3237a6f724e3e80ab77c792da8`.
- Na implementação funcional inicial, o Git estava limpo, sem merge ou rebase pendente.
- No início do ajuste visual, já existiam seis arquivos modificados e oito não rastreados, incluindo as duas imagens fornecidas pelo usuário. Todo esse trabalho foi preservado.
- No início da reconstrução solicitada em seguida, já havia sete arquivos modificados e nove não rastreados; esse trabalho também foi preservado.
- Estado final da reconstrução: sete arquivos rastreados modificados e nove não rastreados, incluindo as duas referências intactas. Nada foi adicionado ao staging.
- Nenhum commit, push, merge, rebase ou deploy foi executado. Nenhum backend ou outro repositório foi acessado para implementação ou modificado.

## Referências abertas e analisadas

As duas imagens foram abertas visualmente, sem alteração:

1. `telas/Captura de tela 2026-10-30 171627.png`: listagem mobile. Ondas roxas no topo; pesquisa arredondada e filtro à direita; chips horizontais e filtros ativos; cards lilás com divisão horizontal, coração no canto, valor à direita e botão centralizado na base; aviso de favoritos e menu inferior.
2. `telas/Captura de tela 2026-10-30 171653.png`: detalhes mobile. Seta, título central e subtítulo, coração à direita; blocos claros com pequenos ícones laterais; informações verticais; contato e candidatura no final da página.

## Componentes existentes e mudanças

A rota `/freelances` continua usando `FreelancesView.vue` e `OportunidadeComponent.vue`. `/oportunidade/:id` continua apontando diretamente para `OportunidadeDetalheComponent.vue`; a view de detalhes existente não é usada nessa rota e não foi duplicada. Não foram criadas novas telas ou rotas.

A implementação anterior baixava todas as páginas e filtrava em memória. A etapa funcional substituiu isso por paginação e filtros de servidor. A etapa visual preserva esse contrato.

### Listagem

A reconstrução reorganizou a página em um cabeçalho próprio e uma região de resultados. O topo usa curvas SVG em três tons de lilás, em vez das elipses recortadas anteriores; pesquisa e filtro ficam alinhados com a mesma altura. Chips pequenos ficam em uma faixa rolável. “Selecionar tag” abre o painel existente; uma tag aplicada fica destacada e sincronizada. Não há categorias inventadas ou catálogo derivado de uma página.

Os cards foram reestruturados em três áreas: cabeçalho com título/tag e coração; corpo com descrição em até duas linhas e linha de tempo/valor; rodapé com botão e divisórias laterais. O valor deixou de ocupar uma linha isolada e o botão deixou de usar margem negativa sobre a borda. A tipografia e os espaçamentos seguem uma escala comum. A contagem foi movida para a paginação para reduzir elementos no topo. O aviso de favoritos permanece após o segundo card.

O chip “Todos” limpa a tag e preserva preços; “Remover filtros” limpa tag e preços, preservando a pesquisa. A pesquisa tem limpeza independente. Descrição completa permanece nos detalhes.

### Detalhes

Cabeçalho em grade com colunas laterais iguais, título real central e tag como subtítulo, resistente a títulos extensos. “Sobre a oportunidade” e “Informações Principais” são cards claros com ícones de documento/lista em pequenos fundos lilás, corpo de texto com 14 px e linhas de informação alinhadas. O valor permanece discreto no canto inferior do card de informações.

A antiga disposição com `margin-top: auto` foi retirada: a candidatura agora segue os cards com 24 px de separação, sem afastamento artificial para compensar a ausência de atividades/requisitos. O background continua atrás da navegação inferior e o espaço final permite alcançar todos os controles por rolagem.

O bloco “Dúvidas?” e o botão desabilitado “Enviar Mensagem” foram removidos nesta reconstrução: `MensagensView.vue` só tem um título, sem contato real com o recrutador. Não se apresenta uma ação de mensagem inexistente. “Quero me candidatar” permanece largo, roxo e arredondado, com a explicação de indisponibilidade e sem requisição ou confirmação simulada.

### Favoritos, acessibilidade e footer

A lógica existente de localStorage foi extraída para `useFavoritosLocais.js`, usando a mesma chave `favoritos` e os mesmos IDs. Listagem e detalhes agora compartilham esse estado. Não foi criado outro armazenamento, endpoint ou sistema de favoritos. O coração dos detalhes anteriormente era apenas visual; agora persiste no mecanismo local existente. Falhas ao salvar não alteram o estado persistido nem escondem os cards.

O painel recebe foco ao abrir, mantém a navegação Tab dentro dele e devolve o foco ao botão ao fechar. Controles têm identificação acessível, foco visível e estados de seleção. Tons de texto secundário foram escurecidos para melhorar legibilidade.

O único ajuste global é uma linha em `Footer.vue`: `width: 420px` passou a `width: min(100%, 420px)`. A largura fixa excedia viewports mobile menores. Ícones, rotas, altura, cores e estrutura do menu foram preservados. Não há segunda navegação. Header global intacto.

## Integração e autenticação preservadas

Todas as chamadas de oportunidades usam o `freelanceService.js`, que importa a mesma instância `services/api.js` existente. Nenhum `fetch`, cliente Axios adicional ou URL de ambiente foi introduzido nas telas.

- GET `freelances/`, relativo à base configurada `/api/`.
- GET `freelances/{id}/` para detalhes, com ID da rota.
- Parâmetros: `search`, `tag`, `preco_min`, `preco_max`, `page`; valores vazios omitidos.
- Resposta esperada: `{ count, next, previous, results }`.
- Uma página por consulta; `next` e `previous` controlam a disponibilidade dos botões. A navegação usa o número da página e os filtros atuais, sem seguir URLs absolutas retornadas.
- Pesquisa/filtros retornam à página 1; limpeza dos filtros preserva a pesquisa. Páginas inexistentes oferecem nova tentativa na primeira página.
- Debounce de 350 ms, AbortController e revisão das consultas impedem respostas obsoletas de substituir resultados atuais.
- Até 200 caracteres Unicode e 20 termos; preço não negativo, mínimo menor ou igual ao máximo; zero permitido. Vírgula decimal normalizada.
- Carregamento, vazio, 400, 401, 403, 404 e falhas de conexão mantidos. Campos opcionais ausentes não quebram as telas.
- JWT, renovação e guards existentes não foram modificados.
- `.env.development`: `http://127.0.0.1:8000/api/`; `.env.production`: `https://marujob.class.fabricadesoftware.ifc.edu.br/api/`. Ambiente pode sobrescrever a base via `VITE_API_URL`.

## API publicada: resultado das consultas somente de leitura

Em 30/10/2026, a API local configurada não conectou. Não foi iniciado nem corrigido backend.

A API publicada respondeu sem JWT. A primeira página retornou dez de 16 registros; a segunda, seis registros, com `previous` e sem `next`. Os campos presentes foram `id`, `titulo`, `descricao`, `tag`, `preco`, `tempo`. `empresa` estava ausente. OPTIONS confirmou preço decimal e tempo string, sem moeda ou unidade.

GETs separados com `search=FEAT37_verificacao_sem_resultado`, `tag=FEAT37_tag_inexistente`, `preco_min=99999999` e `preco_max=0` retornaram os mesmos IDs e contagem da primeira página sem filtros, incluindo registros incompatíveis com os parâmetros. Pesquisa com 201 caracteres também retornou 200 e os mesmos resultados.

Isso confirma que os filtros e a validação FEAT-37 não estão operacionais nessa URL publicada. A intenção da permissão pública e a versão efetivamente implantada não podem ser determinadas somente por essas respostas. A integração real depende da disponibilização e confirmação do contrato backend FEAT-37. Não houve login, requisição de escrita ou alteração de produção.

## Conteúdo da referência que não pode ser exibido como dado real

Não existem campos próprios confirmados para empresa/nome, localização, data, horário, modalidade, requisitos, atividades, experiência, benefícios ou periodicidade de pagamento. Seções de atividades e requisitos ficam ocultas; não se divide a descrição automaticamente para preenchê-las.

Preço é formatado como decimal, sem símbolo de moeda ou periodicidade. Tempo é mostrado literalmente, sem acrescentar horas ou criar jornada. Tag não é tratada como categoria estruturada. Descrição e tag nulas são omitidas; preço ausente apresenta “Não informado”. Nenhum texto de exemplo das imagens foi copiado para dados de produção.

As diferenças visuais deliberadas são: menos chips sem catálogo, informações reais diferentes dos exemplos, ausência dos blocos sem dados, controles confortáveis para toque, paginação adicional e aviso de candidatura indisponível. O botão de mensagem é omitido por não haver ação real. A candidatura vem após os cards, em vez de ficar separada por um vazio para preencher a altura da tela. O menu inferior existente também é mantido nos detalhes. Tablet/desktop seguem o padrão anterior de coluna central de até 420 px; a área externa e seu tema são do projeto existente.

## Dependências de candidaturas e favoritos

Candidatura continua sem ação de rede: não há endpoint confirmado neste frontend. O fluxo depende da FEAT responsável (FEAT-41), sem simulação de sucesso.

Favoritos continuam locais; a persistência de backend FEAT-38 não está integrada neste repositório. `FavoritosComponent.vue` permanece com sua limitação preexistente: consulta somente a primeira página, podendo omitir favoritos de páginas posteriores. Não houve alteração nessa página nem recriação dessa FEAT.

## Arquivos envolvidos

| Arquivo | Situação e finalidade |
| --- | --- |
| `package.json` | Modificado na etapa funcional: inclui os dois testes automatizados de oportunidades, sem dependências novas. |
| `src/components/OportunidadeComponent.vue` | Modificado: template/estilos da listagem conforme referência; consumo do composable preservado. |
| `src/components/OportunidadeDetalheComponent.vue` | Modificado: cabeçalho centralizado, cards reorganizados, candidatura próxima ao conteúdo e favoritos locais reais. |
| `src/components/Filtros.vue` | Modificado: filtro por tag/preço, botão visual, foco e navegação por teclado. |
| `src/components/Footer.vue` | Modificado: somente largura responsiva, necessária para viewports menores que 420 px. |
| `src/views/FreelancesView.vue` | Modificado na etapa funcional: removida URL absoluta não utilizada; view reaproveitada. |
| `src/services/freelanceService.js` | Modificado na etapa funcional: GET de listagem/detalhes; POST existente preservado. |
| `src/composables/useOportunidades.js` | Novo na etapa funcional: consulta/paginação, agora reutiliza favoritos extraídos. |
| `src/composables/useFavoritosLocais.js` | Novo nesta etapa: reaproveita a persistência local nas duas telas. |
| `src/utils/oportunidades.js` | Novo na etapa funcional: parâmetros, formatação decimal e mensagens de erro. |
| `tests/oportunidades.test.mjs` | Novo na etapa funcional: quatro testes de parâmetros, limites, erros e valores opcionais. |
| `tests/oportunidades-integracao.test.mjs` | Novo na etapa funcional; agora 11 testes, incluindo estado compartilhado de favoritos e falha de armazenamento. |
| `tests/oportunidades.browser.mjs` | Novo na etapa funcional, adaptado nesta etapa: roteiro opcional real de navegador, mocks só no teste e screenshots com viewport exato. |
| `docs/FEAT-37-oportunidades.md` | Relatório atualizado. |
| `telas/Captura de tela 2026-10-30 171627.png` | Referência fornecida, não rastreada e não modificada. |
| `telas/Captura de tela 2026-10-30 171653.png` | Referência fornecida, não rastreada e não modificada. |

## Testes e comparação visual

- `npm test`: PASSOU nos quatro arquivos configurados, zero falhas. O runner agrupa a saída por arquivo. A contagem individual foi conferida executando os arquivos diretamente: autenticação 43, criação de vagas 24, utilitários de oportunidades 4 e integração de oportunidades 11, totalizando **82 testes aprovados**.
- Os testes de oportunidades cobrem paginação com 11 registros, parâmetros combinados, limpeza, debounce, respostas antigas, erros 400/401/404/500/rede, favoritos locais e compartilhados, falha de armazenamento e detalhes com campos opcionais.
- `npm run build`: PASSOU, incluindo geração PWA/service worker. Somente aviso de Browserslist desatualizado. Nenhuma dependência nova; nenhum arquivo de build integra o diff.
- Prettier e `git diff --check`: aprovados nos arquivos da entrega. Não há script de lint configurado.
- `node tests/oportunidades.browser.mjs`: **12/12 cenários aprovados novamente após a reconstrução** em Chrome headless real: duas telas × 320, 375, 390, 430, 768 e 1440 px, altura 1000 px. A largura `innerWidth` foi conferida em cada cenário.
- O roteiro monta os componentes e estilos reais com App/footer, router em memória e transporte Axios exclusivamente simulado. Verifica paginação, pesquisa, retorno aos detalhes, favoritos compartilhados, foco e largura dos filtros, títulos extensos, campos opcionais nulos, preservação de candidatura e ausência de rolagem horizontal.
- Foram capturadas as duas páginas em todas as seis larguras. Capturas inspecionadas visualmente incluem ambas em 375 px, listagem em 320/1440 px e detalhes em 430 px. Comparação humana com as duas imagens de referência realizada; não é uma comparação pixel a pixel. Foi gerada e inspecionada uma captura adicional lado a lado, `comparacao.png`, além de `comparacao.html` para avaliação local pelo usuário.
- As tentativas iniciais falharam na comunicação de depuração Windows/Linux; uma captura por CLI também revelou viewport interno de 500 px recortado. Essas capturas não foram usadas para aprovar mobile. A execução final utiliza CDP via PowerShell para emulação real, com verificação explícita da largura.
- O roteiro visual é opcional e não participa de `npm test` ou `npm run build`. No ambiente atual requer Chrome Windows e PowerShell acessíveis pelo WSL. Uma CI de outro sistema precisará adaptar o lançador. Não há workflow de CI versionado neste repositório.
- Não foram testados dispositivo físico, leitor de tela, preferência de fontes do usuário ou integração autenticada contra API real da FEAT-37. As screenshots usam fixtures de teste, nunca oportunidades fictícias em produção.

As capturas ficam ignoradas pelo Git em `node_modules/.cache/feat37-redesign/`: `listagem-{largura}.png`, `detalhes-{largura}.png`, `comparacao.html` e `comparacao.png`. As capturas da versão anterior permanecem em `node_modules/.cache/feat37-navegador/` para comparação, sem entrar no Git. Para inspeção manual com dados reais: `npm run dev`, autenticar com uma conta existente e abrir `/freelances` e `/oportunidade/{id}`. Filtros dependem da publicação backend descrita acima.

## Classificação

**APTA COM RESSALVAS.** Os templates e estilos das duas telas foram reconstruídos, comparados lado a lado com as referências, compilados e verificados em navegador real nas seis larguras. Pesquisa, filtros e paginação preservam o contrato frontend, mas os filtros da API publicada continuam indisponíveis. Candidatura, contato real e persistência FEAT-38 continuam dependências externas documentadas. Nenhuma fidelidade pixel a pixel ou integração completa em produção é alegada.

Sem stage, commit ou publicação. Aguardando autorização para próximas etapas.

## Escopo desta reconstrução visual

Nesta última solicitação foram alterados somente `OportunidadeComponent.vue`, `OportunidadeDetalheComponent.vue`, `Filtros.vue`, o roteiro `tests/oportunidades.browser.mjs` e este documento. Não foram criados novos arquivos de produção nem alterados os composables, serviços Axios, guards, favoritos ou candidaturas. As mudanças anteriores de `Footer.vue` e demais arquivos continuam preservadas. Nenhuma dependência foi instalada.

A aparência final é uma adaptação das referências ao contrato disponível, não uma reprodução de seu conteúdo fictício. Em detalhes com poucos campos haverá área livre após a candidatura; não existe mais um espaçamento artificial entre os cards e o botão. Dispositivos físicos e integração real autenticada não foram validados nesta reconstrução.
