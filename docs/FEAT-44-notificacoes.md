# FEAT-44 — Notificações, decisões de candidaturas e WhatsApp

## Branch, base e diagnóstico

Trabalho exclusivo em `Front_marujob`, branch `FEAT-44`, criada de `origin/DEV` atualizado em 03/11/2026. A árvore estava limpa; a branch não existia localmente nem no remoto. A base `10975eb` já incorporava o PR #90 (FEAT-40), gerenciamento de vagas, oportunidades e autenticação anteriores.

Foram examinados routes, authGuard, api, authService, authSession, EmpresaHeader, FooterEmpresaComponent, HomeEmpresaComponent, HomeEmpresaView, App, serviços, stores e testes. Não existiam área de notificações, serviço de notificações ou decisões de candidatura no frontend. O botão de candidatura do freelancer encontrado em OportunidadeDetalheComponent não faz parte desta implementação e foi preservado.

A autenticação já fornecia `sessao.revisao`, rejeição de requisições `_sessionRevision` antigas, refresh JWT e guards por tipo de conta. O serviço de vagas já fornecia `capturarEmpresa`. Foram reutilizados. O App já centralizava o footer da empresa; nenhum segundo footer foi criado. `/mensagens` foi preservada. O acesso novo é um atalho com sino e nome acessível no header, presente também na home da empresa.

## Evidência do contrato e ambiente

O contrato foi confirmado por leitura do código remoto na branch **DEV de MaRuJoBs/Back_Marujob**, pela integração GitHub:

- [NotificacaoSerializer](https://github.com/MaRuJoBs/Back_Marujob/blob/DEV/core/serializers/notificacao.py), blob `e0318765d26223d8b29186b76945f2d64d3c4d76`.
- [CandidaturaEmpresaSerializer](https://github.com/MaRuJoBs/Back_Marujob/blob/DEV/core/serializers/candidatura.py), blob `aef7e265f987bb521959fb932cc6afbb454868e4`.
- [Ações e conflitos](https://github.com/MaRuJoBs/Back_Marujob/blob/DEV/core/views/candidatura.py), blob `7e41c5f3c4e8e2ed58d9bb2327413a7cdd1600dd`.
- [Leitura e filtros](https://github.com/MaRuJoBs/Back_Marujob/blob/DEV/core/views/notificacao.py), blob `a291eed88b1fe0f60e39819ff28f5d65991d9329`.
- [Ordenação das notificações](https://github.com/MaRuJoBs/Back_Marujob/blob/DEV/core/models/notificacao.py): `-criado_em`, `-id`.
- [Registro de rotas](https://github.com/MaRuJoBs/Back_Marujob/blob/DEV/app/urls.py).

O checkout local do backend foi consultado somente para leitura: estava na FEAT-41, revisão `23b2b1ba720a211a8d549c6cf1d91bebdf3b20e2`, portanto não foi usado como prova da revisão DEV. Nenhum arquivo, referência Git ou configuração desse repositório foi alterado.

A configuração efetiva de desenvolvimento aponta para `http://127.0.0.1:8000/api/`. A consulta sem credenciais a `/api/schema/?format=json` falhou por ausência de servidor. Assim, o contrato está confirmado no código remoto da DEV, **mas sua disponibilidade na API em execução ou no ambiente publicado não foi homologada**. Não foi iniciada uma API nem criada uma base de testes no backend, respeitando o isolamento solicitado.

## Arquivos e responsabilidades

| Arquivo                                     | Alteração                                                                                                                   |
| ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `src/router/routes.js`                      | Rota `/empresa/notificacoes`, nome `notificacoes-empresa`, meta `requiresAuth: true`, `tipo: 'empresa'`                     |
| `src/components/EmpresaHeader.vue`          | Atalho acessível para a área de notificações                                                                                |
| `src/services/notificacoesService.js`       | Listar/consultar notificações, marcar leitura, consultar candidatura, aprovar/recusar; validação de sessão, IDs e paginação |
| `src/utils/notificacoes.js`                 | Status, filtros, whitelist de dados profissionais, normalização, datas, erros e validação de WhatsApp                       |
| `src/composables/useNotificacoesEmpresa.js` | Estado, paginação, filtros, decisões, leitura, detalhes, concorrência e limpeza de sessão                                   |
| `src/views/NotificacoesEmpresaView.vue`     | Página com cards, estados, leitura, filtros, navegação entre páginas e contato autorizado                                   |
| `src/components/NotificacoesDialog.vue`     | Detalhes profissionais e confirmação de decisão em diálogo nativo acessível                                                 |
| `tests/notificacoes.test.mjs`               | 42 testes agrupados da feature; transporte Axios simulado e Vue em memória                                                  |
| `tests/notificacoes.browser.mjs`            | 20 cenários funcionais e responsivos em Chrome headless, com dados somente de teste                                         |
| `package.json`                              | Acrescenta a suíte de notificações a npm test, preservando todos os testes anteriores                                       |
| `docs/FEAT-44-notificacoes.md`              | Contratos, decisões, cobertura e limitações                                                                                 |

Reutilizados sem alteração: `EmpresaHeader` como base visual, footer global, authGuard, authSession, authService, api, `capturarEmpresa`, `resolverImagem` da FEAT-40 e a estrutura de testes Node/Vite/Vue. Não foi necessária nova store Pinia: o estado é local à página e descartado na desmontagem. Nenhuma dependência foi adicionada.

## Endpoints e contratos JSON

Todas as operações Django passam pela instância Axios existente em `services/api`. Os caminhos abaixo são relativos à base `/api/`:

| Operação              | Método e caminho                                | Resposta esperada                                          |
| --------------------- | ----------------------------------------------- | ---------------------------------------------------------- |
| Listar notificações   | GET `notificacoes/?page=1&status=pendente`      | HTTP 200, envelope DRF                                     |
| Consultar notificação | GET `notificacoes/{id}/`                        | HTTP 200, notificação                                      |
| Marcar leitura        | PATCH `notificacoes/{id}/marcar-lida/` com `{}` | HTTP 200, notificação com `lida: true`                     |
| Consultar candidatura | GET `candidaturas/{id}/`                        | HTTP 200, candidatura profissional e `whatsapp` autorizado |
| Aprovar               | POST `candidaturas/{id}/aprovar/` com `{}`      | HTTP 200, status real e contato quando disponível          |
| Recusar               | POST `candidaturas/{id}/recusar/` com `{}`      | HTTP 200, status real                                      |

Não existem PATCH genérico de status, chamadas a perfil privado de terceiros ou endpoints inventados.

Estrutura da notificação:

```javascript
{
  id, candidatura, freelancer, oportunidade,
  freelancer_detalhes: { id, name, profissao, habilidades, profile_image },
  oportunidade_titulo, status,
  candidatura_criado_em, criado_em, lida
}
```

`id` é o identificador da **notificação**: usado em consulta e marcação de leitura. `candidatura` é o identificador da **candidatura**: usado em consulta, aprovação e recusa. `freelancer` e `oportunidade` não são usados como IDs de decisão. As mutações não enviam proprietário, telefone, status genérico ou dados administrativos.

A listagem retorna `{count, next, previous, results}`. A candidatura para empresas inclui `{id, freelancer, oportunidade, status, freelancer_detalhes, whatsapp}`; outros campos de sua resposta não são necessários à página e não são guardados pelo serviço. `freelancer_detalhes` conserva somente os cinco campos profissionais autorizados.

As datas de exibição vêm de `candidatura_criado_em`, formatadas por `Intl.DateTimeFormat('pt-BR', {dateStyle:'short', timeStyle:'short'})`, respeitando o fuso do navegador. `criado_em` da notificação não é utilizado para representar a data de candidatura. Ausência ou valor inválido mostra “Data não informada”.

## Listagem, filtros e paginação

- Os quatro filtros são Todas (sem parâmetro status), Pendentes (`pendente`), Aprovadas (`aprovada`) e Recusadas (`recusada`).
- A consulta é feita no servidor. Trocar filtro cancela as consultas anteriores, limpa resultados e volta à página 1.
- A ordenação da API é preservada; o frontend não reordena os registros por outra data ou por nome.
- Os botões Anterior/Próxima acessam páginas posteriores e preservam o filtro. A contagem exibida é `count` do filtro atual, nunca uma estimativa global por status baseada na página.
- Os links next/previous são validados por origem, caminho exato `notificacoes/`, ausência de credenciais/fragmento, parâmetros permitidos (`page`, `status`), página positiva e filtro consistente. A aplicação extrai somente a página e monta novamente uma chamada relativa; não entrega a URL externa diretamente ao Axios autenticado.
- Após decisões, a página atual é reconsultada. Se a última página deixa de existir ou fica vazia após uma decisão, retorna à página anterior preservando o filtro.
- Atualizar ou recarregar a página consulta a API. Não há persistência de notificações em localStorage.

## Aprovação, recusa e conflito

Somente registros pendentes da lista atual oferecem os botões. Aprovar e recusar abrem confirmação com candidato e oportunidade identificados. Cancelar não envia requisição. Uma confirmação verifica novamente o estado atual da lista para impedir ação sobre um snapshot de confirmação que ficou antigo.

Durante leitura ou decisão, a navegação de filtros/páginas e as mutações ficam bloqueadas para manter um contexto consistente. Os botões da decisão ficam desabilitados até a resposta. O serviço também mantém uma trava por empresa/revisão/recurso para impedir mutações simultâneas duplicadas.

O status só é alterado depois de HTTP 200 e usa o valor retornado. O ID, freelancer e oportunidade da resposta da candidatura são conferidos contra o registro exibido. A listagem é reconsultada após sucesso; a decisão confirmada não é repetida se essa reconsulta falhar. A falha é exibida com possibilidade de recarregar a lista.

HTTP 409 recebe mensagem de candidatura já analisada, seguido de GET da candidatura para sincronizar o estado e atualização da listagem. Não existe repetição automática do POST nem feedback falso de sucesso. Se a reconsulta do conflito falhar, as ações daquela candidatura ficam bloqueadas até atualização explícita. Os GETs e os POSTs continuam sujeitos à autorização definitiva do backend.

## Leitura e detalhes profissionais

“Marcar como lida” é uma ação explícita por item; abrir a lista ou os detalhes não marca tudo automaticamente. O PATCH usa o ID da notificação e aguarda `lida: true` em HTTP 200. Falhas preservam “Não lida”. Somente o booleano de leitura é aplicado da resposta, evitando que o status da candidatura retornado nesse snapshot substitua outra atualização.

“Visualizar candidato” abre o diálogo com dados profissionais já autorizados pela notificação e consulta a candidatura para atualização. Não navega para `/perfil`, que continua representando a própria conta autenticada. Nome, profissão, habilidades e foto usam dados reais; campos ausentes têm indicação discreta. Nenhum email, telefone, coordenada, token, grupo ou dado administrativo do candidato é apresentado. Não existe JSON bruto exibido na interface.

O diálogo usa `showModal`, foco inicial em Fechar/Cancelar, Escape, bloqueio de fechamento durante a mutação e restauração de foco após a desmontagem. Se o botão original saiu da lista, o foco volta ao título da página. Estados de carregamento/sucesso usam role status e falhas usam role alert.

## WhatsApp

A notificação não fornece contato. Para os registros aprovados da página visível, a aplicação consulta `GET candidaturas/{id}/`; a resposta da decisão também é normalizada com seu contato. O objeto esperado é:

```javascript
// Disponível
{ disponivel: true, modo: 'link', url: 'https://wa.me/<telefone-internacional>?text=<mensagem-codificada>', mensagem_enviada: false }
// Indisponível
{ disponivel: false, modo: 'link', url: null, mensagem_enviada: false, motivo: 'telefone_invalido' }
```

A URL só aparece como “Conversar pelo WhatsApp” quando o status é aprovada, disponivel é estritamente true e a URL é segura: HTTPS, hostname exato wa.me, caminho com telefone internacional numérico de 8 a 15 dígitos, sem credenciais, porta não padrão ou fragmento. URLs arbitrárias, domínios parecidos, protocolos diferentes e caminhos não numéricos são rejeitados.

O link original é preservado; a mensagem não é montada, duplicada ou recodificada. A âncora usa target blank e rel noopener noreferrer. Nenhum JWT é acrescentado à URL; nenhum número é reconstruído a partir do perfil. O texto informa que abrir a conversa não envia uma mensagem automaticamente. Contato indisponível não produz âncora inválida; falha da consulta apresenta nova tentativa separada do carregamento da lista. Pendentes e recusadas nunca exibem contato.

Não há push, polling, envio de WhatsApp nem contadores globais de não lidas.

## Sessões, concorrência e erros

- O serviço reutiliza `capturarEmpresa` para validar empresa, identidade e revisão, além de exigir tokens da sessão existente.
- Cada chamada leva `_sessionRevision`, já suportado pelo interceptor central. A troca de sessão antes do envio impede que a requisição use novas credenciais. O refresh JWT existente permanece responsável pela renovação.
- O composable observa revisão, ID e tipo da conta sincronamente. Logout, mudança de empresa e desmontagem cancelam requisições e limpam lista, filtros, detalhes, contatos, confirmação e feedback.
- AbortController, sequência de listagem e versões por candidatura descartam respostas antigas de filtros, consultas de candidato e decisões. Uma consulta iniciada antes de uma decisão não pode sobrescrever seu resultado confirmado.
- A ausência de dados de outra empresa também depende do queryset e das permissões do backend. Não há parâmetro no cliente para escolher uma empresa diferente.
- A página trata 400, 401, 403, 404, 409, 503, outros 5xx e falhas de conexão com mensagens compreensíveis. Não mostra detalhes internos da exceção.

Cancelar transporte não desfaz uma operação que o servidor já recebeu. As garantias de atomicidade, idempotência da mesma decisão e conflito da decisão oposta são do backend confirmado em código. Não se afirma entrega ou cancelamento de mensagens WhatsApp, porque o frontend não envia mensagens.

## Testes e resultados

### Linha de base antes das alterações

- `npm test`: **160 aprovados, 0 falhos**.
- `npm run build`: aprovado, incluindo PWA.

### Execução final

- `npm test`: **202 aprovados, 0 falhos**, sem skips (160 anteriores + 42 novos).
- `node --test tests/notificacoes.test.mjs`: **42 aprovados, 0 falhos**.
- `npm run build`: aprovado, incluindo geração PWA. Aviso não bloqueante existente: caniuse-lite desatualizado; não foram modificadas dependências para ocultá-lo.
- `node tests/notificacoes.browser.mjs`: **20/20 cenários aprovados**, em Chrome headless.
- `node tests/gerenciamentoVagas.browser.mjs`: aprovado; regressão de criação, histórico, isolamento, edição, exclusão, Escape, foco e layout.
- Prettier --check nos arquivos desta entrega: aprovado. `git diff --check`: aprovado.

A suíte nova agrupa carregamento/contagem/datas reais; guard de empresa/freelancer/anônimo; validação de IDs; vazio, erro e retry; todos os códigos HTTP; filtros e páginas; rejeição de paginação externa; troca rápida de filtro; logout e troca de empresa; projeção profissional sem privados; aprovação/recusa com ID correto e novo GET; cancelamento e cliques repetidos; falha sem status falso; 409 de ambas as ações; falha na sincronização do 409; leitura correta/sem sobrescrever status; WhatsApp aprovado/autorizado/indisponível/malicioso; descarte de candidato e decisão atrasados; troca de sessão antes do interceptor; compilação/privacidade/navegação; confirmação cujo snapshot mudou; reconsulta após decisão falhando sem novo POST; retorno da última página removida.

Os 20 cenários de navegador são cinco fluxos em cada largura 320, 375, 768 e 1280: lista interativa completa, vazio, erro com recuperação, conflito e logout. O fluxo completo consulta candidato, verifica habilidades/foto e ausência de privados, testa Escape/retorno de foco, marca leitura, visita a página posterior, troca filtro, cancela confirmação, aprova, inspeciona a âncora WhatsApp sem clicar e recusa. A suíte verifica footer único, atalho no header, botões durante processamento, URLs/IDs das operações e ausência de overflow horizontal. Capturas foram inspecionadas visualmente em `node_modules/.cache/feat44-browser` (lista, candidato, aprovadas, vazio, erro e conflito).

A regressão visual existente também passou nas larguras 320, 375, 390, 430, 768 e 1440 para criação e 375, 768 e 1280 para edição/gerenciamento. Todos os testes usam dados e transporte simulados; nenhuma candidatura real foi analisada, nenhuma vaga real foi criada e nenhum WhatsApp real foi aberto.

## Limitações e homologação pendente

O código da DEV do backend foi verificado em leitura, mas não havia API local ativa nem ambiente de teste integrado disponível. Permanecem pendentes a homologação autenticada com empresas/candidatos descartáveis, confirmação de permissões e persistência no banco real, configuração do ambiente publicado e abertura manual de conversa em dispositivo compatível. Os testes de navegador não substituem testes em aparelhos físicos ou com tecnologias assistivas reais.

Os links WhatsApp podem abrir o aplicativo ou a versão web conforme a plataforma. Isso exige ação do usuário e não confirma envio/entrega de mensagem.

A disponibilidade de campos/endpoints na versão publicada não pode ser inferida apenas da DEV. Se o ambiente publicado estiver defasado, sua atualização é uma tarefa de backend/operação, não foi implementada neste repositório.

Nenhum arquivo do backend, configuração real de ambiente ou credencial foi alterado. Não foram executados commit, push, merge, deploy ou PR para esta feature.
