<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()

const fileInput = ref(null)

const previewImage = ref(null)

const selectedFile = ref(null)

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
  carregarUsuario()
})

const carregarUsuario = async () => {
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

    originalUser.value = JSON.parse(
      JSON.stringify(user.value)
    )

  } catch (error) {
    console.error('Erro ao carregar usuário:', error)
  }
}

const getImageUrl = (path) => {

  if (!path) return null

  if (path.startsWith('http')) return path

  return `http://127.0.0.1:8000${path}`

}

const selecionarImagem = (event) => {

  const file = event.target.files[0]

  if (!file) return

  selectedFile.value = file

  previewImage.value = URL.createObjectURL(file)

}

const salvar = async () => {

  try {

    const formData = new FormData()

    formData.append('name', user.value.name)
    formData.append('email', user.value.email)
    formData.append('phone', user.value.phone || '')
    formData.append('profession', user.value.profession || '')
    formData.append('location', user.value.location || '')
    formData.append('bio', user.value.bio || '')
    formData.append('instagram', user.value.instagram || '')
    formData.append('linkedin', user.value.linkedin || '')

    if (selectedFile.value) {
      formData.append(
        'profile_image',
        selectedFile.value
      )
    }

    await axios.put(
      'http://127.0.0.1:8000/api/usuarios/me/',
      formData,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data',
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

  user.value = JSON.parse(
    JSON.stringify(originalUser.value)
  )

  router.back()

}
</script>

<template>
  <div class="edit-profile">

    <!-- HEADER -->
    <section class="header">

      <button class="back-btn" @click="router.back()">
        <i class="fa-solid fa-arrow-left"></i>
      </button>

      <div class="header-content">

        <h2>Editar Perfil</h2>
        <p>Atualize suas informações</p>

      </div>

    </section>

    <!-- FOTO -->

    <section class="photo-section">

      <div class="photo">

        <img
          v-if="previewImage || user.profile_image"
          :src="previewImage || getImageUrl(user.profile_image)"
          class="profile-image"
        />

        <div
          v-else
          class="empty-photo"
        >
          <i class="fa-solid fa-user"></i>
        </div>

        <input
          ref="fileInput"
          type="file"
          accept="image/*"
          hidden
          @change="selecionarImagem"
        />

        <button
          class="camera-btn"
          @click="fileInput.click()"
        >
          <i class="fa-solid fa-camera"></i>
        </button>

      </div>

    </section>

    <!-- INFORMAÇÕES -->

    <section class="card">

      <h3>
        <i class="fa-solid fa-user"></i>
        Informações Pessoais
      </h3>

      <div class="input-group">

        <label>
          <i class="fa-solid fa-user"></i>
          Nome
        </label>

        <input
          v-model="user.name"
          type="text"
          placeholder="Digite seu nome"
        />

      </div>

      <div class="input-group">

        <label>
          <i class="fa-solid fa-briefcase"></i>
          Cargo
        </label>

        <input
          v-model="user.profession"
          type="text"
          placeholder="Designer Gráfico"
        />

      </div>

      <div class="input-group">

        <label>
          <i class="fa-solid fa-location-dot"></i>
          Localização
        </label>

        <input
          v-model="user.location"
          type="text"
          placeholder="Cidade / Estado"
        />

      </div>

    </section>

    <!-- SOBRE -->

    <section class="card">

      <h3>
        <i class="fa-solid fa-address-card"></i>
        Sobre você
      </h3>

      <textarea
        rows="5"
        v-model="user.bio"
        placeholder="Conte um pouco sobre você..."
      ></textarea>

    </section>

    <!-- REDES SOCIAIS -->

    <section class="card">

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
          placeholder="linkedin.com/in/usuario"
        />

      </div>

    </section>

    <!-- CONTATO -->

    <section class="card">

      <h3>
        <i class="fa-solid fa-envelope"></i>
        Contato
      </h3>

      <div class="input-group">

        <label>
          <i class="fa-solid fa-envelope"></i>
          E-mail
        </label>

        <input
          v-model="user.email"
          type="email"
          placeholder="email@exemplo.com"
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

    </section>

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

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: "Poppins", sans-serif;
}

.edit-profile {
  min-height: 100vh;
  background: #ece4f7;
  padding-bottom: 50px;
}

/* =========================
   HEADER
========================= */

.header {
  position: relative;
  height: 260px;

  background-image: url("/src/assets/images/perfil.png");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;

  border-bottom-left-radius: 40px;
  border-bottom-right-radius: 40px;

  overflow: hidden;
}

.header::before {
  content: "";
  position: absolute;
  inset: 0;

  background: rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(2px);
}

.header-content {
  position: relative;
  z-index: 2;

  padding-top: 35px;
  text-align: center;
}

.header-content h2 {
  color: white;
  font-size: 28px;
  font-weight: 700;
}

.header-content p {
  color: #f2ecff;
  margin-top: 8px;
  font-size: 15px;
}

.back-btn {
  position: absolute;
  top: 25px;
  left: 25px;

  z-index: 3;

  width: 45px;
  height: 45px;

  border: none;
  border-radius: 50%;

  background: rgba(255,255,255,.2);

  color: white;

  cursor: pointer;

  transition: .3s;
}

.back-btn:hover{
  background: rgba(255,255,255,.35);
}

/* =========================
   FOTO
========================= */

.photo-section{
    display:flex;
    justify-content:center;
    margin-top:-70px;
    margin-bottom:25px;
    position:relative;
    z-index:5;
}

.photo{
    position:relative;
}

.profile-image,
.empty-photo{

    width:140px;
    height:140px;

    border-radius:50%;

    border:6px solid white;

    object-fit:cover;

    background:#d8d8d8;

    display:flex;
    justify-content:center;
    align-items:center;

    box-shadow:0 12px 30px rgba(0,0,0,.15);

}

.empty-photo i{
    font-size:55px;
    color:#888;
}

.camera-btn{

    position:absolute;

    right:6px;
    bottom:6px;

    width:42px;
    height:42px;

    border:none;
    border-radius:50%;

    background:#7b3ff2;

    color:white;

    cursor:pointer;

    box-shadow:0 5px 15px rgba(0,0,0,.25);

    transition:.3s;
}

.camera-btn:hover{

    transform:scale(1.08);

}

/* =========================
   CARDS
========================= */

.card{

    width:92%;

    margin:18px auto;

    background:white;

    border-radius:20px;

    padding:22px;

    box-shadow:0 10px 25px rgba(0,0,0,.08);

}

.card h3{

    display:flex;
    align-items:center;
    gap:10px;

    color:#7b3ff2;

    margin-bottom:22px;

    font-size:19px;

}

.card h3 i{

    font-size:18px;

}

/* =========================
   INPUTS
========================= */

.input-group{

    display:flex;
    flex-direction:column;

    margin-bottom:18px;

}

.input-group:last-child{

    margin-bottom:0;

}

.input-group label{

    font-size:14px;

    font-weight:600;

    color:#555;

    margin-bottom:8px;

}

.input-group label i{

    color:#7b3ff2;

    width:18px;

}

input,
textarea{

    width:100%;

    padding:14px 18px;

    border-radius:14px;

    border:2px solid #e3daf7;

    background:#faf8ff;

    font-size:15px;

    transition:.3s;

}

input:focus,
textarea:focus{

    outline:none;

    border-color:#7b3ff2;

    background:white;

}

textarea{

    resize:none;

    min-height:130px;

    line-height:1.6;

}

/* =========================
   BOTÕES
========================= */

.buttons{

    width:92%;

    margin:30px auto;

    display:flex;

    flex-direction:column;

    gap:15px;

}

.save-btn{

    padding:16px;

    border:none;

    border-radius:15px;

    background:#7b3ff2;

    color:white;

    font-size:16px;

    font-weight:700;

    cursor:pointer;

    transition:.3s;

}

.save-btn:hover{

    background:#6932da;

}

.save-btn i{

    margin-right:8px;

}

.cancel-btn{

    padding:16px;

    border-radius:15px;

    border:2px solid #7b3ff2;

    background:white;

    color:#7b3ff2;

    font-size:16px;

    font-weight:700;

    cursor:pointer;

    transition:.3s;

}

.cancel-btn:hover{

    background:#f5efff;

}

.cancel-btn i{

    margin-right:8px;

}

/* =========================
   SCROLL
========================= */

::-webkit-scrollbar{
    width:7px;
}

::-webkit-scrollbar-thumb{
    background:#8b63e8;
    border-radius:20px;
}

/* =========================
   RESPONSIVO
========================= */

@media (min-width:768px){

.edit-profile{

    max-width:700px;

    margin:auto;

}

}
</style>