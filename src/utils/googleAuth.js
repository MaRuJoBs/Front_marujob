const esperarGoogle = () => {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) {
      resolve()
      return
    }

    const inicio = Date.now()

    const intervalo = setInterval(() => {
      if (window.google?.accounts?.id) {
        clearInterval(intervalo)
        resolve()
      }

      if (Date.now() - inicio > 10000) {
        clearInterval(intervalo)
        reject(new Error('Google não carregou'))
      }
    }, 100)
  })
}

export const configurarGoogle = async (buttonElement, callback) => {
  await esperarGoogle()

  window.google.accounts.id.initialize({
    client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
    callback,
  })

  if (buttonElement) {
    window.google.accounts.id.renderButton(buttonElement, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      text: 'continue_with',
      shape: 'rect',
      width: 300,
    })
  }
}