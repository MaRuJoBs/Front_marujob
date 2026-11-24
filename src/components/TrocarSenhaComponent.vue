<script setup>
import { useId, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { sessao } from '@/services/authSession'
import { trocarSenha as salvarSenha, paginaInicial } from '@/services/authService'
import { mensagensErro } from '@/utils/authErrors'

const campoId = 'trocar-senha-' + useId()
const router = useRouter()
const route = useRoute()
const voltar = () =>
  router.replace(
    sessao.tipo === 'empresa' && route.query.origem === 'configuracoes-empresa'
      ? '/empresa/configuracoes'
      : paginaInicial(),
  )

const senhaAtual = ref('')
const novaSenha = ref('')
const confirmarSenha = ref('')

const erro = ref('')
const sucesso = ref('')
const carregando = ref(false)

const trocarSenha = async () => {
  if (carregando.value) return
  erro.value = ''
  sucesso.value = ''

  if (!senhaAtual.value || !novaSenha.value || !confirmarSenha.value) {
    erro.value = 'Preencha todos os campos.'
    return
  }

  if (novaSenha.value.length < 8) {
    erro.value = 'A nova senha deve ter pelo menos 8 caracteres.'
    return
  }

  if (novaSenha.value !== confirmarSenha.value) {
    erro.value = 'As senhas não coincidem.'
    return
  }

  if (novaSenha.value === senhaAtual.value) {
    erro.value = 'A nova senha deve ser diferente da senha atual.'
    return
  }

  carregando.value = true

  try {
    await salvarSenha(senhaAtual.value, novaSenha.value)

    sucesso.value = 'Senha alterada com sucesso!'

    senhaAtual.value = ''
    novaSenha.value = ''
    confirmarSenha.value = ''
  } catch (error) {
    erro.value = mensagensErro(error, 'Não foi possível alterar a senha.').join(' ')
  } finally {
    carregando.value = false
  }
}
</script>

<template>
  <main class="trocar-senha">
    <div class="topo">
      <button type="button" aria-label="Voltar" :disabled="carregando" @click="voltar">
        <i aria-hidden="true" class="fa-solid fa-arrow-left"></i>
      </button>

      <h1>Alterar senha</h1>
    </div>

    <form class="formulario" @submit.prevent="trocarSenha" :aria-busy="carregando">
      <p :id="`${campoId}-ajuda`">
        Use pelo menos 8 caracteres e repita a nova senha na confirmação.
      </p>
      <div class="campo">
        <label :for="`${campoId}-senhaAtual`">Senha atual (obrigatório)</label>
        <input
          :id="`${campoId}-senhaAtual`"
          :aria-describedby="erro ? campoId + '-erro' : ''"
          v-model="senhaAtual"
          type="password"
          autocomplete="current-password"
          required
          :disabled="carregando"
          placeholder="Digite sua senha atual"
        />
      </div>

      <div class="campo">
        <label :for="`${campoId}-novaSenha`">Nova senha (obrigatório)</label>
        <input
          :id="`${campoId}-novaSenha`"
          :aria-describedby="(erro ? campoId + '-erro' : '') + ' ' + campoId + '-ajuda'"
          :aria-invalid="!!erro && novaSenha.length < 8"
          v-model="novaSenha"
          type="password"
          autocomplete="new-password"
          minlength="8"
          required
          :disabled="carregando"
          placeholder="Digite sua nova senha"
        />
      </div>

      <div class="campo">
        <label :for="`${campoId}-confirmarSenha`">Confirmar nova senha (obrigatório)</label>
        <input
          :id="`${campoId}-confirmarSenha`"
          :aria-describedby="(erro ? campoId + '-erro' : '') + ' ' + campoId + '-ajuda'"
          :aria-invalid="!!erro && novaSenha !== confirmarSenha"
          v-model="confirmarSenha"
          type="password"
          autocomplete="new-password"
          minlength="8"
          required
          :disabled="carregando"
          placeholder="Digite novamente sua nova senha"
        />
      </div>

      <p v-if="erro" :id="`${campoId}-erro`" class="erro" role="alert">
        {{ erro }}
      </p>

      <p v-if="sucesso" class="sucesso" role="status">
        {{ sucesso }}
      </p>

      <button class="btn-salvar" type="submit" :disabled="carregando">
        {{ carregando ? 'Alterando...' : 'Alterar senha' }}
      </button>
      <p v-if="carregando" role="status">Aguardando confirmação da alteração de senha...</p>
    </form>
  </main>
</template>

<style scoped>
.trocar-senha {
  min-height: 100vh;
  background: #e8e1f2;
  padding: 25px 18px;
}

.topo {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 30px;
}

.topo button {
  border: none;
  background: transparent;
  color: #513f7c;
  font-size: 20px;
  cursor: pointer;
}

.topo h1 {
  color: #513f7c;
  font-size: 22px;
}

.formulario {
  background: #f5f2fb;
  padding: 20px;
  border-radius: 18px;
}

.campo {
  display: flex;
  flex-direction: column;
  gap: 7px;
  margin-bottom: 18px;
}

.campo label {
  color: #513f7c;
  font-size: 14px;
  font-weight: 600;
}

.campo input {
  font-size: 16px;
  width: 100%;
  padding: 13px;
  border: 1px solid #796197;
  border-radius: 12px;
  outline: none;
  background: white;
  color: #444;
}

.campo input:focus {
  border-color: #7a3ff2;
}

.erro {
  color: #b30000;
  font-size: 13px;
  margin-bottom: 15px;
}

.sucesso {
  color: #195539;
  font-size: 13px;
  margin-bottom: 15px;
}

.btn-salvar {
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 14px;
  background: #7a3ff2;
  color: white;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
}

.btn-salvar:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
/* F61 · Desktop: formulário centralizado com largura confortável. */
@media (min-width: 64rem) {
  .trocar-senha {
    min-height: 100dvh;
    padding-inline: max(40px, calc((100% - 36rem) / 2));
  }
}
</style>
