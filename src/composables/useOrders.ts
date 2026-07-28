import { ref, computed, watch, onMounted, onUnmounted } from 'vue';

// Интерфейсы для элементов и заказа
export interface OrderItem {
  id: string | number;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  createdAt: string;
  status: 'new' | 'open' |'progress' | 'done' | 'cancelled';
  items: OrderItem[];
  total: number;
  type: 'pickup' | 'delivery' | 'onsite';
  time?: string;
  tableNumber?: string | number;
  customerName?: string;
  customerPhone?: string;
  deliveryAddress?: string;
  deliveryTime?: string;
  pickupTimeMin?: string | number;
  customerEmail?: string;
  note?: string;
  phone?: string;
  address?: string;
  street?: string;
  comment?: string;
  apartment?: string;
  doorCode?: string;
}

const STORAGE_KEY = 'yumzi_orders';

// Функция загрузки заказов из localStorage
const getInitialOrders = (): Order[] => {
  const savedOrders = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('restaurant_orders');
  if (savedOrders) {
    try {
      return JSON.parse(savedOrders);
    } catch (e) {
      console.error('Ошибка парсинга заказов из localStorage:', e);
    }
  }
  return [
    {
      id: 'ORD-1092',
      createdAt: 'Сегодня, 18:45',
      status: 'new',
      items: [{ id: 1, name: 'Main Menu - Пицца Пепперони', price: 650, quantity: 1 }],
      total: 650,
      type: 'delivery'
    }
  ];
};

// Глобальное состояние заказов
const orders = ref<Order[]>(getInitialOrders());

// Функция принудительного обновления массива из хранилища
const syncOrdersFromStorage = () => {
  const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('restaurant_orders');
  if (saved) {
    try {
      orders.value = JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
  }
};

// Статистика просмотров меню
const totalViews = ref<number>(Number(localStorage.getItem('yumzi_views')) || 4);

// Настройки приема заказов из модального окна
const pickupActive = ref(false);
const pickupTime = ref(25);
const deliveryActive = ref(true);
const deliveryTime = ref(30);
const onsiteActive = ref(false);

const workDays = ref([
  { name: 'Понедельник', active: true },
  { name: 'Вторник', active: true },
  { name: 'Среда', active: true },
  { name: 'Четверг', active: true },
  { name: 'Пятница', active: true },
  { name: 'Суббота', active: true },
  { name: 'Воскресенье', active: false },
]);

// Автосохранение при любых изменениях и генерация события для текущей вкладки
watch(orders, (newVal) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newVal));
  localStorage.setItem('restaurant_orders', JSON.stringify(newVal));
  window.dispatchEvent(new CustomEvent('orders-local-updated'));
}, { deep: true });

watch(totalViews, (newVal) => {
  localStorage.setItem('yumzi_views', String(newVal));
});

export function useOrders() {
  // Обработчики событий синхронизации
  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY || e.key === 'restaurant_orders') {
      syncOrdersFromStorage();
    }
  };

  const handleLocalUpdate = () => {
    syncOrdersFromStorage();
  };

  onMounted(() => {
    // Подписка на события других вкладок
    window.addEventListener('storage', handleStorageChange);
    // Подписка на события внутри этой же вкладки
    window.addEventListener('orders-local-updated', handleLocalUpdate);
  });

  onUnmounted(() => {
    window.removeEventListener('storage', handleStorageChange);
    window.removeEventListener('orders-local-updated', handleLocalUpdate);
  });

  // Счетчики для вкладок хаба
  const stats = computed(() => ({
    new: orders.value.filter(o => o.status === 'new').length,
    progress: orders.value.filter(o => o.status === 'progress').length,
    done: orders.value.filter(o => o.status === 'done').length,
    cancelled: orders.value.filter(o => o.status === 'cancelled').length,
  }));

  // Расширенная функция добавления нового заказа (из корзины)
  const addOrder = (cartItems: OrderItem[], totalSum?: number, type: 'pickup' | 'delivery' | 'onsite' = 'delivery') => {
    const total = totalSum !== undefined 
      ? totalSum 
      : cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const newOrder: Order = {
      id: 'ORD-' + Math.floor(1000 + Math.random() * 9000),
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'new',
      items: cartItems,
      total: total,
      type,
    };
    orders.value.unshift(newOrder);
  };

  

  // Изменение статуса заказа
  const updateOrderStatus = (id: string, status: Order['status']) => {
    const order = orders.value.find(o => o.id === id);
    if (order) {
      order.status = status;
    }
  };

  // Полная очистка истории заказов
  const clearOrders = () => {
    orders.value = [];
  };

  // Увеличение счетчика просмотров статистики
  const incrementViews = () => {
    totalViews.value += 1;
  };

  // Проверка, работает ли заведение прямо сейчас
  const isRestaurantOpen = computed(() => {
    return true; 
  });

  return {
    orders,
    stats,
    totalViews,
    incrementViews,
    pickupActive,
    pickupTime,
    deliveryActive,
    deliveryTime,
    onsiteActive,
    workDays,
    addOrder,
    updateOrderStatus,
    clearOrders,
    isRestaurantOpen,
  };
}