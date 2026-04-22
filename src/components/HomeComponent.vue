<script setup>
</script>

<template>
    <main class="home">
  <section class="principais">
    <h2>Principais</h2>

    <div class="card">
  <div class="retangulo"></div>

  <div class="info">
    <h3>Design Gráfico</h3>
    <p>Design Pro</p>

    <div class="preco">
      <span>R$100</span>
      <p class="horas">4 horas</p>
    </div>
  </div>

  <span class="arrow">›</span>
</div>

   
  </section>

 
  <div class="dots">
    <span class="active"></span>
    <span></span>
    <span></span>
    <span></span>
  </div>


  <section class="mais">
    <h3>Mais oportunidade...</h3>

    <div class="scroll">
      <div class="mini-card">
        <h4>Tradução</h4>
        <p>Empresa 1</p>
        <span>R$60</span>
        <p>2 horas</p>
        <button>Ver Detalhes</button>
      </div>
    </div>
  </section>

</main>
</template> 
<style scoped>
body {
  margin: 0;
  font-family: Arial, sans-serif;
  background: #ebebeb;
}
main {
  background-color: #E0D1F9;
  border-radius: 60px 60px 0 0;
  margin-top: -100px;
  position: relative;
  z-index: 5;
}
.home {
  padding: 0 16px 16px 16px;
}



.principais h2 {
  color: rgb(226, 205, 205);
  background: #5b3cc4;
  text-align: center;
  max-width: 190px;
  font-size: 18px;
  padding: 5px 18px;
  border-radius: 0 0 10px 10px;
  margin: 0 auto;
}
.retangulo {
  width: 60px;
  height: 60px;
  background-color: #939292;
  border-radius: 10px;
  margin: 0; 
}
.card {
  background: #D8D2E6;
  border-radius: 12px;
  padding: 25px 12px 25px 12px; 
  margin-top: 12px;
  display: flex;
  align-items: center;
  gap: 12px; 
}

.card h3 {
  margin: 0;
  font-size: 16px;
  color: #543B91;
}

.card p {
  margin: 2px 0;
  color: #777;
  font-size: 10px;
}
div.preco {
  display: flex;
  align-items: center;
  gap: 8px;
}
.card span {
  font-size: 12px;
  color: #543B91;
}
.card .horas {
  font-size: 10px;
  color: #777;
}
.arrow {
  margin-left: auto; 
  font-size: 50px;
  color: #5b3cc4;
}

/* DOTS */
.dots {
  text-align: center;
  margin: 10px 0;
}

.dots span {
  display: inline-block;
  width: 6px;
  height: 6px;
  margin: 3px;
  background: #bbb;
  border-radius: 50%;
}

.dots .active {
  background: #5b3cc4;
}

.mais h3 {
  margin: 8px 0;
  color: #49357B;
  font-size: 15px;
}

.scroll {
  display: flex;
  overflow-x: auto;
  gap: 10px;
}

.mini-card {
  background: #fff;
  border-radius: 10px;
  padding: 10px 12px 20px 10px;
  color: #49357B;
}
.mini-card span {
  font-size: 18px;
  color: #49357B;
}

.mini-card h4 {
  margin: 0;
  font-size: 19px;
}

.mini-card p {
  margin: 4px 0;
  font-size: 10px;
  color: #766A94;
} 

.mini-card button {
  border: none;
  background: #5b3cc4;
  color: white;
  border-radius: 10px;
  padding: 6px 8px;
  margin: 15px auto 0 auto; 
  display: block; 
}
</style>