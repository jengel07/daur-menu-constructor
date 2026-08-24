const fs = require('fs');
let content = fs.readFileSync('src/views/KitchenOrders.vue', 'utf8');

const oldTimer = `function elapsed(dateStr: string) {
  if (!dateStr) return '—'
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)`;

const newTimer = `function elapsed(order: any) {
  if (!order.createdAt) return '—';
  let end = Date.now();
  if (order.status === 'archived' || order.status === 'cancelled') {
    if (order.updatedAt) {
      end = new Date(order.updatedAt).getTime();
    }
  }
  const diff = Math.floor((end - new Date(order.createdAt).getTime()) / 1000)`;

content = content.replace(oldTimer, newTimer);
content = content.replace(/elapsed\(order\.createdAt\)/g, "elapsed(order)");

fs.writeFileSync('src/views/KitchenOrders.vue', content);
console.log('Modified KitchenOrders.vue for timer');

