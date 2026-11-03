import { ref, watch, onUnmounted } from 'vue'
import { sessao } from '../services/authSession.js'
import { mensagemErro } from '../utils/perfilPortfolio.js'

export function useRecursoPrivado(limpar) {
  const carregando = ref(false),
    erro = ref('')
  let sequencia = 0,
    controller
  function invalidar() {
    sequencia++
    controller?.abort()
    limpar()
    carregando.value = false
    erro.value = ''
  }
  watch(() => sessao.revisao, invalidar, { flush: 'sync' })
  onUnmounted(invalidar)
  async function executar(operacao, aplicar) {
    controller?.abort()
    controller = new AbortController()
    const numero = ++sequencia,
      revisao = sessao.revisao
    const atual = () => numero === sequencia && revisao === sessao.revisao
    carregando.value = true
    erro.value = ''
    try {
      const resultado = await operacao({ signal: controller.signal })
      if (atual()) await aplicar(resultado, { signal: controller.signal })
    } catch (e) {
      if (atual() && e.code !== 'ERR_CANCELED') erro.value = mensagemErro(e)
    } finally {
      if (atual()) carregando.value = false
    }
  }
  return { carregando, erro, executar, invalidar }
}
