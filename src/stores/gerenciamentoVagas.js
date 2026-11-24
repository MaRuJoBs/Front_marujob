import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { sessao } from '../services/authSession.js'
import {
  capturarEmpresa,
  listarVagasEmpresa,
  excluirVaga,
  vagaPropria,
  mensagemErroVagas,
} from '../services/freelanceService.js'
import { listarCandidaturasEmpresa } from '../services/notificacoesService.js'
import { vagaAberta } from '../utils/vagaForm.js'

export const useGerenciamentoVagas = defineStore('gerenciamentoVagas', () => {
  const vagas = ref([])
  const carregando = ref(false)
  const erro = ref('')
  const sucesso = ref('')
  const selecionada = ref(null)
  const excluindo = ref(false)
  const erroExclusao = ref('')
  const aprovadosPorVaga = ref(null)
  const ultima = computed(
    () => vagas.value.find(vagaAberta) || null,
  )
  let consulta = 0
  watch(
    () => [sessao.revisao, sessao.usuario?.id, sessao.tipo],
    () => {
      consulta++
      vagas.value = []
      aprovadosPorVaga.value = null
      selecionada.value = null
      erro.value = sucesso.value = erroExclusao.value = ''
      carregando.value = excluindo.value = false
    },
    { flush: 'sync' },
  )
  async function carregar() {
    const numero = ++consulta
    const conta = capturarEmpresa()
    vagas.value = []
    aprovadosPorVaga.value = null
    erro.value = ''
    carregando.value = true
    try {
      const resultado = await listarVagasEmpresa()
      if (numero === consulta && conta.atual()) vagas.value = resultado
      if (resultado.length && numero === consulta && conta.atual()) {
        try {
          const candidaturas = await listarCandidaturasEmpresa()
          if (numero !== consulta || !conta.atual()) return
          const contagens = Object.fromEntries(resultado.map(({ id }) => [id, 0]))
          for (const { oportunidade, status } of candidaturas)
            if (status === 'aprovada' && Object.hasOwn(contagens, oportunidade))
              contagens[oportunidade]++
          aprovadosPorVaga.value = contagens
        } catch {
          // Não apresente a contagem como zero quando a consulta não foi confirmada.
        }
      }
    } catch (error) {
      if (numero === consulta && conta.atual()) erro.value = mensagemErroVagas(error)
    } finally {
      if (numero === consulta) carregando.value = false
    }
  }
  function pedirExclusao(vaga) {
    if (!excluindo.value && vagaPropria(vaga)) {
      selecionada.value = vaga
      erroExclusao.value = ''
    }
  }
  function cancelarExclusao() {
    if (!excluindo.value) selecionada.value = null
  }
  async function confirmarExclusao() {
    if (excluindo.value || !vagaPropria(selecionada.value)) return
    const vaga = selecionada.value
    const conta = capturarEmpresa()
    excluindo.value = true
    erroExclusao.value = ''
    try {
      await excluirVaga(vaga.id)
      if (!conta.atual()) return
      vagas.value = vagas.value.filter((item) => item.id !== vaga.id)
      selecionada.value = null
      sucesso.value = 'Vaga excluída com sucesso!'
    } catch (error) {
      if (conta.atual()) erroExclusao.value = mensagemErroVagas(error)
    } finally {
      if (conta.atual()) excluindo.value = false
    }
  }
  function registrarEdicao(vaga) {
    if (!vagaPropria(vaga)) return
    vagas.value = vagas.value.map((item) => (item.id === vaga.id ? vaga : item))
    sucesso.value = 'Vaga editada com sucesso!'
  }
  return {
    vagas,
    ultima,
    aprovadosPorVaga,
    carregando,
    erro,
    sucesso,
    selecionada,
    excluindo,
    erroExclusao,
    carregar,
    pedirExclusao,
    cancelarExclusao,
    confirmarExclusao,
    registrarEdicao,
  }
})
