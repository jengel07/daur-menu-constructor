<script setup lang="ts">
import { useRouter } from 'vue-router';
const router = useRouter();
import { useOrders } from './composables/useOrders';
import { ref, watch, onMounted } from 'vue';
import { useMenuStore } from './store/menuStore';
import MenuImport from './components/MenuImport.vue';
import MenuEditor from './components/MenuEditor.vue';
import BrandingEditor from './components/BrandingEditor.vue';
import GeneralSettings from './components/GeneralSettings.vue';
import ColorEditor from './components/ColorEditor.vue';
import QrCodeEditor from './components/QrCodeEditor.vue';
import OrderSettingsEditor from './components/OrderSettingsEditor.vue';
import PhoneMockupContent from './components/PhoneMockupContent.vue';
import type { MenuCategory } from './types/menu';

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

// Инициализация заказов (если потребуется в будущем)
const { } = useOrders();

const menuStore = useMenuStore();

const activeTab = ref<'navigation' | 'colors' | 'branding' | 'general' | 'qrcode' | 'orders'>('navigation');

// Тема интерфейса конструктора (светлая/темная)
const isLightTheme = ref(false);
const toggleTheme = () => {
  isLightTheme.value = !isLightTheme.value;
  localStorage.setItem('constructorTheme', isLightTheme.value ? 'light' : 'dark');
};

const hasImported = ref(menuStore.items.length > 0 || menuStore.categories.length > 0);

// Функция синхронизации данных с ключом, который читает таблица данных (/menu-data)
const syncToTableStorage = () => {
  // Превращаем плоский список items и категории в структуру, удобную для таблицы
 const formattedData = menuStore.categories.map((cat: MenuCategory) => {
    return {
      id: cat.id || 'cat-' + Math.random(),
      name: cat.name,
      expanded: true,
      items: menuStore.items
        .filter((item: any) => item.categoryId === cat.id || item.category === cat.name)
        .map((item: any) => ({
          id: item.id || 'item-' + Math.random(),
          name: item.name,
          description: item.description || '',
          price: item.price || 0,
          isAvailable: item.isAvailable !== false,
          image: item.image || ''
        }))
    };
  });

  // Если категории в сторе не привязаны напрямую через ID, но блюда содержат категории, сгруппируем их:
  if (formattedData.length === 0 && menuStore.items.length > 0) {
    const grouped: Record<string, any[]> = {};
    menuStore.items.forEach((item: any) => {
      const catName = item.category || 'Основное меню';
      if (!grouped[catName]) grouped[catName] = [];
      grouped[catName].push({
        id: item.id || 'item-' + Math.random(),
        name: item.name,
        description: item.description || '',
        price: item.price || 0,
        isAvailable: item.isAvailable !== false,
        image: item.image || ''
      });
    });

    const fallbackData = Object.keys(grouped).map((catName, idx) => ({
      id: 'cat-' + idx,
      name: catName,
      expanded: true,
      items: grouped[catName]
    }));
    
    localStorage.setItem('constructor_menu_data', JSON.stringify(fallbackData));
    return;
  }

  localStorage.setItem('constructor_menu_data', JSON.stringify(formattedData));
};

// Следим за состоянием элементов и категорий, чтобы автоматически обновлять localStorage для таблицы
watch([() => menuStore.items, () => menuStore.categories], ([newItems, newCats]) => {
  if (newItems.length > 0 || newCats.length > 0) {
    hasImported.value = true;
    syncToTableStorage();
  }
}, { deep: true });

onMounted(() => {
  const savedTheme = localStorage.getItem('constructorTheme');
  if (savedTheme === 'light') {
    isLightTheme.value = true;
  }

  if (menuStore.items.length > 0 || menuStore.categories.length > 0) {
    hasImported.value = true;
    syncToTableStorage();
  }
});

const handleImportSuccess = (data: { categories: typeof menuStore.categories; items: typeof menuStore.items }) => {
  menuStore.updateCategories(data.categories);
  menuStore.updateItems(data.items);
  hasImported.value = true;
  syncToTableStorage();
};

const resetImport = () => {
  menuStore.updateCategories([]);
  menuStore.updateItems([]);
  hasImported.value = false;
  localStorage.removeItem('restaurantData');
  localStorage.removeItem('constructor_menu_data');
};

const updateRestaurantInfo = (newData: typeof menuStore.restaurantInfo) => {
  menuStore.restaurantInfo = { ...menuStore.restaurantInfo, ...newData };
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
          <MenuEditor 
            v-if="activeTab === 'navigation'" 
            :items="menuStore.items" 
            :categories="menuStore.categories" 
            @update-items="(items) => { menuStore.updateItems(items); syncToTableStorage(); }" 
            @update-categories="(cats) => { menuStore.updateCategories(cats); syncToTableStorage(); }" 
          />
          <BrandingEditor v-else-if="activeTab === 'branding'" :model-value="menuStore.restaurantInfo" @update:model-value="updateRestaurantInfo" />
          <GeneralSettings v-else-if="activeTab === 'general'" :model-value="menuStore.restaurantInfo" @update:model-value="updateRestaurantInfo" />
          <ColorEditor v-else-if="activeTab === 'colors'" :model-value="menuStore.restaurantInfo" @update:model-value="updateRestaurantInfo" />
          <QrCodeEditor v-else-if="activeTab === 'qrcode'" :model-value="menuStore.restaurantInfo" @update:model-value="updateRestaurantInfo" />
          <OrderSettingsEditor v-else-if="activeTab === 'orders'" :model-value="menuStore.restaurantInfo" @update:model-value="updateRestaurantInfo" />
        </div>
      </main>

      <section class="preview-area">
        <div class="preview-container">
          <PhoneMockupContent 
            :restaurantInfo="menuStore.restaurantInfo" 
            :items="menuStore.items" 
            :categories="menuStore.categories" 
          />
        </div>
      </section>
    </div>
  </div>
</template>