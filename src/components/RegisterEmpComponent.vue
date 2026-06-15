<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const name = ref('')
const email = ref('')
const senha = ref('')
const fileInput = ref(null)
const imagem = ref(null)
const preview = ref(null)

const confirmarSenha = ref('')
const erros = ref([])
const tentouEnviar = ref(false)

const criarConta = async () => {
  tentouEnviar.value = true
  erros.value = []
  if (!name.value) {
    erros.value.push('Nome é obrigatório')
  }

  if (!email.value) {
    erros.value.push('Email é obrigatório')
  }

  if (senha.value.length < 8) {
    erros.value.push('A senha deve ter no mínimo 8 caracteres')
  }

  if (senha.value !== confirmarSenha.value) {
    erros.value.push('As senhas não coincidem')
  }

  if (erros.value.length > 0) return

  try {
    const formData = new FormData()

    formData.append('name', name.value)
    formData.append('email', email.value)
    formData.append('password', senha.value)

    if (imagem.value) {
      formData.append('profile_image', imagem.value)
    }

    await axios.post('http://127.0.0.1:8000/api/registro/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    const loginResponse = await axios.post('http://127.0.0.1:8000/api/token/', {
      email: email.value,
      password: senha.value,
    })

    localStorage.setItem('token', loginResponse.data.access)
    localStorage.setItem('refresh', loginResponse.data.refresh)

    router.push('/home')

  } catch (error) {
    const data = error.response?.data
    if (data) {
    if (data.email) {
      erros.value.push('Este email já está em uso')
    } else if (data.detail) {
      erros.value.push(data.detail)
    } else {
      erros.value.push('Erro ao criar conta')
    }
  } else {
    erros.value.push('Erro de conexão com o servidor')
  }
  }
}
// estilização da pagina de registro, ainda não finalizada

function handleImageChange(event) {
  const file = event.target.files[0]
  if (!file) return

  imagem.value = file
  preview.value = URL.createObjectURL(file)
}
</script>

<template>
  <div class="container">
    <div class="top">
      <button class="back-button">←</button>

      <div class="photo-section">
        <div class="photo-box" @click="fileInput.click()">
          <input type="file" @change="handleImageChange" hidden ref="fileInput" />
          <img v-if="preview" :src="preview" class="preview-img" />
          <div v-else class="placeholder">
            <span>👤</span>
            <span class="plus">+</span>
          </div>
        </div>

        <p>Adicione a logo da sua empresa</p>
      </div>
    </div>

    <h1>Criar conta da Empresa</h1>

    <p class="subtitle">Junte-se à nossa plataforma e impulsione sua empresa.</p>

    <div class="card">
      <div class="field">
        <label>Nome da empresa</label>

        <div class="input-box">
          <FontAwesomeIcon :icon="['fas', 'building']" class="icon" />
          <input v-model="name" type="text" placeholder="Digite o nome da sua empresa..." />
        </div>
      </div>

      <div class="field">
        <label>E-mail corporativo</label>

        <div class="input-box">
          <FontAwesomeIcon :icon="['fas', 'envelope']" class="icon" />
          <input v-model="email" type="email" placeholder="Digite seu e-mail corporativo..." />
        </div>
      </div>

      <div class="field">
        <label>Senha</label>

        <div class="input-box">
          <FontAwesomeIcon :icon="['fas', 'lock']" class="icon" />
          <input v-model="senha" type="password" placeholder="Crie sua senha..." />
        </div>
      </div>

      <div class="field">
        <label>Confirmar senha</label>

        <div class="input-box">
          <FontAwesomeIcon :icon="['fas', 'lock']" class="icon" />
          <input v-model="confirmarSenha" type="password" placeholder="Confirme sua senha..." />
        </div>
      </div>

      <div class="password-box">
        <p class="password-title">
          <FontAwesomeIcon :icon="['fas', 'shield-halved']" class="icon" />
          Sua senha deve conter:
        </p>

        <div class="rules">
          <span>○ +7 Caracteres</span>
          <span>○ +5 letras</span>
          <span>○ +2 números</span>
        </div>
      </div>

      <button class="create-account" @click="criarConta">
  Criar conta
</button>
<div v-if="tentouEnviar && erros.length" class="error-box">
  <p v-for="(erro, index) in erros" :key="index">
    • {{ erro }}
  </p>
</div>

      <div class="login">
        Já tem uma conta?
        <router-link to="/"><span>Entrar</span></router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.error-box {
  margin-top: 15px;
  background: #ffe6e6;
  border: 1px solid #ff4d4d;
  border-radius: 10px;
  padding: 12px;
}

.error-box p {
  color: #b30000;
  font-size: 13px;
  margin: 4px 0;
}
.preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 20px;
}
.container {
  min-height: 100vh;
  background: #f4f4f4;
  padding: 30px;
  padding-bottom: 120px; /* 👈 ESSENCIAL */
  font-family: Arial, Helvetica, sans-serif;
}

.top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.back-button {
  width: 45px;
  height: 45px;
  border: none;
  border-radius: 50%;
  background: #d8c6ff;
  color: #5b38b0;
  font-size: 20px;
  cursor: pointer;
}

.photo-section {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    margin-bottom: 30px;
  
}

.photo-box {
  width: 120px;
  height: 120px;
  border-radius: 20px;
  background: #ece5f7;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.15);
}

.photo-box span {
  font-size: 45px;
  color: #6d4dc2;
}

.plus {
  position: absolute;
  right: 15px;
  bottom: 15px;
  font-size: 28px !important;
}

.photo-section p {
  margin-top: 8px;
  font-size: 12px;
  color: #666;
}

h1 {
  color: #2e1a74;
  font-weight: bold;
}

.subtitle {
  color: #3c2398c0;
  margin-bottom: 20px;
  max-width: 260px;
}

.card {
  background: #e8dcf3;
  border-radius: 20px;
  padding: 25px;
}

.field {
  margin-bottom: 20px;
}

.field label {
  display: block;
  margin-bottom: 8px;
  color: #2e1a74;
  font-weight: 600;
}

.field input {
  width: 100%;
  height: 42px;
  border: none;
  border-radius: 8px;
  background: #d6d6d6;
  padding: 0 12px;
}

.password-box {
  background: #d9d1e7;
  border-radius: 12px;
  padding: 15px;
  margin-top: 15px;
}

.password-box p {
  color: #2e1a74;
  font-weight: 600;
  margin-bottom: 10px;
}

.rules {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #666;
}

.create-account {
  width: 100%;
  height: 50px;
  margin-top: 30px;
  border: none;
  border-radius: 12px;
  background: #6f50c5;
  color: white;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
}

.login {
  text-align: center;
  margin-top: 20px;
  color: #777;
}

.login a {
  color: #2e1a74;
  text-decoration: none;
  font-weight: bold;
}

/* NOVOS ESTILOS PARA O TÍTULO DE REQUISITOS DE SENHA */
.password-title {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #2e1a74;
  font-weight: 600;
  margin-bottom: 10px;
}

.password-title .icon {
  color: #6d4dc2;
  font-size: 16px;
}

/* NOVOS ESTILOS PARA OS CAMPOS DE INPUT */
.input-box {
  display: flex;
  align-items: center;
  background: #d6d6d6;
  border-radius: 10px;
  padding: 0 12px;
  height: 45px;
  gap: 10px;
}

.input-box .icon {
  color: #6d4dc2;
  font-size: 18px;
  min-width: 20px;
}

.input-box input {
  border: none;
  outline: none;
  background: transparent;
  width: 100%;
  font-size: 14px;
  color: #333;
}

.input-box input::placeholder {
  color: #888;
}
</style>