
import { ref } from 'vue'

export function usePerfilHabilidades() {
  const habilidades = ref([])
  const novaHabilidade = ref('')

  const carregarHabilidades = (lista) => {
    habilidades.value = Array.isArray(lista) ? [...lista] : []
  }

  const adicionarHabilidade = () => {
    const habilidade = novaHabilidade.value.trim()

    if (!habilidade) return

    const jaExiste = habilidades.value.some(
      (item) => item.toLowerCase() === habilidade.toLowerCase()
    )

    if (!jaExiste) {
      habilidades.value.push(habilidade)
    }

    novaHabilidade.value = ''
  }

  const removerHabilidade = (habilidade) => {
    habilidades.value = habilidades.value.filter(
      (item) => item !== habilidade
    )
  }

  return {
    habilidades,
    novaHabilidade,
    carregarHabilidades,
    adicionarHabilidade,
    removerHabilidade,
  }
}
