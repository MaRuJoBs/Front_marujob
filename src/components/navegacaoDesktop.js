// F61 · Itens da navegação desktop por tipo de conta. Somente rotas existentes em routes.js.
// `rotas` lista os nomes de rota que marcam o item como página atual; `hash` diferencia
// itens que apontam para a mesma rota (Painel × Gerenciar vagas), para que só um fique ativo.
import {
  faBell,
  faBriefcase,
  faBuilding,
  faFolderOpen,
  faGear,
  faHeart,
  faHouse,
  faListCheck,
  faMessage,
  faPlus,
  faUser,
  faUsers,
} from '@fortawesome/free-solid-svg-icons'

export const ANCORA_VAGAS_EMPRESA = '#vagas-empresa'

export const navegacaoDesktop = {
  usuario: {
    rotulo: 'Navegação do freelancer',
    inicio: '/home',
    itens: [
      { id: 'inicio', rotulo: 'Início', to: '/home', icone: faHouse, rotas: ['home'] },
      {
        id: 'oportunidades',
        rotulo: 'Oportunidades',
        to: '/freelances',
        icone: faBriefcase,
        rotas: ['freelances', 'oportunidade'],
      },
      {
        id: 'favoritos',
        rotulo: 'Favoritos',
        to: '/favoritos',
        icone: faHeart,
        rotas: ['favoritos'],
      },
      {
        id: 'mensagens',
        rotulo: 'Mensagens',
        to: '/mensagens',
        icone: faMessage,
        rotas: ['mensagens'],
        indicador: 'mensagens',
      },
      {
        id: 'notificacoes',
        rotulo: 'Notificações',
        to: '/notificacoes',
        icone: faBell,
        rotas: ['notificacoes-freelancer'],
        indicador: 'candidaturas',
      },
      {
        id: 'perfil',
        rotulo: 'Perfil',
        to: '/perfil',
        icone: faUser,
        rotas: ['perfil', 'editar-perfil'],
      },
      {
        id: 'portfolio',
        rotulo: 'Portfólio',
        to: '/portfolio',
        icone: faFolderOpen,
        rotas: ['portfolio', 'portfolioAdicionar', 'portfolioEditar', 'portfolioDetalhe'],
      },
    ],
  },
  empresa: {
    rotulo: 'Navegação da empresa',
    inicio: '/homeEmpresa',
    sair: true,
    itens: [
      {
        id: 'painel',
        rotulo: 'Painel',
        to: '/homeEmpresa',
        icone: faHouse,
        rotas: ['homeEmpresa'],
        hash: '',
      },
      {
        id: 'gerenciar-vagas',
        rotulo: 'Gerenciar vagas',
        to: { path: '/homeEmpresa', hash: ANCORA_VAGAS_EMPRESA },
        icone: faListCheck,
        rotas: ['homeEmpresa', 'detalhe-vaga-empresa', 'editar-vaga'],
        hash: ANCORA_VAGAS_EMPRESA,
      },
      {
        id: 'criar-vaga',
        rotulo: 'Criar vaga',
        to: '/criar-vaga',
        icone: faPlus,
        rotas: ['criar-vaga'],
      },
      {
        id: 'freelancers',
        rotulo: 'Buscar freelancers',
        to: '/empresa/freelancers',
        icone: faUsers,
        rotas: ['busca-freelancers', 'perfil-publico-freelancer'],
      },
      {
        id: 'mensagens',
        rotulo: 'Mensagens',
        to: '/mensagens',
        icone: faMessage,
        rotas: ['mensagens'],
        indicador: 'mensagens',
      },
      {
        id: 'notificacoes',
        rotulo: 'Notificações',
        to: '/empresa/notificacoes',
        icone: faBell,
        rotas: ['notificacoes-empresa'],
        indicador: 'candidaturas-empresa',
      },
      {
        id: 'perfil',
        rotulo: 'Perfil empresarial',
        to: '/empresa/perfil',
        icone: faBuilding,
        rotas: ['perfil-empresa'],
      },
      {
        id: 'configuracoes',
        rotulo: 'Configurações',
        to: '/empresa/configuracoes',
        icone: faGear,
        rotas: ['configuracoes-empresa'],
      },
    ],
  },
}

// Um único item ativo por rota: quando dois itens compartilham a rota, o hash decide.
export function itemAtivo(itens, rota) {
  const candidatos = itens.filter((item) => item.rotas.includes(rota.name))
  if (candidatos.length < 2) return candidatos[0]?.id ?? null
  const hash = rota.hash || ''
  return (candidatos.find((item) => item.hash === hash) ?? candidatos.find((i) => i.hash === ''))
    ?.id ?? null
}
