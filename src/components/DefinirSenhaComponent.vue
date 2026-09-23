<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api'

const router = useRouter()

const senha = ref('')
const confirmarSenha = ref('')
const erro = ref('')
const carregando = ref(false)

const definirSenha = async () => {
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
    await api.post('auth/definir-senha/', {
      senha: senha.value,
    })

    localStorage.setItem('precisa_definir_senha', 'false')

    router.push('/home')
  } catch (error) {
    console.error('ERRO AO DEFINIR SENHA:', error)

    erro.value =
      error.response?.data?.detail ||
      'Não foi possível definir a senha.'
  } finally {
    carregando.value = false
  }
}
</script>

<template>
  <div class="pagina-senha">
    <div class="card-senha">
      <h1>Criar senha</h1>

      <p>
        Crie uma senha para também poder entrar no Marujobs
        usando seu e-mail.
      </p>

      <div class="campo">
        <label>Nova senha</label>

        <input
          v-model="senha"
          type="password"
          placeholder="Digite sua senha..."
        />
      </div>

      <div class="campo">
        <label>Confirmar senha</label>

        <input
          v-model="confirmarSenha"
          type="password"
          placeholder="Digite novamente..."
        />
      </div>

      <p v-if="erro" class="erro">
        {{ erro }}
      </p>

      <button
        @click="definirSenha"
        :disabled="carregando"
      >
        {{ carregando ? 'Salvando...' : 'Criar senha' }}
      </button>
    </div>
  </div>
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
  color: #817a91;
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
  width: 100%;
  height: 40px;
  border: none;
  border-radius: 8px;
  background: #eee;
  padding: 0 12px;
  outline: none;
}

.erro {
  color: red;
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