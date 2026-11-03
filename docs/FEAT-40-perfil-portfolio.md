# FEAT-40 — Perfil e portfólio profissional

## Preparação e diagnóstico

Branch `FEAT-40`, criada de `origin/DEV` após fetch em 03/11/2026. Repositório confirmado como Front_marujob; árvore inicialmente limpa. Não houve commit, push, merge, deploy ou PR.

Foram lidos os componentes, composables, serviços e views solicitados, além das rotas, autenticação, App e testes existentes. As views continuam sendo wrappers; a rota de edição já apontava para PortfolioAdicionarComponent e foi preservada.

| Situação confirmada na base                       | Intervenção                                                 |
| ------------------------------------------------- | ----------------------------------------------------------- |
| Tags pré-selecionadas fictícias no novo projeto   | Lista inicial vazia                                         |
| Profissão e cidade fixas no cabeçalho             | GET do perfil                                               |
| Apenas primeira página de projetos                | Percorre next com validação de origem, caminho e ciclos     |
| Erros apenas no console em perfil e projetos      | Estados de erro, retry e mensagens por campo                |
| URLs de imagem concatenadas de formas distintas   | Resolução compartilhada contra origem da API                |
| Sem proteção local para respostas de outra sessão | Cancelamento, revisão e sequência de consultas              |
| Redirecionamentos por setTimeout                  | Confirmação da API e navegação explícita por links          |
| Contador de horas sem endpoint                    | Removido                                                    |
| Footer local e global simultâneos                 | Removido footer local; adicionar projeto permanece na lista |

Já estavam corretos: limpeza de coordenadas e metadados na seleção manual, JSON.stringify de habilidades/tags no multipart e interrupção de streams ativos da câmera. Foram preservados; adicionada proteção para stream obtido após fechamento/desmontagem e para geocodificação atrasada.

## Estrutura e arquivos

- `src/services/perfilPortfolioService.js`: perfil e CRUD privado dos projetos, whitelist de payloads, paginação e resolução de mídia.
- `src/utils/perfilPortfolio.js`: limites, listas, arquivos, payload JSON/multipart, URLs e erros.
- `src/composables/useRecursoPrivado.js`: cancelamento, revisão da sessão e descarte de respostas antigas.
- `src/composables/usePerfilPortfolio.js`: dados reais usados nas duas listagens.
- `src/composables/useProjetoFormulario.js`: criação/edição, reset de rota e validação.
- `src/composables/useProjetoDetalhe.js`: consulta e exclusão confirmada.
- `src/composables/useEditarPerfil.js`: preenchimento, PATCH, erros de campo e reconsulta.
- `src/composables/usePerfilImagem.js`: validação e ciclo de vida de Object URLs.
- `src/composables/usePerfilHabilidades.js`: inclusão, remoção e limites.
- `src/composables/usePerfilLocalizacao.js`, `useGeolocation.js`: preservação de GPS/cidade e descarte de resultados antigos.
- `src/components/PerfilComponent.vue`, `EditarPerfil.vue`, `PortfolioComponent.vue`, `PortfolioAdicionarComponent.vue`, `PortfolioDetalheComponent.vue`: estados acessíveis e integração dos composables, mantendo layout existente.
- `src/components/ConfirmarExclusaoProjeto.vue`: dialog nativo, foco inicial em cancelar, restauração de foco e bloqueio durante DELETE.
- `src/components/CameraCapture.vue`: proteção para autorização/captura atrasada.
- `src/components/FiltrosPortifolio.vue`: categorias disponíveis derivadas dos registros reais.
- `src/services/api.js`: recusa operação preparada em uma revisão de sessão anterior, inclusive antes do primeiro envio. Refresh existente preservado.
- `src/services/geocodingApi.js`: Axios externo isolado, sem JWT ou cookies do MaRuJoB.
- `tests/perfil-portfolio.test.mjs`, `tests/perfil-portfolio.browser.mjs`, `package.json`: cobertura nova sem remover os testes anteriores.

## Endpoints e contratos

Todas as chamadas Django passam pela instância existente de `services/api`; nenhum novo cliente Django, JWT ou armazenamento de perfil é criado.

| Operação          | Método e endpoint relativo à base /api/ | Retorno usado                            |
| ----------------- | --------------------------------------- | ---------------------------------------- |
| Consultar perfil  | GET usuarios/me/                        | Objeto do usuário                        |
| Atualizar perfil  | PATCH usuarios/me/                      | Objeto atualizado, seguido de GET        |
| Listar projetos   | GET portfolios/?page=…                  | Array ou `{count,next,previous,results}` |
| Consultar projeto | GET portfolios/{id}/                    | Objeto do projeto                        |
| Criar projeto     | POST portfolios/                        | HTTP 201 e objeto com id                 |
| Editar projeto    | PATCH portfolios/{id}/                  | HTTP 200 e objeto atualizado             |
| Excluir projeto   | DELETE portfolios/{id}/                 | HTTP 204                                 |

Perfil: somente `name`, `profile_image`, `profissao`, `localizacao`, `latitude`, `longitude`, `geolocation_accuracy`, `geolocation_timestamp`, `sobre`, `telefone`, `habilidades`. Não envia email, grupos, privilégios ou perfil_configurado. Não existe campo cidade.

Projeto: somente `titulo`, `categoria`, `descricao`, `tags`, `link`, `imagem`. Nunca envia usuario ou id como campos editáveis. Propriedade e autorização permanecem sob responsabilidade do backend. Não há visualização pública de portfólios de terceiros.

Sem arquivo o corpo é JSON: `{ "tags": ["Vue", "API"] }` ou `{ "habilidades": [] }`. Com arquivo usa FormData: `append('tags', JSON.stringify(tags))` e `append('habilidades', JSON.stringify(habilidades))`. Cada lista é serializada uma única vez, incluindo limpeza explícita `[]`. Não define Content-Type/boundary manualmente. Campos omitidos pelo serviço são preservados no PATCH.

Nome/profissão/localização: até 255 caracteres; telefone: 30. Opcionais não se tornam obrigatórios. Habilidades/tags: até 50 strings não vazias, até 100 caracteres, sem duplicações ignorando maiúsculas. Projeto exige título (255), categoria (100) e descrição; link é opcional HTTP/HTTPS, sem credenciais. Links externos usam noopener noreferrer.

## Imagens e localização

JPEG, PNG e WebP, máximo 5 MiB. Arquivos novos usam `profile_image` ou `imagem`. Omitir imagem preserva a atual. Não é oferecida remoção de imagem sem contrato confirmado. Prévia local não representa persistência: após sucesso exibe a resposta do servidor e faz GET. Falha nesse GET informa que o salvamento foi confirmado mas a persistência não pôde ser verificada; não libera outro POST. Object URLs são revogadas na substituição, carregamento do servidor, troca de sessão e desmontagem. Cancelar a seleção mantém a imagem anterior.

URLs HTTP/HTTPS absolutas são preservadas; mídia relativa é resolvida contra a origem da API, sem adicionar /media ou duplicar domínio. Protocolos inseguros e caminhos locais Windows/file são rejeitados. Imagem indisponível é ocultada. Não há acesso direto ao storage.

Cidade manual salva localizacao e limpa latitude, longitude, precisão e timestamp. GPS só é solicitado por ação explícita, obtém metadados e faz geocodificação reversa. Coordenadas não são exibidas nas telas profissionais nem persistidas em localStorage. Sessão, seleção manual ou desmontagem invalidam resultados antigos. Câmera preserva galeria, captura móvel e captura ao vivo; streams ativos e streams recebidos após fechamento são interrompidos. HTTPS e permissões do navegador continuam necessários.

## Fluxos, estados e sessões

A criação começa sem tags, a edição consulta o ID antes de habilitar o formulário e alterações de route.params.id invalidam a consulta anterior e limpam o formulário. POST/PATCH bloqueiam cliques repetidos; erros mantêm os valores. Confirmação e navegação só ficam disponíveis após resposta da API, sem temporizadores. Novo GET apresenta os valores persistidos. Reentrada na listagem consulta novamente os registros, incluindo criação, edição e exclusão.

Paginação carrega todas as páginas de forma sequencial e aplica busca/filtros sobre o conjunto completo; contagem usa registros únicos carregados. Não segue links next para outro domínio ou caminho, nem ciclos. Custo de memória e tempo aumenta com portfólios muito grandes; uma paginação incremental futura pode ser desejável.

Logout/troca de conta limpam perfil, projetos, formulários, prévias e localização em memória. AbortController cancela o trabalho pendente, sessao.revisao impede respostas de outra conta, e sequência impede sobrescrita por consulta anterior na mesma sessão. O interceptor recusa requisições preparadas sob revisão antiga antes de anexar credenciais. O refresh JWT e guards existentes continuam funcionando.

Loading, vazio, sucesso, salvando e excluindo têm estados próprios. Erros 400 têm mensagens próximas aos campos; 401, 403, 404, 413, 503, demais 5xx e conexão recebem mensagens compreensíveis. Falha de rede não é apresentada como projeto inexistente. Dialog nativo mantém foco e Escape respeita exclusão em andamento.

## Verificação e limitações

Linha de base: npm test executou 128 testes, todos aprovados. O primeiro npm run build foi bloqueado pelo sandbox ao ler diretórios necessários ao esbuild; a execução autorizada fora do sandbox passou, já durante as alterações. Não é registrado como build limpo da base.

Resultados finais: `npm test` — 160 aprovados, 0 falhos (128 anteriores + 32 novos); `npm run build` — aprovado, incluindo geração PWA; `git diff --check` — aprovado; Prettier --check em todos os arquivos da entrega — aprovado. Aviso não bloqueante do build: base caniuse-lite desatualizada; nenhuma dependência foi alterada para suprimir o aviso. A suíte nova usa Node Test Runner, Vue em memória e transporte Axios simulado. As imagens e dados de teste existem somente nos testes, sem fallback fictício na aplicação.

A inspeção Chrome headless usa componentes reais e API simulada, com capturas em `node_modules/.cache/feat40-browser`. Foram aprovados 24/24 cenários: seis telas nas larguras 320, 375, 768 e 1280 px, sem overflow horizontal, com footer único, imagens locais de proporções distintas e diálogo com foco/cancelamento. Também foi reduzida a altura do viewport a 400 px com campo focado em 320/375 px para simular espaço ocupado por teclado. Capturas de criação, edição, lista e diálogo foram inspecionadas. Não representa teste em aparelho físico, teclado real, câmera real ou storage remoto.

O GET de schema em http://127.0.0.1:8000/api/schema/?format=json falhou por ausência de servidor. O contrato ativo do backend, permissões reais, upload real e persistência no storage ainda precisam ser homologados em ambiente integrado autorizado. Não foram utilizadas contas reais ou operações de produção. Os campos/limites desta implementação seguem o contrato fornecido no chamado; não se afirma confirmação do serializer ativo.

Limite de segurança: abortar uma requisição não desfaz uma gravação já recebida pelo servidor. Garantia de idempotência entre remontagens, recarga do navegador ou perda da resposta de POST depende de contrato de idempotência do backend. A aplicação bloqueia envio simultâneo no formulário e republicação após 201, inclusive quando a reconsulta falha. Validação definitiva de arquivos e autorização de propriedade são do backend. Nenhum ajuste de backend foi implementado.

## Cobertura automatizada demonstrada

A suíte FEAT-40 agrupa 32 testes: perfil real e limpeza de sessão; PATCH permitido e campos omitidos; erro 400 com rascunho; sessão trocada antes do envio e durante resposta; paginação completa/origem/ciclos; estados vazio/erro/retry; códigos de erro; formato/tamanho e ciclo de Object URLs; JSON/multipart de habilidades/tags; inclusão/remoção/duplicação/limites; URLs seguras; criação sem tags; PATCH com imagem omitida e lista vazia; transições entre criação e diferentes IDs; falha de storage; cancelamento/DELETE 204 com bloqueio de repetição; 403 bloqueando edição; GPS/manual/geocoder/permissão negada; Nominatim sem JWT; compilação dos componentes; persistência simulada de upload e substituição após GET; falha de reconsulta sem novo POST; câmera com captura/permissão/indisponibilidade/fechamento e stream atrasado.

Regressão: os 128 testes anteriores de autenticação, refresh, guards, vagas e oportunidades foram mantidos e passaram junto à suíte nova. Os testes em memória e navegador utilizam transporte/fixtures isolados; não demonstram persistência no storage real.
