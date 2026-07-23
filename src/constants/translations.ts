<script setup lang="ts">
import { ref, computed } from 'vue';
import QrcodeVue from 'qrcode.vue';
import { useOrders } from '../composables/useOrders';
import FloatingSettingsBar from './FloatingSettingsBar.vue';
// Импортируем словари переводов (проверьте путь к файлу, если они лежат в отдельном файле)
import { translations, dishTranslations, categoryTranslations } from '../path-to-your-translations-file';

const props = defineProps<{
  restaurantInfo: any;
  items: any[];
  categories: any[];
}>();

const { addOrder } = useOrders();

const currentScreen = ref<'menu' | 'cart'>('menu');
const activeTab = ref<'menu' | 'qrcode'>('menu');
const activeModal = ref<'none' | 'language' | 'search' | 'filters' | 'share'>('none');
const viewMode = ref<'grid' | 'list'>('grid');
const selectedCategory = ref<string | null>(null);
const searchQuery = ref('');
const selectedLanguage = ref('Русский'); // Текущий выбранный язык
const selectedFilters = ref<string[]>([]);
const isWifiExpanded = ref(false);
const showToast = ref(false);
const toastMessage = ref('');
const shareUrl = ref('https://great-birds-rest.loca.lt');

const cartItems = ref<any[]>([]);

// Динамическое название ресторана с учетом перевода по умолчанию
const currentRestaurantName = computed(() => {
  return props.restaurantInfo.name || t.value.restaurantName;
});

const getItemQuantity = (itemId: number | string) => {
  const found = cartItems.value.find(i => i.id === itemId);
  return found ? found.quantity : 0;
};

const addToCart = (item: any) => {
  const existing = cartItems.value.find(i => i.id === item.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cartItems.value.push({ ...item, quantity: 1 });
  }
};

const increaseQuantity = (itemId: number | string) => {
  const existing = cartItems.value.find(i => i.id === itemId);
  if (existing) existing.quantity += 1;
};

const decreaseQuantity = (itemId: number | string) => {
  const existing = cartItems.value.find(i => i.id === itemId);
  if (existing) {
    if (existing.quantity > 1) {
      existing.quantity -= 1;
    } else {
      cartItems.value = cartItems.value.filter(i => i.id !== itemId);
    }
  }
};

const totalPrice = computed(() => {
  return cartItems.value.reduce((sum, item) => sum + (item.price * item.quantity), 0);
});

const handleCheckout = () => {
  if (cartItems.value.length === 0) return;
  addOrder(cartItems.value, totalPrice.value, 'delivery');
  cartItems.value = [];
  currentScreen.value = 'menu';
  alert('Заказ успешно оформлен и отправлен в дашборд!');
};

const filteredItems = computed(() => {
  return props.items.filter(item => {
    const matchesCategory = selectedCategory.value === null || item.categoryId === selectedCategory.value || item.category === selectedCategory.value;
    const localizedName = getLocalizedItemName(item.name).toLowerCase();
    const matchesSearch = searchQuery.value === '' || localizedName.includes(searchQuery.value.toLowerCase());
    return matchesCategory && matchesSearch;
  });
});

// Реактивный объект локализации интерфейса
const t = computed(() => {
  return translations[selectedLanguage.value] || translations['Русский'];
});

// Функция перевода названия категории
const getLocalizedCategoryName = (name: string) => {
  if (categoryTranslations[name] && categoryTranslations[name][selectedLanguage.value]) {
    return categoryTranslations[name][selectedLanguage.value];
  }
  return name;
};

// Функция перевода названия блюда
const getLocalizedItemName = (name: string) => {
  if (dishTranslations[name] && dishTranslations[name][selectedLanguage.value]) {
    return dishTranslations[name][selectedLanguage.value].name;
  }
  return name;
};

const triggerFileUpload = (_type: string) => {};
const handlePhoneScroll = () => {};
const clearAllFilters = () => { selectedFilters.value = []; };
const toggleFilter = (filter: string) => {
  const idx = selectedFilters.value.indexOf(filter);
  if (idx > -1) selectedFilters.value.splice(idx, 1);
  else selectedFilters.value.push(filter);
};

const copyShareLink = () => {
  navigator.clipboard.writeText(shareUrl.value);
  triggerToast('Ссылка скопирована!');
  activeModal.value = 'none';
};

const shareViaSocial = (network: string) => {
  triggerToast(`Поделиться в ${network}`);
  activeModal.value = 'none';
};

const triggerToast = (msg: string) => {
  toastMessage.value = msg;
  showToast.value = true;
  setTimeout(() => { showToast.value = false; }, 2000);
};

const openPreview = () => {
  window.open(shareUrl.value, '_blank');
};
</script>