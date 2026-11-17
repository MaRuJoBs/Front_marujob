# FEAT-58 — GPS no perfil da empresa

Em `/empresa/perfil`, **Editar informações → Usar minha localização atual** obtém a posição pelo mesmo composable de GPS usado no perfil do usuário. O botão distingue captura do GPS e identificação da cidade. O resultado preenche cidade/UF; **Salvar alterações** persiste no perfil. Não existe busca ou seleção manual de cidade.

O GPS só é solicitado ao clicar. A posição é enviada ao serviço de geocodificação já utilizado pelo usuário (Nominatim/OpenStreetMap) para identificar uma cidade brasileira. Apenas `cidade` e `uf` são enviadas a `PATCH empresas/me/`; coordenadas não são persistidas no perfil empresarial ou em localStorage. O botão requer contexto seguro e permissão de localização do navegador.

Erros de permissão, timeout ou geocodificação preservam a localização anterior e permitem tentar novamente. Cancelar, descartar, desmontar a tela ou trocar de sessão invalida resultados atrasados. A resposta de salvamento deve confirmar os campos enviados antes de mostrar sucesso. Remover e descartar a localização continuam disponíveis.

O visual mantém o shell compacto e a identidade roxa do aplicativo: cabeçalho com destaque para logotipo/nome, área de atuação em etiqueta, localização com ícone, cartões claros e edição organizada em blocos.

## Validação

```text
npm test
npm run test:localizacao-empresa:browser
npm run build
```

Os testes cobrem o GPS, erros, repetição, sessão, descarte, salvamento e releitura. Os testes do navegador usam Chromium e os componentes reais, com GPS e transporte de API isolados. Incluem 320, 375, 768 e 1440 px; resultados e capturas ficam em `node_modules/.cache/feat58-browser/`.

Os testes não modificam contas externas e não comprovam a disponibilidade do geocodificador ou a persistência em uma instância publicada do backend.
