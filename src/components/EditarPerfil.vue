<script setup>
import { ref } from 'vue'
import CameraCapture from '@/components/CameraCapture.vue'
import { useEditarPerfil } from '@/composables/useEditarPerfil'

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

  salvarPerfil,
  voltar,
} = useEditarPerfil()

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
  <div class="editar-perfil">
    <header class="topo">
      <button class="voltar" @click="voltar">
        <i class="fa-solid fa-arrow-left"></i>
      </button>

      <h2>Editar Perfil</h2>
    </header>

    <div v-if="carregando" class="carregando">Carregando perfil...</div>

    <main v-else class="conteudo">
      <section class="foto-section">
        <div class="foto-container">
          <img v-if="previewImagem" :src="previewImagem" class="foto" alt="Foto de perfil" />

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
              accept="image/*"
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
              accept="image/*"
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
          <label>Nome</label>
          <input v-model="nome" type="text" placeholder="Digite seu nome" />
        </div>

        <div class="campo">
          <label>Profissão</label>
          <input v-model="profissao" type="text" placeholder="Ex.: Designer Gráfico" />
        </div>

        <div class="campo">
          <label>Localização</label>

          <p class="localizacao-descricao">
            Escolha sua cidade e estado. Sua localização exata não será exibida no perfil público.
          </p>

          <input
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
          <label>Telefone</label>
          <input v-model="telefone" type="tel" placeholder="(47) 99999-9999" />
        </div>

        <div class="campo">
          <label>Sobre você</label>
          <textarea v-model="sobre" rows="5" placeholder="Conte um pouco sobre você..."></textarea>
        </div>

        <div class="campo">
          <label>Habilidades</label>

          <div class="adicionar-habilidade">
            <input
              v-model="novaHabilidade"
              type="text"
              placeholder="Ex.: Photoshop"
              @keyup.enter="adicionarHabilidade"
            />

            <button type="button" @click="adicionarHabilidade">Adicionar</button>
          </div>

          <div class="habilidades">
            <span v-for="habilidade in habilidades" :key="habilidade" class="habilidade">
              {{ habilidade }}

              <button type="button" @click="removerHabilidade(habilidade)">×</button>
            </span>
          </div>
        </div>

        <p v-if="erro" class="mensagem erro">
          {{ erro }}
        </p>

        <p v-if="sucesso" class="mensagem sucesso">
          {{ sucesso }}
        </p>

        <button class="btn-salvar" :disabled="salvando" @click="salvarPerfil">
          {{ salvando ? 'Salvando...' : 'Salvar alterações' }}
        </button>
      </section>
    </main>
  </div>
</template>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: sans-serif;
}

.editar-perfil {
  min-height: 100vh;
  background: #e8e1f2;
  padding-bottom: 80px;
}

.topo {
  height: 70px;
  background: #f5f2fb;
  display: flex;
  align-items: center;
  padding: 0 20px;
  gap: 15px;
}

.topo h2 {
  color: #513f7c;
  font-size: 20px;
}

.voltar {
  border: none;
  background: transparent;
  color: #6d47d9;
  font-size: 18px;
  cursor: pointer;
}

.conteudo {
  max-width: 600px;
  margin: 0 auto;
  padding: 25px 16px;
}

.foto-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 25px;
}

.foto-container {
  position: relative;
}

.foto {
  width: 110px;
  height: 110px;
  border-radius: 50%;
  object-fit: cover;
  display: block;
}

.foto-vazia {
  background: #aaa;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 35px;
}

.botao-camera {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: #7a3ff2;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  padding: 0;
  border: none;
}

.foto-section p {
  margin-top: 8px;
  color: #6d47d9;
  font-size: 13px;
}

.formulario {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.campo {
  background: #f5f2fb;
  padding: 15px;
  border-radius: 16px;
}

.campo label {
  display: block;
  color: #513f7c;
  font-size: 13px;
  font-weight: 700;
  margin-bottom: 8px;
}

.campo input,
.campo textarea {
  width: 100%;
  border: 1px solid #ddd6e8;
  border-radius: 10px;
  padding: 11px;
  background: white;
  color: #444;
  font-size: 14px;
  outline: none;
}

.campo textarea {
  resize: vertical;
}

.campo input:focus,
.campo textarea:focus {
  border-color: #7a3ff2;
}

.adicionar-habilidade {
  display: flex;
  gap: 8px;
}

.adicionar-habilidade button {
  border: none;
  border-radius: 10px;
  padding: 0 14px;
  background: #7a3ff2;
  color: white;
  cursor: pointer;
}

.habilidades {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.habilidade {
  background: #aba6b5;
  color: #49357b;
  padding: 6px 10px;
  border-radius: 20px;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.habilidade button {
  border: none;
  background: transparent;
  color: #49357b;
  font-size: 16px;
  cursor: pointer;
}

.btn-salvar {
  border: none;
  border-radius: 16px;
  padding: 14px;
  background: #7a3ff2;
  color: white;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
}

.btn-salvar:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.mensagem {
  padding: 12px;
  border-radius: 10px;
  font-size: 13px;
  text-align: center;
}

.erro {
  background: #ffe0e0;
  color: #a33;
}

.sucesso {
  background: #def5df;
  color: #28752d;
}

.carregando {
  text-align: center;
  padding: 50px;
  color: #513f7c;
}

/* LOCALIZAÇÃO */

.localizacao-descricao {
  color: #746b85;
  font-size: 12px;
  line-height: 1.5;
  margin-bottom: 12px;
}

.btn-localizacao {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 12px;
  padding: 13px;
  border: 1px solid #7a3ff2;
  border-radius: 12px;
  background: #ede5ff;
  color: #673fd7;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;
}

.btn-localizacao:hover {
  background: #e0d2ff;
}

.btn-localizacao:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.localizacao-erro {
  color: #b42318;
  font-size: 12px;
  margin-top: 10px;
}

.localizacao-sucesso {
  display: flex;
  align-items: center;
  gap: 7px;
  color: #23824b;
  font-size: 12px;
  margin-top: 10px;
  line-height: 1.5;
}

.busca-cidade {
  margin-top: 18px;
  padding-top: 16px;
  border-top: 1px solid #ddd6e8;
}

.busca-cidade-controles {
  display: flex;
  gap: 8px;
}

.busca-cidade-controles input {
  flex: 1;
  min-width: 0;
}

.btn-buscar-cidade {
  border: none;
  border-radius: 10px;
  padding: 0 14px;
  background: #7a3ff2;
  color: white;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.btn-buscar-cidade:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.resultados-cidades {
  margin-top: 10px;
  border: 1px solid #ddd6e8;
  border-radius: 10px;
  overflow: hidden;
}

.resultado-cidade {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  border: none;
  border-bottom: 1px solid #eee;
  background: white;
  color: #513f7c;
  font-size: 13px;
  text-align: left;
  cursor: pointer;
}

.resultado-cidade:last-child {
  border-bottom: none;
}

.resultado-cidade:hover {
  background: #ede5ff;
}


.opcoes-foto {
  width: 100%;
  max-width: 340px;
  margin-top: 16px;
  padding: 16px;
  background: #f5f2fb;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.opcoes-foto p {
  color: #513f7c;
  font-size: 14px;
  font-weight: 600;
  text-align: center;
  margin-bottom: 4px;
}

.opcao-foto {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 13px;
  border: 1px solid #ddd6e8;
  border-radius: 10px;
  background: white;
  color: #513f7c;
  font-size: 13px;
  cursor: pointer;
  text-align: left;
}

.opcao-foto i {
  color: #673fd7;
  font-size: 17px;
}

.opcao-foto input {
  display: none;
}

.cancelar-foto {
  border: none;
  background: transparent;
  color: #746b85;
  padding: 10px;
  cursor: pointer;
}

.camera-perfil {
  width: 100%;
  max-width: 440px;
  margin-top: 16px;
}

</style>
