<script setup lang="ts">
import { useRouter } from 'vue-router';
const router = useRouter();
import { useOrders } from './composables/useOrders';
import { ref, reactive, watch, onMounted, } from 'vue';
import MenuImport from './components/MenuImport.vue';
import MenuEditor from './components/MenuEditor.vue';
import BrandingEditor from './components/BrandingEditor.vue';
import GeneralSettings from './components/GeneralSettings.vue';
import ColorEditor from './components/ColorEditor.vue';
import QrCodeEditor from './components/QrCodeEditor.vue';
import OrderSettingsEditor from './components/OrderSettingsEditor.vue';
import PhoneMockupContent from './components/PhoneMockupContent.vue';

// Импорт иконок из lucide-vue-next
import { 
  UtensilsCrossed, 
  Palette, 
  Sparkles, 
  FileText, 
  QrCode, 
  ClipboardList, 
  ArrowLeft, 
  Sun, 
  Moon, 
  RotateCcw 
} from 'lucide-vue-next';

import type { MenuItem, MenuCategory, RestaurantInfo } from './types/menu';

// Инициализация заказов (если потребуется в будущем)
const { } = useOrders();

const activeTab = ref<'navigation' | 'colors' | 'branding' | 'general' | 'qrcode' | 'orders'>('navigation');

// Тема интерфейса конструктора (светлая/темная)
const isLightTheme = ref(false);
const toggleTheme = () => {
  isLightTheme.value = !isLightTheme.value;
  localStorage.setItem('constructorTheme', isLightTheme.value ? 'light' : 'dark');
};

const categories = ref<MenuCategory[]>([]);
const items = ref<MenuItem[]>([]);
const hasImported = ref(false);

const restaurantInfo = reactive<RestaurantInfo>({
  name: 'Мой Ресторан',
  primaryColor: '#646cff',
  secondaryColor: '#242424',
  backgroundColor: '#121212',
  textColor: '#ffffff',
  coverImage: undefined,
  avatarImage: undefined,
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
</script>

<template>
  <div :class="['constructor-wrapper', { 'light-theme': isLightTheme }]">
    <div v-if="!hasImported" class="welcome-screen">
      <MenuImport @import-success="handleImportSuccess" />
    </div>

    <div v-else class="constructor-layout">
      <aside class="sidebar">
        <div class="sidebar-header">
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
            <button 
              @click="router.push('/')" 
              class="btn-theme-toggle" 
              title="Вернуться в панель управления"
              style="width: 32px; height: 32px; padding: 0; display: flex; align-items: center; justify-content: center;"
            >
              <ArrowLeft :size="18" stroke-width="2" />
            </button>
            <h2 class="brand-title" style="margin: 0;">Daur Menu</h2>
          </div>
          
          <div class="header-actions-row">
            <span class="status-badge">Режим редактирования</span>
            <button class="btn-theme-toggle" @click="toggleTheme" :title="isLightTheme ? 'Включить темную тему' : 'Включить светлую тему'">
              <component :is="isLightTheme ? Moon : Sun" :size="16" stroke-width="2" />
            </button>
          </div>
        </div>
        
        <nav class="sidebar-menu">
          <button v-for="tab in ['navigation', 'colors', 'branding', 'general', 'qrcode', 'orders']" 
            :key="tab" class="menu-btn" :class="{ active: activeTab === tab }" @click="activeTab = tab as any">
            <span class="icon" style="display: flex; align-items: center;">
              <UtensilsCrossed v-if="tab === 'navigation'" :size="18" stroke-width="2" />
              <Palette v-else-if="tab === 'colors'" :size="18" stroke-width="2" />
              <Sparkles v-else-if="tab === 'branding'" :size="18" stroke-width="2" />
              <FileText v-else-if="tab === 'general'" :size="18" stroke-width="2" />
              <QrCode v-else-if="tab === 'qrcode'" :size="18" stroke-width="2" />
              <ClipboardList v-else-if="tab === 'orders'" :size="18" stroke-width="2" />
            </span>
            {{ tab === 'navigation' ? 'Навигация и блюда' : tab === 'colors' ? 'Цвета интерфейса' : tab === 'branding' ? 'Брендинг и лого' : tab === 'general' ? 'Общие данные' : tab === 'qrcode' ? 'QR-код меню' : 'Настройка заказов' }}
          </button>
        </nav>
        <button @click="resetImport" class="btn-reset-sidebar" style="display: flex; align-items: center; justify-content: center; gap: 6px;">
          <RotateCcw :size="14" stroke-width="2" /> Сбросить и загрузить заново
        </button>
      </aside>

      <main class="editor-area">
        <header class="editor-header">
          <h1 class="tab-title">Настройка раздела</h1>
        </header>
        <div class="editor-content">
          <MenuEditor v-if="activeTab === 'navigation'" :items="items" :categories="categories" @update-items="items = $event" @update-categories="categories = $event" />
          <BrandingEditor v-else-if="activeTab === 'branding'" :model-value="restaurantInfo" @update:model-value="updateRestaurantInfo" />
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