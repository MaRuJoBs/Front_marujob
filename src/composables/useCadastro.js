import { ref, computed, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { registrar, login, paginaInicial } from '../services/authService.js'
import { mensagensErro, emailValido } from '../utils/authErrors.js'
import { useGoogleAuth } from './useGoogleAuth.js'

export function useCadastro(tipo) {
  const router = useRouter()
  const name = ref('')
  const email = ref('')
  const senha = ref('')
  const confirmarSenha = ref('')
  const loading = ref(false)
  const imagem = ref(null)
  const preview = ref(null)
  const erros = ref([])
  const contaCriada = ref(false)
  const google = useGoogleAuth({
    tipo,
    cadastro: true,
    ocupado: loading,
    onSuccess: () => router.replace(paginaInicial()),
    onError: (mensagens) => {
      erros.value = mensagens
    },
  })
  const ocupado = computed(() => loading.value || google.googleLoading.value)

  const criarConta = async () => {
    if (ocupado.value || contaCriada.value) return
    erros.value = []
    if (!name.value.trim()) erros.value.push('Nome é obrigatório.')
    if (!emailValido(email.value)) erros.value.push('Informe um e-mail válido.')
    if (senha.value.length < 8) erros.value.push('A senha deve ter pelo menos 8 caracteres.')
    if (senha.value !== confirmarSenha.value) erros.value.push('As senhas não coincidem.')
    if (erros.value.length) return

    loading.value = true
    try {
      const formData = new FormData()
      formData.append('name', name.value.trim())
      formData.append('email', email.value.trim())
      formData.append('password', senha.value)
      formData.append('tipo', tipo)
      if (imagem.value) formData.append('profile_image', imagem.value)
      await registrar(formData)
      contaCriada.value = true
      await login(email.value, senha.value)
      await router.replace(paginaInicial())
    } catch (error) {
      erros.value = mensagensErro(error, 'Não foi possível criar sua conta.')
      if (contaCriada.value)
        erros.value.unshift(
          'Sua conta foi criada. Use Entrar para tentar acessar sua conta novamente.',
        )
    } finally {
      loading.value = false
    }
  }

  function handleImageChange(event) {
    const file = event.target.files[0]
    if (!file) return
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      erros.value = ['Selecione uma imagem JPEG, PNG ou WebP.']
      event.target.value = ''
      return
    }
    if (preview.value) URL.revokeObjectURL(preview.value)
    imagem.value = file
    preview.value = URL.createObjectURL(file)
  }

  onBeforeUnmount(() => {
    if (preview.value) URL.revokeObjectURL(preview.value)
  })
  return {
    name,
    email,
    senha,
    confirmarSenha,
    loading,
    preview,
    erros,
    contaCriada,
    ocupado,
    criarConta,
    handleImageChange,
    ...google,
  }
}
