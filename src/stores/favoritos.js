import { computed, onScopeDispose, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { sessao } from '../services/authSession.js'
import { obterOportunidade } from '../services/freelanceService.js'
import { erroOportunidades } from '../utils/oportunidades.js'

export function normalizarIdFavorito(valor) {
  if (!['number', 'string'].includes(typeof valor) || !/^\d+$/.test(String(valor).trim()))
    return null
  const id = Number(valor)
  return Number.isSafeInteger(id) && id > 0 ? id : null
}

export const chaveFavoritosUsuario = (id) => `marujobs:favoritos:usuario:${id}`
const validadeCache = 60_000

export const useFavoritosStore = defineStore('favoritos', () => {
  const ids = ref([])
  const erroFavorito = ref('')
  const cache = ref({})
  const chave = computed(() => {
    const id = normalizarIdFavorito(sessao.usuario?.id)
    return sessao.tipo === 'usuario' && id !== null ? chaveFavoritosUsuario(id) : null
  })
  const favoritos = computed(() => ids.value)
  let leituraDisponivel = false
  const pendentes = new Map()
  const fila = []
  let ativas = 0

  function invalidar(id) {
    pendentes.get(id)?.controlador.abort()
    pendentes.delete(id)
    delete cache.value[id]
  }

  function carregarFavoritos() {
    erroFavorito.value = ''
    leituraDisponivel = false
    if (!chave.value) {
      ids.value = []
      return
    }
    let salvo
    try {
      salvo = localStorage.getItem(chave.value)
    } catch {
      ids.value = []
      erroFavorito.value = 'Não foi possível ler seus favoritos neste navegador. Tente novamente.'
      return
    }
    let recuperados = []
    try {
      const dados = JSON.parse(salvo || '[]')
      if (!Array.isArray(dados)) throw new Error('Formato inválido')
      recuperados = [...new Set(dados.map(normalizarIdFavorito).filter((id) => id !== null))]
    } catch {
      erroFavorito.value =
        'Os favoritos salvos neste navegador estão corrompidos. Você pode salvar novas oportunidades.'
    }
    for (const id of ids.value) if (!recuperados.includes(id)) invalidar(id)
    ids.value = recuperados
    leituraDisponivel = true
  }

  function ehFavorito(id) {
    return ids.value.includes(normalizarIdFavorito(id))
  }

  function alterar(id, adicionar) {
    id = normalizarIdFavorito(id)
    if (id === null) {
      erroFavorito.value = 'Esta oportunidade não possui um identificador válido.'
      return false
    }
    if (!chave.value) {
      erroFavorito.value = 'Entre com sua conta de freelancer para salvar oportunidades.'
      return false
    }
    if (!leituraDisponivel) carregarFavoritos()
    if (!leituraDisponivel) return false
    const atualizados = adicionar
      ? [...new Set([...ids.value, id])]
      : ids.value.filter((atual) => atual !== id)
    try {
      // Só confirma visualmente após a escrita síncrona; falhas preservam o estado anterior.
      localStorage.setItem(chave.value, JSON.stringify(atualizados))
      ids.value = atualizados
      if (!adicionar) invalidar(id)
      erroFavorito.value = ''
      return true
    } catch {
      erroFavorito.value =
        'Não foi possível salvar seus favoritos neste navegador. Tente novamente.'
      return false
    }
  }

  const adicionarFavorito = (id) => alterar(id, true)
  const removerFavorito = (id) => alterar(id, false)
  const toggleFavorito = (jobOuId) => {
    const id = typeof jobOuId === 'object' && jobOuId !== null ? jobOuId.id : jobOuId
    return alterar(id, !ehFavorito(id))
  }

  async function executar(tarefa) {
    const { id, controlador, conta } = tarefa
    const atual = () => pendentes.get(id) === tarefa && chave.value === conta && ehFavorito(id)
    try {
      if (!atual()) return
      const job = await obterOportunidade(id, controlador.signal)
      if (!atual()) return
      if (normalizarIdFavorito(job.id) !== id)
        throw new Error('A API retornou uma oportunidade diferente da solicitada.')
      cache.value[id] = { id, job, status: 'disponivel', atualizado: Date.now() }
    } catch (error) {
      if (!atual()) return
      const indisponivel = [404, 410].includes(error.response?.status)
      cache.value[id] = {
        id,
        status: indisponivel ? 'indisponivel' : 'erro',
        erro: indisponivel
          ? 'Esta oportunidade não está mais disponível. Você pode removê-la dos favoritos.'
          : erroOportunidades(error, true),
        atualizado: Date.now(),
      }
    } finally {
      if (pendentes.get(id) === tarefa) pendentes.delete(id)
      tarefa.resolver()
    }
  }

  function executarFila() {
    while (ativas < 4 && fila.length) {
      const tarefa = fila.shift()
      ativas++
      executar(tarefa).finally(() => {
        ativas--
        executarFila()
      })
    }
  }

  function carregarOportunidades({ recarregar = false } = {}) {
    const consultas = ids.value.map((id) => {
      if (pendentes.has(id)) return pendentes.get(id).promise
      const salvo = cache.value[id]
      if (!recarregar && salvo && Date.now() - salvo.atualizado < validadeCache)
        return Promise.resolve()
      const tarefa = { id, conta: chave.value, controlador: new AbortController() }
      tarefa.promise = new Promise((resolve) => {
        tarefa.resolver = resolve
      })
      pendentes.set(id, tarefa)
      cache.value[id] = { id, status: 'carregando' }
      fila.push(tarefa)
      return tarefa.promise
    })
    executarFila()
    return Promise.all(consultas)
  }

  const oportunidadesFavoritas = computed(() =>
    ids.value.map((id) => cache.value[id] || { id, status: 'carregando' }),
  )
  const carregando = computed(() =>
    oportunidadesFavoritas.value.some((item) => item.status === 'carregando'),
  )

  watch(
    () => [chave.value, sessao.revisao],
    () => {
      for (const id of pendentes.keys()) invalidar(id)
      for (const tarefa of fila.splice(0)) tarefa.resolver()
      cache.value = {}
      ids.value = []
      carregarFavoritos()
    },
    { immediate: true, flush: 'sync' },
  )

  const sincronizarArmazenamento = (event) => {
    if (chave.value && (event.key === chave.value || event.key === null)) carregarFavoritos()
  }
  globalThis.window?.addEventListener('storage', sincronizarArmazenamento)
  onScopeDispose(() => {
    globalThis.window?.removeEventListener('storage', sincronizarArmazenamento)
    for (const id of pendentes.keys()) invalidar(id)
    for (const tarefa of fila.splice(0)) tarefa.resolver()
  })

  return {
    favoritos,
    erroFavorito,
    ehFavorito,
    adicionarFavorito,
    removerFavorito,
    toggleFavorito,
    carregarFavoritos,
    carregarOportunidades,
    oportunidadesFavoritas,
    carregando,
  }
})
