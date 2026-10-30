// Uma instalação PWA anterior não deve servir arquivos de produção no Vite dev.
export async function limparPwaDesenvolvimento() {
  if (!import.meta.env.DEV || !navigator.serviceWorker) return false
  try {
    const scope = new URL(import.meta.env.BASE_URL, location.origin).href
    const pertenceAoApp = (worker) => {
      if (!worker?.scriptURL) return false
      const script = new URL(worker.scriptURL)
      return (
        script.origin === location.origin &&
        ['sw.js', 'dev-sw.js'].some(
          (nome) => script.href.split('?')[0] === new URL(nome, scope).href,
        )
      )
    }
    const controlado = pertenceAoApp(navigator.serviceWorker.controller)
    const registros = await navigator.serviceWorker.getRegistrations()
    const antigos = registros.filter(
      (registro) =>
        registro.scope === scope &&
        [registro.active, registro.waiting, registro.installing].some(pertenceAoApp),
    )
    if (!antigos.length) return false
    const removidos = await Promise.all(antigos.map((registro) => registro.unregister()))
    if (!removidos.some(Boolean)) return false
    if (globalThis.caches) {
      const nomes = await caches.keys()
      await Promise.all(
        nomes
          .filter((nome) => nome.startsWith('workbox-precache-') && nome.endsWith(scope))
          .map((nome) => caches.delete(nome)),
      )
    }
    if (controlado) {
      location.reload()
      return true
    }
  } catch {
    // Falha de limpeza não impede o desenvolvimento quando o navegador restringe storage.
  }
  return false
}
