
import { ref } from 'vue'
import { useGeolocation } from '@/composables/useGeolocation'
import geocodingApi from '@/services/geocodingApi'

export function usePerfilLocalizacao() {
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

  const {
    loadingLocation,
    locationError,
    requestCurrentLocation,
  } = useGeolocation()

  // Carrega a localização salva no perfil
  const carregarLocalizacao = (user) => {
    localizacao.value = user.localizacao || ''
    latitude.value = user.latitude ?? null
    longitude.value = user.longitude ?? null
    precisao.value = user.geolocation_accuracy ?? null
    dataLocalizacao.value = user.geolocation_timestamp ?? null

    localizacaoConfirmada.value = Boolean(localizacao.value)
  }

  // Obtém a localização atual pelo GPS
  const usarLocalizacaoAtual = async () => {
    erroLocalizacao.value = ''

    const capturada = await requestCurrentLocation()

    if (!capturada) return

    buscandoEndereco.value = true

    try {
      const endereco = await geocodingApi.reverse(
        capturada.latitude,
        capturada.longitude
      )

      if (!endereco?.label) {
        erroLocalizacao.value =
          'Não foi possível identificar sua cidade.'
        return
      }

      localizacao.value = endereco.label
      latitude.value = capturada.latitude
      longitude.value = capturada.longitude
      precisao.value = capturada.accuracy
      dataLocalizacao.value = new Date(
        capturada.timestamp
      ).toISOString()

      localizacaoConfirmada.value = true
    } catch (error) {
      console.error('Erro ao identificar endereço:', error)

      erroLocalizacao.value =
        'Não foi possível identificar sua cidade. Tente novamente.'
    } finally {
      buscandoEndereco.value = false
    }
  }

  // Busca cidades manualmente
  const buscarCidades = async () => {
    erroBuscaCidade.value = ''
    resultadosCidades.value = []

    if (pesquisaCidade.value.trim().length < 3) {
      erroBuscaCidade.value =
        'Digite pelo menos 3 caracteres.'
      return
    }

    buscandoCidades.value = true

    try {
      const resultados = await geocodingApi.search(
        pesquisaCidade.value
      )

      resultadosCidades.value = resultados

      if (resultados.length === 0) {
        erroBuscaCidade.value = 'Nenhuma cidade encontrada.'
      }
    } catch (error) {
      console.error('Erro ao buscar cidades:', error)

      erroBuscaCidade.value =
        'Não foi possível buscar cidades. Tente novamente.'
    } finally {
      buscandoCidades.value = false
    }
  }

  // Seleciona uma cidade encontrada na pesquisa
  const selecionarCidade = (cidade) => {
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
