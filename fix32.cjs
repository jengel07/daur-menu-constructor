const fs = require('fs');
let content = fs.readFileSync('src/components/OrderSettingsEditor.vue', 'utf8');

// 1. Add archived to orderTabs
content = content.replace(
  /{ key: 'cancelled' as const, label: 'Отменено' },/,
  `{ key: 'cancelled' as const, label: 'Отменено' },
  { key: 'archived' as const, label: 'Архив' },`
);

// 2. Add grouped logic to script setup
const groupedLogic = `
const groupedArchivedOrders = computed(() => {
  if (currentTab.value !== 'archived') return [];
  const groups: Record<string, any[]> = {};
  
  filteredOrders.value.forEach(order => {
    const dateObj = new Date(order.createdAt);
    const dateKey = dateObj.toLocaleDateString('ru-RU', { day: '2-digit', month: 'short', year: 'numeric' });
    
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(order);
  });
  
  return Object.keys(groups).map(date => ({
    date,
    orders: groups[date]
  }));
});
`;

if (!content.includes('groupedArchivedOrders')) {
  content = content.replace(
    'const filteredOrders = computed(() => {',
    `${groupedLogic}\n\nconst filteredOrders = computed(() => {`
  );
}

// 3. Replace the filteredOrders loop with grouped loop for archive
const oldGrid = `<div v-else class="orders-list">
        <div v-for="order in filteredOrders" :key="order.id" class="order-card-item receipt-style">`;

const newGrid = `<div v-else-if="currentTab === 'archived'" class="orders-list archive-list">
        <div v-for="group in groupedArchivedOrders" :key="group.date" class="archive-group" style="margin-bottom: 24px; width: 100%;">
          <h3 class="archive-date" style="border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; margin-bottom: 12px; color: #4b5563;">{{ group.date }}</h3>
          <div style="display: flex; flex-direction: column; gap: 16px;">
            <div v-for="order in group.orders" :key="order.id" class="order-card-item receipt-style archived" style="opacity: 0.8;">
              <div class="order-card-header">
                <div class="order-id-group">
                  <span class="order-id">#{{ order.orderNumber || String(order.id).slice(-4).padStart(4,'0') }}</span>
                  <span class="order-type-badge" :class="order.type || 'onsite'">
                    {{ typeLabel(order.type) }}
                  </span>
                </div>
                <span class="order-time">{{ new Date(order.createdAt).toLocaleTimeString('ru-RU', {hour: '2-digit', minute:'2-digit'}) }}</span>
              </div>
              <div class="order-customer-info">
                <div v-if="order.customerName" class="info-row">
                  <span class="icon">👤</span> {{ order.customerName }} <a v-if="order.customerPhone" :href="\`tel:\${order.customerPhone}\`" class="phone-link">{{ order.customerPhone }}</a>
                </div>
                <div class="info-row">
                  <span class="icon">📍</span> 
                  <span v-if="order.type === 'delivery'">{{ order.address || 'Адрес не указан' }}</span>
                  <span v-else-if="order.type === 'table'">Стол {{ order.tableNumber || '?' }}</span>
                  <span v-else>Самовывоз</span>
                </div>
                <div v-if="order.comment" class="info-row note">
                  <span class="icon">💬</span> {{ order.comment }}
                </div>
              </div>
              <div class="order-items-list">
                <div v-for="item in order.items" :key="item.id" class="order-item-row">
                  <span class="item-name"><b>{{ item.quantity }}x</b> {{ item.name }}</span>
                  <span class="item-price">{{ Number(item.price * item.quantity).toFixed(2) }} ₽</span>
                </div>
              </div>
              <div class="order-card-footer">
                <span class="order-total">Итого: {{ Number(order.total || order.totalPrice || 0).toFixed(2) }} ₽</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="orders-list">
        <div v-for="order in filteredOrders" :key="order.id" class="order-card-item receipt-style">`;

if (!content.includes(`currentTab === 'archived'`)) {
  content = content.replace(oldGrid, newGrid);
}

// 4. Add action button for done orders
const oldActions = `<template v-else-if="order.status === 'cancelled'">
                  <button class="btn-restore-order" @click="changeStatus(order.id, 'new')">Восстановить</button>
                </template>
              </div>`;

const newActions = `<template v-else-if="order.status === 'cancelled'">
                  <button class="btn-restore-order" @click="changeStatus(order.id, 'new')">Восстановить</button>
                </template>
                <template v-else-if="order.status === 'done'">
                  <button class="btn-done-order" style="background: #4f46e5;" @click="changeStatus(order.id, 'archived')">🔒 Закрыть чек</button>
                </template>
              </div>`;

if (!content.includes('Закрыть чек')) {
  // Try replacing exact oldActions text, though symbols might not match. I'll use regex.
  content = content.replace(
    /<template v-else-if="order\.status === 'cancelled'">[\s\S]*?<\/template>\s*<\/div>/,
    (match) => {
      return match.replace('</div>', `  <template v-else-if="order.status === 'done'">\n                  <button class="btn-done-order" style="background: #4f46e5;" @click="changeStatus(order.id, 'archived')">🔒 Закрыть чек</button>\n                </template>\n              </div>`);
    }
  );
}

fs.writeFileSync('src/components/OrderSettingsEditor.vue', content);
console.log('Modified OrderSettingsEditor.vue');

