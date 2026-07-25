<template>
  <div class="client-wrapper" :style="{ backgroundColor: restaurantInfo.backgroundColor || '#f4f6f3' }">
    <div class="phone-mockup">
      <div class="phone-screen" :style="{ color: restaurantInfo.textColor || '#fff' }">
        
        <!-- Шапка -->
        <div class="phone-header" :style="{ 
          backgroundColor: restaurantInfo.secondaryColor || '#333', 
          backgroundImage: restaurantInfo.coverImage 
            ? (restaurantInfo.showCoverGradient !== false 
              ? `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.6)), url(${restaurantInfo.coverImage})` 
              : `url(${restaurantInfo.coverImage})`) 
            : 'none', 
          backgroundSize: 'cover', 
          backgroundPosition: 'center' 
        }">
          <div class="phone-avatar-wrapper">
            <div class="phone-avatar-placeholder">
              <span v-if="!restaurantInfo.avatarImage">🍽️</span>
              <img v-else :src="restaurantInfo.avatarImage" alt="Аватар" style="width: 100%; height: 100%; object-fit: cover;" />
            </div>
          </div>
          <div class="phone-logo">{{ restaurantInfo.name || 'Jazzve' }}</div>
        </div>

        <!-- Тело экрана (Категории и Товары) -->
        <div class="phone-body">
          <div class="phone-categories">
            <button 
              class="phone-cat-badge" 
              :class="{ active: selectedCategory === 'all' }"
              @click="selectedCategory = 'all'"
            >
              Все категории
            </button>
            <button 
              v-for="cat in categories" 
              :key="cat.id || cat.name"
              class="phone-cat-badge"
              :class="{ active: selectedCategory === cat.name }"
              @click="selectedCategory = cat.name"
            >
              {{ cat.name }}
            </button>
          </div>

          <div v-if="filteredItems.length === 0" class="empty-search-notice">
            В этой категории пока нет блюд
          </div>
          <div v-else :class="viewMode === 'grid' ? 'menu-items-grid-phone' : 'menu-items-list-phone'">
            <div v-for="item in filteredItems" :key="item.id" :class="viewMode === 'grid' ? 'menu-card' : 'menu-list-row'">
              <img v-if="viewMode === 'grid' && item.image" :src="item.image" :alt="item.name" />
              <div class="card-content">
                <div>
                  <h3>{{ item.name }}</h3>
                  <p v-if="item.description">{{ item.description }}</p>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; margin-top: 6px;">
                  <span class="price">RUB {{ Number(item.price || 0).toFixed(2) }}</span>
                  <button class="add-to-cart-btn" @click="addToCart(item)">+ добавить</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Тост уведомления -->
        <div v-if="showToast" class="toast-notification">
          {{ toastMessage }}
        </div>

        <!-- Нижняя панель настроек -->
        <div class="floating-settings-bar" :style="{ backgroundColor: restaurantInfo.primaryColor || restaurantInfo.secondaryColor || '#646cff' }">
          <button class="fs-item" @click="handleOpenModal('language')">
            <span class="fs-icon">🌐</span>
            <span class="fs-text">{{ currentLang === 'Русский' ? 'РУС' : currentLang }}</span>
          </button>
          <div class="fs-divider"></div>

          <button class="fs-item" @click="handleOpenModal('filters')">
            <span class="fs-icon">🎛️</span>
            <span class="fs-text">Фильтры</span>
          </button>
          <div class="fs-divider"></div>

          <button class="fs-icon-btn" @click="handleOpenModal('share')" title="Поделиться">
            <span>📤</span>
          </button>
          <div class="fs-divider"></div>

          <button class="fs-icon-btn" @click="toggleViewMode" :title="viewMode === 'grid' ? 'Сделать списком' : 'Сделать сеткой'">
            <span>{{ viewMode === 'grid' ? '📋' : '🔲' }}</span>
          </button>
          <div class="fs-divider"></div>

          <button class="fs-icon-btn" @click="handleOpenModal('search')" title="Поиск">
            <span>🔍</span>
          </button>
        </div>

        <!-- Кнопка корзины -->
        <div v-if="cartItems.length > 0" class="floating-cart-bar" @click="activeModal = 'cart'">
          <span>🛒 Корзина ({{ totalQuantity }})</span>
          <span>RUB {{ totalPrice.toFixed(2) }}</span>
        </div>

        <!-- МОДАЛЬНОЕ ОКНО: КОРЗИНА -->
        <div v-if="activeModal === 'cart'" class="bottom-sheet-overlay" @click.self="activeModal = 'none'">
          <div class="bottom-sheet">
            <div class="sheet-indicator"></div>
            <div class="sheet-header-flex">
              <h3>Ваш заказ</h3>
              <button class="clear-filters-text-btn" @click="cartItems = []">Очистить</button>
            </div>
            <div class="cart-items-list" style="max-height: 180px; overflow-y: auto; display: flex; flex-direction: column; gap: 8px;">
              <div v-for="cItem in cartItems" :key="cItem.id" style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <div style="font-size: 11px; font-weight: bold;">{{ cItem.name }}</div>
                  <div style="font-size: 10px; color: #888;">RUB {{ (cItem.price * cItem.quantity).toFixed(2) }}</div>
                </div>
                <div style="display: flex; gap: 6px; align-items: center;">
                  <button @click="decreaseQuantity(cItem.id)" style="padding: 2px 6px;">-</button>
                  <span style="font-size: 11px;">{{ cItem.quantity }}</span>
                  <button @click="increaseQuantity(cItem.id)" style="padding: 2px 6px;">+</button>
                </div>
              </div>
            </div>
            <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 11px; margin-top: 6px;">
              <span>Итого:</span>
              <span>RUB {{ totalPrice.toFixed(2) }}</span>
            </div>
            <button class="show-results-btn" @click="handleCheckout">Оформить заказ</button>
          </div>
        </div>

        <!-- МОДАЛЬНОЕ ОКНО: ЯЗЫК -->
        <div v-if="activeModal === 'language'" class="bottom-sheet-overlay" @click.self="activeModal = 'none'">
          <div class="bottom-sheet">
            <div class="sheet-indicator"></div>
            <h3>Язык</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 6px;">
              <button class="lang-option-btn" :class="{ active: currentLang === 'Deutsch' }" @click="selectLanguage('Deutsch')">🇩🇪 Deutsch</button>
              <button class="lang-option-btn" :class="{ active: currentLang === 'English' }" @click="selectLanguage('English')">🇬🇧 English</button>
              <button class="lang-option-btn" :class="{ active: currentLang === 'Русский' }" @click="selectLanguage('Русский')">🇷🇺 Русский</button>
              <button class="lang-option-btn" :class="{ active: currentLang === 'Аԥсшәа' }" @click="selectLanguage('Аԥсшәа')">🟢 Аԥсшәа</button>
            </div>
            <div class="modal-footer-text">© Проект от Web-Visual-World | 2024</div>
          </div>
        </div>

        <!-- МОДАЛЬНОЕ ОКНО: ФИЛЬТРЫ -->
        <div v-if="activeModal === 'filters'" class="bottom-sheet-overlay" @click.self="activeModal = 'none'">
          <div class="bottom-sheet">
            <div class="sheet-indicator"></div>
            <div class="sheet-header-flex">
              <h3>Фильтры</h3>
              <button class="clear-filters-text-btn" @click="activeModal = 'none'">очистить</button>
            </div>
            <div style="font-size: 11px; font-weight: bold; margin-top: 4px;">Питание</div>
            <div style="display: flex; flex-direction: column; gap: 6px; margin-top: 4px;">
              <button class="filter-option-btn">🌰 Без орехов</button>
              <button class="filter-option-btn">🥛 Без лактозы</button>
              <button class="filter-option-btn">🌾 Без глютена</button>
            </div>
            <button class="show-results-btn" style="margin-top: 8px;" @click="activeModal = 'none'">Показать результаты</button>
            <div class="modal-footer-text">© Проект от Web-Visual-World | 2024</div>
          </div>
        </div>

        <!-- МОДАЛЬНОЕ ОКНО: ПОДЕЛИТЬСЯ -->
        <div v-if="activeModal === 'share'" class="bottom-sheet-overlay" @click.self="activeModal = 'none'">
          <div class="bottom-sheet">
            <div class="sheet-indicator"></div>
            <h3>Поделиться меню</h3>
            <p style="font-size: 10px; color: #888; margin: 4px 0;">Скопируйте ссылку на электронное меню:</p>
            <input type="text" readonly value="192.168.31.240:5173/client?preview=true" style="width: 100%; padding: 6px; font-size: 10px; border-radius: 6px; border: 1px solid #444; background: #222; color: #fff;" />
            <button class="show-results-btn" style="margin-top: 8px;" @click="activeModal = 'none'">Копировать ссылку</button>
          </div>
        </div>

        <!-- МОДАЛЬНОЕ ОКНО: ПОИСК -->
        <div v-if="activeModal === 'search'" class="bottom-sheet-overlay" @click.self="activeModal = 'none'">
          <div class="bottom-sheet">
            <div class="sheet-indicator"></div>
            <h3>Поиск по меню</h3>
            <input type="text" placeholder="Введите название блюда..." style="width: 100%; padding: 6px; font-size: 10px; border-radius: 6px; border: 1px solid #444; background: #222; color: #fff; margin-top: 6px;" />
            <button class="show-results-btn" style="margin-top: 8px;" @click="activeModal = 'none'">Найти</button>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useMenuStore } from '../store/menuStore';
import { useOrders } from '../composables/useOrders';

const { addOrder } = useOrders();

const restaurantInfo = ref<any>({
  backgroundColor: '#f4f6f3',
  textColor: '#ffffff',
  secondaryColor: '#333333',
  primaryColor: '#646cff',
  name: 'Jazzve'
});
const items = ref<any[]>([]);
const categories = ref<any[]>([]);
const selectedCategory = ref<string>('all');
const currentLang = ref<string>('Русский');
const viewMode = ref<'grid' | 'list'>('grid');
const activeModal = ref<'none' | 'cart' | 'filters' | 'search' | 'share' | 'language'>('none');

const cartItems = ref<any[]>([]);
const showToast = ref(false);
const toastMessage = ref('');

const triggerToast = (msg: string) => {
  toastMessage.value = msg;
  showToast.value = true;
  setTimeout(() => { showToast.value = false; }, 2000);
};

const filteredItems = computed(() => {
  if (selectedCategory.value === 'all') {
    return items.value;
  }
  return items.value.filter((item: any) => item.category === selectedCategory.value);
});

onMounted(() => {
  const savedInfo = localStorage.getItem('preview_restaurantInfo');
  const savedItems = localStorage.getItem('preview_items');
  const savedCategories = localStorage.getItem('preview_categories');

  if (savedInfo) { try { restaurantInfo.value = JSON.parse(savedInfo); } catch (e) {} }
  if (savedItems) { try { items.value = JSON.parse(savedItems); } catch (e) {} }
  if (savedCategories) { try { categories.value = JSON.parse(savedCategories); } catch (e) {} }

  if (!savedInfo && !savedItems) {
    try {
      const menuStore = useMenuStore();
      if (menuStore) {
        restaurantInfo.value = menuStore.restaurantInfo;
        items.value = menuStore.items;
        categories.value = menuStore.categories || [];
      }
    } catch (e) {}
  }
});

const addToCart = (item: any) => {
  const existing = cartItems.value.find(i => i.id === item.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cartItems.value.push({ ...item, quantity: 1 });
  }
  triggerToast(`Блюдо "${item.name}" добавлено!`);
};

const increaseQuantity = (id: string | number) => {
  const item = cartItems.value.find(i => i.id === id);
  if (item) item.quantity += 1;
};

const decreaseQuantity = (id: string | number) => {
  const index = cartItems.value.findIndex(i => i.id === id);
  if (index !== -1) {
    if (cartItems.value[index].quantity > 1) {
      cartItems.value[index].quantity -= 1;
    } else {
      cartItems.value.splice(index, 1);
    }
  }
};

const totalQuantity = computed(() => {
  return cartItems.value.reduce((sum, item) => sum + item.quantity, 0);
});

const totalPrice = computed(() => {
  return cartItems.value.reduce((sum, item) => sum + (item.price * item.quantity), 0);
});

const handleCheckout = () => {
  if (cartItems.value.length === 0) return;
  addOrder(cartItems.value, totalPrice.value, 'delivery');
  cartItems.value = [];
  activeModal.value = 'none';
  triggerToast('Заказ успешно оформлен!');
};

const handleOpenModal = (modalType: 'language' | 'filters' | 'share' | 'search') => {
  activeModal.value = modalType;
};

const selectLanguage = (lang: string) => {
  currentLang.value = lang;
  activeModal.value = 'none';
  triggerToast(`Язык изменен: ${lang}`);
};

const toggleViewMode = () => {
  viewMode.value = viewMode.value === 'grid' ? 'list' : 'grid';
};
</script>

<style scoped>
.client-wrapper {
  width: 100vw;
  height: 100vh;
  height: 100dvh;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  box-sizing: border-box;
}

/* Адаптивный мокап телефона: подстраивается по высоте экрана и центрируется */
.phone-mockup {
  width: 330px;
  max-width: 100vw;
  height: 90vh;
  max-height: 750px;
  background: #000;
  border: 10px solid #2a2a2a;
  border-radius: 36px;
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
  box-shadow: 0 15px 40px rgba(0,0,0,0.35);
  box-sizing: border-box;
}

/* На реальных мобильных устройствах убираем рамку телефона, делая интерфейс на весь экран */
@media (max-width: 600px) {
  .phone-mockup {
    width: 100vw;
    height: 100vh;
    height: 100dvh;
    max-height: none;
    border: none;
    border-radius: 0;
    box-shadow: none;
  }
}

.phone-screen {
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
  background: var(--editor-bg, #121212);
  color: var(--text-main, #fff);
  overflow: hidden;
}

.phone-header {
  height: 110px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
  color: white;
  text-align: center;
}

.phone-body {
  flex: 1;
  padding: 10px;
  overflow-y: auto;
  padding-bottom: 80px;
}

.phone-avatar-wrapper {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  border: 2px solid #fff;
  background: #333;
  overflow: hidden;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.phone-logo {
  font-weight: bold;
  font-size: 13px;
  text-shadow: 0 0 4px rgba(0,0,0,0.5);
}

.phone-categories {
  display: flex;
  gap: 6px;
  margin-bottom: 10px;
  overflow-x: auto;
  padding-bottom: 4px;
  scrollbar-width: none;
}
.phone-categories::-webkit-scrollbar { display: none; }

.phone-cat-badge { 
  padding: 5px 10px; 
  border-radius: 14px; 
  font-size: 10px; 
  font-weight: 600; 
  white-space: nowrap; 
  border: none; 
  cursor: pointer; 
  transition: all 0.2s ease; 
  color: #111;
  background: rgba(255, 255, 255, 0.8);
}

.phone-cat-badge.active { 
  color: #ffffff; 
  background: var(--accent, #646cff);
}

.menu-items-grid-phone {
  display: grid !important;
  grid-template-columns: repeat(2, 1fr) !important;
  gap: 6px !important;
}

.menu-card {
  background: var(--bg-card, #1e1e1e);
  border-radius: 10px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--border-color, #2e2e2e);
  padding: 6px;
}

.menu-card img {
  width: 100%;
  height: 80px;
  object-fit: cover;
  border-radius: 6px;
}

.card-content h3 {
  margin: 4px 0 2px 0;
  font-size: 11px;
  font-weight: bold;
}

.card-content p {
  font-size: 9px;
  color: var(--text-muted, #888);
  margin: 0 0 4px 0;
}

.price {
  font-weight: bold;
  color: var(--accent, #646cff);
  font-size: 10px;
}

.add-to-cart-btn {
  background: var(--accent, #646cff);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 3px 6px;
  font-size: 9px;
  font-weight: bold;
  cursor: pointer;
}

.menu-items-list-phone {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.menu-list-row {
  background: var(--bg-card, #1e1e1e);
  border: 1px solid var(--border-color, #2e2e2e);
  border-radius: 8px;
  padding: 6px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.floating-settings-bar {
  position: absolute;
  bottom: 8px;
  left: 8px;
  right: 8px;
  color: white;
  border-radius: 20px;
  padding: 4px 6px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 15px rgba(0,0,0,0.4);
  z-index: 15;
  box-sizing: border-box;
}

.fs-item {
  background: transparent;
  border: none;
  color: inherit;
  font-size: 10px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
  padding: 2px;
  flex: 1.2;
  min-width: 0;
}

.fs-icon-btn {
  background: transparent;
  border: none;
  color: inherit;
  font-size: 11px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2px;
  flex: 0.8;
  min-width: 0;
}

.fs-icon {
  font-size: 11px;
  flex-shrink: 0;
}

.fs-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.fs-divider {
  width: 1px;
  height: 12px;
  background: rgba(255, 255, 255, 0.3);
  flex-shrink: 0;
  margin: 0 1px;
}

.floating-cart-bar {
  position: absolute;
  bottom: 44px;
  left: 8px;
  right: 8px;
  background: #10b981;
  color: white;
  border-radius: 14px;
  padding: 6px 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 10px;
  font-weight: bold;
  cursor: pointer;
  z-index: 20;
  box-shadow: 0 4px 10px rgba(0,0,0,0.2);
}

.bottom-sheet-overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 100;
  display: flex;
  align-items: flex-end;
}

.bottom-sheet {
  background: #1e1e1e;
  color: #fff;
  width: 100%;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sheet-indicator {
  width: 28px;
  height: 3px;
  background: #444;
  border-radius: 2px;
  align-self: center;
}

.sheet-header-flex {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sheet-header-flex h3, .bottom-sheet h3 {
  font-size: 13px;
  margin: 0;
  color: #646cff;
}

.clear-filters-text-btn {
  background: transparent;
  border: none;
  color: #888;
  font-size: 10px;
  cursor: pointer;
  text-decoration: underline;
}

.show-results-btn, .lang-option-btn, .filter-option-btn {
  background: #2a2a2a;
  color: white;
  border: 1px solid #3a3a3a;
  border-radius: 8px;
  padding: 8px;
  font-size: 10px;
  cursor: pointer;
  text-align: left;
}

.show-results-btn {
  background: #646cff;
  border: none;
  text-align: center;
  font-weight: bold;
}

.lang-option-btn.active {
  background: #646cff;
  border-color: #646cff;
}

.modal-footer-text {
  text-align: center;
  font-size: 8px;
  color: #666;
  margin-top: 4px;
}

.toast-notification {
  position: absolute;
  top: 12px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.85);
  color: #fff;
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 10px;
  z-index: 200;
  white-space: nowrap;
  box-shadow: 0 4px 10px rgba(0,0,0,0.3);
}

.empty-search-notice {
  text-align: center;
  font-size: 10px;
  margin-top: 25px;
  color: #888;
}
</style>