<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api'

const router = useRouter()

const senhaAtual = ref('')
const novaSenha = ref('')
const confirmarSenha = ref('')

const erro = ref('')
const sucesso = ref('')
const carregando = ref(false)

const trocarSenha = async () => {
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

  carregando.value = true

  try {
    await api.post('auth/trocar-senha/', {
      senha_atual: senhaAtual.value,
      nova_senha: novaSenha.value,
    })

    sucesso.value = 'Senha alterada com sucesso!'

    senhaAtual.value = ''
    novaSenha.value = ''
    confirmarSenha.value = ''

    setTimeout(() => {
      router.back()
    }, 1000)

  } catch (error) {
    console.error('ERRO AO TROCAR SENHA:', error)

    erro.value =
      error.response?.data?.detail ||
      'Não foi possível alterar a senha.'
  } finally {
    carregando.value = false
  }
}
</script>

<template>
  <div class="trocar-senha">

    <div class="topo">
      <button @click="router.back()">
        <i class="fa-solid fa-arrow-left"></i>
      </button>

      <h2>Alterar senha</h2>
    </div>

    <div class="formulario">

      <div class="campo">
        <label>Senha atual</label>
        <input
          v-model="senhaAtual"
          type="password"
          placeholder="Digite sua senha atual"
        />
      </div>

      <div class="campo">
        <label>Nova senha</label>
        <input
          v-model="novaSenha"
          type="password"
          placeholder="Digite sua nova senha"
        />
      </div>

      <div class="campo">
        <label>Confirmar nova senha</label>
        <input
          v-model="confirmarSenha"
          type="password"
          placeholder="Digite novamente sua nova senha"
        />
      </div>

      <p v-if="erro" class="erro">
        {{ erro }}
      </p>

      <p v-if="sucesso" class="sucesso">
        {{ sucesso }}
      </p>

      <button
        class="btn-salvar"
        @click="trocarSenha"
        :disabled="carregando"
      >
        {{ carregando ? 'Alterando...' : 'Alterar senha' }}
      </button>

    </div>
  </div>
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

.topo h2 {
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
  width: 100%;
  padding: 13px;
  border: 1px solid #d8d0e5;
  border-radius: 12px;
  outline: none;
  background: white;
  color: #444;
}

.campo input:focus {
  border-color: #7a3ff2;
}

.erro {
  color: #d14b5b;
  font-size: 13px;
  margin-bottom: 15px;
}

.sucesso {
  color: #3d8b5c;
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
</style>