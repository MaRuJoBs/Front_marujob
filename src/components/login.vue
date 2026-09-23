<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { login as fazerLogin, loginComGoogle } from '@/services/authService'
import { configurarGoogle } from '@/utils/googleAuth'
import { onMounted } from 'vue'
import api from '@/services/api'

const router = useRouter()

const email = ref('')
const senha = ref('')
const error = ref('')
const carregando = ref(false)
const googleButton = ref(null)
const googleLoading = ref(false)

const login = async () => {
  carregando.value = true

  try {
    const response = await fazerLogin(email.value, senha.value)

    localStorage.setItem('token', response.access)
    localStorage.setItem('refresh', response.refresh)

    const usuarioResponse = await api.get('usuarios/me/')
    const usuario = usuarioResponse.data


    console.log('USUÁRIO LOGADO:', usuario)
    console.log('GRUPOS:', usuario.groups)

    // Verifica o grupo do usuário
    const ehEmpresa = usuario.groups?.some((grupo) => grupo.name === 'Empresa')

    if (ehEmpresa) {
      router.push('/homeEmpresa')
    } else {
      router.push('/home')
    }
  } catch (erro) {
    console.error('ERRO NO LOGIN:', erro)
    error.value = 'E-mail ou senha inválidos.'
  } finally {
    carregando.value = false
  }
}

onMounted(async () => {
  try {
    await configurarGoogle(googleButton.value, async (response) => {
      googleLoading.value = true
      error.value = ''

      try {
        const data = await loginComGoogle(response.credential, null, false)

        localStorage.setItem('token', data.access)
        localStorage.setItem('refresh', data.refresh)

        localStorage.setItem('precisa_definir_senha', data.precisa_definir_senha ? 'true' : 'false')

        const usuario = data.user

        const ehEmpresa = usuario.groups?.some((grupo) => grupo.name === 'Empresa')

        if (ehEmpresa) {
          router.push('/homeEmpresa')
        } else {
          router.push('/home')
        }
      } catch (erro) {
        console.error('ERRO NO LOGIN GOOGLE:', erro)
        console.error('RESPOSTA:', erro.response?.data)

        const data = erro.response?.data

        if (data?.detail) {
          error.value = data.detail
        } else {
          error.value = 'Não foi possível entrar com o Google.'
        }
      } finally {
        googleLoading.value = false
      }
    })
  } catch (erro) {
    console.error('Não foi possível carregar o Google:', erro)
  }
})
</script>

<template>
  <div class="paginaLogin">
    <div class="content">
      <div class="header">
        <img src="@/assets/images/logo.png" class="logo-top" />
        <img src="@/assets/images/slogan.png" class="slogan" />
      </div>

      <div class="info">
        <div class="text">
          <h1>Entrar</h1>
          <p>Acesse sua conta e continue conectado ao que importa</p>
        </div>

        <div class="user-box">
          <div class="user-icon">
            <i class="mdi mdi-account"></i>
          </div>
        </div>
      </div>

      <div class="form-card">
        <div class="field">
          <label>E-mail</label>

          <div class="input">
            <i class="mdi mdi-email-outline"></i>

            <input v-model="email" type="email" placeholder="Digite seu e-mail..." />
          </div>
        </div>

        <div class="field">
          <label>Senha</label>

          <div class="input">
            <i class="mdi mdi-lock-outline"></i>

            <input v-model="senha" type="password" placeholder="Digite sua senha..." />
          </div>
        </div>
        <p v-if="error" class="error-message">
          {{ error }}
        </p>

        <div class="forgot">Esqueceu sua senha?</div>

        <button class="btn-login" @click="login" :disabled="carregando">
          {{ carregando ? 'Entrando...' : 'Entrar' }}
        </button>
        <div class="ou">
          <span>ou</span>
        </div>

        <div ref="googleButton" class="google-button"></div>

        <div class="register">
          Não tem uma conta?
          <ul>
            <li>
              <router-link to="/register"><span>Criar conta Usuário</span></router-link>
            </li>
            <li>
              <router-link to="/registerEmpresa"><span>Criar conta Empresa</span></router-link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
.header {
  display: flex;
  justify-content: center;
  height: 150px;
}

.logo-top {
  width: 100px;
  height: 100px;
  margin-top: 10px;
}
.slogan {
  width: 200px;
  height: 200px;
  padding-bottom: 30px;
}
.error-message {
  color: red;
  font-size: 12px;
  margin-top: -10px;
  margin-bottom: 10px;
  text-align: center;
}

.paginaLogin {
  min-height: 100vh;
  background: #e7d9f3;
  position: relative;
  overflow: hidden;
}

.content {
  padding: 10px 22px 22px 22px;
  position: relative;
  z-index: 2;
}

.info {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 30px;
}

.text h1 {
  font-size: 46px;
  color: #4f2ba5;
  font-weight: 700;
}

.text p {
  margin-top: 8px;
  color: #726a85;
  font-size: 14px;
  line-height: 20px;
  width: 180px;
}

.user-box {
  width: 96px;
  height: 96px;

  background: #f1edf6;

  border-radius: 16px;

  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.18);

  display: flex;
  align-items: center;
  justify-content: center;
}

.user-icon {
  font-size: 46px;
  color: #8868d3;
}

.form-card {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 8px;
}

.field {
  margin-bottom: 16px;
}

.field label {
  display: block;
  margin-bottom: 8px;

  color: #4f2ba5;
  font-weight: 600;
  font-size: 18px;
}

.input {
  height: 31px;
  background: #d9d9d9;
  border-radius: 3px;

  display: flex;
  align-items: center;

  padding: 0 10px;
}

.input i {
  color: #666;
  font-size: 18px;
  margin-right: 8px;
}

.input input {
  flex: 1;
  border: none;
  background: none;
  outline: none;
  color: #555;
  font-size: 13px;
}

.input input::placeholder {
  color: #9a9a9a;
}

.forgot {
  text-align: right;
  font-size: 11px;
  color: #4f2ba5;
  margin-top: -2px;
  margin-bottom: 18px;
}

.btn-login {
  width: 100%;
  height: 42px;

  border: none;
  border-radius: 8px;

  background: #6e4ab7;

  color: white;
  font-size: 18px;
  font-weight: 600;
}

.register {
  margin-top: 18px;
  text-align: center;
  font-size: 12px;
  color: #8a8a8a;
}
.register ul {
  list-style: none;
  margin-top: 8px;
}

.register span {
  color: #4f2ba5;
  font-weight: 700;
}

.ou {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 18px 0;
  color: #777;
  font-size: 12px;
}

.google-button {
  display: flex;
  justify-content: center;
}
</style>
