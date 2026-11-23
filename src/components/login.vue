<script setup>
import { useId, ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { login as fazerLogin, paginaInicial } from '@/services/authService'
import { useGoogleAuth } from '@/composables/useGoogleAuth'
import { mensagensErro, emailValido } from '@/utils/authErrors'

const campoId = 'login-' + useId()
const router = useRouter()
const route = useRoute()
const email = ref('')
const senha = ref('')
const motivos = {
  grupo: 'Não foi possível identificar o grupo da sua conta. Contate o suporte.',
  conexao: 'Não foi possível validar sua sessão. Verifique sua conexão e tente novamente.',
  sessao: 'Sua sessão expirou. Entre novamente.',
}
const error = ref(motivos[route.query.motivo] || '')
const carregando = ref(false)
const {
  googleButton,
  googleLoading,
  googleErro,
  googlePronto,
  googleInicializando,
  carregarGoogle,
} = useGoogleAuth({
  ocupado: carregando,
  onSuccess: () => router.replace(paginaInicial()),
  onError: (mensagens) => {
    error.value = mensagens.join(' ')
  },
})
const ocupado = computed(() => carregando.value || googleLoading.value)

const login = async () => {
  if (ocupado.value) return
  error.value = ''
  if (!emailValido(email.value) || !senha.value) {
    error.value = 'Informe um e-mail válido e sua senha.'
    return
  }
  carregando.value = true
  try {
    await fazerLogin(email.value, senha.value)
    await router.replace(paginaInicial())
  } catch (erro) {
    error.value = mensagensErro(erro, 'E-mail ou senha inválidos.').join(' ')
  } finally {
    carregando.value = false
  }
}
</script>

<template>
  <main class="paginaLogin">
    <div class="content">
      <div class="header">
        <img src="@/assets/images/logo.png" class="logo-top" alt="MaRuJoBs" />
        <img src="@/assets/images/slogan.png" class="slogan" alt="MaRuJoBs Freelances" />
      </div>

      <div class="info">
        <div class="text">
          <h1>Entrar</h1>
          <p>Acesse sua conta e continue conectado ao que importa</p>
        </div>

        <div class="user-box">
          <div class="user-icon">
            <i aria-hidden="true" class="mdi mdi-account"></i>
          </div>
        </div>
      </div>

      <form class="form-card mrj-ui" @submit.prevent="login" :aria-busy="ocupado">
        <div class="field">
          <label :for="`${campoId}-email`">E-mail (obrigatório)</label>

          <div class="input">
            <i aria-hidden="true" class="mdi mdi-email-outline"></i>

            <input
              :id="`${campoId}-email`"
              :aria-describedby="error ? campoId + '-erro' : ''"
              :aria-invalid="!!error && !emailValido(email)"
              v-model="email"
              type="email"
              autocomplete="email"
              required
              :disabled="ocupado"
              placeholder="Digite seu e-mail..."
            />
          </div>
        </div>

        <div class="field">
          <label :for="`${campoId}-senha`">Senha (obrigatório)</label>

          <div class="input">
            <i aria-hidden="true" class="mdi mdi-lock-outline"></i>

            <input
              :id="`${campoId}-senha`"
              :aria-describedby="error ? campoId + '-erro' : ''"
              :aria-invalid="!!error && !senha"
              v-model="senha"
              type="password"
              autocomplete="current-password"
              required
              :disabled="ocupado"
              placeholder="Digite sua senha..."
            />
          </div>
        </div>
        <p v-if="error" class="error-message" :id="`${campoId}-erro`" role="alert">
          {{ error }}
        </p>

        <button class="btn-login" type="submit" :disabled="ocupado">
          {{ carregando ? 'Entrando...' : 'Entrar' }}
        </button>
        <p v-if="carregando" role="status">Entrando na sua conta...</p>
        <div class="ou">
          <span>ou</span>
        </div>

        <div class="google-auth" :inert="ocupado">
          <button
            v-if="!googlePronto"
            class="google-fallback"
            type="button"
            :disabled="googleInicializando || ocupado"
            @click="carregarGoogle"
          >
            {{
              googleInicializando
                ? 'Carregando Google...'
                : googleErro
                  ? 'Tentar Google novamente'
                  : 'Entrar com Google'
            }}
          </button>
          <div ref="googleButton" class="google-button"></div>
        </div>
        <p v-if="googleLoading" role="status">Entrando com Google...</p>
        <p v-else-if="!googlePronto && !googleErro" role="status">
          Carregando acesso com Google...
        </p>
        <p v-if="googleErro" class="error-message" role="status">{{ googleErro }}</p>

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
      </form>
    </div>
  </main>
</template>

<style scoped>
.google-fallback {
  width: 300px;
  max-width: 100%;
  min-height: 40px;
  border: 1px solid #dadce0;
  border-radius: 4px;
  background: white;
  color: #5f6368;
  font-size: 14px;
}
.google-auth {
  display: flex;
  justify-content: center;
  min-height: 40px;
}
button:disabled {
  cursor: wait;
  opacity: 0.7;
}
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
  color: #b30000;
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
  color: var(--mrj-color-text);
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
  border: 1px solid #796197;
  min-height: 44px;
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
  min-width: 0;
  min-height: 44px;
  flex: 1;
  border: none;
  background: none;
  outline: none;
  color: #555;
  font-size: 16px;
}

.input input::placeholder {
  color: #555;
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
  color: #555;
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
/* F61 · Desktop: apresentação (marca e título) à esquerda e formulário em cartão à direita,
   centralizados com largura máxima. Campos, Google e autenticação não mudam. */
@media (min-width: 64rem) {
  .paginaLogin {
    display: grid;
    place-items: center;
    padding: 48px;
  }
  .content {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(22rem, 26rem);
    align-items: center;
    column-gap: 64px;
    width: min(100%, 60rem);
    padding: 0;
  }
  .header,
  .info {
    grid-column: 1;
    justify-content: flex-start;
  }
  .header {
    align-self: end;
  }
  .info {
    align-self: start;
  }
  .form-card {
    grid-column: 2;
    grid-row: 1 / span 2;
    padding: 32px;
    border-radius: 24px;
    background: #fff;
    box-shadow: 0 12px 40px #4c35671a;
  }
}
</style>
