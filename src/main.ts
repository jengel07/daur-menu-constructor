import { createApp } from 'vue';
import './style.css';
import App from './App.vue';
import router from './router'; // Теперь путь правильный, так как файл в src/

const app = createApp(App);

app.use(router); // ЭТА СТРОКА ВАЖНА
app.mount('#app');