<template>
  <div class="admin-dashboard">
    <header class="admin-header">
      <div class="admin-title-block">
        <h1>Панель администратора</h1>
        <span class="badge-live">🟢 Онлайн-прием заказов</span>
      </div>
      <div class="admin-actions">
        <button class="btn-secondary" @click="clearOrders">Очистить историю</button>
        <router-link to="/" class="btn-primary">Вернуться в конструктор</router-link>
      </div>
    </header>

    <div class="admin-kanban">
      <!-- Колонка: Новые -->
      <div class="kanban-column">
        <div class="column-header open">
          <span>Новые</span>
          <span class="count-badge">{{ openOrders.length }}</span>
        </div>
        <div class="column-body">
          <div v-if="openOrders.length === 0" class="empty-col">Нет новых заказов</div>
          <div v-for="order in openOrders" :key="order.id" class="order-card">
            <div class="order-card-header">
              <span class="order-id">{{ order.id }}</span>
              <span class="order-time">{{ order.createdAt }}</span>
            </div>
            <div class="order-items-list">
              <div v-for="item in order.items" :key="item.id" class="order-item-row">
                <span>{{ item.name }} x{{ item.quantity }}</span>
                <span>RUB {{ (item.price * item.quantity).toFixed(2) }}</span>
              </div>
            </div>
            <div class="order-footer">
              <span class="order-total">Итого: RUB {{ order.total.toFixed(2) }}</span>
              <button class="btn-action next" @click="updateOrderStatus(order.id, 'progress')">В работу ➔</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Колонка: В работе -->
      <div class="kanban-column">
        <div class="column-header progress">
          <span>В работе</span>
          <span class="count-badge">{{ progressOrders.length }}</span>
        </div>
        <div class="column-body">
          <div v-if="progressOrders.length === 0" class="empty-col">Нет заказов в работе</div>
          <div v-for="order in progressOrders" :key="order.id" class="order-card">
            <div class="order-card-header">
              <span class="order-id">{{ order.id }}</span>
              <span class="order-time">{{ order.createdAt }}</span>
            </div>
            <div class="order-items-list">
              <div v-for="item in order.items" :key="item.id" class="order-item-row">
                <span>{{ item.name }} x{{ item.quantity }}</span>
                <span>RUB {{ (item.price * item.quantity).toFixed(2) }}</span>
              </div>
            </div>
            <div class="order-footer">
              <span class="order-total">Итого: RUB {{ order.total.toFixed(2) }}</span>
              <div class="card-btn-group">
                <button class="btn-action prev" @click="updateOrderStatus(order.id, 'open')">◀ Назад</button>
                <button class="btn-action next" @click="updateOrderStatus(order.id, 'done')">Готово ✓</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Колонка: Готовы -->
      <div class="kanban-column">
        <div class="column-header done">
          <span>Готовы</span>
          <span class="count-badge">{{ doneOrders.length }}</span>
        </div>
        <div class="column-body">
          <div v-if="doneOrders.length === 0" class="empty-col">Нет завершенных заказов</div>
          <div v-for="order in doneOrders" :key="order.id" class="order-card done-card">
            <div class="order-card-header">
              <span class="order-id">{{ order.id }}</span>
              <span class="order-time">{{ order.createdAt }}</span>
            </div>
            <div class="order-items-list">
              <div v-for="item in order.items" :key="item.id" class="order-item-row">
                <span>{{ item.name }} x{{ item.quantity }}</span>
                <span>RUB {{ (item.price * item.quantity).toFixed(2) }}</span>
              </div>
            </div>
            <div class="order-footer">
              <span class="order-total">Итого: RUB {{ order.total.toFixed(2) }}</span>
              <button class="btn-action archive" @click="updateOrderStatus(order.id, 'progress')">Вернуть</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useOrders } from '../composables/useOrders';

const { orders, updateOrderStatus, clearOrders } = useOrders();

const openOrders = computed(() => orders.value.filter(o => o.status === 'open'));
const progressOrders = computed(() => orders.value.filter(o => o.status === 'progress'));
const doneOrders = computed(() => orders.value.filter(o => o.status === 'done'));
</script>

<style scoped>
.admin-dashboard {
  padding: 24px;
  background-color: #121212;
  color: #fff;
  min-height: 100vh;
  font-family: inherit;
}
.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  border-bottom: 1px solid #2a2a2a;
  padding-bottom: 16px;
}
.admin-title-block h1 {
  margin: 0 0 6px 0;
  font-size: 24px;
}
.badge-live {
  color: #4ade80;
  font-size: 14px;
}
.admin-actions {
  display: flex;
  gap: 12px;
}
.btn-primary, .btn-secondary {
  padding: 8px 16px;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 500;
  cursor: pointer;
  border: none;
}
.btn-primary { background-color: #6366f1; color: white; }
.btn-secondary { background-color: #27272a; color: #a1a1aa; }
.btn-primary:hover { background-color: #4f46e5; }
.btn-secondary:hover { background-color: #3f3f46; color: white; }

.admin-kanban {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}
.kanban-column {
  background: #18181b;
  border-radius: 12px;
  border: 1px solid #27272a;
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 150px);
}
.column-header {
  padding: 16px;
  font-weight: bold;
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.column-header.open { background: rgba(234, 179, 8, 0.15); color: #facc15; border-bottom: 1px solid rgba(234, 179, 8, 0.2); }
.column-header.progress { background: rgba(59, 130, 246, 0.15); color: #60a5fa; border-bottom: 1px solid rgba(59, 130, 246, 0.2); }
.column-header.done { background: rgba(34, 197, 94, 0.15); color: #4ade80; border-bottom: 1px solid rgba(34, 197, 94, 0.2); }
.count-badge {
  background: rgba(0,0,0,0.3);
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
}
.column-body {
  padding: 16px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex-grow: 1;
}
.empty-col {
  text-align: center;
  color: #71717a;
  padding: 32px 0;
}
.order-card {
  background: #202023;
  border: 1px solid #2f2f35;
  border-radius: 8px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.order-card-header {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: #a1a1aa;
}
.order-id {
  font-weight: bold;
  color: #fff;
}
.order-items-list {
  font-size: 14px;
  border-top: 1px solid #2a2a2e;
  border-bottom: 1px solid #2a2a2e;
  padding: 8px 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.order-item-row {
  display: flex;
  justify-content: space-between;
}
.order-footer {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.order-total {
  font-weight: bold;
  font-size: 13px;
}
.card-btn-group {
  display: flex;
  gap: 8px;
}
.btn-action {
  width: 100%;
  padding: 6px;
  border-radius: 4px;
  border: none;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
}
.btn-action.next { background: #6366f1; color: white; }
.btn-action.next:hover { background: #4f46e5; }
.btn-action.prev, .btn-action.archive { background: #27272a; color: #a1a1aa; }
.btn-action.prev:hover, .btn-action.archive:hover { background: #3f3f46; color: white; }
</style>