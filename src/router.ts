import { createRouter, createWebHistory } from 'vue-router';
import Constructor from './Constructor.vue';
import MenuPreview from './components/MenuPreview.vue';
import AdminView from './views/AdminView.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { 
      path: '/', 
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
      component: AdminView 
    },
  ]
});

export default router;