<script setup lang="ts">
import { useRouter } from 'vue-router';
import { ref, watch, onMounted } from 'vue';
import axios from 'axios';
import * as XLSX from 'xlsx';

import { useMenuStore } from './store/menuStore';
import type { MenuCategory } from './types/menu';

import MenuImport from './components/MenuImport.vue';
import MenuEditor from './components/MenuEditor.vue';
import BrandingEditor from './components/BrandingEditor.vue';
import GeneralSettings from './components/GeneralSettings.vue';
import ColorEditor from './components/ColorEditor.vue';
import QrCodeEditor from './components/QrCodeEditor.vue';
import OrderSettingsEditor from './components/OrderSettingsEditor.vue';
import PhoneMockupContent from './components/PhoneMockupContent.vue';

import { 
  UtensilsCrossed, 
  Palette, 
  Sparkles, 
  FileText, 
  QrCode, 
  ClipboardList, 
  Sun, 
  Moon, 
  RotateCcw,
  Save,
  Upload,
  Menu as MenuIcon,
  X,
  Home,
  ShoppingBag,
  BarChart2,
  Users,
  CreditCard,
  User,
  Tag,
  Trash2,
  LogOut
} from 'lucide-vue-next';

const API_URL = 'http://localhost:3000';
const router = useRouter();
const menuStore = useMenuStore();

const activeTab = ref<'navigation' | 'colors' | 'branding' | 'general' | 'qrcode' | 'orders'>('navigation');
const isLightTheme = ref(false);
const hasImported = ref(menuStore.items.length > 0 || menuStore.categories.length > 0);
const isInitialLoading = ref(true);
const fileInputRef = ref<HTMLInputElement | null>(null);

// Состояние для управления выпадающим меню
const isMenuOpen = ref(false);

const toggleTheme = () => {
  isLightTheme.value = !isLightTheme.value;
  localStorage.setItem('constructorTheme', isLightTheme.value ? 'light' : 'dark');
};

const saveMenuConfig = async () => {
  try {
    await axios.post(`${API_URL}/api/menu`, {
      info: menuStore.restaurantInfo,
      items: menuStore.items,
      cats: menuStore.categories,
      generalSettings: menuStore.generalSettings || {}
    });
    console.log('✅ Настройки успешно сохранены в бэкенд!');
  } catch (error) {
    console.error('❌ Ошибка сохранения на бэкенд:', error);
  }
};

const loadMenuFromDatabase = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/menu`);
    
    if (response.data) {
      if (response.data.restaurantInfo) {
        menuStore.restaurantInfo = { ...menuStore.restaurantInfo, ...response.data.restaurantInfo };
      }
      if (response.data.categories && response.data.categories.length > 0) {
        menuStore.updateCategories(response.data.categories);
      }
      if (response.data.items && response.data.items.length > 0) {
        menuStore.updateItems(response.data.items);
      }
      if (response.data.generalSettings) {
        menuStore.generalSettings = { ...menuStore.generalSettings, ...response.data.generalSettings };
      }
      
      if ((response.data.items && response.data.items.length > 0) || (response.data.categories && response.data.categories.length > 0)) {
        hasImported.value = true;
      }
    }
    console.log('✅ Данные успешно загружены из базы данных!');
  } catch (error) {
    console.error('❌ Ошибка при загрузке из БД:', error);
  } finally {
    isInitialLoading.value = false;
  }
};

const syncToTableStorage = () => {
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
    localStorage.setItem('saved_menu', JSON.stringify({
      categoriesCount: fallbackData.length,
      itemsCount: menuStore.items.length,
      updatedAt: new Date().toISOString()
    }));

    saveMenuConfig();
    return;
  }

  localStorage.setItem('constructor_menu_data', JSON.stringify(formattedData));
  localStorage.setItem('saved_menu', JSON.stringify({
    categoriesCount: menuStore.categories.length,
    itemsCount: menuStore.items.length,
    updatedAt: new Date().toISOString()
  }));

  saveMenuConfig();
};

const manualSave = async () => {
  try {
    syncToTableStorage();
    alert('✅ Меню успешно сохранено и обновлено!');
  } catch (error) {
    console.error('Ошибка сохранения:', error);
    alert('❌ Не удалось сохранить меню');
  }
};

const triggerFileUpload = () => {
  fileInputRef.value?.click();
};

const handleFileUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  const fileName = file.name.toLowerCase();

  try {
    if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const rows: any[] = XLSX.utils.sheet_to_json(worksheet);

      const categoriesMap = new Map<string, string>();
      const categories: { id: string; name: string }[] = [];
      const items: any[] = [];

      rows.forEach((row) => {
        const catName = row.Category || row['Категория (Category)'] || row['Категория'] || 'Основное меню';
        const title = row.Title || row['Название (Title)'] || row['Название'];
        const description = row.Description || row['Описание / Состав (Description)'] || row['Описание'] || '';
        const price = Number(row.Price || row['Цена, руб. (Price)'] || row['Цена'] || 0);

        if (!title) return;

        if (!categoriesMap.has(catName)) {
          const catId = 'cat-' + Math.random().toString(36).substr(2, 9);
          categoriesMap.set(catName, catId);
          categories.push({ id: catId, name: catName });
        }

        const categoryId = categoriesMap.get(catName);

        items.push({
          id: 'item-' + Math.random().toString(36).substr(2, 9),
          categoryId,
          category: catName,
          name: title,
          description,
          price,
          isAvailable: true,
          image: ''
        });
      });

      menuStore.updateCategories(categories);
      menuStore.updateItems(items);
      hasImported.value = true;
      syncToTableStorage();
      alert(`✅ Успешно импортировано позиций: ${items.length} из файла Excel!`);

    } else if (fileName.endsWith('.json')) {
      const text = await file.text();
      const jsonData = JSON.parse(text);
      
      if (jsonData.categories && jsonData.items) {
        menuStore.updateCategories(jsonData.categories);
        menuStore.updateItems(jsonData.items);
      } else if (Array.isArray(jsonData)) {
        const cats: any[] = [];
        const items: any[] = [];
        jsonData.forEach((cat, cIdx) => {
          const catId = cat.id || 'cat-' + cIdx;
          cats.push({ id: catId, name: cat.name });
          if (cat.items) {
            cat.items.forEach((item: any) => {
              items.push({ ...item, categoryId: catId, category: cat.name });
            });
          }
        });
        menuStore.updateCategories(cats);
        menuStore.updateItems(items);
      }
      hasImported.value = true;
      syncToTableStorage();
      alert('✅ Меню успешно загружено из JSON!');
    }
  } catch (error) {
    console.error('Ошибка чтения файла:', error);
    alert('❌ Не удалось прочитать файл. Убедитесь в правильности формата.');
  } finally {
    if (target) target.value = '';
  }
};

watch([() => menuStore.items, () => menuStore.categories, () => menuStore.restaurantInfo, () => menuStore.generalSettings], () => {
  if (isInitialLoading.value) return;
  
  if (menuStore.items.length > 0 || menuStore.categories.length > 0) {
    hasImported.value = true;
    syncToTableStorage();
  }
}, { deep: true });

onMounted(async () => {
  const savedTheme = localStorage.getItem('constructorTheme');
  if (savedTheme === 'light') {
    isLightTheme.value = true;
  }

  await loadMenuFromDatabase();

  if (menuStore.items.length > 0 || menuStore.categories.length > 0) {
    hasImported.value = true;
  }
  isInitialLoading.value = false;
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
  localStorage.removeItem('saved_menu');
};

const updateRestaurantInfo = (newData: typeof menuStore.restaurantInfo) => {
  menuStore.restaurantInfo = { ...menuStore.restaurantInfo, ...newData };
};
</script>

<template>
  <div :class="['constructor-wrapper', { 'light-theme': isLightTheme }]">
    
    <!-- Скрытый инпут для загрузки файлов таблиц (.xlsx, .json) -->
    <input 
      type="file" 
      ref="fileInputRef" 
      style="display: none" 
      accept=".xlsx, .xls, .json" 
      @change="handleFileUpload" 
    />

    <div v-if="!hasImported" class="welcome-screen">
      <MenuImport @import-success="handleImportSuccess" />
    </div>

    <div v-else class="constructor-layout">
      
      <aside class="sidebar">
        <div class="sidebar-header">
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
            <!-- Кнопка вызова модального меню -->
            <button 
              @click="isMenuOpen = true" 
              class="btn-theme-toggle" 
              title="Открыть меню"
              style="width: 32px; height: 32px; padding: 0; display: flex; align-items: center; justify-content: center;"
            >
              <MenuIcon :size="18" stroke-width="2" />
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
          <button 
            v-for="tab in ['navigation', 'colors', 'branding', 'general', 'qrcode', 'orders']" 
            :key="tab" 
            class="menu-btn" 
            :class="{ active: activeTab === tab }" 
            @click="activeTab = tab as any"
          >
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

        <!-- Кнопки сохранения и загрузки файла в сайдбаре -->
        <div style="padding: 0 16px; display: flex; flex-direction: column; gap: 8px; margin-top: auto;">
          <button @click="manualSave" class="btn-save-menu" style="display: flex; align-items: center; justify-content: center; gap: 6px; width: 100%; padding: 10px; background-color: #22c55e; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 500;">
            <Save :size="14" stroke-width="2" /> Сохранить меню
          </button>

          <button @click="triggerFileUpload" class="btn-upload-file" style="display: flex; align-items: center; justify-content: center; gap: 6px; width: 100%; padding: 10px; background-color: #3b82f6; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 500;">
            <Upload :size="14" stroke-width="2" /> Загрузить из Excel / JSON
          </button>

          <button @click="resetImport" class="btn-reset-sidebar" style="display: flex; align-items: center; justify-content: center; gap: 6px; width: 100%;">
            <RotateCcw :size="14" stroke-width="2" /> Сбросить и загрузить заново
          </button>
        </div>
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

    <!-- Модальное выпадающее меню -->
    <div v-if="isMenuOpen" class="modal-menu-overlay" @click.self="isMenuOpen = false" style="position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 1000; display: flex; justify-content: flex-start;">
      <div class="modal-menu-content" style="background: var(--bg-color, #ffffff); width: 320px; height: 100%; padding: 24px; display: flex; flex-direction: column; box-shadow: 4px 0 15px rgba(0,0,0,0.1); overflow-y: auto;">
        
        <div style="display: flex; justify-content: flex-end; margin-bottom: 10px;">
          <button @click="isMenuOpen = false" style="background: none; border: none; cursor: pointer; padding: 4px;">
            <X :size="20" />
          </button>
        </div>

        <!-- Информация о пользователе -->
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #eee;">
          <div style="width: 48px; height: 48px; border-radius: 50%; background: #6366f1; display: flex; align-items: center; justify-content: center; color: white;">
            <User :size="24" />
          </div>
          <div>
            <div style="font-weight: 600; font-size: 16px;">Дженифер</div>
            <div style="font-size: 13px; color: #6b7280;">geller.9797@mail.ru</div>
          </div>
        </div>

        <!-- Ссылки меню -->
        <div style="display: flex; flex-direction: column; gap: 6px; flex: 1;">
          <button @click="isMenuOpen = false; router.push('/constructor')" style="display: flex; align-items: center; gap: 12px; padding: 12px; border: none; background: #f3f4f6; border-radius: 12px; cursor: pointer; text-align: left; font-weight: 500;">
            <Home :size="18" /> Home
          </button>
          <button @click="isMenuOpen = false" style="display: flex; align-items: center; gap: 12px; padding: 12px; border: none; background: transparent; border-radius: 12px; cursor: pointer; text-align: left;">
            <ShoppingBag :size="18" /> Заказ
          </button>
          <button @click="isMenuOpen = false" style="display: flex; align-items: center; gap: 12px; padding: 12px; border: none; background: transparent; border-radius: 12px; cursor: pointer; text-align: left;">
            <BarChart2 :size="18" /> Статистика
          </button>

          <div style="height: 1px; background: #eee; margin: 12px 0;"></div>

          <button @click="isMenuOpen = false" style="display: flex; align-items: center; gap: 12px; padding: 12px; border: none; background: transparent; border-radius: 12px; cursor: pointer; text-align: left;">
            <Users :size="18" /> Персонал
          </button>
          <button @click="isMenuOpen = false" style="display: flex; align-items: center; gap: 12px; padding: 12px; border: none; background: transparent; border-radius: 12px; cursor: pointer; text-align: left;">
            <CreditCard :size="18" /> Оплата
          </button>
          <button @click="isMenuOpen = false" style="display: flex; align-items: center; gap: 12px; padding: 12px; border: none; background: transparent; border-radius: 12px; cursor: pointer; text-align: left;">
            <User :size="18" /> Профиль
          </button>
          <button @click="isMenuOpen = false" style="display: flex; align-items: center; gap: 12px; padding: 12px; border: none; background: transparent; border-radius: 12px; cursor: pointer; text-align: left;">
            <Tag :size="18" /> Фильтры и теги
          </button>
          <button @click="isMenuOpen = false" style="display: flex; align-items: center; gap: 12px; padding: 12px; border: none; background: transparent; border-radius: 12px; cursor: pointer; text-align: left;">
            <Trash2 :size="18" /> Корзина
          </button>

          <div style="height: 1px; background: #eee; margin: 12px 0; margin-top: auto;"></div>

          <button @click="isMenuOpen = false; router.push('/login')" style="display: flex; align-items: center; gap: 12px; padding: 12px; border: none; background: transparent; border-radius: 12px; cursor: pointer; text-align: left; color: #ef4444;">
            <LogOut :size="18" /> Выйти
          </button>
        </div>

      </div>
    </div>

  </div>
</template>