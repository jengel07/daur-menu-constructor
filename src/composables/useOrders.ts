import { ref, computed, watch } from 'vue';

// Интерфейсы для элементов и заказа
export interface OrderItem {
  id: string | number;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  createdAt: string | Date;
  status: 'open' | 'progress' | 'done' | 'cancelled';
  items: OrderItem[];
  total: number;
  type: 'pickup' | 'delivery' | 'onsite';
}

// Глобальное состояние заказов с синхронизацией через localStorage
const savedOrders = localStorage.getItem('yumzi_orders') || localStorage.getItem('restaurant_orders');
const initialOrders: Order[] = savedOrders ? JSON.parse(savedOrders) : [
  {
    id: 'ORD-1092',
    createdAt: 'Сегодня, 18:45',
    status: 'open',
    items: [{ id: 1, name: 'Main Menu - Пицца Пепперони', price: 650, quantity: 1 }],
    total: 650,
    type: 'delivery'
  }
];

const orders = ref<Order[]>(initialOrders);

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

// Автосохранение при любых изменениях
watch(orders, (newVal) => {
  localStorage.setItem('yumzi_orders', JSON.stringify(newVal));
  localStorage.setItem('restaurant_orders', JSON.stringify(newVal));
}, { deep: true });

watch(totalViews, (newVal) => {
  localStorage.setItem('yumzi_views', String(newVal));
});

export function useOrders() {
  // Счетчики для вкладок хаба
  const stats = computed(() => ({
    open: orders.value.filter(o => o.status === 'open').length,
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
      status: 'open',
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