import { ref } from 'vue'
import { validarLista } from '@/utils/perfilPortfolio'
export function usePerfilHabilidades() {
  const habilidades = ref([]),
    novaHabilidade = ref(''),
    erroHabilidade = ref('')
  const carregarHabilidades = (lista) => {
    habilidades.value = Array.isArray(lista) ? [...lista] : []
    novaHabilidade.value = ''
    erroHabilidade.value = ''
  }
  function adicionarHabilidade() {
    const valor = novaHabilidade.value.trim()
    erroHabilidade.value = validarLista([...habilidades.value, valor])
    if (erroHabilidade.value) return
    habilidades.value.push(valor)
    novaHabilidade.value = ''
  }
  const removerHabilidade = (valor) => {
    habilidades.value = habilidades.value.filter((v) => v !== valor)
    erroHabilidade.value = ''
  }
  return {
    habilidades,
    novaHabilidade,
    erroHabilidade,
    carregarHabilidades,
    adicionarHabilidade,
    removerHabilidade,
  }
}
