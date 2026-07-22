<script setup lang="ts">
import { ref, reactive, nextTick, watch, onMounted, computed } from 'vue';
import MenuImport from './components/MenuImport.vue';
import MenuEditor from './components/MenuEditor.vue';
import BrandingEditor from './components/BrandingEditor.vue';
import GeneralSettings from './components/GeneralSettings.vue';
import ColorEditor from './components/ColorEditor.vue';
import QrCodeEditor from './components/QrCodeEditor.vue';
import QrcodeVue from 'qrcode.vue'; 
import { useCart } from './composables/useCart';

import type { MenuItem, MenuCategory, RestaurantInfo } from './types/menu';

const activeTab = ref<'navigation' | 'colors' | 'branding' | 'general' | 'qrcode'>('navigation');
const brandingEditorRef = ref<any>(null);
const isWifiExpanded = ref(false);
const showToast = ref(false);
const toastMessage = ref('');

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

// Словарь локализации интерфейса
const translations: Record<string, any> = {
  'Русский': {
    restaurantName: 'Мой Ресторан',
    wifiTitle: 'Информация WiFi',
    wifiNetwork: 'Сеть',
    wifiPassword: 'Пароль',
    wifiNotSet: 'Не задано',
    addBtn: '+ добавить',
    cartTitle: 'Посмотреть корзину',
    subtotal: 'Подытог',
    closedNotice: 'Мы сейчас закрыты.<br>Откроемся в понедельник.',
    addMore: '+ Добавить еще товары',
    cartHeader: 'Корзина',
    langTitle: 'Язык',
    filtersTitle: 'Фильтры',
    searchTitle: 'Поиск по меню',
    searchPlaceholder: 'Введите название блюда...',
    emptySearch: 'Ничего не найдено',
    nutritionTitle: 'Питание',
    clearFilters: 'очистить',
    showResults: 'Показать результаты',
    categoriesTitle: 'Категории',
    allCategories: 'Все категории',
    poweredBy: '© Проект от Web-Visual-World | 2024'
  },
  'English': {
    restaurantName: 'My Restaurant',
    wifiTitle: 'WiFi Information',
    wifiNetwork: 'Network',
    wifiPassword: 'Password',
    wifiNotSet: 'Not set',
    addBtn: '+ add',
    cartTitle: 'View Cart',
    subtotal: 'Subtotal',
    closedNotice: 'We are currently closed.<br>We will open on Monday.',
    addMore: '+ Add more items',
    cartHeader: 'Cart',
    langTitle: 'Language',
    filtersTitle: 'Filters',
    searchTitle: 'Search menu',
    searchPlaceholder: 'Enter dish name...',
    emptySearch: 'Nothing found',
    nutritionTitle: 'Dietary',
    clearFilters: 'clear',
    showResults: 'Show results',
    categoriesTitle: 'Categories',
    allCategories: 'All categories',
    poweredBy: '© Проект от Web-Visual-World | 2024'
  },
  'Deutsch': {
    restaurantName: 'Mein Restaurant',
    wifiTitle: 'WiFi Information',
    wifiNetwork: 'Netzwerk',
    wifiPassword: 'Passwort',
    wifiNotSet: 'Nicht festgelegt',
    addBtn: '+ hinzufügen',
    cartTitle: 'Warenkorb ansehen',
    subtotal: 'Zwischensumme',
    closedNotice: 'Wir haben derzeit geschlossen.<br>Wir öffnen am Montag.',
    addMore: '+ Weitere Artikel hinzufügen',
    cartHeader: 'Warenkorb',
    langTitle: 'Sprache',
    filtersTitle: 'Filter',
    searchTitle: 'Menü durchsuchen',
    searchPlaceholder: 'Gericht eingeben...',
    emptySearch: 'Nichts gefunden',
    nutritionTitle: 'Ernährung',
    clearFilters: 'löschen',
    showResults: 'Ergebnisse anzeigen',
    categoriesTitle: 'Kategorien',
    allCategories: 'Alle Kategorien',
    poweredBy: '© Проект от Web-Visual-World | 2024'
  },
  'Аҧсшәа': {
    restaurantName: 'Аресторан',
    wifiTitle: 'Wi-Fi Информация',
    wifiNetwork: 'Ашьаҭа',
    wifiPassword: 'Ажәамаҵәа',
    wifiNotSet: 'Иҟазҵам',
    addBtn: '+ аҿыц',
    cartTitle: 'Акарзина ахәаԥшра',
    subtotal: 'Абжьара',
    closedNotice: 'Ҳара ҳаҷы зҵәоуп.<br>Ашәахьа аартхоит.',
    addMore: '+ Иацҵатәуп атоварқәа',
    cartHeader: 'Акарзина',
    langTitle: 'Абызшәа',
    filtersTitle: 'Афильтрқәа',
    searchTitle: 'Аҧшаара',
    searchPlaceholder: 'Иҧшаа аџьынџь...',
    emptySearch: 'Даҽаԥшаам',
    nutritionTitle: 'Адырҩара',
    clearFilters: 'иқәгатәуп',
    showResults: 'Аихьӡарақәа аарԥштәуп',
    categoriesTitle: 'Акатегориақәа',
    allCategories: 'Зегьы акатегориақәа',
    poweredBy: '© Проект от Web-Visual-World | 2024'
  }
};

const dishTranslations: Record<string, Record<string, { name: string, category: string }>> = {
  'Том Ям': {
    'Русский': { name: 'Том Ям', category: 'Основные блюда' },
    'English': { name: 'Tom Yum', category: 'Main dishes' },
    'Deutsch': { name: 'Tom Yam', category: 'Hauptgerichte' },
    'Аҧсшәа': { name: 'Атом Иам', category: 'Ихадоу аџьынџьқәа' }
  },
  'Картошка фри': {
    'Русский': { name: 'Картошка фри', category: 'Основные блюда' },
    'English': { name: 'French Fries', category: 'Main dishes' },
    'Deutsch': { name: 'Pommes Frites', category: 'Hauptgerichte' },
    'Аҧсшәа': { name: 'Акартошька фри', category: 'Ихадоу аџьынџьқәа' }
  },
  'Спагети Карбонара': {
    'Русский': { name: 'Спагети Карбонара', category: 'Основные блюда' },
    'English': { name: 'Spaghetti Carbonara', category: 'Main dishes' },
    'Deutsch': { name: 'Spaghetti Carbonara', category: 'Hauptgerichte' },
    'Аҧсшәа': { name: 'Аспагетти Карбонара', category: 'Ихадоу аџьынџьқәа' }
  }
};

const categoryTranslations: Record<string, Record<string, string>> = {
  'Основные блюда': {
    'Русский': 'Основные блюда',
    'English': 'Main dishes',
    'Deutsch': 'Hauptgerichte',
    'Аҧсшәа': 'Ихадоу аџьынџьқәа'
  },
  'Напитки': {
    'Русский': 'Напитки',
    'English': 'Beverages',
    'Deutsch': 'Getränke',
    'Аҧсшәа': 'Амаҷқәа'
  },
  'Блюда на завтрак': {
    'Русский': 'Блюда на завтрак',
    'English': 'Breakfast dishes',
    'Deutsch': 'Frühstücksgerichte',
    'Аҧсшәа': 'Ахьаҵа аџьынџьқәа'
  },
  'Гарниры': {
    'Русский': 'Гарниры',
    'English': 'Side dishes',
    'Deutsch': 'Beilagen',
    'Аҧсшәа': 'Ахьыҩқәа'
  },
  'Десерты': {
    'Русский': 'Десерты',
    'English': 'Desserts',
    'Deutsch': 'Desserts',
    'Аҧсшәа': 'Адесертқәа'
  },
  'Первые блюда': {
    'Русский': 'Первые блюда',
    'English': 'First courses',
    'Deutsch': 'Suppen & Vorspeisen',
    'Аҧсшәа': 'Актәи аџьынџьқәа'
  },
  'Соусы': {
    'Русский': 'Соусы',
    'English': 'Sauces',
    'Deutsch': 'Saucen',
    'Аҧсшәа': 'Асоусқәа'
  },
  'Салаты': {
    'Русский': 'Салаты',
    'English': 'Salads',
    'Deutsch': 'Salate',
    'Аҧсшәа': 'Асалатқәа'
  },
  'Итальянские блюда': {
    'Русский': 'Итальянские блюда',
    'English': 'Italian dishes',
    'Deutsch': 'Italienische Gerichte',
    'Аҧсшәа': 'Италиатәи аџьынџьқәа'
  },
  'Холодные закуски': {
    'Русский': 'Холодные закуски',
    'English': 'Cold appetizers',
    'Deutsch': 'Kalte Vorspeisen',
    'Аҧсшәа': 'Шьаҟатәи аҩкаақәа'
  },
  'Кавказская кухня': {
    'Русский': 'Кавказская кухня',
    'English': 'Caucasian cuisine',
    'Deutsch': 'Kaukasische Küche',
    'Аҧсшәа': 'Кавказтәи аҟазшьа'
  },
  'Выпечка': {
    'Русский': 'Выпечка',
    'English': 'Bakery',
    'Deutsch': 'Gebäck',
    'Аҧсшәа': 'Ахьыҟара'
  },
  'Морепродукты': {
    'Русский': 'Морепродукты',
    'English': 'Seafood',
    'Deutsch': 'Meeresfrüchte',
    'Аҧсшәа': 'Амшын атоварқәа'
  }
};

const getLocalizedItemName = (originalName: string) => {
  if (!originalName) return '';
  const cleanName = originalName.trim().toLowerCase();
  const key = Object.keys(dishTranslations).find(k => k.toLowerCase() === cleanName);
  
  if (key && dishTranslations[key][selectedLanguage.value]) {
    return dishTranslations[key][selectedLanguage.value].name;
  }
  return originalName;
};

const getLocalizedCategoryName = (originalCatName: string) => {
  if (!originalCatName) return '';
  const cleanCatName = originalCatName.trim().toLowerCase();
  const directKey = Object.keys(categoryTranslations).find(k => k.toLowerCase() === cleanCatName);
  
  if (directKey && categoryTranslations[directKey][selectedLanguage.value]) {
    return categoryTranslations[directKey][selectedLanguage.value];
  }
  
  for (const key in dishTranslations) {
    if (dishTranslations[key]['Русский']?.category.toLowerCase() === cleanCatName || key.toLowerCase() === cleanCatName) {
      const match = dishTranslations[key][selectedLanguage.value];
      if (match) return match.category;
    }
  }
  return originalCatName;
};

const t = computed(() => {
  return translations[selectedLanguage.value] || translations['Русский'];
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
</script>

<template>
  <div v-if="!hasImported" class="welcome-screen">
    <MenuImport @import-success="handleImportSuccess" />
  </div>

  <div v-else class="constructor-layout">
    <aside class="sidebar">
      <div class="sidebar-header">
        <h2 class="brand-title">Daur Menu</h2>
        <span class="status-badge">Режим редактирования</span>
      </div>
      <nav class="sidebar-menu">
        <button v-for="tab in ['navigation', 'colors', 'branding', 'general', 'qrcode']" 
                :key="tab" class="menu-btn" :class="{ active: activeTab === tab }" @click="activeTab = tab as any">
          <span class="icon">{{ tab === 'navigation' ? '🍔' : tab === 'colors' ? '🎨' : tab === 'branding' ? '✨' : tab === 'general' ? '📝' : '📱' }}</span>
          {{ tab === 'navigation' ? 'Навигация и блюда' : tab === 'colors' ? 'Цвета интерфейса' : tab === 'branding' ? 'Брендинг и лого' : tab === 'general' ? 'Общие данные' : 'QR-код меню' }}
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
      </div>
    </main>

    <section class="preview-area">
      <div class="preview-container">
        <button class="preview-copy-btn" @click="openPreview">🔗 Предпросмотр</button>
        
        <div class="phone-mockup">
          <div class="phone-screen">
            
            <template v-if="currentScreen === 'menu'">
              <div class="phone-header" @click="triggerFileUpload('cover')" :style="{ 
  cursor: 'pointer', 
  backgroundColor: restaurantInfo.secondaryColor, 
  backgroundImage: restaurantInfo.coverImage 
    ? (restaurantInfo.showCoverGradient !== false 
        ? `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.6)), url(${restaurantInfo.coverImage})` 
        : `url(${restaurantInfo.coverImage})`) 
    : 'none', 
  backgroundSize: 'cover', 
  backgroundPosition: 'center' 
}">
  <div class="phone-avatar-wrapper">
    <div class="phone-avatar-placeholder" @click.stop="triggerFileUpload('avatar')" style="cursor: pointer;">
      <span v-if="!restaurantInfo.avatarImage">🍽️</span>
      <img v-else :src="restaurantInfo.avatarImage" alt="Аватар" style="width: 100%; height: 100%; object-fit: cover;" />
    </div>
  </div>
  <div class="phone-logo">{{ currentRestaurantName }}</div>
</div>
              
              <div class="phone-body" @scroll="handlePhoneScroll" :style="{ backgroundColor: restaurantInfo.backgroundColor, color: restaurantInfo.textColor }">
                <div v-if="activeTab === 'qrcode'" class="phone-qr-preview">
  <div 
    class="qr-card-preview" 
    :style="{ background: restaurantInfo.qrSettings.textBgColor || '#000000' }"
  >
    <div class="qr-box-preview" :style="{ background: restaurantInfo.qrSettings.bgColor || '#ffffff' }">
      <QrcodeVue 
        :value="'https://great-birds-rest.loca.lt'" 
        :size="150" 
        :background="restaurantInfo.qrSettings.bgColor || '#ffffff'" 
        :foreground="restaurantInfo.qrSettings.squareColor || '#000000'" 
        level="H" 
      />
    </div>
    <div 
  class="qr-label-preview" 
  :style="{ 
    color: restaurantInfo.qrSettings.textColor || '#ffffff',
    fontFamily: restaurantInfo.qrSettings.fontFamily || 'Comfortaa'
  }"
>
  {{ restaurantInfo.qrSettings.text }}
</div>
  </div>
</div>
                <div v-else>
                  <div v-if="restaurantInfo.isWifiEnabled" class="phone-wifi-btn" @click="isWifiExpanded = !isWifiExpanded">
                    <div class="wifi-icon-box">ℹ️</div>
                    <div class="wifi-label" :style="{ color: restaurantInfo.textColor }">
                      <div class="title">{{ t.wifiTitle }}</div>
                      <div v-if="isWifiExpanded" class="subtitle" style="margin-top: 5px;">
                        <div>{{ t.wifiNetwork }}: {{ restaurantInfo.wifiName || t.wifiNotSet }}</div>
                        <div style="font-weight: bold; margin-top: 2px;">{{ t.wifiPassword }}: {{ restaurantInfo.wifiPassword }}</div>
                      </div>
                    </div>
                    <div class="chevron" :style="{ transform: isWifiExpanded ? 'rotate(90deg)' : 'rotate(0deg)', color: restaurantInfo.textColor }">›</div>
                  </div>

                  <!-- Рабочие категории (крупные бейджи с фильтрацией) -->
                  <div class="phone-categories">
                    <button 
                      class="phone-cat-badge" 
                      :class="{ active: selectedCategory === null }"
                      @click="selectedCategory = null"
                      :style="{ backgroundColor: selectedCategory === null ? restaurantInfo.primaryColor : 'rgba(255,255,255,0.1)' }"
                    >
                      {{ t.allCategories }}
                    </button>
                    <button 
                      v-for="cat in categories" 
                      :key="cat.id" 
                      class="phone-cat-badge" 
                      :class="{ active: selectedCategory === cat.name }"
                      @click="selectedCategory = selectedCategory === cat.name ? null : cat.name"
                      :style="{ backgroundColor: selectedCategory === cat.name ? restaurantInfo.primaryColor : 'rgba(255,255,255,0.1)' }"
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
                          :style="{ backgroundColor: restaurantInfo.primaryColor }"
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

              <!-- Нижняя панель с рабочей кнопкой поиска -->
              <div class="floating-settings-bar" :class="{ 'bar-hidden': !isBottomBarVisible }" :style="{ backgroundColor: restaurantInfo.primaryColor }">
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

              <!-- Всплывающее уведомление (toast) -->
              <div v-if="showToast" class="toast-notification">
                {{ toastMessage }}
              </div>

              <!-- Модальное окно выбора языка -->
              <div v-if="activeModal === 'language'" class="bottom-sheet-overlay" @click.self="activeModal = 'none'">
                <div class="bottom-sheet">
                  <div class="sheet-indicator"></div>
                  <div class="sheet-header">
                    <h3>{{ t.langTitle }}</h3>
                  </div>
                  <div class="languages-grid">
                    <button class="lang-option" :class="{ active: selectedLanguage === 'Deutsch' }" @click="selectedLanguage = 'Deutsch'">
                      <span class="flag-icon">🇩🇪</span> Deutsch
                    </button>
                    <button class="lang-option" :class="{ active: selectedLanguage === 'English' }" @click="selectedLanguage = 'English'">
                      <span class="flag-icon">🇬🇧</span> English
                    </button>
                    <button class="lang-option" :class="{ active: selectedLanguage === 'Русский' }" @click="selectedLanguage = 'Русский'">
                      <span class="flag-icon">🇷🇺</span> Русский
                    </button>
                    <button class="lang-option" :class="{ active: selectedLanguage === 'Аҧсшәа' }" @click="selectedLanguage = 'Аҧсшәа'">
                      <span class="flag-icon">🟢</span> Аҧсшәа
                    </button>
                  </div>
                  <div class="sheet-footer-brand">{{ t.poweredBy }}</div>
                </div>
              </div>

              <!-- Модальное окно поиска -->
              <div v-if="activeModal === 'search'" class="bottom-sheet-overlay" @click.self="activeModal = 'none'">
                <div class="bottom-sheet">
                  <div class="sheet-indicator"></div>
                  <div class="sheet-header-flex">
                    <h3>{{ t.searchTitle }}</h3>
                    <button class="clear-filters-text-btn" @click="searchQuery = ''">очистить</button>
                  </div>
                  <div class="search-input-wrapper">
                    <span class="search-icon-prefix">🔍</span>
                    <input 
                      v-model="searchQuery" 
                      type="text" 
                      class="search-modal-input" 
                      :placeholder="t.searchPlaceholder"
                      autofocus
                    />
                    <button v-if="searchQuery" class="clear-input-btn" @click="searchQuery = ''">✕</button>
                  </div>
                  <button class="show-results-btn" @click="activeModal = 'none'">
                    {{ t.showResults }} ({{ filteredItems.length }})
                  </button>
                  <div class="sheet-footer-brand">{{ t.poweredBy }}</div>
                </div>
              </div>

              <!-- Модальное окно фильтров -->
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
                      <button class="lang-option" :class="{ active: selectedFilters.includes('nuts') }" @click="toggleFilter('nuts')">
                        <span class="flag-icon">🌰</span> Без орехов
                      </button>
                      <button class="lang-option" :class="{ active: selectedFilters.includes('lactose') }" @click="toggleFilter('lactose')">
                        <span class="flag-icon">🥛</span> Без лактозы
                      </button>
                      <button class="lang-option" :class="{ active: selectedFilters.includes('gluten') }" @click="toggleFilter('gluten')">
                        <span class="flag-icon">🌾</span> Без глютена
                      </button>
                    </div>
                  </div>

                  <button class="show-results-btn" @click="activeModal = 'none'">
                    {{ t.showResults }}
                  </button>

                  <div class="sheet-footer-brand">{{ t.poweredBy }}</div>
                </div>
              </div>

              <!-- Модальное окно «Поделиться ссылкой» -->
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
                        <img v-if="restaurantInfo.avatarImage" :src="restaurantInfo.avatarImage" alt="Аватар" style="width: 100%; height: 100%; object-fit: cover;" />
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
                    <button class="win-app-item" @click="shareViaSocial('telegram')">
                      <div class="win-app-icon" style="background: #229ED9;">✈️</div>
                      <span>Telegram</span>
                    </button>
                    <button class="win-app-item" @click="shareViaSocial('whatsapp')">
                      <div class="win-app-icon" style="background: #25D366;">💬</div>
                      <span>WhatsApp</span>
                    </button>
                    <button class="win-app-item" @click="shareViaSocial('twitter')">
                      <div class="win-app-icon" style="background: #000000;">𝕏</div>
                      <span>Twitter</span>
                    </button>
                    <button class="win-app-item" @click="shareViaSocial('facebook')">
                      <div class="win-app-icon" style="background: #1877F2;">📘</div>
                      <span>Facebook</span>
                    </button>
                    <button class="win-app-item" @click="shareViaSocial('linkedin')">
                      <div class="win-app-icon" style="background: #0A66C2;">💼</div>
                      <span>LinkedIn</span>
                    </button>
                    <button class="win-app-item" @click="shareViaSocial('gmail')">
                      <div class="win-app-icon" style="background: #EA4335;">✉️</div>
                      <span>Gmail</span>
                    </button>
                    <button class="win-app-item" @click="shareViaSocial('outlook')">
                      <div class="win-app-icon" style="background: #0078D4;">📧</div>
                      <span>Outlook</span>
                    </button>
                    <button class="win-app-item" @click="copyShareLink">
                      <div class="win-app-icon" style="background: #646cff;">📋</div>
                      <span>Копировать</span>
                    </button>
                  </div>
                </div>
              </div>

              <div v-if="cartItems.length > 0" class="floating-cart-bar" @click="currentScreen = 'cart'" :style="{ backgroundColor: restaurantInfo.primaryColor, zIndex: 20 }">
                <span class="cart-title">{{ t.cartTitle }}</span>
                <span class="cart-total">RUB {{ totalPrice.toFixed(2) }}</span>
              </div>
            </template>

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
                    <div class="cart-item-actions" :style="{ backgroundColor: restaurantInfo.primaryColor }">
                      <button @click="handleTrashClick(item.id)">🗑️</button>
                      <span class="cart-item-qty">{{ item.quantity }}</span>
                      <button @click="increaseQuantity(item.id)">+</button>
                    </div>
                  </div>
                </div>

                <div class="add-more-link" @click="currentScreen = 'menu'">
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
    </section>
  </div>
</template>

<style>
:root { --bg-dark: #121212; --bg-panel: #1e1e1e; --border-color: #2e2e2e; --text-main: #ffffff; --accent: #646cff; }
body { margin: 0; font-family: 'Inter', sans-serif; background-color: var(--bg-dark); color: var(--text-main); }
.constructor-layout { display: grid; grid-template-columns: 280px 1fr 400px; height: 100vh; }
.sidebar { background-color: var(--bg-panel); padding: 24px; border-right: 1px solid var(--border-color); display: flex; flex-direction: column; }
.menu-btn { background: transparent; border: none; padding: 12px; color: #a0a0a0; text-align: left; cursor: pointer; border-radius: 8px; width: 100%; display: flex; align-items: center; gap: 10px; }
.menu-btn.active { background: var(--accent); color: #fff; }
.btn-reset-sidebar { margin-top: auto; padding: 12px; background: #444; border: none; border-radius: 8px; color: white; cursor: pointer; }
.editor-area { background: #141414; display: flex; flex-direction: column; overflow-y: auto; }
.editor-header { padding: 20px; border-bottom: 1px solid var(--border-color); }
.editor-content { padding: 20px; }
.preview-area { background-color: var(--bg-panel); display: flex; justify-content: center; align-items: center; border-left: 1px solid var(--border-color); }
.preview-container { position: relative; display: flex; flex-direction: column; align-items: center; gap: 15px; }
.preview-copy-btn { background: var(--accent); color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 14px; }
.phone-mockup { width: 310px; height: 620px; background: #000; border: 10px solid #2a2a2a; border-radius: 40px; overflow: hidden; position: relative; display: flex; flex-direction: column; }
.phone-screen { display: flex; flex-direction: column; height: 100%; position: relative; background: #141414; }
.phone-header { height: 120px; flex-shrink: 0; display: flex; flex-direction: column; justify-content: center; align-items: center; position: relative; color: white; text-align: center; }
.phone-body { flex: 1; padding: 16px; overflow-y: auto; padding-bottom: 90px; }
.phone-avatar-wrapper { width: 60px; height: 60px; border-radius: 50%; border: 3px solid #000; background: #333; overflow: hidden; margin-bottom: 5px; }
.phone-avatar-placeholder { width: 100%; height: 100%; display: flex; justify-content: center; align-items: center; }
.phone-logo { font-weight: bold; font-size: 14px; text-shadow: 0 0 4px rgba(0,0,0,0.5); }

/* Обновленные стили для крупных и удобных категорий */
.phone-categories { display: flex; gap: 8px; margin-bottom: 14px; overflow-x: auto; padding-bottom: 4px; scrollbar-width: none; }
.phone-categories::-webkit-scrollbar { display: none; }

.phone-cat-badge { 
  padding: 8px 14px; 
  border-radius: 16px; 
  font-size: 12px; 
  font-weight: 600; 
  white-space: nowrap; 
  border: none; 
  cursor: pointer; 
  transition: all 0.2s ease; 
  box-shadow: 0 2px 6px rgba(0,0,0,0.1); 
  /* Автоматический выбор контрастного текста в зависимости от яркости фона */
  color: var(--badge-text-color, #111111);
  background: var(--badge-bg-color, rgba(255, 255, 255, 0.15));
}

.phone-cat-badge.active { 
  color: var(--active-text-color, #ffffff); 
  background: var(--active-bg-color, #ff5722);
}

.phone-cat-badge:hover { opacity: 0.9; }

.empty-search-notice { text-align: center; font-size: 13px; margin-top: 40px; }

.menu-items-grid-phone { display: grid !important; grid-template-columns: repeat(2, 1fr) !important; gap: 8px !important; padding: 0 !important; }
.menu-card { background: #ffffff; border-radius: 12px; overflow: hidden; display: flex; flex-direction: column; }
.menu-card img { width: 100%; height: 90px; object-fit: cover; }

.menu-items-list-phone { display: flex; flex-direction: column; gap: 8px; }
.menu-list-row { background: #ffffff; border-radius: 12px; padding: 10px; display: flex; justify-content: space-between; align-items: center; }

.card-content { padding: 8px; display: flex; flex-direction: column; justify-content: space-between; flex: 1; gap: 6px; }
.menu-list-row .card-content { padding: 0; flex-direction: row; align-items: center; width: 100%; }
.card-content h3 { font-size: 11px; color: #000; margin: 0; line-height: 1.2; }
.price { font-weight: bold; color: #000; font-size: 11px; margin-top: 2px; }

.add-to-cart-btn { background: #646cff; color: white; border: none; border-radius: 8px; padding: 6px 0; font-size: 11px; font-weight: bold; cursor: pointer; width: 100%; text-align: center; }
.menu-list-row .add-to-cart-btn { width: auto; padding: 6px 12px; }

.counter-controls { display: flex; justify-content: space-between; align-items: center; background: #f3f4f6; border-radius: 8px; padding: 4px 8px; }
.counter-controls button { background: transparent; border: none; font-size: 13px; font-weight: bold; cursor: pointer; color: #333; }
.counter-controls span { font-size: 11px; font-weight: bold; color: #333; }

.floating-settings-bar { position: absolute; bottom: 15px; left: 15px; right: 15px; background: #7c3aed; color: white; border-radius: 30px; padding: 8px 12px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 4px 15px rgba(0,0,0,0.4); z-index: 15; transition: transform 0.3s ease, opacity 0.3s ease; }
.floating-settings-bar.bar-hidden { transform: translateY(100px); opacity: 0; pointer-events: none; }
.bar-btn { background: transparent; border: none; color: white; font-size: 11px; font-weight: 500; cursor: pointer; display: flex; align-items: center; gap: 4px; padding: 4px 6px; }
.bar-divider { width: 1px; height: 16px; background: rgba(255, 255, 255, 0.3); }

/* Стили для Toast-уведомления */
.toast-notification { position: absolute; bottom: 80px; left: 50%; transform: translateX(-50%); background: rgba(0, 0, 0, 0.85); color: #fff; padding: 8px 16px; border-radius: 12px; font-size: 12px; z-index: 200; white-space: nowrap; box-shadow: 0 4px 12px rgba(0,0,0,0.3); animation: fadeInOut 2.5s ease; }
@keyframes fadeInOut { 0% { opacity: 0; transform: translate(-50%, 10px); } 15% { opacity: 1; transform: translate(-50%, 0); } 85% { opacity: 1; transform: translate(-50%, 0); } 100% { opacity: 0; transform: translate(-50%, -10px); } }

.bottom-sheet-overlay { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.6); z-index: 100; display: flex; align-items: flex-end; }
.bottom-sheet { background: #f8f7fc; color: #111; width: 100%; border-top-left-radius: 24px; border-top-right-radius: 24px; padding: 16px; display: flex; flex-direction: column; gap: 12px; }
.sheet-indicator { width: 36px; height: 4px; background: #d1d5db; border-radius: 2px; align-self: center; }
.sheet-header h3 { font-size: 16px; font-weight: bold; color: #6d28d9; text-align: center; margin: 0; }
.sheet-header-flex { display: flex; justify-content: space-between; align-items: center; }
.sheet-header-flex h3 { font-size: 16px; font-weight: bold; color: #6d28d9; margin: 0; }
.clear-filters-text-btn { background: transparent; border: none; color: #6b7280; font-size: 12px; cursor: pointer; text-decoration: underline; }

/* Стили для поиска в модалке */
.search-input-wrapper { position: relative; display: flex; align-items: center; background: #ffffff; border: 1px solid #d1d5db; border-radius: 12px; padding: 0 12px; }
.search-icon-prefix { font-size: 14px; margin-right: 8px; }
.search-modal-input { width: 100%; border: none; background: transparent; padding: 12px 0; font-size: 14px; color: #111; outline: none; }
.clear-input-btn { background: transparent; border: none; color: #9ca3af; font-size: 14px; cursor: pointer; padding: 4px; }

.filters-section-content { display: flex; flex-direction: column; gap: 8px; }
.filters-category-title { font-size: 13px; font-weight: 600; color: #374151; margin-top: 4px; }

.languages-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
.lang-option { background: #ede9fe; border: 1px solid #ddd6fe; border-radius: 12px; padding: 12px; font-size: 13px; font-weight: 500; color: #374151; cursor: pointer; display: flex; align-items: center; gap: 8px; }
.lang-option.active { background: #7c3aed; color: white; border-color: #7c3aed; }
.flag-icon { font-size: 16px; }

.show-results-btn { background: #7c3aed; color: white; border: none; border-radius: 12px; padding: 12px; font-size: 14px; font-weight: bold; cursor: pointer; width: 100%; text-align: center; margin-top: 4px; }

.sheet-footer-brand { text-align: center; font-size: 11px; color: #6b7280; margin-top: 4px; }

/* Стили для модального окна «Поделиться» */
.share-modal-overlay { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.5); z-index: 150; display: flex; align-items: center; justify-content: center; padding: 12px; }
.windows-share-dialog { background: #ffffff; color: #1f2937; width: 100%; border-radius: 16px; padding: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.3); display: flex; flex-direction: column; gap: 14px; animation: scaleUp 0.2s ease; }
@keyframes scaleUp { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }

.win-share-header { display: flex; justify-content: space-between; align-items: center; }
.win-share-title-row { display: flex; align-items: center; gap: 8px; }
.win-share-icon { font-size: 16px; }
.win-share-heading { font-size: 15px; font-weight: bold; color: #111; }
.win-share-close { background: transparent; border: none; font-size: 14px; color: #6b7280; cursor: pointer; padding: 4px; }

.win-link-card { background: #f3f4f6; border-radius: 12px; padding: 10px; display: flex; align-items: center; justify-content: space-between; gap: 8px; border: 1px solid #e5e7eb; }
.win-link-preview-left { display: flex; align-items: center; gap: 10px; overflow: hidden; }
.win-link-thumb { width: 36px; height: 36px; border-radius: 8px; background: #e5e7eb; display: flex; align-items: center; justify-content: center; overflow: hidden; flex-shrink: 0; }
.win-link-text { display: flex; flex-direction: column; overflow: hidden; }
.win-link-url { font-size: 11px; color: #111; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-weight: 500; }
.win-link-sub { font-size: 10px; color: #6b7280; }
.win-link-actions { display: flex; gap: 4px; flex-shrink: 0; }
.win-action-icon-btn { background: #ffffff; border: 1px solid #e5e7eb; border-radius: 6px; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 12px; color: #374151; }
.win-action-icon-btn:hover { background: #f9fafb; }

.win-share-section-title { font-size: 12px; font-weight: 600; color: #4b5563; margin-top: 2px; }

.win-apps-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
.win-app-item { background: transparent; border: none; display: flex; flex-direction: column; align-items: center; gap: 4px; cursor: pointer; padding: 4px; border-radius: 8px; }
.win-app-item:hover { background: #f3f4f6; }
.win-app-icon { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; font-size: 16px; box-shadow: 0 2px 5px rgba(0,0,0,0.15); }
.win-app-item span { font-size: 10px; color: #374151; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; width: 100%; }

.floating-cart-bar { position: absolute; bottom: 15px; left: 15px; right: 15px; background: #646cff; color: white; border-radius: 24px; padding: 12px 20px; display: flex; justify-content: space-between; align-items: center; font-size: 13px; font-weight: bold; cursor: pointer; z-index: 20; }

.cart-screen-header { display: flex; justify-content: space-between; align-items: center; padding: 16px; background: #1a1a1a; color: white; border-bottom: 1px solid #2e2e2e; }
.cart-screen-header h2 { font-size: 15px; margin: 0; color: #b197fc; }
.cart-close-btn, .cart-clear-all-btn { background: transparent; border: none; color: #aaa; font-size: 16px; cursor: pointer; }
.cart-screen-body { flex: 1; overflow-y: auto; padding: 12px; background: #141414; }
.closed-notice { background: #2b1d31; color: #f3e8ff; padding: 12px; border-radius: 12px; text-align: center; font-size: 12px; margin-bottom: 12px; border: 1px solid #4a2c59; }
.cart-items-list { display: flex; flex-direction: column; gap: 8px; }
.cart-item-row { background: #1e1e1e; border-radius: 12px; padding: 10px; display: flex; justify-content: space-between; align-items: center; }
.cart-item-name { font-size: 12px; color: white; margin-bottom: 4px; }
.cart-item-price { font-size: 12px; font-weight: bold; color: #b197fc; }
.cart-item-actions { display: flex; align-items: center; gap: 8px; background: #646cff; padding: 4px 8px; border-radius: 8px; }
.cart-item-actions button { background: transparent; border: none; color: white; cursor: pointer; font-size: 12px; }
.cart-item-qty { color: white; font-size: 12px; font-weight: bold; }
.add-more-link { text-align: center; color: #b197fc; font-size: 12px; margin-top: 15px; cursor: pointer; }
.cart-screen-footer { padding: 12px; background: #1a1a1a; border-top: 1px solid #2e2e2e; }
.subtotal-row { display: flex; justify-content: space-between; color: white; font-size: 13px; margin-bottom: 8px; }
.subtotal-sum { font-weight: bold; }
.powered-by { text-align: center; font-size: 10px; color: #666; }
.phone-qr-preview {
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
  width: 100% !important;
  height: 100% !important;
  padding: 10px !important;
  box-sizing: border-box !important;
}

.qr-card-preview {
  padding: 10px !important;
  border-radius: 14px !important;
  text-align: center !important;
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  width: 170px !important;
  box-sizing: border-box !important;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3) !important;
}

.qr-box-preview {
  padding: 8px !important;
  border-radius: 8px !important;
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
  box-sizing: border-box !important;
}

.qr-box-preview canvas,
.qr-box-preview svg {
  display: block !important;
  width: 130px !important;
  height: 130px !important;
}

.qr-label-preview {
  margin-top: 8px !important;
  font-weight: bold !important;
  font-size: 14px !important;
  word-break: break-word !important;
  width: 100% !important;
}
</style>

