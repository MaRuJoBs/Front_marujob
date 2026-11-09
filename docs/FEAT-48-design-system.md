# FEAT-48 — Design System Incremental

**Demonstração manual:** execute `node tests/design-system.browser.mjs --serve` e use a URL impressa pelo Vite. Nesta validação o servidor disponibilizou **http://127.0.0.1:5199/**. Veja [Demonstração manual persistente](#demonstração-manual-persistente).

**Estado atual: implementada sob contrato provisório autorizado; APTA COM RESSALVAS.** Tokens e componentes isolados disponíveis. A integração global continua reservada à FEAT-49. Validação visual e aprovação futura da equipe/Figma permanecem pendentes. Consulte [Implementação após autorização](#implementação-após-autorização) para API, exemplos e resultados atuais.

## Registro histórico da auditoria inicial

O conteúdo A–L abaixo preserva a auditoria anterior à autorização. As classificações de bloqueio e falhas de ambiente desse registro foram superadas conforme a seção de implementação ao final; não descrevem o estado atual.

Data: 2026-11-09. Classificação inicial: **BLOQUEADA** por ausência de contrato visual aprovado. Entrega atual: auditoria; implementação visual pendente. Classificação final: **NÃO APTA PARA REVISÃO da implementação**. Este documento pode ser revisado para desbloquear a execução.

## A. Repositório e isolamento

- Raiz: `/mnt/c/Users/omtra/OneDrive/Documentos/Front_marujob`.
- Branch local: `FEAT-48`, já existente; nenhuma troca ou criação realizada.
- Commit inicial: `b692e87ecb9cce4adf57fbda48a3c261448cb61c`.
- Estado inicial limpo, sem alterações preexistentes; sem merge/rebase pendente ou entradas em conflito.
- `DEV`, `origin/DEV` e `FEAT-48` apontam para o mesmo commit; divergência local 0/0. Consulta direta ao GitHub confirmou o mesmo SHA para DEV.
- Uma única worktree listada, neste diretório. Isso não comprova ausência de outro processo Codex; nenhuma segunda worktree foi usada.
- Estado final esperado: somente este documento novo, sem staging. Nenhum arquivo de aplicação alterado.

## B. Auditoria anti-duplicação

Foram consultados branches locais/remotos, histórico local, os 35 PRs retornados por `gh pr list --state all --limit 200` e títulos, corpos e branches pela API de PRs (100 por página; resposta com menos de 100 itens). Busca por FEAT-45 a FEAT-49, F48, design system, UI kit, component library, design tokens, shared components, tokens CSS, base components, componentes globais, padronização e Figma não retornou PR correspondente na consulta à API. Não havia PR aberto na listagem recebida.

GitHub confirmou somente DEV entre os nomes remotos FEAT-45/46/47/48/49 consultados. A inexistência desses nomes não prova ausência de trabalho externo ou branches com nomes alternativos. Nenhum contrato de coordenação dessas funcionalidades foi localizado no código/documentação.

PRs recentes relevantes para preservar componentes existentes:

| PR                                                      | Conteúdo                               | merged_at (UTC)      |
| ------------------------------------------------------- | -------------------------------------- | -------------------- |
| [92](https://github.com/MaRuJoBs/Front_marujob/pull/92) | FEAT-38: favoritos, perfil e portfólio | 2026-11-04T16:06:29Z |
| [91](https://github.com/MaRuJoBs/Front_marujob/pull/91) | FEAT-44: notificações e candidaturas   | 2026-11-03T18:13:26Z |
| [90](https://github.com/MaRuJoBs/Front_marujob/pull/90) | FEAT-40: perfil e portfólio            | 2026-11-03T17:47:13Z |
| [89](https://github.com/MaRuJoBs/Front_marujob/pull/89) | FEAT-36: gerenciamento de vagas        | 2026-10-30T21:41:49Z |
| [88](https://github.com/MaRuJoBs/Front_marujob/pull/88) | FEAT-37: oportunidades                 | 2026-10-30T20:55:18Z |

Commits relevantes: `6f095e3` (favoritos/perfil), `8976773` (notificações), `e712839` (perfil/portfólio), `a5dd0df` (oportunidades). Busca no histórico disponível não identificou implementação da FEAT-48 ou design system equivalente.

Implementações inspecionadas: `FavoritoButton.vue` tem semântica e foco próprios, mas depende do store de favoritos; não é botão visual genérico. `ConfirmarExclusaoVaga.vue` e `NotificacoesDialog.vue` têm estados, foco e responsabilidades de domínio; não devem ser duplicados por um sistema global de notificações. Login e cadastro contêm campos/botões locais; cards de oportunidades também são locais. Não foi localizada biblioteca de componentes base nem arquivo equivalente de tokens da identidade MaRuJoBs. Há variáveis globais do scaffold Vue e variáveis locais aproveitáveis como referências, não como aprovação visual.

Limites: auditoria estática do código e consultas GitHub; sem inspeção de arquivos Figma, trabalho não publicado, issues ou material externo da equipe.

## C–D. Diagnóstico e contrato visual

Não foi localizado link/arquivo Figma no repositório ou nos PRs consultados. A ferramenta de documentos conectados retornou nenhuma sessão. Não se confirmou acesso ao material de design. **Nenhum token está confirmado pelo Figma.**

Valores abaixo são observações do código atual, sem aprovação de design:

| Categoria    | Evidência existente                                                               | Inconsistência/decisão necessária                  |
| ------------ | --------------------------------------------------------------------------------- | -------------------------------------------------- |
| Roxo de ação | Login `#6e4ab7`; cadastro `#6f50c5`; favoritos `#673fd7`; oportunidades `#7150a6` | Escolher primário e estados aprovados              |
| Texto        | Login `#4f2ba5` e `#726a85`; oportunidades `#533581` e `#796197`                  | Definir hierarquia semântica                       |
| Superfície   | Login `#f1edf6`; cadastro `#ece5f7`; oportunidades `#f6f1fa`                      | Definir fundo/superfície e contraste               |
| Feedback     | Cadastro `#b30000` sobre `#ffe6e6`; diálogo `#195539` sobre `#e5f6ec`             | Confirmar erro, sucesso, aviso e informação        |
| Família      | Base Inter com fallbacks; cadastro/oportunidades Arial; vagas/favoritos Poppins   | Definir família e disponibilidade real da fonte    |
| Tipografia   | Base 15px/1.6; cadastro 12/13/14/16/18/45px, pesos 600 e bold; login títulos 46px | Aprovar escala, pesos e alturas                    |
| Espaço       | Cadastro padding 12/15/25/30px, gaps 8/10px                                       | Aprovar escala pequena                             |
| Raios        | Login botão 8px/card 16px; cadastro botão 12px/card 20px; diálogo botões 9px      | Aprovar raios por função                           |
| Sombras      | Login `0 4px 10px rgba(0,0,0,.18)`; cadastro `0 3px 10px rgba(0,0,0,.15)`         | Confirmar necessidade e intensidade                |
| Interação    | Foco de favoritos 2px `#673fd7`; diálogo 3px `#63369e`; disabled/loading locais   | Padronizar foco, hover, active, disabled e loading |

`src/assets/base.css` declara `--color-background`, `--color-border`, `--color-text` e modo escuro automático. Uma nova declaração global com os mesmos nomes pode colidir. O reset também normaliza peso em todos os elementos. `src/main.js` importa `assets/main.css`, que importa `base.css`: esse é o encadeamento atual, não autorização de alteração.

Proposta para aprovação: usar o Figma como origem; se indisponível, a equipe deve aprovar expressamente uma seleção dos valores observados acima. Usar nomes semânticos com prefixo `--mrj-` para evitar colisões; uma família tipográfica; escala curta de texto e espaço; raios pequeno/médio/grande/pílula; sombras somente quando confirmadas. Cada valor precisa de origem (frame/style/variable ou decisão da equipe), finalidade, pares de contraste e estados aprovados. Nenhuma proposta foi consolidada em CSS.

Para desbloquear: fornecer link Figma com frames/estilos aprovados e acesso, ou aprovar contrato alternativo explícito; definir também o responsável e o contrato de integração FEAT-49.

## E–F. Implementação e compatibilidade

Único arquivo novo: `docs/FEAT-48-design-system.md`. Nenhum arquivo existente modificado, token ou componente criado, dependência instalada ou reutilização aplicada. A interrupção das alterações dependentes segue a regra crítica do contrato visual.

Após aprovação, reavaliar equivalentes e começar pelo menor conjunto necessário, provavelmente botão e campo; card/feedback somente com utilização demonstrável. Componentes Vue 3 sem acesso a store, API, autenticação ou domínio. Não há props, eventos, slots ou exemplos executáveis disponíveis nesta entrega; não devem ser tratados como API pronta.

Integração futura: criar tokens isolados no caminho acordado; confirmar prefixo, escopo e modo escuro; manter componentes fora das páginas e rotas existentes; alinhar com FEAT-49 a ativação no encadeamento global; medir regressões antes de autorizar importação. Não importar globalmente por antecipação.

Dependências futuras, sem implementação nesta tarefa:

- FEAT-45: possível reutilização de botão, campo de busca e card no diretório. Integração não identificada sob esse nome.
- FEAT-46: possível uso de tipografia, espaçamento e cards nos perfis públicos. Escopo distinto do perfil/portfólio FEAT-40 já integrado.
- FEAT-47: escopo real não confirmado na DEV; não presumir telas nem modificar componentes por associação.
- FEAT-49: acordar propriedade dos estilos centrais, ordem de imports, colisões e modo escuro antes da ativação global.

## G. Acessibilidade

Há foco visível em favoritos e diálogos, `role="alert"`/`status` nos estados locais e suporte a movimento reduzido em alguns componentes, como criação de vagas. Também há `outline: none` em estilos locais, cuja compensação e comportamento precisam de verificação individual em navegador. Essas observações não constituem validação completa.

Contraste não medido nesta entrega; nenhum par aprovado. Na implementação, medir os pares efetivos (4,5:1 texto comum, 3:1 texto grande e indicadores aplicáveis), incluindo superfícies, foco e estados. Verificar teclado, associação label/id, descrição de ajuda/erro, `aria-invalid`, disabled nativo, `aria-busy`, bloqueio de clique em loading e mensagens que não dependam só de cor. Respeitar movimento reduzido. Nenhum componente novo teve acessibilidade validada.

## H–I. Testes e validação visual

Node observado: v24.22.1. Dependências não estão instaladas (`node_modules/.bin` ausente). Antes de qualquer alteração de aplicação:

- `npm test`: 7 entradas reportadas pelo runner, 1 aprovada e 6 falhas na inicialização por módulos ausentes (`axios`/`vite`). Não é evidência de regressão da FEAT-48; nenhuma asserção funcional foi validada nas suítes que não carregaram.
- `npm run build`: executado, falhou com `vite: not found`. Build não aprovado.
- Nenhum teste novo, pois somente documentação foi adicionada. Há testes Node e scripts de navegador de funcionalidades anteriores.
- Não existe script lint. Existe `format`, que reescreve todo `src/`; não executado para preservar arquivos fora do escopo. Sem verificação Prettier declarada como aprovada.
- `git diff --check`: sem erros de whitespace; Git emitiu avisos de normalização CRLF/LF dos arquivos existentes, sem alteração de conteúdo.

Não foram instaladas dependências para validar implementação visual bloqueada. Próximo ciclo: instalar conforme lockfile, executar testes/build e checks dos componentes efetivamente implementados.

Nenhum componente renderizado, screenshot gerado ou comparação Figma realizada. Nenhuma validação celular/tablet/desktop ou regressão visual de home, login, cadastro, oportunidades, detalhes, perfil, empresas, diretório, navegação, header/footer foi concluída. A ausência de alterações de aplicação indica ausência de mudança introduzida, mas não substitui teste visual. Não foi necessário verificar disponibilidade de navegador nesta etapa documental.

## J–L. Git, riscos e conclusão

Revisão limitada ao novo documento, com arquivos de aplicação preservados. Sem alteração em backend, outros repositórios, CSS existente, rotas, páginas ou arquivos centrais. Nenhum segredo, `.env`, `node_modules`, `dist`, imagem ou artefato temporário incluído no diff. Sem staging, commit, push, merge, rebase ou deploy.

| Nível   | Natureza                                           | Evidência/ação                                                     |
| ------- | -------------------------------------------------- | ------------------------------------------------------------------ |
| Crítico | Nenhum identificado nesta alteração documental     | Não houve implementação visual                                     |
| Alto    | Confirmado: contrato visual ausente                | Bloqueia consolidação de tokens e aprovação da implementação       |
| Médio   | Confirmado: testes/build sem dependências          | Reexecutar em ambiente preparado antes de revisão de código visual |
| Médio   | Potencial: colisões globais e modo escuro          | Prefixo/escopo e contrato FEAT-49 antes de importar                |
| Baixo   | Potencial: sobreposição com trabalho não publicado | Repetir auditoria antes de implementar                             |

Critérios atendidos: repositório e branch corretos, investigação GitHub, preservação de código existente, documentação do bloqueio e dependências, ausência de operações proibidas. Pendentes: contrato aprovado, tokens, componentes necessários, APIs e exemplos reais, contraste, teclado, testes funcionais aprovados, build e validação visual.

**NÃO APTA PARA REVISÃO da implementação.** Aguardar referência/aprovação visual para prosseguir; conclusão definitiva depende de aprovação da equipe, integração futura à DEV e aceite dos testes.

## Implementação após autorização

O usuário autorizou expressamente usar a identidade visual atual como **contrato provisório exclusivo da FEAT-48**. Isso desbloqueou o desenvolvimento sem atribuir valores ao Figma e sem substituir a aprovação visual futura da equipe. Classificação atual: **APTA COM RESSALVAS**, pela ausência de validação visual real e de referência Figma. Não significa conclusão definitiva nem autorização de integração/commit.

### Retomada e ambiente

Repositório e branch reconfirmados, HEAD `b692e87`, sem merge/rebase pendente. A única alteração anterior era este documento não rastreado, preservado como histórico acima. A busca anterior e a reconferência dos nomes/componentes não encontraram equivalentes de tokens MaRuJoBs ou BaseButton/BaseInput/BaseCard; os componentes de domínio continuam preservados.

O `npm ci` interrompido havia terminado com `EPERM` no `spawnSync` do binário esbuild durante seu postinstall. Não se aguardou esse processo novamente após obter o resultado. A repetição autorizada fora do sandbox, `npm ci --cache node_modules/.cache/npm --no-audit --no-fund`, terminou com sucesso: 458 pacotes, sem alterações em `package.json`/`package-lock.json`. Node v24.22.1 e npm 11.19.1. Vite, Axios e Vue resolvem corretamente após a instalação. Avisos de pacotes transitivos depreciados e de política de install scripts não levaram a atualizações.

Antes de criar os componentes, testes/build foram tentados e reproduziram a falta de dependências enquanto a reinstalação ainda estava em andamento. Depois da instalação, a suíte existente e o build passaram; nenhum componente existente foi modificado para corrigir testes. Os novos componentes não estão no grafo de imports da aplicação, por isso também há um build isolado deles nos testes novos.

### Arquivos desta entrega

| Arquivo                            | Finalidade                                                            |
| ---------------------------------- | --------------------------------------------------------------------- |
| `src/styles/tokens.css`            | Contrato semântico provisório com prefixo `--mrj-` e escopo `.mrj-ui` |
| `src/components/ui/BaseButton.vue` | Botão nativo, variantes/tamanhos, disabled e loading                  |
| `src/components/ui/BaseInput.vue`  | Campo textual/número com v-model, label, ajuda e erro                 |
| `src/components/ui/BaseCard.vue`   | Contêiner visual com slots e elevação opcional                        |
| `tests/design-system.test.mjs`     | Comportamento Vue, contrato CSS, contraste e build isolado            |
| `tests/design-system.browser.mjs`  | Harness local independente para validação em Chrome/CDP               |
| `docs/FEAT-48-design-system.md`    | Auditoria preservada, contrato, API e resultados                      |

Nenhum componente de feedback criado: mensagens locais e os diálogos existentes são suficientes nesta etapa. Não foi introduzida biblioteca de UI nem dependência nova.

### Tokens e origem das decisões

Todos os nomes abaixo recebem prefixo `--mrj-`. São valores existentes ou adaptações explícitas do contrato provisório, **não valores extraídos/aprovados no Figma**.

| Tokens                                           | Valores                         | Origem e decisão                                                                                                                                                                                            |
| ------------------------------------------------ | ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `color-primary`                                  | `#6e4ab7`                       | Botão do login; ação principal preserva a identidade roxa                                                                                                                                                   |
| `color-primary-hover`, `color-primary-active`    | `#63369e`, `#4f2ba5`            | Foco do diálogo de exclusão e texto do login, reaproveitados como estados mais escuros; atribuição semântica provisória                                                                                     |
| `color-secondary`, `color-secondary-hover`       | `#eae1f3`, `#dfd1ee`            | Chips e controles de oportunidades, reutilizados para variante secundária                                                                                                                                   |
| `color-background`, `color-surface`              | `#eee7f4`, `#f6f1fa`            | Fundo e cards de oportunidades                                                                                                                                                                              |
| `color-text`, `color-text-secondary`             | `#533581`, `#5c3a8b`            | Textos de oportunidades; o segundo foi escolhido após medição de contraste                                                                                                                                  |
| `color-border`, `color-border-subtle`            | `#796197`, `#dcd0e8`            | Texto secundário e borda de oportunidades; borda de input deliberadamente mais escura para contraste, borda sutil apenas decorativa no card                                                                 |
| `color-on-primary`                               | `#ffffff`                       | Texto dos botões existentes                                                                                                                                                                                 |
| `color-danger`, `color-success`, `color-warning` | `#b30000`, `#195539`, `#694b8b` | Erro no cadastro, sucesso em NotificacoesDialog e texto roxo de oportunidades. Warning é texto provisório roxo, não uma paleta amarela nem um novo sistema de feedback; comunicar aviso também com palavras |
| `color-focus`                                    | alias de `color-primary-hover`  | Foco de 3px existente no diálogo, sem valor literal duplicado                                                                                                                                               |
| `font-family`                                    | `Arial, Helvetica, sans-serif`  | Cadastro e oportunidades; nenhuma fonte remota nova                                                                                                                                                         |
| `font-size-sm/md/lg`                             | `0.875/1/1.125rem`              | Normalização em rem de 14/16/18px presentes no projeto, assumindo raiz padrão de 16px; respeita preferências de fonte                                                                                       |
| `font-weight-regular/semibold`, `line-height`    | `400/600`, `1.5`                | Pesos existentes e altura usada em perfil, portfólio e criação de vagas                                                                                                                                     |
| `space-1/2/3/4/6/8`                              | `0.25/0.5/0.75/1/1.5/2rem`      | Escala provisória de múltiplos de 4px, normalizando os espaçamentos locais; 8/12/24px têm exemplos nos componentes existentes, demais degraus são decisões de escala, não extrações Figma                   |
| `radius-sm/md/lg/pill`                           | `0.5/0.75/1rem/999px`           | Raios 8/12/16px existentes e normalização de controles arredondados                                                                                                                                         |
| `border-width`, `shadow-card`                    | `1px`, `0 2px 3px #4c356719`    | Borda e sombra discreta de oportunidades; sombra só com `elevated`                                                                                                                                          |
| `focus-width/offset`                             | `3px/3px`                       | Diálogo de exclusão de vaga                                                                                                                                                                                 |
| `control-height-sm/md/lg`                        | `2.5/2.75/3rem`                 | Decisão de acessibilidade provisória: alturas mínimas 40/44/48px, não medidas do Figma                                                                                                                      |
| `disabled-opacity`, `motion-duration`            | `0.65`, `150ms`                 | Opacidade de exclusão existente; duração curta é decisão incremental. Duração vira `0ms` com movimento reduzido                                                                                             |

Os tokens não são declarados em `:root`. Cada componente importa o mesmo CSS e aplica `.mrj-ui` na raiz; o Vite deduplica o módulo. Isso publica somente regras opt-in, sem modificar body, reset, modo escuro ou cores globais. Os componentes usam uma superfície clara explícita e não implementam tema escuro. Um token local pode ser consumido colocando `mrj-ui` no próprio elemento ou em um ancestral; não depende de importar em `main.js`.

Exemplo de consumo isolado fora dos componentes base:

```vue
<script setup>
import '@/styles/tokens.css'
</script>

<template>
  <section class="mrj-ui exemplo">Conteúdo</section>
</template>

<style scoped>
.exemplo {
  padding: var(--mrj-space-4);
  background: var(--mrj-color-surface);
  color: var(--mrj-color-text);
}
</style>
```

Para customização futura, considerar a cascata: cada raiz `.mrj-ui` declara seus defaults, portanto um token alterado só no ancestral não sobrepõe automaticamente defaults de componentes descendentes. Aplicar overrides na própria raiz com seletor de especificidade apropriada ou acordar outro mecanismo com FEAT-49; não criar tema paralelo.

### API dos componentes

**BaseButton**

| Prop           | Padrão        | Contrato                                                             |
| -------------- | ------------- | -------------------------------------------------------------------- |
| `variant`      | `primary`     | `primary`, `secondary`, `outline`, `text`                            |
| `size`         | `medium`      | `small`, `medium`, `large`                                           |
| `type`         | `button`      | `button`, `submit`, `reset`; não submete formulário por acidente     |
| `disabled`     | `false`       | Desabilita botão nativamente e bloqueia emissão de clique            |
| `loading`      | `false`       | Desabilita, aplica `aria-busy` e inclui mensagem com `role="status"` |
| `loadingLabel` | `Carregando…` | Texto de carregamento visível, ajustável ao contexto                 |

Slot default: conteúdo do botão. Evento `click`: MouseEvent nativo, somente quando habilitado. Atributos HTML, incluindo `aria-label` quando necessário, são repassados à raiz. Manter texto com nome acessível; um slot só com ícone exige nome acessível explícito. Conteúdo original permanece visível durante loading.

**BaseInput**

| Prop                   | Padrão               | Contrato                                                                                    |
| ---------------------- | -------------------- | ------------------------------------------------------------------------------------------- |
| `modelValue`           | string vazia         | String ou número recebido; emite string no evento de input                                  |
| `label`                | obrigatório          | Label visível, associado ao input                                                           |
| `id`                   | gerado com `useId()` | Fornecer ID único quando precisar controlar referências externas                            |
| `type`                 | `text`               | `text`, `email`, `password`, `search`, `tel`, `url`, `number`                               |
| `placeholder`          | string vazia         | Complemento visual; não substitui label                                                     |
| `help`, `error`        | string vazia         | Ajuda e erro associados via `aria-describedby`; erro aplica `aria-invalid` e `role="alert"` |
| `disabled`, `required` | `false`              | Atributos nativos; required também aparece em texto no label                                |

Evento `update:modelValue` para `v-model`. `name`, `autocomplete`, `min`, `max`, `readonly`, classes e listeners como `blur` são repassados ao input, não ao wrapper. `aria-describedby` externo é preservado e combinado com ajuda/erro. Sem slots, sem validação de negócio, sem suporte a checkbox/radio/file ou transformação automática de número/modificadores `v-model.number`/`trim`. Converter o valor no consumidor quando necessário. `useId()` exige Vue 3.5, já instalado neste projeto; IDs são únicos dentro da aplicação. Para múltiplas aplicações Vue na mesma página, configurar `app.config.idPrefix` ou IDs explícitos distintos.

**BaseCard**

Prop `elevated` (Boolean, default false) ativa sombra discreta. Slots `header`, default e `footer`, nessa ordem. Raiz `div` sem evento ou comportamento de botão; o consumidor define títulos/semântica do conteúdo. Padding passa de 16 para 24px a partir de 48rem. Conteúdo longo quebra linha, sem largura fixa; imagens/tabelas dos slots devem definir sua própria responsividade.

Exemplo completo, sem modificar nenhuma página existente:

```vue
<script setup>
import { ref } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseCard from '@/components/ui/BaseCard.vue'

const nome = ref('')
const salvando = ref(false)
const erro = ref('')
function salvar() {
  // O consumidor implementa a ação e controla loading/erro.
}
</script>

<template>
  <BaseCard elevated>
    <template #header><h2>Dados profissionais</h2></template>
    <form @submit.prevent="salvar">
      <BaseInput
        v-model="nome"
        label="Nome"
        name="nome"
        autocomplete="name"
        help="Informe seu nome profissional."
        :error="erro"
        required
      />
      <BaseButton type="submit" :loading="salvando">Salvar</BaseButton>
      <BaseButton variant="outline" :disabled="salvando">Cancelar</BaseButton>
    </form>
    <template #footer>Seus dados podem ser atualizados depois.</template>
  </BaseCard>
</template>
```

### Acessibilidade e contraste

Botões nativos, disabled nativo e proteção adicional no handler de clique; inputs com label, required textual, ajuda/erro e IDs; foco `:focus-visible` de 3px com offset de 3px; texto de loading e erro sem depender exclusivamente de cor. Movimento reduzido zera a duração das transições. Tamanhos mínimos de botão 40/44/48px; input 44px. Nenhum `outline: none` nem `!important` nos novos componentes.

O teste calcula luminância sRGB e relações WCAG: texto comum >= 4,5:1 e borda de controle/foco >= 3:1 nos fundos previstos. Exemplos medidos:

| Par                           | Contraste |
| ----------------------------- | --------- |
| Branco / primário             | 6,31:1    |
| Branco / hover                | 8,23:1    |
| Branco / active               | 9,45:1    |
| Texto / superfície            | 8,61:1    |
| Texto secundário / superfície | 7,76:1    |
| Erro / superfície             | 6,47:1    |
| Borda do input / superfície   | 4,76:1    |
| Foco / fundo                  | 6,81:1    |

A escolha inicial de `#726a85` para texto secundário falhou em combinações de fundo. Foi substituída por `#5c3a8b`, já presente no projeto. A borda sutil do card é decorativa e não é limite de um controle interativo. Controles disabled usam opacidade e estão fora da exigência de contraste de conteúdo ativo; não usar esse estado para apresentar instruções essenciais. Outline/text sobre fundos externos arbitrários e overrides do consumidor exigem nova medição. Não houve avaliação por leitor de tela nem navegação real por teclado nesta execução: os testes Node verificam contrato e eventos, não substituem navegador.

### Resultados de validação atuais

| Comando/verificação                                           | Resultado                                                                                            |
| ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `npm ci --cache node_modules/.cache/npm --no-audit --no-fund` | Sucesso após repetição fora do sandbox; 458 pacotes                                                  |
| `npm test`                                                    | 7 entradas de arquivos aprovadas pelo runner, zero falhas após instalação                            |
| `node tests/design-system.test.mjs`                           | 8 casos aprovados, zero falhas; inclui 12 combinações variante/tamanho e build Vite isolado          |
| `node --test tests/design-system.test.mjs`                    | Arquivo aprovado pelo runner; usar execução direta acima para relatório de cada caso                 |
| `npm run build`                                               | Aprovado, incluindo geração PWA; aviso de base caniuse-lite antiga, sem atualizar dependências       |
| Prettier                                                      | Executado somente nos arquivos desta FEAT; não executar `npm run format` para reescrever todo `src/` |
| Lint                                                          | Não existe script/configuração de lint no package.json; não instalado                                |
| `git diff --check`                                            | Sem erros; novos arquivos também conferidos individualmente                                          |
| Chrome/CDP                                                    | Duas tentativas falharam com `Chrome/CDP indisponível`                                               |

Os testes novos são executados separadamente para preservar o package.json autorizado. Não alegar que `npm test` os inclui. Compilação client SFC via compiler distribuído com Vue permite testar eventos e slots sem dependência de DOM nova. O teste de build isolado compila também o CSS real, porque a aplicação ainda não importa estes componentes.

O harness de navegador usa um servidor Vite próprio, sem configurar PWA nem rotas da aplicação, e aceita `CHROME_BIN`. Sua primeira tentativa encontrou scan de imports da aplicação sem aliases; o harness foi corrigido para não descobrir entradas externas. Na repetição, permaneceu somente a indisponibilidade de CDP. Nenhuma screenshot foi produzida e nenhum componente foi declarado visualmente validado. As verificações programadas de 375/768/1280px, hover, foco, teclado, disabled/loading, erro, v-model, movimento reduzido, isolamento e overflow **ainda precisam ser executadas em ambiente com Chrome/CDP acessível**:

```bash
node tests/design-system.browser.mjs
# Alternativa: CHROME_BIN=/caminho/do/chrome node tests/design-system.browser.mjs
```

Screenshots, builds auxiliares, perfis do Chrome e módulos compilados são gravados somente em `node_modules/.cache/feat48-*`, ignorados pelo Git. O build normal usa `dist`, também ignorado. Nenhum screenshot ou artefato gerado é parte da entrega.

### Compatibilidade, integração e riscos restantes

Não foram alterados `base.css`, `main.css`, `main.js`, App, router, headers/footers ou páginas de qualquer funcionalidade. Nenhum import da aplicação ativa os componentes nesta etapa. Não há mudança visual esperada nas páginas existentes por ausência de integração; regressão visual completa das páginas não foi executada. Nenhum acesso ao backend, banco ou outro repositório.

FEAT-45 poderá adotar campo/botão/card no diretório; FEAT-46 poderá usar card e tokens em perfis públicos; FEAT-47 precisa ter escopo confirmado antes de adoção. Essas integrações não fazem parte desta implementação.

FEAT-49 deverá acordar importação central, escopo/cascata dos tokens, modo escuro, propriedade de arquivos centrais e plano de migração página a página. Não basta importar tokens para mudar páginas antigas: elas continuam com estilos próprios. Não mover as declarações para `:root` nem trocar nomes globais sem revisão. A adoção deve comparar screenshots e testar contraste nas superfícies reais antes de liberar cada página.

Riscos críticos/altos introduzidos: nenhum identificado. Riscos médios confirmados: referência Figma ausente e validação visual/teclado em navegador pendente. Riscos potenciais baixos: diferenças futuras entre contrato provisório e Figma; colisões/cascata na futura integração, mitigadas pelo prefixo e escopo opt-in. Pendências: aprovação da equipe para padrões finais, navegador/leitor de tela, comparação responsiva e futura coordenação FEAT-49.

Estado Git final desta execução: branch FEAT-48, HEAD preservado, sete arquivos não rastreados listados na tabela da entrega (documento anterior atualizado e seis arquivos novos), sem staging. `git diff --stat` não lista novos não rastreados; usar `git status --short --untracked-files=all` para inventário. Código novo e documento revisados; nenhum arquivo rastreado modificado, segredo ou artefato incluído. Nenhum commit, push, merge, rebase ou deploy. Aguardar autorização do usuário para commit.

## Demonstração manual persistente

Adicionada após a entrega dos componentes para permitir revisão interativa pelo usuário, sem depender do Chrome headless/CDP.

Na raiz de Front_marujob, com as dependências instaladas:

```bash
node tests/design-system.browser.mjs --serve
```

O comando reutiliza o harness existente como entrada; com `--serve` ele inicia apenas a demonstração e permanece aberto até `Ctrl+C`. Não procura Chrome, não cria perfil e não executa a suíte CDP. A URL real impressa e conferida por HTTP nesta execução foi **http://127.0.0.1:5199/**. A porta é fixa e estrita: se já houver uma instância aberta, use a URL dessa instância ou encerre-a antes de executar outra. O servidor não é encerrado automaticamente após testes ou ao entregar o relatório.

Arquivos desta extensão:

- `tests/design-system.browser.mjs`: adicionado modo `--serve`, preservando o modo automatizado anterior.
- `tests/design-system.demo.mjs`: servidor Vite próprio, sem carregar a configuração da aplicação ou o router; página HTML e entrada de desenvolvimento separadas.
- `tests/fixtures/DesignSystemDemo.vue`: página SFC real, importando diretamente os três componentes de `src/components/ui/` e `src/styles/tokens.css`.
- Este documento: instruções e resultados atualizados.

Não foram alterados componentes base, tokens, package.json, lockfile, páginas, App, router, estilos globais da aplicação ou backend. O CSS da demonstração só é carregado por seu servidor independente e não entra no build principal.

O que testar no Chrome:

1. Botões: as 12 combinações de quatro variantes e três tamanhos incrementam o contador. Conferir hover, active segurando o mouse, Tab/Shift+Tab, Enter e Espaço.
2. Estados: usar “Contar clique”, “Zerar contador”, alternar “Desabilitar o botão de teste” e tentar clicar no botão bloqueado. “Testar loading · 2s” bloqueia o botão e mostra o carregamento temporário. Há também loading permanente para inspeção.
3. Campos: digitar nome/e-mail e conferir os valores `v-model` exibidos. Alternar erro de exemplo, testar campo disabled e readonly, tentar enviar o nome vazio para observar required nativo. Tudo é local, sem transmissão de dados.
4. Cards: comparar com/sem sombra e slots de título, conteúdo e rodapé.
5. Tokens: visualizar todas as cores, tamanhos e pesos tipográficos, barras de espaçamento, raios, bordas e inventário dos demais tokens. Os nomes vêm do arquivo CSS real e os valores são lidos via `getComputedStyle`, incluindo aliases. Para movimento reduzido, usar DevTools > Rendering > Emulate CSS media feature prefers-reduced-motion; o inventário atualiza `motion-duration` para `0ms`.
6. Larguras: “Mobile · 375px”, “Tablet · 768px” e “Desktop / adaptável” limitam a largura do conteúdo. Para validar breakpoints reais, usar **F12 > Ctrl+Shift+M** no Chrome, selecionar Responsive com 375px, 768px e 1280px e depois retornar ao desktop. A limitação de largura por botão não altera a viewport do navegador.

Validação desta extensão: `npm test` aprovado (7 entradas do runner); `node tests/design-system.test.mjs` aprovado (8 casos); `npm run build` aprovado com geração PWA e apenas aviso de caniuse-lite antigo; template da demonstração compilado via compiler Vue; página, entrada JS, demo SFC, três componentes e tokens servidos com HTTP 200. Um erro inicial na expressão inline de zerar contador foi corrigido usando função própria; compilação e HTTP reconferidos após a correção. Prettier e verificações de whitespace executados nos arquivos alterados. Sem lint configurado.

A abertura/conexão local foi bloqueada por EPERM dentro do sandbox; o servidor e a conferência HTTP foram executados fora dele após solicitação de permissão. A verificação HTTP comprova disponibilidade/transformação de módulos, não renderização no Chrome. A revisão visual manual permanece a cargo do usuário; não foram produzidas screenshots nem declarada validação visual automática.

Estado após esta extensão: FEAT-48, HEAD preservado, nove arquivos não rastreados no conjunto da funcionalidade, nenhum staging/commit/push/merge/deploy. O documento e a entrada do harness anteriores foram preservados e ampliados.

## Revisão para commit local autorizado

O usuário autorizou expressamente o commit local com a mensagem `feat(FEAT-48): implementa design system incremental`, limitado aos nove arquivos da funcionalidade. Os estados de Git sem staging/commit registrados acima são fotografias das entregas anteriores, preservadas como histórico. Não houve autorização de push, PR, merge, rebase ou deploy.

Na revisão final foram repetidos `npm test` (7 entradas aprovadas), `node tests/design-system.test.mjs` (8 casos aprovados, incluindo build isolado), `npm run build` (aprovado com geração PWA), Prettier nos nove arquivos e verificações de whitespace. Aplicação principal, CSS global e dependências preservados.

O harness automatizado recebeu alias exato de `vue` para `vue/dist/vue.esm-bundler.js`, pois seu runner usa template em string e precisa do compilador em runtime. Isso fica restrito ao servidor de testes na porta 5198; a demonstração manual usa SFC compilado pelo Vite e não precisa desse alias. Não declarar a suíte CDP aprovada: a validação visual continua parcial, com disponibilidade HTTP/compilação confirmada anteriormente e renderização, teclado e comparação visual completa ainda pendentes. Integração global segue reservada à FEAT-49; o contrato visual permanece provisório.
