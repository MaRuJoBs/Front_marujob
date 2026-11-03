import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useRecursoPrivado } from '@/composables/useRecursoPrivado'
import { usePerfilImagem } from '@/composables/usePerfilImagem'
import { consultarProjeto, salvarProjeto as gravar } from '@/services/perfilPortfolioService'
import { validarLista, linkSeguro, errosCampos } from '@/utils/perfilPortfolio'
export function useProjetoFormulario() {
  const route = useRoute(),
    router = useRouter()
  const titulo = ref(''),
    categoria = ref(''),
    descricao = ref(''),
    link = ref(''),
    tags = ref([]),
    novaTag = ref(''),
    editando = ref(false),
    pronto = ref(false),
    salvando = ref(false),
    mostrarSucesso = ref(false),
    camposErro = ref({}),
    projetoSalvo = ref(null)
  const foto = usePerfilImagem()
  let envio = 0
  function limpar() {
    envio++
    titulo.value = categoria.value = descricao.value = link.value = novaTag.value = ''
    tags.value = []
    foto.carregarImagem(null)
    pronto.value = false
    salvando.value = false
    mostrarSucesso.value = false
    camposErro.value = {}
    projetoSalvo.value = null
  }
  const recurso = useRecursoPrivado(limpar)
  function preencher(p) {
    titulo.value = p.titulo || ''
    categoria.value = p.categoria || ''
    descricao.value = p.descricao || ''
    link.value = p.link || ''
    tags.value = Array.isArray(p.tags) ? [...p.tags] : []
    foto.carregarImagem(p.imagem)
    pronto.value = true
  }
  function carregarProjeto() {
    recurso.invalidar()
    editando.value = Boolean(route.params.id)
    if (!editando.value) {
      pronto.value = true
      return
    }
    return recurso.executar((config) => consultarProjeto(route.params.id, config), preencher)
  }
  function adicionarTag() {
    const valor = novaTag.value.trim()
    const erro = validarLista([...tags.value, valor])
    camposErro.value.tags = erro
    if (!erro) {
      tags.value.push(valor)
      novaTag.value = ''
    }
  }
  async function salvarProjeto() {
    if (salvando.value || !pronto.value || mostrarSucesso.value) return
    const id = route.params.id
    const dados = {
      titulo: titulo.value.trim(),
      categoria: categoria.value.trim(),
      descricao: descricao.value,
      link: link.value.trim(),
      tags: [...tags.value],
    }
    camposErro.value = {}
    if (!dados.titulo || dados.titulo.length > 255)
      camposErro.value.titulo = 'Informe um título com até 255 caracteres.'
    if (!dados.categoria || dados.categoria.length > 100)
      camposErro.value.categoria = 'Informe uma categoria com até 100 caracteres.'
    if (!dados.descricao.trim()) camposErro.value.descricao = 'Informe a descrição.'
    if (dados.link && !linkSeguro(dados.link))
      camposErro.value.link = 'Informe um link HTTP ou HTTPS válido.'
    const erro = validarLista(dados.tags)
    if (erro) camposErro.value.tags = erro
    if (Object.keys(camposErro.value).length) return
    if (foto.imagem.value) dados.imagem = foto.imagem.value
    const envioAtual = ++envio
    salvando.value = true
    await recurso.executar(
      async (config) => {
        try {
          return await gravar(id, dados, config)
        } catch (e) {
          if (!config.signal.aborted) camposErro.value = errosCampos(e)
          throw e
        }
      },
      async (p, config) => {
        preencher(p)
        projetoSalvo.value = p.id
        mostrarSucesso.value = true
        try {
          const confirmado = await consultarProjeto(p.id, config)
          if (!config.signal.aborted) preencher(confirmado)
        } catch {
          if (!config.signal.aborted)
            recurso.erro.value =
              'Projeto salvo. Não foi possível verificar a persistência; consulte os detalhes.'
        }
      },
    )
    if (envioAtual === envio) salvando.value = false
  }
  watch(() => route.params.id, carregarProjeto, { immediate: true })
  return {
    titulo,
    categoria,
    descricao,
    link,
    tags,
    novaTag,
    editando,
    pronto,
    salvando,
    mostrarSucesso,
    camposErro,
    projetoSalvo,
    ...recurso,
    ...foto,
    preview: foto.previewImagem,
    adicionarTag,
    removerTag: (i) => tags.value.splice(i, 1),
    enterTag: (event) => {
      if (event.key === 'Enter') {
        event.preventDefault()
        adicionarTag()
      }
    },
    carregarProjeto,
    salvarProjeto,
    cancelar: () => router.push('/portfolio'),
  }
}
