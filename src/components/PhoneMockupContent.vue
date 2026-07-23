<template>
  <div class="preview-container">
    <button class="preview-copy-btn" @click="openPreview">🔗 Предпросмотр</button>
    
    <div class="phone-mockup">
      <div class="phone-screen">
        
        <!-- ЭКРАН МЕНЮ -->
        <template v-if="currentScreen === 'menu'">
          <div class="phone-header" @click="triggerFileUpload('cover')" :style="{ 
            cursor: 'pointer', 
            backgroundColor: store.restaurantInfo.secondaryColor, 
            backgroundImage: store.restaurantInfo.coverImage 
              ? (store.restaurantInfo.showCoverGradient !== false 
                ? `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.6)), url(${store.restaurantInfo.coverImage})` 
                : `url(${store.restaurantInfo.coverImage})`) 
              : 'none', 
            backgroundSize: 'cover', 
            backgroundPosition: 'center' 
          }">
            <div class="phone-avatar-wrapper">
              <div class="phone-avatar-placeholder" @click.stop="triggerFileUpload('avatar')" style="cursor: pointer;">
                <span v-if="!store.restaurantInfo.avatarImage">🍽️</span>
                <img v-else :src="store.restaurantInfo.avatarImage" alt="Аватар" style="width: 100%; height: 100%; object-fit: cover;" />
              </div>
            </div>
            <div class="phone-logo">{{ currentRestaurantName }}</div>
          </div>
          
          <div class="phone-body" @scroll="handlePhoneScroll" :style="{ backgroundColor: store.restaurantInfo.backgroundColor, color: store.restaurantInfo.textColor }">
            <div v-if="activeTab === 'qrcode'" class="phone-qr-preview">
              <div 
                class="qr-card-preview" 
                :style="{ background: store.restaurantInfo.qrSettings?.textBgColor || '#000000' }"
              >
                <div class="qr-box-preview" :style="{ background: store.restaurantInfo.qrSettings?.bgColor || '#ffffff' }">
                  <QrcodeVue 
                    :value="'https://great-birds-rest.loca.lt'" 
                    :size="150" 
                    :background="store.restaurantInfo.qrSettings?.bgColor || '#ffffff'" 
                    :foreground="store.restaurantInfo.qrSettings?.squareColor || '#000000'" 
                    level="H" 
                  />
                </div>
                <div 
                  class="qr-label-preview" 
                  :style="{ 
                    color: store.restaurantInfo.qrSettings?.textColor || '#ffffff',
                    fontFamily: store.restaurantInfo.qrSettings?.fontFamily || 'Comfortaa'
                  }"
                >
                  {{ store.restaurantInfo.qrSettings?.text }}
                </div>
              </div>
            </div>
            
            <div v-else>
              <div v-if="store.restaurantInfo.isWifiEnabled" class="phone-wifi-btn" @click="isWifiExpanded = !isWifiExpanded">
                <div class="wifi-icon-box">ℹ️</div>
                <div class="wifi-label" :style="{ color: store.restaurantInfo.textColor }">
                  <div class="title">{{ t.wifiTitle }}</div>
                  <div v-if="isWifiExpanded" class="subtitle" style="margin-top: 5px;">
                    <div>{{ t.wifiNetwork }}: {{ store.restaurantInfo.wifiName || t.wifiNotSet }}</div>
                    <div style="font-weight: bold; margin-top: 2px;">{{ t.wifiPassword }}: {{ store.restaurantInfo.wifiPassword }}</div>
                  </div>
                </div>
                <div class="chevron" :style="{ transform: isWifiExpanded ? 'rotate(90deg)' : 'rotate(0deg)', color: store.restaurantInfo.textColor }">›</div>
              </div>

              <!-- Категории меню -->
              <div class="phone-categories">
                <button 
                  class="phone-cat-badge" 
                  :class="{ active: selectedCategory === null }"
                  @click="selectedCategory = null"
                  :style="{ backgroundColor: selectedCategory === null ? store.restaurantInfo.primaryColor : 'rgba(255,255,255,0.1)' }"
                >
                  {{ t.allCategories }}
                </button>
                <button 
                  v-for="cat in store.categories" 
                  :key="cat.id" 
                  class="phone-cat-badge" 
                  :class="{ active: selectedCategory === cat.name }"
                  @click="selectedCategory = selectedCategory === cat.name ? null : cat.name"
                  :style="{ backgroundColor: selectedCategory === cat.name ? store.restaurantInfo.primaryColor : 'rgba(255,255,255,0.1)' }"
                >
                  {{ getLocalizedCategoryName(cat.name) }}
                </button>
              </div>

              <div v-if="filteredItems.length === 0" class="empty-search-notice">
                {{ t.emptySearch }}
              </div>

              <div v-else :class="viewMode === 'grid' ? 'menu-items-grid-phone' : 'menu-items-list-phone'">
                <div v-for="item in filteredItems" :key="item.id" :class="viewMode === 'grid' ? 'menu-card' : 'menu-list-row'">
                  <img v-if="viewMode === 'grid'" :src="item.image || 'placeholder.jpg'" alt="Блюдо" />
                  <div class="card-content">
                    <div>
                      <h3>{{ getLocalizedItemName(item.name) }}</h3>
                      <div class="price">RUB {{ Number(item.price).toFixed(2) }}</div>
                    </div>

                    <button 
                      v-if="getItemQuantity(item.id) === 0" 
                      class="add-to-cart-btn" 
                      @click="addToCart(item)"
                      :style="{ backgroundColor: store.restaurantInfo.primaryColor }"
                    >
                      {{ t.addBtn }}
                    </button>

                    <div v-else class="counter-controls">
                      <button @click="decreaseQuantity(item.id)">-</button>
                      <span>{{ getItemQuantity(item.id) }}</span>
                      <button @click="increaseQuantity(item.id)">+</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Нижняя панель управления -->
          <div class="floating-settings-bar" :class="{ 'bar-hidden': !isBottomBarVisible }" :style="{ backgroundColor: store.restaurantInfo.primaryColor }">
            <button class="bar-btn" @click="activeModal = 'language'"><span>🌐</span> {{ selectedLanguage }}</button>
            <div class="bar-divider"></div>
            <button class="bar-btn" @click="activeModal = 'filters'"><span>🎛️</span> {{ t.filtersTitle }}</button>
            <div class="bar-divider"></div>
            <button class="bar-btn" @click="handleShare"><span>📤</span></button>
            <div class="bar-divider"></div>
            <button class="bar-btn" @click="viewMode = viewMode === 'grid' ? 'list' : 'grid'">
              <span>{{ viewMode === 'grid' ? '🗂️' : '📋' }}</span>
            </button>
            <div class="bar-divider"></div>
            <button class="bar-btn" @click="activeModal = 'search'"><span>🔍</span></button>
          </div>

          <!-- Тоаст -->
          <div v-if="showToast" class="toast-notification">
            {{ toastMessage }}
          </div>

          <!-- Модальное окно: Язык -->
          <div v-if="activeModal === 'language'" class="bottom-sheet-overlay" @click.self="activeModal = 'none'">
            <div class="bottom-sheet">
              <div class="sheet-indicator"></div>
              <div class="sheet-header"><h3>{{ t.langTitle }}</h3></div>
              <div class="languages-grid">
                <button class="lang-option" :class="{ active: selectedLanguage === 'Deutsch' }" @click="selectedLanguage = 'Deutsch'"><span class="flag-icon">🇩🇪</span> Deutsch</button>
                <button class="lang-option" :class="{ active: selectedLanguage === 'English' }" @click="selectedLanguage = 'English'"><span class="flag-icon">🇬🇧</span> English</button>
                <button class="lang-option" :class="{ active: selectedLanguage === 'Русский' }" @click="selectedLanguage = 'Русский'"><span class="flag-icon">🇷🇺</span> Русский</button>
                <button class="lang-option" :class="{ active: selectedLanguage === 'Аҧсшәа' }" @click="selectedLanguage = 'Аҧсшәа'"><span class="flag-icon">🟢</span> Аҧсшәа</button>
              </div>
              <div class="sheet-footer-brand">{{ t.poweredBy }}</div>
            </div>
          </div>

          <!-- Модальное окно: Поиск -->
          <div v-if="activeModal === 'search'" class="bottom-sheet-overlay" @click.self="activeModal = 'none'">
            <div class="bottom-sheet">
              <div class="sheet-indicator"></div>
              <div class="sheet-header-flex">
                <h3>{{ t.searchTitle }}</h3>
                <button class="clear-filters-text-btn" @click="searchQuery = ''">очистить</button>
              </div>
              <div class="search-input-wrapper">
                <span class="search-icon-prefix">🔍</span>
                <input v-model="searchQuery" type="text" class="search-modal-input" :placeholder="t.searchPlaceholder" autofocus />
                <button v-if="searchQuery" class="clear-input-btn" @click="searchQuery = ''">✕</button>
              </div>
              <button class="show-results-btn" @click="activeModal = 'none'">{{ t.showResults }} ({{ filteredItems.length }})</button>
              <div class="sheet-footer-brand">{{ t.poweredBy }}</div>
            </div>
          </div>

          <!-- Модальное окно: Фильтры -->
          <div v-if="activeModal === 'filters'" class="bottom-sheet-overlay" @click.self="activeModal = 'none'">
            <div class="bottom-sheet">
              <div class="sheet-indicator"></div>
              <div class="sheet-header-flex">
                <h3>{{ t.filtersTitle }}</h3>
                <button class="clear-filters-text-btn" @click="clearAllFilters">{{ t.clearFilters }}</button>
              </div>
              <div class="filters-section-content">
                <div class="filters-category-title">{{ t.nutritionTitle }}</div>
                <div class="languages-grid">
                  <button class="lang-option" :class="{ active: selectedFilters.includes('nuts') }" @click="toggleFilter('nuts')"><span class="flag-icon">🌰</span> Без орехов</button>
                  <button class="lang-option" :class="{ active: selectedFilters.includes('lactose') }" @click="toggleFilter('lactose')"><span class="flag-icon">🥛</span> Без лактозы</button>
                  <button class="lang-option" :class="{ active: selectedFilters.includes('gluten') }" @click="toggleFilter('gluten')"><span class="flag-icon">🌾</span> Без глютена</button>
                </div>
              </div>
              <button class="show-results-btn" @click="activeModal = 'none'">{{ t.showResults }}</button>
              <div class="sheet-footer-brand">{{ t.poweredBy }}</div>
            </div>
          </div>

          <!-- Модальное окно: Шеринг -->
          <div v-if="activeModal === 'share'" class="share-modal-overlay" @click.self="activeModal = 'none'">
            <div class="windows-share-dialog">
              <div class="win-share-header">
                <div class="win-share-title-row">
                  <span class="win-share-icon">📤</span>
                  <span class="win-share-heading">Поделиться ссылкой</span>
                </div>
                <button class="win-share-close" @click="activeModal = 'none'">✕</button>
              </div>
              <div class="win-link-card">
                <div class="win-link-preview-left">
                  <div class="win-link-thumb">
                    <img v-if="store.restaurantInfo.avatarImage" :src="store.restaurantInfo.avatarImage" alt="Аватар" style="width: 100%; height: 100%; object-fit: cover;" />
                    <span v-else>🍽️</span>
                  </div>
                  <div class="win-link-text">
                    <div class="win-link-url">{{ shareUrl }}</div>
                    <div class="win-link-sub">Меню ресторана · {{ currentRestaurantName }}</div>
                  </div>
                </div>
                <div class="win-link-actions">
                  <button class="win-action-icon-btn" title="QR-код" @click="activeTab = 'qrcode'; activeModal = 'none';">🔲</button>
                  <button class="win-action-icon-btn" title="Копировать ссылку" @click="copyShareLink">🔗</button>
                </div>
              </div>
              <div class="win-share-section-title">Поделиться с помощью</div>
              <div class="win-apps-grid">
                <button class="win-app-item" @click="shareViaSocial('telegram')"><div class="win-app-icon" style="background: #229ED9;">✈️</div><span>Telegram</span></button>
                <button class="win-app-item" @click="shareViaSocial('whatsapp')"><div class="win-app-icon" style="background: #25D366;">💬</div><span>WhatsApp</span></button>
                <button class="win-app-item" @click="shareViaSocial('twitter')"><div class="win-app-icon" style="background: #000000;">𝕏</div><span>Twitter</span></button>
                <button class="win-app-item" @click="shareViaSocial('facebook')"><div class="win-app-icon" style="background: #1877F2;">📘</div><span>Facebook</span></button>
                <button class="win-app-item" @click="shareViaSocial('linkedin')"><div class="win-app-icon" style="background: #0A66C2;">💼</div><span>LinkedIn</span></button>
                <button class="win-app-item" @click="shareViaSocial('gmail')"><div class="win-app-icon" style="background: #EA4335;">✉️</div><span>Gmail</span></button>
                <button class="win-app-item" @click="shareViaSocial('outlook')"><div class="win-app-icon" style="background: #0078D4;">📧</div><span>Outlook</span></button>
                <button class="win-app-item" @click="copyShareLink"><div class="win-app-icon" style="background: #646cff;">📋</div><span>Копировать</span></button>
              </div>
            </div>
          </div>

          <!-- Плавающая плашка корзины -->
          <div v-if="cartItems.length > 0" class="floating-cart-bar" @click="currentScreen = 'cart'" :style="{ backgroundColor: store.restaurantInfo.primaryColor, zIndex: 20 }">
            <span class="cart-title">{{ t.cartTitle }}</span>
            <span class="cart-total">RUB {{ totalPrice.toFixed(2) }}</span>
          </div>
        </template>

        <!-- ЭКРАН КОРЗИНЫ -->
        <template v-else-if="currentScreen === 'cart'">
          <div class="cart-screen-header">
            <button class="cart-close-btn" @click="currentScreen = 'menu'">✕</button>
            <h2>{{ t.cartHeader }}</h2>
            <button class="cart-clear-all-btn" @click="cartItems = []">🗑️</button>
          </div>

          <div class="cart-screen-body">
            <div class="closed-notice" v-html="t.closedNotice"></div>

            <div class="cart-items-list">
              <div v-for="item in cartItems" :key="item.id" class="cart-item-row">
                <div class="cart-item-info">
                  <div class="cart-item-name">{{ getLocalizedItemName(item.name) }}</div>
                  <div class="cart-item-price">RUB {{ (item.price * item.quantity).toFixed(2) }}</div>
                </div>
                <div class="cart-item-actions" :style="{ backgroundColor: store.restaurantInfo.primaryColor }">
                  <button @click="handleTrashClick(item.id)">🗑️</button>
                  <span class="cart-item-qty">{{ item.quantity }}</span>
                  <button @click="increaseQuantity(item.id)">+</button>
                </div>
              </div>
            </div>

            <!-- Кнопка оформления заказа в дашборд -->
            <button @click="handleCheckout" class="checkout-btn" :style="{ backgroundColor: store.restaurantInfo.primaryColor }" style="width: 100%; margin-top: 16px; padding: 12px; color: white; border: none; border-radius: 8px; font-weight: bold; cursor: pointer;">
              Оформить заказ
            </button>

            <div class="add-more-link" @click="currentScreen = 'menu'" style="margin-top: 12px; text-align: center; cursor: pointer;">
              {{ t.addMore }}
            </div>
          </div>

          <div class="cart-screen-footer">
            <div class="subtotal-row">
              <span>{{ t.subtotal }}</span>
              <span class="subtotal-sum">RUB {{ totalPrice.toFixed(2) }}</span>
            </div>
            <div class="powered-by">© Проект от Web-Visual-World | 2024</div>
          </div>
        </template>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import QrcodeVue from 'qrcode.vue';
import { useOrders } from '../composables/useOrders';
import { useMenuStore } from '../store/menuStore';

const store = useMenuStore();

const { addOrder } = useOrders();

// Состояния интерфейса превью
const currentScreen = ref<'menu' | 'cart'>('menu');
const activeTab = ref<'menu' | 'qrcode'>('menu');
const activeModal = ref<'none' | 'language' | 'search' | 'filters' | 'share'>('none');
const viewMode = ref<'grid' | 'list'>('grid');
const selectedCategory = ref<string | null>(null);
const searchQuery = ref('');
const selectedLanguage = ref('Русский');
const selectedFilters = ref<string[]>([]);
const isWifiExpanded = ref(false);
const isBottomBarVisible = ref(true);
const showToast = ref(false);
const toastMessage = ref('');
const shareUrl = ref('https://great-birds-rest.loca.lt');

// Корзина
const cartItems = ref<any[]>([]);

const currentRestaurantName = computed(() => store.restaurantInfo.name || 'Ресторан');

const getItemQuantity = (itemId: number | string) => {
  const found = cartItems.value.find(i => i.id === itemId);
  return found ? found.quantity : 0;
};

const addToCart = (item: any) => {
  const existing = cartItems.value.find(i => i.id === item.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cartItems.value.push({ ...item, quantity: 1 });
  }
};

const increaseQuantity = (itemId: number | string) => {
  const existing = cartItems.value.find(i => i.id === itemId);
  if (existing) existing.quantity += 1;
};

const decreaseQuantity = (itemId: number | string) => {
  const existing = cartItems.value.find(i => i.id === itemId);
  if (existing) {
    if (existing.quantity > 1) {
      existing.quantity -= 1;
    } else {
      cartItems.value = cartItems.value.filter(i => i.id !== itemId);
    }
  }
};

const handleTrashClick = (itemId: number | string) => {
  cartItems.value = cartItems.value.filter(i => i.id !== itemId);
};

const totalPrice = computed(() => {
  return cartItems.value.reduce((sum, item) => sum + (item.price * item.quantity), 0);
});

// Отправка заказа в дашборд
const handleCheckout = () => {
  if (cartItems.value.length === 0) return;
  
  addOrder(cartItems.value, totalPrice.value, 'delivery');
  
  cartItems.value = [];
  currentScreen.value = 'menu';
  
  alert('Заказ успешно оформлен и отправлен в дашборд администратора!');
};

// Фильтрация товаров из стора
const filteredItems = computed(() => {
  return store.items.filter(item => {
    const matchesCategory = selectedCategory.value === null || item.categoryId === selectedCategory.value || item.category === selectedCategory.value;
    const matchesSearch = searchQuery.value === '' || item.name.toLowerCase().includes(searchQuery.value.toLowerCase());
    return matchesCategory && matchesSearch;
  });
});

// Локализация текстов
const t = computed(() => {
  return {
    wifiTitle: 'Wi-Fi сеть',
    wifiNetwork: 'Сеть',
    wifiPassword: 'Пароль',
    wifiNotSet: 'Не задано',
    allCategories: 'Все',
    emptySearch: 'Ничего не найдено',
    addBtn: '+ Добавить',
    filtersTitle: 'Фильтры',
    langTitle: 'Выберите язык',
    searchTitle: 'Поиск блюд',
    searchPlaceholder: 'Введите название...',
    showResults: 'Показать результаты',
    clearFilters: 'Сбросить',
    nutritionTitle: 'Состав / Аллергены',
    cartTitle: 'Корзина',
    cartHeader: 'Ваш заказ',
    closedNotice: 'Заведение работает в режиме предпросмотра',
    addMore: '+ Добавить еще блюда',
    subtotal: 'Итого:',
    poweredBy: 'Работает на Daur Menu'
  };
});

const getLocalizedCategoryName = (name: string) => name;
const getLocalizedItemName = (name: string) => name;

const triggerFileUpload = (type: string) => {};

const handlePhoneScroll = () => {};
const clearAllFilters = () => { selectedFilters.value = []; };
const toggleFilter = (filter: string) => {
  const idx = selectedFilters.value.indexOf(filter);
  if (idx > -1) selectedFilters.value.splice(idx, 1);
  else selectedFilters.value.push(filter);
};

const handleShare = () => { activeModal.value = 'share'; };
const copyShareLink = () => {
  navigator.clipboard.writeText(shareUrl.value);
  triggerToast('Ссылка скопирована!');
  activeModal.value = 'none';
};
const shareViaSocial = (network: string) => {
  triggerToast(`Поделиться в ${network}`);
  activeModal.value = 'none';
};
const triggerToast = (msg: string) => {
  toastMessage.value = msg;
  showToast.value = true;
  setTimeout(() => { showToast.value = false; }, 2000);
};
const openPreview = () => {
  window.open(shareUrl.value, '_blank');
};
</script>