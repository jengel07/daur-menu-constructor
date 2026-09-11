const fs = require('fs');
let path = 'src/views/ClientView.vue';
let code = fs.readFileSync(path, 'utf8');

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

// Insert it right after the closing </div> of the floating-order-bar.
// In the text, it looks like:
// <button v-if="..." class="close-order-btn" @click="clearActiveOrder">× </button>
//             </div>
//               
//               <div v-if="activeOrderStatus === 'done' || activeOrderStatus === 'archived'" 

const regex = /(<button[^>]*class="close-order-btn"[^>]*>× <\/button>\s*<\/div>)/;

code = code.replace(regex, `$1\n${receiptHtml}`);

fs.writeFileSync(path, code);
console.log('Successfully injected receiptHtml');

