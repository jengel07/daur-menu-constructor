<template>
  <div class="client-wrapper" :style="{ backgroundColor: restaurantInfo.backgroundColor || '#f4f6f3' }">
    <!-- Кнопка закрытия предпросмотра (скрыта на мобильных устройствах) -->
    <button class="close-preview-btn" @click="goToConstructor">
      ✕ {{ t('closePreview') || 'Закрыть предпросмотр' }}
    </button>

    <div class="phone-mockup">
      <div class="phone-screen" :style="{ 
        backgroundColor: restaurantInfo.backgroundColor || '#121212', 
        color: restaurantInfo.textColor || '#fff' 
      }">
        
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
          <div class="phone-logo" style="color: #ffffff;">{{ restaurantInfo.name || 'Jazzve' }}</div>
        </div>

        <!-- Тело экрана (Категории и Товары) -->
        <div class="phone-body">
          <div class="phone-categories">
            <button 
              class="phone-cat-badge" 
              :class="{ active: selectedCategory === 'all' }"
              :style="selectedCategory === 'all' ? { backgroundColor: restaurantInfo.primaryColor || '#646cff', color: '#fff' } : {}"
              @click="selectedCategory = 'all'"
            >
              {{ t('allCategories') }}
            </button>
            <button 
              v-for="cat in categories" 
              :key="cat.id || cat.name"
              class="phone-cat-badge"
              :class="{ active: selectedCategory === (cat.id || cat.name) }"
              :style="selectedCategory === (cat.id || cat.name) ? { backgroundColor: restaurantInfo.primaryColor || '#646cff', color: '#fff' } : {}"
              @click="selectedCategory = (cat.id || cat.name)"
            >
              {{ getLocalizedCategoryName(cat) }}
            </button>
          </div>

          <div v-if="filteredItems.length === 0" class="empty-search-notice">
            {{ t('noDishes') }}
          </div>
          <div v-else :class="viewMode === 'grid' ? 'menu-items-grid-phone' : 'menu-items-list-phone'">
            <div v-for="item in filteredItems" :key="item.id" :class="viewMode === 'grid' ? 'menu-card' : 'menu-list-row'">
              <img v-if="viewMode === 'grid' && item.image" :src="item.image" :alt="getItemName(item)" />
              <div class="card-content">
                <div class="card-text-block">
                  <h3>{{ getItemName(item) }}</h3>
                  <!-- Цена сразу под названием блюда в режиме списка -->
                  <span v-if="viewMode === 'list'" class="price" :style="{ color: restaurantInfo.primaryColor || '#646cff' }">{{ Number(item.price || 0).toFixed(2) }} ₽</span>
                  <p v-if="viewMode === 'grid' && getItemDescription(item)">{{ getItemDescription(item) }}</p>
                </div>
                <div class="card-bottom-row">
                  <span v-if="viewMode === 'grid'" class="price" :style="{ color: restaurantInfo.primaryColor || '#646cff' }">{{ Number(item.price || 0).toFixed(2) }} ₽</span>
                  
                  <!-- Кнопка добавления или счетчик количества -->
                  <div v-if="getItemQuantity(item.id) > 0" class="counter-controls" :style="{ borderColor: restaurantInfo.primaryColor || '#646cff' }">
                    <button class="counter-btn" @click="decreaseQuantity(item.id)">-</button>
                    <span class="counter-value">{{ getItemQuantity(item.id) }}</span>
                    <button class="counter-btn" @click="increaseQuantity(item.id)">+</button>
                  </div>
                  <button v-else class="add-to-cart-btn" :style="{ backgroundColor: restaurantInfo.primaryColor || '#646cff' }" @click="addToCart(item)">+ {{ t('add') }}</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Подключаемый компонент панели управления и модалок -->
        <SettingsbarForClient
          :active-modal="activeModal"
          :primary-color="restaurantInfo.primaryColor || '#646cff'"
          :secondary-color="restaurantInfo.secondaryColor || '#333'"
          :view-mode="viewMode"
          :current-lang="currentLang"
          :cart-items="cartItems"
          :total-price="totalPrice"
          v-model:searchQuery="searchQuery"
          :selected-filters="selectedFilters"
          :restaurant-info="restaurantInfo"
          :t="t"
          :getItemName="getItemName"
          @open="(modal) => activeModal = modal"
          @close="activeModal = 'none'"
          @toggle-view="toggleViewMode"
          @select-lang="selectLanguage"
          @clear-cart="cartItems = []"
          @increase="increaseQuantity"
          @decrease="decreaseQuantity"
          @checkout="handleCheckout"
          @toggle-filter="toggleFilter"
          @clear-filters="selectedFilters = []"
        />

        <!-- Кнопка корзины -->
        <div v-if="cartItems.length > 0" class="floating-cart-bar" @click="activeModal = 'cart'" :style="{ backgroundColor: restaurantInfo.primaryColor || '#10b981' }">
          <span style="display: flex; align-items: center; gap: 6px;">
            <ShoppingCart :size="18" stroke-width="2" /> 
            {{ t('cart') }} ({{ totalQuantity }})
          </span>
          <span>{{ totalPrice.toFixed(2) }} ₽</span>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useMenuStore } from '../store/menuStore';
import { useOrders } from '../composables/useOrders';
import SettingsbarForClient from '../components/SettingsbarForClient.vue';
import { ShoppingCart } from 'lucide-vue-next';

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
const currentLang = ref<string>('ru'); 
const viewMode = ref<'grid' | 'list'>('list');
const activeModal = ref<'none' | 'cart' | 'filters' | 'search' | 'share' | 'language'>('none');
const searchQuery = ref<string>('');
const selectedFilters = ref<string[]>([]);

const cartItems = ref<any[]>([]);

const translations: Record<string, Record<string, string>> = {
  ru: {
    allCategories: 'Все категории',
    noDishes: 'В этой категории пока нет блюд',
    add: 'добавить',
    filters: 'Фильтры',
    share: 'Поделиться',
    search: 'Поиск',
    cart: 'Корзина',
    yourOrder: 'Ваш заказ',
    clear: 'Очистить',
    total: 'Итого',
    checkout: 'Оформить заказ',
    languageTitle: 'Язык',
    nutrition: 'Питание',
    nutFree: 'Без орехов',
    lactoseFree: 'Без лактозы',
    glutenFree: 'Без глютена',
    showResults: 'Показать результаты',
    shareMenu: 'Поделиться меню',
    shareDesc: 'Скопируйте ссылку на электронное меню:',
    copyLink: 'Копировать ссылку',
    searchMenu: 'Поиск по меню',
    searchPlaceholder: 'Введите название блюда...',
    find: 'Найти',
    closePreview: 'Закрыть предпросмотр',
    shareLinkTitle: 'Поделиться ссылкой',
    shareVia: 'Поделиться с помощью'
  },
  en: {
    allCategories: 'All categories',
    noDishes: 'No dishes in this category yet',
    add: 'add',
    filters: 'Filters',
    share: 'Share',
    search: 'Search',
    cart: 'Cart',
    yourOrder: 'Your order',
    clear: 'Clear',
    total: 'Total',
    checkout: 'Checkout',
    languageTitle: 'Language',
    nutrition: 'Dietary',
    nutFree: 'Nut-free',
    lactoseFree: 'Lactose-free',
    glutenFree: 'Gluten-free',
    showResults: 'Show results',
    shareMenu: 'Share menu',
    shareDesc: 'Copy the link to the digital menu:',
    copyLink: 'Copy link',
    searchMenu: 'Search menu',
    searchPlaceholder: 'Enter dish name...',
    find: 'Find',
    closePreview: 'Close preview'
  },
  de: {
    allCategories: 'Alle Kategorien',
    noDishes: 'Noch keine Gerichte in dieser Kategorie',
    add: 'hinzufügen',
    filters: 'Filter',
    share: 'Teilen',
    search: 'Suchen',
    cart: 'Warenkorb',
    yourOrder: 'Ihre Bestellung',
    clear: 'Löschen',
    total: 'Gesamt',
    checkout: 'Zur Kasse',
    languageTitle: 'Sprache',
    nutrition: 'Ernährung',
    nutFree: 'Nussfrei',
    lactoseFree: 'Laktosefrei',
    glutenFree: 'Glutenfrei',
    showResults: 'Ergebnisse anzeigen',
    shareMenu: 'Menü teilen',
    shareDesc: 'Kopieren Sie den Link zum digitalen Menü:',
    copyLink: 'Link kopieren',
    searchMenu: 'Menü durchsuchen',
    searchPlaceholder: 'Gericht eingeben...',
    find: 'Suchen',
    closePreview: 'Vorschau schließen'
  },
  ab: {
    allCategories: 'Акатегориақəа зегьы',
    noDishes: 'Ари акатегориаҿы абжьарҩқəа ыҟам',
    add: 'аҵахра',
    filters: 'Афильтрқəа',
    share: 'Ибжьышьҭа',
    search: 'Аҧшаара',
    cart: 'Аҭыҧ',
    yourOrder: 'Ижәарҵәа',
    clear: 'Иԥышәа',
    total: 'Зегьы еицҵаны',
    checkout: 'Азҵаара аҿкаара',
    languageTitle: 'Абызшəа',
    nutrition: 'Аџьаны',
    nutFree: 'Аҟьақəа рыда',
    lactoseFree: 'Лаクトoза ыҟам',
    glutenFree: 'Глютен ыҟам',
    showResults: 'Арезультатқəа рыба',
    shareMenu: 'Аменю ахыҵшьҭа',
    shareDesc: 'Икопируит ассылка ацифртə меню ахь:',
    copyLink: 'Ассылка аира',
    searchMenu: 'Аменю аҧшаара',
    searchPlaceholder: 'Иҭажəа ажьарҩы...',
    find: 'Иҧшаа',
    closePreview: 'Апредпросмотр аҿкуara'
  }
};

const t = (key: string) => {
  return translations[currentLang.value]?.[key] || translations['ru'][key] || key;
};

const getItemName = (item: any) => {
  if (!item) return '';
  if (typeof item.name === 'object' && item.name !== null) {
    return item.name[currentLang.value] || item.name['ru'] || Object.values(item.name)[0] || '';
  }
  return item.name || '';
};

const getItemDescription = (item: any) => {
  if (!item) return '';
  if (typeof item.description === 'object' && item.description !== null) {
    return item.description[currentLang.value] || item.description['ru'] || '';
  }
  return item.description || '';
};

const getLocalizedCategoryName = (cat: any) => {
  if (!cat) return '';
  if (typeof cat.name === 'object' && cat.name !== null) {
    return cat.name[currentLang.value] || cat.name['ru'] || '';
  }
  return cat.name || '';
};

const loadData = () => {
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
};

const handleStorageEvent = (event: StorageEvent) => {
  if (event.key === 'preview_restaurantInfo' || event.key === 'preview_items' || event.key === 'preview_categories') {
    loadData();
  }
};

onMounted(() => {
  loadData();
  window.addEventListener('storage', handleStorageEvent);
  const interval = setInterval(loadData, 500);
  (window as any).__previewInterval = interval;
});

onUnmounted(() => {
  window.removeEventListener('storage', handleStorageEvent);
  if ((window as any).__previewInterval) {
    clearInterval((window as any).__previewInterval);
  }
});

// Логика фильтрации блюд (категории, поиск и активные диетические фильтры)
const filteredItems = computed(() => {
  let result = items.value;

  if (selectedCategory.value !== 'all') {
    result = result.filter((item: any) => (item.category === selectedCategory.value || item.categoryId === selectedCategory.value));
  }

  if (searchQuery.value.trim() !== '') {
    const q = searchQuery.value.toLowerCase();
    result = result.filter((item: any) => {
      const name = getItemName(item).toLowerCase();
      const desc = getItemDescription(item).toLowerCase();
      return name.includes(q) || desc.includes(q);
    });
  }

  // Фильтрация по питанию (если выбраны чекбоксы)
  if (selectedFilters.value.length > 0) {
    result = result.filter((item: any) => {
      return selectedFilters.value.every(f => {
        if (f === 'nutFree') return item.nutFree || item.isNutFree;
        if (f === 'lactoseFree') return item.lactoseFree || item.isLactoseFree;
        if (f === 'glutenFree') return item.glutenFree || item.isGlutenFree;
        return true;
      });
    });
  }

  return result;
});

const toggleFilter = (filterKey: string) => {
  const index = selectedFilters.value.indexOf(filterKey);
  if (index > -1) {
    selectedFilters.value.splice(index, 1);
  } else {
    selectedFilters.value.push(filterKey);
  }
};

const getItemQuantity = (id: string | number) => {
  const item = cartItems.value.find(i => i.id === id);
  return item ? item.quantity : 0;
};

const addToCart = (item: any) => {
  const existing = cartItems.value.find(i => i.id === item.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cartItems.value.push({ ...item, quantity: 1 });
  }
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
  alert('Заказ успешно оформлен и отправлен в дашборд!');
};

const selectLanguage = (lang: string) => {
  currentLang.value = lang;
  activeModal.value = 'none';
};

const toggleViewMode = () => {
  viewMode.value = viewMode.value === 'grid' ? 'list' : 'grid';
};

const goToConstructor = () => {
  window.location.href = 'http://192.168.31.240:5173/constructor';
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
  position: relative;
}

.close-preview-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.7);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  z-index: 1000;
  transition: background 0.2s ease, transform 0.1s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.close-preview-btn:hover {
  background: rgba(0, 0, 0, 0.9);
}

.close-preview-btn:active {
  transform: scale(0.95);
}

@media (max-width: 600px) {
  .close-preview-btn {
    display: none;
  }
}

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
  padding-bottom: 95px;
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
}

.menu-items-grid-phone {
  display: grid !important;
  grid-template-columns: repeat(2, 1fr) !important;
  gap: 8px !important;
}

.menu-card {
  background: #ffffff;
  color: #111111;
  border-radius: 14px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border: none;
  padding: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.menu-card img {
  width: 100%;
  height: 90px;
  object-fit: cover;
  border-radius: 10px;
}

.card-content {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex: 1;
  padding: 4px 2px;
}

.card-text-block h3 {
  margin: 4px 0 2px 0;
  font-size: 11px;
  font-weight: bold;
  color: #111111;
  line-height: 1.2;
}

.card-text-block p {
  font-size: 9px;
  color: #666;
  margin: 0 0 6px 0;
}

.card-bottom-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
  margin-top: auto;
}

.price {
  font-weight: bold;
  font-size: 11px;
}

.add-to-cart-btn {
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 0;
  font-size: 11px;
  font-weight: bold;
  cursor: pointer;
  width: 100%;
  text-align: center;
  transition: opacity 0.2s;
  box-shadow: 0 2px 6px rgba(0,0,0,0.15);
}

.add-to-cart-btn:active {
  opacity: 0.8;
}

.counter-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #ffffff;
  border: 1.5px solid;
  border-radius: 8px;
  padding: 6px 12px;
  width: 100%;
  box-sizing: border-box;
}

.counter-btn {
  background: transparent;
  border: none;
  font-size: 13px;
  font-weight: bold;
  cursor: pointer;
  color: #111;
  padding: 0 4px;
}

.counter-value {
  font-size: 12px;
  font-weight: bold;
  color: #111;
}

.menu-items-list-phone {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.menu-list-row {
  background: #ffffff;
  color: #111111;
  border: none;
  border-radius: 12px;
  padding: 10px 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.menu-list-row .card-content {
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 0;
}

.menu-list-row .card-text-block {
  flex: 1;
  padding-right: 12px;
}

.menu-list-row .card-bottom-row {
  flex-direction: column;
  align-items: flex-end;
  width: 115px;
  gap: 4px;
}

.menu-list-row .price {
  font-size: 12px;
  margin-bottom: 2px;
}

.menu-list-row .add-to-cart-btn {
  padding: 6px 0;
  font-size: 10px;
}

.menu-list-row .counter-controls {
  padding: 4px 8px;
}

.floating-cart-bar {
  position: absolute;
  bottom: calc(12px + 45px + 4px);
  left: 12px;
  right: 12px;
  color: white;
  border-radius: 24px;
  padding: 10px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11px;
  font-weight: bold;
  cursor: pointer;
  z-index: 20;
  box-shadow: 0 4px 15px rgba(0,0,0,0.4);
  box-sizing: border-box;
}

.empty-search-notice {
  text-align: center;
  font-size: 10px;
  margin-top: 25px;
  color: #888;
}
</style>