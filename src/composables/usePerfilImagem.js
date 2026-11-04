import { ref, onUnmounted } from 'vue'
import { resolverImagem } from '@/services/perfilPortfolioService'
import { validarImagem } from '@/utils/perfilPortfolio'
export function usePerfilImagem() {
  const imagem = ref(null),
    previewImagem = ref(''),
    erroImagem = ref('')
  let temporaria
  function liberar() {
    if (temporaria) URL.revokeObjectURL(temporaria)
    temporaria = null
  }
  function carregarImagem(path) {
    liberar()
    imagem.value = null
    previewImagem.value = resolverImagem(path)
    erroImagem.value = ''
  }
  function definirImagem(file) {
    if (!file) return
    erroImagem.value = validarImagem(file)
    if (erroImagem.value) return
    liberar()
    imagem.value = file
    temporaria = URL.createObjectURL(file)
    previewImagem.value = temporaria
  }
  function selecionarImagem(event) {
    definirImagem(event.target.files?.[0])
    event.target.value = ''
  }
  onUnmounted(liberar)
  return { imagem, previewImagem, erroImagem, carregarImagem, definirImagem, selecionarImagem }
}
