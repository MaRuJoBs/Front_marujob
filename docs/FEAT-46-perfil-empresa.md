# FEAT-46 — Perfil institucional

Implementada em `FEAT-46`, criada da `origin/DEV` atualizada em `01394e0` (PR #93 / design system). Consultados os PRs do frontend; não encontrada implementação F46 ou PR F45 na busca realizada. Backend preservado.

## Entrega e arquivos

- `src/views/PerfilEmpresaView.vue`: visualização, estado vazio, edição e layout mobile-first com BaseButton, BaseInput, BaseCard e tokens F48.
- `src/composables/usePerfilEmpresa.js`: carregamento, cancelamento, feedback, erros e proteção contra envios simultâneos/respostas de sessão antiga; descarte de prévias temporárias.
- `src/services/empresaPerfilService.js`: integração, validação e seleção dos campos alterados.
- `src/router/routes.js`: `/empresa/perfil`, com `requiresAuth: true` e `tipo: 'empresa'`.
- `src/components/FooterEmpresaComponent.vue`: Perfil na terceira posição com ícone building, preservando Início, Mensagens e logout. Atalho redundante do header removido.
- `src/views/ConfiguracoesEmpresaView.vue`: Segurança e acesso, com link ao formulário existente de senha.
- `src/components/TrocarSenhaComponent.vue`: retorno às configurações apenas para empresa acessando com a origem correspondente; comportamento anterior preservado nos demais casos.
- `tests/perfil-empresa.test.mjs`: testes específicos com transporte Axios simulado exclusivamente no teste.

## Contrato e comportamento

GET e PATCH `empresas/me/` pelo Axios existente, cuja base já contém `/api/`. Utilizado o contrato B46 fornecido na tarefa. O GET preenche a tela e o formulário; a resposta do PATCH atualiza a visualização imediatamente. Uma nova entrada/recarregamento consulta novamente a API.

Campos: `name`, `descricao_institucional`, `area_atuacao`, `cidade`, `uf`, `website`, `contato_comercial` e `profile_image`. Somente campos modificados são enviados; `empresa` e dados privados nunca compõem o payload. Textos opcionais podem ser limpos com string vazia. Nome obrigatório, UF brasileira e website HTTP/HTTPS são validados; demais restrições do servidor aparecem junto aos campos.

Imagem: seleção de arquivo de imagem com prévia local; upload por FormData, sem definir manualmente o boundary. Remoção por JSON `profile_image: null`. Cancelar restaura os dados consultados. Falhas mantêm o formulário para correção/nova tentativa pelo botão Salvar alterações.

Erros: 400 por campo e mensagem geral; 401 passa pelo refresh/encerramento de sessão e redirecionamento existentes; 403 informa restrição empresarial; 503 informa indisponibilidade do armazenamento; rede/servidor oferece nova tentativa. Nenhum mecanismo de autenticação foi adicionado. Respostas atrasadas são descartadas ao desmontar/trocar sessão.

## Validação

- `node --test tests/perfil-empresa.test.mjs`: 5 testes aprovados; carga, PATCH mínimo, releitura, cancelamento, duplicação, validações, multipart/remoção, 400/403/503/rede, guards e 401.
- `npm run build`: aprovado, incluindo PWA. Necessária execução fora do sandbox devido ao bloqueio de leitura de diretórios pelo esbuild. Aviso não bloqueante de Browserslist desatualizado.
- Prettier nos arquivos da implementação e teste; `git diff --check` sem erros de whitespace.

## Pendências

Integração autenticada com a API real e persistência em banco/storage precisam de homologação: os testes usaram transporte simulado e nenhuma operação foi enviada a dados reais. Layout implementado com limites de largura; inspeção visual em navegador/dispositivos ainda pendente. Não houve commit, push, PR, merge ou deploy.

## Ajuste de navegação

Footer empresarial: Início → Mensagens → Perfil → Sair. Perfil aponta para `/empresa/perfil` e recebe o destaque ativo já existente no footer. Os ícones `faBuilding` e `faGear` são importados diretamente do pacote Font Awesome instalado, sem necessidade de registro global.

A engrenagem usa BaseButton F48, área mínima de 44 px e `aria-label="Configurações da empresa"`. Abre `/empresa/configuracoes`, protegida pelos guards empresariais. A opção Alterar senha usa `/trocar-senha?origem=configuracoes-empresa`; o retorno só considera essa origem para contas empresariais. Nenhuma alteração no footer freelancer, no service de senha ou no fluxo Google.
