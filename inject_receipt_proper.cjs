const fs = require('fs');
let path = 'src/views/ClientView.vue';
let code = fs.readFileSync(path, 'utf8');

const receiptHtml = `
              <div v-if="isOrderExpanded && activeOrderData" class="order-receipt-card" style="margin-top: 8px;">
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

const regex = /(<button[^>]*class="close-order-btn"[^>]*>.*?<\/button>\s*<\/div>)/is;

if (regex.test(code)) {
  code = code.replace(regex, `$1\n${receiptHtml}`);
  fs.writeFileSync(path, code);
  console.log('Successfully injected receiptHtml!');
} else {
  console.log('Regex did not match!');
}

