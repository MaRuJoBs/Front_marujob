<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import CameraCapture from '@/components/CameraCapture.vue'
import { useEditarPerfil } from '@/composables/useEditarPerfil'
import { habilidadesSugeridas, opcoesTags } from '@/utils/tags'

const {
  nome,
  profissao,
  sobre,
  telefone,

  localizacao,
  latitude,
  longitude,
  precisao,
  dataLocalizacao,
  localizacaoConfirmada,
  buscandoEndereco,
  pesquisaCidade,
  resultadosCidades,
  buscandoCidades,
  erroBuscaCidade,
  erroLocalizacao,
  loadingLocation,
  locationError,
  usarLocalizacaoAtual,
  buscarCidades,
  selecionarCidade,

  imagem,
  previewImagem,
  selecionarImagem,
  definirImagem,

  habilidades,
  novaHabilidade,
  adicionarHabilidade,
  removerHabilidade,

  carregando,
  salvando,
  erro,
  sucesso,

  pronto,
  camposErro,
  erroImagem,
  erroHabilidade,
  carregarPerfil,
  salvarPerfil,
  falhaImagemPerfil,
  voltar,
} = useEditarPerfil()

const habilidadesRemovidas = ref([])
const opcoesHabilidades = computed(() =>
  opcoesTags(habilidadesSugeridas, habilidades.value, habilidadesRemovidas.value).filter(
    (opcao) =>
      !habilidades.value.some(
        (atual) => atual.trim().toLocaleLowerCase('pt-BR') === opcao.toLocaleLowerCase('pt-BR'),
      ),
  ),
)
watch(pronto, (valor) => {
  if (!valor) habilidadesRemovidas.value = []
})
function retirarHabilidade(habilidade) {
  habilidadesRemovidas.value = opcoesTags(habilidadesRemovidas.value, [habilidade])
  removerHabilidade(habilidade)
}
function selecionarHabilidade(event) {
  const campo = event.currentTarget
  adicionarHabilidade()
  nextTick(() => {
    campo.value = novaHabilidade.value
  })
}

const mostrarOpcoesFoto = ref(false)
const mostrarCamera = ref(false)

const abrirOpcoesFoto = () => {
  mostrarOpcoesFoto.value = true
}

const fecharOpcoesFoto = () => {
  mostrarOpcoesFoto.value = false
}

const abrirCamera = () => {
  mostrarOpcoesFoto.value = false
  mostrarCamera.value = true
}

const fecharCamera = () => {
  mostrarCamera.value = false
}

const receberFotoCamera = (arquivo) => {
  definirImagem(arquivo)
  mostrarCamera.value = false
}
</script>

<template>
  <div class="editar-perfil mrj-ui freelancer-page">
    <header class="topo">
      <button class="voltar" aria-label="Voltar ao perfil" @click="voltar">
        <i class="fa-solid fa-arrow-left"></i>
      </button>

      <h1>Editar Perfil</h1>
    </header>

    <div v-if="carregando && !salvando" role="status" class="carregando">Carregando perfil...</div>

    <div v-else-if="!pronto" role="alert">
      {{ erro }} <button @click="carregarPerfil">Tentar novamente</button>
    </div>
    <fieldset v-else class="conteudo" :disabled="salvando">
      <section class="foto-section">
        <div class="foto-container">
          <img
            @error="falhaImagemPerfil"
            v-if="previewImagem"
            :src="previewImagem"
            class="foto"
            alt="Foto de perfil"
            referrerpolicy="no-referrer"
          />

          <div v-else class="foto foto-vazia">
            <i class="fa-solid fa-user"></i>
          </div>

          <button
            type="button"
            class="botao-camera"
            aria-label="Alterar foto de perfil"
            @click="abrirOpcoesFoto"
          >
            <i class="fa-solid fa-camera"></i>
          </button>
        </div>

        <p>Alterar foto de perfil</p>

        <div v-if="mostrarOpcoesFoto" class="opcoes-foto">
          <p>Como deseja adicionar sua foto?</p>

          <label class="opcao-foto">
            <i class="fa-solid fa-image"></i>
            Escolher da galeria

            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              @change="
                (event) => {
                  selecionarImagem(event)
                  fecharOpcoesFoto()
                }
              "
            />
          </label>

          <label class="opcao-foto">
            <i class="fa-solid fa-mobile-screen"></i>
            Tirar foto pelo celular

            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              capture="user"
              @change="
                (event) => {
                  selecionarImagem(event)
                  fecharOpcoesFoto()
                }
              "
            />
          </label>

          <button type="button" class="opcao-foto" @click="abrirCamera">
            <i class="fa-solid fa-video"></i>
            Abrir câmera ao vivo
          </button>

          <button type="button" class="cancelar-foto" @click="fecharOpcoesFoto">Cancelar</button>
        </div>

        <CameraCapture
          v-if="mostrarCamera"
          class="camera-perfil"
          @captured="receberFotoCamera"
          @close="fecharCamera"
        />
      </section>

      <section class="formulario">
        <div class="campo">
          <label for="perfil-nome">Nome</label>
          <p v-if="camposErro.name" id="erro-nome" role="alert">{{ camposErro.name }}</p>
          <input
            id="perfil-nome"
            aria-label="Nome"
            :aria-invalid="!!camposErro.name"
            :aria-describedby="camposErro.name ? 'erro-nome' : undefined"
            v-model="nome"
            type="text"
            placeholder="Digite seu nome"
          />
        </div>

        <div class="campo">
          <label for="perfil-profissao">Profissão</label>
          <p v-if="camposErro.profissao" id="erro-profissao" role="alert">
            {{ camposErro.profissao }}
          </p>
          <input
            aria-label="Profissão"
            id="perfil-profissao"
            :aria-invalid="!!camposErro.profissao"
            :aria-describedby="camposErro.profissao ? 'erro-profissao' : undefined"
            v-model="profissao"
            type="text"
            placeholder="Ex.: Designer Gráfico"
          />
        </div>

        <div class="campo campo-localizacao">
          <label for="perfil-localizacao">Localização</label>
          <p v-if="camposErro.localizacao" role="alert">{{ camposErro.localizacao }}</p>

          <p class="localizacao-descricao">
            Escolha sua cidade e estado. Sua localização exata não será exibida no perfil público.
          </p>

          <input
            aria-label="Localização"
            id="perfil-localizacao"
            :aria-invalid="!!camposErro.localizacao"
            :value="localizacao"
            type="text"
            placeholder="Nenhuma cidade selecionada"
            readonly
          />

          <button
            type="button"
            class="btn-localizacao"
            :disabled="loadingLocation || buscandoEndereco"
            @click="usarLocalizacaoAtual"
          >
            <i class="fa-solid fa-location-crosshairs"></i>

            {{
              loadingLocation
                ? 'Obtendo localização...'
                : buscandoEndereco
                  ? 'Identificando cidade...'
                  : 'Usar minha localização atual'
            }}
          </button>

          <p v-if="locationError" class="localizacao-erro">
            {{ locationError }}
          </p>
          <p v-if="erroLocalizacao" class="localizacao-erro">
            {{ erroLocalizacao }}
          </p>

          <div class="busca-cidade">
            <p class="localizacao-descricao">Ou pesquise sua cidade manualmente:</p>

            <div class="busca-cidade-controles">
              <input
                aria-label="Pesquisar cidade"
                v-model="pesquisaCidade"
                type="text"
                placeholder="Ex.: Joinville"
                @keyup.enter="buscarCidades"
              />

              <button
                type="button"
                class="btn-buscar-cidade"
                :disabled="buscandoCidades"
                @click="buscarCidades"
              >
                {{ buscandoCidades ? 'Buscando...' : 'Buscar' }}
              </button>
            </div>

            <p v-if="erroBuscaCidade" class="localizacao-erro">
              {{ erroBuscaCidade }}
            </p>

            <div v-if="resultadosCidades.length" class="resultados-cidades">
              <button
                v-for="(cidade, index) in resultadosCidades"
                :key="`${cidade.nome}-${index}`"
                type="button"
                class="resultado-cidade"
                @click="selecionarCidade(cidade)"
              >
                <i class="fa-solid fa-location-dot"></i>
                {{ cidade.nome }}
              </button>
            </div>
          </div>

          <p v-if="localizacaoConfirmada" class="localizacao-sucesso">
            <i class="fa-solid fa-circle-check"></i>
            Cidade selecionada: {{ localizacao }}
          </p>
        </div>

        <div class="campo">
          <label for="perfil-telefone">Telefone</label>
          <p v-if="camposErro.telefone" id="erro-telefone" role="alert">
            {{ camposErro.telefone }}
          </p>
          <input
            aria-label="Telefone"
            id="perfil-telefone"
            :aria-invalid="!!camposErro.telefone"
            :aria-describedby="camposErro.telefone ? 'erro-telefone' : undefined"
            v-model="telefone"
            type="tel"
            placeholder="(47) 99999-9999"
          />
        </div>

        <div class="campo campo-sobre">
          <label for="perfil-sobre">Sobre você</label>
          <p v-if="camposErro.sobre" id="erro-sobre" role="alert">{{ camposErro.sobre }}</p>
          <textarea
            aria-label="Sobre você"
            id="perfil-sobre"
            :aria-invalid="!!camposErro.sobre"
            :aria-describedby="camposErro.sobre ? 'erro-sobre' : undefined"
            v-model="sobre"
            rows="5"
            placeholder="Conte um pouco sobre você..."
          ></textarea>
        </div>

        <div class="campo campo-habilidades">
          <label for="perfil-habilidades">Habilidades</label>
          <p v-if="camposErro.habilidades" role="alert">{{ camposErro.habilidades }}</p>

          <div class="adicionar-habilidade">
            <select
              aria-label="Habilidades"
              id="perfil-habilidades"
              :aria-invalid="!!camposErro.habilidades || !!erroHabilidade"
              v-model="novaHabilidade"
              @change="selecionarHabilidade"
            >
              <option value="" disabled>Selecionar habilidade</option>
              <option v-for="opcao in opcoesHabilidades" :key="opcao" :value="opcao">
                {{ opcao }}
              </option>
            </select>
          </div>

          <div class="habilidades">
            <span v-for="habilidade in habilidades" :key="habilidade" class="habilidade">
              {{ habilidade }}

              <button
                type="button"
                :aria-label="`Remover habilidade ${habilidade}`"
                @click="retirarHabilidade(habilidade)"
              >
                ×
              </button>
            </span>
          </div>
        </div>

        <p v-if="erroImagem" role="alert">{{ erroImagem }}</p>
        <p v-if="erroHabilidade" role="alert">{{ erroHabilidade }}</p>
        <p v-if="erro" role="alert" class="mensagem erro">
          {{ erro }}
        </p>

        <p v-if="sucesso" role="status" class="mensagem sucesso">
          {{ sucesso }}
        </p>

        <button class="btn-salvar" :disabled="salvando" @click="salvarPerfil">
          {{ salvando ? 'Salvando...' : 'Salvar alterações' }}
        </button>
      </section>
    </fieldset>
  </div>
</template>

<style scoped src="../styles/freelancer.css"></style>
<style scoped>
.editar-perfil {
  min-height: 100dvh;
  padding: 24px 20px;
}
.topo {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 28px;
}
.voltar {
  display: grid;
  place-items: center;
  width: 44px;
  flex: 0 0 44px;
  background: white;
  border: 1px solid var(--mrj-color-border-subtle);
  border-radius: 12px;
  color: var(--mrj-color-text-secondary);
}
fieldset.conteudo {
  display: flex;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 24px;
  border: 0;
  margin: 0;
  padding: 0;
  min-width: 0;
}
.foto-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1 1 200px;
  min-width: 0;
  padding: 28px 20px;
  background: white;
  border: 1px solid var(--mrj-color-border-subtle);
  border-radius: 16px;
}
.foto-container {
  position: relative;
}
.foto {
  display: block;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid var(--mrj-color-secondary);
}
.foto-vazia {
  display: grid;
  place-items: center;
  background: var(--mrj-color-secondary);
  color: var(--mrj-color-primary);
  font-size: 36px;
}
.botao-camera {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 44px;
  border: 3px solid white;
  border-radius: 50%;
  background: var(--mrj-color-primary);
  color: white;
}
.foto-section > p {
  font-size: 0.8125rem;
  color: var(--mrj-color-text-secondary);
  margin-top: 16px;
}
.formulario {
  display: grid;
  gap: 24px;
  flex: 999 1 320px;
  min-width: 0;
  padding: 24px;
  background: white;
  border: 1px solid var(--mrj-color-border-subtle);
  border-radius: 16px;
}
.campo {
  min-width: 0;
}
.adicionar-habilidade,
.busca-cidade-controles {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}
.busca-cidade-controles input {
  flex: 1;
  min-width: 0;
}
.habilidades {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}
.habilidade {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
  max-width: 100%;
  padding: 0 4px 0 12px;
  background: var(--mrj-color-secondary);
  color: var(--mrj-color-primary);
  border-radius: 8px;
  font-size: 0.8125rem;
}
.habilidade button {
  min-width: 36px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: inherit;
  font-size: 18px;
}
.btn-salvar,
.btn-buscar-cidade {
  border: 0;
  border-radius: 10px;
  background: var(--mrj-color-primary);
  color: white;
  padding: 12px 18px;
  font-size: 0.875rem;
  font-weight: 600;
}
.btn-salvar {
  justify-self: end;
}
.mensagem {
  padding: 14px;
  border-radius: 10px;
  font-size: 0.875rem;
}
.erro {
  background: #fff0f0;
  color: var(--mrj-color-danger);
}
.sucesso {
  background: #eaf7ef;
  color: var(--mrj-color-success);
}
.localizacao-descricao {
  color: var(--mrj-color-text-secondary);
  font-size: 0.75rem;
  margin-bottom: 12px !important;
}
.btn-localizacao {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  width: 100%;
  margin-top: 12px;
  padding: 10px;
  background: var(--mrj-color-secondary);
  color: var(--mrj-color-primary);
  border: 0;
  border-radius: 10px;
  font-size: 0.8125rem;
}
.localizacao-erro {
  color: var(--mrj-color-danger);
  font-size: 0.8125rem;
  margin-top: 10px !important;
}
.localizacao-sucesso {
  color: var(--mrj-color-success);
  font-size: 0.8125rem;
  margin-top: 12px !important;
}
.busca-cidade {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid var(--mrj-color-border-subtle);
}
.resultados-cidades {
  display: grid;
  gap: 4px;
  margin-top: 12px;
}
.resultado-cidade {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px;
  border: 1px solid var(--mrj-color-border-subtle);
  border-radius: 8px;
  text-align: left;
  color: var(--mrj-color-text);
  background: var(--mrj-color-background);
  font-size: 0.8125rem;
}
.opcoes-foto {
  display: grid;
  gap: 8px;
  margin-top: 20px;
  max-width: 100%;
}
.opcoes-foto p {
  font-size: 0.8125rem;
  color: var(--mrj-color-text-secondary);
}
.opcao-foto {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 44px;
  padding: 10px;
  border: 1px solid var(--mrj-color-border-subtle);
  border-radius: 8px;
  background: white;
  color: var(--mrj-color-text);
  cursor: pointer;
  font-size: 0.8125rem;
  text-align: left;
}
.opcao-foto input {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
}
.opcao-foto:focus-within {
  outline: 3px solid var(--mrj-color-focus);
  outline-offset: 3px;
}
.cancelar-foto {
  border: 0;
  color: var(--mrj-color-text-secondary);
  background: transparent;
}
.camera-perfil {
  width: 100%;
  max-width: 440px;
  margin-top: 16px;
}
</style>
