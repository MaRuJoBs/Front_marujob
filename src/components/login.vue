<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()

const email = ref('')
const senha = ref('')
const error = ref('')

const login = async () => {
  try {
    const response = await axios.post(
      'http://127.0.0.1:8000/api/token/',
      {
        email: email.value,
        password: senha.value,
      }
    )

    localStorage.setItem('token', response.data.access)
    localStorage.setItem('refresh', response.data.refresh)

    router.push('/home')
  } catch (erro) {
    error.value = 'E-mail ou senha inválidos.'
  }
}

</script>

<template>
  <div class="login-page">
    <!-- decoração topo -->
    <div class="wave-top"></div>

    <div class="content">
      <img src="@/assets/images/logo.png" alt="logo" class="logo" />

      <div class="hero">
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
        <button @click="login"></button>

        <div class="forgot">Esqueceu sua senha?</div>

        <button class="btn-login" @click="login">
  Entrar
</button>

        <div class="register">
          Não tem uma conta?
          <ul>
            <li><router-link to="/register"><span>Criar conta Usuário</span></router-link></li>
            <li><router-link to="/registerEmpresa"><span>Criar conta Empresa</span></router-link></li>
          </ul>
        </div>
      </div>
    </div>
    <!-- decoração rodapé -->
    <div class="wave-bottom"></div>
  </div>
</template>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
.error-message{
    color: red;
    font-size: 12px;
    margin-top: -10px;
    margin-bottom: 10px;
    text-align: center;
}

.login-page {
  min-height: 100vh;
  background: #e7d9f3;
  position: relative;
  overflow: hidden;
}

.content {
  padding: 22px;
  position: relative;
  z-index: 2;
}

.logo {
  width: 185px;
  display: block;
  margin: 8px auto 35px;
}

.hero {
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

.wave-top {
  position: absolute;
  top: -100px;
  left: -80px;

  width: 220px;
  height: 220px;

  background: radial-gradient(circle, rgba(190, 150, 255, 0.5), transparent 70%);
}

.wave-bottom {
  position: absolute;
  bottom: -60px;
  left: -20px;

  width: 120%;
  height: 180px;

  background: radial-gradient(ellipse at center, rgba(177, 120, 255, 0.35), transparent 70%);
}
</style>
