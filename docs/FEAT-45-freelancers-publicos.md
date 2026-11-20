# F45 — Diretório de freelancers e perfil público

## Entrega

Branch `FEAT-45`, base `origin/DEV` em `083f639`. Repositório confirmado: `MaRuJoBs/Front_marujob`. A auditoria inicial incluiu branches, histórico e 45 PRs; nenhum implementava o diretório. `/freelances` é a listagem de oportunidades, F44 apresenta candidatos e F46 é o perfil institucional da empresa.

A entrega final inclui as ampliações solicitadas pelo usuário durante a implementação: integração no router e navegação, publicação do perfil próprio, acabamento visual e padronização do footer do usuário. O backend não foi alterado. Não houve merge ou deploy.

## Como acessar

Com `npm run dev`, entrar como empresa e clicar em **Freelancers** no menu inferior. Rotas:

- `/empresa/freelancers`: lista automática, sem formulário de pesquisa, com foto, nome, profissão, cidade e até três habilidades. Categoria selecionável e paginação do servidor.
- `/empresa/freelancers/:id`: perfil público e projetos autorizados. O nome no card abre o perfil; voltar preserva categoria e página.

Ambas exigem `requiresAuth: true` e `tipo: empresa`. Os guards existentes foram reutilizados sem alteração. O menu destaca Freelancers na lista e no detalhe.

O botão **Chat** abre a rota existente `/mensagens?freelancer=<id público>`. O parâmetro é uma proposta de integração da F45, ainda não um contrato confirmado com a FEAT de chat. Mensagens atualmente contém somente título: abrir/criar conversa e enviar mensagens dependem da implementação do responsável pelo chat. Nenhum arquivo dessa FEAT foi modificado.

## Publicação voluntária

O próprio freelancer deve acessar **Perfil → Editar perfil**, marcar **Aparecer na lista de freelancers** e salvar. A opção carrega o estado da API, permite revogação e verifica o valor confirmado em nova consulta. A cidade pública é opcional e nunca é preenchida automaticamente pelo endereço privado ou GPS. Perfis existentes não são publicados automaticamente.

São enviados `perfil_publico` e `cidade_publica` pelo PATCH existente de `usuarios/me/`. O contrato foi confirmado por leitura remota de `core/serializers/user.py`, `core/views/user.py` e documentação B45 na DEV do backend. A action usa UserProfileSerializer, embora o OpenAPI infira incorretamente PatchedUser como request. Nenhum arquivo do backend foi alterado.

## API e privacidade

OpenAPI local consultado em `http://127.0.0.1:8000/api/schema/?format=json`, HTTP 200. Endpoints:

- GET `freelancers/`: JWT empresarial; `{ count, next, previous, results }`.
- GET `freelancers/{id}/`: perfil elegível, com descrição e portfólio público.

Todos os requests usam a instância existente de `src/services/api.js`. O serviço valida IDs, limita filtros/página, cancela requests substituídos e rejeita resultados de outra sessão. A paginação faz uma requisição por página e não segue URLs externas retornadas em next/previous.

A B45 aceita `search` (255), `profissao` (255), `cidade` (120), `habilidade` (100) e `page` (1 a 1000000). A interface final utiliza apenas `habilidade` para o seletor Categoria, com as especialidades já sugeridas na edição de perfil e habilidades adicionais recebidas da API. Não há endpoint de catálogo de categorias nem agrupamento inventado. “Todas as categorias” remove o filtro; selecionar uma opção volta à página 1. O serviço mantém suporte aos demais filtros da API, cobertos por testes.

Campos públicos projetados: `id`, `nome`, `profissao`, `cidade`, `habilidades`, `foto_perfil`; detalhe acrescenta `descricao` e `portfolio`. Projetos preservam somente `id`, `titulo`, `categoria`, `descricao`, `tags`, `link` e `imagem`. Campos extras são descartados. Não são apresentados e-mail, telefone, endereço privado, GPS, tokens ou dados administrativos. URLs aceitam apenas HTTP(S), sem credenciais; links externos usam noopener/noreferrer. Foto ausente ou quebrada tem avatar neutro.

O backend exige freelancer ativo, não administrativo, com tipo Usuário e `perfil_publico=true`. Perfis privados/inelegíveis retornam 404. Listagem sem resultados retorna 200/count 0. As respostas 400/401/403/404, loading, erro/retry, lista vazia e categoria vazia são tratadas. Consultas reais sem JWT retornaram 401; isso não confirma existência de contas nem conteúdo autenticado.

## Apresentação

Poppins, superfícies claras e roxo existente. Cards em lista, nome e profissão separados da foto, cidade e habilidades quando presentes; nenhum dado fictício na aplicação. Seletor com seta afastada 16px da borda. Footers empresarial e do usuário flutuam 12px acima da borda, com margens laterais, cantos arredondados, sombra, ícones e indicação ativa. Os quatro atalhos do usuário foram preservados. O ícone de pessoas da empresa é importado diretamente, sem depender de registro global ausente.

Figma não foi localizado/acessado; o design segue a identidade existente e os ajustes pedidos. O shell compacto empresarial foi preservado. A foto usa a mesma variável de largura da coluna para evitar sobrepor o nome em telas pequenas.

## Arquivos

Novos: duas views públicas, `components/freelancers/FreelancerCard.vue`, `services/freelancersPublicosService.js`, `styles/freelancers-publicos.css`, três runners de teste/preview e este documento.

Modificados: App/reserva inferior; routes; footers; shell/fundo empresarial; EditarPerfil, useEditarPerfil e allowlist de perfil para a publicação voluntária; testes de perfil e contagem das nove rotas empresariais. HomeEmpresa, PerfilComponent, autenticação, configuração da API e backend não foram modificados.

## Validação final

- `npm.cmd test`: **242/242 aprovados**, incluindo publicação, revogação e servidor ignorando a escolha.
- `node --test tests/freelancers-publicos.test.mjs`: **7/7 aprovados**.
- `node tests/freelancers-publicos.browser.mjs`: aprovado com App, rotas, guards e footers reais em Chromium. Verifica lista automática sem pesquisa, categorias, respostas antigas, paginação, retorno, Chat/ID, estados, privacidade, profissão/cidade/habilidades, foto carregada sem sobreposição e footers em 320/375/768/1440px. Também verifica publicação/revogação pela edição própria.
- `npm.cmd run build`: aprovado, incluindo PWA. Aviso preexistente de caniuse-lite desatualizado, sem alteração de dependências.
- Prettier aplicado somente nos arquivos trabalhados; `git diff --check` sem erros. Não existe script lint.
- Capturas locais ignoradas em `node_modules/.cache/f45-browser/`; imagens revisadas visualmente.

Os testes usam transportes isolados e dados exclusivos de teste; não escrevem em contas reais e não substituem homologação autenticada, dispositivo físico ou leitor de tela. Figma e homologação com perfis reais publicados permanecem pendentes.

## Ambiente e preview opcional

Desenvolvimento usa a API local definida em `.env.development`; produção conserva sua configuração existente. Contas do site publicado não são copiadas ao banco local. Não foram trocadas as origens para reutilizar tokens entre ambientes.

Para preview separado, executar `node tests/freelancers-publicos.preview.mjs` e abrir `http://localhost:5174/`, com login empresarial real e API configurada. A aplicação principal já contém a integração e não depende desse preview.
