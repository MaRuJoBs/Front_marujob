<script setup>
import { computed, nextTick, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCriarVaga } from '@/composables/useCriarVaga'
import {
  categoriasVaga,
  modalidadesVaga,
  limiteDescricaoVaga,
  limitesVaga,
  validarVaga,
  normalizarPagamento,
  formatarPagamento,
} from '@/utils/vagaForm'

const router = useRouter()
const { form, erros, erroGeral, publicando, publicada, publicar } = useCriarVaga()
const formulario = ref(null)
const feedback = ref(null)
const preenchidos = computed(() => 6 - Object.keys(validarVaga(form)).length)
const limiteDescricao = computed(() => limiteDescricaoVaga(form.modalidade))
const pagamentoPreview = computed(() => normalizarPagamento(form.preco))
const caracteresDescricao = computed(() => [...form.descricao].length)

async function enviar() {
  await publicar()
  await nextTick()
  if (Object.keys(erros.value).length)
    formulario.value?.querySelector('[aria-invalid="true"]')?.focus()
  else if (erroGeral.value) feedback.value?.focus()
}

function validarCampo(campo) {
  const validacao = validarVaga(form)
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
    <header class="header">
      <div class="header-logo">
        <img src="@/assets/images/logo.png" alt="MaRuJoB's" class="logo-icon" />
        <span class="marca">MaRuJoB's<span>Conexões que viram oportunidades</span></span>
      </div>
      <button
        class="btn-back"
        type="button"
        :disabled="publicando"
        @click="router.push('/homeEmpresa')"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14 6-6 6 6 6M8 12h12" /></svg>
        <span>Voltar ao início</span>
      </button>
    </header>

    <main class="conteudo">
      <section class="apresentacao">
        <span class="area-tag"><span aria-hidden="true">✦</span> Área da empresa</span>
        <h1>Criar nova vaga</h1>
        <p>Seu próximo projeto começa com uma boa oportunidade. Conte o que você precisa.</p>
      </section>

      <section v-if="publicada" class="sucesso" role="status">
        <span class="sucesso-icone" aria-hidden="true">✓</span>
        <h2>Vaga publicada com sucesso!</h2>
        <p>
          {{ erroGeral || 'Sua oportunidade foi criada. Você já pode voltar à área da empresa.' }}
        </p>
        <button class="btn-publicar" type="button" @click="router.replace('/homeEmpresa')">
          Ir para o início
        </button>
      </section>

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
                :maxlength="limiteDescricao"
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
              >{{ publicando ? 'Publicando...' : 'Publicar vaga'
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
          <p class="limite-publicacao">
            Tipo de contratação e faixa de pagamento ainda não estão disponíveis nesta publicação.
          </p>
        </aside>
      </div>
    </main>
  </div>
</template>

<style scoped>
.criar-vaga {
  isolation: isolate;
  min-height: 100vh;
  background: #f5f3fc;
  color: #28213e;
  font-family: 'Poppins', sans-serif;
}
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 20px 40px;
  background: white;
  border-bottom: 1px solid #e9e3f5;
}
.header-logo {
  display: flex;
  align-items: center;
  gap: 10px;
}
.logo-icon {
  width: 54px;
  height: 54px;
  object-fit: contain;
}
.marca {
  font-size: 21px;
  font-weight: 700;
  color: #5b3cc4;
  letter-spacing: -0.6px;
}
.marca span {
  display: block;
  font-size: 10px;
  font-weight: 400;
  letter-spacing: 0;
  color: #7b748e;
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
  cursor: wait;
  opacity: 0.65;
}
button:focus-visible,
a:focus-visible {
  outline: 3px solid #b5a0f3;
  outline-offset: 4px;
}
.btn-back {
  display: flex;
  align-items: center;
  gap: 8px;
  border: 0;
  background: transparent;
  color: #5f527d;
  font-size: 12px;
  padding: 10px 0;
}
svg {
  width: 20px;
  height: 20px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.7;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.conteudo {
  padding: 36px 40px 48px;
}
.apresentacao {
  margin-bottom: 28px;
}
.area-tag {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  color: #5b3cc4;
  font-size: 11px;
  font-weight: 600;
  background: #eae3fc;
  padding: 5px 12px;
  border-radius: 20px;
  margin-bottom: 14px;
}
h1 {
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -1px;
  line-height: 1.25;
  margin-bottom: 9px;
}
.apresentacao p {
  color: #736983;
  font-size: 13px;
  max-width: 600px;
}
.layout-publicacao {
  display: grid;
  grid-template-columns: minmax(0, 1.65fr) minmax(0, 1fr);
  gap: 24px;
  align-items: start;
}
.form-card,
.preview-card {
  background: #fff;
  border: 1px solid #e9e3f5;
  border-radius: 20px;
  box-shadow: 0 4px 20px #38215c05;
}
.form-card {
  padding: 28px;
  min-width: 0;
}
.cabecalho-form {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-bottom: 22px;
  margin-bottom: 22px;
  border-bottom: 1px solid #eee9f6;
}
.etiqueta {
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 1.6px;
  color: #8a7e9f;
}
.cabecalho-form h2 {
  font-size: 18px;
  font-weight: 600;
  margin-top: 4px;
}
.obrigatorios {
  color: #8a7e9f;
  font-size: 9px;
  white-space: nowrap;
}
fieldset {
  border: 0;
  margin: 0;
  padding: 0;
  min-width: 0;
}
fieldset > legend {
  font-size: 12px;
  font-weight: 600;
  color: #5b3cc4;
  padding: 0 0 16px;
}
.campo {
  margin-bottom: 20px;
  min-width: 0;
}
label {
  display: block;
  font-size: 12px;
  font-weight: 500;
  margin-bottom: 8px;
  color: #3e3455;
}
label span {
  color: #673fd7;
}
input,
select,
textarea {
  width: 100%;
  min-width: 0;
  color: #33284a;
  background: #fdfcfe;
  border: 1px solid #ded7eb;
  border-radius: 10px;
  padding: 12px 13px;
  font-size: 12px;
  transition:
    border-color 0.15s,
    box-shadow 0.15s;
  outline: none;
}
input:focus,
select:focus,
textarea:focus {
  border-color: #673fd7;
  box-shadow: 0 0 0 3px #673fd712;
  background: white;
}
input[aria-invalid='true'],
textarea[aria-invalid='true'],
select[aria-invalid='true'] {
  border-color: #bb384b;
}
::placeholder,
select.placeholder {
  color: #92869f;
}
textarea {
  resize: vertical;
  min-height: 135px;
  line-height: 1.7;
}
.ajuda,
.ajuda-linha {
  color: #8a809a;
  font-size: 10px;
  line-height: 1.6;
  margin-top: 6px;
}
.ajuda-linha {
  display: flex;
  gap: 12px;
  justify-content: space-between;
}
.contador {
  white-space: nowrap;
}
.msg-erro {
  font-size: 11px;
  color: #b62f46;
  margin-top: 6px;
  line-height: 1.6;
}
.condicoes {
  margin-top: 8px;
  padding-top: 22px;
  border-top: 1px solid #eee9f6;
}
.condicoes legend {
  padding: 0;
  float: left;
  width: 100%;
  margin-bottom: 6px;
}
.descricao-secao {
  clear: both;
  font-size: 11px;
  color: #8a809a;
  margin-bottom: 18px;
}
.campos-duplos {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.input-moeda {
  position: relative;
}
.input-moeda > span {
  position: absolute;
  left: 13px;
  top: 13px;
  font-size: 12px;
  color: #7c6b96;
}
.input-moeda input {
  padding-left: 38px;
}
.acoes {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  border-top: 1px solid #eee9f6;
  padding-top: 22px;
  margin-top: 2px;
}
.btn-cancelar,
.btn-publicar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 12px 22px;
  min-height: 46px;
  font-size: 12px;
  font-weight: 600;
  border-radius: 10px;
}
.btn-cancelar {
  background: white;
  border: 1px solid #ded7eb;
  color: #655576;
}
.btn-publicar {
  background: #5b3cc4;
  border: 1px solid #5b3cc4;
  color: white;
  box-shadow: 0 4px 10px #5b3cc41a;
}
.btn-publicar:hover:not(:disabled) {
  background: #673fd7;
}
.btn-publicar > span:last-child:not(.spinner) {
  font-size: 18px;
}
.painel-lateral {
  position: sticky;
  top: 24px;
  min-width: 0;
}
.preview-card {
  padding: 24px;
  overflow-wrap: anywhere;
}
.preview-topo {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  margin-bottom: 26px;
}
.rascunho-tag {
  color: #7f718d;
  background: #f3f0f8;
  font-size: 9px;
  border-radius: 20px;
  padding: 4px 9px;
  white-space: nowrap;
}
.preview-icone {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 46px;
  height: 46px;
  background: #eee8fc;
  color: #673fd7;
  border-radius: 13px;
  margin-bottom: 16px;
}
.preview-icone svg {
  width: 24px;
  height: 24px;
}
.preview-categoria {
  display: inline-block;
  color: #673fd7;
  background: #f2edff;
  font-size: 10px;
  padding: 4px 9px;
  border-radius: 6px;
  margin-bottom: 12px;
}
.preview-card h2 {
  font-size: 18px;
  line-height: 1.5;
  font-weight: 600;
  margin-bottom: 10px;
}
.preview-descricao {
  font-size: 11px;
  color: #84788f;
  line-height: 1.8;
  white-space: pre-wrap;
}
.preview-condicoes {
  display: grid;
  gap: 15px;
  padding: 22px 0;
  margin-top: 6px;
}
.preview-condicoes span {
  display: block;
  color: #8a7e9f;
  font-size: 10px;
  margin-bottom: 3px;
}
.preview-condicoes strong {
  font-size: 14px;
  font-weight: 600;
  color: #4c347f;
}
.progresso {
  border-top: 1px solid #eee9f6;
  padding-top: 18px;
}
.progresso > div {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  font-size: 9px;
  color: #8a7e9f;
  margin-bottom: 8px;
}
.progresso strong {
  font-weight: 600;
  color: #673fd7;
}
progress {
  display: block;
  width: 100%;
  height: 5px;
  border: 0;
  border-radius: 6px;
  overflow: hidden;
  background: #eee8f8;
  accent-color: #673fd7;
}
progress::-webkit-progress-bar {
  background: #eee8f8;
}
progress::-webkit-progress-value {
  background: #673fd7;
  border-radius: 6px;
}
.dica-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-top: 20px;
  padding: 20px;
  border-radius: 16px;
  background: #ece6fc;
}
.dica-icone {
  font-size: 25px;
  color: #673fd7;
  line-height: 1;
}
.dica-card h3 {
  font-size: 11px;
  font-weight: 600;
  line-height: 1.6;
  color: #513781;
  margin-bottom: 7px;
}
.dica-card p,
.limite-publicacao {
  font-size: 10px;
  color: #857594;
  line-height: 1.8;
}
.limite-publicacao {
  margin: 16px 6px 0;
}
.feedback-erro {
  background: #fff2f3;
  border: 1px solid #f2c6cc;
  color: #a22940;
  padding: 14px;
  border-radius: 10px;
  margin-bottom: 20px;
  font-size: 12px;
}
.feedback-erro strong {
  font-weight: 600;
}
.feedback-erro p {
  margin-top: 4px;
}
.status-publicacao {
  color: #77608d;
  font-size: 11px;
  margin-top: 14px;
  text-align: right;
}
.spinner {
  width: 15px;
  height: 15px;
  border: 2px solid #ffffff66;
  border-top-color: white;
  border-radius: 50%;
  animation: girar 0.7s linear infinite;
}
.sucesso {
  background: white;
  border: 1px solid #e9e3f5;
  border-radius: 20px;
  padding: 40px 24px;
  text-align: center;
}
.sucesso-icone {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: #e4f5ed;
  color: #228259;
  font-size: 25px;
  margin-bottom: 16px;
}
.sucesso h2 {
  font-size: 22px;
  font-weight: 600;
}
.sucesso p {
  font-size: 13px;
  color: #80718f;
  margin: 12px 0 24px;
}
@keyframes girar {
  to {
    transform: rotate(360deg);
  }
}
/* Layout de celular em qualquer largura de navegador. */
.header {
  padding: 16px 24px;
}
.conteudo {
  padding: 24px 20px calc(112px + env(safe-area-inset-bottom, 0px));
}
.layout-publicacao {
  grid-template-columns: minmax(0, 1fr);
}
.painel-lateral {
  position: static;
}
.preview-card {
  display: none;
}
.dica-card {
  margin-top: 0;
}
.btn-back {
  min-height: 44px;
  padding: 8px;
  font-size: 12px;
}
.apresentacao p {
  font-size: 14px;
}
.campos-duplos {
  grid-template-columns: minmax(0, 1fr);
  gap: 0;
}
label,
fieldset > legend {
  font-size: 14px;
}
input,
select,
textarea {
  font-size: 16px;
  min-height: 50px;
  scroll-margin-block: 100px;
}
.input-moeda > span {
  top: 14px;
  font-size: 14px;
}
.ajuda,
.ajuda-linha,
.descricao-secao,
.msg-erro,
.dica-card p,
.limite-publicacao {
  font-size: 12px;
}
.dica-card h3 {
  font-size: 13px;
}
.acoes {
  position: fixed;
  left: 50%;
  right: auto;
  width: min(100%, 420px);
  transform: translateX(-50%);
  bottom: 0;
  z-index: 20;
  gap: 12px;
  margin: 0;
  padding: 12px 20px calc(12px + env(safe-area-inset-bottom, 0px));
  background: #fff;
  border-top: 1px solid #e7e0f4;
  box-shadow: 0 -4px 20px #35215b0a;
}
.btn-publicar,
.btn-cancelar {
  min-height: 48px;
  font-size: 14px;
}
.acoes .btn-publicar {
  flex: 1;
}
.status-publicacao {
  font-size: 12px;
  text-align: left;
}

.header {
  padding: 12px 16px;
  gap: 8px;
}
.marca {
  font-size: 18px;
}
.marca span {
  display: none;
}
.logo-icon {
  width: 42px;
  height: 42px;
}
.btn-back {
  font-size: 12px;
  gap: 4px;
}
.btn-back svg {
  width: 16px;
}
.conteudo {
  padding: 20px 16px calc(112px + env(safe-area-inset-bottom, 0px));
}
.form-card {
  padding: 20px 16px;
  border-radius: 16px;
}
.cabecalho-form {
  align-items: flex-start;
  flex-direction: column;
  gap: 6px;
}
.campos-duplos {
  grid-template-columns: minmax(0, 1fr);
  gap: 0;
}
.acoes {
  gap: 10px;
  padding-inline: 16px;
}
.btn-cancelar {
  padding: 12px 16px;
}
.btn-publicar {
  flex: 1;
  padding: 12px;
}
input,
select,
textarea {
  font-size: 16px;
}
.ajuda-linha {
  align-items: flex-start;
}
@media (prefers-reduced-motion: reduce) {
  .spinner {
    animation: none;
  }
  input,
  textarea,
  select {
    transition: none;
  }
}
</style>
