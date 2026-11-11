// Fixtures locais compartilhadas entre as três versões comparadas. Sem API real.
export function instalarFixtures(api) {
  const imagem = new URL('/src/assets/images/fundoempresa.png', location.origin).href
  const usuario = {
    id: 49,
    name: 'Marina Costa',
    email: 'marina@example.test',
    profissao: 'Desenvolvedora frontend',
    localizacao: 'Blumenau / SC',
    sobre:
      'Desenvolvimento de aplicações acessíveis para pequenos negócios. Experiência com Vue, interfaces e colaboração remota.',
    habilidades: ['Vue', 'JavaScript', 'Acessibilidade'],
    profile_image: new URL('/src/assets/images/logo.png', location.origin).href,
    descricao_institucional: 'Soluções digitais e produtos acessíveis para empresas brasileiras.',
    area_atuacao: 'Tecnologia',
    cidade: 'Blumenau',
    uf: 'SC',
    website: 'https://example.test',
    contato_comercial: 'contato@example.test',
  }
  const jobs = Array.from({ length: 6 }, (_, i) => ({
    id: i + 1,
    empresa: 49,
    titulo:
      i % 2
        ? 'Desenvolvimento de aplicação web acessível com integração de formulários e catálogo de serviços'
        : 'Página institucional',
    descricao:
      'Criar uma interface responsiva para apresentação dos serviços, com documentação e testes de acessibilidade.',
    preco: i % 2 ? '98765.43' : '1500.00',
    tempo: '40',
    tag: 'Desenvolvimento Web',
    modalidade: i % 2 ? 'Híbrido' : 'Remoto',
    cidade: 'Blumenau',
    uf: 'SC',
    status: 'publicada',
    requisitos:
      'Conhecimento em Vue, JavaScript e acessibilidade. Comunicação clara e disponibilidade para reuniões.',
    beneficios: 'Horários flexíveis e trabalho remoto.',
    tipo_contratacao: 'PJ',
    nivel_experiencia: 'Pleno',
    jornada_trabalho: 'Segunda a sexta, 30 horas semanais',
    salario_minimo: '3500.00',
    salario_maximo: '6500.00',
    data_publicacao: '2026-11-10',
  }))
  const projetos = Array.from({ length: 3 }, (_, i) => ({
    id: i + 1,
    usuario: 49,
    titulo: 'Catálogo de serviços ' + (i + 1),
    descricao: 'Projeto de interface acessível com imagens, formulário e navegação por teclado.',
    imagem,
    tecnologias: ['Vue', 'CSS'],
    link: 'https://example.test',
  }))
  localStorage.setItem('marujobs:favoritos:usuario:49', '[1,2,3]')
  const pagina = (results) => ({ count: results.length, results, next: null, previous: null })
  api.defaults.adapter = async (config) => {
    if (config.method !== 'get') throw Error('Escrita de API proibida no teste visual')
    const path = config.url.split('?')[0]
    let data
    if (path === 'usuarios/me/' || path === 'empresas/me/') data = usuario
    else if (path === 'freelances/') data = pagina(jobs)
    else if (/^freelances\/\d+\/$/.test(path))
      data = jobs.find((x) => x.id === Number(path.split('/')[1]))
    else if (path === 'portfolios/') data = pagina(projetos)
    else if (/^portfolios\/\d+\/$/.test(path)) data = projetos[0]
    else if (path === 'candidaturas/' || path === 'notificacoes/') data = pagina([])
    else throw Error('Endpoint sem fixture: ' + config.url)
    return { config, status: 200, headers: {}, data }
  }
  return { usuario, jobs, projetos }
}
