// F61: complementa as fixtures de responsividade com conversas, mensagens e notificações
// empresariais para as capturas antes/depois. Somente leitura e em memória; sem API real.
import axios from 'axios'
import { instalarFixtures } from './responsividade.js'

// cenario: '' (preenchido) | 'vazio' | 'erro' | 'carregando' | 'sem-conversas'.
// Perfil da conta (usuarios/me, empresas/me) sempre responde, para a sessão continuar válida.
export function instalarFixturesF61(api, cenario = '') {
  const base = instalarFixtures(api)
  if (cenario === 'vazio') localStorage.removeItem('marujobs:favoritos:usuario:49')
  const perfilDaConta = (path) => path === 'usuarios/me/' || path === 'empresas/me/'
  const listas = /^(freelances|portfolios|freelancers|notificacoes|notificacoes-freelancer|candidaturas|chat\/rooms)\/$/
  const anterior = api.defaults.adapter
  const pagina = (results) => ({ count: results.length, results, next: null, previous: null })
  const pessoa = (id, name) => ({ id, name })
  const salas = [
    {
      id: 42,
      name: 'Conversa com título longo para conferir quebra em telas pequenas',
      other: pessoa(7, 'Marina Costa de Albuquerque'),
      unread: 2,
      last_message_at: '2026-11-22T12:00:00Z',
      last_message: { id: 6, body: 'Posso enviar o cronograma amanhã cedo?', author: { id: 7 } },
    },
    {
      id: 43,
      name: 'Página institucional',
      other: pessoa(8, 'Estúdio de teste'),
      unread: 0,
      last_message_at: '2026-11-21T15:30:00Z',
      last_message: { id: 9, body: 'Obrigado pelo retorno!', author: { id: 49 } },
    },
    {
      id: 44,
      name: 'Catálogo de serviços',
      other: pessoa(9, 'Equipe de teste'),
      unread: 0,
      last_message_at: '2026-11-19T09:10:00Z',
      last_message: { id: 12, body: 'Combinado.', author: { id: 9 } },
    },
  ]
  const mensagens = [
    ['Olá! Vi sua candidatura e gostei do portfólio.', 7, '2026-11-22T11:40:00Z'],
    ['Que bom! Tenho disponibilidade para começar na próxima semana.', 49, '2026-11-22T11:42:00Z'],
    ['Perfeito. O escopo inclui a página inicial e o catálogo.', 7, '2026-11-22T11:45:00Z'],
    ['Entendido. Preciso de acesso aos textos e imagens.', 49, '2026-11-22T11:50:00Z'],
    ['Vou separar o material e envio ainda hoje.', 7, '2026-11-22T11:55:00Z'],
    ['Posso enviar o cronograma amanhã cedo?', 7, '2026-11-22T12:00:00Z'],
  ].map(([body, autor, created], i) => ({
    id: i + 1,
    room: 42,
    author: { id: autor, name: autor === 49 ? 'Conta de teste' : 'Marina Costa de Albuquerque' },
    body,
    created,
    is_deleted: false,
  }))
  const profissional = {
    id: 7,
    name: 'Marina Costa de Albuquerque',
    profissao: 'Desenvolvimento frontend e acessibilidade',
    habilidades: ['Vue', 'JavaScript', 'Acessibilidade'],
  }
  const notificacoes = [
    { id: 31, candidatura: 12, status: 'pendente', lida: false },
    { id: 32, candidatura: 13, status: 'aprovada', lida: false },
    { id: 34, candidatura: 15, status: 'recusada', lida: true },
  ].map((n) => ({
    ...n,
    freelancer: 7,
    freelancer_detalhes: profissional,
    oportunidade: 2,
    oportunidade_titulo: base.jobs[1].titulo,
    candidatura_criado_em: '2026-11-20T12:00:00-03:00',
    criado_em: '2026-11-20T13:00:00-03:00',
  }))

  api.defaults.adapter = async (config) => {
    const path = config.url.split('?')[0]
    if (config.method === 'get' && !perfilDaConta(path)) {
      if (cenario === 'carregando') return new Promise(() => {})
      if (cenario === 'erro')
        throw new axios.AxiosError('erro de teste', 'ERR_BAD_RESPONSE', config, null, {
          status: 503,
          data: { detail: 'Serviço indisponível (teste).' },
          config,
          headers: {},
        })
      if ((cenario === 'vazio' && listas.test(path)) || (cenario === 'sem-conversas' && path === 'chat/rooms/'))
        return { config, status: 200, headers: {}, data: pagina([]) }
    }
    if (/^chat\/rooms\/\d+\/read\/$/.test(path) && config.method === 'post')
      return { config, status: 204, headers: {} }
    if (config.method === 'get') {
      let data
      if (path === 'chat/rooms/') data = pagina(salas)
      else if (/^chat\/rooms\/\d+\/$/.test(path))
        data = salas.find((s) => s.id === Number(path.split('/')[2]))
      else if (/^chat\/rooms\/\d+\/messages\/$/.test(path))
        data = {
          results: path === 'chat/rooms/42/messages/' ? mensagens : [],
          next_before: null,
        }
      else if (path === 'notificacoes/') {
        const status = config.params?.status
        data = pagina(notificacoes.filter((n) => !status || n.status === status))
      } else if (/^candidaturas\/\d+\/$/.test(path)) {
        const n = notificacoes.find((x) => x.candidatura === Number(path.split('/')[1]))
        data = {
          id: n.candidatura,
          freelancer: 7,
          oportunidade: 2,
          status: n.status,
          freelancer_detalhes: profissional,
          whatsapp: { disponivel: false, modo: 'link', url: null, mensagem_enviada: false },
        }
      }
      if (data !== undefined) return { config, status: 200, headers: {}, data }
    }
    return anterior(config)
  }
  return base
}
