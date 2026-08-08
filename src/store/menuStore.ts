import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import type { RestaurantInfo, MenuCategory, MenuItem } from '../types/menu';

export const useMenuStore = defineStore('menu', () => {
  const restaurantInfo = ref<RestaurantInfo>({
    name: 'Ресторан',
    primaryColor: '#646cff',
    secondaryColor: '#333',
    backgroundColor: '#1a1a1a',
    textColor: '#ffffff',
    isWifiEnabled: true,
    wifiName: '',
    wifiPassword: ''
  });

  const categories = ref<MenuCategory[]>([]);
  const items = ref<MenuItem[]>([]);

  const generalSettings = ref({
    wifiEnabled: true,
    wifiSsid: '',
    wifiPassword: ''
  });

  let isInitializing = true;
  let pollInterval: any = null;

  // Загрузка данных с сервера (Node.js + PostgreSQL/Prisma)
  const loadFromServer = async () => {
    isInitializing = true;
    try {
      const response = await fetch('http://192.168.31.240:3000/api/menu');
      const data = await response.json();
      
      if (data) {
        if (data.restaurantInfo) {
          restaurantInfo.value = { ...restaurantInfo.value, ...data.restaurantInfo };
        } else if (data.info) {
          restaurantInfo.value = { ...restaurantInfo.value, ...data.info };
        }

        if (data.categories) categories.value = data.categories;
        else if (data.cats) categories.value = data.cats;

        if (data.items) items.value = data.items;

        if (data.generalSettings) {
          generalSettings.value = { ...generalSettings.value, ...data.generalSettings };
        } else if (restaurantInfo.value.isWifiEnabled !== undefined) {
          generalSettings.value.wifiEnabled = restaurantInfo.value.isWifiEnabled;
          generalSettings.value.wifiSsid = restaurantInfo.value.wifiName || '';
          generalSettings.value.wifiPassword = restaurantInfo.value.wifiPassword || '';
        }
      }
    } catch (error) {
      console.error('Ошибка загрузки с сервера, используем localStorage:', error);
      
      const savedState = localStorage.getItem('restaurantData');
      if (savedState) {
        try {
          const parsed = JSON.parse(savedState);
          if (parsed.restaurantInfo) {
            restaurantInfo.value = { ...restaurantInfo.value, ...parsed.restaurantInfo };
          } else if (parsed.info) {
            restaurantInfo.value = { ...restaurantInfo.value, ...parsed.info };
          }
          if (parsed.categories) categories.value = parsed.categories;
          else if (parsed.cats) categories.value = parsed.cats;
          if (parsed.items) items.value = parsed.items;
          if (parsed.generalSettings) {
            generalSettings.value = { ...generalSettings.value, ...parsed.generalSettings };
          }
        } catch (e) {
          console.error('Ошибка парсинга restaurantData', e);
        }
      }

      const savedSettings = localStorage.getItem('generalSettings');
      if (savedSettings) {
        try {
          generalSettings.value = { ...generalSettings.value, ...JSON.parse(savedSettings) };
        } catch (e) {
          console.error('Ошибка парсинга generalSettings', e);
        }
      }
    } finally {
      restaurantInfo.value.isWifiEnabled = generalSettings.value.wifiEnabled;
      restaurantInfo.value.wifiName = generalSettings.value.wifiSsid;
      restaurantInfo.value.wifiPassword = generalSettings.value.wifiPassword;
      isInitializing = false;
    }
  };

  // Фоновый опрос сервера каждые 2 секунды для синхронизации с телефоном
  const startPolling = () => {
    if (pollInterval) clearInterval(pollInterval);
    
    pollInterval = setInterval(async () => {
      try {
        const response = await fetch('http://192.168.31.240:3000/api/menu');
        const data = await response.json();
        
        if (data) {
          isInitializing = true;
          if (data.restaurantInfo || data.info) {
            restaurantInfo.value = { ...restaurantInfo.value, ...(data.restaurantInfo || data.info) };
          }
          if (data.categories || data.cats) {
            categories.value = data.categories || data.cats;
          }
          if (data.items) {
            items.value = data.items;
          }
          if (data.generalSettings) {
            generalSettings.value = { ...generalSettings.value, ...data.generalSettings };
          }
          isInitializing = false;
        }
      } catch (e) {
        // Игнорируем сетевые ошибки при опросе
      }
    }, 2000);
  };

  loadFromServer();
  startPolling();

  // Отправка данных на сервер (сохранение в БД через Prisma)
  const syncToServer = async (data: any) => {
    try {
      await fetch('http://192.168.31.240:3000/api/menu', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error('Ошибка синхронизации с сервером:', error);
    }
  };

  const updateItems = (newItems: typeof items.value) => {
    items.value = newItems;
  };

  const updateCategories = (newCategories: typeof categories.value) => {
    categories.value = newCategories;
  };

  // Следим за изменениями, пишем в localStorage и отправляем на сервер в базу
  watch(
    [restaurantInfo, categories, items, generalSettings],
    () => {
      if (isInitializing) return;

      restaurantInfo.value.isWifiEnabled = generalSettings.value.wifiEnabled;
      restaurantInfo.value.wifiName = generalSettings.value.wifiSsid;
      restaurantInfo.value.wifiPassword = generalSettings.value.wifiPassword;

      const dataToSave = {
        restaurantInfo: restaurantInfo.value,
        items: items.value,
        categories: categories.value,
        generalSettings: generalSettings.value,
        info: restaurantInfo.value,
        cats: categories.value
      };
      
      localStorage.setItem('restaurantData', JSON.stringify(dataToSave));
      localStorage.setItem('generalSettings', JSON.stringify(generalSettings.value));
      localStorage.setItem('preview_generalSettings', JSON.stringify(generalSettings.value));
      localStorage.setItem('preview_restaurantInfo', JSON.stringify(restaurantInfo.value));
      localStorage.setItem('preview_items', JSON.stringify(items.value));
      localStorage.setItem('preview_categories', JSON.stringify(categories.value));

      localStorage.setItem('saved_menu', JSON.stringify({
        categoriesCount: categories.value.length,
        itemsCount: items.value.length
      }));
      
      syncToServer(dataToSave);
    },
    { deep: true }
  );

  return {
    restaurantInfo,
    categories,
    items,
    generalSettings,
    updateItems,
    updateCategories,
    loadFromServer,
    startPolling
  };
});