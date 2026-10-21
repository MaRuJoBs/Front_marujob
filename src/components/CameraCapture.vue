
<script setup>
import { ref, onUnmounted, nextTick } from 'vue'

const emit = defineEmits(['captured', 'close'])

const videoRef = ref(null)
const cameraAtiva = ref(false)
const carregando = ref(false)
const erro = ref('')

let stream = null

const pararCamera = () => {
  if (stream) {
    stream.getTracks().forEach((track) => track.stop())
    stream = null
  }

  if (videoRef.value) {
    videoRef.value.srcObject = null
  }

  cameraAtiva.value = false
}

const abrirCamera = async () => {
  if (carregando.value || cameraAtiva.value) return

  erro.value = ''
  carregando.value = true

  try {
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error('CAMERA_INDISPONIVEL')
    }

    const novoStream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'user',
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
      audio: false,
    })

    stream = novoStream
    cameraAtiva.value = true

    await nextTick()

    if (videoRef.value) {
      videoRef.value.srcObject = stream
      await videoRef.value.play()
    }
  } catch (error) {
    console.error('Erro ao abrir câmera:', error)

    pararCamera()

    if (error.name === 'NotAllowedError') {
      erro.value = 'Permissão de câmera negada.'
    } else if (error.name === 'NotFoundError') {
      erro.value = 'Nenhuma câmera encontrada.'
    } else if (error.message === 'CAMERA_INDISPONIVEL') {
      erro.value = 'A câmera não está disponível neste navegador ou conexão.'
    } else {
      erro.value = 'Não foi possível acessar a câmera.'
    }
  } finally {
    carregando.value = false
  }
}

const fotografar = async () => {
  const video = videoRef.value

  if (!cameraAtiva.value || !video?.videoWidth || !video?.videoHeight) {
    erro.value = 'Aguarde a câmera carregar.'
    return
  }

  const canvas = document.createElement('canvas')

  canvas.width = video.videoWidth
  canvas.height = video.videoHeight

  const contexto = canvas.getContext('2d')

  if (!contexto) {
    erro.value = 'Não foi possível capturar a imagem.'
    return
  }

  contexto.drawImage(video, 0, 0)

  canvas.toBlob(
    (blob) => {
      if (!blob) {
        erro.value = 'Não foi possível gerar a fotografia.'
        return
      }

      const arquivo = new File(
        [blob],
        `foto-perfil-${Date.now()}.jpg`,
        { type: 'image/jpeg' }
      )

      pararCamera()
      emit('captured', arquivo)
    },
    'image/jpeg',
    0.9
  )
}

const fecharCamera = () => {
  pararCamera()
  emit('close')
}

onUnmounted(() => {
  pararCamera()
})
</script>

<template>
  <div class="camera-capture">
    <h3>Tirar foto de perfil</h3>

    <video
      v-if="cameraAtiva"
      ref="videoRef"
      autoplay
      playsinline
      muted
      class="camera-preview"
    ></video>

    <div v-else class="camera-placeholder">
      <i class="fa-solid fa-camera"></i>
      <p>Câmera desligada</p>
    </div>

    <p v-if="erro" class="camera-erro">
      {{ erro }}
    </p>

    <div class="camera-acoes">
      <button
        v-if="!cameraAtiva"
        type="button"
        :disabled="carregando"
        @click="abrirCamera"
      >
        {{ carregando ? 'Abrindo...' : 'Abrir câmera' }}
      </button>

      <button
        v-if="cameraAtiva"
        type="button"
        @click="fotografar"
      >
        <i class="fa-solid fa-camera"></i>
        Fotografar
      </button>

      <button
        type="button"
        class="btn-fechar"
        @click="fecharCamera"
      >
        Fechar
      </button>
    </div>
  </div>
</template>

<style scoped>
.camera-capture {
  background: #f5f2fb;
  border-radius: 16px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.camera-capture h3 {
  color: #513f7c;
  font-size: 17px;
  text-align: center;
}

.camera-preview {
  width: 100%;
  max-height: 350px;
  border-radius: 12px;
  background: #000;
  object-fit: contain;
}

.camera-placeholder {
  height: 180px;
  background: #e8e1f2;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: #6d47d9;
}

.camera-placeholder i {
  font-size: 40px;
}

.camera-erro {
  color: #b42318;
  font-size: 13px;
  text-align: center;
}

.camera-acoes {
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
}

.camera-acoes button {
  border: none;
  border-radius: 10px;
  background: #673fd7;
  color: white;
  padding: 12px 18px;
  font-weight: 600;
  cursor: pointer;
}

.camera-acoes button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.camera-acoes .btn-fechar {
  background: #aba6b5;
  color: #49357b;
}
</style>
