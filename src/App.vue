<script setup lang="ts">
import { ref, reactive } from 'vue';
import MenuImport from './components/MenuImport.vue';
import MenuEditor from './components/MenuEditor.vue';
import type { MenuItem, MenuCategory, RestaurantInfo } from './types/menu';

// Текущая активная вкладка в боковой панели
const activeTab = ref<'navigation' | 'colors' | 'branding' | 'general' | 'qrcode'>('navigation');

// Состояние данных приложения
const categories = ref<MenuCategory[]>([]);
const items = ref<MenuItem[]>([]);
const hasImported = ref(false);

const restaurantInfo = reactive<RestaurantInfo>({
  name: 'Мой Ресторан',
  primaryColor: '#646cff',
  secondaryColor: '#242424',
  backgroundColor: '#121212',
  textColor: '#ffffff',
});

// Обработка успешного импорта
const handleImportSuccess = (data: { categories: MenuCategory[]; items: MenuItem[] }) => {
  categories.value = data.categories;
  items.value = data.items;
  hasImported.value = true;
};

// Сброс данных для повторного импорта
const resetImport = () => {
  categories.value = [];
  items.value = [];
  hasImported.value = false;
};
</script>

<template>
  <!-- 1. Если данные еще не импортированы, показываем чистый экран импорта -->
  <div v-if="!hasImported" class="welcome-screen">
    <MenuImport @import-success="handleImportSuccess" />
  </div>

  <!-- 2. Главный рабочий интерфейс конструктора -->
  <div v-else class="constructor-layout">
    
    <!-- Левая боковая панель (Sidebar) -->
    <aside class="sidebar">
      <div class="sidebar-header">
        <h2 class="brand-title">Daur Menu</h2>
        <span class="status-badge">Режим редактирования</span>
      </div>

      <nav class="sidebar-menu">
        <button 
          class="menu-btn" 
          :class="{ active: activeTab === 'navigation' }"
          @click="activeTab = 'navigation'"
        >
          <span class="icon">🍔</span> Навигация и блюда
        </button>
        <button 
          class="menu-btn" 
          :class="{ active: activeTab === 'colors' }"
          @click="activeTab = 'colors'"
        >
          <span class="icon">🎨</span> Цвета интерфейса
        </button>
        <button 
          class="menu-btn" 
          :class="{ active: activeTab === 'branding' }"
          @click="activeTab = 'branding'"
        >
          <span class="icon">✨</span> Брендинг и лого
        </button>
        <button 
          class="menu-btn" 
          :class="{ active: activeTab === 'general' }"
          @click="activeTab = 'general'"
        >
          <span class="icon">📝</span> Общие данные
        </button>
        <button 
          class="menu-btn" 
          :class="{ active: activeTab === 'qrcode' }"
          @click="activeTab = 'qrcode'"
        >
          <span class="icon">📱</span> QR-код меню
        </button>
      </nav>

      <div class="sidebar-footer">
        <button @click="resetImport" class="btn-reset-sidebar">
          ↩ Сбросить и загрузить заново
        </button>
      </div>
    </aside>

    <!-- Центральная область редактора (меняется от выбранной вкладки) -->
    <main class="editor-area">
      <header class="editor-header">
        <h1 class="tab-title">
          <span v-if="activeTab === 'navigation'">Навигация и разделы меню</span>
          <span v-else-if="activeTab === 'colors'">Цветовая палитра</span>
          <span v-else-if="activeTab === 'branding'">Логотип и оформление</span>
          <span v-else-if="activeTab === 'general'">Информация о заведении</span>
          <span v-else-if="activeTab === 'qrcode'">Генератор QR-кода</span>
        </h1>
      </header>

      <div class="editor-content">
        <!-- Вкладка НАВИГАЦИЯ (Редактор карточек) -->
        <div v-if="activeTab === 'navigation'" class="tab-pane">
          <MenuEditor 
            :items="items" 
            :categories="categories"
            @update-items="items = $event"
            @update-categories="categories = $event"
          />
        </div>

        <!-- Вкладка ЦВЕТА -->
        <div v-else-if="activeTab === 'colors'" class="tab-pane">
          <div class="temp-placeholder">
            <h3>Настройка фирменных цветов</h3>
            <p>Здесь мы разместим палитру для изменения фона, кнопок и шрифтов мобильного меню.</p>
          </div>
        </div>

        <!-- Остальные вкладки-заглушки -->
        <div v-else class="tab-pane">
          <div class="temp-placeholder">
            <h3>Раздел находится в разработке</h3>
            <p>Компонент для настройки этого шага будет подключен позже.</p>
          </div>
        </div>
      </div>
    </main>

    <!-- Правая панель: Интерактивный предпросмотр (мобильный телефон) -->
    <section class="preview-area">
      <div class="phone-mockup">
        <div class="phone-screen">
          <div class="phone-header" :style="{ backgroundColor: restaurantInfo.secondaryColor }">
            <div class="phone-logo">🍽️ {{ restaurantInfo.name }}</div>
          </div>
          
          <div class="phone-body" :style="{ backgroundColor: restaurantInfo.backgroundColor, color: restaurantInfo.textColor }">
            <!-- Демонстрация категорий в телефоне -->
            <div class="phone-categories">
              <span 
                v-for="cat in categories" 
                :key="cat.id" 
                class="phone-cat-badge"
                :style="{ backgroundColor: restaurantInfo.primaryColor }"
              >
                {{ cat.name }}
              </span>
            </div>

            <!-- Демонстрация блюд в телефоне -->
            <div class="phone-items-list">
              <!-- Показываем в телефоне только те блюда, которые отмечены как активные (isAvailable === true) -->
              <div 
                v-for="item in items.filter(i => i.isAvailable)" 
                :key="item.id" 
                class="phone-item-card"
                :style="{ borderBottom: '1px solid ' + restaurantInfo.secondaryColor }"
              >
                <div class="phone-item-info">
                  <h4 class="phone-item-name">{{ item.name }}</h4>
                  <p class="phone-item-desc">{{ item.description }}</p>
                  <span class="phone-item-price" :style="{ color: restaurantInfo.primaryColor }">{{ item.price }} ₽</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

  </div>
</template>

<style>
/* Сброс базовых стилей и общая тема */
:root {
  --bg-dark: #121212;
  --bg-panel: #1e1e1e;
  --border-color: #2e2e2e;
  --text-main: #ffffff;
  --text-muted: #a0a0a0;
  --accent: #646cff;
}

body {
  margin: 0;
  font-family: 'Inter', sans-serif;
  background-color: var(--bg-dark);
  color: var(--text-main);
  overflow: hidden;
}

/* Приветственный экран импорта */
.welcome-screen {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  width: 100vw;
}

/* Сетка конструктора */
.constructor-layout {
  display: grid;
  grid-template-columns: 280px 1fr 400px;
  height: 100vh;
  width: 100vw;
}

/* Левая панель (Sidebar) */
.sidebar {
  background-color: var(--bg-panel);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  padding: 24px;
}

.sidebar-header {
  margin-bottom: 32px;
}

.brand-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 8px 0;
  background: linear-gradient(45deg, #646cff, #9b51e0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.status-badge {
  font-size: 0.75rem;
  background: rgba(100, 108, 255, 0.15);
  color: var(--accent);
  padding: 4px 8px;
  border-radius: 12px;
  font-weight: 500;
}

.sidebar-menu {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex-grow: 1;
}

.menu-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  background: transparent;
  border: none;
  color: var(--text-muted);
  padding: 12px 16px;
  border-radius: 8px;
  cursor: pointer;
  text-align: left;
  font-size: 0.95rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.menu-btn:hover {
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-main);
}

.menu-btn.active {
  background: var(--accent);
  color: #ffffff;
}

.sidebar-footer {
  border-top: 1px solid var(--border-color);
  padding-top: 16px;
}

.btn-reset-sidebar {
  background: transparent;
  border: 1px dashed #ef4444;
  color: #ef4444;
  width: 100%;
  padding: 10px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s;
}

.btn-reset-sidebar:hover {
  background: rgba(239, 68, 68, 0.1);
}

/* Центральная область редактора */
.editor-area {
  display: flex;
  flex-direction: column;
  background: #141414;
}

.editor-header {
  padding: 24px 32px;
  border-bottom: 1px solid var(--border-color);
}

.tab-title {
  font-size: 1.6rem;
  margin: 0;
  font-weight: 600;
}

.editor-content {
  padding: 32px;
  flex-grow: 1;
  overflow-y: auto;
}

.temp-placeholder {
  border: 2px dashed var(--border-color);
  border-radius: 12px;
  padding: 40px;
  text-align: center;
  color: var(--text-muted);
}

/* Правая панель (Предпросмотр мобильного) */
.preview-area {
  background-color: var(--bg-panel);
  border-left: 1px solid var(--border-color);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.phone-mockup {
  width: 310px;
  height: 620px;
  background: #000000;
  border: 10px solid #2a2a2a;
  border-radius: 40px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
  overflow: hidden;
  position: relative;
}

.phone-screen {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.phone-header {
  padding: 16px;
  text-align: center;
  font-weight: bold;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.phone-body {
  flex-grow: 1;
  padding: 16px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Стилизация списков в телефоне */
.phone-categories {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 8px;
}

.phone-cat-badge {
  font-size: 0.75rem;
  padding: 6px 12px;
  border-radius: 16px;
  white-space: nowrap;
  font-weight: 500;
}

.phone-items-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.phone-item-card {
  padding-bottom: 12px;
}

.phone-item-name {
  margin: 0 0 4px 0;
  font-size: 0.9rem;
}

.phone-item-desc {
  margin: 0 0 8px 0;
  font-size: 0.75rem;
  color: #888888;
  line-height: 1.3;
}

.phone-item-price {
  font-size: 0.85rem;
  font-weight: 600;
}

/* Главный контейнер приложения, где лежит сайдбар и контент */
.app-container {
  display: flex;
  min-height: 100vh;
  width: 100vw;
  background-color: #121212;
  overflow-x: hidden;
}

/* Основная рабочая область справа от сайдбара */
.main-content {
  flex: 1; /* Занимает всё оставшееся место */
  display: flex;
  flex-direction: column;
  align-items: center;     /* Выравнивает детей по горизонтали строго по центру */
  justify-content: flex-start;
  padding: 40px 20px;
  width: 100%;
  box-sizing: border-box;
}

</style>