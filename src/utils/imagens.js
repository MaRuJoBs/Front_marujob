export function resolverImagem(caminho, baseURL = import.meta.env.VITE_API_URL || '/api/') {
  if (typeof caminho !== 'string' || !caminho.trim()) return null
  try {
    const origem = globalThis.location?.origin || 'http://localhost'
    const base = new URL(baseURL, origem)
    // Os arquivos de mídia ficam na origem da API, fora do prefixo /api/.
    const url = new URL(caminho.trim(), new URL('../', base))
    return ['http:', 'https:'].includes(url.protocol) && !url.username && !url.password
      ? url.href
      : null
  } catch {
    return null
  }
}
