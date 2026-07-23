import { ref, computed, watch } from 'vue';

// Интерфейс для заказа
export interface Order {
  id: string;
  createdAt: Date | string;
  status: 'open' | 'progress' | 'done' | 'cancelled';
  items: any[];
  total: number;
  type: 'pickup' | 'delivery' | 'onsite';
}

// Пытаемся загрузить сохраненные заказы из localStorage для синхронизации между вкладками
const savedOrders = localStorage.getItem('restaurant_orders');
const orders = ref<Order[]>(savedOrders ? JSON.parse(savedOrders) : []);

// Автоматически сохраняем при любых изменениях
watch(orders, (newOrders) => {
  localStorage.setItem('restaurant_orders', JSON.stringify(newOrders));
}, { deep: true });

// Настройки заказов из модального окна
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

export function useOrders() {
  // Счетчики для вкладок хаба
  const stats = computed(() => ({
    open: orders.value.filter(o => o.status === 'open').length,
    progress: orders.value.filter(o => o.status === 'progress').length,
    done: orders.value.filter(o => o.status === 'done').length,
    cancelled: orders.value.filter(o => o.status === 'cancelled').length,
  }));

  // Функция добавления нового заказа (из корзины)
  const addOrder = (cartItems: any[], totalSum: number, type: 'pickup' | 'delivery' | 'onsite' = 'delivery') => {
    const newOrder: Order = {
      id: 'ORD-' + Math.floor(1000 + Math.random() * 9000),
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'open',
      items: cartItems,
      total: totalSum,
      type,
    };
    orders.value.unshift(newOrder);
  };

  // Изменение статуса заказа
  const updateOrderStatus = (orderId: string, newStatus: Order['status']) => {
    const order = orders.value.find(o => o.id === orderId);
    if (order) {
      order.status = newStatus;
    }
  };

  // Полная очистка истории заказов
  const clearOrders = () => {
    orders.value = [];
  };

  // Проверка, работает ли заведение прямо сейчас
  const isRestaurantOpen = computed(() => {
    return true; 
  });

  return {
    orders,
    stats,
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