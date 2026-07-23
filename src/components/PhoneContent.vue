<template>
  <div class="phone-inner-content">
    <!-- Шапка профиля / ресторана -->
    <div class="restaurant-header">
      <div class="avatar-container">
        <img :src="item.image || ''" alt="Лого" />
      </div>
      <div class="restaurant-name">Jazzve</div>
    </div>

    <!-- Категории меню -->
    <div class="categories-bar">
      <button class="cat-btn active">Все</button>
      <button class="cat-btn">Основные блюда</button>
      <button class="cat-btn">Напитки</button>
    </div>

    <!-- Список блюд -->
    <div class="dishes-list">
      <slot /> <!-- Сюда будут прокидываться блюда или контент -->
    </div>

    <!-- Нижняя панель навигации приложения -->
    <div class="bottom-nav">
      <button class="nav-item">🇷🇺 Русский</button>
      <button class="nav-item">🎛️ Фильтры</button>
      <button class="nav-item">🛒</button>
    </div>
  </div>
</template>

<style scoped>
/* Стили для содержимого телефона можно перенести из вашей preview-area */
.phone-inner-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #000;
  color: #fff;
  overflow-y: auto;
}
/* Добавьте остальные ваши классы для шапки, категорий и карточек */
</style>