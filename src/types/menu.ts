export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  isAvailable: boolean;
  image?: string;
}

export interface MenuCategory {
  id: string;
  name: string;
}

export interface QrSettings {
  text: string;
  bgColor: string;
  squareColor: string;
  textColor: string;
  textBgColor: string;
  font: string;
}

export interface RestaurantInfo {
  name: string;
  logo?: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  address?: string;
  phone?: string;
  qrCodeUrl?: string;
  wifiName?: string;
  wifiPassword?: string;
  qrSettings?: QrSettings; // Поле для настроек QR-кода
}

export interface MenuState {
  restaurantInfo: RestaurantInfo;
  categories: MenuCategory[];
  items: MenuItem[];
}

// === Типы для работы с заказами ===

export interface OrderItem {
  id: string | number;
  name: string;
  price: number;
  quantity: number;
}

export type OrderType = 'onsite' | 'pickup' | 'delivery';
export type OrderStatus = 'open' | 'progress' | 'done' | 'cancelled';

export interface Order {
  id: number | string;
  type: OrderType;
  status: OrderStatus;
  createdAt: number;
  total: number;
  items: OrderItem[];
  note?: string;
  
  // Дополнительные поля клиента
  tableNumber?: string | number; // Для типа 'onsite'
  customerName?: string;         // Для типа 'pickup' / 'delivery'
  customerPhone?: string;        // Для типа 'pickup' / 'delivery'
  customerEmail?: string;        // Для типа 'pickup' / 'delivery'
  pickupTimeMin?: number;        // Время самовывоза (в минутах)
  deliveryAddress?: string;      // Для типа 'delivery'
  deliveryTime?: string;         // Желаемое время доставки
}