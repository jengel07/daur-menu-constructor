import { defineStore } from 'pinia';
import { ref, watch } from 'vue';

export const useMenuStore = defineStore('menu', () => {
  const savedState = localStorage.getItem('restaurantData');
  const parsed = savedState ? JSON.parse(savedState) : {};

  const restaurantInfo = ref(parsed.info || {
    name: 'Ресторан',
    primaryColor: '#646cff',
    secondaryColor: '#333',
    backgroundColor: '#1a1a1a',
    textColor: '#ffffff'
  });

  const categories = ref(parsed.cats || []);
  const items = ref(parsed.items || []);

  // Следим за любыми изменениями и сразу пишем в localStorage
  watch(
    [restaurantInfo, categories, items],
    () => {
      const dataToSave = {
        info: restaurantInfo.value,
        items: items.value,
        cats: categories.value
      };
      localStorage.setItem('restaurantData', JSON.stringify(dataToSave));
    },
    { deep: true }
  );

  return {
    restaurantInfo,
    categories,
    items
  };
});