# FIX-49 — Layout amplo da área empresarial

> Retomada autorizada: as duas expectativas de layout foram atualizadas sem alterar permissões. A conclusão e os resultados vigentes estão na seção “Atualização autorizada das expectativas e validação final”. Os resultados de falha e o bloqueio anteriores são histórico.

> **Decisão posterior autorizada:** a correção descrita neste documento foi incorporada diretamente à FEAT-51, preservando o commit c45ac19 e o worktree permanente da FIX sem commit. Os resultados finais dessa incorporação estão em `docs/FEAT-51-polimento-empresa.md`, seção “Incorporação da correção desktop à FEAT-51”. Os caminhos e planos das etapas anteriores são histórico; a FIX foi migrada e preservada em diretório permanente.

## Isolamento e causa

Worktree `/tmp/front-marujob-fix49`, branch `FIX-49-layout-desktop-empresa`, base `origin/DEV` em `be21c6ae456d023881d9860981f61b325270472b`. A FEAT-51 foi publicada separadamente em `c45ac1991066f483e9060a7e2824930d0c1a18c1`, sem merge/PR ou alteração da DEV. A FIX permanece sem commit e sem push.

O limite vem de `src/styles/shell.css`: `--mrj-content-width: 26.25rem` na `.app`, consumido pelo máximo de `.app-content`. O modo `.app--wide` já permite até 75rem a partir de 48rem. App ativa essa classe por `route.meta.layout === 'wide'`, mas as sete rotas empresariais não forneciam esse metadado. Era o fallback intencional do shell, também visível em tablet, e não uma regressão do polimento F51.

## Implementação

- `src/router/routes.js`: opt-in `layout: 'wide'` nas rotas de home, criação, edição, detalhes, notificações, perfil e configurações da empresa. Os demais metadados, aliases e permissões permanecem intactos; rotas freelancer não foram modificadas.
- `HomeEmpresaComponent.vue`: em ≥768px, saudação/última vaga dividem a primeira linha; gerenciamento e feedback ocupam a largura disponível. Filtros em duas colunas; vagas em duas colunas no tablet e três a partir de 1200px. A ordem DOM permanece original da branch; a integração F51 mantém sua ordem Editar → Excluir → Ver detalhes.
- `CriarVagaComponent.vue`: conteúdo central com máximo 64rem, grupos duplos no tablet/desktop, padding proporcional e barra fixa com o mesmo máximo/alinhamento do conteúdo. Botões mantêm dimensões úteis sem esticar por toda a largura. A prévia oculta existente não foi reativada nem recriada.
- `DetalheVagaEmpresaView.vue`: máximo de leitura 64rem, três colunas para informações a partir de 768px e limite local para os links de ação.
- `NotificacoesEmpresaView.vue`: duas colunas de cards a partir de 768px e filtros com largura adequada à legenda, mantendo decisões e leitura.

Nenhuma alteração em App, shell.css, header/footer, serviços, composables, endpoints, autenticação, backend ou regras de negócio. Perfil e configurações já tinham máximo local de leitura de 760px: basta liberar o ancestral. Navegação horizontal usa o modo wide já existente da F49. Regras novas começam em 48rem; o comportamento até 430px é preservado. Sem `!important` ou CSS para escapar do container.

## Compatibilidade com F51

Ambiente separado: `/tmp/front-marujob-fix49-integracao`, detached no commit F51 publicado. Uma aplicação literal do diff encontrou diferenças de contexto nas regiões já formatadas/polidas pela F51. A comparação textual de três vias (`git merge-file`, sem operação de merge de branch) combinou os cinco arquivos de aplicação sem conflitos, preservando ambos os conjuntos de alterações. Nada foi aplicado à branch FEAT-51 ou à DEV; o staging do ambiente de integração permanece vazio.

O teste visual temporário foi copiado do harness local F51, preservando o original, e adaptado explicitamente para as larguras esperadas: móvel até 420px e modo amplo até 1200px. A base DEV usa as expectativas de ordem/estados anteriores à F51; a integração valida adicionalmente os tokens, a ordem de Tab corrigida e o nome acessível do upload. Esses scripts e resultados são locais e ficam fora do futuro commit.

## Validação e intercorrências

O sandbox bloqueou o servidor local e a comparação Git de um teste por EPERM; execuções de navegador e comparações necessárias foram repetidas fora dele com autorização. Dependências existentes foram reutilizadas via symlink local para node_modules; nenhuma instalada/atualizada. O harness temporário permite somente a raiz do worktree e o diretório real de dependências, evitando bloqueio das fontes no ambiente compartilhado. Isso não altera a configuração Vite da aplicação.

A primeira rodada de `npm test` mostrou 6/7 entradas: o teste de notificações compara o objeto meta completo e rejeita a nova propriedade de layout. O teste específico de perfil apresentou a mesma divergência (4/5 casos). Essas falhas são novas expectativas afetadas pela FIX, distintas das falhas antigas da FEAT-47. Os testes de permissões não devem ser enfraquecidos. Foi solicitada autorização específica para acrescentar a expectativa de layout nessas duas assertions existentes; até a decisão, os testes originais permanecem intactos.

O build inicial passou (220 módulos, PWA 81 entradas), mantendo aviso de caniuse-lite. Os 9 casos específicos F47 e os 74 de vagas foram executados separadamente; resultados finais abaixo serão registrados após conclusão da homologação.

## Resultados finais desta execução

| Verificação                                   | Resultado                                                                                                                              |
| --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `npm test` na FIX e na integração             | **6/7 entradas aprovadas, 1 falha** em ambos: a igualdade exata de meta no teste de notificações não inclui layout                     |
| `node tests/notificacoes.test.mjs` na FIX     | **41/42 casos**, falha somente em `tests/notificacoes.test.mjs:171`, por `layout: 'wide'` adicional                                    |
| `node tests/perfil-empresa.test.mjs` na FIX   | **4/5 casos**, mesma expectativa exata em `tests/perfil-empresa.test.mjs:131`                                                          |
| `node tests/vagas.test.mjs`                   | **74/74 casos**, já incluídos em npm test; não somar novamente                                                                         |
| `node tests/complementos-vagas.test.mjs`      | **9/9 casos**, após repetir a comparação Git fora do sandbox                                                                           |
| Build da FIX                                  | Saída 0, 220 módulos, PWA 81 entradas                                                                                                  |
| Build da integração com F51                   | Saída 0, 220 módulos, PWA 81 entradas                                                                                                  |
| Matriz visual da FIX sobre DEV                | **112/112 verificações**, sete resoluções                                                                                              |
| Matriz visual da integração F51 + FIX         | **112/112 verificações**, sete resoluções; inclui Tab, upload acessível e dialogs                                                      |
| Fluxos empresariais na integração             | **13/13 grupos**, incluindo POST/PATCH/DELETE em memória, erros, duplicidade, cancelamento, decisões, seletor nativo e multipart       |
| Referência anterior F51 por leitura do commit | **21/21 verificações/capturas**, sete telas em 375, 768 e 1440px                                                                       |
| Regressão visual freelancer                   | **28/28 verificações**: home, oportunidades, favoritos e perfil nas sete resoluções; conteúdo continua até 420px                       |
| Auditoria de scripts/bindings                 | Quatro Vue compilados em cada worktree, sem mudanças de script/diretivas de negócio; apenas layout acrescentado nas sete rotas empresa |

Resoluções reais da matriz: 320×900, 375×812, 390×844, 430×932, 768×1024, 1024×768 e 1440×900. Medidas com scrollbar de 15px onde aplicável:

| Viewport | Conteúdo antes | Conteúdo após       | Barra fixa do formulário após         |
| -------- | -------------- | ------------------- | ------------------------------------- |
| 320×900  | até 320px      | 305px com scrollbar | 305px                                 |
| 375×812  | até 375px      | 360px com scrollbar | 360px                                 |
| 390×844  | até 390px      | 375px com scrollbar | 375px                                 |
| 430×932  | até 420px      | 415px com scrollbar | 415px                                 |
| 768×1024 | 420px          | 753px               | 753px                                 |
| 1024×768 | 420px          | 1009px              | 1009px                                |
| 1440×900 | 420px          | 1200px              | 1024px, igual ao máximo do formulário |

Nenhum overflow horizontal global ou desalinhamento entre toolbar e formulário nas matrizes empresariais. Navegação acompanha a largura do conteúdo. Cards em 2/3 colunas e notificações em 2 colunas foram medidos, além da inspeção visual. Os sete screenshots iniciais de **375px são idênticos em bytes** entre c45ac19 e a integração: evidência de preservação mobile sem depender só de media queries. Inspecionados home/gerenciamento, formulário, detalhes e notificações ampliados; nenhuma truncagem de dados aplicada.

As duas tentativas iniciais da sonda freelancer expuseram limitações do harness empresarial: cards intencionalmente fora do enquadramento de carrosséis eram classificados como fora da tela, e a view de perfil não possui main. A sonda temporária passou a considerar recorte pelos ancestrais e a usar app-content como fallback. A rodada final de 28 verificações passou; nenhum código freelancer foi alterado. Isso não foi tratado como falha da aplicação nem corrigido alterando suas telas.

Os resultados acima usam o shell, router e componentes reais, com transporte em memória. Não foram escritos dados reais ou usados endpoints remotos. Backend real, teclado virtual, aparelho físico e Figma definitivo não foram homologados. Aviso caniuse-lite mantido. Não foram coletados erros JavaScript/avisos Vue ou falhas HTTP de recursos na rodada final das matrizes empresariais com fontes corrigidas no harness. Screenshots de viewport e cliques após scroll evitaram interpretar o footer fixo de captura longa como defeito de fluxo.

## Testes antigos e pendência de autorização

Os roteiros `tests/vagas.browser.mjs` e `tests/gerenciamentoVagas.browser.mjs` continuam esperando seis erros obrigatórios; o contrato atual produz cinco, com modalidade opcional. Reproduzidos com os diagnósticos instrumentados já existentes, tanto na worktree como com componentes da DEV por leitura: quatro execuções com saída 1, mesma contagem e foco em vaga-titulo. Nenhuma expectativa foi alterada. Esses roteiros também contêm asserts de payload antigo e de desktop ≤420px que precisarão de revisão própria; não chegam a esses pontos por pararem antes na contagem dos erros. São pendências preexistentes da evolução F47/F49, distintas dos dois asserts de meta afetados por esta FIX.

**Bloqueio atual para aprovação de commit:** npm test não está integralmente verde. Dois testes existentes comparam o objeto meta inteiro. A alteração de layout é intencional e os campos de autenticação/permissão permanecem idênticos; a auditoria e os testes de autenticação passaram. Porém, não se deve declarar que a suíte completa passou.

Pela restrição anterior de preservar testes preexistentes, foi pedida confirmação antes de editar essas duas expectativas. Uma proposta mínima está pronta em `/tmp/fix49-qa/ajuste-contrato-meta-proposto.patch`: acrescentar `layout: 'wide'` às duas comparações, sem enfraquecer ou retirar suas verificações de permissão. **A proposta não foi aplicada.** Os testes originais e seus arquivos versionados permanecem intactos.

**Classificação atual: NÃO APTA PARA COMMIT enquanto essas duas expectativas não forem resolvidas e a suíte completa repetida.** A correção visual está implementada e compatível com F51 nos cenários executados, sem regressão funcional detectada. Após a autorização e a repetição com aprovação, poderá ser reavaliada para commit; nenhum commit ou push da FIX foi realizado.

## Evidências e escopo para revisão

- Scripts temporários locais e ignorados: `tests/empresa-visual.browser.mjs` em cada worktree (cópias de QA, não o harness original preservado da FEAT-51); gerador `/tmp/prepare-fix49-qa.py` e auditor `/tmp/fix49-audit.cjs`.
- Resultados/capturas: `/tmp/fix49-qa/base/`, `integracao/`, `antes/`, `freelancer/` e `fluxos/depois/`. Cada matriz tem results.json; as capturas selecionadas têm manifesto e são explicitamente fixtures de teste. Nenhum artefato deve entrar no commit.
- Logs dos roteiros antigos em `node_modules/.cache/feat51-final/`, reaproveitados exclusivamente para diagnóstico, sem alteração dos testes originais.
- Os 273 PNGs e o harness original no worktree FEAT-51 tiveram hashes conferidos e permanecem preservados. O commit publicado e os arquivos locais ignorados da FEAT-51 não foram alterados.

Futuro escopo de aplicação/documentação: `src/router/routes.js`, `src/components/HomeEmpresaComponent.vue`, `src/components/CriarVagaComponent.vue`, `src/views/DetalheVagaEmpresaView.vue`, `src/views/NotificacoesEmpresaView.vue` e este documento. Os dois testes existentes só poderão ser incluídos se a atualização de contrato for autorizada. Staging deve permanecer vazio nesta etapa. Sem arquivos de backend, serviços, App, shell, header/footer, imagens, JSONs, caches, node_modules ou dist no escopo.

## Atualização autorizada das expectativas e validação final

O usuário autorizou exclusivamente a atualização das duas expectativas de meta afetadas pelo opt-in wide. Reconferidos worktree `/tmp/front-marujob-fix49`, branch `FIX-49-layout-desktop-empresa`, staging vazio e proposta em `/tmp/fix49-qa/ajuste-contrato-meta-proposto.patch`.

Aplicado somente o acréscimo de `layout: 'wide'` nas assertions de `tests/notificacoes.test.mjs:171` e `tests/perfil-empresa.test.mjs:131`. Mantidos `requiresAuth: true`, `tipo: 'empresa'` e todas as assertions seguintes de empresa, freelancer, visitante e expiração de sessão. A comparação com os arquivos anteriores confirmou que, removendo apenas essa propriedade adicionada, os dois arquivos são idênticos aos originais. Nenhuma verificação foi enfraquecida ou removida.

Os mesmos dois ajustes foram aplicados ao worktree detached de integração, sem alterar a branch/commit F51. Hashes confirmaram que os cinco arquivos de aplicação da FIX, os dois roteiros antigos incompatíveis e o harness temporário não mudaram nesta retomada. Além dos dois testes, somente este relatório foi atualizado; as alterações anteriores da FIX foram preservadas.

### Segurança e destino permanente do worktree

O worktree continua registrado em `/tmp/front-marujob-fix49`; nenhum diretório foi movido, apagado ou descartado. A verificação de dispositivos mostrou sistemas de arquivos distintos: `/tmp` (71), `/home/omtramos` (2096) e a unidade do projeto em `/mnt/c` (69). Portanto, não se deve presumir que um `git worktree move` direto entre esses caminhos funcionará por rename.

Destino permanente proposto, ainda não criado: `/mnt/c/users/omtra/onedrive/documentos/Front_marujob-worktrees/FIX-49-layout-desktop-empresa`. Deve ser um diretório novo, fora do checkout da FEAT-51. Antes do próximo commit ou push, a migração segura é:

1. Conferir novamente HEAD/branch/status, staging e inexistência do destino; gerar um manifesto completo dos arquivos, links e alterações locais. Preservar os dados do worktree e evidências temporárias externas em armazenamento permanente separado.
2. Criar um **novo worktree detached** no destino, no mesmo SHA de base da FIX (`be21c6a`). Isso gera metadados e índice próprios sem mexer na branch que está aberta em /tmp.
3. Copiar o conteúdo integral do worktree atual para o novo, incluindo arquivos alterados, não rastreados e ignorados, preservando links. Excluir **somente o arquivo `.git` da raiz da cópia**, para não sobrescrever os metadados do novo worktree. Não usar opções de exclusão/limpeza como `--delete`. O node_modules atual é um link para as dependências permanentes do checkout original e deve continuar como link.
4. Conferir hashes/links e igualdade do diff, status e arquivos locais entre as duas cópias. Qualquer falha de cópia ou divergência impede prosseguir; a origem permanece intacta.
5. Com todos os dados verificados e ambos os worktrees no mesmo SHA de base, destacar o worktree antigo desse mesmo HEAD (`git switch --detach`, sem force) e selecionar a branch `FIX-49-layout-desktop-empresa` no novo worktree (`git switch`). Essas trocas no mesmo commit preservam as alterações locais. Não usar reset, stash, limpeza ou descarte.
6. Revalidar a branch, os oito arquivos de escopo, staging e testes no destino permanente. Manter o worktree antigo registrado, detached e intacto como backup; não trabalhar simultaneamente nas duas cópias.

Essa é uma proposta operacional, não uma migração executada. Ela evita perder alterações não commitadas ou ignoradas e não requer alterar FEAT-51/DEV. A criação/cópia no destino permanente deve ser feita com a permissão de filesystem apropriada e somente após as verificações, antes de futuras operações de publicação da FIX.

### Resultado vigente após a autorização

| Verificação executada nesta retomada      | Resultado                                                                                                                                      |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm test` na FIX                         | **7/7 entradas de arquivo aprovadas, zero falhas**, saída 0                                                                                    |
| `npm test` na integração FIX + F51        | **7/7 entradas de arquivo aprovadas, zero falhas**, saída 0                                                                                    |
| `node tests/notificacoes.test.mjs` na FIX | **42/42 casos**, incluindo empresa/freelancer/anônimo, autorização e erros                                                                     |
| `node tests/perfil-empresa.test.mjs`      | **5/5 casos** na FIX e **5/5** na integração, incluindo guard e sessão expirada                                                                |
| `npm run build`                           | Aprovado nos dois worktrees: 220 módulos, PWA 81 entradas; aviso caniuse-lite permanece                                                        |
| Responsividade FIX + F51, sete resoluções | **70/70 verificações aprovadas** de páginas preenchidas, perfil em edição e dialogs, com foco/Tab, ações, nome acessível e larguras conferidos |
| Regressão freelancer, sete resoluções     | **28/28 verificações aprovadas** de home, oportunidades, favoritos e perfil; navegação mantém largura e comportamento anterior                 |
| Prettier                                  | **Oito arquivos de escopo aprovados**                                                                                                          |
| `git diff --check`                        | Aprovado na FIX e na integração                                                                                                                |

As sete resoluções repetidas foram 320×900, 375×812, 390×844, 430×932, 768×1024, 1024×768 e 1440×900. Os resultados novos estão em `/tmp/fix49-qa/expectativas-integracao/results.json` e `/tmp/fix49-qa/expectativas-freelancer/results.json`; capturas de viewport ficam nos mesmos diretórios. O harness foi somente executado, não editado. As matrizes completas anteriores de 112 + 112 verificações e os 13 grupos de mutação em memória permanecem como evidências da implementação; não foram repetidos todos os estados de erro/loading nesta retomada, pois nenhum código de aplicação mudou. Não contar os casos específicos de notificações novamente como casos distintos dos já incluídos em npm test.

**As duas falhas de expectativa estão corrigidas. Classificação vigente: APTA PARA COMMIT quanto ao código e aos testes da FIX.** Isso substitui o bloqueio de autorização registrado nas seções históricas. Recomenda-se concluir a migração verificada para armazenamento permanente antes do commit/publicação futuros; o worktree atual ainda está em /tmp e foi integralmente preservado.

Nesta retomada foram alterados apenas os dois testes autorizados e este relatório. O futuro escopo da FIX soma oito arquivos: os cinco arquivos de aplicação anteriormente implementados, os dois testes preexistentes atualizados e a documentação técnica. Nenhum screenshot, JSON de execução, cache, teste temporário, node_modules ou dist foi preparado para commit. Staging vazio, sem commit, push, PR, merge ou alteração da DEV.

O worktree original da FEAT-51 continua limpo em `c45ac1991066f483e9060a7e2824930d0c1a18c1`, igual à referência origin/FEAT-51 já publicada; DEV permanece em `be21c6ae456d023881d9860981f61b325270472b`. Os dois roteiros antigos incompatíveis da F47 permanecem intactos e suas falhas continuam documentadas separadamente. Nenhuma regressão nova detectada nos cenários executados; transporte de backend segue isolado em memória, sem homologação de dados reais.
