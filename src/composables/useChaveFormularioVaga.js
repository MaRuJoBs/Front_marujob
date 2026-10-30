import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { sessao } from '../services/authSession.js'

// A view é compartilhada, mas cada modo, objeto e sessão recebe seu próprio formulário.
export function useChaveFormularioVaga() {
  const route = useRoute()
  return computed(() =>
    JSON.stringify([
      route.name,
      route.params.id ?? null,
      sessao.revisao,
      sessao.usuario?.id ?? null,
      sessao.tipo,
    ]),
  )
}
