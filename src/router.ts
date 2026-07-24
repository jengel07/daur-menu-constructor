import { createRouter, createWebHistory } from 'vue-router';
import Constructor from './Constructor.vue';
import MenuPreview from './components/MenuPreview.vue';
import AdminDashboard from './components/admin/AdminDashboard.vue';
import AdminView from './views/AdminView.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { 
      path: '/', 
      name: 'Home', 
      component: AdminDashboard // Главная страница — дашборд
    },
    { 
      path: '/constructor', 
      name: 'Constructor', 
      component: Constructor 
    },
    { 
      path: '/preview', 
      name: 'Preview', 
      component: MenuPreview 
    },
    { 
      path: '/admin', 
      name: 'Admin', 
      component: AdminView // Страница заказов (канбан)
    },
  ]
});

export default router;