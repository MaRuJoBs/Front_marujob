import { ref, computed, watch, onUnmounted } from 'vue'
import { ufs } from '../services/empresaPerfilService.js'
import { sessao } from '../services/authSession.js'
import { useGeolocation } from './useGeolocation.js'
import geocodingApi from '../services/geocodingApi.js'

export function useEmpresaLocalizacao({ form, perfil, editando, salvando }) {
  const confirmada = ref(null),
    buscandoEndereco = ref(false),
    erroLocalizacao = ref('')
  const { loadingLocation, locationError, requestCurrentLocation, cancelCurrentLocation } =
    useGeolocation()
  const gpsOcupado = computed(() => loadingLocation.value || buscandoEndereco.value)
  const bloqueada = computed(() => salvando.value || !editando.value || sessao.tipo !== 'empresa')
  const label = (local) => [local?.cidade, local?.uf].filter(Boolean).join(' — ')
  let operacao = 0,
    ativa = true
  function interromper() {
    operacao++
    cancelCurrentLocation()
    buscandoEndereco.value = false
    erroLocalizacao.value = ''
  }
  function reiniciar() {
    interromper()
    confirmada.value = null
  }
  async function usarLocalizacaoAtual() {
    if (bloqueada.value || gpsOcupado.value) return
    interromper()
    const numero = operacao,
      revisao = sessao.revisao
    const atual = () =>
      ativa && numero === operacao && revisao === sessao.revisao && !bloqueada.value
    const capturada = await requestCurrentLocation()
    if (!capturada || !atual()) return
    buscandoEndereco.value = true
    try {
      const endereco = await geocodingApi.reverse(capturada.latitude, capturada.longitude)
      if (!atual()) return
      if (
        typeof endereco?.cidade !== 'string' ||
        !endereco.cidade.trim() ||
        endereco.cidade.length > 100 ||
        !ufs.includes(endereco.uf)
      ) {
        erroLocalizacao.value =
          'Não foi possível identificar uma cidade brasileira. Tente obter a localização novamente.'
        return
      }
      form.value.cidade = endereco.cidade.trim()
      form.value.uf = endereco.uf
      confirmada.value = { cidade: form.value.cidade, uf: endereco.uf }
      // A empresa persiste somente cidade/UF; libera a posição precisa em memória.
      cancelCurrentLocation()
    } catch {
      if (atual())
        erroLocalizacao.value = 'Não foi possível identificar sua cidade. Tente novamente.'
    } finally {
      if (atual()) buscandoEndereco.value = false
    }
  }
  function remover() {
    if (bloqueada.value) return
    interromper()
    form.value.cidade = form.value.uf = ''
    confirmada.value = { cidade: '', uf: '' }
  }
  function descartar() {
    if (bloqueada.value) return
    form.value.cidade = perfil.value?.cidade || ''
    form.value.uf = perfil.value?.uf || ''
    reiniciar()
  }
  function validar() {
    return gpsOcupado.value ? 'Aguarde a localização atual antes de salvar o perfil.' : ''
  }
  watch(editando, reiniciar, { flush: 'sync' })
  watch(() => sessao.revisao, reiniciar, { flush: 'sync' })
  onUnmounted(() => {
    ativa = false
    reiniciar()
  })
  return {
    confirmada,
    loadingLocation,
    locationError,
    buscandoEndereco,
    erroLocalizacao,
    gpsOcupado,
    bloqueada,
    label,
    usarLocalizacaoAtual,
    remover,
    descartar,
    validar,
  }
}
