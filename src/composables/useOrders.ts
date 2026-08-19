import { ref, computed, onMounted } from 'vue';
import { ordersApi } from '../api';

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
  status: 'new' | 'open' | 'progress' | 'done' | 'cancelled';
  items: OrderItem[];
  total: number;
  totalPrice?: number;
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

// Глобальное состояние заказов
const orders = ref<Order[]>([]);
const isLoading = ref(false);

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

// Загрузка заказов с сервера
const fetchOrders = async () => {
  try {
    isLoading.value = true;
    const data = await ordersApi.getAll() as any[];
    // Нормализуем поле total (бэкенд возвращает totalPrice)
    orders.value = data.map((o: any) => ({
      ...o,
      total: Number(o.totalPrice ?? o.total ?? 0),
    }));
  } catch (err) {
    console.error('Ошибка загрузки заказов из API:', err);
  } finally {
    isLoading.value = false;
  }
};

// Автообновление каждые 15 секунд
let pollInterval: any = null;

export function useOrders() {
  // Счетчики для вкладок хаба
  const stats = computed(() => {
    const newOrOpenCount = orders.value.filter(o => o.status === 'new' || o.status === 'open').length;
    return {
      new: newOrOpenCount,
      open: newOrOpenCount,
      progress: orders.value.filter(o => o.status === 'progress').length,
      done: orders.value.filter(o => o.status === 'done').length,
      cancelled: orders.value.filter(o => o.status === 'cancelled').length,
    };
  });

  const updateOrderStatus = async (id: string, status: Order['status']) => {
    // Оптимистичное обновление UI
    const order = orders.value.find(o => o.id === id);
    if (order) order.status = status;

    try {
      await ordersApi.updateStatus(id, status);
    } catch (err) {
      console.error('Ошибка обновления статуса:', err);
      // Откатываем при ошибке
      await fetchOrders();
    }
  };

  const clearOrders = () => {
    orders.value = [];
  };

  const refreshOrders = () => fetchOrders();

  // Запускаем загрузку и polling при первом вызове
  onMounted(() => {
    fetchOrders();
    if (!pollInterval) {
      pollInterval = setInterval(fetchOrders, 15000);
    }
  });

  const totalViews = ref<number>(Number(localStorage.getItem('yumzi_views')) || 4);
  const incrementViews = () => {
    totalViews.value += 1;
    localStorage.setItem('yumzi_views', String(totalViews.value));
  };

  const isRestaurantOpen = computed(() => true);

  return {
    orders,
    stats,
    isLoading,
    totalViews,
    incrementViews,
    pickupActive,
    pickupTime,
    deliveryActive,
    deliveryTime,
    onsiteActive,
    workDays,
    updateOrderStatus,
    clearOrders,
    refreshOrders,
    isRestaurantOpen,
  };
}