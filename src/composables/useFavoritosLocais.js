import { onMounted, ref } from 'vue'

// Mesma chave e mesmos IDs já usados pela página de favoritos.
const favoritos = ref([])
export function useFavoritosLocais() {
  const erroFavorito = ref('')
  onMounted(() => {
    try {
      const salvos = JSON.parse(localStorage.getItem('favoritos') || '[]')
      favoritos.value = Array.isArray(salvos) ? salvos : []
    } catch {
      favoritos.value = []
    }
  })
  function toggleFavorito(job) {
    const atualizados = favoritos.value.includes(job.id)
      ? favoritos.value.filter((id) => id !== job.id)
      : [...favoritos.value, job.id]
    try {
      localStorage.setItem('favoritos', JSON.stringify(atualizados))
      favoritos.value = atualizados
      erroFavorito.value = ''
    } catch {
      erroFavorito.value = 'Não foi possível salvar seus favoritos neste navegador.'
    }
  }
  return { favoritos, erroFavorito, toggleFavorito }
}
