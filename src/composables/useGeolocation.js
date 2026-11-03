import { ref, watch, onUnmounted } from 'vue'
import { sessao } from '@/services/authSession'

export function useGeolocation() {
  const loadingLocation = ref(false)
  const locationError = ref('')
  const location = ref(null)
  let geracao = 0
  const limpar = () => {
    geracao++
    location.value = null
    locationError.value = ''
    loadingLocation.value = false
  }
  watch(() => sessao.revisao, limpar, { flush: 'sync' })
  onUnmounted(limpar)

  const isSupported = typeof navigator !== 'undefined' && 'geolocation' in navigator

  function requestCurrentLocation() {
    if (!isSupported) {
      locationError.value = 'Seu dispositivo não suporta geolocalização.'
      return Promise.resolve(null)
    }

    const atual = ++geracao
    loadingLocation.value = true
    locationError.value = ''

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (atual !== geracao) {
            resolve(null)
            return
          }
          location.value = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
          }

          loadingLocation.value = false
          resolve(location.value)
        },

        (error) => {
          if (atual !== geracao) {
            resolve(null)
            return
          }
          if (error.code === 1) {
            locationError.value = 'Você negou o acesso à localização.'
          } else if (error.code === 2) {
            locationError.value = 'Não foi possível identificar sua localização.'
          } else if (error.code === 3) {
            locationError.value = 'Tempo esgotado ao buscar localização.'
          } else {
            locationError.value = 'Erro ao obter localização.'
          }

          loadingLocation.value = false
          resolve(null)
        },

        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        },
      )
    })
  }

  return {
    isSupported,
    loadingLocation,
    locationError,
    location,
    requestCurrentLocation,
  }
}
