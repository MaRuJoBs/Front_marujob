import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePerfilLocalizacao } from '@/composables/usePerfilLocalizacao'
import { usePerfilImagem } from '@/composables/usePerfilImagem'
import { usePerfilHabilidades } from '@/composables/usePerfilHabilidades'
import { useRecursoPrivado } from '@/composables/useRecursoPrivado'
import { consultarPerfil, atualizarPerfil } from '@/services/perfilPortfolioService'
import { sessao } from '@/services/authSession'
import { obterFotoGoogle } from '@/services/fotoGoogle'
import { validarLista, errosCampos } from '@/utils/perfilPortfolio'
export function useEditarPerfil() {
  const router = useRouter()
  const nome = ref(''),
    profissao = ref(''),
    sobre = ref(''),
    telefone = ref('')
  const local = usePerfilLocalizacao(),
    foto = usePerfilImagem(),
    habilidades = usePerfilHabilidades()
  const pronto = ref(false),
    salvando = ref(false),
    sucesso = ref(''),
    camposErro = ref({})
  let envio = 0
  let fotoAlternativa = null
  function limpar() {
    envio++
    fotoAlternativa = null
    nome.value = profissao.value = sobre.value = telefone.value = sucesso.value = ''
    local.carregarLocalizacao({})
    foto.carregarImagem(null)
    habilidades.carregarHabilidades([])
    pronto.value = false
    salvando.value = false
    camposErro.value = {}
  }
  const recurso = useRecursoPrivado(limpar)
  function preencher(user) {
    nome.value = user.name || ''
    profissao.value = user.profissao || ''
    sobre.value = user.sobre || ''
    telefone.value = user.telefone || ''
    local.carregarLocalizacao(user)
    fotoAlternativa = obterFotoGoogle(user.id)
    foto.carregarImagem(user.profile_image || fotoAlternativa)
    habilidades.carregarHabilidades(user.habilidades)
    pronto.value = true
  }
  const carregarPerfil = () => recurso.executar(consultarPerfil, preencher)
  async function salvarPerfil() {
    if (salvando.value || !pronto.value) return
    const dados = {
      name: nome.value,
      profissao: profissao.value,
      sobre: sobre.value,
      telefone: telefone.value,
      localizacao: local.localizacao.value,
      latitude: local.latitude.value,
      longitude: local.longitude.value,
      geolocation_accuracy: local.precisao.value,
      geolocation_timestamp: local.dataLocalizacao.value,
      habilidades: [...habilidades.habilidades.value],
    }
    camposErro.value = {}
    for (const [k, max] of Object.entries({
      name: 255,
      profissao: 255,
      localizacao: 255,
      telefone: 30,
    }))
      if (dados[k].length > max) camposErro.value[k] = `Use até ${max} caracteres.`
    const listaErro = validarLista(dados.habilidades)
    if (listaErro) camposErro.value.habilidades = listaErro
    if (
      dados.latitude !== null &&
      (!Number.isFinite(Number(dados.latitude)) || Math.abs(Number(dados.latitude)) > 90)
    )
      camposErro.value.localizacao = 'Latitude inválida.'
    if (
      dados.longitude !== null &&
      (!Number.isFinite(Number(dados.longitude)) || Math.abs(Number(dados.longitude)) > 180)
    )
      camposErro.value.localizacao = 'Longitude inválida.'
    if (
      dados.geolocation_accuracy !== null &&
      (!Number.isFinite(Number(dados.geolocation_accuracy)) ||
        Number(dados.geolocation_accuracy) < 0)
    )
      camposErro.value.localizacao = 'Precisão inválida.'
    if (dados.geolocation_timestamp && !Number.isFinite(Date.parse(dados.geolocation_timestamp)))
      camposErro.value.localizacao = 'Data de localização inválida.'
    if (Object.keys(camposErro.value).length) return
    if (foto.imagem.value) dados.profile_image = foto.imagem.value
    const envioAtual = ++envio
    salvando.value = true
    sucesso.value = ''
    await recurso.executar(
      async (config) => {
        try {
          return await atualizarPerfil(dados, config)
        } catch (e) {
          if (!config.signal.aborted) camposErro.value = errosCampos(e)
          throw e
        }
      },
      async (user, config) => {
        preencher(user)
        sessao.usuario = user
        sucesso.value = 'Perfil atualizado com sucesso.'
        try {
          const confirmado = await consultarPerfil(config)
          if (!config.signal.aborted) {
            preencher(confirmado)
            sessao.usuario = confirmado
          }
        } catch {
          if (!config.signal.aborted)
            sucesso.value =
              'Perfil salvo. Não foi possível verificar a persistência; consulte novamente.'
        }
      },
    )
    if (envioAtual === envio) salvando.value = false
  }
  function falhaImagemPerfil() {
    if (foto.imagem.value) return
    const alternativa = foto.previewImagem.value !== fotoAlternativa ? fotoAlternativa : null
    fotoAlternativa = null
    foto.carregarImagem(alternativa)
  }
  onMounted(carregarPerfil)
  return {
    nome,
    profissao,
    sobre,
    telefone,
    ...local,
    ...foto,
    ...habilidades,
    ...recurso,
    pronto,
    salvando,
    sucesso,
    camposErro,
    carregarPerfil,
    salvarPerfil,
    falhaImagemPerfil,
    voltar: () => router.push('/perfil'),
  }
}
