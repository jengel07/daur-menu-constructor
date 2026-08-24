const fs = require('fs');
let content = fs.readFileSync('src/views/KitchenOrders.vue', 'utf8');

const oldGrid = `<div v-else class="k-orders-grid">
        <div
          v-for="order in filteredOrders"
          :key="order.id"
          class="k-card"
          :class="order.status"
        >`;

const newGrid = `<div v-else-if="currentTab === 'archived'" class="k-archive-container">
        <div v-for="group in groupedArchivedOrders" :key="group.date" class="k-archive-group">
          <h3 class="k-archive-date">{{ group.date }}</h3>
          <div class="k-orders-grid">
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
      
      <div v-else class="k-orders-grid">
        <div
          v-for="order in filteredOrders"
          :key="order.id"
          class="k-card"
          :class="order.status"
        >`;

content = content.replace(oldGrid, newGrid);
fs.writeFileSync('src/views/KitchenOrders.vue', content);
console.log('Fixed k-orders-grid');

