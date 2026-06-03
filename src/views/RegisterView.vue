<template>
  <div class="container">

    <div class="top">
      <button class="back-button">
        ←
      </button>

      <div class="photo-section">
        <div class="photo-box">
          <span>👤</span>
          <span class="plus">+</span>
        </div>

        <p>Adicione uma foto sua</p>
      </div>
    </div>

    <h1>Criar conta</h1>

    <p class="subtitle">
      Junte-se à nossa plataforma e mostre seu trabalho para o mundo.
    </p>

    <div class="card">

      <div class="field">
        <label>Nome completo</label>
        <input type="text" />
      </div>

      <div class="field">
        <label>E-mail</label>
        <input type="email" />
      </div>

      <div class="field">
        <label>Senha</label>
        <input type="password" />
      </div>

      <div class="field">
        <label>Confirmar senha</label>
        <input type="password" />
      </div>

      <div class="password-box">
        <p>Sua senha deve conter:</p>

        <div class="rules">
          <span>○ +7 Caracteres</span>
          <span>○ +5 letras</span>
          <span>○ +2 números</span>
        </div>
      </div>

      <button class="create-account">
        Criar conta
      </button>

      <div class="login">
        Já tem uma conta?
        <a href="#">Entrar</a>
      </div>

    </div>

  </div>
</template>

<script setup>
</script>

<style scoped>

.container{
  min-height:100vh;
  background:#f4f4f4;
  padding:30px;
  font-family:Arial, Helvetica, sans-serif;
}

.top{
  display:flex;
  justify-content:space-between;
  align-items:flex-start;
}

.back-button{
  width:45px;
  height:45px;
  border:none;
  border-radius:50%;
  background:#d8c6ff;
  color:#5b38b0;
  font-size:20px;
  cursor:pointer;
}

.photo-section{
  text-align:center;
}

.photo-box{
  width:120px;
  height:120px;
  border-radius:20px;
  background:#ece5f7;
  display:flex;
  justify-content:center;
  align-items:center;
  position:relative;
  box-shadow:0 3px 10px rgba(0,0,0,.15);
}

.photo-box span{
  font-size:45px;
  color:#6d4dc2;
}

.plus{
  position:absolute;
  right:15px;
  bottom:15px;
  font-size:28px !important;
}

.photo-section p{
  margin-top:8px;
  font-size:12px;
  color:#666;
}

h1{
  margin-top:25px;
  color:#2e1a74;
}

.subtitle{
  color:#555;
  margin-bottom:20px;
  max-width:260px;
}

.card{
  background:#e8dcf3;
  border-radius:20px;
  padding:25px;
}

.field{
  margin-bottom:20px;
}

.field label{
  display:block;
  margin-bottom:8px;
  color:#2e1a74;
  font-weight:600;
}

.field input{
  width:100%;
  height:42px;
  border:none;
  border-radius:8px;
  background:#d6d6d6;
  padding:0 12px;
}

.password-box{
  background:#d9d1e7;
  border-radius:12px;
  padding:15px;
  margin-top:15px;
}

.password-box p{
  color:#2e1a74;
  font-weight:600;
  margin-bottom:10px;
}

.rules{
  display:flex;
  justify-content:space-between;
  font-size:12px;
  color:#666;
}

.create-account{
  width:100%;
  height:50px;
  margin-top:30px;
  border:none;
  border-radius:12px;
  background:#6f50c5;
  color:white;
  font-size:18px;
  font-weight:600;
  cursor:pointer;
}

.login{
  text-align:center;
  margin-top:20px;
  color:#777;
}

.login a{
  color:#2e1a74;
  text-decoration:none;
  font-weight:bold;
}

</style>