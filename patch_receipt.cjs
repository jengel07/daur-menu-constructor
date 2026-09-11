const fs = require('fs');
let path = 'src/views/ClientView.vue';
let code = fs.readFileSync(path, 'utf8');

// 1. Add refs
code = code.replace(
  /const activeOrderStatus = ref<string>\('new'\);/,
  `const activeOrderStatus = ref<string>('new');\nconst activeOrderData = ref<any>(null);\nconst isOrderExpanded = ref<boolean>(false);`
);

// 2. Update pollOrderStatus
code = code.replace(
  /activeOrderStatus\.value = order\.status;/,
  `activeOrderStatus.value = order.status;\n        activeOrderData.value = order;`
);

// 3. Update clearActiveOrder
code = code.replace(
  /activeOrderStatus\.value = 'new';/,
  `activeOrderStatus.value = 'new';\n    activeOrderData.value = null;\n    isOrderExpanded.value = false;`
);

// 4. Update submitOrder
code = code.replace(
  /activeOrderStatus\.value = 'new';\s*startOrderPolling\(\);/,
  `activeOrderStatus.value = 'new';\n      activeOrderData.value = result.order;\n      startOrderPolling();`
);

// 5. Update template to make bar clickable and add receipt
const barSearch = /<div class="floating-order-bar" :class="'status-' \+ activeOrderStatus">/;
const barReplace = `<div class="floating-order-bar" :class="'status-' + activeOrderStatus" @click="isOrderExpanded = !isOrderExpanded" style="cursor: pointer;">`;

code = code.replace(barSearch, barReplace);

// Inject receipt html AFTER floating-order-bar
const receiptHtml = `
              <div v-if="isOrderExpanded && activeOrderData" class="order-receipt-card">
                <div class="receipt-header">
                  <strong>{{ tDyn('Чек заказа') }}</strong>
                  <span>{{ new Date(activeOrderData.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }}</span>
                </div>
                <div class="receipt-items">
                  <div v-for="item in activeOrderData.items" :key="item.id" class="receipt-item">
                    <span class="r-name">{{ item.quantity }}x {{ item.name }}</span>
                    <span class="r-price">{{ Number(item.price * item.quantity).toFixed(2) }} ₽</span>
                  </div>
                </div>
                <div class="receipt-total">
                  <span>{{ tDyn('Итого') }}</span>
                  <span>{{ Number(activeOrderData.totalPrice).toFixed(2) }} ₽</span>
                </div>
              </div>
`;

// Insert it right after <div class="floating-order-bar"...> ... </div>
// The structure is:
/*
            <div class="floating-order-bar" ...>
              ...
              <button v-if="..." ...>× </button>
            </div>
*/
const insertTarget = /<\/button>\s*<\/div>/;
// Wait, replacing `</button>\n            </div>` might match multiple things. Let's just find the closing tag of floating-order-bar.

// Instead of regex, I'll use string replacement
const searchStr = `</button>
            </div>
              
              <div v-if="activeOrderStatus === 'done'`;
              
const replaceStr = `</button>
            </div>
              ${receiptHtml}
              <div v-if="activeOrderStatus === 'done'`;

code = code.replace(searchStr, replaceStr);

// Add CSS
const cssReplace = `.order-receipt-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 16px;
  color: #111;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  animation: fadeIn 0.2s ease;
}
.receipt-header {
  display: flex;
  justify-content: space-between;
  border-bottom: 1px dashed #ccc;
  padding-bottom: 8px;
  margin-bottom: 12px;
  font-size: 13px;
  color: #555;
}
.receipt-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}
.receipt-item {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
}
.receipt-item .r-name {
  flex: 1;
  padding-right: 10px;
}
.receipt-item .r-price {
  font-weight: 600;
  white-space: nowrap;
}
.receipt-total {
  display: flex;
  justify-content: space-between;
  border-top: 1px dashed #ccc;
  padding-top: 12px;
  font-size: 14px;
  font-weight: bold;
}
</style>`;

code = code.replace(`</style>`, cssReplace);

fs.writeFileSync(path, code);
console.log('Patched ClientView to add receipt');

