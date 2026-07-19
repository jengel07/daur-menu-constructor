import { createRouter, createWebHistory } from 'vue-router';
import Constructor from './Constructor.vue';
import MenuPreview from './components/MenuPreview.vue'; // Используем ваш готовый файл

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Constructor },
    { path: '/preview', component: MenuPreview } // Теперь по адресу /preview будет ваш компонент
  ]
});

export default router;