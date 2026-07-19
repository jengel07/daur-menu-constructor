<template>
  <div class="mobile-app-wrapper">
    <div class="content-container">
      <div class="menu-preview">
        <!-- Шапка: зафиксирована сверху -->
        <header class="phone-header" :style="{ backgroundColor: restaurantInfo.secondaryColor, backgroundImage: restaurantInfo.coverImage ? `url(${restaurantInfo.coverImage})` : 'none' }">
          <div class="phone-avatar-wrapper">
            <img v-if="restaurantInfo.avatarImage" :src="restaurantInfo.avatarImage" alt="Logo" />
          </div>
          <div class="phone-logo">{{ restaurantInfo.name }}</div>
        </header>

        <!-- Основной контент: скроллится внутри контейнера -->
        <div class="phone-body" :style="{ backgroundColor: restaurantInfo.backgroundColor, color: restaurantInfo.textColor }">
          
          <!-- WiFi Блок -->
          <div v-if="restaurantInfo.isWifiEnabled" class="phone-wifi-btn">
             ℹ️ WiFi: {{ restaurantInfo.wifiName || 'Нет' }} / {{ restaurantInfo.wifiPassword || 'Нет' }}
          </div>

          <!-- Категории -->
          <div class="phone-categories">
            <span v-for="cat in categories" :key="cat.id" class="phone-cat-badge" :style="{ backgroundColor: restaurantInfo.primaryColor }">
              {{ cat.name }}
            </span>
          </div>

          <!-- Сетка блюд -->
          <div class="menu-items-grid-phone">
            <div v-for="item in items.filter(i => i.isAvailable)" :key="item.id" class="menu-card">
              <img :src="item.image || 'placeholder.jpg'" :alt="item.name" />
              <div class="card-content">
                <h3>{{ item.name }}</h3>
                <div class="price">RUB {{ item.price }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const restaurantInfo = ref<any>({});
const items = ref<any[]>([]);
const categories = ref<any[]>([]);

onMounted(() => {
  const savedData = localStorage.getItem('restaurantData');
  if (savedData) {
    try {
      const parsed = JSON.parse(savedData);
      restaurantInfo.value = parsed.info || {};
      items.value = parsed.items || [];
      categories.value = parsed.cats || [];
    } catch (e) {
      console.error("Ошибка при чтении данных:", e);
    }
  }
});
</script>

<style scoped>
/* 1. Базовые стили */
.mobile-app-wrapper {
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
  width: 100vw !important;
  height: 100vh !important;
  background-color: #2a2a2a !important;
  position: fixed !important;
  top: 0; left: 0; z-index: 9999;
}

/* 2. Стили для DESKTOP (Фиксированная рамка телефона) */
@media (min-width: 768px) {
  .content-container {
    width: 310px !important;
    height: 620px !important;
    max-height: 620px !important;
    background: #000;
    border-radius: 40px;
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    display: flex;
    flex-direction: column;
    position: relative;
  }
}

/* 3. Адаптив: Убираем рамку на MOBILE */
@media (max-width: 767px) {
  .mobile-app-wrapper {
    background-color: #000 !important;
    display: block !important;
    position: absolute !important;
  }
  
  .content-container {
    width: 100% !important;
    height: 100vh !important;
    max-height: none !important;
    border-radius: 0 !important;
    box-shadow: none !important;
  }
}

/* Контент: скроллинг внутри */
.menu-preview { 
  flex: 1; 
  display: flex;
  flex-direction: column;
  overflow-y: auto; 
  scrollbar-width: none; 
}
.menu-preview::-webkit-scrollbar { display: none; }

.phone-header { 
  flex-shrink: 0; 
  height: 120px; 
  display: flex; 
  flex-direction: column; 
  justify-content: center; 
  align-items: center; 
  color: white; 
  background-size: cover; 
  background-position: center; 
}

.phone-body { 
  flex: 1; 
  padding: 16px; 
}

/* Элементы меню */
.phone-avatar-wrapper { width: 60px; height: 60px; border-radius: 50%; border: 3px solid #000; background: #333; overflow: hidden; margin-bottom: 5px; }
.phone-avatar-wrapper img { width: 100%; height: 100%; object-fit: cover; }
.phone-logo { font-weight: bold; font-size: 14px; text-shadow: 0 0 4px rgba(0,0,0,0.5); }
.phone-wifi-btn { background: #dcece823; color: #fafafa; padding: 10px; border-radius: 12px; font-size: 12px; margin-bottom: 15px; }
.phone-categories { display: flex; gap: 5px; margin-bottom: 15px; overflow-x: auto; }
.phone-cat-badge { padding: 4px 10px; border-radius: 12px; font-size: 10px; white-space: nowrap; color: white; }
.menu-items-grid-phone { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.menu-card { background: #ffffff; border-radius: 12px; overflow: hidden; }
.menu-card img { width: 100%; height: 80px; object-fit: cover; }
.card-content { padding: 8px; }
.card-content h3 { font-size: 12px; color: #000; margin: 0; }
.price { font-weight: bold; color: #2c7a7b; font-size: 11px; margin-top: 4px; }
</style>