import api from './api.js'

const recurso = 'notificacoes-freelancer/'

export async function listarNotificacoesFreelancer(config, pagina = 1) {
  const { data } = await api.get(recurso, { ...config, params: { page: pagina } })
  return data
}

export async function contarNaoLidas(config) {
  const { data } = await api.get(recurso, { ...config, params: { lida: false } })
  return data.count
}

export async function marcarLeituraFreelancer(config, id) {
  if (id == null) {
    await api.post(`${recurso}marcar-todas-lidas/`, undefined, config)
  } else {
    await api.patch(`${recurso}${id}/marcar-lida/`, undefined, config)
  }
}
