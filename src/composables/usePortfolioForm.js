import { computed, ref, watch, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { sessao } from '../services/authSession.js'
import { obterPortfolio, salvarPortfolio, erroPortfolio } from '../services/portfolioService.js'
import { usePerfilImagem } from './usePerfilImagem.js'

export function usePortfolioForm() {
  const route = useRoute()
  const router = useRouter()
  const editando = computed(() => Boolean(route.params.id))
  const titulo = ref(''),
    categoria = ref(''),
    descricao = ref(''),
    link = ref('')
  const tags = ref([]),
    novaTag = ref('')
  const projetoCarregado = ref(false)
  const bloqueado = computed(() => editando.value && !projetoCarregado.value)
  const carregando = ref(false),
    salvando = ref(false),
    mostrarSucesso = ref(false),
    erro = ref('')
  const {
    imagem,
    previewImagem: preview,
    carregarImagem,
    selecionarImagem: selecionarArquivo,
  } = usePerfilImagem()
  let controlador,
    timer,
    revisao = 0

  function selecionarImagem(event) {
    const arquivo = event.target.files?.[0]
    if (arquivo && !arquivo.type.startsWith('image/')) {
      erro.value = 'Escolha um arquivo de imagem válido.'
      event.target.value = ''
      return
    }
    selecionarArquivo(event)
  }
  function adicionarTag() {
    const texto = novaTag.value.trim()
    if (texto && !tags.value.includes(texto)) tags.value.push(texto)
    novaTag.value = ''
  }
  const removerTag = (index) => tags.value.splice(index, 1)
  function enterTag(event) {
    if (event.key === 'Enter') {
      event.preventDefault()
      adicionarTag()
    }
  }

  async function carregarProjeto() {
    const atual = ++revisao
    controlador?.abort()
    clearTimeout(timer)
    controlador = new AbortController()
    titulo.value = categoria.value = descricao.value = link.value = novaTag.value = ''
    tags.value = []
    carregarImagem(null)
    erro.value = ''
    projetoCarregado.value = false
    salvando.value = mostrarSucesso.value = carregando.value = false
    if (!editando.value || !sessao.usuario) return
    carregando.value = true
    try {
      const projeto = await obterPortfolio(route.params.id, controlador.signal)
      if (atual !== revisao) return
      projetoCarregado.value = true
      titulo.value = projeto.titulo || ''
      categoria.value = projeto.categoria || ''
      descricao.value = projeto.descricao || ''
      link.value = projeto.link || ''
      tags.value = projeto.tags
      carregarImagem(projeto.imagem)
    } catch (error) {
      if (atual === revisao) erro.value = erroPortfolio(error)
    } finally {
      if (atual === revisao) carregando.value = false
    }
  }

  async function salvarProjeto() {
    if (salvando.value || carregando.value || mostrarSucesso.value || bloqueado.value) return
    erro.value = ''
    if (!sessao.usuario || sessao.tipo !== 'usuario') {
      erro.value = 'Entre com sua conta de freelancer para salvar o projeto.'
      return
    }
    if (!titulo.value.trim() || !categoria.value.trim() || !descricao.value.trim()) {
      erro.value = 'Preencha título, categoria e descrição do projeto.'
      return
    }
    if (titulo.value.trim().length > 255 || categoria.value.trim().length > 100) {
      erro.value = 'Use até 255 caracteres no título e 100 na categoria.'
      return
    }
    let endereco = link.value.trim()
    if (endereco) {
      if (!/^[a-z][a-z\d+.-]*:/i.test(endereco)) endereco = `https://${endereco}`
      try {
        const url = new URL(endereco)
        if (
          !['http:', 'https:'].includes(url.protocol) ||
          !url.hostname.includes('.') ||
          url.username ||
          url.password ||
          endereco.length > 200
        )
          throw new Error()
      } catch {
        erro.value = 'Informe um link HTTP ou HTTPS válido, com até 200 caracteres.'
        return
      }
    }
    adicionarTag()
    const dados = new FormData()
    dados.append('titulo', titulo.value.trim())
    dados.append('categoria', categoria.value.trim())
    dados.append('descricao', descricao.value.trim())
    dados.append('link', endereco)
    dados.append('tags', JSON.stringify(tags.value))
    if (imagem.value) dados.append('imagem', imagem.value)
    const atual = revisao
    const conta = sessao.revisao
    salvando.value = true
    try {
      await salvarPortfolio(editando.value ? route.params.id : null, dados)
      if (atual !== revisao || sessao.revisao !== conta) return
      mostrarSucesso.value = true
      timer = setTimeout(() => {
        if (atual === revisao && sessao.revisao === conta)
          router.push('/portfolio').catch(() => {
            erro.value = 'Projeto salvo. Abra seu portfólio para consultá-lo.'
          })
      }, 800)
    } catch (error) {
      if (atual === revisao && sessao.revisao === conta) erro.value = erroPortfolio(error)
    } finally {
      if (atual === revisao) salvando.value = false
    }
  }

  watch([() => route.params.id, () => sessao.usuario?.id, () => sessao.revisao], carregarProjeto, {
    immediate: true,
  })
  onBeforeUnmount(() => {
    revisao++
    controlador?.abort()
    clearTimeout(timer)
  })
  return {
    editando,
    bloqueado,
    titulo,
    categoria,
    descricao,
    link,
    tags,
    novaTag,
    preview,
    carregando,
    salvando,
    mostrarSucesso,
    erro,
    selecionarImagem,
    adicionarTag,
    removerTag,
    enterTag,
    carregarProjeto,
    salvarProjeto,
    cancelar: () => router.push('/portfolio'),
  }
}
