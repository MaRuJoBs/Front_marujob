<script setup>
import { useId, ref } from 'vue'
import { emailValido } from '@/utils/authErrors'
import { useCadastro } from '@/composables/useCadastro'

const campoId = 'cadastro-' + useId()
const arquivoImp = ref(null)
const {
  name,
  email,
  senha,
  confirmarSenha,
  loading,
  preview,
  erros,
  contaCriada,
  ocupado,
  criarConta,
  handleImageChange,
  googleButton,
  googleLoading,
  googleErro,
  googlePronto,
  googleInicializando,
  carregarGoogle,
} = useCadastro('usuario')
</script>

<template>
  <main class="container">
    <div class="top">
      <router-link to="/" class="btn-voltar" aria-label="Voltar ao login">←</router-link>

      <div class="div-foto">
        <button
          type="button"
          class="photo-box"
          aria-label="Escolher foto de cadastro (opcional)"
          :disabled="ocupado || contaCriada"
          @click="arquivoImp.click()"
        >
          <img v-if="preview" :src="preview" class="preview-img" alt="Prévia da foto de cadastro" />
          <span v-else class="placeholder" aria-hidden="true">
            <span>👤</span>
          </span>
        </button>
        <input
          aria-label="Foto de cadastro (opcional)"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          :disabled="ocupado || contaCriada"
          @change="handleImageChange"
          hidden
          ref="arquivoImp"
        />

        <p>Adicione uma foto sua</p>
      </div>
    </div>

    <h1>Criar conta</h1>

    <p class="subtitle">Junte-se à nossa plataforma e mostre seu trabalho para o mundo.</p>

    <form class="form mrj-ui" @submit.prevent="criarConta" :aria-busy="ocupado">
      <div class="card">
        <label :for="`${campoId}-name`">Nome completo (obrigatório)</label>

        <div class="box">
          <FontAwesomeIcon aria-hidden="true" :icon="['fas', 'user']" class="icon" />
          <input
            :id="`${campoId}-name`"
            :aria-describedby="erros.length ? campoId + '-erro' : ''"
            :aria-invalid="!!erros.length && !name.trim()"
            v-model="name"
            type="text"
            autocomplete="name"
            required
            :disabled="ocupado || contaCriada"
            placeholder="Digite seu nome completo..."
          />
        </div>
      </div>

      <div class="card">
        <label :for="`${campoId}-email`">E-mail (obrigatório)</label>

        <div class="box">
          <FontAwesomeIcon aria-hidden="true" :icon="['fas', 'envelope']" class="icon" />
          <input
            :id="`${campoId}-email`"
            :aria-describedby="erros.length ? campoId + '-erro' : ''"
            :aria-invalid="!!erros.length && !emailValido(email)"
            v-model="email"
            type="email"
            autocomplete="email"
            required
            :disabled="ocupado || contaCriada"
            placeholder="Digite seu e-mail..."
          />
        </div>
      </div>

      <div class="card">
        <label :for="`${campoId}-senha`">Senha (obrigatório)</label>

        <div class="box">
          <FontAwesomeIcon aria-hidden="true" :icon="['fas', 'lock']" class="icon" />
          <input
            :id="`${campoId}-senha`"
            :aria-describedby="(erros.length ? campoId + '-erro' : '') + ' ' + campoId + '-ajuda'"
            :aria-invalid="!!erros.length && senha.length < 8"
            v-model="senha"
            type="password"
            autocomplete="new-password"
            minlength="8"
            required
            :disabled="ocupado || contaCriada"
            placeholder="Crie sua senha..."
          />
        </div>
      </div>

      <div class="card">
        <label :for="`${campoId}-confirmarSenha`">Confirmar senha (obrigatório)</label>

        <div class="box">
          <FontAwesomeIcon aria-hidden="true" :icon="['fas', 'lock']" class="icon" />
          <input
            :id="`${campoId}-confirmarSenha`"
            :aria-describedby="(erros.length ? campoId + '-erro' : '') + ' ' + campoId + '-ajuda'"
            :aria-invalid="!!erros.length && senha !== confirmarSenha"
            v-model="confirmarSenha"
            type="password"
            autocomplete="new-password"
            minlength="8"
            required
            :disabled="ocupado || contaCriada"
            placeholder="Confirme sua senha..."
          />
        </div>
      </div>

      <div class="box-senha" :id="`${campoId}-ajuda`">
        <p class="title">
          <FontAwesomeIcon aria-hidden="true" :icon="['fas', 'shield-halved']" class="icon" />
          Sua senha deve conter:
        </p>

        <div class="infos">
          <span>Pelo menos 8 caracteres.</span>
        </div>
      </div>

      <button v-if="!contaCriada" class="criarConta" type="submit" :disabled="ocupado">
        {{ loading ? 'Criando conta...' : 'Criar conta' }}
      </button>
      <div v-if="erros.length" :id="`${campoId}-erro`" class="error-box" role="alert">
        <p v-for="(erro, index) in erros" :key="index">• {{ erro }}</p>
      </div>

      <p v-if="loading" role="status">Criando sua conta. Aguarde a confirmação.</p>
      <div class="login">
        Já tem uma conta?
        <router-link to="/"><span>Entrar</span></router-link>
      </div>
      <div class="ou">
        <span></span>
        <p>ou</p>
        <span></span>
      </div>

      <div class="google-login" :inert="ocupado">
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
        <div ref="googleButton"></div>
      </div>
      <p v-if="googleLoading" role="status">Entrando com Google...</p>
      <p v-else-if="!googlePronto && !googleErro" role="status">Carregando acesso com Google...</p>
      <p v-if="googleErro" role="status">{{ googleErro }}</p>
    </form>
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
button:disabled {
  opacity: 0.7;
  cursor: wait;
}
.google-login {
  display: flex;
  justify-content: center;
  margin-top: 16px;
}
.ou {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 20px 0;
}

.ou span {
  flex: 1;
  height: 1px;
  background: #c5b9d5;
}

.ou p {
  margin: 0;
  color: #777;
  font-size: 13px;
}
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
  padding-bottom: 120px;
  font-family: Arial, Helvetica, sans-serif;
}

.top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.btn-voltar {
  display: grid;
  place-items: center;
  text-decoration: none;
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
  text-align: center;
}

.photo-box {
  border: 0;
  padding: 0;
  cursor: pointer;
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
  color: var(--mrj-color-text);
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

.box-senha {
  background: #d9d1e7;
  border-radius: 12px;
  padding: 15px;
  margin-top: 15px;
}

.box-senha p {
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
  border: 1px solid #796197;
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
  min-width: 0;
  border: none;
  outline: none;
  background: transparent;
  width: 100%;
  font-size: 16px;
  color: #333;
}

.box input::placeholder {
  color: #555;
}
/* F61 · Desktop: apresentação à esquerda e formulário à direita, centralizados. Campos,
   validações, Google e envio não mudam. */
@media (min-width: 64rem) {
  .container {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(24rem, 30rem);
    align-content: start;
    column-gap: 64px;
    padding: 56px max(48px, calc((100% - 66rem) / 2));
  }
  .container > * {
    grid-column: 1;
  }
  .container > .form {
    grid-column: 2;
    grid-row: 1 / span 8;
  }
  .top {
    justify-content: flex-start;
    gap: 32px;
  }
  h1 {
    margin-top: 32px;
  }
}
</style>
