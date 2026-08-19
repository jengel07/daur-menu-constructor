/**
 * Централизованный API-клиент
 * Автоматически добавляет JWT-токен и базовый URL из .env
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// ============================================================
// Хелперы для работы с токеном
// ============================================================

export function getToken(): string | null {
  return localStorage.getItem('authToken');
}

export function setToken(token: string): void {
  localStorage.setItem('authToken', token);
}

export function removeToken(): void {
  localStorage.removeItem('authToken');
  localStorage.removeItem('currentUser');
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

// ============================================================
// Базовая функция запроса
// ============================================================

interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { skipAuth = false, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers as Record<string, string> || {}),
  };

  if (!skipAuth) {
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...fetchOptions,
    headers,
  });

  if (response.status === 401 || response.status === 403) {
    // Токен истёк — очищаем данные и редиректим на логин
    removeToken();
    window.location.href = '/login';
    throw new Error('Сессия истекла. Войдите снова.');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(errorData.error || `HTTP ${response.status}`);
  }

  return response.json() as Promise<T>;
}

// ============================================================
// AUTH API
// ============================================================

export const authApi = {
  register: (data: { email: string; password: string; name?: string }) =>
    request<{ success: boolean; token: string; restaurantId: string; name: string }>(
      '/api/auth/register',
      { method: 'POST', body: JSON.stringify(data), skipAuth: true }
    ),

  login: (data: { email: string; password: string }) =>
    request<{ success: boolean; token: string; restaurantId: string; name: string }>(
      '/api/auth/login',
      { method: 'POST', body: JSON.stringify(data), skipAuth: true }
    ),

  refresh: () =>
    request<{ success: boolean; token: string }>('/api/auth/refresh', { method: 'POST' }),
};

// ============================================================
// MENU API
// ============================================================

export const menuApi = {
  get: (restaurantId: string) =>
    request<{
      restaurantInfo: Record<string, unknown>;
      categories: unknown[];
      items: unknown[];
      generalSettings: Record<string, unknown>;
    }>(`/api/menu/${restaurantId}`),

  save: (restaurantId: string, data: {
    info: unknown;
    items: unknown[];
    cats: unknown[];
    generalSettings: unknown;
  }) =>
    request<{ success: boolean }>(`/api/menu/${restaurantId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// ============================================================
// ORDERS API
// ============================================================

export const ordersApi = {
  getAll: () =>
    request<unknown[]>('/api/orders'),

  create: (data: {
    items: unknown[];
    total: number;
    type: string;
    customerName?: string;
    customerPhone?: string;
    tableNumber?: string | number;
    address?: string;
    comment?: string;
    scheduledTime?: string;
  }) =>
    request<{ success: boolean; orderId: string; order: unknown }>('/api/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateStatus: (id: string, status: string) =>
    request<{ success: boolean }>(`/api/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
};

// ============================================================
// STAFF API
// ============================================================

export const staffApi = {
  invite: (email: string, role: string) =>
    request<{ success: boolean; message: string }>('/api/staff/invite', {
      method: 'POST',
      body: JSON.stringify({ email, role }),
    }),
};
