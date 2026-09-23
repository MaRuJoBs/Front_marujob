import api from './api'

// Login
export async function login(email, password) {
  const response = await api.post('token/', {
    email,
    password,
  })

  return response.data
}

export async function loginComGoogle(credential, tipo, cadastro = false) {
  const response = await api.post('auth/google/', {
    credential,
    tipo,
    cadastro,
  })

  return response.data
}

export async function registrar(formData) {
  const response = await api.post(
    'registro/',
    formData,
    {
      transformRequest: [(data, headers) => {
        delete headers.Authorization
        return data
      }]
    }
  )

  return response.data
}

