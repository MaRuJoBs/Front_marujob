import api from './api.js'

export async function obterChaveVapid(config) {
  const { data } = await api.get('push/vapid-public-key/', { ...config, skipAuth: true })
  return data.publicKey
}

export const registrarSubscription = (subscription, config) =>
  api.post('push/subscriptions/', subscription.toJSON(), config)

export const removerSubscription = (endpoint, config) =>
  api.delete('push/subscriptions/', { ...config, data: { endpoint } })
