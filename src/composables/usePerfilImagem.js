
import { ref, onUnmounted } from 'vue'
import { resolverImagem } from '../utils/imagens.js'

export function usePerfilImagem() {
  const imagem = ref(null)
  const previewImagem = ref(null)

  let urlTemporaria = null

  const carregarImagem = (path) => {
    if (urlTemporaria) {
      URL.revokeObjectURL(urlTemporaria)
      urlTemporaria = null
    }

    imagem.value = null
    previewImagem.value = resolverImagem(path)
  }

  
    const selecionarImagem = (event) => {
    const arquivo = event.target.files?.[0]

    if (!arquivo) return

    definirImagem(arquivo)

    // Permite selecionar novamente o mesmo arquivo.
    event.target.value = ''
    }


  
    const definirImagem = (arquivo) => {
    if (!arquivo) return

    if (urlTemporaria) {
        URL.revokeObjectURL(urlTemporaria)
    }

    imagem.value = arquivo
    urlTemporaria = URL.createObjectURL(arquivo)
    previewImagem.value = urlTemporaria
    }


  onUnmounted(() => {
    if (urlTemporaria) {
      URL.revokeObjectURL(urlTemporaria)
    }
  })

  return {
    imagem,
    previewImagem,
    carregarImagem,
    selecionarImagem,
    definirImagem,
  }
}
