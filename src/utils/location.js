const estados = {
  Acre: 'AC',
  Alagoas: 'AL',
  Amapá: 'AP',
  Amazonas: 'AM',
  Bahia: 'BA',
  Ceará: 'CE',
  'Distrito Federal': 'DF',
  'Espírito Santo': 'ES',
  Goiás: 'GO',
  Maranhão: 'MA',
  'Mato Grosso': 'MT',
  'Mato Grosso do Sul': 'MS',
  'Minas Gerais': 'MG',
  Pará: 'PA',
  Paraíba: 'PB',
  Paraná: 'PR',
  Pernambuco: 'PE',
  Piauí: 'PI',
  'Rio de Janeiro': 'RJ',
  'Rio Grande do Norte': 'RN',
  'Rio Grande do Sul': 'RS',
  Rondônia: 'RO',
  Roraima: 'RR',
  'Santa Catarina': 'SC',
  'São Paulo': 'SP',
  Sergipe: 'SE',
  Tocantins: 'TO',
}

export function extractCityState(result) {
  const address = result?.address ?? {}

  if (address.country_code?.toLowerCase() !== 'br') {
    return null
  }

  const cidade = address.city || address.town || address.village || address.municipality

  const codigoEstado = address['ISO3166-2-lvl4']
  const siglaCodigo = codigoEstado?.match(/^BR-([A-Z]{2})$/)?.[1]

  const uf = siglaCodigo || estados[address.state]

  if (typeof cidade !== 'string' || !cidade.trim() || !Object.values(estados).includes(uf)) {
    return null
  }

  return { cidade: cidade.trim(), uf }
}

export function extractAddressLabel(result) {
  const local = extractCityState(result)
  return local ? `${local.cidade}, ${local.uf}` : null
}
