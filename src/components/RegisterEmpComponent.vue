<script setup>
import { useId, ref } from 'vue'
import { emailValido } from '@/utils/authErrors'
import { useCadastro } from '@/composables/useCadastro'

const campoId = 'cadastro-empresa-' + useId()
const arquivoIMP = ref(null)
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
} = useCadastro('empresa')
</script>

<template>
  <main class="cadastro cadastro-empresa mrj-ui">
    <header class="cadastro-apresentacao">
      <div class="cadastro-topo">
        <router-link to="/" class="btn-voltar" aria-label="Voltar ao login">
          <FontAwesomeIcon aria-hidden="true" :icon="['fas', 'arrow-left']" />
        </router-link>
        <div class="cadastro-marca">
          <img src="@/assets/images/logo.png" alt="" width="34" height="34" />
          <span>MaRuJoB’s</span>
        </div>
      </div>

      <div class="div-foto">
        <button
          type="button"
          class="photo-box"
          aria-label="Escolher foto de cadastro (opcional)"
          :disabled="ocupado || contaCriada"
          @click="arquivoIMP.click()"
        >
          <img v-if="preview" :src="preview" class="preview-img" alt="Prévia da foto de cadastro" />
          <FontAwesomeIcon v-else aria-hidden="true" :icon="['fas', 'building']" />
        </button>
        <input
          aria-label="Foto de cadastro (opcional)"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          :disabled="ocupado || contaCriada"
          @change="handleImageChange"
          hidden
          ref="arquivoIMP"
        />

        <p>Adicione a logo da sua empresa</p>
      </div>
      <h1>Criar conta da Empresa</h1>
      <p class="subtitle">Junte-se à nossa plataforma e impulsione sua empresa.</p>
    </header>

    <form class="form mrj-ui" @submit.prevent="criarConta" :aria-busy="ocupado">
      <div class="card">
        <label :for="`${campoId}-name`">Nome da empresa (obrigatório)</label>

        <div class="box">
          <FontAwesomeIcon aria-hidden="true" :icon="['fas', 'building']" class="icon" />
          <input
            :id="`${campoId}-name`"
            :aria-describedby="erros.length ? campoId + '-erro' : ''"
            :aria-invalid="!!erros.length && !name.trim()"
            v-model="name"
            type="text"
            autocomplete="name"
            required
            :disabled="ocupado || contaCriada"
            placeholder="Digite o nome da sua empresa..."
          />
        </div>
      </div>

      <div class="card">
        <label :for="`${campoId}-email`">E-mail corporativo (obrigatório)</label>

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
            placeholder="Digite seu e-mail corporativo..."
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

<style scoped src="../styles/cadastro.css"></style>
