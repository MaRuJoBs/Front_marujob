// Somente diagnóstico: ler claims não verifica a assinatura nem autentica a conta.
// Nunca inclui credential, assinatura, access/refresh, e-mail, nome ou sub.
export function resumirCredencialGoogle(credential, clientId, agora = Date.now()) {
  const resumo = { formatoJwt: false }
  if (typeof credential !== 'string') return resumo
  const partes = credential.split('.')
  if (partes.length !== 3 || partes.some((parte) => !/^[A-Za-z0-9_-]+$/.test(parte))) return resumo
  try {
    const payload = partes[1].replace(/-/g, '+').replace(/_/g, '/')
    const bytes = Uint8Array.from(atob(payload), (char) => char.charCodeAt(0))
    const claims = JSON.parse(new TextDecoder().decode(bytes))
    const audiencias = (Array.isArray(claims.aud) ? claims.aud : [claims.aud]).filter(
      (aud) => typeof aud === 'string' && /^[\w-]+\.apps\.googleusercontent\.com$/.test(aud),
    )
    return {
      formatoJwt: true,
      audience: audiencias,
      clientIdCompativel: audiencias.includes(clientId),
      emissorGoogle: ['accounts.google.com', 'https://accounts.google.com'].includes(claims.iss),
      emitidoHaSegundos: Number.isFinite(claims.iat) ? Math.floor(agora / 1000) - claims.iat : null,
      expiraEmSegundos: Number.isFinite(claims.exp) ? claims.exp - Math.floor(agora / 1000) : null,
    }
  } catch {
    return resumo
  }
}

export function diagnosticoFalhaGoogle(error, credential) {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim() || null
  const mensagem = error.response?.data?.error || error.response?.data?.detail || error.message
  return {
    etapa: error.authStage,
    status: error.response?.status || null,
    endpoint: error.config?.url?.split('?')[0] || null,
    api: import.meta.env.VITE_API_URL || '/api/',
    clientIdFrontend: clientId,
    credencialGoogle: resumirCredencialGoogle(credential, clientId),
    mensagem:
      typeof mensagem === 'string'
        ? mensagem
            .replace(/\b[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g, '[valor omitido]')
            .replace(/\S+@\S+/g, '[e-mail omitido]')
            .slice(0, 500)
        : 'A API não detalhou a falha.',
  }
}

export function registrarFalhaGoogle(error, credential) {
  if (import.meta.env.DEV) {
    console.warn(
      '[Google] Diagnóstico da autenticação (sem tokens):',
      JSON.stringify(diagnosticoFalhaGoogle(error, credential), null, 2),
    )
  }
}
