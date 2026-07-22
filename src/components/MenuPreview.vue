<template>

  <div class="mobile-app-wrapper">

    <div class="content-container">

      <div class="menu-preview">

        <!-- Шапка: зафиксирована сверху -->
        <header class="phone-header" :style="{ 
          backgroundColor: restaurantInfo.secondaryColor, 
          backgroundImage: restaurantInfo.coverImage 
            ? (restaurantInfo.showCoverGradient !== false 
                ? `linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.6)), url(${restaurantInfo.coverImage})` 
                : `url(${restaurantInfo.coverImage})`) 
            : 'none' 
        }">
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



          <!-- Категории с кнопкой "Все категории" -->

          <div class="phone-categories">

            <button 

              class="phone-cat-badge" 

              :class="{ active: selectedCategory === null }"

              :style="selectedCategory === null ? { backgroundColor: restaurantInfo.primaryColor, color: '#ffffff' } : {}"

              @click="selectedCategory = null"

            >

              Все категории

            </button>

            <button 

              v-for="cat in categories" 

              :key="cat.id" 

              class="phone-cat-badge"

              :class="{ active: selectedCategory === cat.id }"

              :style="selectedCategory === cat.id ? { backgroundColor: restaurantInfo.primaryColor, color: '#ffffff' } : {}"

              @click="selectedCategory = cat.id"

            >

              {{ cat.name }}

            </button>

          </div>



          <!-- Уведомление, если ничего не найдено -->

          <div v-if="filteredItems.length === 0" class="empty-search-notice">

            Ничего не найдено

          </div>



          <!-- Сетка блюд -->

          <div class="menu-items-grid-phone">

            <div v-for="item in filteredItems" :key="item.id" class="menu-card">

              <img :src="item.image || 'placeholder.jpg'" :alt="item.name" />

              <div class="card-content">

                <div class="dish-details">

                  <h3>{{ item.name }}</h3>

                  <div class="price">RUB {{ item.price }},00</div>

                </div>



                <!-- Если товар уже в корзине, показываем счетчик -->

                <div v-if="getItemQuantity(item.id) > 0" class="counter-controls">

                  <button @click="decreaseQuantity(item.id)">-</button>

                  <span>{{ getItemQuantity(item.id) }}</span>

                  <button @click="increaseQuantity(item.id)">+</button>

                </div>



                <!-- Иначе показываем кнопку добавления -->

                <button v-else class="add-btn" @click="addToCart(item)" :style="{ backgroundColor: restaurantInfo.primaryColor }">

                  + добавить

                </button>

              </div>

            </div>

          </div>

        </div>

      </div>



      <!-- Нижняя панель управления -->

      <div class="floating-settings-bar" :style="{ backgroundColor: restaurantInfo.primaryColor || '#2c7a7b' }">

        <button class="bar-btn">🌐 Русский</button>

        <button class="bar-btn">🎛️ Фильтры</button>

        <button class="bar-btn">📖</button>

        <button class="bar-btn">📦</button>

        <button class="bar-btn">🔍</button>

      </div>



      <!-- Плавающая панель корзины снизу -->

      <div v-if="cartItems.length > 0" class="floating-cart" :style="{ backgroundColor: restaurantInfo.primaryColor || '#2c7a7b' }" @click="openCartModal">

        <div class="cart-left">

          <span class="cart-title">Посмотреть корзину</span>

        </div>

        <div class="cart-right">

          <span class="cart-sum">RUB {{ totalPrice }}</span>

          <span class="dots">•••</span>

        </div>

      </div>

    </div>

  </div>

</template>



<script setup lang="ts">

import { ref, computed, onMounted } from 'vue';

import { useCart } from '../composables/useCart';



const restaurantInfo = ref<any>({});

const items = ref<any[]>([]);

const categories = ref<any[]>([]);

const selectedCategory = ref<string | number | null>(null);



const { cartItems, addToCart, increaseQuantity, decreaseQuantity, totalPrice } = useCart();



// Фильтрация блюд по доступности и выбранной категории

const filteredItems = computed(() => {

  return items.value.filter(i => {

    if (!i.isAvailable) return false;

    if (selectedCategory.value !== null && i.categoryId !== selectedCategory.value) {

      return false;

    }

    return true;

  });

});



// Проверка количества конкретного блюда в корзине

const getItemQuantity = (id: string | number) => {

  const item = cartItems.value.find(i => i.id === id);

  return item ? item.quantity : 0;

};



const openCartModal = () => {

  console.log("Открыть корзину");

};



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

  padding-bottom: 75px; 

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



/* Категории */

.phone-categories { display: flex; gap: 8px; margin-bottom: 14px; overflow-x: auto; padding-bottom: 4px; scrollbar-width: none; }

.phone-categories::-webkit-scrollbar { display: none; }

.phone-cat-badge { padding: 8px 14px; border-radius: 16px; font-size: 12px; font-weight: 600; white-space: nowrap; border: none; cursor: pointer; transition: all 0.2s ease; box-shadow: 0 2px 6px rgba(0,0,0,0.1); color: #111111; background: rgba(255, 255, 255, 0.2); }

.phone-cat-badge.active { color: #ffffff; }

.phone-cat-badge:hover { opacity: 0.9; }



.empty-search-notice { text-align: center; color: #111111; font-size: 13px; margin-top: 40px; }



.menu-items-grid-phone { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }

.menu-card { background: #ffffff; border-radius: 12px; overflow: hidden; display: flex; flex-direction: column; justify-content: space-between; }

.menu-card img { width: 100%; height: 80px; object-fit: cover; }

.card-content { padding: 8px; display: flex; flex-direction: column; justify-content: space-between; flex: 1; }

.dish-details h3 { font-size: 12px; color: #000; margin: 0; }

.price { font-weight: bold; color: #2c7a7b; font-size: 11px; margin-top: 2px; }



/* Кнопки добавления и счетчики */

.add-btn {

  margin-top: 6px;

  width: 100%;

  border: none;

  padding: 5px;

  border-radius: 8px;

  color: #fff;

  font-size: 11px;

  cursor: pointer;

  font-weight: 600;

}



.counter-controls {

  margin-top: 6px;

  display: flex;

  justify-content: space-between;

  align-items: center;

  background: #f3f4f6;

  border-radius: 8px;

  padding: 2px 6px;

}



.counter-controls button {

  background: transparent;

  border: none;

  font-size: 14px;

  font-weight: bold;

  cursor: pointer;

  color: #333;

  padding: 0 4px;

}



.counter-controls span {

  font-size: 12px;

  font-weight: bold;

  color: #333;

}



/* Нижняя панель управления */

.floating-settings-bar {

  position: absolute;

  bottom: 12px;

  left: 12px;

  right: 12px;

  border-radius: 20px;

  padding: 8px 12px;

  display: flex;

  justify-content: space-around;

  align-items: center;

  box-shadow: 0 4px 12px rgba(0,0,0,0.3);

  z-index: 90;

}



.bar-btn {

  background: transparent;

  border: none;

  color: white;

  font-size: 12px;

  font-weight: 600;

  cursor: pointer;

  padding: 4px 8px;

}



/* Плавающая панель корзины */

.floating-cart {

  position: absolute;

  bottom: 60px;

  left: 16px;

  right: 16px;

  border-radius: 24px;

  padding: 12px 16px;

  display: flex;

  justify-content: space-between;

  align-items: center;

  color: white;

  cursor: pointer;

  box-shadow: 0 4px 12px rgba(0,0,0,0.3);

  z-index: 100;

  font-weight: 600;

  font-size: 13px;

}



.cart-right {

  display: flex;

  align-items: center;

  gap: 10px;

}



.dots {

  letter-spacing: 2px;

}

</style>