import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { parse, compileScript, compileTemplate } from '@vue/compiler-sfc'
import * as vagas from '../src/utils/vagaForm.js'

const formValido = () => ({
  ...vagas.novoRascunhoVaga(),
  titulo: 'Projeto Vue',
  categoria: 'Desenvolvimento Web',
  descricao: 'Aplicação web',
  preco: '1500,00',
  tempo: '40',
  modalidade: 'Remoto',
  cidade: 'São Paulo',
  uf: 'SP',
  requisitos: 'Vue',
  beneficios: 'Flexibilidade',
  salario_minimo: '2000',
  salario_maximo: '3500',
})

test('F47 criação: contrato estruturado, opcionais, validação e erros 400', () => {
  const form = formValido()
  assert.deepEqual(vagas.validarVaga(form), {})
  const payload = vagas.montarPayloadVaga(form)
  assert.equal(payload.descricao, 'Aplicação web')
  assert.equal(payload.modalidade, 'Remoto')
  assert.equal(payload.cidade, 'São Paulo')
  assert.equal(payload.uf, 'SP')
  assert.equal(payload.status, 'publicada')
  assert.equal(payload.preco, '1500.00')
  assert.equal(payload.salario_minimo, '2000.00')
  assert.equal(payload.salario_maximo, '3500.00')
  assert.deepEqual(vagas.camposNaoConfirmados(payload, payload), [])
  assert.ok(vagas.camposNaoConfirmados({ ...payload, uf: '' }, payload).includes('Estado (UF)'))
  assert.deepEqual(vagas.validarVaga({ ...form, modalidade: '', cidade: '', uf: '' }), {})
  for (const [campo, valor] of [
    ['modalidade', 'Outro'],
    ['cidade', '123'],
    ['cidade', 'x'.repeat(101)],
    ['cidade', 'Cidade\nOutra'],
    ['uf', 'sp'],
    ['status', ''],
  ])
    assert.ok(vagas.validarVaga({ ...form, [campo]: valor })[campo], campo)
  assert.equal(vagas.validarVaga({ ...form, cidade: 'Olho-d’Água' }).cidade, undefined)
  const erros = vagas.interpretarErroPublicacao({
    response: {
      status: 400,
      data: {
        modalidade: ['Inválida'],
        cidade: ['Inválida'],
        uf: ['Inválida'],
        status: ['Inválido'],
      },
    },
  }).erros
  assert.deepEqual(Object.keys(erros), ['modalidade', 'cidade', 'uf', 'status'])
})

test('F47 edição: PATCH somente alterações e preservação dos complementos', () => {
  const original = { id: 1, ...vagas.montarPayloadVaga(formValido()) }
  const form = vagas.formularioDaVaga(original)
  assert.deepEqual(vagas.montarPayloadEdicao(form, original), {})
  Object.assign(form, { modalidade: 'Híbrido', cidade: 'Joinville', uf: 'SC', status: 'encerrada' })
  assert.deepEqual(vagas.validarEdicaoVaga(form, original), {})
  assert.deepEqual(vagas.montarPayloadEdicao(form, original), {
    modalidade: 'Híbrido',
    cidade: 'Joinville',
    uf: 'SC',
    status: 'encerrada',
  })
  Object.assign(form, { modalidade: '', cidade: '', uf: '', status: 'cancelada' })
  assert.deepEqual(vagas.montarPayloadEdicao(form, original), {
    modalidade: '',
    cidade: '',
    uf: '',
    status: 'cancelada',
  })
  assert.equal(original.requisitos, 'Vue')
  assert.equal(original.salario_minimo, '2000.00')
})

test('F47 compatibilidade: modalidade legada só como fallback sem regravar descrição', () => {
  const original = {
    ...vagas.montarPayloadVaga(formValido()),
    modalidade: '',
    descricao: 'Modalidade: Remoto\n\nTexto antigo',
  }
  const form = vagas.formularioDaVaga(original)
  assert.equal(form.modalidade, 'Remoto')
  assert.equal(form.descricao, 'Texto antigo')
  assert.deepEqual(vagas.montarPayloadEdicao(form, original), {})
  form.modalidade = 'Presencial'
  assert.deepEqual(vagas.montarPayloadEdicao(form, original), { modalidade: 'Presencial' })
  assert.equal(vagas.formularioDaVaga({ ...original, modalidade: 'Híbrido' }).modalidade, 'Híbrido')
  assert.equal(
    vagas.formularioDaVaga({ ...original, modalidade: 'Híbrido' }).descricao,
    'Texto antigo',
  )
  assert.equal(
    vagas.formularioDaVaga({ ...original, descricao: 'Texto\nModalidade: Remoto' }).descricao,
    'Texto\nModalidade: Remoto',
  )
})

test('F47 regressão: ações F42/F38 intactas e componentes Vue compiláveis', () => {
  const path = 'src/components/OportunidadeDetalheComponent.vue'
  const atual = readFileSync(path, 'utf8')
  const anterior = execFileSync('git', ['show', 'origin/DEV:' + path], { encoding: 'utf8' })
  const acoes = (source) => {
    const s = source.replaceAll('\r\n', '\n')
    return s.slice(s.indexOf('<section class="acoes"'), s.indexOf('</template>\n  </main>'))
  }
  assert.equal(acoes(atual), acoes(anterior))
  assert.equal(
    atual.match(/<FavoritoButton[^>]+\/>/)[0],
    anterior.match(/<FavoritoButton[^>]+\/>/)[0],
  )
  const candidatura = (s) =>
    s
      .slice(s.indexOf('const {\n  candidatura,'), s.indexOf('const { erroFavorito'))
      .replaceAll('\r\n', '\n')
  assert.equal(
    candidatura(atual.replaceAll('\r\n', '\n')),
    candidatura(anterior.replaceAll('\r\n', '\n')),
  )
  for (const filename of [
    path,
    'src/components/CriarVagaComponent.vue',
    'src/components/OportunidadeComponent.vue',
    'src/views/DetalheVagaEmpresaView.vue',
  ]) {
    const { descriptor, errors } = parse(readFileSync(filename, 'utf8'), { filename })
    assert.deepEqual(errors, [])
    const script = compileScript(descriptor, { id: filename })
    const template = compileTemplate({
      source: descriptor.template.content,
      filename,
      id: filename,
      compilerOptions: { bindingMetadata: script.bindings },
    })
    assert.deepEqual(template.errors, [])
  }
})
