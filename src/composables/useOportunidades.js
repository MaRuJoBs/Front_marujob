import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { listarOportunidades } from '../services/freelanceService.js'
import { parametrosOportunidades, erroOportunidades } from '../utils/oportunidades.js'
import { useFavoritosLocais } from './useFavoritosLocais.js'

export function useOportunidades() {
  const jobs = ref([])
  const { favoritos, erroFavorito, toggleFavorito } = useFavoritosLocais()
  const pesquisa = ref('')
  const filtros = ref({ tag: '', preco_min: '', preco_max: '' })
  const pagina = ref(1)
  const total = ref(0)
  const proxima = ref(false)
  const anterior = ref(false)
  const carregando = ref(false)
  const erro = ref('')
  let controlador
  let revisao = 0
  let timer
  async function carregar(page = 1) {
    clearTimeout(timer)
    const atual = ++revisao
    controlador?.abort()
    controlador = new AbortController()
    erro.value = ''
    jobs.value = []
    carregando.value = true
    try {
      const params = parametrosOportunidades({ ...filtros.value, search: pesquisa.value }, page)
      const data = await listarOportunidades(params, controlador.signal)
      if (atual !== revisao) return
      jobs.value = data.results
      total.value = data.count
      pagina.value = page
      proxima.value = Boolean(data.next)
      anterior.value = Boolean(data.previous)
    } catch (e) {
      if (atual === revisao) erro.value = erroOportunidades(e)
    } finally {
      if (atual === revisao) carregando.value = false
    }
  }
  watch(pesquisa, () => {
    controlador?.abort()
    ++revisao
    jobs.value = []
    carregando.value = true
    clearTimeout(timer)
    timer = setTimeout(() => carregar(1), 350)
  })
  function aplicar(f) {
    filtros.value = f
    carregar(1)
  }
  function limpar() {
    aplicar({ tag: '', preco_min: '', preco_max: '' })
  }
  onMounted(() => carregar())
  onBeforeUnmount(() => {
    ++revisao
    clearTimeout(timer)
    controlador?.abort()
  })

  return {
    jobs,
    favoritos,
    erroFavorito,
    pesquisa,
    filtros,
    pagina,
    total,
    proxima,
    anterior,
    carregando,
    erro,
    carregar,
    aplicar,
    limpar,
    toggleFavorito,
  }
}
