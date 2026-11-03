import { ref, watch, onUnmounted } from 'vue'
import { sessao } from '@/services/authSession'
import { useGeolocation } from '@/composables/useGeolocation'
import geocodingApi from '@/services/geocodingApi'

export function usePerfilLocalizacao() {
  let operacao = 0,
    busca = 0,
    ativo = true
  const invalidar = () => {
    operacao++
    busca++
    resultadosCidades.value = []
    pesquisaCidade.value = ''
    buscandoCidades.value = false
    buscandoEndereco.value = false
  }
  watch(() => sessao.revisao, invalidar, { flush: 'sync' })
  onUnmounted(() => {
    ativo = false
    invalidar()
  })
  const localizacao = ref('')

  const latitude = ref(null)
  const longitude = ref(null)
  const precisao = ref(null)
  const dataLocalizacao = ref(null)

  const localizacaoConfirmada = ref(false)
  const buscandoEndereco = ref(false)

  const pesquisaCidade = ref('')
  const resultadosCidades = ref([])
  const buscandoCidades = ref(false)
  const erroBuscaCidade = ref('')
  const erroLocalizacao = ref('')

  const { loadingLocation, locationError, requestCurrentLocation } = useGeolocation()

  // Carrega a localização salva no perfil
  const carregarLocalizacao = (user) => {
    invalidar()
    localizacao.value = user.localizacao || ''
    latitude.value = user.latitude ?? null
    longitude.value = user.longitude ?? null
    precisao.value = user.geolocation_accuracy ?? null
    dataLocalizacao.value = user.geolocation_timestamp ?? null

    localizacaoConfirmada.value = Boolean(localizacao.value)
  }

  // Obtém a localização atual pelo GPS
  const usarLocalizacaoAtual = async () => {
    const numero = ++operacao,
      revisao = sessao.revisao
    const atual = () => ativo && numero === operacao && revisao === sessao.revisao
    erroLocalizacao.value = ''

    const capturada = await requestCurrentLocation()

    if (!capturada || !atual()) return

    buscandoEndereco.value = true

    try {
      const endereco = await geocodingApi.reverse(capturada.latitude, capturada.longitude)

      if (!atual()) return
      if (!endereco?.label) {
        erroLocalizacao.value = 'Não foi possível identificar sua cidade.'
        return
      }

      localizacao.value = endereco.label
      latitude.value = capturada.latitude
      longitude.value = capturada.longitude
      precisao.value = capturada.accuracy
      dataLocalizacao.value = new Date(capturada.timestamp).toISOString()

      localizacaoConfirmada.value = true
    } catch (error) {
      if (!atual()) return

      erroLocalizacao.value = 'Não foi possível identificar sua cidade. Tente novamente.'
    } finally {
      if (atual()) buscandoEndereco.value = false
    }
  }

  // Busca cidades manualmente
  const buscarCidades = async () => {
    const numero = ++busca,
      revisao = sessao.revisao
    const atual = () => ativo && numero === busca && revisao === sessao.revisao
    erroBuscaCidade.value = ''
    resultadosCidades.value = []

    if (pesquisaCidade.value.trim().length < 3) {
      erroBuscaCidade.value = 'Digite pelo menos 3 caracteres.'
      return
    }

    buscandoCidades.value = true

    try {
      const resultados = await geocodingApi.search(pesquisaCidade.value)

      if (!atual()) return
      resultadosCidades.value = resultados

      if (resultados.length === 0) {
        erroBuscaCidade.value = 'Nenhuma cidade encontrada.'
      }
    } catch (error) {
      if (!atual()) return

      erroBuscaCidade.value = 'Não foi possível buscar cidades. Tente novamente.'
    } finally {
      if (atual()) buscandoCidades.value = false
    }
  }

  // Seleciona uma cidade encontrada na pesquisa
  const selecionarCidade = (cidade) => {
    invalidar()
    localizacao.value = cidade.nome

    // A busca manual informa apenas a cidade.
    // Não representa a posição real do usuário.
    latitude.value = null
    longitude.value = null
    precisao.value = null
    dataLocalizacao.value = null

    localizacaoConfirmada.value = true

    pesquisaCidade.value = ''
    resultadosCidades.value = []
    erroBuscaCidade.value = ''
    erroLocalizacao.value = ''
  }

  return {
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
    carregarLocalizacao,
    usarLocalizacaoAtual,
    buscarCidades,
    selecionarCidade,
  }
}
