import { defineStore } from 'pinia';
import { ref, watch } from 'vue';

export const useMenuStore = defineStore('menu', () => {
  const restaurantInfo = ref({
    name: 'Ресторан',
    primaryColor: '#646cff',
    secondaryColor: '#333',
    backgroundColor: '#1a1a1a',
    textColor: '#ffffff'
  });

  const categories = ref<any[]>([]);
  const items = ref<any[]>([]);

  // Функция загрузки данных с Node.js бэкенда при старте
  const loadFromServer = async () => {
    try {
      const response = await fetch('http://192.168.31.240:3000/api/menu');
      const data = await response.json();
      
      if (data) {
        if (data.restaurantInfo) restaurantInfo.value = data.restaurantInfo;
        else if (data.info) restaurantInfo.value = data.info;

        if (data.categories) categories.value = data.categories;
        else if (data.cats) categories.value = data.cats;

        if (data.items) items.value = data.items;
      }
    } catch (error) {
      console.error('Ошибка загрузки меню с сервера, используем локальные данные:', error);
      // Запасной вариант — читаем из localStorage, если сервер недоступен
      const savedState = localStorage.getItem('restaurantData');
      if (savedState) {
        const parsed = JSON.parse(savedState);
        if (parsed.restaurantInfo) restaurantInfo.value = parsed.restaurantInfo;
        else if (parsed.info) restaurantInfo.value = parsed.info;

        if (parsed.categories) categories.value = parsed.categories;
        else if (parsed.cats) categories.value = parsed.cats;

        if (parsed.items) items.value = parsed.items;
      }
    }
  };

  // Вызываем загрузку при инициализации стора
  loadFromServer();

  // Функция отправки данных на Node.js бэкенд
  const syncToServer = async (data: { restaurantInfo: any; items: any; categories: any }) => {
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

  // Следим за любыми изменениями и пишем в localStorage + отправляем на Node.js сервер
  watch(
    [restaurantInfo, categories, items],
    () => {
      const dataToSave = {
        restaurantInfo: restaurantInfo.value,
        items: items.value,
        categories: categories.value,
        // дублируем для обратной совместимости со старыми ключами сервера, если нужно
        info: restaurantInfo.value,
        cats: categories.value
      };
      
      // Сохраняем локально
      localStorage.setItem('restaurantData', JSON.stringify(dataToSave));
      
      // Отправляем на бэкенд
      syncToServer(dataToSave);
    },
    { deep: true }
  );

  return {
    restaurantInfo,
    categories,
    items,
    updateItems,
    updateCategories,
    loadFromServer
  };
});