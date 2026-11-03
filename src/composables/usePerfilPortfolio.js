import { ref } from 'vue'
import { useRecursoPrivado } from '@/composables/useRecursoPrivado'
import { consultarPerfil, listarProjetos } from '@/services/perfilPortfolioService'
export function usePerfilPortfolio() {
  const usuario = ref(null),
    projetos = ref([])
  const recurso = useRecursoPrivado(() => {
    usuario.value = null
    projetos.value = []
  })
  const carregar = () =>
    recurso.executar(
      (config) => Promise.all([consultarPerfil(config), listarProjetos(config)]),
      ([user, lista]) => {
        usuario.value = user
        projetos.value = lista
      },
    )
  return { usuario, projetos, ...recurso, carregar }
}
