import { reactive, ref, shallowRef, watch } from 'vue'
import { defineStore } from 'pinia'
import { sessao } from '../services/authService.js'
import { novoRascunhoVaga } from '../utils/vagaForm.js'

export const useVagasStore = defineStore('vagas', () => {
  const rascunho = reactive(novoRascunhoVaga())
  const proprietarioId = ref(null)
  const ultimaPublicada = shallowRef(null)
  const confirmacao = ref('')
  const envios = reactive(new Set())
  const avisoPublicacao = ref('')

  function iniciarEnvio(chave) {
    if (envios.has(chave)) return false
    envios.add(chave)
    return true
  }

  function finalizarEnvio(chave) {
    envios.delete(chave)
  }

  function prepararRascunho(usuarioId) {
    if (proprietarioId.value !== usuarioId) {
      Object.assign(rascunho, novoRascunhoVaga())
      ultimaPublicada.value = null
      confirmacao.value = ''
      avisoPublicacao.value = ''
    }
    proprietarioId.value = usuarioId
  }

  function registrarPublicacao(vaga, preservarRascunho = false) {
    ultimaPublicada.value = vaga && typeof vaga === 'object' ? vaga : null
    confirmacao.value = 'Vaga publicada com sucesso!'
    avisoPublicacao.value = ''
    if (!preservarRascunho) Object.assign(rascunho, novoRascunhoVaga())
  }

  watch(
    () => sessao.revisao,
    () => {
      ultimaPublicada.value = null
      confirmacao.value = ''
      avisoPublicacao.value = ''
      envios.clear()
    },
    { flush: 'sync' },
  )

  watch(
    () => sessao.usuario?.id,
    (id) => {
      if (id == null) {
        ultimaPublicada.value = null
        confirmacao.value = ''
      } else if (proprietarioId.value !== null && id !== proprietarioId.value) {
        prepararRascunho(id)
      }
    },
    { flush: 'sync' },
  )

  return {
    rascunho,
    ultimaPublicada,
    confirmacao,
    prepararRascunho,
    registrarPublicacao,
    envios,
    iniciarEnvio,
    finalizarEnvio,
    avisoPublicacao,
  }
})
