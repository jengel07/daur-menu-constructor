import { createRouter, createWebHistory } from 'vue-router';
import Constructor from './Constructor.vue';
import AdminDashboard from './components/admin/AdminDashboard.vue';
import AdminView from './views/AdminView.vue';
import ClientView from './views/ClientView.vue'; // Импортируйте ваш клиентский компонент (путь может отличаться)

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { 
      path: '/', 
      name: 'Home', 
      component: AdminDashboard 
    },
    { 
      path: '/constructor', 
      name: 'Constructor', 
      component: Constructor 
    },
    { 
      path: '/admin', 
      name: 'Admin', 
      component: AdminView 
    },
    { 
      path: '/client', 
      name: 'ClientPreview', 
      component: ClientView 
    }
  ]
});

export default router;