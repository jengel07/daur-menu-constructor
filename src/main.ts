import { createApp } from 'vue';
import { createPinia } from 'pinia'; // 1. Импортируем Pinia
import './style.css';
import App from './App.vue';
import router from './router';

const app = createApp(App);
const pinia = createPinia(); // 2. Создаем экземпляр Pinia

app.use(pinia); // 3. Обязательно подключаем Pinia ДО роутера
app.use(router); 

app.mount('#app');