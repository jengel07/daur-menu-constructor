<template>
  <div class="client-wrapper" :style="{ backgroundColor: restaurantInfo.backgroundColor || '#f4f6f3' }">
    <button class="close-preview-btn" @click="goToConstructor">
      ✕ {{ t('closePreview') || 'Закрыть предпросмотр' }}
    </button>

    <div class="phone-mockup">
      <div class="phone-screen" :style="{  
        backgroundColor: restaurantInfo.backgroundColor || '#121212',  
        color: restaurantInfo.textColor || '#fff'  
      }">
        
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

        <div class="phone-body">
          
          <div  
            v-if="Boolean(store.generalSettings?.wifiEnabled)"  
            class="wifi-card-widget"  
            @click="isWifiExpanded = !isWifiExpanded"
            :style="{  
              backgroundColor: restaurantInfo.secondaryColor ? restaurantInfo.secondaryColor + '22' : 'rgba(255, 255, 255, 0.08)',  
              color: restaurantInfo.textColor || '#fff',
              border: '1px solid ' + (restaurantInfo.secondaryColor ? restaurantInfo.secondaryColor + '44' : 'rgba(255, 255, 255, 0.15)')
            }"
          >
            <div class="wifi-card-main-row">
              <div class="wifi-card-left">
                <div class="wifi-card-icon-box">ℹ️</div>
                <div class="wifi-card-texts">
                  <div class="wifi-card-title">{{ t('info') || 'Информация' }}</div>
                  <div class="wifi-card-subtitle">Wi-Fi</div>
                </div>
              </div>
              <div class="wifi-card-chevron" :style="{ transform: isWifiExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }">›</div>
            </div>

            <div v-if="isWifiExpanded" class="wifi-expanded-content" @click.stop>
              <div class="wifi-info-row">
                <span>{{ t('network') || 'Сеть' }}:</span> <b>{{ store.generalSettings?.wifiSsid || 'Не указана' }}</b>
              </div>
              <div class="wifi-info-row" style="margin-top: 4px;">
                <span>{{ t('password') || 'Пароль' }}:</span> <b style="user-select: all;">{{ store.generalSettings?.wifiPassword || 'Не указан' }}</b>
              </div>
            </div>
          </div>

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
                  <span v-if="viewMode === 'list'" class="price" :style="{ color: restaurantInfo.primaryColor || '#646cff' }">{{ Number(item.price || 0).toFixed(2) }} ₽</span>
                  <p v-if="viewMode === 'grid' && getItemDescription(item)">{{ getItemDescription(item) }}</p>
                </div>
                <div class="card-bottom-row">
                  <span v-if="viewMode === 'grid'" class="price" :style="{ color: restaurantInfo.primaryColor || '#646cff' }">{{ Number(item.price || 0).toFixed(2) }} ₽</span>
                  
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
          @checkout="startCheckout"
          @toggle-filter="toggleFilter"
          @clear-filters="selectedFilters = []"
        />

        <div v-if="showCheckoutModal" class="checkout-modal-overlay" @click.self="closeModal">
          <div class="checkout-modal">
            
            <template v-if="checkoutStep === 1">
              <div class="checkout-header">
                <h3>Оформление заказа</h3>
                <button class="close-modal-btn" @click="closeModal">✕</button>
              </div>
              
              <form @submit.prevent="goToReviewStep" class="checkout-form">
                <div class="form-group">
                  <label>Тип заказа</label>
                  <select v-model="customerForm.orderType">
                    <option value="dine_in">🍽️ В заведении (Столик)</option>
                    <option value="takeaway">🏃 С собой (Самовывоз)</option>
                    <option value="delivery">🚗 Доставка</option>
                  </select>
                </div>

                <div class="form-group">
                  <label>Имя {{ customerForm.orderType === 'dine_in' ? '(необязательно)' : '' }}</label>
                  <input 
                    v-model="customerForm.name" 
                    type="text" 
                    placeholder="Введите ваше имя" 
                    :required="customerForm.orderType !== 'dine_in'" 
                  />
                </div>

                <div class="form-group">
                  <label>Телефон {{ customerForm.orderType === 'dine_in' ? '(необязательно)' : '' }}</label>
                  <input 
                    v-model="customerForm.phone" 
                    type="tel" 
                    placeholder="+7 (999) 000-00-00" 
                    :required="customerForm.orderType !== 'dine_in'" 
                  />
                </div>

                <div v-if="customerForm.orderType === 'dine_in'" class="form-group">
                  <label>Номер столика</label>
                  <input v-model="customerForm.tableNumber" type="text" placeholder="Например: 5" required />
                </div>

                <div v-if="customerForm.orderType === 'delivery'" class="form-group">
                  <label>Адрес доставки</label>
                  <input v-model="customerForm.address" type="text" placeholder="Улица, дом, квартира" required />
                </div>

                <div v-if="customerForm.orderType === 'takeaway'" class="time-picker-block">
                  <label class="block-title">Когда приготовить?</label>
                  <div class="time-inputs-row">
                    <input v-model="customerForm.scheduledTime" type="time" class="time-input" />
                    <input v-model="customerForm.scheduledDate" type="date" class="date-input" />
                  </div>
                  <span class="hint-text">Нам нужно около 15–20 минут на приготовление</span>
                </div>

                <div v-if="customerForm.orderType === 'delivery'" class="time-picker-block">
                  <label class="block-title">Когда доставить?</label>
                  <div class="time-inputs-row">
                    <input v-model="customerForm.scheduledTime" type="time" class="time-input" />
                    <input v-model="customerForm.scheduledDate" type="date" class="date-input" />
                  </div>
                </div>

                <div class="form-group">
                  <label>Примечание (необязательно)</label>
                  <textarea v-model="customerForm.comment" placeholder="Напр., соусы отдельно? всё в один пакет?"></textarea>
                </div>

                <div class="checkout-summary">
                  <span>Итого к оплате:</span>
                  <strong>{{ totalPrice.toFixed(2) }} ₽</strong>
                </div>

                <button 
                  type="submit" 
                  class="submit-order-btn"
                  :style="{ backgroundColor: restaurantInfo.primaryColor || '#646cff' }"
                >
                  Далее: Проверить заказ
                </button>
              </form>
            </template>

            <template v-else-if="checkoutStep === 2">
              <div class="checkout-header">
                <button class="back-btn" @click="checkoutStep = 1">〈</button>
                <h3>Проверка заказа</h3>
                <button class="close-modal-btn" @click="closeModal">✕</button>
              </div>

              <div class="review-screen-content">
                <div class="review-card-block">
                  <div class="review-card-title">Итого заказа</div>
                  <div class="review-items-list">
                    <div v-for="item in cartItems" :key="item.id" class="review-item-row">
                      <span class="r-name"><b>{{ item.quantity }}x</b> {{ getItemName(item) }}</span>
                      <span class="r-price">RUB {{ (Number(item.price || 0) * item.quantity).toFixed(2) }}</span>
                    </div>
                  </div>
                  <div class="review-totals-divider"></div>
                  <div class="review-total-line">
                    <span>Подытог</span>
                    <span>RUB {{ totalPrice.toFixed(2) }}</span>
                  </div>
                  <div class="review-total-line">
                    <span>Доставка / Сбор</span>
                    <span>RUB 0.00</span>
                  </div>
                  <div class="review-total-line main-total">
                    <span>Итого</span>
                    <span>RUB {{ totalPrice.toFixed(2) }}</span>
                  </div>
                </div>

                <div class="review-card-block">
                  <div class="review-card-title">Ваши данные</div>
                  <div class="data-row" v-if="customerForm.name">
                    <span class="icon">👤</span>
                    <div>
                      <div class="label-muted">Имя</div>
                      <div class="val">{{ customerForm.name }}</div>
                    </div>
                  </div>
                  <div class="data-row" v-if="customerForm.phone">
                    <span class="icon">📞</span>
                    <div>
                      <div class="label-muted">Телефон</div>
                      <div class="val">{{ customerForm.phone }}</div>
                    </div>
                  </div>
                  <div class="data-row" v-if="customerForm.comment">
                    <span class="icon">📝</span>
                    <div>
                      <div class="label-muted">Примечание</div>
                      <div class="val">{{ customerForm.comment }}</div>
                    </div>
                  </div>
                  <div class="data-row" v-if="customerForm.orderType === 'dine_in'">
                    <span class="icon">🪑</span>
                    <div>
                      <div class="label-muted">Столик</div>
                      <div class="val">№ {{ customerForm.tableNumber }}</div>
                    </div>
                  </div>
                  <div class="data-row" v-if="customerForm.orderType === 'delivery'">
                    <span class="icon">📍</span>
                    <div>
                      <div class="label-muted">Адрес доставки</div>
                      <div class="val">{{ customerForm.address }}</div>
                    </div>
                  </div>
                </div>

                <div class="review-card-block">
                  <div class="review-card-title">
                    {{ customerForm.orderType === 'takeaway' ? 'Время самовывоза' : (customerForm.orderType === 'delivery' ? 'Время доставки' : 'Время визита') }}
                  </div>
                  <div class="time-badge-box">
                    📅 {{ customerForm.scheduledDate }} в {{ customerForm.scheduledTime }}
                  </div>
                  <div class="hint-text" style="margin-top: 4px;">Пожалуйста, приходите вовремя</div>
                </div>

                <div v-if="customerForm.orderType === 'takeaway'" class="review-card-block map-block-wrapper">
                  <div class="review-card-title">Как добраться (Самовывоз)</div>
                  <div class="map-container">
                    <div style="position:relative;overflow:hidden;border-radius:8px;">
                      <iframe src="https://yandex.ru/map-widget/v1/?ll=41.024008%2C43.001192&mode=poi&poi%5Bpoint%5D=41.023803%2C43.001167&poi%5Buri%5D=ymapsbm1%3A%2F%2Forg%3Foid%3D43328610653&z=19.47" width="100%" height="140" frameborder="0" allowfullscreen="true" style="position:relative;"></iframe>
                    </div>
                  </div>
                  <a href="https://yandex.com/maps/-/CTrKi8~b" target="_blank" rel="noopener noreferrer" class="yandex-map-btn">
                    Открыть в Яндекс Картах
                  </a>
                </div>

                <div class="legal-notice">
                  Размещая заказ, вы соглашаетесь на обработку ваших данных для его выполнения.
                </div>

                <div class="review-actions-row">
                  <button class="btn-secondary-action" @click="checkoutStep = 1">Назад</button>
                  <button class="btn-primary-action" @click="confirmOrder" :style="{ backgroundColor: restaurantInfo.primaryColor || '#646cff' }">
                    Разместить заказ
                  </button>
                </div>
              </div>
            </template>

          </div>
        </div>

        <div v-if="cartItems.length > 0 && !showCheckoutModal" class="floating-cart-bar" @click="activeModal = 'cart'" :style="{ backgroundColor: restaurantInfo.primaryColor || '#10b981' }">
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
import axios from 'axios';
import { useMenuStore } from '../store/menuStore';
import { useOrders } from '../composables/useOrders';
import SettingsbarForClient from '../components/SettingsbarForClient.vue';
import { ShoppingCart } from 'lucide-vue-next';

const translations: Record<string, Record<string, string>> = {
  ru: {
    closePreview: 'Закрыть предпросмотр',
    allCategories: 'Все категории',
    noDishes: 'В данной категории пока нет блюд',
    add: 'добавить',
    cart: 'Корзина',
    nutrition: 'Пищевая ценность',
    nutFree: 'Без орехов',
    lactoseFree: 'Без лактозы',
    glutenFree: 'Без глютена',
    info: 'Информация',
    network: 'Сеть',
    password: 'Пароль'
  },
  en: {
    closePreview: 'Close Preview',
    allCategories: 'All categories',
    noDishes: 'No dishes found',
    add: 'add',
    cart: 'Cart',
    nutrition: 'Nutrition',
    nutFree: 'Nut-free',
    lactoseFree: 'Lactose-free',
    glutenFree: 'Gluten-free',
    info: 'Information',
    network: 'Network',
    password: 'Password'
  }
};

const store = useMenuStore();
const isWifiExpanded = ref(false);
const { addOrder } = useOrders();

const restaurantInfo = computed(() => store.restaurantInfo);
const items = computed(() => store.items);
const categories = computed(() => store.categories);

const selectedCategory = ref<string>('all');
const currentLang = ref<string>('ru'); 
const viewMode = ref<'grid' | 'list'>('list');
const activeModal = ref<'none' | 'cart' | 'filters' | 'search' | 'share' | 'language'>('none');
const searchQuery = ref<string>('');
const selectedFilters = ref<string[]>([]);
const cartItems = ref<any[]>([]);

const getTodayDateStr = () => {
  const d = new Date();
  return d.toISOString().split('T')[0];
};

const getCurrentTimeStr = () => {
  const d = new Date();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

const showCheckoutModal = ref(false);
const checkoutStep = ref<1 | 2>(1);

const customerForm = ref({
  name: '',
  phone: '',
  orderType: 'dine_in',
  tableNumber: '',
  address: '',
  comment: '',
  scheduledTime: getCurrentTimeStr(),
  scheduledDate: getTodayDateStr()
});

const t = (key: string) => {
  return translations[currentLang.value]?.[key] || translations['ru'][key] || key;
};

const getLocalizedValue = (field: any) => {
  if (!field) return '';
  if (typeof field === 'object' && field !== null) {
    return field[currentLang.value] || field['ru'] || Object.values(field)[0] || '';
  }
  return field;
};

const getItemName = (item: any) => getLocalizedValue(item?.name);
const getItemDescription = (item: any) => getLocalizedValue(item?.description);
const getLocalizedCategoryName = (cat: any) => getLocalizedValue(cat?.name);

const loadData = async () => {
  try {
    const response = await axios.get('http://192.168.31.240:3000/api/menu');
    if (response.data) {
      if (response.data.restaurantInfo) {
        store.restaurantInfo = { ...store.restaurantInfo, ...response.data.restaurantInfo };
      }
      if (response.data.items && response.data.items.length > 0) {
        store.items = response.data.items;
      }
      if (response.data.categories && response.data.categories.length > 0) {
        store.categories = response.data.categories;
      }
      if (response.data.generalSettings) {
        store.generalSettings = { ...store.generalSettings, ...response.data.generalSettings };
      }
    }
  } catch (e) {
    console.error('❌ Ошибка загрузки данных:', e);
  }
};

const handleStorageEvent = (event: StorageEvent) => {
  if (
    event.key === 'preview_restaurantInfo' || 
    event.key === 'preview_items' || 
    event.key === 'preview_categories' || 
    event.key === 'preview_generalSettings' ||
    event.key === 'generalSettings'
  ) {
    loadData();
  }
};

onMounted(() => {
  loadData();
  window.addEventListener('storage', handleStorageEvent);
  const interval = setInterval(loadData, 2000);
  (window as any).__previewInterval = interval;
});

onUnmounted(() => {
  window.removeEventListener('storage', handleStorageEvent);
  if ((window as any).__previewInterval) {
    clearInterval((window as any).__previewInterval);
  }
});

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

  if (selectedFilters.value.length > 0) {
    result = result.filter((item: any) => {
      return selectedFilters.value.some(f => {
        if (f === 'nutFree') return item.noNuts || item.nutFree || item.isNutFree || item.nut_free || (Array.isArray(item.tags) && item.tags.includes('nutFree'));
        if (f === 'lactoseFree') return item.noLactose || item.lactoseFree || item.isLactoseFree || item.lactose_free || (Array.isArray(item.tags) && item.tags.includes('lactoseFree'));
        if (f === 'glutenFree') return item.noGluten || item.glutenFree || item.isGlutenFree || item.gluten_free || (Array.isArray(item.tags) && item.tags.includes('glutenFree'));
        return false;
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

const startCheckout = () => {
  if (cartItems.value.length === 0) return;
  activeModal.value = 'none';
  checkoutStep.value = 1;
  showCheckoutModal.value = true;
};

const goToReviewStep = () => {
  checkoutStep.value = 2;
};

const closeModal = () => {
  showCheckoutModal.value = false;
  checkoutStep.value = 1;
};

const confirmOrder = () => {
  const preparedItems = cartItems.value.map(item => ({
    id: item.id,
    name: getItemName(item),
    price: Number(item.price || 0),
    quantity: item.quantity
  }));

  addOrder({
    items: preparedItems,
    total: totalPrice.value,
    type: customerForm.value.orderType === 'dine_in' 
      ? 'onsite' 
      : (customerForm.value.orderType === 'takeaway' ? 'pickup' : 'delivery'),
    customerName: customerForm.value.name,
    customerPhone: customerForm.value.phone,
    tableNumber: customerForm.value.tableNumber,
    address: customerForm.value.address,
    comment: customerForm.value.comment,
    scheduledTime: customerForm.value.scheduledTime
  });

  cartItems.value = [];
  closeModal();
  customerForm.value = { 
    name: '', 
    phone: '', 
    orderType: 'dine_in', 
    tableNumber: '', 
    address: '', 
    comment: '',
    scheduledTime: getCurrentTimeStr(),
    scheduledDate: getTodayDateStr()
  };

  alert('Заказ успешно отправлен на кухню/дашборд!');
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
.wifi-card-widget { margin: 12px 16px 16px 16px; padding: 12px 14px; border-radius: 12px; cursor: pointer; transition: all 0.2s ease; box-shadow: 0 2px 6px rgba(0,0,0,0.04); }
.wifi-card-widget:hover { opacity: 0.95; }
.wifi-card-main-row { display: flex; align-items: center; justify-content: space-between; }
.wifi-card-left { display: flex; align-items: center; gap: 10px; }
.wifi-card-icon-box { font-size: 18px; display: flex; align-items: center; justify-content: center; }
.wifi-card-title { font-size: 12px; opacity: 0.7; line-height: 1.1; }
.wifi-card-subtitle { font-size: 15px; font-weight: 600; line-height: 1.2; }
.wifi-card-chevron { font-size: 20px; transition: transform 0.2s ease; opacity: 0.6; }
.wifi-expanded-content { margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(255, 255, 255, 0.1); font-size: 13px; }
.wifi-info-row { display: flex; justify-content: space-between; }
.client-wrapper { width: 100vw; height: 100vh; height: 100dvh; display: flex; justify-content: center; align-items: center; overflow: hidden; box-sizing: border-box; position: relative; }
.close-preview-btn { position: absolute; top: 20px; right: 20px; background: rgba(0, 0, 0, 0.7); color: #ffffff; border: 1px solid rgba(255, 255, 255, 0.2); padding: 8px 16px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; z-index: 1000; transition: background 0.2s ease, transform 0.1s ease; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3); }
.close-preview-btn:hover { background: rgba(0, 0, 0, 0.9); }
.close-preview-btn:active { transform: scale(0.95); }
@media (max-width: 600px) { .close-preview-btn { display: none; } }
.phone-mockup { width: 330px; max-width: 100vw; height: 90vh; max-height: 750px; background: #000; border: 10px solid #2a2a2a; border-radius: 36px; overflow: hidden; position: relative; display: flex; flex-direction: column; box-shadow: 0 15px 40px rgba(0,0,0,0.35); box-sizing: border-box; }
@media (max-width: 600px) { .phone-mockup { width: 100vw; height: 100vh; height: 100dvh; max-height: none; border: none; border-radius: 0; box-shadow: none; } }
.phone-screen { display: flex; flex-direction: column; height: 100%; position: relative; overflow: hidden; }
.phone-header { height: 110px; flex-shrink: 0; display: flex; flex-direction: column; justify-content: center; align-items: center; position: relative; color: white; text-align: center; }
.phone-body { flex: 1; padding: 10px; overflow-y: auto; padding-bottom: 95px; }
.phone-avatar-wrapper { width: 45px; height: 45px; border-radius: 50%; border: 2px solid #fff; background: #333; overflow: hidden; margin-bottom: 4px; display: flex; align-items: center; justify-content: center; }
.phone-logo { font-weight: bold; font-size: 13px; text-shadow: 0 0 4px rgba(0,0,0,0.5); }
.phone-categories { display: flex; gap: 6px; margin-bottom: 10px; overflow-x: auto; padding-bottom: 4px; scrollbar-width: none; }
.phone-categories::-webkit-scrollbar { display: none; }
.phone-cat-badge { padding: 5px 10px; border-radius: 14px; font-size: 10px; font-weight: 600; white-space: nowrap; border: none; cursor: pointer; transition: all 0.2s ease; color: #111; background: rgba(255, 255, 255, 0.8); }
.phone-cat-badge.active { color: #ffffff; }
.menu-items-grid-phone { display: grid !important; grid-template-columns: repeat(2, 1fr) !important; gap: 8px !important; }
.menu-card { background: #ffffff; color: #111111; border-radius: 14px; overflow: hidden; display: flex; flex-direction: column; border: none; padding: 6px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08); }
.menu-card img { width: 100%; height: 90px; object-fit: cover; border-radius: 10px; }
.card-content { display: flex; flex-direction: column; justify-content: space-between; flex: 1; padding: 4px 2px; }
.card-text-block h3 { margin: 4px 0 2px 0; font-size: 11px; font-weight: bold; color: #111111; line-height: 1.2; }
.card-text-block p { font-size: 9px; color: #666; margin: 0 0 6px 0; }
.card-bottom-row { display: flex; flex-direction: column; gap: 6px; width: 100%; margin-top: auto; }
.price { font-weight: bold; font-size: 11px; }
.add-to-cart-btn { color: white; border: none; border-radius: 8px; padding: 8px 0; font-size: 11px; font-weight: bold; cursor: pointer; width: 100%; text-align: center; transition: opacity 0.2s; box-shadow: 0 2px 6px rgba(0,0,0,0.15); }
.add-to-cart-btn:active { opacity: 0.8; }
.counter-controls { display: flex; align-items: center; justify-content: space-between; background: #ffffff; border: 1.5px solid; border-radius: 8px; padding: 6px 12px; width: 100%; box-sizing: border-box; }
.counter-btn { background: transparent; border: none; font-size: 13px; font-weight: bold; cursor: pointer; color: #111; padding: 0 4px; }
.counter-value { font-size: 12px; font-weight: bold; color: #111; }
.menu-items-list-phone { display: flex; flex-direction: column; gap: 6px; }
.menu-list-row { background: #ffffff; color: #111111; border: none; border-radius: 12px; padding: 10px 12px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08); }
.menu-list-row .card-content { flex-direction: row; justify-content: space-between; align-items: center; width: 100%; padding: 0; }
.menu-list-row .card-text-block { flex: 1; padding-right: 12px; }
.menu-list-row .card-bottom-row { flex-direction: column; align-items: flex-end; width: 115px; gap: 4px; }
.menu-list-row .price { font-size: 12px; margin-bottom: 2px; }
.menu-list-row .add-to-cart-btn { padding: 6px 0; font-size: 10px; }
.menu-list-row .counter-controls { padding: 4px 8px; }
.floating-cart-bar { position: absolute; bottom: calc(12px + 45px + 4px); left: 12px; right: 12px; color: white; border-radius: 24px; padding: 10px 16px; display: flex; justify-content: space-between; align-items: center; font-size: 11px; font-weight: bold; cursor: pointer; z-index: 20; box-shadow: 0 4px 15px rgba(0,0,0,0.4); box-sizing: border-box; }
.empty-search-notice { text-align: center; font-size: 10px; margin-top: 25px; color: #888; }
.checkout-modal-overlay { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.6); backdrop-filter: blur(4px); z-index: 100; display: flex; align-items: flex-end; }
.checkout-modal { background: #f4f5f7; color: #111; width: 100%; max-height: 92%; border-top-left-radius: 20px; border-top-right-radius: 20px; padding: 16px; box-sizing: border-box; overflow-y: auto; animation: slideUp 0.3s ease-out; }
@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
.checkout-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.checkout-header h3 { margin: 0; font-size: 14px; font-weight: bold; }
.close-modal-btn, .back-btn { background: none; border: none; font-size: 16px; cursor: pointer; color: #666; padding: 0; }
.checkout-form { display: flex; flex-direction: column; gap: 10px; }
.form-group { display: flex; flex-direction: column; gap: 4px; text-align: left; }
.form-group label { font-size: 10px; font-weight: 600; color: #555; }
.form-group input, .form-group select, .form-group textarea { width: 100%; padding: 8px 10px; border-radius: 8px; border: 1px solid #ddd; font-size: 11px; outline: none; box-sizing: border-box; background: #fff; }
.form-group textarea { resize: none; height: 45px; }
.time-picker-block { background: #ffffff; border-radius: 10px; padding: 10px; display: flex; flex-direction: column; gap: 6px; border: 1px solid #eee; }
.block-title { font-size: 11px; font-weight: bold; color: #333; }
.time-inputs-row { display: flex; gap: 8px; }
.time-input, .date-input { flex: 1; padding: 8px; border: 1px solid #ddd; border-radius: 8px; font-size: 11px; background: #fff; outline: none; }
.hint-text { font-size: 9px; color: #777; }
.checkout-summary { display: flex; justify-content: space-between; align-items: center; margin-top: 4px; padding-top: 8px; border-top: 1px dashed #ddd; font-size: 12px; }
.submit-order-btn { color: #fff; border: none; border-radius: 10px; padding: 10px; font-size: 12px; font-weight: bold; cursor: pointer; margin-top: 4px; }
.review-screen-content { display: flex; flex-direction: column; gap: 10px; }
.review-card-block { background: #ffffff; border-radius: 12px; padding: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); text-align: left; }
.review-card-title { font-size: 12px; font-weight: bold; color: #111; margin-bottom: 8px; }
.review-items-list { display: flex; flex-direction: column; gap: 8px; }
.review-item-row { display: flex; justify-content: space-between; font-size: 11px; color: #333; gap: 10px; }
.r-name { flex: 1; line-height: 1.3; }
.r-price { white-space: nowrap; font-weight: 500; }
.review-totals-divider { height: 1px; background: #eee; margin: 8px 0; }
.review-total-line { display: flex; justify-content: space-between; font-size: 11px; color: #666; margin-bottom: 4px; }
.review-total-line.main-total { font-size: 13px; font-weight: bold; color: #111; margin-top: 6px; margin-bottom: 0; }
.data-row { display: flex; align-items: flex-start; gap: 8px; margin-bottom: 8px; font-size: 11px; }
.data-row:last-child { margin-bottom: 0; }
.data-row .icon { font-size: 13px; margin-top: 1px; }
.label-muted { font-size: 9px; color: #888; }
.val { font-weight: 500; color: #222; }
.time-badge-box { background: #f1f3f5; padding: 8px 10px; border-radius: 8px; font-size: 11px; font-weight: 600; color: #333; }
.map-container { margin-bottom: 8px; overflow: hidden; border-radius: 8px; }
.yandex-map-btn { display: block; text-align: center; background: #fc3f1d; color: #fff; padding: 8px; border-radius: 8px; font-size: 11px; font-weight: bold; text-decoration: none; }
.legal-notice { font-size: 9px; color: #888; text-align: center; line-height: 1.2; padding: 0 10px; }
.review-actions-row { display: flex; gap: 8px; margin-top: 4px; }
.btn-secondary-action { flex: 1; background: #e2e8f0; color: #333; border: none; border-radius: 10px; padding: 10px; font-size: 12px; font-weight: bold; cursor: pointer; }
.btn-primary-action { flex: 2; color: #fff; border: none; border-radius: 10px; padding: 10px; font-size: 12px; font-weight: bold; cursor: pointer; }
</style>
