<template>
  <div class="role-selector-container">
    <div class="role-card-wrapper">
      <h1>Achab Hub</h1>
      <p class="subtitle">Выберите режим работы с приложением</p>

      <div class="roles-grid">
        <!-- Режим Ресторана / Конструктор (ссылка ведет на /constructor) -->
        <router-link to="/constructor" class="role-card admin-card">
          <div class="icon">🛠️</div>
          <h2>Ресторан / Конструктор</h2>
          <p>Настройка меню, бренда, внешнего вида и управление входящими заказами.</p>
          <span class="card-btn">Открыть конструктор</span>
        </router-link>

        <!-- Режим Клиента (Меню) -->
        <router-link to="/preview" class="role-card client-card">
          <div class="icon">📱</div>
          <h2>Клиент (Меню)</h2>
          <p>Интерфейс цифрового меню для гостя: просмотр блюд, корзина и оформление заказа.</p>
          <span class="card-btn">Открыть меню</span>
        </router-link>

        <!-- Панель администратора (кухня) -->
        <router-link to="/admin" class="role-card kitchen-card">
          <div class="icon">📋</div>
          <h2>Панель заказов (Кухня)</h2>
          <p>Канбан-доска для отслеживания и переключения статусов активных заказов.</p>
          <span class="card-btn">Открыть кухню</span>
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.role-selector-container {
  min-height: 100vh;
  background-color: #121212;
  color: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: inherit;
  padding: 20px;
}
.role-card-wrapper {
  max-width: 900px;
  width: 100%;
  text-align: center;
}
h1 {
  font-size: 32px;
  margin-bottom: 8px;
  font-weight: 700;
}
.subtitle {
  color: #a1a1aa;
  margin-bottom: 40px;
  font-size: 16px;
}
.roles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 20px;
}
.role-card {
  background: #18181b;
  border: 1px solid #27272a;
  border-radius: 16px;
  padding: 32px 24px;
  text-decoration: none;
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: all 0.2s ease;
}
.role-card:hover {
  transform: translateY(-4px);
  border-color: #6366f1;
  box-shadow: 0 10px 30px -10px rgba(99, 102, 241, 0.3);
}
.icon {
  font-size: 40px;
  margin-bottom: 16px;
}
.role-card h2 {
  font-size: 20px;
  margin-bottom: 12px;
}
.role-card p {
  color: #a1a1aa;
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 24px;
  flex-grow: 1;
}
.card-btn {
  background: #27272a;
  color: #fff;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  transition: background 0.2s;
}
.role-card:hover .card-btn {
  background: #6366f1;
}
</style>