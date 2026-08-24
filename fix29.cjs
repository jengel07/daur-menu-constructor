const fs = require('fs');
let content = fs.readFileSync('src/views/KitchenOrders.vue', 'utf8');

const groupedLogic = `
const groupedArchivedOrders = computed(() => {
  if (currentTab.value !== 'archived') return [];
  const groups = {};
  
  filteredOrders.value.forEach(order => {
    // order.createdAt is usually ISO string
    const dateObj = new Date(order.createdAt);
    const dateKey = dateObj.toLocaleDateString('ru-RU', { day: '2-digit', month: 'short', year: 'numeric' });
    
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(order);
  });
  
  // Return sorted by date descending? They are already sorted by backend, so just preserve order of keys
  return Object.keys(groups).map(date => ({
    date,
    orders: groups[date]
  }));
});
`;

content = content.replace(
  'const countByStatus = (status: string) => orders.value.filter(o => o.status === status).length',
  'const countByStatus = (status: string) => orders.value.filter(o => o.status === status).length\n' + groupedLogic
);

const oldGrid = `<div v-else class="k-grid">
          <div
            v-for="order in filteredOrders"
            :key="order.id"
            class="k-card"
            :class="order.status"
          >`;

const newGrid = `<div v-else-if="currentTab === 'archived'" class="k-archive-container">
          <div v-for="group in groupedArchivedOrders" :key="group.date" class="k-archive-group">
            <h3 class="k-archive-date">{{ group.date }}</h3>
            <div class="k-grid">
              <div
                v-for="order in group.orders"
                :key="order.id"
                class="k-card archived"
              >
                <!-- Card header -->
                <div class="k-card-head">
                  <div class="k-card-id-row">
                    <span class="k-order-num">#{{ order.orderNumber || String(order.id).slice(-4) }}</span>
                    <span class="k-type-badge" :class="order.type">{{ typeLabel(order.type) }}</span>
                  </div>
                  <span class="k-time">{{ new Date(order.createdAt).toLocaleTimeString('ru-RU', {hour: '2-digit', minute:'2-digit'}) }}</span>
                </div>

                <!-- Customer info -->
                <div class="k-card-info">
                  <div v-if="order.customerName" class="k-info-row">
                    👤 <strong>{{ order.customerName }}</strong>
                    <span v-if="order.customerPhone">
                      📞 <a :href="\`tel:\${order.customerPhone}\`">{{ order.customerPhone }}</a>
                    </span>
                  </div>

                  <div class="k-info-row">
                    📍 <span v-if="order.type === 'delivery'">{{ order.address || 'Адрес не указан' }}</span>
                    <span v-else-if="order.type === 'table'">Стол {{ order.tableNumber || '?' }}</span>
                    <span v-else>С собой</span>
                  </div>
                  
                  <div v-if="order.scheduledTime" class="k-info-row">
                    ⏰ <strong>На время: {{ order.scheduledTime }}</strong>
                  </div>
                  <div v-if="order.comment" class="k-info-row k-comment">
                    💬 {{ order.comment }}
                  </div>
                </div>

                <!-- Order items -->
                <div class="k-card-items">
                  <div v-for="item in order.items" :key="item.id" class="k-item-row">
                    <div class="k-item-qty">{{ item.quantity }}x</div>
                    <div class="k-item-name">{{ item.name }}</div>
                  </div>
                </div>
                
                <div class="k-card-total">
                  <span>Итого:</span>
                  <strong>{{ order.totalPrice }} ₽</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div v-else class="k-grid">
          <div
            v-for="order in filteredOrders"
            :key="order.id"
            class="k-card"
            :class="order.status"
          >`;

content = content.replace(oldGrid, newGrid);

// Add CSS for archive
content = content.replace(
  '</style>',
  `
  .k-archive-container { display: flex; flex-direction: column; gap: 24px; }
  .k-archive-group { display: flex; flex-direction: column; gap: 12px; }
  .k-archive-date { margin: 0; font-size: 16px; font-weight: bold; color: #4b5563; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; }
  .k-card.archived { opacity: 0.8; background: #f9fafb; border-color: #e5e7eb; }
  .k-card-total { display: flex; justify-content: space-between; border-top: 1px solid #e5e7eb; margin-top: 12px; padding-top: 12px; font-size: 14px; }
  .light-theme .k-card-total { border-color: #e5e7eb; }
</style>`
);

fs.writeFileSync('src/views/KitchenOrders.vue', content);
console.log('Added archive grouping logic');

