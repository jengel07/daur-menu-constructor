<script setup lang="ts">
// --- 1. ИМПОРТЫ БИБЛИОТЕК И МОДУЛЕЙ VUE ---
import { useRouter } from 'vue-router'; // Модуль роутинга для перехода между страницами
import { ref, watch, onMounted } from 'vue'; // Реактивные функции и хуки жизненного цикла Vue
import axios from 'axios'; // HTTP-клиент для отправки запросов на бэкенд

// --- 2. ИМПОРТ ВНУТРЕННИХ КАСТОМНЫХ МОДУЛЕЙ И СТОРОВ ---
import { useOrders } from './composables/useOrders'; // Композабл для управления заказами
import { useMenuStore } from './store/menuStore'; // Pinia-стор с состоянием меню и ресторана
import type { MenuCategory } from './types/menu'; // TypeScript-интерфейс категории меню

// --- 3. ИМПОРТ ДОЧЕРНИХ КОМПОНЕНТОВ ---
import MenuImport from './components/MenuImport.vue'; // Экран импорта данных (если меню пустое)
import MenuEditor from './components/MenuEditor.vue'; // Вкладка «Навигация и блюда»
import BrandingEditor from './components/BrandingEditor.vue'; // Вкладка «Брендинг и лого»
import GeneralSettings from './components/GeneralSettings.vue'; // Вкладка «Общие данные»
import ColorEditor from './components/ColorEditor.vue'; // Вкладка «Цвета интерфейса»
import QrCodeEditor from './components/QrCodeEditor.vue'; // Вкладка «QR-код меню»
import OrderSettingsEditor from './components/OrderSettingsEditor.vue'; // Вкладка «Настройка заказов»
import PhoneMockupContent from './components/PhoneMockupContent.vue'; // Компонент мобильного превью (экрана телефона)

// --- 4. ИМПОРТ ИКОНОК ИЗ ЛИБЫ LUCIDE-VUE-NEXT ---
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

// --- 5. ИНИЦИАЛИЗАЦИЯ И ИНСТАНЦИРОВАНИЕ ---
const router = useRouter(); // Экземпляр роутера для навигации
const { } = useOrders(); // Вызов композабла заказов (готов к использованию)
const menuStore = useMenuStore(); // Подключаем глобальный Pinia-стор

// --- 6. РЕАКТИВНЫЕ ПЕРЕМЕННЫЕ (STATE) ---
// Активная вкладка в левом меню конструктора
const activeTab = ref<'navigation' | 'colors' | 'branding' | 'general' | 'qrcode' | 'orders'>('navigation');

// Тема интерфейса конструктора (false = темная, true = светлая)
const isLightTheme = ref(false);

// Флаг: загружены ли данные (показывать конструктор или экран импорта)
const hasImported = ref(menuStore.items.length > 0 || menuStore.categories.length > 0);

// --- 7. ВСП ОМОГАТЕЛЬНЫЕ ФУНКЦИИ ---
// Переключение темы конструктора с сохранением выбора в LocalStorage
const toggleTheme = () => {
  isLightTheme.value = !isLightTheme.value;
  localStorage.setItem('constructorTheme', isLightTheme.value ? 'light' : 'dark');
};

// --- 8. СЕТЕВАЯ ЛОГИКА (API & LOCALSTORAGE) ---

// Загрузка данных меню из базы SQLite через Node.js Express сервер
const loadMenuFromDatabase = async () => {
  try {
    const response = await axios.get('http://192.168.31.240:3000/api/menu');
    
    if (response.data) {
      // Заполняем данные о ресторане в стор
      if (response.data.restaurantInfo) {
        menuStore.restaurantInfo = { ...menuStore.restaurantInfo, ...response.data.restaurantInfo };
      }
      // Заполняем категории в стор
      if (response.data.categories && response.data.categories.length > 0) {
        menuStore.updateCategories(response.data.categories);
      }
      // Заполняем блюда в стор
      if (response.data.items && response.data.items.length > 0) {
        menuStore.updateItems(response.data.items);
      }
      
      // Если есть данные, снимаем заглушку welcome-экрана
      if ((response.data.items && response.data.items.length > 0) || (response.data.categories && response.data.categories.length > 0)) {
        hasImported.value = true;
      }
    }
    console.log('✅ Данные успешно загружены из базы данных!');
  } catch (error) {
    console.error('❌ Ошибка при загрузке из БД:', error);
  }
};

// Сохранение текущей конфигурации меню на сервер (POST-запрос)
const saveMenuConfig = async () => {
  try {
    await axios.post('http://192.168.31.240:3000/api/menu', {
      restaurantInfo: menuStore.restaurantInfo,
      items: menuStore.items,
      categories: menuStore.categories
    });
    console.log('✅ Настройки успешно сохранены в бэкенд!');
  } catch (error) {
    console.error('❌ Ошибка сохранения на бэкенд:', error);
  }
};

// Синхронизация данных стора с LocalStorage (для страницы /menu-data) и вызов сохранения на сервер
const syncToTableStorage = () => {
  // Формируем структурированное дерево категории -> блюда
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

  // Запасная логика (fallback): если категорий нет, но блюда есть — группируем по названиям
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
    
    // Записываем в локальное хранилище и сохраняем на бэкенде
    localStorage.setItem('constructor_menu_data', JSON.stringify(fallbackData));
    saveMenuConfig();
    return;
  }

  // Записываем форматированные данные в локальное хранилище и сохраняем на бэкенде
  localStorage.setItem('constructor_menu_data', JSON.stringify(formattedData));
  saveMenuConfig();
};

// --- 9. WATCHERS (ОТ СЛЕЖИВАНИЕ ИЗМЕНЕНИЙ) ---
// При изменении блюд, категорий или информации о ресторане авто-синхронизируем данные
watch([() => menuStore.items, () => menuStore.categories, () => menuStore.restaurantInfo], () => {
  if (menuStore.items.length > 0 || menuStore.categories.length > 0) {
    hasImported.value = true;
    syncToTableStorage();
  }
}, { deep: true }); // deep: true отслеживает глубокие изменения внутри объектов и массивов

// --- 10. ХУКИ ЖИЗНЕННОГО ЦИКЛА (LIFECYCLE HOOKS) ---
onMounted(async () => {
  // Восстанавливаем сохраненную тему интерфейса
  const savedTheme = localStorage.getItem('constructorTheme');
  if (savedTheme === 'light') {
    isLightTheme.value = true;
  }

  // Подгружаем актуальное меню из бэкенда/БД при загрузке компонента
  await loadMenuFromDatabase();

  if (menuStore.items.length > 0 || menuStore.categories.length > 0) {
    hasImported.value = true;
    syncToTableStorage();
  }
});

// --- 11. ХЭНДЛЕРЫ СОБЫТИЙ ---
// Вызывается при успешном импорте меню из внешнего файла/компонента
const handleImportSuccess = (data: { categories: typeof menuStore.categories; items: typeof menuStore.items }) => {
  menuStore.updateCategories(data.categories);
  menuStore.updateItems(data.items);
  hasImported.value = true;
  syncToTableStorage();
};

// Полный сброс всех данных меню и возврат на начальный экран импорта
const resetImport = () => {
  menuStore.updateCategories([]);
  menuStore.updateItems([]);
  hasImported.value = false;
  localStorage.removeItem('restaurantData');
  localStorage.removeItem('constructor_menu_data');
};

// Обновление информации о ресторане из дочерних редакторов
const updateRestaurantInfo = (newData: typeof menuStore.restaurantInfo) => {
  menuStore.restaurantInfo = { ...menuStore.restaurantInfo, ...newData };
  syncToTableStorage();
};
</script>

<template>
  <!-- Главная обертка конструктора с динамическим классом светлой темы -->
  <div :class="['constructor-wrapper', { 'light-theme': isLightTheme }]">
    
    <!-- 1. Экран приветствия/импорта (если данные меню еще не загружены) -->
    <div v-if="!hasImported" class="welcome-screen">
      <MenuImport @import-success="handleImportSuccess" />
    </div>

    <!-- 2. Основная рабочая область конструктора (когда меню заполнено) -->
    <div v-else class="constructor-layout">
      
      <!-- ЛЕВАЯ ПАНЕЛЬ: Навигация и переключение вкладок -->
      <aside class="sidebar">
        <div class="sidebar-header">
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
            <!-- Кнопка «Назад» для перехода на главную страницу (в дашборд) -->
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
            <!-- Кнопка переключения темы оформления (Светлая / Темная) -->
            <button class="btn-theme-toggle" @click="toggleTheme" :title="isLightTheme ? 'Включить темную тему' : 'Включить светлую тему'">
              <component :is="isLightTheme ? Moon : Sun" :size="16" stroke-width="2" />
            </button>
          </div>
        </div>
        
        <!-- Меню переключения разделов (Tab Navigation) -->
        <nav class="sidebar-menu">
          <button 
            v-for="tab in ['navigation', 'colors', 'branding', 'general', 'qrcode', 'orders']" 
            :key="tab" 
            class="menu-btn" 
            :class="{ active: activeTab === tab }" 
            @click="activeTab = tab as any"
          >
            <!-- Динамический рендеринг иконки в зависимости от текущей вкладки -->
            <span class="icon" style="display: flex; align-items: center;">
              <UtensilsCrossed v-if="tab === 'navigation'" :size="18" stroke-width="2" />
              <Palette v-else-if="tab === 'colors'" :size="18" stroke-width="2" />
              <Sparkles v-else-if="tab === 'branding'" :size="18" stroke-width="2" />
              <FileText v-else-if="tab === 'general'" :size="18" stroke-width="2" />
              <QrCode v-else-if="tab === 'qrcode'" :size="18" stroke-width="2" />
              <ClipboardList v-else-if="tab === 'orders'" :size="18" stroke-width="2" />
            </span>
            <!-- Динамическое название вкладки -->
            {{ tab === 'navigation' ? 'Навигация и блюда' : tab === 'colors' ? 'Цвета интерфейса' : tab === 'branding' ? 'Брендинг и лого' : tab === 'general' ? 'Общие данные' : tab === 'qrcode' ? 'QR-код меню' : 'Настройка заказов' }}
          </button>
        </nav>

        <!-- Кнопка полного сброса меню -->
        <button @click="resetImport" class="btn-reset-sidebar" style="display: flex; align-items: center; justify-content: center; gap: 6px;">
          <RotateCcw :size="14" stroke-width="2" /> Сбросить и загрузить заново
        </button>
      </aside>

      <!-- ЦЕНТРАЛЬНАЯ ОБЛАСТЬ: Формы редактирования -->
      <main class="editor-area">
        <header class="editor-header">
          <h1 class="tab-title">Настройка раздела</h1>
        </header>

        <div class="editor-content">
          <!-- Редактор блюд и категорий (передает пропсы items и categories, слушает событие авто-обновления) -->
          <MenuEditor 
            v-if="activeTab === 'navigation'" 
            :items="menuStore.items" 
            :categories="menuStore.categories" 
            @update-items="(items) => { menuStore.updateItems(items); syncToTableStorage(); }" 
            @update-categories="(cats) => { menuStore.updateCategories(cats); syncToTableStorage(); }" 
          />
          <!-- Редактор брендинга с двусторонним связыванием через v-model (model-value + update:model-value) -->
          <BrandingEditor v-else-if="activeTab === 'branding'" :model-value="menuStore.restaurantInfo" @update:model-value="updateRestaurantInfo" />
          <!-- Редактор общих данных -->
          <GeneralSettings v-else-if="activeTab === 'general'" :model-value="menuStore.restaurantInfo" @update:model-value="updateRestaurantInfo" />
          <!-- Редактор палитры цветов -->
          <ColorEditor v-else-if="activeTab === 'colors'" :model-value="menuStore.restaurantInfo" @update:model-value="updateRestaurantInfo" />
          <!-- Редактор QR-кода -->
          <QrCodeEditor v-else-if="activeTab === 'qrcode'" :model-value="menuStore.restaurantInfo" @update:model-value="updateRestaurantInfo" />
          <!-- Редактор условий приема заказов -->
          <OrderSettingsEditor v-else-if="activeTab === 'orders'" :model-value="menuStore.restaurantInfo" @update:model-value="updateRestaurantInfo" />
        </div>
      </main>

      <!-- ПРАВАЯ ОБЛАСТЬ: Живой предпросмотр на мокапе смартфона -->
      <section class="preview-area">
        <div class="preview-container">
          <!-- Телефон отображает текущие данные из стора в реальном времени через пропсы -->
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