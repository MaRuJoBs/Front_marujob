<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()

const user = ref({
  name: '',
  email: '',
  phone: '',
  profession: '',
  location: '',
  bio: '',
  instagram: '',
  linkedin: '',
  profile_image: '',
})

const originalUser = ref({})

onMounted(async () => {
  try {
    const response = await axios.get(
      'http://127.0.0.1:8000/api/usuarios/me/',
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }
    )

    user.value = {
      ...user.value,
      ...response.data,
    }

    originalUser.value = JSON.parse(JSON.stringify(user.value))
  } catch (error) {
    console.error(error)
  }
})

const getImageUrl = (path) => {
  if (!path) return null

  if (path.startsWith('http')) return path

  return `http://127.0.0.1:8000${path}`
}

const salvar = async () => {
  try {
    await axios.put(
      'http://127.0.0.1:8000/api/usuarios/me/',
      user.value,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }
    )

    alert('Perfil atualizado com sucesso!')
    router.push('/perfil')
  } catch (error) {
    console.error(error)
    alert('Erro ao atualizar perfil.')
  }
}

const cancelar = () => {
  user.value = JSON.parse(JSON.stringify(originalUser.value))
  router.back()
}
</script>

<template>
  <div class="edit-profile">

    <!-- HEADER -->
    <div class="header">

      <button class="back-btn" @click="router.back()">
        <i class="fa-solid fa-arrow-left"></i>
      </button>

      <h2>Editar Perfil</h2>

    </div>

    <!-- FOTO -->

    <div class="photo-section">

      <div class="photo">

        <img
          v-if="user.profile_image"
          :src="getImageUrl(user.profile_image)"
        />

        <div v-else class="empty-photo"></div>

        <button class="camera-btn">
          <i class="fa-solid fa-camera"></i>
        </button>

      </div>

    </div>

    <!-- INFORMAÇÕES -->

    <div class="card">

      <h3>
        <i class="fa-solid fa-user"></i>
        Informações pessoais
      </h3>

      <div class="input-group">
        <label>Nome</label>
        <input
          v-model="user.name"
          type="text"
          placeholder="Digite seu nome"
        />
      </div>

      <div class="input-group">
        <label>Cargo</label>
        <input
          v-model="user.profession"
          type="text"
          placeholder="Ex: Designer Gráfico"
        />
      </div>

      <div class="input-group">
        <label>Localização</label>
        <input
          v-model="user.location"
          type="text"
          placeholder="Cidade / Estado"
        />
      </div>

    </div>

    <!-- SOBRE -->

    <div class="card">

      <h3>
        <i class="fa-solid fa-address-card"></i>
        Sobre você
      </h3>

      <textarea
        rows="5"
        v-model="user.bio"
        placeholder="Conte um pouco sobre você..."
      ></textarea>

    </div>

    <!-- REDES -->

    <div class="card">

      <h3>
        <i class="fa-solid fa-share-nodes"></i>
        Redes Sociais
      </h3>

      <div class="input-group">

        <label>
          <i class="fa-brands fa-instagram"></i>
          Instagram
        </label>

        <input
          v-model="user.instagram"
          type="text"
          placeholder="@usuario"
        />

      </div>

      <div class="input-group">

        <label>
          <i class="fa-brands fa-linkedin"></i>
          LinkedIn
        </label>

        <input
          v-model="user.linkedin"
          type="text"
          placeholder="linkedin.com/in/..."
        />

      </div>

    </div>

    <!-- CONTATO -->

    <div class="card">

      <h3>
        <i class="fa-solid fa-envelope"></i>
        Contato
      </h3>

      <div class="input-group">

        <label>
          <i class="fa-solid fa-envelope"></i>
          Email
        </label>

        <input
          v-model="user.email"
          type="email"
        />

      </div>

      <div class="input-group">

        <label>
          <i class="fa-solid fa-phone"></i>
          Telefone
        </label>

        <input
          v-model="user.phone"
          type="text"
          placeholder="(00) 00000-0000"
        />

      </div>

    </div>

    <!-- BOTÕES -->

    <div class="buttons">

      <button
        class="save-btn"
        @click="salvar"
      >
        <i class="fa-solid fa-floppy-disk"></i>
        Salvar alterações
      </button>

      <button
        class="cancel-btn"
        @click="cancelar"
      >
        <i class="fa-solid fa-xmark"></i>
        Cancelar
      </button>

    </div>

  </div>
</template>