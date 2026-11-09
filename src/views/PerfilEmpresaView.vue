<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { faGear } from '@fortawesome/free-solid-svg-icons'
const router = useRouter()
import EmpresaHeader from '../components/EmpresaHeader.vue'
import BaseButton from '../components/ui/BaseButton.vue'
import BaseCard from '../components/ui/BaseCard.vue'
import BaseInput from '../components/ui/BaseInput.vue'
import { usePerfilEmpresa } from '../composables/usePerfilEmpresa.js'
import { ufs, urlPublica } from '../services/empresaPerfilService.js'
const {
  perfil,
  form,
  imagem,
  previa,
  carregando,
  salvando,
  editando,
  erro,
  sucesso,
  erros,
  cancelar,
  selecionarImagem,
  removerImagem,
  carregar,
  salvar,
} = usePerfilEmpresa()
const logo = computed(() =>
  editando.value
    ? previa.value || (imagem.value === null ? '' : urlPublica(perfil.value?.profile_image))
    : urlPublica(perfil.value?.profile_image),
)
const vazio = computed(
  () =>
    perfil.value &&
    ![
      'descricao_institucional',
      'area_atuacao',
      'cidade',
      'uf',
      'website',
      'contato_comercial',
      'profile_image',
    ].some((c) => perfil.value[c]),
)
const campos = [
  ['name', 'Nome comercial'],
  ['area_atuacao', 'Área de atuação'],
  ['cidade', 'Cidade'],
  ['website', 'Website'],
  ['contato_comercial', 'Contato comercial'],
]
onMounted(carregar)
function editar() {
  cancelar()
  sucesso.value = ''
  editando.value = true
}
</script>

<template>
  <div class="perfil-empresa mrj-ui">
    <EmpresaHeader voltar />
    <main>
      <div class="titulo-perfil">
        <h1>Perfil institucional</h1>
        <BaseButton
          variant="outline"
          aria-label="Configurações da empresa"
          @click="router.push('/empresa/configuracoes')"
        >
          <FontAwesomeIcon :icon="faGear" aria-hidden="true" />
        </BaseButton>
      </div>
      <p v-if="carregando" role="status">Carregando perfil…</p>
      <p v-if="sucesso" role="status" class="sucesso">{{ sucesso }}</p>
      <div v-if="erro" role="alert" class="erro">
        <p>{{ erro }}</p>
        <BaseButton v-if="!editando" variant="outline" @click="carregar"
          >Tentar novamente</BaseButton
        >
      </div>
      <BaseCard v-if="perfil && !carregando" elevated>
        <img v-if="logo" class="logo" :src="logo" alt="Logotipo da empresa" />
        <div v-else class="sem-logo">Sem logotipo</div>
        <form v-if="editando" novalidate @submit.prevent="salvar">
          <fieldset :disabled="salvando">
            <legend>Editar informações da empresa</legend>
            <label for="logo-empresa">Logotipo</label>
            <input
              id="logo-empresa"
              type="file"
              accept="image/*"
              :aria-invalid="!!erros.profile_image"
              aria-describedby="erro-logo"
              @change="selecionarImagem"
            />
            <p id="erro-logo" class="erro" role="alert" v-if="erros.profile_image">
              {{ erros.profile_image }}
            </p>
            <BaseButton v-if="logo" variant="outline" @click="removerImagem"
              >Remover imagem</BaseButton
            >
            <BaseInput
              v-for="[campo, label] in campos"
              :key="campo"
              v-model="form[campo]"
              :label="label"
              :type="campo === 'website' ? 'url' : 'text'"
              :required="campo === 'name'"
              :error="erros[campo]"
            />
            <label for="descricao-empresa">Descrição institucional</label>
            <textarea
              id="descricao-empresa"
              v-model="form.descricao_institucional"
              rows="6"
              :aria-invalid="!!erros.descricao_institucional"
              aria-describedby="erro-descricao"
            />
            <p id="erro-descricao" v-if="erros.descricao_institucional" role="alert" class="erro">
              {{ erros.descricao_institucional }}
            </p>
            <label for="uf-empresa">UF</label>
            <select
              id="uf-empresa"
              v-model="form.uf"
              :aria-invalid="!!erros.uf"
              aria-describedby="erro-uf"
            >
              <option value="">Não informada</option>
              <option v-for="uf in ufs" :key="uf" :value="uf">{{ uf }}</option>
            </select>
            <p id="erro-uf" v-if="erros.uf" role="alert" class="erro">{{ erros.uf }}</p>
          </fieldset>
          <div class="acoes">
            <BaseButton type="submit" :loading="salvando" loading-label="Salvando…"
              >Salvar alterações</BaseButton
            >
            <BaseButton variant="outline" :disabled="salvando" @click="cancelar"
              >Cancelar</BaseButton
            >
          </div>
        </form>
        <template v-else>
          <h2>{{ perfil.name }}</h2>
          <p v-if="vazio">Complete o perfil institucional para apresentar sua empresa.</p>
          <p v-if="perfil.descricao_institucional" class="descricao">
            {{ perfil.descricao_institucional }}
          </p>
          <dl>
            <template v-if="perfil.area_atuacao"
              ><dt>Área de atuação</dt>
              <dd>{{ perfil.area_atuacao }}</dd></template
            >
            <template v-if="perfil.cidade || perfil.uf"
              ><dt>Localização</dt>
              <dd>{{ [perfil.cidade, perfil.uf].filter(Boolean).join(' / ') }}</dd></template
            >
            <template v-if="perfil.website"
              ><dt>Website</dt>
              <dd>
                <a
                  v-if="urlPublica(perfil.website)"
                  :href="urlPublica(perfil.website)"
                  target="_blank"
                  rel="noopener noreferrer"
                  >{{ perfil.website }}</a
                ><span v-else>{{ perfil.website }}</span>
              </dd></template
            >
            <template v-if="perfil.contato_comercial"
              ><dt>Contato comercial</dt>
              <dd>{{ perfil.contato_comercial }}</dd></template
            >
          </dl>
          <BaseButton @click="editar">Editar informações</BaseButton>
        </template>
      </BaseCard>
    </main>
  </div>
</template>

<style scoped>
.perfil-empresa {
  min-height: 100vh;
  background: var(--mrj-color-background);
  color: var(--mrj-color-text);
  font-family: var(--mrj-font-family);
}
main {
  max-width: 760px;
  margin: auto;
  padding: 20px 16px 100px;
  overflow-wrap: anywhere;
}
h1 {
  font-size: 1.6rem;
}
.titulo-perfil {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
h2,
p {
  margin-block: 0 12px;
}
.logo,
.sem-logo {
  width: 112px;
  height: 112px;
  border-radius: var(--mrj-radius-md);
  object-fit: contain;
  background: var(--mrj-color-secondary);
}
.sem-logo {
  display: grid;
  place-items: center;
  text-align: center;
}
form,
fieldset {
  display: grid;
  gap: 16px;
  min-width: 0;
}
fieldset {
  border: 0;
  padding: 0;
  margin: 0;
}
legend {
  margin-bottom: 16px;
  font-weight: bold;
}
input,
textarea,
select {
  box-sizing: border-box;
  max-width: 100%;
  min-width: 0;
  width: 100%;
  font: inherit;
}
textarea,
select {
  padding: 12px;
  border: 1px solid var(--mrj-color-border);
  border-radius: var(--mrj-radius-sm);
  color: inherit;
  background: var(--mrj-color-surface);
}
textarea {
  resize: vertical;
}
:is(textarea, select, input):focus-visible {
  outline: 3px solid var(--mrj-color-focus);
  outline-offset: 3px;
}
.acoes {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
.erro {
  color: var(--mrj-color-danger);
}
.sucesso {
  color: var(--mrj-color-success);
}
dl {
  margin: 0;
}
dt {
  font-weight: bold;
}
dd {
  margin: 0 0 16px;
}
.descricao {
  white-space: pre-wrap;
}
a {
  color: inherit;
}
@media (min-width: 768px) {
  main {
    padding: 32px 24px 100px;
  }
}
</style>
