const fs = require('fs');
let content = fs.readFileSync('src/views/KitchenOrders.vue', 'utf8');

// 1. Add archived tab
content = content.replace(
  /const tabs = \[\n([\s\S]*?)\]/,
  (match, p1) => {
    return `const tabs = [
${p1}]

if (role !== 'cook') {
  tabs.push({ key: 'archived', label: 'Архив', emptyIcon: '📦', emptyText: 'Архив пуст' })
}`;
  }
);

// 2. Add 'Закрыть чек' button
const oldActions = `            <!-- In progress -->
            <template v-else-if="order.status === 'progress'">
              <button class="k-btn done" @click="changeStatus(order.id, 'done')">✔ Готово</button>
              <button class="k-btn reject" @click="openRejectModal(order)">❌ Отклонить</button>
            </template>
          </div>`;

const newActions = `            <!-- In progress -->
            <template v-else-if="order.status === 'progress'">
              <button class="k-btn done" @click="changeStatus(order.id, 'done')">✔ Готово</button>
              <button class="k-btn reject" @click="openRejectModal(order)">❌ Отклонить</button>
            </template>
            
            <!-- Done -->
            <template v-else-if="order.status === 'done' && role !== 'cook'">
              <button class="k-btn" style="background: #4f46e5; color: white; border: none;" @click="changeStatus(order.id, 'archived')">🔒 Закрыть чек</button>
            </template>
          </div>`;

content = content.replace(oldActions, newActions);

fs.writeFileSync('src/views/KitchenOrders.vue', content);
console.log('Modified KitchenOrders tabs and actions');

