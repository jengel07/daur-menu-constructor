<script setup lang="ts">
import { ref, reactive, nextTick, watch, onMounted } from 'vue';
import MenuImport from './components/MenuImport.vue';
import MenuEditor from './components/MenuEditor.vue';
import BrandingEditor from './components/BrandingEditor.vue';
import GeneralSettings from './components/GeneralSettings.vue';
import ColorEditor from './components/ColorEditor.vue';
import QrCodeEditor from './components/QrCodeEditor.vue';
import QrcodeVue from 'qrcode.vue'; 

import type { MenuItem, MenuCategory, RestaurantInfo } from './types/menu';

const activeTab = ref<'navigation' | 'colors' | 'branding' | 'general' | 'qrcode'>('navigation');
const brandingEditorRef = ref<any>(null);
const isWifiExpanded = ref(false);
const showToast = ref(false);

const categories = ref<MenuCategory[]>([]);
const items = ref<MenuItem[]>([]);
const hasImported = ref(false);

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

// Автоматическое сохранение данных в localStorage при любых изменениях
watch([restaurantInfo, items, categories], () => {
  localStorage.setItem('restaurantData', JSON.stringify({
    info: restaurantInfo,
    items: items.value,
    cats: categories.value,
    hasImported: hasImported.value
  }));
}, { deep: true });

// Загрузка данных при старте
onMounted(() => {
  const savedData = localStorage.getItem('restaurantData');
  if (savedData) {
    const parsed = JSON.parse(savedData);
    Object.assign(restaurantInfo, parsed.info);
    items.value = parsed.items;
    categories.value = parsed.cats;
    hasImported.value = parsed.hasImported;
  }
});

// Обновленная функция для открытия предпросмотра в новой вкладке
const openPreview = () => {
  // Браузер перейдет по адресу /preview, 
  // а роутер подставит туда ваш MenuPreview.vue
  window.open('/preview', '_blank');
};

const openAndCopy = () => {
  const link = "https://great-birds-rest.loca.lt";
  navigator.clipboard.writeText(link);
  window.open(link, '_blank');
  showToast.value = true;
  setTimeout(() => { showToast.value = false; }, 3000);
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
        <!-- Кнопка с обновленным вызовом функции -->
        <button class="preview-copy-btn" @click="openPreview">🔗 Предпросмотр</button>
        
        <div class="phone-mockup">
          <div class="phone-screen">
            <div class="phone-header" @click="triggerFileUpload('cover')" :style="{ cursor: 'pointer', backgroundColor: restaurantInfo.secondaryColor, backgroundImage: restaurantInfo.coverImage ? `url(${restaurantInfo.coverImage})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center' }">
              <div class="phone-avatar-wrapper">
                <div class="phone-avatar-placeholder" @click.stop="triggerFileUpload('avatar')" style="cursor: pointer;">
                  <span v-if="!restaurantInfo.avatarImage">🍽️</span>
                  <img v-else :src="restaurantInfo.avatarImage" alt="Аватар" style="width: 100%; height: 100%; object-fit: cover;" />
                </div>
              </div>
              <div class="phone-logo">{{ restaurantInfo.name }}</div>
            </div>
            
            <div class="phone-body" :style="{ backgroundColor: restaurantInfo.backgroundColor, color: restaurantInfo.textColor }">
              <div v-if="activeTab === 'qrcode'" class="phone-qr-preview">
                <div class="qr-placeholder" :style="{ backgroundColor: restaurantInfo.qrSettings.bgColor }">
                  <QrcodeVue :value="'https://great-birds-rest.loca.lt'" :size="180" :background="restaurantInfo.qrSettings.bgColor" :foreground="restaurantInfo.qrSettings.squareColor" level="H" />
                  <div class="qr-label" :style="{ color: restaurantInfo.qrSettings.textColor, fontFamily: restaurantInfo.qrSettings.font }">
                    {{ restaurantInfo.qrSettings.text }}
                  </div>
                </div>
              </div>
              <div v-else>
                <div v-if="restaurantInfo.isWifiEnabled" class="phone-wifi-btn" @click="isWifiExpanded = !isWifiExpanded">
                  <div class="wifi-icon-box">ℹ️</div>
                  <div class="wifi-label">
                    <div class="title">Информация WiFi</div>
                    <div v-if="isWifiExpanded" class="subtitle" style="margin-top: 5px;">
                      <div>Сеть: {{ restaurantInfo.wifiName || 'Не задано' }}</div>
                      <div style="font-weight: bold; margin-top: 2px;">Пароль: {{ restaurantInfo.wifiPassword || 'Не задан' }}</div>
                    </div>
                  </div>
                  <div class="chevron" :style="{ transform: isWifiExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }">›</div>
                </div>
                <div class="phone-categories">
                  <span v-for="cat in categories" :key="cat.id" class="phone-cat-badge" :style="{ backgroundColor: restaurantInfo.primaryColor }">{{ cat.name }}</span>
                </div>
                <div class="menu-items-grid-phone">
                  <div v-for="item in items.filter(i => i.isAvailable)" :key="item.id" class="menu-card">
                    <img :src="item.image || 'placeholder.jpg'" alt="Блюдо" />
                    <div class="card-content">
                      <h3>{{ item.name }}</h3>
                      <div class="price">RUB {{ item.price }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="showToast" class="toast-notification">
          Ссылка скопирована в буфер!
        </div>
      </div>
    </section>
  </div>
</template>

<style>
/* Стили остаются без изменений */
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
.toast-notification { position: absolute; bottom: -50px; background: #333; color: white; padding: 8px 16px; border-radius: 6px; font-size: 12px; z-index: 999; }
.phone-mockup { width: 310px; height: 620px; background: #000; border: 10px solid #2a2a2a; border-radius: 40px; overflow: hidden; position: relative; }
.phone-header { height: 120px; display: flex; flex-direction: column; justify-content: center; align-items: center; position: relative; color: white; text-align: center; }
.phone-body { height: 500px; padding: 16px; overflow-y: auto; }
.phone-avatar-wrapper { width: 60px; height: 60px; border-radius: 50%; border: 3px solid #000; background: #333; overflow: hidden; margin-bottom: 5px; }
.phone-avatar-placeholder { width: 100%; height: 100%; display: flex; justify-content: center; align-items: center; }
.phone-logo { font-weight: bold; font-size: 14px; text-shadow: 0 0 4px rgba(0,0,0,0.5); }
.phone-categories { display: flex; gap: 5px; margin-bottom: 10px; overflow-x: auto; }
.phone-cat-badge { padding: 4px 8px; border-radius: 12px; font-size: 10px; white-space: nowrap; }
.menu-items-grid-phone { display: grid !important; grid-template-columns: repeat(2, 1fr) !important; gap: 8px !important; padding: 8px !important; }
.menu-card { background: #ffffff; border-radius: 12px; overflow: hidden; }
.menu-card img { width: 100%; height: 70px; object-fit: cover; }
.card-content { padding: 6px; }
.card-content h3 { font-size: 11px; color: #000; margin: 0; }
.price { font-weight: bold; color: #2c7a7b; font-size: 11px; margin-top: 4px; }
.phone-wifi-btn { background: #dcece823; color: #fafafa; padding: 12px 16px; border-radius: 12px; display: flex; align-items: center; gap: 12px; margin-bottom: 15px; cursor: pointer; transition: background 0.2s; }
.phone-qr-preview { display: flex; justify-content: center; align-items: center; height: 100%; }
.qr-placeholder { padding: 20px; border-radius: 12px; text-align: center; width: 80%; display: flex; flex-direction: column; align-items: center; }
.qr-label { font-weight: bold; font-size: 14px; margin-top: 10px; }
</style>