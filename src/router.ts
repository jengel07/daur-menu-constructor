import { createRouter, createWebHistory } from 'vue-router';
import Constructor from './Constructor.vue';
import AdminView from './views/AdminView.vue';
import ClientView from './views/ClientView.vue'; 
import LoginView from './views/LoginView.vue';
import MenuDataPage from './views/MenuDataPage.vue';
import KitchenOrders from './views/KitchenOrders.vue';
import SuperAdminView from './views/SuperAdminView.vue';
import { isAuthenticated, getUserRole } from './api';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { 
      path: '/', 
      redirect: '/constructor'
    },
    { 
      path: '/login', 
      name: 'Login', 
      component: LoginView 
    },
    { 
      path: '/dashboard', 
      redirect: '/constructor'
    },
    {
      path: '/menu-data', 
      name: 'MenuData',
      component: MenuDataPage,
      meta: { requiresAuth: true, adminOnly: true },
    },
    { 
      path: '/constructor', 
      name: 'Constructor', 
      component: Constructor,
      meta: { requiresAuth: true, adminOnly: true },
    },
    { 
      path: '/admin', 
      name: 'Admin', 
      component: AdminView,
      meta: { requiresAuth: true, adminOnly: true },
    },
    { 
      path: '/client', 
      name: 'ClientPreview', 
      component: ClientView 
    },
    {
      path: '/kitchen-orders',
      name: 'KitchenOrders',
      component: KitchenOrders,
      meta: { requiresAuth: true },
    },
    {
      path: '/super-admin',
      name: 'SuperAdmin',
      component: SuperAdminView,
      meta: { requiresAuth: true, superAdminOnly: true },
    },
  ]
});

// ============================================================
// Навигационный guard — защита ролей
// ============================================================

// 🔴 ВАЖНО: УКАЖИТЕ ЗДЕСЬ СВОЙ ЛИЧНЫЙ EMAIL СУПЕРАДМИНА
const SUPER_ADMIN_EMAIL = 'geller.9797@mail.ru';

router.beforeEach((to, _from, next) => {
  const authenticated = isAuthenticated();
  const role = getUserRole(); // 'admin' | 'cook' | 'waiter' | null
  const isStaffRole = role === 'cook' || role === 'waiter';

  // Достаем email текущего пользователя из localStorage
  let userEmail = '';
  if (authenticated) {
    try {
      const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
      userEmail = user.email || '';
    } catch (e) {
      console.error('Ошибка чтения данных пользователя');
    }
  }

  const isSuperAdmin = userEmail === SUPER_ADMIN_EMAIL;

  // 1. Маршрут требует авторизации, а пользователь не вошёл
  if (to.meta.requiresAuth && !authenticated) {
    return next('/login');
  }

  // 2. Защита маршрута Суперадмина (чтобы чужие админы не зашли)
  if (to.meta.superAdminOnly && !isSuperAdmin) {
    return next('/constructor'); // Выкидываем обычных пользователей обратно в конструктор
  }

  // 3. Администраторский маршрут — персонал перенаправляется на экран заказов
  if (to.meta.adminOnly && isStaffRole) {
    return next('/kitchen-orders');
  }

  // 4. Авторизованный пользователь случайно зашел на страницу логина
  if (to.path === '/login' && authenticated) {
    if (isSuperAdmin) {
      return next('/super-admin'); // Выкидываем суперадмина в его панель
    }
    return next(isStaffRole ? '/kitchen-orders' : '/constructor');
  }

  next();
});

export default router;