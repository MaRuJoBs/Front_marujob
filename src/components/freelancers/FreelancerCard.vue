<script setup>
import { ref, watch } from 'vue'
const props = defineProps({ perfil: { type: Object, required: true } })
const fotoFalhou = ref(false)
watch(
  () => props.perfil.foto_perfil,
  () => {
    fotoFalhou.value = false
  },
)
defineEmits(['abrir', 'chat'])
</script>
<template>
  <article class="profissional profissional-linha">
    <img
      v-if="perfil.foto_perfil && !fotoFalhou"
      :src="perfil.foto_perfil"
      alt=""
      loading="lazy"
      referrerpolicy="no-referrer"
      @error="fotoFalhou = true"
    />
    <span v-else class="avatar" aria-hidden="true">◎</span>
    <div class="identidade-profissional">
      <h2>
        <button class="nome-profissional" type="button" @click="$emit('abrir', perfil.id)">
          {{ perfil.nome || 'Nome não informado' }}
        </button>
      </h2>
      <p v-if="perfil.profissao" class="categoria-profissional">{{ perfil.profissao }}</p>
      <p v-if="perfil.cidade" class="cidade-profissional">
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
        >
          <path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 0 1 14 0Z" />
          <circle cx="12" cy="10" r="2.5" /></svg
        >{{ perfil.cidade }}
      </p>
      <ul
        v-if="perfil.habilidades.length"
        class="especialidades-profissional"
        aria-label="Habilidades"
      >
        <li v-for="habilidade in perfil.habilidades.slice(0, 3)" :key="habilidade">
          {{ habilidade }}
        </li>
        <li v-if="perfil.habilidades.length > 3">+{{ perfil.habilidades.length - 3 }}</li>
      </ul>
    </div>
    <button class="botao-chat" type="button" @click="$emit('chat', perfil.id)">
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
      >
        <path d="M20 11.5a8 8 0 0 1-8 8H5l-3 2v-10a9 9 0 0 1 18 0Z" />
        <path d="M7 11h10M7 15h6" />
      </svg>
      Chat<span class="sr-only"> com {{ perfil.nome || 'profissional' }}</span>
    </button>
  </article>
</template>
<style scoped src="../../styles/freelancers-publicos.css"></style>
