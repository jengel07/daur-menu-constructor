const fs = require('fs');
let content = fs.readFileSync('src/components/OrderSettingsEditor.vue', 'utf8');

// 1. Add deleteAll button
content = content.replace(
  /<button class="btn-action-top" @click="isOrderSettingsOpen = true">/,
  `<button class="btn-action-top" style="background: #dc2626; color: white; border: none; margin-right: 8px;" @click="deleteAllOrders">🗑 Очистить заказы</button>
        <button class="btn-action-top" @click="isOrderSettingsOpen = true">`
);

// 2. Add individual delete button to archived list (since it's separated)
content = content.replace(
  /<span class="order-type-badge" :class="order.type \|\| 'onsite'">/,
  `<button class="btn-delete-order" @click="deleteOrder(order.id)" title="Удалить чек" style="background: transparent; border: none; font-size: 16px; cursor: pointer;">🗑️</button>
                  <span class="order-type-badge" :class="order.type || 'onsite'">`
);

// Add individual delete button to normal list
content = content.replace(
  /<span class="order-type-badge" :class="order.type \|\| 'onsite'">/,
  `<button class="btn-delete-order" @click="deleteOrder(order.id)" title="Удалить чек" style="background: transparent; border: none; font-size: 16px; cursor: pointer;">🗑️</button>
                <span class="order-type-badge" :class="order.type || 'onsite'">`
);

// 3. Fix getElapsedTime
const oldTimer = `const getElapsedTime = (createdAt: string) => {
  if (!createdAt) return '—';
  const diff = Math.floor((Date.now() - new Date(createdAt).getTime()) / 1000);`;

const newTimer = `const getElapsedTime = (order: any) => {
  if (!order.createdAt) return '—';
  let end = Date.now();
  if (order.status === 'archived' || order.status === 'cancelled') {
    if (order.updatedAt) {
      end = new Date(order.updatedAt).getTime();
    }
  }
  const diff = Math.floor((end - new Date(order.createdAt).getTime()) / 1000);`;

content = content.replace(oldTimer, newTimer);
content = content.replace(/getElapsedTime\(order.createdAt \|\| ''\)/g, "getElapsedTime(order)");
content = content.replace(/getElapsedTime\(order.createdAt\)/g, "getElapsedTime(order)");

// 4. Add the methods
const methods = `
const deleteOrder = async (id: string) => {
  if (!confirm('Точно удалить этот чек навсегда?')) return;
  try {
    await ordersApi.delete(id);
    await fetchOrders();
  } catch (e: any) {
    alert('Ошибка удаления: ' + e.message);
  }
};

const deleteAllOrders = async () => {
  if (!confirm('ВНИМАНИЕ! Это удалит ВСЕ заказы из базы навсегда (включая архив). Продолжить?')) return;
  try {
    await ordersApi.deleteAll();
    await fetchOrders();
  } catch (e: any) {
    alert('Ошибка удаления: ' + e.message);
  }
};
`;

content = content.replace(
  'const fetchOrders = async () => {',
  `${methods}\nconst fetchOrders = async () => {`
);

fs.writeFileSync('src/components/OrderSettingsEditor.vue', content);
console.log('Modified OrderSettingsEditor.vue for delete and timer');

