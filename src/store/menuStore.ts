import { defineStore } from 'pinia';
import { ref, watch } from 'vue';

export const useMenuStore = defineStore('menu', () => {
  const restaurantInfo = ref({
    name: 'Ресторан',
    primaryColor: '#646cff',
    secondaryColor: '#333',
    backgroundColor: '#1a1a1a',
    textColor: '#ffffff',
    isWifiEnabled: true,
    wifiName: '',
    wifiPassword: ''
  });

  const categories = ref<any[]>([]);
  const items = ref<any[]>([]);

  // Используем ref для generalSettings, чтобы избежать проблем с мутациями reactive
  const generalSettings = ref({
    wifiEnabled: true,
    wifiSsid: '',
    wifiPassword: ''
  });

  let isInitializing = true;

  // Функция загрузки данных с сервера или localStorage
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
      console.error('Ошибка загрузки меню с сервера, используем локальные данные:', error);
      
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
      // Синхронизируем состояние обратно в restaurantInfo после загрузки
      restaurantInfo.value.isWifiEnabled = generalSettings.value.wifiEnabled;
      restaurantInfo.value.wifiName = generalSettings.value.wifiSsid;
      restaurantInfo.value.wifiPassword = generalSettings.value.wifiPassword;
      isInitializing = false;
    }
  };

  // Инициализируем данные при создании стора
  loadFromServer();

  // Функция отправки данных на сервер
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
      console.error('Ошибка синхронизации с Node.js сервером:', error);
    }
  };

  // Функция обновления списка блюд
  const updateItems = (newItems: typeof items.value) => {
    items.value = newItems;
  };

  // Функция обновления категорий
  const updateCategories = (newCategories: typeof categories.value) => {
    categories.value = newCategories;
  };

  // Следим за изменениями и пишем в localStorage + отправляем на сервер
  watch(
    [restaurantInfo, categories, items, generalSettings],
    () => {
      if (isInitializing) return;

      // Держим поля в актуальном состоянии
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
    loadFromServer
  };
});