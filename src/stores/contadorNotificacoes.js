import { defineStore } from 'pinia'
import { ref } from 'vue'
import { sessao } from '@/services/authSession'
import { contarNotificacoesNaoLidas } from '@/services/notificacoesService'

export const useContadorNotificacoes = defineStore('contadorNotificacoes', () => {
  const total = ref(null)
  let consulta

  function limpar() {
    consulta?.controller.abort()
    consulta = undefined
    total.value = null
  }

  function atualizar({ reiniciar = false } = {}) {
    if (sessao.tipo !== 'empresa' || !sessao.usuario) return
    if (consulta && !reiniciar) return consulta.promise

    consulta?.controller.abort()
    const controller = new AbortController()
    const revisao = sessao.revisao
    const conta = sessao.usuario.id
    const atual = () =>
      !controller.signal.aborted &&
      sessao.revisao === revisao &&
      sessao.tipo === 'empresa' &&
      sessao.usuario?.id === conta

    const promise = contarNotificacoesNaoLidas({ signal: controller.signal })
      .then((count) => {
        if (atual()) total.value = count
      })
      .catch(() => {
        if (atual()) total.value = null
      })
      .finally(() => {
        if (consulta?.controller === controller) consulta = undefined
      })

    consulta = { controller, promise }
    return promise
  }

  return { total, limpar, atualizar }
})
