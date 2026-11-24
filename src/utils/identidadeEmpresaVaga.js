import { resolverImagem } from './imagens.js'

export function identidadeEmpresaVaga(vaga, perfil, baseURL) {
  const mesmaEmpresa =
    perfil?.id != null && vaga?.empresa != null && String(perfil.id) === String(vaga.empresa)
  const nome = mesmaEmpresa ? perfil.name : vaga?.empresa_nome
  const foto = mesmaEmpresa ? perfil.profile_image : vaga?.empresa_foto
  // Sem id de usuário: o avatar usa exclusivamente a imagem vinculada à vaga.
  return {
    name: typeof nome === 'string' ? nome.trim() : '',
    profile_image: resolverImagem(foto, baseURL),
  }
}
