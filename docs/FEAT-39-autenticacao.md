# FEAT-39 — Autenticação e controle de acesso

A autenticação do frontend é centralizada em `src/services/authService.js`, com transporte HTTP em `src/services/api.js`. Login por senha, login Google e cadastros validam o perfil em `usuarios/me/` antes de liberar páginas privadas.

## Sessão e permissões

- Tokens de acesso e refresh persistem no armazenamento local; o perfil é consultado novamente na API ao recarregar a aplicação.
- Grupos são aceitos como nomes ou objetos com `name`. A comparação normaliza espaços, acentos e caixa.
- O grupo Usuário acessa `/home`; Empresa acessa `/homeEmpresa`. Grupos ausentes, desconhecidos ou ambíguos impedem a abertura da sessão.
- O guard bloqueia visitantes e redireciona acessos à área exclusiva de outro tipo de conta. Páginas públicas redirecionam contas autenticadas para seu início.
- Logout limpa tokens, perfil em memória e indicador de necessidade de senha. Respostas pendentes de uma sessão encerrada não restauram tokens.
- Alterações de autenticação em outra aba invalidam o perfil em memória.

| Área | Acesso |
| --- | --- |
| Home, freelances, oportunidades, favoritos, perfil e portfólio | Usuário |
| Home da empresa | Empresa |
| Mensagens e definição/troca de senha | Ambos |
| Login e cadastros | Público |

## JWT

Requisições autenticadas enviam `Authorization: Bearer`. Rotas de login, Google e cadastro não recebem o JWT da aplicação. Uma renovação compartilhada atende a respostas 401 simultâneas, aceita rotação do refresh e repete cada requisição no máximo uma vez.

Respostas 401 atrasadas reutilizam o access token já renovado. Refresh inválido encerra a sessão; falhas de rede preservam os tokens para nova tentativa. Requisições de uma conta não são repetidas na sessão de outra conta. Erros 403 de permissão não provocam renovação.

## Formulários e Google

Os dois cadastros reutilizam `useCadastro`, enviam multipart com `tipo`, validam campos e exibem mensagens da API. Os formulários possuem estado de carregamento e impedem envios duplicados. Quando o cadastro é concluído, mas o login falha, a tela informa que a conta já foi criada.

O SDK Google é carregado sob demanda, compartilhado entre telas e pode ser carregado novamente após erro ou timeout. Sua inicialização considera o Client ID atual, incluindo atualizações em desenvolvimento. A credencial recebida é enviada sem alterações em `{credential, tipo, cadastro}`.

Em desenvolvimento, erros Google imprimem diagnóstico legível com etapa, endpoint, status e metadados limitados de audience e tempo. Tokens, assinatura, nome, e-mail e identificador pessoal são omitidos. A leitura desses metadados não autentica a conta nem substitui a verificação da assinatura no backend.

Definição de senha atualiza o aviso da conta e retorna à área correta. Troca de senha mantém confirmação de sucesso e retorno ao início. A navegação da empresa inclui senha e logout.

## PWA e desenvolvimento

O manifest estático em `public/manifest.webmanifest` é servido tanto pelo Vite quanto pelo build. O plugin PWA continua gerando o service worker sem duplicar o manifest.

Em desenvolvimento, a inicialização remove somente registros `sw.js`/`dev-sw.js` deste aplicativo e seus precaches Workbox. Produção, outros escopos e dados de autenticação são preservados. Se uma instalação antiga ainda servir toda a página pelo cache, usar Ctrl+Shift+R uma vez para carregar a limpeza.

Vite, preview e configuração Vercel enviam `Cross-Origin-Opener-Policy: same-origin-allow-popups`.

## Configuração

- `VITE_API_URL`: URL base da API, incluindo `/api/`.
- `VITE_GOOGLE_CLIENT_ID`: Client ID Web autorizado no Google Cloud.
- Em Authorized JavaScript origins, cadastrar a origem exata do frontend, incluindo a porta. O backend precisa aceitar o mesmo Client ID ao validar o ID token.
- Arquivos de ambiente locais não fazem parte do commit.

O [guia Google](https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid) descreve a configuração das origens. A [validação no servidor](https://developers.google.com/identity/gsi/web/guides/verify-google-id-token) deve verificar assinatura, audience, emissor e validade.

## Integração com o backend

A correção complementar pertence ao repositório separado `MaRuJoBs/Back_Marujob`. Ela inclui:

- Exposição de `groups` somente para leitura e `precisa_definir_senha` em `/api/usuarios/me/`.
- Exigência de `GOOGLE_CLIENT_ID` configurado e tolerância de relógio de 5 segundos na verificação Google.
- Tratamento de falhas de consulta aos certificados e bloqueio de contas inativas.
- Dez testes com assinatura RSA e verificador real da biblioteca Google, usando certificados locais de teste e banco exclusivamente em memória.

O relógio local estava sem sincronização. A tentativa de sincronização do Windows foi negada por falta de privilégio administrativo; nenhuma configuração do sistema foi modificada. A autenticação real com conta Google depende da configuração do ambiente e do consentimento do usuário.

O contrato de recuperação de senha por e-mail não está definido na API consultada. A indicação sem ação foi removida da tela, sem inventar endpoints.

## Verificação

- `npm test`: 43 testes passaram, cobrindo cadastros, login, Google, erros, logout, senha, persistência, grupos, rotas, concorrência de refresh e respostas de sessões antigas.
- `npm run build`: passou, incluindo geração do service worker e disponibilização do manifest.
- Manifest de desenvolvimento: HTTP 200, tipo `application/manifest+json` e JSON válido.
- Backend complementar: dez testes passaram sem modificar o banco da aplicação.
- Os testes do frontend substituem apenas o transporte HTTP e o SDK externo; nenhum backend foi criado dentro deste repositório.

No PowerShell com bloqueio de `npm.ps1`, usar `npm.cmd test` e `npm.cmd run build`.
