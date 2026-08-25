import api from './api'

// Login
export async function login(email, password) {
  const response = await api.post('token/', {
    email,
    password,
  })

  return response.data
}

// Cadastro
// export async function registrar(formData) {
//   const response = await api.post('registro/', formData, {
//     headers: {
//       'Content-Type': 'multipart/form-data',
//     },
//   })

//   return response.data
// }
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