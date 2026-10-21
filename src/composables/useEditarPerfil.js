
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api'

import { usePerfilLocalizacao } from '@/composables/usePerfilLocalizacao'
import { usePerfilImagem } from '@/composables/usePerfilImagem'
import { usePerfilHabilidades } from '@/composables/usePerfilHabilidades'

export function useEditarPerfil() {
  const router = useRouter()

  const nome = ref('')
  const profissao = ref('')
  const sobre = ref('')
  const telefone = ref('')

  const localizacaoPerfil = usePerfilLocalizacao()
  const imagemPerfil = usePerfilImagem()
  const habilidadesPerfil = usePerfilHabilidades()

  const carregando = ref(true)
  const salvando = ref(false)
  const erro = ref('')
  const sucesso = ref('')

  const carregarPerfil = async () => {
    carregando.value = true
    erro.value = ''

    try {
      const response = await api.get('usuarios/me/')
      const user = response.data

      nome.value = user.name || ''
      profissao.value = user.profissao || ''
      sobre.value = user.sobre || ''
      telefone.value = user.telefone || ''

      localizacaoPerfil.carregarLocalizacao(user)
      imagemPerfil.carregarImagem(user.profile_image)
      habilidadesPerfil.carregarHabilidades(user.habilidades)
    } catch (error) {
      console.error('Erro ao carregar perfil:', error)
      erro.value = 'Não foi possível carregar seus dados.'
    } finally {
      carregando.value = false
    }
  }

  const validarPerfil = () => {
    if (!nome.value.trim()) return 'Informe seu nome.'
    if (!profissao.value.trim()) return 'Informe sua profissão.'
    if (!localizacaoPerfil.localizacao.value.trim()) {
      return 'Informe sua localização.'
    }
    if (!sobre.value.trim()) return 'Preencha o campo sobre você.'
    if (!telefone.value.trim()) return 'Informe seu telefone.'

    return null
  }

  const salvarPerfil = async () => {
    erro.value = ''
    sucesso.value = ''

    const erroValidacao = validarPerfil()

    if (erroValidacao) {
      erro.value = erroValidacao
      return
    }

    if (salvando.value) return

    salvando.value = true

    try {
      const dados = new FormData()

      dados.append('name', nome.value)
      dados.append('profissao', profissao.value)
      dados.append('localizacao', localizacaoPerfil.localizacao.value)

      const latitude = localizacaoPerfil.latitude.value
      const longitude = localizacaoPerfil.longitude.value
      const precisao = localizacaoPerfil.precisao.value
      const dataLocalizacao = localizacaoPerfil.dataLocalizacao.value

      dados.append('latitude', latitude ?? '')
      dados.append('longitude', longitude ?? '')
      dados.append('geolocation_accuracy', precisao ?? '')
      dados.append('geolocation_timestamp', dataLocalizacao ?? '')

      dados.append('sobre', sobre.value)
      dados.append('telefone', telefone.value)

      dados.append(
        'habilidades',
        JSON.stringify(habilidadesPerfil.habilidades.value)
      )

      if (imagemPerfil.imagem.value) {
        dados.append('profile_image', imagemPerfil.imagem.value)
      }

      const response = await api.patch('usuarios/me/', dados)

      console.log('PERFIL ATUALIZADO:', response.data)

      sucesso.value = 'Perfil atualizado com sucesso!'

      setTimeout(() => {
        router.push('/perfil')
      }, 800)
    } catch (error) {
      console.error('Erro ao salvar perfil:', error)

      if (error.response?.data) {
        console.error('ERRO DA API:', error.response.data)
      }

      erro.value = 'Não foi possível salvar seu perfil.'
    } finally {
      salvando.value = false
    }
  }

  const voltar = () => {
    router.push('/perfil')
  }

  onMounted(carregarPerfil)

  return {
    nome,
    profissao,
    sobre,
    telefone,

    ...localizacaoPerfil,
    ...imagemPerfil,
    ...habilidadesPerfil,

    carregando,
    salvando,
    erro,
    sucesso,

    carregarPerfil,
    salvarPerfil,
    voltar,
  }
}
