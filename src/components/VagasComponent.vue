<template>
  <div class="tela-vagas" :style="{ backgroundImage: `url(${fundoEmp})` }">
    <!-- Cabeçalho / Logo -->
    <header class="cabecalho">
      <img :src="logo" alt="MaRuJOB's" class="logo" />
    </header>

    <!-- Título -->
    <div class="titulo-bloco">
      <h1>Vagas</h1>
      <p>Todas as vagas de outras empresas.</p>
    </div>

    <!-- Busca -->
    <div class="busca-linha">
      <div class="campo-busca">
        <i class="ti ti-search"></i>
        <input
          v-model="termoBusca"
          type="text"
          placeholder="Buscar por cargo ou palavra-chave..."
        />
      </div>
      <button class="botao-filtros" @click="$emit('abrir-filtros')">
        <i class="ti ti-adjustments-horizontal"></i>
        <span>Filtros</span>
      </button>
    </div>

    <!-- Categorias -->
    <div class="categorias">
      <button
        v-for="cat in categorias"
        :key="cat"
        class="chip-categoria"
        :class="{ ativo: categoriaAtiva === cat }"
        @click="categoriaAtiva = cat"
      >
        {{ cat }}
        <i v-if="cat === 'Mais'" class="ti ti-chevron-down"></i>
      </button>
    </div>

    <!-- Lista de vagas -->
    <div class="lista-vagas">
      <article
        v-for="vaga in vagasFiltradas"
        :key="vaga.id"
        class="card-vaga"
        @click="$emit('abrir-vaga', vaga)"
      >
        <div class="icone-vaga">
          <i class="ti ti-device-desktop"></i>
        </div>

        <div class="info-vaga">
          <h3>{{ vaga.titulo }}</h3>
          <p class="empresa">{{ vaga.empresa }}</p>
          <div class="meta">
            <span><i class="ti ti-calendar"></i> {{ vaga.prazo }}</span>
            <span><i class="ti ti-map-pin"></i> {{ vaga.local }}</span>
          </div>
        </div>

        <div class="lateral-vaga">
          <span class="valor">{{ vaga.valor }}</span>
          <span class="categoria-tag">{{ vaga.categoria }}</span>
        </div>

        <i class="ti ti-chevron-right seta"></i>
      </article>
    </div>

    <!-- Navegação inferior -->
    <nav class="nav-inferior">
      <button
        v-for="item in navItens"
        :key="item.nome"
        class="nav-item"
        :class="{ ativo: rotaAtiva === item.nome }"
        @click="rotaAtiva = item.nome"
      >
        <i :class="`ti ti-${item.icone}`"></i>
        <span>{{ item.label }}</span>
      </button>
    </nav>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// Ajuste os caminhos conforme a pasta de assets do seu projeto
import fundoEmp from '@/assets/images/fundoemp.png'
import logo from '@/assets/images/logo.png'

defineEmits(['abrir-filtros', 'abrir-vaga'])

const termoBusca = ref('')
const categoriaAtiva = ref('Todas')
const rotaAtiva = ref('Vagas')

const categorias = ['Todas', 'Design', 'Desenvolvimento', 'Mais']

const navItens = [
  { nome: 'Inicio', icone: 'home', label: 'Início' },
  { nome: 'Freelancers', icone: 'users', label: 'Freelancers' },
  { nome: 'Vagas', icone: 'briefcase', label: 'Vagas' },
  { nome: 'Mensagens', icone: 'message-circle', label: 'Mensagens' },
  { nome: 'Empresa', icone: 'user', label: 'Empresa' },
]

// Substitua pelos dados vindos da sua API
const vagas = ref([
  {
    id: 1,
    titulo: 'Design de App',
    empresa: 'Startup Criativa',
    prazo: '3 dias',
    local: 'Home-Office',
    valor: 'R$ 350',
    categoria: 'Design',
  },
  {
    id: 2,
    titulo: 'Design de App',
    empresa: 'Startup Criativa',
    prazo: '3 dias',
    local: 'Home-Office',
    valor: 'R$ 350',
    categoria: 'Design',
  },
  {
    id: 3,
    titulo: 'Design de App',
    empresa: 'Startup Criativa',
    prazo: '3 dias',
    local: 'Home-Office',
    valor: 'R$ 350',
    categoria: 'Design',
  },
  {
    id: 4,
    titulo: 'Design de App',
    empresa: 'Startup Criativa',
    prazo: '3 dias',
    local: 'Home-Office',
    valor: 'R$ 350',
    categoria: 'Design',
  },
])

const vagasFiltradas = computed(() => {
  return vagas.value.filter((v) => {
    const passaCategoria =
      categoriaAtiva.value === 'Todas' || v.categoria === categoriaAtiva.value
    const passaBusca = v.titulo
      .toLowerCase()
      .includes(termoBusca.value.toLowerCase())
    return passaCategoria && passaBusca
  })
})
</script>

<style scoped>
:root {
  --roxo-escuro: #4a3d7d;
  --roxo-texto: #5c4f96;
  --roxo-medio: #7c6bc4;
  --roxo-pilula: #6a5acd;
}

.tela-vagas {
  max-width: 420px;
  margin: 0 auto;
  min-height: 100vh;
  background-size: cover;
  background-position: top;
  background-repeat: no-repeat;
  background-color: #b6a3e8;
  display: flex;
  flex-direction: column;
  font-family: 'Poppins', 'Segoe UI', sans-serif;
  padding-bottom: 90px;
  position: relative;
  box-shadow: 0 0 40px rgba(0, 0, 0, 0.15);
}

.cabecalho {
  display: flex;
  justify-content: center;
  padding: 26px 20px 6px;
}

.logo {
  height: 44px;
  object-fit: contain;
  filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.12));
}

.titulo-bloco {
  padding: 18px 22px 2px;
}

.titulo-bloco h1 {
  font-size: 27px;
  font-weight: 700;
  margin: 0 0 4px;
  color: var(--roxo-escuro);
}

.titulo-bloco p {
  font-size: 13px;
  margin: 0;
  color: var(--roxo-texto);
}

.busca-linha {
  display: flex;
  gap: 10px;
  padding: 16px 22px 4px;
}

.campo-busca {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fff;
  border-radius: 14px;
  padding: 0 14px;
  height: 44px;
  box-shadow: 0 2px 8px rgba(74, 61, 125, 0.1);
}

.campo-busca i {
  color: var(--roxo-medio);
  font-size: 16px;
}

.campo-busca input {
  border: none;
  background: transparent;
  outline: none;
  font-size: 13px;
  color: var(--roxo-escuro);
  width: 100%;
}

.campo-busca input::placeholder {
  color: #a79ad6;
}

.botao-filtros {
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--roxo-pilula);
  border: none;
  border-radius: 14px;
  padding: 0 16px;
  height: 44px;
  color: #fff;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(74, 61, 125, 0.2);
}

.categorias {
  display: flex;
  gap: 6px;
  padding: 16px 22px;
  overflow-x: auto;
}

.chip-categoria {
  border: none;
  background: transparent;
  color: var(--roxo-escuro);
  font-size: 12px;
  font-weight: 500;
  padding: 9px 16px;
  border-radius: 20px;
  white-space: nowrap;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  opacity: 0.75;
}

.chip-categoria.ativo {
  background: var(--roxo-escuro);
  color: #fff;
  opacity: 1;
  box-shadow: 0 3px 10px rgba(74, 61, 125, 0.25);
}

.lista-vagas {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 6px 22px 20px;
}

.card-vaga {
  background: rgba(255, 255, 255, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 18px;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  position: relative;
}

.card-vaga:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(74, 61, 125, 0.18);
}

.icone-vaga {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.icone-vaga i {
  font-size: 20px;
  color: var(--roxo-pilula);
}

.info-vaga {
  flex: 1;
  min-width: 0;
}

.info-vaga h3 {
  font-size: 14px;
  font-weight: 600;
  color: var(--roxo-escuro);
  margin: 0 0 2px;
}

.empresa {
  font-size: 12px;
  color: var(--roxo-texto);
  margin: 0 0 6px;
}

.meta {
  display: flex;
  gap: 12px;
  font-size: 11px;
  color: var(--roxo-texto);
}

.meta i {
  font-size: 12px;
  margin-right: 2px;
}

.lateral-vaga {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.valor {
  background: #fff;
  color: var(--roxo-escuro);
  font-size: 11px;
  font-weight: 600;
  padding: 5px 12px;
  border-radius: 12px;
  white-space: nowrap;
}

.categoria-tag {
  background: #ede8fb;
  color: var(--roxo-pilula);
  font-size: 10px;
  font-weight: 500;
  padding: 3px 12px;
  border-radius: 12px;
}

.seta {
  color: rgba(90, 77, 143, 0.5);
  font-size: 16px;
  flex-shrink: 0;
}

.nav-inferior {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 420px;
  background: #d9d4ec;
  padding: 14px 8px 18px;
  display: flex;
  justify-content: space-around;
  box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.06);
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  color: #857aa8;
  cursor: pointer;
}

.nav-item i {
  font-size: 20px;
}

.nav-item span {
  font-size: 9px;
  font-weight: 500;
}

.nav-item.ativo {
  color: var(--roxo-escuro);
}

.nav-item.ativo i {
  background: var(--roxo-escuro);
  color: #fff;
  width: 32px;
  height: 32px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 17px;
}
</style>