import { ref, computed } from 'vue';

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

// Функция сохранения заказов в хранилище
const saveOrdersToStorage = () => {
  try {
    const data = JSON.stringify(orders.value);
    localStorage.setItem(STORAGE_KEY, data);
    localStorage.setItem('restaurant_orders', data);
    window.dispatchEvent(new Event('orders-local-updated'));
  } catch (e) {
    console.error('Ошибка сохранения заказов:', e);
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

export function useOrders() {
  if (typeof window !== 'undefined') {
    window.removeEventListener('orders-local-updated', handleStorageUpdate as EventListener);
    window.addEventListener('orders-local-updated', handleStorageUpdate as EventListener);
    
    window.removeEventListener('storage', handleWindowStorage);
    window.addEventListener('storage', handleWindowStorage);
  }

  function handleStorageUpdate() {
    const saved = localStorage.getItem('restaurant_orders') || localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (JSON.stringify(parsed) !== JSON.stringify(orders.value)) {
          orders.value = parsed;
        }
      } catch (e) {
        console.error(e);
      }
    }
  }

  function handleWindowStorage(event: StorageEvent) {
    if (event.key === STORAGE_KEY || event.key === 'restaurant_orders') {
      handleStorageUpdate();
    }
  }

  // Счетчики для вкладок хаба. Оба ключа ('open' и 'new') показывают одно и то же число для совместимости с админкой и конструктором
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

  const addOrder = (orderData: {
    items: OrderItem[];
    total?: number;
    type: 'pickup' | 'delivery' | 'onsite';
    customerName?: string;
    customerPhone?: string;
    phone?: string;
    tableNumber?: string;
    address?: string;
    comment?: string;
    scheduledTime?: string;
    createdAt?: string;
  }) => {
    const total = orderData.total !== undefined
      ? orderData.total
      : (orderData.items || []).reduce((sum, item) => sum + item.price * item.quantity, 0);

    const newOrder: Order = {
      id: 'ORD-' + Math.floor(1000 + Math.random() * 9000),
      createdAt: orderData.createdAt || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'new', // Сохраняем как 'new'
      items: orderData.items,
      total,
      type: orderData.type,
      customerName: orderData.customerName,
      customerPhone: orderData.customerPhone || orderData.phone,
      tableNumber: orderData.tableNumber,
      deliveryAddress: orderData.address,
      deliveryTime: orderData.scheduledTime,
      comment: orderData.comment
    };

    orders.value.unshift(newOrder);
    saveOrdersToStorage();
  };

  const updateOrderStatus = (id: string, status: Order['status']) => {
    const order = orders.value.find(o => o.id === id);
    if (order) {
      order.status = status;
      saveOrdersToStorage();
    }
  };

  const clearOrders = () => {
    orders.value = [];
    saveOrdersToStorage();
  };

  const incrementViews = () => {
    totalViews.value += 1;
    localStorage.setItem('yumzi_views', String(totalViews.value));
  };

  const isRestaurantOpen = computed(() => true);

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