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
}

export interface MenuState {
  restaurantInfo: RestaurantInfo;
  categories: MenuCategory[];
  items: MenuItem[];
}