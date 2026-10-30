import test from 'node:test'
import assert from 'node:assert/strict'
import {
  parametrosOportunidades as params,
  erroOportunidades,
  formatarPreco,
} from '../src/utils/oportunidades.js'

test('combina filtros globais e preserva os mesmos parâmetros nas páginas', () => {
  const filtros = { search: ' designer ', tag: 'UI/UX', preco_min: '0', preco_max: '500,50' }
  assert.deepEqual(params(filtros, 2), {
    page: 2,
    search: 'designer',
    tag: 'UI/UX',
    preco_min: '0',
    preco_max: '500.50',
  })
  assert.deepEqual(params({}, 1), { page: 1 })
  assert.deepEqual(params({ preco_min: '', preco_max: ' ' }), { page: 1 })
})
test('valida limites inclusivos, preços e página', () => {
  assert.equal(params({ search: 'a'.repeat(200) }).search.length, 200)
  assert.ok(params({ search: Array(20).fill('a').join(' ') }))
  for (const filtros of [
    { search: 'a'.repeat(201) },
    { search: Array(21).fill('a').join(' ') },
    { preco_min: '-1' },
    { preco_max: 'NaN' },
    { preco_min: '10', preco_max: '9' },
  ])
    assert.throws(() => params(filtros))
  for (const page of [0, -1, 1.5, NaN]) assert.throws(() => params({}, page))
  assert.ok(params({ preco_min: '0', preco_max: '0' }))
})
test('erros distinguem validação, autenticação, página, detalhe e conexão', () => {
  const erro = (status, data = {}) => ({ response: { status, data } })
  assert.match(erroOportunidades(erro(400, { search: ['Pesquisa inválida'] })), /Pesquisa inválida/)
  assert.match(erroOportunidades(erro(401)), /sessão expirou/)
  assert.match(erroOportunidades(erro(404)), /Página/)
  assert.match(erroOportunidades(erro(404), true), /Oportunidade não encontrada/)
  assert.match(erroOportunidades({ config: {}, message: 'Network Error' }), /conectar/)
  assert.match(erroOportunidades(erro(500)), /Tente novamente/)
})
test('preço nulo não vira zero e formatação não inventa moeda ou periodicidade', () => {
  for (const valor of [null, undefined, '', ' ', 'inválido'])
    assert.equal(formatarPreco(valor), 'Não informado')
  assert.equal(formatarPreco('1234.50'), '1.234,50')
  assert.equal(formatarPreco(0), '0,00')
})
