<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { registrar, login as fazerLogin } from '@/services/authService'


const router = useRouter()
const name = ref('')
const email = ref('')
const senha = ref('')
const arquivoIMP = ref(null)
const imagem = ref(null)
const preview = ref(null)

const confirmarSenha = ref('')
const erros = ref([])
const tentouEnviar = ref(false)

const loading = ref(false);

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

  loading.value = true

  try {
    const formData = new FormData()

    formData.append('name', name.value)
    formData.append('email', email.value)
    formData.append('password', senha.value)
    formData.append('tipo', 'empresa')

    if (imagem.value) {
      formData.append('profile_image', imagem.value)
    }

    await registrar(formData)

    const loginResponse = await fazerLogin(email.value, senha.value)
    //automatico

    localStorage.setItem('token', loginResponse.access)
    localStorage.setItem('refresh', loginResponse.refresh)

    router.push('/homeEmpresa')
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

  } finally {
    loading.value = false

  }
}

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
      <router-link to="/">
        <button class="btn-voltar">←</button>
      </router-link>

      <div class="div-foto">
        <div class="photo-box" @click="arquivoIMP.click()">
          <input type="file" @change="handleImageChange" hidden ref="arquivoIMP" />
          <img v-if="preview" :src="preview" class="preview-img" />
          <div v-else class="placeholder">
            <span>👤</span>
            
          </div>
        </div>

        <p>Adicione a logo da sua empresa</p>
      </div>
    </div>

    <h1>Criar conta da Empresa</h1>

    <p class="subtitle">Junte-se à nossa plataforma e impulsione sua empresa.</p>

    <div class="form">
      <div class="card">
        <label>Nome da empresa</label>

        <div class="box">
          <FontAwesomeIcon :icon="['fas', 'building']" class="icon" />
          <input v-model="name" type="text" placeholder="Digite o nome da sua empresa..." />
        </div>
      </div>

      <div class="card">
        <label>E-mail corporativo</label>

        <div class="box">
          <FontAwesomeIcon :icon="['fas', 'envelope']" class="icon" />
          <input v-model="email" type="email" placeholder="Digite seu e-mail corporativo..." />
        </div>
      </div>

      <div class="card">
        <label>Senha</label>

        <div class="box">
          <FontAwesomeIcon :icon="['fas', 'lock']" class="icon" />
          <input v-model="senha" type="password" placeholder="Crie sua senha..." />
        </div>
      </div>

      <div class="card">
        <label>Confirmar senha</label>

        <div class="box">
          <FontAwesomeIcon :icon="['fas', 'lock']" class="icon" />
          <input v-model="confirmarSenha" type="password" placeholder="Confirme sua senha..." />
        </div>
      </div>

      <div class="senha">
        <p class="title">
          <FontAwesomeIcon :icon="['fas', 'shield-halved']" class="icon" />
          Sua senha deve conter:
        </p>

        <div class="infos">
          <span>○ +7 Caracteres</span>
          <span>○ +5 letras</span>
          <span>○ +2 números</span>
        </div>
      </div>

      <button class="criarConta" @click="criarConta" :disabled="loading">
        {{ loading ? 'Criando conta...' : 'Criar conta' }}
      </button>
<div v-if="tentouEnviar && erros.length" class="box-erro">
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
.box-erro {
  margin-top: 15px;
  background: #ffe6e6;
  border: 1px solid #ff4d4d;
  border-radius: 10px;
  padding: 12px;
}

.box-erro p {
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
  padding-bottom: 120px; 
  font-family: Arial, Helvetica, sans-serif;
}

.top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.btn-voltar {
  width: 45px;
  height: 45px;
  border: none;
  border-radius: 50%;
  background: #d8c6ff;
  color: #5b38b0;
  font-size: 20px;
  cursor: pointer;


}

.div-foto {
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


.div-foto p {

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

.form {
  background: #e8dcf3;
  border-radius: 20px;
  padding: 25px;
}

.card {
  margin-bottom: 20px;
}

.card label {
  display: block;
  margin-bottom: 8px;

  color: #2e1a74;
  font-weight: 600;
}



.card input {
  width: 100%;
  height: 42px;
  border: none;
  border-radius: 8px;
  background: #d6d6d6;
  padding: 0 12px;
}

.senha {
  background: #d9d1e7;
  border-radius: 12px;
  padding: 15px;
  margin-top: 15px;
}

.senha p {
  color: #2e1a74;
  font-weight: 600;
  margin-bottom: 10px;

}



.infos {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #666;
}

.criarConta {
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


.title {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #2e1a74;
  font-weight: 600;


  margin-bottom: 10px;
}

.title .icon {
  color: #6d4dc2;
  font-size: 16px;
}


.box {
  display: flex;
  align-items: center;
  background: #d6d6d6;
  border-radius: 10px;
  padding: 0 12px;
  height: 45px;
  gap: 10px;
}

.box .icon {
  color: #6d4dc2;
  font-size: 18px;


  min-width: 20px;
}

.box input {
  border: none;
  outline: none;
  background: transparent;
  width: 100%;

  font-size: 14px;
  color: #333;
}

.box input::placeholder {
  color: #888;
}
</style>