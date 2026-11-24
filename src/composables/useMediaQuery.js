import { onBeforeUnmount, shallowRef } from 'vue'

// F61: estado estritamente visual (qual layout renderizar). Acompanha a media query ao vivo,
// inclusive ao redimensionar a janela.
export function useMediaQuery(consulta) {
  const lista = globalThis.matchMedia?.(consulta)
  const corresponde = shallowRef(Boolean(lista?.matches))
  const atualizar = (evento) => {
    corresponde.value = evento.matches
  }
  lista?.addEventListener('change', atualizar)
  onBeforeUnmount(() => lista?.removeEventListener('change', atualizar))
  return corresponde
}
