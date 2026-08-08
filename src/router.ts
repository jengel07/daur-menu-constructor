import { createRouter, createWebHistory } from 'vue-router';
import Constructor from './Constructor.vue';
import AdminView from './views/AdminView.vue';
import ClientView from './views/ClientView.vue'; 
import LoginView from './views/LoginView.vue';
import MenuDataPage from './views/MenuDataPage.vue';

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
      component: MenuDataPage
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