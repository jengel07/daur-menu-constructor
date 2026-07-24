<template>
  <div class="yumzi-dashboard" :class="{ 'light-theme': !isDarkMode }">
    <!-- Шапка с приветствием -->
    <header class="dash-header">
      <div class="brand-logo">Daur Menu</div>
      <div class="greeting-box">
        <h2>Добрый вечер, Дженифер! 🌙</h2>
        <p class="subtitle">Что вы планируете сегодня?</p>
      </div>
      <div class="header-actions">
        <button class="btn-theme-toggle" @click="toggleTheme" :title="isDarkMode ? 'Включить светлую тему' : 'Включить темную тему'">
          {{ isDarkMode ? '☀️' : '🌙' }}
        </button>
        <button class="btn-refresh" @click="handleRefresh">Обновить</button>
      </div>
    </header>

    <!-- Поиск шефа / AI-ассистент -->
    <div class="search-shef-bar">
      <span class="shef-icon">✨</span>
      <input type="text" placeholder="Спросите Шефа..." readonly />
      <span class="arrow-icon">→</span>
    </div>

    <!-- Секция операционных карточек -->
    <section class="section-block">
      <span class="section-title">ОПЕРАЦИИ</span>
      <div class="operations-grid">
        <div class="op-card" @click="openRoute('/constructor')">
          <div class="op-icon digital">📱</div>
          <h3>Цифровое</h3>
          <p>Настроить QR-код меню</p>
        </div>
        <div class="op-card" @click="openRoute('/constructor')">
          <div class="op-icon data">田</div>
          <h3>Данные</h3>
          <p>Массовое управление данными меню</p>
        </div>
        <div class="op-card" @click="openRoute('/admin')">
          <div class="op-icon orders">📋</div>
          <h3>Центр заказов</h3>
          <p>Управление входящими заказами</p>
        </div>
      </div>
    </section>

    <!-- Секция меню -->
    <section class="section-block">
      <div class="section-header-row">
        <span class="section-title">МЕНЮ</span>
      </div>
      <div class="menu-items-list">
        <div class="menu-row-card" v-for="(menu, idx) in menus" :key="idx">
          <div class="menu-row-left">
            <span class="drag-dots">⋮⋮</span>
            <span class="status-dot" :class="{ active: menu.isActive }"></span>
            <div class="menu-info-text">
              <h4>{{ menu.name }}</h4>
              <p>{{ menu.isActive ? 'Всегда доступно' : 'Скрыто' }} • {{ menu.categories }} категорий • {{ menu.items }} позиций</p>
            </div>
          </div>
          <div class="menu-row-right">
            <button class="icon-arrow" @click="openRoute('/constructor')">→</button>
            
            <!-- Контейнер для трех точек и выпадающего меню -->
            <div class="menu-actions-wrapper" @click.stop>
              <span class="menu-dots" @click="toggleDropdown(idx)">⋮</span>
              
              <div class="dropdown-menu" v-if="activeDropdown === idx">
                <div class="dropdown-item" @click="renameMenu(idx)">
                  <span>✏️</span> Редактировать название
                </div>
                <div class="dropdown-item" @click="toggleAvailability(idx)">
                  <span>👁️</span> Доступность
                </div>
                <div class="dropdown-item" @click="duplicateMenu(idx)">
                  <span>📋</span> Дублировать
                </div>
                <div class="dropdown-item delete" @click="deleteMenu(idx)">
                  <span>🗑️</span> Удалить
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
      <button class="btn-new-menu" @click="addNewMenu">+ Новое меню</button>
    </section>

    <!-- Секция статистики -->
    <section class="section-block">
      <div class="stat-header-row">
        <span class="section-title">СТАТИСТИКА</span>
        <span class="stat-counter">4 Всего просмотров</span>
      </div>
      <div class="stat-card-banner">
        <div class="progress-circle-box">
          <div class="circle-progress">4/10</div>
        </div>
        <p>Дженифер, осталось всего 6 посетителей, чтобы открыть полную статистику — верим в вас 😄</p>
        <button class="btn-lock-stat" disabled>🔒 Посмотреть полную статистику</button>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const isDarkMode = ref(true);

// Состояние меню с поддержкой реактивности для работы модалок/действий
const menus = ref([
  { name: 'Main Menu', categories: 12, items: 115, isActive: true },
  { name: 'Main Menu', categories: 5, items: 36, isActive: true }
]);

const activeDropdown = ref<number | null>(null);

const toggleTheme = () => {
  isDarkMode.value = !isDarkMode.value;
};

const openRoute = (path: string) => {
  router.push(path);
};

const handleRefresh = () => {
  window.location.reload();
};

const toggleDropdown = (idx: number) => {
  activeDropdown.value = activeDropdown.value === idx ? null : idx;
};

const closeDropdowns = () => {
  activeDropdown.value = null;
};

onMounted(() => {
  window.addEventListener('click', closeDropdowns);
});

onUnmounted(() => {
  window.removeEventListener('click', closeDropdowns);
});

// Функционал для пунктов меню
const renameMenu = (idx: number) => {
  closeDropdowns();
  const newName = prompt('Введите новое название меню:', menus.value[idx].name);
  if (newName && newName.trim()) {
    menus.value[idx].name = newName.trim();
  }
};

const toggleAvailability = (idx: number) => {
  closeDropdowns();
  menus.value[idx].isActive = !menus.value[idx].isActive;
};

const duplicateMenu = (idx: number) => {
  closeDropdowns();
  const target = menus.value[idx];
  menus.value.push({
    name: `${target.name} (Копия)`,
    categories: target.categories,
    items: target.items,
    isActive: target.isActive
  });
};

const deleteMenu = (idx: number) => {
  closeDropdowns();
  if (confirm('Вы действительно хотите удалить это меню?')) {
    menus.value.splice(idx, 1);
  }
};

const addNewMenu = () => {
  const name = prompt('Введите название нового меню:', 'Новое меню');
  if (name && name.trim()) {
    menus.value.push({
      name: name.trim(),
      categories: 0,
      items: 0,
      isActive: true
    });
  }
};
</script>

<style scoped>
/* Базовые стили (Темная тема по умолчанию) */
.yumzi-dashboard {
  background-color: #121214;
  min-height: 100vh;
  padding: 30px 60px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #f3f4f6;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.dash-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.header-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.brand-logo {
  font-size: 24px;
  font-weight: 800;
  color: #fff;
}

.greeting-box {
  text-align: center;
}

.greeting-box h2 {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 4px;
  color: #fff;
}

.subtitle {
  color: #9ca3af;
  font-size: 14px;
}

.btn-theme-toggle {
  background-color: #27272a;
  border: 1px solid #3f3f46;
  color: #fff;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  transition: background 0.2s;
}

.btn-theme-toggle:hover {
  background-color: #3f3f46;
}

.btn-refresh {
  background-color: #6366f1;
  color: #fff;
  border: none;
  padding: 8px 18px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-refresh:hover {
  background-color: #4f46e5;
}

.search-shef-bar {
  background: #1a1a1e;
  border: 1px solid #27272a;
  border-radius: 30px;
  padding: 12px 24px;
  display: flex;
  align-items: center;
  max-width: 680px;
  margin: 0 auto 40px auto;
  cursor: pointer;
  transition: border-color 0.2s, background 0.3s;
}

.search-shef-bar:hover {
  border-color: #6366f1;
}

.search-shef-bar input {
  border: none;
  outline: none;
  flex: 1;
  margin-left: 12px;
  font-size: 15px;
  background: transparent;
  color: inherit;
}

.section-block {
  max-width: 900px;
  margin: 0 auto 35px auto;
}

.section-title {
  font-size: 11px;
  font-weight: 700;
  color: #9ca3af;
  letter-spacing: 0.5px;
  display: block;
  margin-bottom: 12px;
}

.operations-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.op-card {
  background: #1a1a1e;
  border: 1px solid #27272a;
  border-radius: 14px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.op-card:hover {
  border-color: #6366f1;
  transform: translateY(-2px);
}

.op-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  margin-bottom: 14px;
}

.op-icon.digital { background: rgba(59, 130, 246, 0.15); color: #60a5fa; }
.op-icon.data { background: rgba(239, 68, 68, 0.15); color: #f87171; }
.op-icon.orders { background: rgba(34, 197, 94, 0.15); color: #4ade80; }

.op-card h3 {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 4px;
  color: inherit;
}

.op-card p {
  font-size: 12px;
  color: #9ca3af;
  line-height: 1.4;
}

.menu-row-card {
  background: #1a1a1e;
  border: 1px solid #27272a;
  border-radius: 12px;
  padding: 14px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  transition: background 0.3s, border-color 0.3s;
}

.menu-row-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.drag-dots, .menu-dots {
  color: #6b7280;
  cursor: pointer;
}

.menu-dots {
  padding: 5px 10px;
  font-weight: bold;
  user-select: none;
}

.menu-actions-wrapper {
  position: relative;
}

/* Стили для выпадающего меню из скриншота */
.dropdown-menu {
  position: absolute;
  right: 0;
  top: 100%;
  margin-top: 6px;
  background: #1e1e24;
  border: 1px solid #3f3f46;
  border-radius: 10px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
  z-index: 100;
  min-width: 200px;
  padding: 6px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  font-size: 13px;
  color: #f3f4f6;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
}

.dropdown-item:hover {
  background: #27272a;
}

.dropdown-item.delete {
  color: #f87171;
}

.dropdown-item.delete:hover {
  background: rgba(239, 68, 68, 0.15);
}

.status-dot {
  width: 8px;
  height: 8px;
  background-color: #6b7280;
  border-radius: 50%;
  transition: background-color 0.3s;
}

.status-dot.active {
  background-color: #22c55e;
}

.menu-info-text h4 {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 2px;
  color: inherit;
}

.menu-info-text p {
  font-size: 12px;
  color: #9ca3af;
}

.menu-row-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.icon-arrow {
  background: transparent;
  border: 1px solid #3f3f46;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: inherit;
  transition: background 0.2s;
}

.icon-arrow:hover {
  background: #27272a;
}

.btn-new-menu {
  display: block;
  width: 100%;
  background: #6366f1;
  color: #fff;
  border: none;
  padding: 12px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 12px;
  text-align: center;
  transition: background 0.2s;
}

.btn-new-menu:hover {
  background: #4f46e5;
}

.stat-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-counter {
  font-size: 12px;
  font-weight: 600;
  color: #818cf8;
}

.stat-card-banner {
  background: #1a1a1e;
  border: 1px solid #27272a;
  border-radius: 16px;
  padding: 30px;
  text-align: center;
  position: relative;
  transition: background 0.3s, border-color 0.3s;
}

.progress-circle-box {
  width: 60px;
  height: 60px;
  border: 4px solid #6366f1;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px auto;
  font-weight: 700;
  font-size: 14px;
  color: #818cf8;
}

.stat-card-banner p {
  font-size: 13px;
  color: #d1d5db;
  margin-bottom: 16px;
}

.btn-lock-stat {
  background: #27272a;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 12px;
  color: #9ca3af;
  font-weight: 600;
  cursor: not-allowed;
}

/* Стили для светлой темы (.light-theme) */
.yumzi-dashboard.light-theme {
  background-color: #fcfbfa;
  color: #1a1a1a;
}

.yumzi-dashboard.light-theme .brand-logo,
.yumzi-dashboard.light-theme .greeting-box h2,
.yumzi-dashboard.light-theme .op-card h3,
.yumzi-dashboard.light-theme .menu-info-text h4 {
  color: #1a1a1a;
}

.yumzi-dashboard.light-theme .subtitle,
.yumzi-dashboard.light-theme .op-card p,
.yumzi-dashboard.light-theme .menu-info-text p,
.yumzi-dashboard.light-theme .section-title {
  color: #666;
}

.yumzi-dashboard.light-theme .btn-theme-toggle {
  background-color: #f3f4f6;
  border-color: #e5e7eb;
  color: #333;
}

.yumzi-dashboard.light-theme .btn-theme-toggle:hover {
  background-color: #e5e7eb;
}

.yumzi-dashboard.light-theme .search-shef-bar,
.yumzi-dashboard.light-theme .op-card,
.yumzi-dashboard.light-theme .menu-row-card,
.yumzi-dashboard.light-theme .stat-card-banner {
  background: #fff;
  border-color: #eaeaea;
}

.yumzi-dashboard.light-theme .dropdown-menu {
  background: #fff;
  border-color: #e5e7eb;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.yumzi-dashboard.light-theme .dropdown-item {
  color: #1a1a1a;
}

.yumzi-dashboard.light-theme .dropdown-item:hover {
  background: #f3f4f6;
}

.yumzi-dashboard.light-theme .icon-arrow {
  border-color: #e5e7eb;
  color: #555;
}

.yumzi-dashboard.light-theme .icon-arrow:hover {
  background: #f3f4f6;
}

.yumzi-dashboard.light-theme .stat-card-banner p {
  color: #444;
}

.yumzi-dashboard.light-theme .btn-lock-stat {
  background: #f3f4f6;
  color: #666;
}
</style>