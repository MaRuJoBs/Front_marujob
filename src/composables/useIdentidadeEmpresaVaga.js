import { ref, watch } from 'vue'
import api from '../services/api.js'
import { sessao } from '../services/authSession.js'
import { consultarPerfilEmpresa } from '../services/empresaPerfilService.js'
import { capturarEmpresa } from '../services/freelanceService.js'
import { resolverImagem } from '../utils/imagens.js'

export function useIdentidadeEmpresaVaga() {
  const perfil = ref(null)
  watch(
    () => [sessao.revisao, sessao.tipo, sessao.usuario?.id],
    async (_, __, limpar) => {
      perfil.value = null
      const conta = capturarEmpresa()
      if (!conta.atual()) return
      const { id } = conta
      const controller = new AbortController()
      limpar(() => controller.abort())
      const { signal } = controller
      try {
        const data = await consultarPerfilEmpresa({ signal, _sessionRevision: sessao.revisao })
        const proprietaria = data?.empresa ?? data?.id
        if (
          signal.aborted ||
          !conta.atual() ||
          (proprietaria != null && String(proprietaria) !== String(id))
        )
          return
        const caminho = resolverImagem(data?.profile_image, api.defaults.baseURL)
        const foto = caminho ? new URL(caminho) : null
        const origem = new URL(
          api.defaults.baseURL,
          globalThis.location?.origin || 'http://localhost',
        ).origin
        if (foto?.origin === origem && !foto.search) foto.searchParams.set('v', String(Date.now()))
        perfil.value = { id, name: data?.name, profile_image: foto?.href ?? null }
      } catch {
        // A vaga continua disponível com a identidade pública ou o ícone neutro.
      }
    },
    { immediate: true, flush: 'sync' },
  )
  return perfil
}
