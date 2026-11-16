<script setup>
import { useId, ref } from 'vue'
import { useRouter } from 'vue-router'
import { definirSenha as salvarSenha, paginaInicial } from '@/services/authService'
import { mensagensErro } from '@/utils/authErrors'

const campoId = 'definir-senha-' + useId()
const router = useRouter()

const senha = ref('')
const confirmarSenha = ref('')
const erro = ref('')
const carregando = ref(false)

const definirSenha = async () => {
  if (carregando.value) return
  erro.value = ''

  if (senha.value.length < 8) {
    erro.value = 'A senha deve ter pelo menos 8 caracteres.'
    return
  }

  if (senha.value !== confirmarSenha.value) {
    erro.value = 'As senhas não coincidem.'
    return
  }

  carregando.value = true

  try {
    await salvarSenha(senha.value)
    await router.replace(paginaInicial())
  } catch (error) {
    erro.value = mensagensErro(error, 'Não foi possível definir a senha.').join(' ')
  } finally {
    carregando.value = false
  }
}
</script>

<template>
  <main class="pagina-senha">
    <form class="card-senha" @submit.prevent="definirSenha" :aria-busy="carregando">
      <h1>Criar senha</h1>

      <p>Crie uma senha para também poder entrar no Marujobs usando seu e-mail.</p>

      <p :id="`${campoId}-ajuda`">
        Use pelo menos 8 caracteres e repita a nova senha na confirmação.
      </p>
      <div class="campo">
        <label :for="`${campoId}-senha`">Nova senha (obrigatório)</label>

        <input
          :id="`${campoId}-senha`"
          :aria-describedby="(erro ? campoId + '-erro' : '') + ' ' + campoId + '-ajuda'"
          :aria-invalid="!!erro && senha.length < 8"
          v-model="senha"
          type="password"
          autocomplete="new-password"
          minlength="8"
          required
          :disabled="carregando"
          placeholder="Digite sua senha..."
        />
      </div>

      <div class="campo">
        <label :for="`${campoId}-confirmarSenha`">Confirmar senha (obrigatório)</label>

        <input
          :id="`${campoId}-confirmarSenha`"
          :aria-describedby="(erro ? campoId + '-erro' : '') + ' ' + campoId + '-ajuda'"
          :aria-invalid="!!erro && senha !== confirmarSenha"
          v-model="confirmarSenha"
          type="password"
          autocomplete="new-password"
          minlength="8"
          required
          :disabled="carregando"
          placeholder="Digite novamente..."
        />
      </div>

      <p v-if="erro" :id="`${campoId}-erro`" class="erro" role="alert">
        {{ erro }}
      </p>

      <button type="submit" :disabled="carregando">
        {{ carregando ? 'Salvando...' : 'Criar senha' }}
      </button>
      <button
        class="voltar"
        type="button"
        :disabled="carregando"
        @click="router.replace(paginaInicial())"
      >
        Voltar ao início
      </button>
      <p v-if="carregando" role="status">Aguardando confirmação da alteração de senha...</p>
    </form>
  </main>
</template>

<style scoped>
.pagina-senha {
  min-height: 100vh;
  background: #e7d9f3;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.card-senha {
  width: 100%;
  max-width: 400px;
  background: white;
  border-radius: 20px;
  padding: 25px;
  box-shadow: 0 6px 20px rgba(72, 48, 120, 0.12);
}

.card-senha h1 {
  color: #49357b;
  margin-bottom: 8px;
}

.card-senha > p {
  color: #5c3a8b;
  font-size: 13px;
  line-height: 18px;
  margin-bottom: 20px;
}

.campo {
  margin-bottom: 15px;
}

.campo label {
  display: block;
  color: #49357b;
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 6px;
}

.campo input {
  font-size: 16px;
  width: 100%;
  height: 44px;
  border: 1px solid #796197;
  border-radius: 8px;
  background: #eee;
  padding: 0 12px;
  outline: none;
}

.card-senha .erro {
  color: #b30000;
  font-size: 12px;
  margin-bottom: 12px;
}

.card-senha button {
  width: 100%;
  height: 42px;
  border: none;
  border-radius: 8px;
  background: #5b3cc4;
  color: white;
  font-weight: 600;
  cursor: pointer;
}
</style>
