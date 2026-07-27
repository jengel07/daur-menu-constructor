import { createRouter, createWebHistory } from 'vue-router';
import Constructor from './Constructor.vue';
import AdminDashboard from './components/admin/AdminDashboard.vue';
import AdminView from './views/AdminView.vue';
import ClientView from './views/ClientView.vue'; 
import LoginView from './views/LoginView.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { 
      path: '/', 
      redirect: '/dashboard' // <-- Изменено с /login на /dashboard
    },
    { 
      path: '/login', 
      name: 'Login', 
      component: LoginView 
    },
    { 
      path: '/dashboard', 
      name: 'Dashboard', 
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