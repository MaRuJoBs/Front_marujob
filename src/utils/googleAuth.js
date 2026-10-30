// Preserva a inicialização também durante atualizações do Vite (HMR).
const estado = import.meta.hot?.data.googleAuth || {
  sdk: null,
  clientId: null,
  callback: null,
  carregamento: null,
}
if (import.meta.hot) import.meta.hot.data.googleAuth = estado

const SCRIPT_URL = 'https://accounts.google.com/gsi/client'

// O carregamento pertence à aplicação, e não ao tempo de montagem de uma tela.
// Falhas liberam a promise para permitir outra tentativa sem recarregar a página.
export function carregarGoogle({ timeoutMs = 20000 } = {}) {
  if (window.google?.accounts?.id) return Promise.resolve(window.google.accounts.id)
  if (estado.carregamento) return estado.carregamento

  const carregamento = new Promise((resolve, reject) => {
    const existente = document.querySelector(`script[src="${SCRIPT_URL}"]`)
    const script = existente || document.createElement('script')
    let timer
    let intervalo

    const concluir = (error) => {
      clearTimeout(timer)
      clearInterval(intervalo)
      script.removeEventListener('load', carregado)
      script.removeEventListener('error', falhou)
      if (error) {
        script.remove()
        reject(error)
      } else {
        resolve(window.google.accounts.id)
      }
    }
    const carregado = () => {
      if (window.google?.accounts?.id) concluir()
      else falhou()
    }
    const falhou = () =>
      concluir(
        new Error(
          'Não foi possível carregar o Google. Verifique sua conexão ou bloqueadores e tente novamente.',
        ),
      )

    script.addEventListener('load', carregado, { once: true })
    script.addEventListener('error', falhou, { once: true })
    timer = setTimeout(falhou, timeoutMs)
    // Também aceita um script pré-existente cujo evento load já tenha ocorrido.
    intervalo = setInterval(() => {
      if (window.google?.accounts?.id) concluir()
    }, 100)

    if (!existente) {
      script.src = SCRIPT_URL
      script.async = true
      script.defer = true
      document.head.appendChild(script)
    }
  }).finally(() => {
    if (estado.carregamento === carregamento) estado.carregamento = null
  })
  estado.carregamento = carregamento
  return carregamento
}

export const configurarGoogle = async (buttonElement, callback, ativo = () => true) => {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim()
  if (!clientId) throw new Error('O acesso com Google ainda não foi configurado para este site.')
  const sdk = await carregarGoogle()
  if (!ativo()) return false
  if (!buttonElement?.isConnected)
    throw new Error('Não foi possível exibir o botão Google. Tente novamente.')

  estado.callback = callback
  // HMR pode manter o SDK vivo depois de trocar o Client ID da configuração.
  if (estado.sdk !== sdk || estado.clientId !== clientId) {
    sdk.initialize({
      client_id: clientId,
      callback: (response) => estado.callback?.(response),
      auto_select: false,
    })
    estado.sdk = sdk
    estado.clientId = clientId
  }

  sdk.renderButton(buttonElement, {
    type: 'standard',
    theme: 'outline',
    size: 'large',
    text: 'signin_with',
    locale: 'pt-BR',
    shape: 'rect',
    width: 300,
  })
  return true
}

export function desativarGoogle() {
  estado.callback = null
  window.google?.accounts?.id?.cancel()
}
