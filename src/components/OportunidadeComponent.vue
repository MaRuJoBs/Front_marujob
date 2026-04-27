  <script setup>
  </script>

  <template>
    <div class="app">

      <!-- BUSCA -->
      <div class="search-box">
        <input type="text" placeholder="Buscar oportunidades..." />
        <button>
          <i class="fa-solid fa-filter"></i> Filtros
        </button>
      </div>

      <!-- FILTROS -->
      <div class="filters">
        <button class="active">Todas</button>
        <button>Design</button>
        <button>Design</button>
        <button>Design</button>
        <button>Design Gráfico</button>
      </div>

      <!-- CARD -->
      <section class="card">
        <div class="card-top">
          <div>
            <h3>Design Gráfico</h3>
            <p class="company">Design Pro</p>
          </div>
          <button class="fav"><i class="fa-solid fa-heart"></i></button>
        </div>

        <div class="info">
          <p> <i class="fa-solid fa-location-dot"></i> Centro, SP</p>
          <p><i class="fa-solid fa-calendar"></i> 29/04/2026 • <i class="fa-solid fa-briefcase"></i> 9:00 - 15:00</p>
          <p><i class="fa-solid fa-briefcase"></i> Home office</p>
        </div>

        <div class="card-bottom">
          <button class="details">Ver detalhes</button>
          <span class="price">R$ 200</span>
        </div>
      </section>

      <!-- CARD -->
      <section class="card">
        <div class="card-top">
          <div>
            <h3>Design Gráfico</h3>
            <p class="company">Design Pro</p>
          </div>
          <button class="fav"><i class="fa-solid fa-heart"></i></button>
        </div>

        <div class="info">
          <p> <i class="fa-solid fa-location-dot"></i> Centro, SP</p>
          <p><i class="fa-solid fa-calendar"></i> 29/04/2026 • <i class="fa-solid fa-briefcase"></i> 9:00 - 15:00</p>
          <p><i class="fa-solid fa-briefcase"></i> Home office</p>
        </div>

        <div class="card-bottom">
          <button class="details">Ver detalhes</button>
          <span class="price">R$ 200</span>
        </div>
      </section>

      <!-- AVISO -->
      <section class="tip">
        <span><i class="fa-solid fa-heart"></i> Salve oportunidades em seus favoritos!</span>
        <span>›</span>
      </section>

      <!-- CARD -->
      <section class="card">
        <div class="card-top">
          <div>
            <h3>Design Gráfico</h3>
            <p class="company">Design Pro</p>
          </div>
          <button class="fav off"><i class="fa-solid fa-heart"></i></button>
        </div>

        <div class="info">
        <p> <i class="fa-solid fa-location-dot"></i> Centro, SP</p>
          <p><i class="fa-solid fa-calendar"></i> 29/04/2026 • <i class="fa-solid fa-briefcase"></i> 9:00 - 15:00</p>
          <p><i class="fa-solid fa-briefcase"></i> Home office</p>
        </div>

        <div class="card-bottom">
          <button class="details">Ver detalhes</button>
          <span class="price">R$ 200</span>
        </div>
      </section>

    </div>
  </template>

  <style scoped>
  /* FUNDO */
  .app {
    min-height: 100vh;
    padding: 15px;
    font-family: Arial, sans-serif;
    background: linear-gradient(180deg, #cbb6ff, #f5f3ff);
  }

  /* BUSCA */
  .search-box {
    display: flex;
    gap: 10px;
    margin-bottom: 15px;
  }

  .search-box input {
    flex: 1;
    padding: 12px;
    border-radius: 25px;
    border: none;
    background: #f1ecff;
    outline: none;
  }

  .search-box button {
    background: #6c4ad1;
    color: white;
    border: none;
    padding: 10px 15px;
    border-radius: 12px;
    cursor: pointer;
  }

  /* FILTROS */
  .filters {
    display: flex;
    gap: 8px;
    margin-bottom: 20px;
    justify-content: center;
  }

  .filters button {
    background: #e9e3ff;
    border: none;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 12px;
    color: #5a46b5;
    white-space: nowrap;
    cursor: pointer;
  }

  .filters .active {
    background: #6c4ad1;
    color: white;
  }

  .filters .remove {
    background: transparent;
    color: #6c4ad1;
  }

  /* CARD */
  .card {
    background: 
    #f7f5ff;
    border-radius: 16px;
    padding: 15px;
    margin-bottom: 15px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  }

  /* TOPO */
  .card-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .card-top h3 {
    margin: 0;
    color: #5a46b5;
  }

  /* EMPRESA */
  .company {
    margin: 3px 0 10px;
    color: #888;
    font-size: 14px;
  }

  /* FAVORITO */
  .fav {
    border: none;
    background: none;
    font-size: 18px;
    cursor: pointer;
  }

  .fav.off {
    opacity: 0.5;
  }

  /* INFO */
  .info p {
    margin: 3px 0;
    font-size: 13px;
    color: #6b6b6b;
  }

  /* BOTTOM */
  .card-bottom {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 10px;
  }

  /* BOTÃO */
  .details {
    background: #6c4ad1;
    color: white;
    border: none;
    padding: 8px 20px;
    border-radius: 20px;
    cursor: pointer;
  }

  /* PREÇO */
  .price {
    background: #cdcccf;
    padding: 5px 10px;
    border-radius: 20px;
    color: #5a46b5;
    font-weight: bold;
  }

  /* AVISO */
  .tip {
    background: #ede7ff;
    padding: 12px;
    border-radius: 12px;
    font-size: 13px;
    color: #6c4ad1;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
  }
  </style>