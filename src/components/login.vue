<script setup>
import { useId, ref, computed, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'
import { login as fazerLogin, paginaInicial } from '@/services/authService'
import { useGoogleAuth } from '@/composables/useGoogleAuth'
import { mensagensErro, emailValido } from '@/utils/authErrors'

const campoId = 'login-' + useId()
const router = useRouter()
const route = useRoute()
const email = ref('')
const senha = ref('')
const senhaVisivel = ref(false)
const digitando = ref(false)
let fimDigitacao

function animarDigitacao() {
  digitando.value = true
  clearTimeout(fimDigitacao)
  fimDigitacao = setTimeout(() => { digitando.value = false }, 420)
}

onBeforeUnmount(() => clearTimeout(fimDigitacao))
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
    <div class="content" :class="{ digitando }">
      <div class="apresentacao">
        <div class="header">
          <img src="@/assets/images/logo.png" class="logo-top" alt="MaRuJoBs" />
          <img src="@/assets/images/slogan.png" class="slogan" alt="MaRuJoBs Freelances" />
        </div>

        <div class="info">
          <div class="text">
            <h1 tabindex="-1">
              <span class="texto-mobile">Entrar</span>
              <span class="texto-desktop">Onde talentos encontram <strong>oportunidades.</strong></span>
            </h1>
            <p class="texto-mobile">Acesse sua conta e continue conectado ao que importa</p>
            <p class="texto-desktop">
              Conecte-se a novos projetos, encontre profissionais e faça grandes ideias acontecerem.
            </p>
          </div>

          <div class="user-box">
            <div class="user-icon">
              <i aria-hidden="true" class="mdi mdi-account"></i>
            </div>
          </div>
        </div>

        <svg class="ilustracao-login" viewBox="0 0 500 270" aria-hidden="true" focusable="false">
          <!-- Fundo, janela e prateleira -->
          <path d="M42 219C20 165 60 90 141 49c67-34 152-38 225 0 72 36 113 104 93 170Z" fill="#eee2ff" />
          <path d="M59 219c19-38 68-55 122-50 44 4 81 25 138 11 54-13 99-4 129 39" fill="#e5d5fc" />
          <rect x="338" y="45" width="87" height="73" rx="15" fill="#f9f3ff" stroke="#d6c3f7" stroke-width="2" />
          <path d="M381 46v71m-42-35h85" stroke="#d6c3f7" stroke-width="2" />
          <circle cx="399" cy="65" r="9" fill="#fac591" />
          <path d="M350 106c11-13 20-13 31 0m4 0c11-13 20-13 31 0" fill="none" stroke="#c4b0ed" stroke-width="2" stroke-linecap="round" />
          <path d="M76 105h70m-58-15h26m6 0h14" stroke="#cab5ef" stroke-width="3" stroke-linecap="round" />

          <!-- Cadeira e tronco -->
          <path d="M128 214v-58a17 17 0 0 1 17-17h58v75" fill="#a78be6" />
          <path d="M143 214v-55a9 9 0 0 1 9-9h39v64" fill="#c0a7f2" />
          <path d="M150 214v-22c0-26 19-45 49-48l24-3c31 1 52 16 57 45l6 28Z" fill="#673FD7" />
          <path d="M152 214v-21c0-19 10-36 29-43-7 18-9 42-8 64Z" fill="#5B3CC4" />
          <path d="M198 130v15c1 12 20 18 30 2l-3-19Z" fill="#b66e61" />

          <!-- Rosto, cabelo e fones -->
          <g class="ilustracao-cabeca">
            <path d="M176 99c-8-24 6-49 33-54 24-5 52 11 53 38l-7 20-63 14Z" fill="#302348" />
            <path d="M247 83c5 13 5 32-3 44-7 10-22 18-38 12-13-5-22-17-24-33l4-22 35-22Z" fill="#e1a08a" />
            <path d="M181 107c-12-4-12-18-4-20 8-2 13 3 14 10l-4 12Z" fill="#e1a08a" />
            <path d="M183 91c-5-10-4-26 9-34 18-12 44-7 55 8 2 4 6 12 6 20-15-1-28-8-34-17-7 11-20 20-36 23Z" fill="#302348" />
            <path d="M214 118c6 4 12 4 17 0" stroke="#794651" stroke-width="2" fill="none" stroke-linecap="round" />
            <g class="ilustracao-olhar" fill="#372649">
              <ellipse cx="215" cy="99" rx="2.2" ry="3" />
              <ellipse cx="238" cy="98" rx="2.2" ry="3" />
            </g>
            <path d="M173 92c-3-25 13-44 37-48 19-4 36 3 45 18" stroke="#aa90ec" stroke-width="5" fill="none" stroke-linecap="round" />
            <rect x="166" y="83" width="15" height="28" rx="7.5" fill="#5B3CC4" />
            <path d="M173 110c3 9 11 13 23 13" stroke="#5B3CC4" stroke-width="2.5" fill="none" stroke-linecap="round" />
            <rect x="194" y="121" width="8" height="4" rx="2" fill="#5B3CC4" />
          </g>

          <!-- Bra?o, notebook e mesa -->
          <path d="M185 168c-11 4-17 14-16 26 0 9 7 16 18 16h40l-2-18-25-5-4-15Z" fill="#8261df" />
          <path class="ilustracao-mao" d="M214 192c14 0 24-1 34 1l24 6c5 2 4 8-2 9l-21 1-31 1Z" fill="#e1a08a" />
          <rect x="244" y="207" width="103" height="7" rx="3.5" fill="#634ca8" />
          <path d="M270 156h81a7 7 0 0 1 7 8l-11 44h-93l10-46a6 6 0 0 1 6-6Z" fill="#f9f4ff" stroke="#a88bdc" stroke-width="2" />
          <path d="M309 177l7 6-7 6-7-6Z" fill="#b99bed" />
          <path d="M377 193h19v14a7 7 0 0 1-7 7h-5a7 7 0 0 1-7-7Z" fill="#fff7ef" />
          <path d="M396 196h4a4 4 0 0 1 0 8h-4" fill="none" stroke="#fff7ef" stroke-width="3" />
          <path d="M384 183c-3-4 5-7 2-12" fill="none" stroke="#a991d4" stroke-width="2" stroke-linecap="round" />
          <rect x="61" y="214" width="382" height="11" rx="5.5" fill="#49316e" />
          <path d="M92 225h10l-5 30h-9Zm310 0h10l4 30h-9Z" fill="#7961a8" />
          <path d="M79 257h348" stroke="#cbb7ef" stroke-width="2" stroke-linecap="round" />
        </svg>
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
              @input="animarDigitacao"
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

          <div class="input input-senha">
            <i aria-hidden="true" class="mdi mdi-lock-outline"></i>

            <input
              :id="`${campoId}-senha`"
              :aria-describedby="error ? campoId + '-erro' : ''"
              :aria-invalid="!!error && !senha"
              v-model="senha"
              @input="animarDigitacao"
              :type="senhaVisivel ? 'text' : 'password'"
              autocomplete="current-password"
              autocapitalize="none"
              :spellcheck="false"
              required
              :disabled="ocupado"
              placeholder="Digite sua senha..."
            />
            <button
              class="alternar-senha"
              type="button"
              :aria-label="senhaVisivel ? 'Ocultar senha' : 'Mostrar senha'"
              :aria-pressed="senhaVisivel"
              :aria-controls="`${campoId}-senha`"
              :disabled="ocupado"
              @mousedown.prevent
              @click="senhaVisivel = !senhaVisivel"
            >
              <FontAwesomeIcon :icon="senhaVisivel ? faEye : faEyeSlash" aria-hidden="true" />
            </button>
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

.text h1 > span {
  font: inherit;
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

.input-senha {
  padding-right: 2px;
}

.input-senha input::-ms-reveal {
  display: none;
}

.alternar-senha {
  display: grid;
  place-items: center;
  flex: 0 0 44px;
  min-height: 44px;
  border: 0;
  border-radius: 4px;
  background: transparent;
  color: #673fd7;
  font-size: 1rem;
  cursor: pointer;
}

.alternar-senha:hover:enabled {
  background: #673fd71a;
}

.alternar-senha:focus-visible {
  outline: 3px solid #673fd7;
  outline-offset: -3px;
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
.texto-desktop,
.ilustracao-login {
  display: none;
}

@media (min-width: 64rem) {
  .paginaLogin {
    display: grid;
    place-items: center;
    min-height: 100dvh;
    padding: clamp(20px, 3dvh, 36px) clamp(32px, 4vw, 64px);
    overflow: visible;
    background: radial-gradient(ellipse at 18% 28%, #f7f0ff, transparent 63%), #e7d9f3;
  }
  .content {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(22rem, 26rem);
    align-items: center;
    gap: clamp(32px, 5vw, 80px);
    width: min(100%, 66rem);
    padding: 0;
  }
  .apresentacao {
    --login-roxo-secundario: #5b3cc4;
    min-width: 0;
    font-family: Poppins, sans-serif;
  }
  .header {
    align-items: center;
    justify-content: flex-start;
    gap: 8px;
    height: 76px;
    margin-bottom: clamp(18px, 2.5dvh, 26px);
  }
  .logo-top,
  .slogan {
    height: auto;
    margin: 0;
    padding: 0;
  }
  .logo-top {
    width: 76px;
  }
  .slogan {
    width: 184px;
    transform: translateY(16px);
  }
  .info {
    display: block;
    margin: 0;
  }
  .texto-mobile,
  .user-box {
    display: none;
  }
  .texto-desktop,
  .ilustracao-login {
    display: block;
  }
  .text h1 {
    max-width: 19ch;
    color: #241b40;
    font-size: clamp(2.125rem, 3.35vw, 3.125rem);
    font-weight: 700;
    line-height: 1.08;
    letter-spacing: -0.045em;
  }
  .text h1 strong {
    color: var(--login-roxo-secundario);
    font-weight: inherit;
  }
  .text p {
    width: auto;
    max-width: 43ch;
    margin-top: 12px;
    color: #544968;
    font-size: 1rem;
    line-height: 1.5;
  }
  .ilustracao-login {
    width: 100%;
    max-width: 32rem;
    height: clamp(144px, 26dvh, 236px);
    margin-top: 10px;
    pointer-events: none;
  }
  .form-card {
    grid-column: 2;
    padding: 32px;
    border-radius: 24px;
    background: #fff;
    box-shadow: 0 12px 40px #4c35671a;
  }
}

@media (min-width: 64rem) and (prefers-reduced-motion: no-preference) {
  .header,
  .text h1,
  .text p,
  .ilustracao-login {
    animation: apresentar-login 420ms ease-out both;
  }
  .text h1 { animation-delay: 70ms; }
  .text p { animation-delay: 145ms; }
  .ilustracao-login { animation-delay: 200ms; }
  .ilustracao-cabeca,
  .ilustracao-olhar {
    transform-box: fill-box;
    transform-origin: center;
    transition: transform 230ms ease-out;
  }
  .content:has(input[type="email"]:focus) .ilustracao-cabeca {
    transform: rotate(4deg) translate(3px, 1px);
  }
  .content:has(input[type="email"]:focus) .ilustracao-olhar {
    transform: translateX(2px);
  }
  .content:has(.input-senha:focus-within) .ilustracao-cabeca {
    transform: rotate(-6deg) translate(-2px, -2px);
  }
  .content:has(.input-senha:focus-within) .ilustracao-olhar {
    transform: translate(-2px, -1px) scaleY(0.35);
  }
  .digitando:has(input:focus) .ilustracao-mao {
    animation: digitar-login 220ms ease-in-out infinite alternate;
  }
}

@keyframes apresentar-login {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes digitar-login {
  to { transform: translate(3px, -3px); }
}
</style>
