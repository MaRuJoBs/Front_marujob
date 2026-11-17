<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  faGear,
  faBuilding,
  faCircleInfo,
  faLocationDot,
  faPenToSquare,
} from '@fortawesome/free-solid-svg-icons'
const router = useRouter()
import EmpresaHeader from '../components/EmpresaHeader.vue'
import BaseButton from '../components/ui/BaseButton.vue'
import BaseCard from '../components/ui/BaseCard.vue'
import BaseInput from '../components/ui/BaseInput.vue'
import EmpresaLocalizacao from '../components/EmpresaLocalizacao.vue'
import { usePerfilEmpresa } from '../composables/usePerfilEmpresa.js'
import { urlPublica } from '../services/empresaPerfilService.js'
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
  localizacao,
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
    <main :aria-busy="carregando">
      <div class="titulo-perfil">
        <div>
          <p class="pagina-rotulo">SEU ESPAÇO NO MARUJOB</p>
          <h1>{{ editando ? 'Editar perfil da empresa' : 'Perfil da empresa' }}</h1>
        </div>
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
      <div v-if="perfil && !carregando" class="conteudo-perfil">
        <section v-if="!editando" class="cabecalho-institucional" aria-labelledby="nome-empresa">
          <div class="identidade-empresa">
            <img v-if="logo" class="logo" :src="logo" alt="Logotipo da empresa" />
            <div v-else class="sem-logo" role="img" aria-label="Empresa sem logotipo">
              <FontAwesomeIcon :icon="faBuilding" aria-hidden="true" />
            </div>
            <div class="resumo-empresa">
              <p class="rotulo">Perfil empresarial</p>
              <h2 id="nome-empresa">{{ perfil.name }}</h2>
              <p v-if="perfil.area_atuacao" class="setor">{{ perfil.area_atuacao }}</p>
              <p v-if="perfil.cidade || perfil.uf" class="localizacao">
                <FontAwesomeIcon :icon="faLocationDot" aria-hidden="true" />
                {{ [perfil.cidade, perfil.uf].filter(Boolean).join(' — ') }}
              </p>
            </div>
          </div>
          <BaseButton class="editar-perfil" variant="outline" @click="editar"
            ><FontAwesomeIcon :icon="faPenToSquare" aria-hidden="true" />Editar
            informações</BaseButton
          >
        </section>
        <BaseCard v-if="editando" class="card-edicao" elevated>
          <form novalidate @submit.prevent="salvar">
            <fieldset :disabled="salvando">
              <legend>Apresente sua empresa</legend>
              <div class="logo-editor">
                <div class="previa-logo">
                  <img v-if="logo" class="logo" :src="logo" alt="Prévia do logotipo da empresa" />
                  <div v-else class="sem-logo" role="img" aria-label="Empresa sem logotipo">
                    <FontAwesomeIcon :icon="faBuilding" aria-hidden="true" />
                  </div>
                </div>
                <div class="logo-controles">
                  <label for="logo-empresa">Logotipo</label>
                  <div class="upload-logo">
                    <input
                      id="logo-empresa"
                      type="file"
                      aria-label="Selecionar imagem do logotipo"
                      accept="image/*"
                      :aria-invalid="!!erros.profile_image"
                      aria-describedby="nome-logo erro-logo"
                      @change="selecionarImagem"
                    />
                    <span class="upload-botao" aria-hidden="true">Selecionar imagem</span>
                  </div>
                  <p id="nome-logo" class="nome-arquivo" role="status">
                    {{ imagem?.name || 'Nenhuma nova imagem selecionada' }}
                  </p>
                  <p id="erro-logo" class="erro" role="alert" v-if="erros.profile_image">
                    {{ erros.profile_image }}
                  </p>
                  <BaseButton v-if="logo" variant="outline" @click="removerImagem"
                    >Remover imagem</BaseButton
                  >
                </div>
              </div>
              <div class="campos-empresa">
                <BaseInput
                  v-for="[campo, label] in campos"
                  :key="campo"
                  v-model="form[campo]"
                  :label="label"
                  :type="campo === 'website' ? 'url' : 'text'"
                  :required="campo === 'name'"
                  :error="erros[campo]"
                />
              </div>
              <EmpresaLocalizacao :estado="localizacao" :salva="perfil" :erros="erros" />
              <div class="campo-descricao">
                <label for="descricao-empresa">Descrição institucional</label>
                <textarea
                  id="descricao-empresa"
                  v-model="form.descricao_institucional"
                  rows="6"
                  :aria-invalid="!!erros.descricao_institucional"
                  aria-describedby="erro-descricao"
                />
                <p
                  id="erro-descricao"
                  v-if="erros.descricao_institucional"
                  role="alert"
                  class="erro"
                >
                  {{ erros.descricao_institucional }}
                </p>
              </div>
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
        </BaseCard>
        <div v-else class="secoes-perfil">
          <BaseCard elevated class="apresentacao">
            <h2><FontAwesomeIcon :icon="faBuilding" aria-hidden="true" /> Sobre a empresa</h2>
            <p v-if="vazio">Complete o perfil institucional para apresentar sua empresa.</p>
            <p v-if="perfil.descricao_institucional" class="descricao">
              {{ perfil.descricao_institucional }}
            </p>
            <p v-else-if="!vazio" class="texto-secundario">
              A empresa ainda não adicionou uma apresentação.
            </p>
          </BaseCard>
          <BaseCard elevated class="informacoes">
            <h2>
              <FontAwesomeIcon :icon="faCircleInfo" aria-hidden="true" /> Informações empresariais
            </h2>
            <p
              v-if="
                !perfil.area_atuacao &&
                !perfil.cidade &&
                !perfil.uf &&
                !perfil.website &&
                !perfil.contato_comercial
              "
              class="texto-secundario"
            >
              Nenhuma informação institucional adicionada.
            </p>
            <dl>
              <template v-if="perfil.area_atuacao"
                ><dt>Área de atuação</dt>
                <dd>{{ perfil.area_atuacao }}</dd></template
              >
              <template v-if="perfil.cidade || perfil.uf"
                ><dt>Localização</dt>
                <dd>{{ [perfil.cidade, perfil.uf].filter(Boolean).join(' — ') }}</dd></template
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
          </BaseCard>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.perfil-empresa {
  min-height: 100dvh;
  background: #f5f2f9;
  color: var(--mrj-color-text);
  font-family: var(--mrj-font-family);
  line-height: var(--mrj-line-height);
}
main {
  padding: 16px 16px calc(100px + env(safe-area-inset-bottom, 0px));
  overflow-wrap: anywhere;
}
.titulo-perfil {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}
.titulo-perfil h1 {
  min-width: 0;
  font-size: 20px;
  font-weight: 700;
  line-height: 1.3;
  margin: 4px 0 0;
}
.pagina-rotulo {
  font-size: 10px;
  letter-spacing: 1.2px;
  font-weight: 700;
  color: var(--mrj-color-text-secondary);
}
.titulo-perfil > button {
  flex-shrink: 0;
  width: 44px;
  padding: 8px;
  border-color: var(--mrj-color-border-subtle);
  background: var(--mrj-color-surface);
}
h2,
p {
  margin: 0;
}
.conteudo-perfil,
.secoes-perfil {
  display: grid;
  gap: 16px;
  min-width: 0;
}
.cabecalho-institucional {
  position: relative;
  display: grid;
  gap: 20px;
  padding: 28px 20px 20px;
  border: 1px solid #e2d9ed;
  border-radius: 22px;
  background: radial-gradient(ellipse at top right, #e9dff6, transparent 70%), #fff;
  box-shadow: 0 6px 20px #53358108;
  overflow: hidden;
}
.cabecalho-institucional::before {
  content: '';
  position: absolute;
  inset: 0 0 auto;
  height: 5px;
  background: linear-gradient(90deg, #6e4ab7, #bd9ae1);
}
.identidade-empresa {
  display: grid;
  grid-template-columns: 76px minmax(0, 1fr);
  align-items: center;
  gap: 12px;
  min-width: 0;
}
.logo,
.sem-logo {
  box-sizing: border-box;
  width: 76px;
  height: 76px;
  object-fit: contain;
  border-radius: 20px;
  border: 1px solid var(--mrj-color-border-subtle);
  background: #fff;
}
.sem-logo {
  display: grid;
  place-items: center;
  font-size: 30px;
  color: var(--mrj-color-primary);
}
.resumo-empresa {
  min-width: 0;
}
.resumo-empresa h2 {
  font-size: 20px;
  font-weight: 700;
  line-height: 1.3;
  margin: 3px 0 6px;
}
.resumo-empresa p {
  font-size: var(--mrj-font-size-sm);
}
.rotulo {
  color: var(--mrj-color-text-secondary);
  font-size: 11px;
  font-weight: 600;
}
.resumo-empresa .setor {
  display: inline-block;
  padding: 3px 9px;
  border-radius: 20px;
  background: #eee7f7;
  font-size: 12px;
}
.localizacao {
  margin-top: 8px;
  display: flex;
  align-items: baseline;
  gap: 6px;
}
.localizacao svg {
  flex-shrink: 0;
}
.editar-perfil {
  width: 100%;
  min-height: 44px;
  font-size: var(--mrj-font-size-sm);
  background: #fff;
  border-color: #d4c4e8;
  border-radius: 12px;
}
.secoes-perfil > *,
.card-edicao {
  padding: 20px;
  gap: 12px;
  align-content: start;
  border-radius: 20px;
  box-shadow: none;
  background: #fff;
  border-color: #e2d9ed;
}
.secoes-perfil h2 {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 700;
  line-height: 1.4;
}
.secoes-perfil h2 svg {
  flex-shrink: 0;
  color: var(--mrj-color-primary);
  width: 18px;
  padding: 9px;
  border-radius: 11px;
  background: #f0e9f8;
}
.secoes-perfil p,
dl {
  font-size: var(--mrj-font-size-sm);
}
.descricao {
  white-space: pre-wrap;
}
.texto-secundario {
  color: var(--mrj-color-text-secondary);
}
dl {
  margin: 0;
}
dt {
  font-weight: 400;
  font-size: 12px;
  color: var(--mrj-color-text-secondary);
}
dd {
  margin: 2px 0 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--mrj-color-border-subtle);
  font-weight: 600;
}
dd:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: 0;
}
a {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  max-width: 100%;
  text-underline-offset: 3px;
  color: var(--mrj-color-primary);
}
form,
fieldset,
.campos-empresa {
  display: grid;
  gap: 14px;
  min-width: 0;
}
fieldset {
  border: 0;
  padding: 0;
  margin: 0;
}
legend {
  margin-bottom: 12px;
  font-size: 16px;
  font-weight: 700;
}
label {
  font-size: var(--mrj-font-size-sm);
  font-weight: 600;
}
.campo-descricao,
.campo-uf {
  display: grid;
  gap: 6px;
  min-width: 0;
}
input,
textarea,
select {
  box-sizing: border-box;
  max-width: 100%;
  min-width: 0;
  width: 100%;
  font: inherit;
  font-size: 16px;
}
textarea,
select {
  min-height: 44px;
  padding: 10px 12px;
  border: 1px solid var(--mrj-color-border);
  border-radius: var(--mrj-radius-sm);
  color: inherit;
  background: var(--mrj-color-surface);
}
textarea {
  resize: vertical;
  min-height: 120px;
}
.card-edicao :deep(.mrj-field) {
  gap: 6px;
  font-size: var(--mrj-font-size-sm);
}
.card-edicao :deep(.mrj-field__input) {
  font-size: 16px;
}
:is(textarea, select, input, a):focus-visible {
  outline: 3px solid var(--mrj-color-focus);
  outline-offset: 3px;
}
:is(textarea, select)[aria-invalid='true'] {
  border-color: var(--mrj-color-danger);
}
.acoes {
  display: grid;
  gap: 8px;
  grid-template-columns: minmax(0, 1fr);
  border-top: 1px solid var(--mrj-color-border-subtle);
  padding-top: 14px;
}
.acoes > * {
  width: 100%;
  font-size: var(--mrj-font-size-sm);
}
.erro {
  color: var(--mrj-color-danger);
}
.sucesso {
  color: var(--mrj-color-success);
}
main > [role='status'],
main > .erro {
  margin-bottom: 16px;
  padding: 12px;
  border: 1px solid var(--mrj-color-border-subtle);
  border-radius: var(--mrj-radius-md);
  background: var(--mrj-color-surface);
}
.logo-editor {
  display: grid;
  grid-template-columns: 60px minmax(0, 1fr);
  align-items: start;
  gap: 12px;
  padding: 14px;
  background: #f8f5fc;
  border: 1px solid var(--mrj-color-border-subtle);
  border-radius: 16px;
}
.logo-editor .logo,
.logo-editor .sem-logo {
  width: 60px;
  height: 60px;
}
.logo-controles {
  display: grid;
  gap: 8px;
  min-width: 0;
}
.logo-controles > button {
  font-size: var(--mrj-font-size-sm);
  padding-inline: 8px;
}
.upload-logo {
  position: relative;
  min-width: 0;
}
.upload-logo input {
  position: absolute;
  inset: 0;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}
.upload-botao {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: 8px 12px;
  border: 1px solid var(--mrj-color-border);
  border-radius: var(--mrj-radius-sm);
  background: var(--mrj-color-secondary);
  font-size: var(--mrj-font-size-sm);
}
.upload-logo:focus-within {
  outline: 3px solid var(--mrj-color-focus);
  outline-offset: 3px;
}
.upload-logo:has(input:disabled) {
  opacity: var(--mrj-disabled-opacity);
}
.nome-arquivo {
  overflow-wrap: anywhere;
  font-size: var(--mrj-font-size-sm);
}
@media (max-width: 359px) {
  main {
    padding-inline: 12px;
  }
  .identidade-empresa {
    grid-template-columns: 60px minmax(0, 1fr);
  }
  .logo,
  .sem-logo {
    width: 60px;
    height: 60px;
  }
  .editar-perfil {
    margin-left: 0;
    max-width: 100%;
    width: 100%;
  }
  .resumo-empresa h2 {
    font-size: 18px;
  }
}
</style>
