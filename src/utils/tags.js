// Opções de seleção da interface. Não representam dados de usuários nem catálogo da API.
export const habilidadesSugeridas = [
  'HTML',
  'CSS',
  'JavaScript',
  'TypeScript',
  'Vue',
  'React',
  'Angular',
  'Node.js',
  'Python',
  'Java',
  'C#',
  'PHP',
  'SQL',
  'PostgreSQL',
  'MySQL',
  'MongoDB',
  'Git',
  'Docker',
  'Linux',
  'API',
  'Testes de software',
  'Acessibilidade',
  'Figma',
  'UI/UX',
  'Photoshop',
  'Illustrator',
  'Design Gráfico',
  'Marketing Digital',
  'SEO',
  'Social Media',
  'Redação',
  'Edição de vídeo',
  'Análise de dados',
  'Power BI',
  'Excel',
  'Suporte técnico',
]

export function opcoesTags(...listas) {
  const unicas = new Map()
  for (const valor of listas.flat()) {
    if (typeof valor !== 'string' || !valor.trim()) continue
    const tag = valor.trim()
    const chave = tag.toLocaleLowerCase('pt-BR')
    if (!unicas.has(chave)) unicas.set(chave, tag)
  }
  return [...unicas.values()]
}
