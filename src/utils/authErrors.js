const campos = {
  email: 'E-mail',
  password: 'Senha',
  senha: 'Senha',
  name: 'Nome',
  senha_atual: 'Senha atual',
  nova_senha: 'Nova senha',
  profile_image: 'Foto',
  tipo: 'Tipo de conta',
}

export function mensagensErro(error, fallback = 'Não foi possível concluir a operação.') {
  const data = error.response?.data
  if (data && typeof data === 'object') {
    const mensagens = Object.entries(data).flatMap(([campo, valor]) => {
      if (campo === 'code') return []
      const valores = Array.isArray(valor) ? valor : [valor]
      return valores
        .filter((item) => typeof item === 'string')
        .map((item) => (campos[campo] ? `${campos[campo]}: ${item}` : item))
    })
    if (mensagens.length) return mensagens
  }
  if (error.response?.status === 429)
    return ['Muitas tentativas. Aguarde um pouco e tente novamente.']
  if (error.response?.status >= 500)
    return ['O servidor está indisponível. Tente novamente em instantes.']
  if (!error.response && error.isAxiosError)
    return ['Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.']
  return [error.isAxiosError ? fallback : error.message || fallback]
}

export const emailValido = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
