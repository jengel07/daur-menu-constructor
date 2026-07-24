<script setup lang="ts">
import { useRouter } from 'vue-router';
const router = useRouter();
import AdminPanel from './components/admin/AdminDashboard.vue';
import { useOrders } from './composables/useOrders';
import { ref, reactive, nextTick, watch, onMounted, computed } from 'vue';
import MenuImport from './components/MenuImport.vue';
import MenuEditor from './components/MenuEditor.vue';
import BrandingEditor from './components/BrandingEditor.vue';
import GeneralSettings from './components/GeneralSettings.vue';
import ColorEditor from './components/ColorEditor.vue';
import QrCodeEditor from './components/QrCodeEditor.vue';
import QrcodeVue from 'qrcode.vue'; 
import { useCart } from './composables/useCart';
import OrderSettingsEditor from './components/OrderSettingsEditor.vue';
import PhoneMockupContent from './components/PhoneMockupContent.vue';

import type { MenuItem, MenuCategory, RestaurantInfo } from './types/menu';
const { orders, stats, updateOrderStatus } = useOrders();
const saveToLocalStorage = () => {
  const dataToSave = {
    info: restaurantInfo,
    items: items.value,
    cats: categories.value
  };
  localStorage.setItem('restaurantData', JSON.stringify(dataToSave));
};

const activeTab = ref<'navigation' | 'colors' | 'branding' | 'general' | 'qrcode' | 'orders'>('navigation');
const brandingEditorRef = ref<any>(null);
const isWifiExpanded = ref(false);
const showToast = ref(false);
const toastMessage = ref('');

// Тема интерфейса конструктора (светлая/темная)
const isLightTheme = ref(false);
const toggleTheme = () => {
  isLightTheme.value = !isLightTheme.value;
  localStorage.setItem('constructorTheme', isLightTheme.value ? 'light' : 'dark');
};

const triggerToast = (msg: string) => {
  toastMessage.value = msg;
  showToast.value = true;
  setTimeout(() => {
    showToast.value = false;
  }, 2500);
};

const currentScreen = ref<'menu' | 'cart'>('menu');

const activeModal = ref<'none' | 'language' | 'filters' | 'share' | 'search' | 'categories'>('none');
const selectedLanguage = ref('Русский');

// Поисковый запрос
const searchQuery = ref('');

// Активная выбранная категория в шапке (null — все категории)
const selectedCategory = ref<string | null>(null);

// Выбранные фильтры питания
const selectedFilters = ref<string[]>([]);

const toggleFilter = (filterKey: string) => {
  const index = selectedFilters.value.indexOf(filterKey);
  if (index > -1) {
    selectedFilters.value.splice(index, 1);
  } else {
    selectedFilters.value.push(filterKey);
  }
};

const clearAllFilters = () => {
  selectedFilters.value = [];
};

const shareUrl = computed(() => {
  return window.location.href;
});

const copyShareLink = async () => {
  try {
    await navigator.clipboard.writeText(shareUrl.value);
    triggerToast('Ссылка скопирована в буфер обмена!');
  } catch (err) {
    triggerToast('Не удалось скопировать ссылку');
  }
};

const shareViaSocial = (platform: 'whatsapp' | 'telegram' | 'twitter' | 'facebook' | 'linkedin' | 'gmail' | 'outlook') => {
  const url = encodeURIComponent(shareUrl.value);
  const title = encodeURIComponent(`Посмотрите меню ресторана "${currentRestaurantName.value}"!`);
  
  let targetLink = '';
  switch (platform) {
    case 'whatsapp':
      targetLink = `https://api.whatsapp.com/send?text=${title}%20${url}`;
      break;
    case 'telegram':
      targetLink = `https://t.me/share/url?url=${url}&text=${title}`;
      break;
    case 'twitter':
      targetLink = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
      break;
    case 'facebook':
      targetLink = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
      break;
    case 'linkedin':
      targetLink = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
      break;
    case 'gmail':
      targetLink = `https://mail.google.com/mail/?view=cm&fs=1&su=${title}&body=${url}`;
      break;
    case 'outlook':
      targetLink = `https://outlook.live.com/owa/?path=/mail/action/compose&subject=${title}&body=${url}`;
      break;
  }
  
  if (targetLink) {
    window.open(targetLink, '_blank');
  }
};

const handleShare = async () => {
  const shareData = {
    title: currentRestaurantName.value,
    text: `Посмотрите меню ресторана "${currentRestaurantName.value}"!`,
    url: shareUrl.value
  };

  if (navigator.share) {
    try {
      await navigator.share(shareData);
      return;
    } catch (err) {
      // Игнорируем ошибку/отмену и открываем кастомную модалку
    }
  }
  
  activeModal.value = 'share';
};

// Пример функции смены языка, которая срабатывает при выборе языка в модалке
const changeLanguage = (lang: string) => {
  selectedLanguage.value = lang;
  activeModal.value = 'none'; // закрыть модалку
};

const getLocalizedItemName = (originalName: string) => {
  if (!originalName) return '';
  return originalName;
};

const getLocalizedCategoryName = (originalCatName: string) => {
  if (!originalCatName) return '';
  return originalCatName;
};

const t = computed(() => {
  return { restaurantName: 'Мой Ресторан' };
});

const viewMode = ref<'grid' | 'list'>('grid');

const categories = ref<MenuCategory[]>([]);
const items = ref<MenuItem[]>([]);
const hasImported = ref(false);

const isBottomBarVisible = ref(true);
const lastScrollTop = ref(0);

const { cartItems, addToCart } = useCart();

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

const handleTrashClick = (id: string | number) => {
  decreaseQuantity(id);
};

const totalPrice = computed(() => {
  return cartItems.value.reduce((sum, item) => sum + (item.price * item.quantity), 0);
});

// Отфильтрованные товары с учетом поиска и выбранной категории
const filteredItems = computed(() => {
  return items.value.filter(item => {
    if (!item.isAvailable) return false;
    
    // Фильтрация по категории, если она выбрана
    if (selectedCategory.value !== null) {
      const itemCat = (item.categoryId || item.category || '').toString().trim().toLowerCase();
      const selCat = selectedCategory.value.toString().trim().toLowerCase();
      if (itemCat !== selCat) {
        return false;
      }
    }

    // Фильтрация по поисковому запросу
    if (searchQuery.value.trim() !== '') {
      const q = searchQuery.value.trim().toLowerCase();
      const locName = getLocalizedItemName(item.name).toLowerCase();
      const origName = item.name.toLowerCase();
      if (!locName.includes(q) && !origName.includes(q)) {
        return false;
      }
    }
    return true;
  });
});

const restaurantInfo = reactive<RestaurantInfo>({
  name: 'Мой Ресторан',
  primaryColor: '#646cff',
  secondaryColor: '#242424',
  backgroundColor: '#121212',
  textColor: '#ffffff',
  coverImage: null,
  avatarImage: null,
  wifiName: '',
  wifiPassword: '',
  isWifiEnabled: false,
  qrSettings: {
    text: 'Сканируй меня',
    bgColor: '#ffffff',
    squareColor: '#000000',
    textColor: '#000000',
    textBgColor: 'transparent',
    font: 'Arial'
  }
});

const currentRestaurantName = computed(() => {
  if (!restaurantInfo.name || restaurantInfo.name === 'Мой Ресторан' || restaurantInfo.name === 'My Restaurant' || restaurantInfo.name === 'Mein Restaurant' || restaurantInfo.name === 'Аресторан') {
    return t.value.restaurantName;
  }
  return restaurantInfo.name;
});

const getItemQuantity = (id: string | number) => {
  const item = cartItems.value.find(i => i.id === id);
  return item ? item.quantity : 0;
};

const handlePhoneScroll = (e: Event) => {
  const target = e.target as HTMLElement;
  const currentScroll = target.scrollTop;

  if (currentScroll > lastScrollTop.value && currentScroll > 30) {
    isBottomBarVisible.value = false;
  } else {
    isBottomBarVisible.value = true;
  }
  lastScrollTop.value = currentScroll;
};

watch([restaurantInfo, items, categories], () => {
  localStorage.setItem('restaurantData', JSON.stringify({
    info: restaurantInfo,
    items: items.value,
    cats: categories.value,
    hasImported: hasImported.value
  }));
}, { deep: true });

onMounted(() => {
  const savedTheme = localStorage.getItem('constructorTheme');
  if (savedTheme === 'light') {
    isLightTheme.value = true;
  }

  const savedData = localStorage.getItem('restaurantData');
  if (savedData) {
    try {
      const parsed = JSON.parse(savedData);
      Object.assign(restaurantInfo, parsed.info);
      items.value = parsed.items || [];
      categories.value = parsed.cats || [];
      hasImported.value = parsed.hasImported;
    } catch (e) {
      console.error("Ошибка при чтении данных:", e);
    }
  }
});

const openPreview = () => {
  window.open('/preview', '_blank');
};

const handleImportSuccess = (data: { categories: MenuCategory[]; items: MenuItem[] }) => {
  categories.value = data.categories;
  items.value = data.items;
  hasImported.value = true;
};

const resetImport = () => {
  categories.value = [];
  items.value = [];
  hasImported.value = false;
  localStorage.removeItem('restaurantData');
};

const updateRestaurantInfo = (newData: RestaurantInfo) => {
  Object.assign(restaurantInfo, newData);
};

const triggerFileUpload = async (type: 'avatar' | 'cover') => {
  if (activeTab.value !== 'branding') activeTab.value = 'branding';
  await nextTick();
  if (brandingEditorRef.value) {
    type === 'avatar' ? brandingEditorRef.value.triggerAvatarUpload() : brandingEditorRef.value.triggerCoverUpload();
  }
};

// Функция для возврата в админку
const goToAdmin = () => {
  router.push('admin'); // Плавный переход на главную страницу через роутер
};
</script>

<template>
  <div :class="['constructor-wrapper', { 'light-theme': isLightTheme }]">
    <div v-if="!hasImported" class="welcome-screen">
      <MenuImport @import-success="handleImportSuccess" />
    </div>

    <div v-else class="constructor-layout">
      <aside class="sidebar">
        <div class="sidebar-header">
          <!-- Восстановленная кнопка назад и логотип -->
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
            <button 
              @click="router.push('/')" 
              class="btn-theme-toggle" 
              title="Вернуться в панель управления"
              style="width: 32px; height: 32px; padding: 0; display: flex; align-items: center; justify-content: center;"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 12H5"></path>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
            </button>
            <h2 class="brand-title" style="margin: 0;">Daur Menu</h2>
          </div>
          
          <div class="header-actions-row">
            <span class="status-badge">Режим редактирования</span>
            <button class="btn-theme-toggle" @click="toggleTheme" :title="isLightTheme ? 'Включить темную тему' : 'Включить светлую тему'">
              {{ isLightTheme ? '🌙' : '☀️' }}
            </button>
          </div>
        </div>
        
        <nav class="sidebar-menu">
          <button v-for="tab in ['navigation', 'colors', 'branding', 'general', 'qrcode', 'orders']" 
            :key="tab" class="menu-btn" :class="{ active: activeTab === tab }" @click="activeTab = tab">
            <span class="icon">
              {{ tab === 'navigation' ? '🍔' : tab === 'colors' ? '🎨' : tab === 'branding' ? '✨' : tab === 'general' ? '📄' : tab === 'qrcode' ? '📱' : '📋' }}
            </span>
            {{ tab === 'navigation' ? 'Навигация и блюда' : tab === 'colors' ? 'Цвета интерфейса' : tab === 'branding' ? 'Брендинг и лого' : tab === 'general' ? 'Общие данные' : tab === 'qrcode' ? 'QR-код меню' : 'Настройка заказов' }}
          </button>
        </nav>
        <button @click="resetImport" class="btn-reset-sidebar">↩ Сбросить и загрузить заново</button>
      </aside>

      <main class="editor-area">
        <header class="editor-header">
          <h1 class="tab-title">Настройка раздела</h1>
        </header>
        <div class="editor-content">
          <MenuEditor v-if="activeTab === 'navigation'" :items="items" :categories="categories" @update-items="items = $event" @update-categories="categories = $event" />
          <BrandingEditor v-else-if="activeTab === 'branding'" ref="brandingEditorRef" :model-value="restaurantInfo" @update:model-value="updateRestaurantInfo" />
          <GeneralSettings v-else-if="activeTab === 'general'" :model-value="restaurantInfo" @update:model-value="updateRestaurantInfo" />
          <ColorEditor v-else-if="activeTab === 'colors'" :model-value="restaurantInfo" @update:model-value="updateRestaurantInfo" />
          <QrCodeEditor v-else-if="activeTab === 'qrcode'" :model-value="restaurantInfo" @update:model-value="updateRestaurantInfo" />
          <OrderSettingsEditor v-else-if="activeTab === 'orders'" :model-value="restaurantInfo" @update:model-value="updateRestaurantInfo" />
        </div>
      </main>

      <section class="preview-area">
        <div class="preview-container">
          <PhoneMockupContent 
            :restaurantInfo="restaurantInfo" 
            :items="items" 
            :categories="categories" 
          />
        </div>
      </section>
    </div>
  </div>
</template>