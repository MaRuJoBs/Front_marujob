import { storeToRefs } from 'pinia'
import { useFavoritosStore } from '../stores/favoritos.js'

// Mantém a interface existente, com uma única fonte de verdade.
export function useFavoritosLocais() {
  const store = useFavoritosStore()
  const { favoritos, erroFavorito } = storeToRefs(store)
  return {
    favoritos,
    erroFavorito,
    toggleFavorito: store.toggleFavorito,
    ehFavorito: store.ehFavorito,
  }
}
