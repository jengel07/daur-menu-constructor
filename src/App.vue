<script setup lang="ts">
import { ref, reactive } from 'vue';
import MenuImport from './components/MenuImport.vue';
import MenuEditor from './components/MenuEditor.vue';
import type { MenuItem, MenuCategory, RestaurantInfo } from './types/menu';

const activeTab = ref<'navigation' | 'colors' | 'branding' | 'general' | 'qrcode'>('navigation');

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

const handleImportSuccess = (data: { categories: MenuCategory[]; items: MenuItem[] }) => {
  categories.value = data.categories;
  items.value = data.items;
  hasImported.value = true;
};

const resetImport = () => {
  categories.value = [];
  items.value = [];
  hasImported.value = false;
};
</script>

<template>
  <div v-if="!hasImported" class="welcome-screen">
    <MenuImport @import-success="handleImportSuccess" />
  </div>

  <div v-else class="constructor-layout">
    <aside class="sidebar">
  <!-- Заголовок -->
  <div class="sidebar-header">
    <h2 class="brand-title">Daur Menu</h2>
    <span class="status-badge">Режим редактирования</span>
  </div>

  <!-- Новый контейнер для навигации -->
  <div class="sidebar-content">
    <nav class="sidebar-menu">
      <button v-for="tab in ['navigation', 'colors', 'branding', 'general', 'qrcode']" 
              :key="tab"
              class="menu-btn" 
              :class="{ active: activeTab === tab }" 
              @click="activeTab = tab as any">
        <span class="icon">{{ tab === 'navigation' ? '🍔' : tab === 'colors' ? '🎨' : tab === 'branding' ? '✨' : tab === 'general' ? '📝' : '📱' }}</span>
        {{ tab === 'navigation' ? 'Навигация и блюда' : tab === 'colors' ? 'Цвета интерфейса' : tab === 'branding' ? 'Брендинг и лого' : tab === 'general' ? 'Общие данные' : 'QR-код меню' }}
      </button>
    </nav>
  </div>

  <!-- Кнопка сброса теперь прижмется к низу -->
  <button @click="resetImport" class="btn-reset-sidebar">
    ↩ Сбросить и загрузить заново
  </button>
</aside>

    <main class="editor-area">
      <header class="editor-header">
        <h1 class="tab-title">{{ activeTab === 'navigation' ? 'Навигация и разделы меню' : 'Раздел в разработке' }}</h1>
      </header>

      <div class="editor-content">
        <div v-if="activeTab === 'navigation'" class="tab-pane">
          <MenuEditor :items="items" :categories="categories" @update-items="items = $event" @update-categories="categories = $event" />
        </div>
        <div v-else class="temp-placeholder">
          <h3>Раздел находится в разработке</h3>
        </div>
      </div>
    </main>

    <!-- Вставьте ЭТО в App.vue -->
<section class="preview-area">
  <div class="phone-mockup">
    <div class="phone-screen">
      <!-- Заголовок телефона -->
      <div class="phone-header" :style="{ backgroundColor: restaurantInfo.secondaryColor }">
        <div class="phone-logo">🍽️ {{ restaurantInfo.name }}</div>
      </div>
      
      <!-- Тело телефона -->
      <div class="phone-body" :style="{ backgroundColor: restaurantInfo.backgroundColor, color: restaurantInfo.textColor }">
        <!-- Категории -->
        <div class="phone-categories">
          <span v-for="cat in categories" :key="cat.id" class="phone-cat-badge" :style="{ backgroundColor: restaurantInfo.primaryColor }">
            {{ cat.name }}
          </span>
        </div>

        <!-- Сетка карточек -->
        <div class="menu-items-grid-phone">
          <div v-for="item in items.filter(i => i.isAvailable)" :key="item.id" class="menu-card">
            <img :src="item.image || 'placeholder.jpg'" alt="Блюдо" />
            <div class="card-content">
              <h3>{{ item.name }}</h3>
              <p>{{ item.description }}</p>
              <div class="price">RUB {{ item.price }}</div>
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
/* Базовые стили */
:root { --bg-dark: #121212; --bg-panel: #1e1e1e; --border-color: #2e2e2e; --text-main: #ffffff; --accent: #646cff; }
body { margin: 0; font-family: 'Inter', sans-serif; background-color: var(--bg-dark); color: var(--text-main); }
.constructor-layout { display: grid; grid-template-columns: 280px 1fr 400px; height: 100vh; }

/* Сайдбар и Редактор */
.sidebar { background-color: var(--bg-panel); padding: 24px; border-right: 1px solid var(--border-color); }
.menu-btn.active { background: var(--accent); color: #fff; }
.editor-area { background: #141414; flex-direction: column; }

/* Предпросмотр в телефоне */
.preview-area { background-color: var(--bg-panel); display: flex; justify-content: center; align-items: center; }
.phone-mockup { width: 310px; height: 620px; background: #000; border: 10px solid #2a2a2a; border-radius: 40px; overflow: hidden; }
.phone-body { flex-grow: 1; padding: 16px; overflow-y: auto; }

/* Сетка карточек для телефона */
.menu-items-grid { display: grid; grid-template-columns: 1fr; gap: 12px; }
.menu-card { background: #ffffff; border-radius: 16px; overflow: hidden; display: flex; flex-direction: column; }
.menu-card img { width: 100%; height: 100px; object-fit: cover; }
.card-content { padding: 10px; }
.card-content h3 { margin: 0; font-size: 14px; color: #000; }
.card-content p { font-size: 12px; color: #666; margin: 4px 0; }
.price { font-weight: bold; color: #2c7a7b; font-size: 13px; }

.menu-items-grid-phone {
  display: grid !important;
  /* Включаем строго 2 колонки равной ширины */
  grid-template-columns: repeat(2, 1fr) !important;
  /* Уменьшаем отступы между карточками, чтобы они красиво влезли в экран телефона */
  gap: 8px !important; 
  padding: 8px !important;
}

/* На всякий случай сбросим фиксированную ширину у самих карточек внутри телефона */
.menu-items-grid-phone > div {
  width: 100% !important;
  max-width: 100% !important;
}
.item-name {
  font-size: 0.9rem; /* уменьши, если текст начнет вылезать */
}
.item-price {
  font-size: 0.85rem;
}
</style>