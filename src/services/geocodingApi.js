
import { extractAddressLabel } from '@/utils/location'

const REVERSE_URL = 'https://nominatim.openstreetmap.org/reverse'
const SEARCH_URL = 'https://nominatim.openstreetmap.org/search'

const geocodingApi = {
  // Identifica a cidade utilizando as coordenadas do GPS
  async reverse(latitude, longitude) {
    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude)
    ) {
      throw new Error('Coordenadas inválidas.')
    }

    const params = new URLSearchParams({
      format: 'jsonv2',
      lat: String(latitude),
      lon: String(longitude),
      zoom: '10',
      addressdetails: '1',
      'accept-language': 'pt-BR',
    })

    const response = await fetch(
      `${REVERSE_URL}?${params.toString()}`
    )

    if (!response.ok) {
      throw new Error('Não foi possível consultar o endereço.')
    }

    const result = await response.json()

    return {
      label: extractAddressLabel(result),
      displayName: result.display_name ?? null,
    }
  },

  // Pesquisa cidades manualmente
  async search(cidade) {
    const termo = cidade.trim()

    if (termo.length < 3) {
      throw new Error('Digite pelo menos 3 caracteres.')
    }

    const params = new URLSearchParams({
      q: `${termo}, Brasil`,
      format: 'jsonv2',
      addressdetails: '1',
      countrycodes: 'br',
      limit: '10',
      'accept-language': 'pt-BR',
    })

    const response = await fetch(
      `${SEARCH_URL}?${params.toString()}`
    )

    if (!response.ok) {
      throw new Error('Não foi possível buscar as cidades.')
    }

    const resultados = await response.json()

    return resultados
      .map((resultado) => ({
        nome: extractAddressLabel(resultado),
        latitude: Number(resultado.lat),
        longitude: Number(resultado.lon),
      }))
      .filter(
        (resultado) =>
          resultado.nome &&
          Number.isFinite(resultado.latitude) &&
          Number.isFinite(resultado.longitude)
      )
  },
}

export default geocodingApi
