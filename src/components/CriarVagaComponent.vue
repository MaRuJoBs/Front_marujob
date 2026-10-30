<script setup>
import { computed, nextTick, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useRoute } from 'vue-router'
import { useEditarVaga } from '@/composables/useEditarVaga'
import EmpresaHeader from '@/components/EmpresaHeader.vue'
import { useCriarVaga } from '@/composables/useCriarVaga'
import {
  categoriasVaga,
  modalidadesVaga,
  limiteDescricaoVaga,
  limitesVaga,
  validarVaga,
  normalizarPagamento,
  formatarPagamento,
  camposComplementaresVaga,
} from '@/utils/vagaForm'

const router = useRouter()
const editando = useRoute().name === 'editar-vaga'
const fluxo = editando ? useEditarVaga() : useCriarVaga()
const { form, erros, erroGeral, publicando, publicada, publicar } = fluxo
const carregando = fluxo.carregando || ref(false)
const autorizada = fluxo.autorizada || ref(true)
const validar = fluxo.validar || validarVaga
const formulario = ref(null)
const feedback = ref(null)
const preenchidos = computed(
  () =>
    ['titulo', 'categoria', 'modalidade', 'descricao', 'preco', 'tempo'].filter(
      (campo) => String(form[campo]).trim() && !validar(form)[campo],
    ).length,
)
const limiteDescricao = computed(() => limiteDescricaoVaga(form.modalidade))
const pagamentoPreview = computed(() => normalizarPagamento(form.preco))
const caracteresDescricao = computed(() => [...form.descricao].length)
const complementosPreenchidos = computed(() =>
  camposComplementaresVaga.filter(({ nome }) => String(form[nome] ?? '').trim()),
)

async function enviar() {
  await publicar()
  await nextTick()
  if (Object.keys(erros.value).length)
    formulario.value?.querySelector('[aria-invalid="true"]')?.focus()
  else if (erroGeral.value) feedback.value?.focus()
}

function validarCampo(campo) {
  const validacao = validar(form)
  if (validacao[campo]) erros.value[campo] = validacao[campo]
  else delete erros.value[campo]
}

function alterarModalidade() {
  validarCampo('modalidade')
  if (form.descricao.trim()) validarCampo('descricao')
}
</script>

<template>
  <div class="criar-vaga">
    <EmpresaHeader :voltar="!publicando" />

    <main class="conteudo">
      <section class="apresentacao">
        <h1>{{ editando ? 'Editar oportunidade' : 'Criar nova vaga' }}</h1>
        <p>
          {{ editando ? 'Atualize as informações da sua vaga' : 'Preencha as informações da vaga' }}
        </p>
      </section>

      <section v-if="publicada" class="sucesso" role="status">
        <span class="sucesso-icone" aria-hidden="true">✓</span>
        <h2>{{ editando ? 'Vaga editada com sucesso!' : 'Vaga publicada' }}</h2>
        <p>
          {{ erroGeral || 'Sua oportunidade foi criada. Você já pode voltar à área da empresa.' }}
        </p>
        <details v-if="erroGeral && complementosPreenchidos.length" class="dados-mantidos">
          <summary>Ver informações complementares preenchidas</summary>
          <dl>
            <div v-for="campo in complementosPreenchidos" :key="campo.nome">
              <dt>{{ campo.rotulo }}</dt>
              <dd>{{ form[campo.nome] }}</dd>
            </div>
          </dl>
        </details>
        <button class="btn-publicar" type="button" @click="router.replace('/homeEmpresa')">
          Ir para o início
        </button>
      </section>

      <p v-else-if="carregando" role="status">Carregando oportunidade...</p>
      <div v-else-if="!autorizada" role="alert" class="feedback-erro">{{ erroGeral }}</div>
      <div v-else class="layout-publicacao">
        <form
          ref="formulario"
          class="form-card"
          novalidate
          :aria-busy="publicando"
          @submit.prevent="enviar"
        >
          <div class="cabecalho-form">
            <div>
              <span class="etiqueta">SUA OPORTUNIDADE</span>
              <h2>Vamos aos detalhes</h2>
            </div>
            <span class="obrigatorios">* Campos obrigatórios</span>
          </div>

          <div
            v-if="erroGeral || Object.keys(erros).length"
            ref="feedback"
            class="feedback-erro"
            role="alert"
            tabindex="-1"
          >
            <strong>Revise sua publicação</strong>
            <p>{{ erroGeral || 'Confira os campos destacados antes de continuar.' }}</p>
          </div>

          <fieldset :disabled="publicando">
            <legend>Informações da oportunidade</legend>
            <div class="campo">
              <label for="vaga-titulo">Título da vaga <span aria-hidden="true">*</span></label>
              <input
                id="vaga-titulo"
                v-model="form.titulo"
                name="titulo"
                type="text"
                required
                :maxlength="limitesVaga.titulo"
                placeholder="Ex.: Desenvolvimento de uma landing page"
                :aria-invalid="Boolean(erros.titulo)"
                :aria-describedby="erros.titulo ? 'titulo-erro' : undefined"
                @blur="validarCampo('titulo')"
              />
              <p v-if="erros.titulo" id="titulo-erro" class="msg-erro">{{ erros.titulo }}</p>
            </div>

            <div class="campo">
              <label for="vaga-categoria">Categoria <span aria-hidden="true">*</span></label>
              <select
                id="vaga-categoria"
                v-model="form.categoria"
                name="categoria"
                required
                :class="{ placeholder: !form.categoria }"
                :aria-invalid="Boolean(erros.categoria)"
                :aria-describedby="erros.categoria ? 'categoria-erro' : undefined"
                @change="validarCampo('categoria')"
              >
                <option value="" disabled>Selecione uma categoria</option>
                <option
                  v-if="
                    editando &&
                    form.categoria &&
                    !categoriasVaga.some((c) => c.value === form.categoria)
                  "
                  :value="form.categoria"
                >
                  {{ form.categoria }} (categoria atual)
                </option>
                <option
                  v-for="categoria in categoriasVaga"
                  :key="categoria.value"
                  :value="categoria.value"
                >
                  {{ categoria.label }}
                </option>
              </select>
              <p v-if="erros.categoria" id="categoria-erro" class="msg-erro">
                {{ erros.categoria }}
              </p>
            </div>

            <div class="campo">
              <label for="vaga-modalidade">Modalidade <span aria-hidden="true">*</span></label>
              <select
                id="vaga-modalidade"
                v-model="form.modalidade"
                name="modalidade"
                required
                :class="{ placeholder: !form.modalidade }"
                :aria-invalid="Boolean(erros.modalidade)"
                :aria-describedby="
                  erros.modalidade ? 'modalidade-ajuda modalidade-erro' : 'modalidade-ajuda'
                "
                @change="alterarModalidade"
              >
                <option value="" disabled>Selecione a modalidade</option>
                <option v-for="modalidade in modalidadesVaga" :key="modalidade" :value="modalidade">
                  {{ modalidade }}
                </option>
              </select>
              <p id="modalidade-ajuda" class="ajuda">
                A modalidade aparecerá no início da descrição publicada.
              </p>
              <p v-if="erros.modalidade" id="modalidade-erro" class="msg-erro">
                {{ erros.modalidade }}
              </p>
            </div>

            <div class="campo">
              <label for="vaga-descricao"
                >Descrição da oportunidade <span aria-hidden="true">*</span></label
              >
              <textarea
                id="vaga-descricao"
                v-model="form.descricao"
                name="descricao"
                required
                :maxlength="editando ? undefined : limiteDescricao"
                rows="5"
                placeholder="Descreva o trabalho e o resultado esperado. Ex.: Criar uma página responsiva com apresentação dos serviços e formulário de contato."
                :aria-invalid="Boolean(erros.descricao)"
                :aria-describedby="
                  erros.descricao ? 'descricao-ajuda descricao-erro' : 'descricao-ajuda'
                "
                @blur="validarCampo('descricao')"
              ></textarea>
              <div id="descricao-ajuda" class="ajuda-linha">
                <span>Uma descrição objetiva ajuda a encontrar o profissional certo.</span
                ><span class="contador">{{ caracteresDescricao }}/{{ limiteDescricao }}</span>
              </div>
              <p v-if="erros.descricao" id="descricao-erro" class="msg-erro">
                {{ erros.descricao }}
              </p>
            </div>
          </fieldset>

          <fieldset :disabled="publicando" class="condicoes complementos-vaga">
            <legend>Informações complementares</legend>
            <p class="descricao-secao">
              Preencha os detalhes da oportunidade. Estes campos são opcionais.
            </p>
            <div v-for="campo in camposComplementaresVaga" :key="campo.nome" class="campo">
              <label :for="'vaga-' + campo.nome">{{ campo.rotulo }}</label>
              <textarea
                v-if="campo.tipo === 'textarea'"
                :id="'vaga-' + campo.nome"
                v-model="form[campo.nome]"
                :name="campo.nome"
                :maxlength="editando ? undefined : campo.limite"
                rows="4"
                :placeholder="campo.placeholder"
                :aria-invalid="Boolean(erros[campo.nome])"
                :aria-describedby="erros[campo.nome] ? campo.nome + '-erro' : undefined"
                @blur="validarCampo(campo.nome)"
              ></textarea>
              <select
                v-else-if="campo.tipo === 'select'"
                :id="'vaga-' + campo.nome"
                v-model="form[campo.nome]"
                :name="campo.nome"
                :aria-invalid="Boolean(erros[campo.nome])"
                :aria-describedby="erros[campo.nome] ? campo.nome + '-erro' : undefined"
                @change="validarCampo(campo.nome)"
              >
                <option value="">Não informar</option>
                <option
                  v-if="form[campo.nome] && !campo.opcoes.includes(form[campo.nome])"
                  :value="form[campo.nome]"
                >
                  {{ form[campo.nome] }} (valor atual)
                </option>
                <option v-for="opcao in campo.opcoes" :key="opcao" :value="opcao">
                  {{ opcao }}
                </option>
              </select>
              <input
                v-else
                :id="'vaga-' + campo.nome"
                v-model="form[campo.nome]"
                :name="campo.nome"
                :type="campo.tipo === 'date' ? 'date' : 'text'"
                :inputmode="campo.tipo === 'moeda' ? 'decimal' : undefined"
                :maxlength="editando ? undefined : campo.limite"
                :placeholder="campo.placeholder"
                :aria-invalid="Boolean(erros[campo.nome])"
                :aria-describedby="erros[campo.nome] ? campo.nome + '-erro' : undefined"
                @blur="validarCampo(campo.nome)"
              />
              <p v-if="campo.limite && campo.tipo === 'textarea'" class="ajuda contador">
                {{ [...form[campo.nome]].length }}/{{ campo.limite }}
              </p>
              <p v-if="erros[campo.nome]" :id="campo.nome + '-erro'" class="msg-erro">
                {{ erros[campo.nome] }}
              </p>
            </div>
          </fieldset>

          <fieldset :disabled="publicando" class="condicoes">
            <legend>Pagamento e duração</legend>
            <p class="descricao-secao">Defina o valor e o tempo estimado para esta oportunidade.</p>
            <div class="campos-duplos">
              <div class="campo">
                <label for="vaga-preco">Pagamento (R$) <span aria-hidden="true">*</span></label>
                <div class="input-moeda">
                  <span aria-hidden="true">R$</span
                  ><input
                    id="vaga-preco"
                    v-model="form.preco"
                    name="preco"
                    type="text"
                    inputmode="decimal"
                    required
                    maxlength="20"
                    placeholder="1500,00"
                    :aria-invalid="Boolean(erros.preco)"
                    :aria-describedby="erros.preco ? 'preco-ajuda preco-erro' : 'preco-ajuda'"
                    @blur="validarCampo('preco')"
                  />
                </div>
                <p id="preco-ajuda" class="ajuda">Informe um único valor em reais.</p>
                <p v-if="erros.preco" id="preco-erro" class="msg-erro">{{ erros.preco }}</p>
              </div>
              <div class="campo">
                <label for="vaga-tempo"
                  >Duração estimada (horas) <span aria-hidden="true">*</span></label
                >
                <input
                  id="vaga-tempo"
                  v-model="form.tempo"
                  name="tempo"
                  type="text"
                  inputmode="decimal"
                  required
                  :maxlength="limitesVaga.tempo"
                  placeholder="Ex.: 40"
                  :aria-invalid="Boolean(erros.tempo)"
                  :aria-describedby="erros.tempo ? 'tempo-ajuda tempo-erro' : 'tempo-ajuda'"
                  @blur="validarCampo('tempo')"
                />
                <p id="tempo-ajuda" class="ajuda">Você também pode informar frações, como 2,5.</p>
                <p v-if="erros.tempo" id="tempo-erro" class="msg-erro">{{ erros.tempo }}</p>
              </div>
            </div>
          </fieldset>

          <div class="acoes">
            <button
              class="btn-cancelar"
              type="button"
              :disabled="publicando"
              @click="router.push('/homeEmpresa')"
            >
              Voltar
            </button>
            <button class="btn-publicar" type="submit" :disabled="publicando">
              <span v-if="publicando" class="spinner" aria-hidden="true"></span
              >{{
                publicando
                  ? editando
                    ? 'Salvando...'
                    : 'Publicando...'
                  : editando
                    ? 'Salvar alterações'
                    : 'Publicar vaga'
              }}<span v-if="!publicando" aria-hidden="true">↗</span>
            </button>
          </div>
          <p v-if="publicando" class="status-publicacao" role="status">
            Enviando sua oportunidade. Aguarde a confirmação.
          </p>
        </form>

        <aside class="painel-lateral" aria-label="Prévia da oportunidade">
          <div class="preview-card">
            <div class="preview-topo">
              <span class="etiqueta">PRÉVIA DA VAGA</span><span class="rascunho-tag">Rascunho</span>
            </div>
            <div class="preview-icone" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path
                  d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M4 7h16v13H4zM4 12c5 3 11 3 16 0M10 13h4"
                />
              </svg>
            </div>
            <span class="preview-categoria">{{
              form.categoria || 'Categoria da oportunidade'
            }}</span>
            <h2>{{ form.titulo.trim() || 'O título da sua vaga aparece aqui' }}</h2>
            <p class="preview-descricao">
              {{
                form.descricao.trim() ||
                'Conte um pouco sobre seu projeto. A prévia acompanha o que você preencher.'
              }}
            </p>
            <div class="preview-condicoes">
              <div>
                <span>Pagamento</span
                ><strong>{{
                  pagamentoPreview !== null ? formatarPagamento(pagamentoPreview) : 'A definir'
                }}</strong>
              </div>
              <div>
                <span>Duração estimada</span
                ><strong>{{ form.tempo.trim() ? `${form.tempo} horas` : 'A definir' }}</strong>
              </div>
            </div>
            <div class="progresso">
              <div>
                <span>Informações preenchidas</span><strong>{{ preenchidos }} de 6</strong>
              </div>
              <progress
                :value="preenchidos"
                max="6"
                aria-label="Campos válidos preenchidos"
              ></progress>
            </div>
          </div>
          <div class="dica-card">
            <span class="dica-icone" aria-hidden="true">✧</span>
            <div>
              <h3>Uma boa oportunidade começa com clareza</h3>
              <p>
                Use um título específico, descreva o que será entregue e informe um pagamento
                compatível com o projeto.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </main>
  </div>
</template>

<style scoped>
.criar-vaga {
  isolation: isolate;
  min-height: 100dvh;
  background: #e1d2ed;
  color: #442575;
  font-family: inherit;
}
.conteudo {
  padding: 16px 16px calc(106px + env(safe-area-inset-bottom, 0px));
}
.apresentacao {
  margin-bottom: 18px;
  padding-inline: 4px;
}
h1 {
  font-size: 23px;
  line-height: 1.3;
  font-weight: 700;
  letter-spacing: -0.5px;
}
.apresentacao p {
  margin-top: 4px;
  color: #766084;
  font-size: 13px;
  line-height: 1.5;
}
.layout-publicacao {
  display: grid;
  gap: 16px;
}
.form-card {
  min-width: 0;
  padding: 20px 16px;
  border: 1px solid #e6d8f0;
  border-radius: 20px;
  background: #f3eaf9;
}
.cabecalho-form {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e0d0eb;
}
.etiqueta {
  font-size: 9px;
  font-weight: 650;
  letter-spacing: 1.4px;
  color: #87679f;
}
.cabecalho-form h2 {
  margin-top: 3px;
  font-size: 16px;
  font-weight: 650;
  color: #4d2c7a;
}
.obrigatorios {
  color: #735d84;
  font-size: 10px;
}
fieldset {
  min-width: 0;
  padding: 0;
  margin: 0;
  border: 0;
}
fieldset > legend {
  padding: 0 0 16px;
  color: #59388b;
  font-size: 13px;
  font-weight: 650;
}
.campo {
  min-width: 0;
  margin-bottom: 18px;
}
label {
  display: block;
  margin-bottom: 6px;
  font-size: 13px;
  line-height: 1.5;
  font-weight: 500;
  color: #513077;
}
label span {
  color: #7040a8;
}
button,
input,
textarea,
select {
  font: inherit;
}
button {
  cursor: pointer;
}
button:disabled {
  opacity: 0.65;
  cursor: wait;
}
input,
select,
textarea {
  width: 100%;
  min-width: 0;
  min-height: 48px;
  padding: 11px 14px;
  border: 1px solid transparent;
  border-radius: 14px;
  background: #fdfaff;
  color: #49315f;
  font-size: 16px;
  line-height: 1.5;
  scroll-margin-block: 90px;
}
select {
  padding-right: 24px;
}
textarea {
  min-height: 134px;
  resize: vertical;
}
input:focus,
select:focus,
textarea:focus {
  outline: 2px solid #9d77c5;
  outline-offset: 2px;
  background: white;
}
input[aria-invalid='true'],
select[aria-invalid='true'],
textarea[aria-invalid='true'] {
  border-color: #b72f4c;
}
::placeholder,
select.placeholder {
  color: #887493;
  opacity: 1;
}
.ajuda,
.ajuda-linha,
.descricao-secao,
.limite-publicacao {
  color: #796587;
  font-size: 12px;
  line-height: 1.6;
}
.ajuda {
  margin-top: 6px;
}
.ajuda-linha {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 4px 12px;
  margin-top: 6px;
}
.contador {
  margin-left: auto;
  white-space: nowrap;
  font-size: 11px;
}
.msg-erro {
  color: #a32443;
  margin-top: 6px;
  font-size: 12px;
  line-height: 1.6;
}
.condicoes {
  padding-top: 16px;
  border-top: 1px solid #e0d0eb;
}
.condicoes legend {
  padding-bottom: 6px;
}
.descricao-secao {
  margin-bottom: 14px;
}
.campos-duplos {
  display: grid;
  gap: 0;
}
.input-moeda {
  position: relative;
}
.input-moeda > span {
  position: absolute;
  left: 14px;
  top: 13px;
  font-size: 14px;
  color: #806b8f;
}
.input-moeda input {
  padding-left: 40px;
}
.acoes {
  position: fixed;
  z-index: 20;
  left: 50%;
  bottom: 0;
  transform: translateX(-50%);
  display: flex;
  gap: 10px;
  width: min(100%, 420px);
  padding: 12px 16px calc(12px + env(safe-area-inset-bottom, 0px));
  background: #efe5f7;
  border-top: 1px solid #d9c5ea;
  box-shadow: 0 -3px 12px #4925630a;
}
.btn-cancelar,
.btn-publicar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 48px;
  padding: 10px 16px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
}
.btn-cancelar {
  border: 1px solid #ac8cd0;
  background: #faf6fe;
  color: #6b429c;
}
.btn-publicar {
  flex: 1;
  border: 1px solid #7548bd;
  background: #7548bd;
  color: white;
}
.btn-publicar:hover:not(:disabled) {
  background: #6035a2;
}
button:focus-visible,
a:focus-visible {
  outline: 3px solid #6b3aa3;
  outline-offset: 3px;
}
.painel-lateral {
  min-width: 0;
}
.preview-card {
  display: none;
}
.dica-card {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 16px;
  border-radius: 14px;
  background: #ece0f5;
}
.dica-icone {
  color: #8452bc;
  font-size: 24px;
  line-height: 1.2;
}
.dica-card h3 {
  color: #583682;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.5;
}
.dica-card p {
  margin-top: 6px;
  color: #796487;
  font-size: 12px;
  line-height: 1.7;
}
.limite-publicacao {
  margin: 12px 4px 0;
}
.feedback-erro {
  margin-bottom: 18px;
  padding: 14px;
  border: 1px solid #edc1cf;
  border-radius: 12px;
  background: #fff1f5;
  color: #9b2844;
  font-size: 13px;
}
.feedback-erro strong {
  font-weight: 600;
}
.feedback-erro p {
  margin-top: 4px;
}
.status-publicacao {
  margin-top: 14px;
  color: #6c4d81;
  font-size: 12px;
}
.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #ffffff66;
  border-top-color: white;
  border-radius: 50%;
  animation: girar 0.7s linear infinite;
}
.sucesso {
  padding: 32px 20px;
  border: 1px solid #e1d2ee;
  border-radius: 20px;
  background: #faf6fe;
  text-align: center;
}
.sucesso-icone {
  display: inline-grid;
  place-items: center;
  width: 48px;
  height: 48px;
  margin-bottom: 12px;
  border-radius: 50%;
  background: #e4f5ed;
  color: #216547;
  font-size: 24px;
}
.sucesso h2 {
  font-size: 21px;
  font-weight: 650;
}
.sucesso p {
  margin: 12px 0 20px;
  color: #756080;
  font-size: 13px;
  line-height: 1.6;
}
.dados-mantidos {
  margin-block: 16px;
  text-align: left;
  font-size: 13px;
}
.dados-mantidos summary {
  cursor: pointer;
  min-height: 44px;
  padding-block: 10px;
  color: #583682;
}
.dados-mantidos dt {
  margin-top: 12px;
  font-weight: 600;
}
.dados-mantidos dd {
  margin-top: 4px;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
@keyframes girar {
  to {
    transform: rotate(360deg);
  }
}
@media (min-width: 400px) {
  .campos-duplos {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: 12px;
  }
}
@media (max-width: 359px) {
  .conteudo {
    padding-inline: 12px;
  }
  .form-card {
    padding-inline: 12px;
  }
  .btn-cancelar,
  .btn-publicar {
    padding-inline: 12px;
    font-size: 13px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .spinner {
    animation: none;
  }
}
</style>
