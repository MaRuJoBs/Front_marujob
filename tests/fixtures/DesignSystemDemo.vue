<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
import BaseButton from '../../src/components/ui/BaseButton.vue'
import BaseInput from '../../src/components/ui/BaseInput.vue'
import BaseCard from '../../src/components/ui/BaseCard.vue'
import tokensSource from '../../src/styles/tokens.css?raw'
import '../../src/styles/tokens.css'

const root = ref(null)
const viewport = ref('fluid')
const clicks = ref(0)
const disabled = ref(true)
const loading = ref(false)
const nome = ref('')
const email = ref('')
const errorEnabled = ref(true)
const submitted = ref(false)
const status = ref('Pronto para testar.')
const resolved = ref({})
const variants = ['primary', 'secondary', 'outline', 'text']
const sizes = ['small', 'medium', 'large']
const tokenNames = [...new Set([...tokensSource.matchAll(/(--mrj-[\w-]+):/g)].map((m) => m[1]))]
const colorTokens = tokenNames.filter((name) => name.startsWith('--mrj-color-'))
const otherTokens = tokenNames.filter((name) => !name.startsWith('--mrj-color-'))
const previewStyle = computed(() => ({
  maxWidth: { mobile: '375px', tablet: '768px', fluid: 'none' }[viewport.value],
}))
let timer
let media
function readTokens() {
  const styles = getComputedStyle(root.value)
  resolved.value = Object.fromEntries(
    tokenNames.map((name) => [name, styles.getPropertyValue(name).trim()]),
  )
}
function click() {
  clicks.value++
  status.value = `Clique recebido: ${clicks.value}.`
}
function resetClicks() {
  clicks.value = 0
  status.value = 'Contador zerado.'
}
function load() {
  if (loading.value) return
  loading.value = true
  status.value = 'Carregando durante 2 segundos…'
  timer = setTimeout(() => {
    loading.value = false
    status.value = 'Carregamento concluído. O botão pode ser usado novamente.'
  }, 2000)
}
function submit() {
  submitted.value = true
  status.value = 'Formulário válido enviado localmente. Nenhum dado foi transmitido.'
}
onMounted(async () => {
  await nextTick()
  readTokens()
  media = matchMedia('(prefers-reduced-motion: reduce)')
  media.addEventListener('change', readTokens)
  document.body.dataset.feat48Ready = 'true'
})
onUnmounted(() => {
  clearTimeout(timer)
  media?.removeEventListener('change', readTokens)
})
</script>

<template>
  <main ref="root" class="mrj-ui demo">
    <header>
      <p class="eyebrow">MaRuJoBs · FEAT-48 · ambiente local</p>
      <h1>Design System Incremental</h1>
      <p>Componentes Vue reais, com a identidade roxa provisória. Nenhuma API é chamada.</p>
    </header>

    <nav class="toolbar" aria-label="Largura da demonstração">
      <BaseButton :aria-pressed="viewport === 'fluid'" @click="viewport = 'fluid'"
        >Desktop / adaptável</BaseButton
      >
      <BaseButton
        variant="outline"
        :aria-pressed="viewport === 'tablet'"
        @click="viewport = 'tablet'"
        >Tablet · 768px</BaseButton
      >
      <BaseButton
        variant="outline"
        :aria-pressed="viewport === 'mobile'"
        @click="viewport = 'mobile'"
        >Mobile · 375px</BaseButton
      >
    </nav>
    <p>Use também o modo de dispositivo do Chrome para testar a viewport real e os breakpoints.</p>

    <div class="preview" :style="previewStyle">
      <section aria-labelledby="buttons-title">
        <h2 id="buttons-title">Botões · todas as variantes e tamanhos</h2>
        <p>
          Passe o mouse, mantenha pressionado e navegue com Tab. Enter ou Espaço ativa o botão
          focado.
        </p>
        <BaseCard v-for="variant in variants" :key="variant">
          <template #header
            ><h3>{{ variant }}</h3></template
          >
          <div class="row">
            <BaseButton
              v-for="size in sizes"
              :key="size"
              :variant="variant"
              :size="size"
              @click="click"
              >{{ variant }} · {{ size }}</BaseButton
            >
          </div>
        </BaseCard>
        <BaseCard>
          <template #header><h3>Estados interativos</h3></template>
          <div class="row">
            <BaseButton @click="click">Contar clique: {{ clicks }}</BaseButton>
            <BaseButton variant="outline" @click="resetClicks">Zerar contador</BaseButton>
            <BaseButton :disabled="disabled" @click="click">Botão com disabled</BaseButton>
            <BaseButton :loading="loading" loading-label="Aguarde…" @click="load"
              >Testar loading · 2s</BaseButton
            >
            <BaseButton loading>Loading permanente</BaseButton>
          </div>
          <label class="toggle"
            ><input v-model="disabled" type="checkbox" /> Desabilitar o botão de teste</label
          >
          <p role="status">{{ status }}</p>
        </BaseCard>
      </section>

      <section aria-labelledby="inputs-title">
        <h2 id="inputs-title">Campos e v-model</h2>
        <BaseCard>
          <form @submit.prevent="submit">
            <BaseInput
              id="demo-name"
              v-model="nome"
              label="Nome profissional"
              name="nome"
              autocomplete="name"
              placeholder="Digite seu nome"
              help="Este campo é obrigatório. Tente enviar vazio."
              required
            />
            <BaseInput
              id="demo-email"
              v-model="email"
              label="E-mail"
              name="email"
              type="email"
              autocomplete="email"
              placeholder="voce@exemplo.com"
              :error="errorEnabled ? 'Exemplo de erro: confira o endereço informado.' : ''"
            />
            <label class="toggle"
              ><input v-model="errorEnabled" type="checkbox" /> Exibir mensagem de erro de
              exemplo</label
            >
            <BaseInput label="Campo desabilitado" model-value="Não editável" disabled />
            <BaseInput
              label="Somente leitura"
              model-value="Conteúdo disponível para seleção"
              readonly
            />
            <BaseButton type="submit">Testar required / envio local</BaseButton>
          </form>
          <output class="model"
            >v-model nome: {{ JSON.stringify(nome) }}<br />v-model e-mail:
            {{ JSON.stringify(email) }}</output
          >
          <p v-if="submitted">Envio local realizado. Nenhum dado saiu desta página.</p>
          <p>
            A mensagem de erro de exemplo é controlada pelo consumidor; BaseInput não valida regras
            de negócio.
          </p>
        </BaseCard>
      </section>

      <section aria-labelledby="cards-title">
        <h2 id="cards-title">Cards e slots</h2>
        <div class="cards-grid">
          <BaseCard
            ><template #header><h3>Sem sombra</h3></template>
            <p>Slot principal com texto que se adapta à largura disponível.</p>
            <template #footer
              ><BaseButton variant="text" @click="click">Ação no footer</BaseButton></template
            ></BaseCard
          >
          <BaseCard elevated
            ><template #header><h3>Com sombra</h3></template>
            <p>Mesmo componente com elevated. Observe borda, raio e espaçamento.</p>
            <template #footer><p>Slot footer</p></template></BaseCard
          >
        </div>
      </section>

      <section aria-labelledby="colors-title">
        <h2 id="colors-title">Todas as cores e aliases</h2>
        <div class="colors">
          <div v-for="token in colorTokens" :key="token" class="color-item">
            <div class="swatch" :style="{ background: `var(${token})` }" aria-hidden="true"></div>
            <code>{{ token }}</code
            ><span>{{ resolved[token] }}</span>
          </div>
        </div>
      </section>

      <section aria-labelledby="type-title">
        <h2 id="type-title">Tipografia</h2>
        <BaseCard>
          <p
            v-for="size in ['sm', 'md', 'lg']"
            :key="size"
            :style="{ fontSize: `var(--mrj-font-size-${size})` }"
          >
            {{ size }} · MaRuJoBs conecta talentos e oportunidades.
          </p>
          <p :style="{ fontWeight: 'var(--mrj-font-weight-regular)' }">Peso regular · 400</p>
          <p :style="{ fontWeight: 'var(--mrj-font-weight-semibold)' }">Peso semibold · 600</p>
          <p>
            Família: {{ resolved['--mrj-font-family'] }} · line-height:
            {{ resolved['--mrj-line-height'] }}
          </p>
        </BaseCard>
      </section>

      <section aria-labelledby="spacing-title">
        <h2 id="spacing-title">Espaçamentos, raios e bordas</h2>
        <BaseCard>
          <div v-for="step in [1, 2, 3, 4, 6, 8]" :key="step" class="space-row">
            <code>space-{{ step }}</code
            ><span class="space-bar" :style="{ width: `var(--mrj-space-${step})` }"></span
            ><span>{{ resolved[`--mrj-space-${step}`] }}</span>
          </div>
          <div class="row">
            <div
              v-for="radius in ['sm', 'md', 'lg', 'pill']"
              :key="radius"
              class="radius-sample"
              :style="{ borderRadius: `var(--mrj-radius-${radius})` }"
            >
              radius-{{ radius }}
            </div>
          </div>
          <p>
            A borda das amostras usa border-width e color-border; o card usa color-border-subtle.
          </p>
        </BaseCard>
      </section>

      <section aria-labelledby="tokens-title">
        <h2 id="tokens-title">Inventário completo dos demais tokens</h2>
        <p>
          Valores lidos do CSS real. Ative “prefers-reduced-motion: reduce” no painel Rendering do
          Chrome para conferir motion-duration = 0ms.
        </p>
        <dl class="token-list">
          <template v-for="token in otherTokens" :key="token"
            ><dt>
              <code>{{ token }}</code>
            </dt>
            <dd>{{ resolved[token] }}</dd></template
          >
        </dl>
      </section>
    </div>
  </main>
</template>

<style>
/* Somente este servidor independente carrega esta folha de demonstração. */
body {
  margin: 0;
}
.demo {
  box-sizing: border-box;
  min-height: 100vh;
  padding: var(--mrj-space-6);
  background: var(--mrj-color-background);
  color: var(--mrj-color-text);
  font-family: var(--mrj-font-family);
  font-size: var(--mrj-font-size-md);
  line-height: var(--mrj-line-height);
}
.demo *,
.demo *::before,
.demo *::after {
  box-sizing: border-box;
}
.demo h1,
.demo h2,
.demo h3,
.demo p {
  margin: 0;
}
.demo h1 {
  font-size: 2rem;
}
.demo h2 {
  font-size: 1.5rem;
}
.demo h3 {
  font-size: var(--mrj-font-size-lg);
}
.demo header,
.demo section,
.demo form,
.demo .preview {
  display: grid;
  gap: var(--mrj-space-4);
  min-width: 0;
}
.demo header,
.demo .toolbar {
  margin-bottom: var(--mrj-space-4);
}
.demo .preview {
  width: 100%;
  margin: var(--mrj-space-6) auto 0;
  gap: var(--mrj-space-8);
}
.demo .row,
.demo .toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--mrj-space-3);
}
.demo .eyebrow {
  font-size: var(--mrj-font-size-sm);
  font-weight: var(--mrj-font-weight-semibold);
}
.demo .cards-grid,
.demo .colors {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr));
  gap: var(--mrj-space-4);
}
.demo .color-item {
  display: grid;
  gap: var(--mrj-space-2);
  padding: var(--mrj-space-3);
  background: var(--mrj-color-surface);
  border-radius: var(--mrj-radius-sm);
  overflow-wrap: anywhere;
}
.demo .swatch {
  height: 72px;
  border: var(--mrj-border-width) solid var(--mrj-color-border);
  border-radius: var(--mrj-radius-sm);
}
.demo code,
.demo output {
  overflow-wrap: anywhere;
}
.demo .model {
  display: block;
  padding: var(--mrj-space-3);
  background: var(--mrj-color-secondary);
  border-radius: var(--mrj-radius-sm);
}
.demo .toggle {
  display: flex;
  align-items: center;
  gap: var(--mrj-space-2);
}
.demo .toggle input {
  accent-color: var(--mrj-color-primary);
  width: 20px;
  height: 20px;
}
.demo .space-row {
  display: flex;
  align-items: center;
  gap: var(--mrj-space-3);
}
.demo .space-bar {
  display: inline-block;
  height: 20px;
  background: var(--mrj-color-primary);
}
.demo .radius-sample {
  padding: var(--mrj-space-4);
  border: var(--mrj-border-width) solid var(--mrj-color-border);
  background: var(--mrj-color-secondary);
}
.demo .token-list {
  margin: 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: var(--mrj-space-2);
  padding: var(--mrj-space-4);
  background: var(--mrj-color-surface);
  border-radius: var(--mrj-radius-md);
}
.demo dd {
  margin: 0;
  overflow-wrap: anywhere;
}
.demo .toolbar [aria-pressed='true'] {
  outline: 2px solid var(--mrj-color-focus);
  outline-offset: 2px;
}
@media (max-width: 480px) {
  .demo {
    padding: var(--mrj-space-3);
  }
  .demo .token-list {
    grid-template-columns: minmax(0, 1fr);
  }
  .demo dd {
    margin-bottom: var(--mrj-space-3);
  }
}
</style>
