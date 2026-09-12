const fs = require('fs');

function refactorMultipleOrders(filePath) {
  let code = fs.readFileSync(filePath, 'utf8');

  // 1. Refactor State
  code = code.replace(
    /const activeOrderId = ref<string \| null>\(null\);[\s\S]*?let orderPollInterval: any = null;/,
    `const activeOrderIds = ref<string[]>([]);
const activeOrders = ref<any[]>([]);
const isOrderExpanded = ref<Record<string, boolean>>({});
const orderRating = ref<Record<string, number>>({});
const orderFeedback = ref<Record<string, string[]>>({});
const orderFeedbackText = ref<Record<string, string>>({});
const feedbackSubmitted = ref<Record<string, boolean>>({});
let orderPollInterval: any = null;`
  );

  // 2. Refactor clearActiveOrder
  code = code.replace(
    /const clearActiveOrder = \(\) => {[\s\S]*?};/,
    `const clearActiveOrder = (id: string) => {
  activeOrderIds.value = activeOrderIds.value.filter(x => x !== id);
  activeOrders.value = activeOrders.value.filter(x => x.id !== id);
  localStorage.setItem('active_orders', JSON.stringify(activeOrderIds.value));
  if (activeOrderIds.value.length === 0 && orderPollInterval) {
    clearInterval(orderPollInterval);
  }
};`
  );

  // 3. Refactor pollOrderStatus
  code = code.replace(
    /const pollOrderStatus = async \(\) => {[\s\S]*?catch \(err\) {[\s\S]*?}[\s\S]*?};/,
    `const pollOrderStatus = async () => {
  if (activeOrderIds.value.length === 0) return;
  try {
    const updated = [];
    for (const id of activeOrderIds.value) {
      const res = await fetch(\`\${API_URL}/api/orders/\${id}\`);
      if (res.ok) {
        updated.push(await res.json());
      }
    }
    updated.forEach(newO => {
      const existingIdx = activeOrders.value.findIndex(o => o.id === newO.id);
      if (existingIdx !== -1) {
        activeOrders.value[existingIdx] = newO;
      } else {
        activeOrders.value.push(newO);
      }
    });
  } catch (err) {
    console.error('Error polling:', err);
  }
};`
  );

  // 4. Refactor getOrderStatusText
  code = code.replace(
    /const getOrderStatusText = \(\) => {[\s\S]*?switch \(activeOrderStatus\.value\) {[\s\S]*?}[\s\S]*?};/,
    `const getOrderStatusText = (status: string) => {
  switch (status) {
    case 'new': return tDyn('Новый, ждем...');
    case 'progress': return tDyn('Готовится на кухне');
    case 'done': return tDyn('Готов (Подан / Ожидает выдачи)');
    case 'archived': return tDyn('Закрыт');
    case 'cancelled': return tDyn('Отменен');
    default: return tDyn('Обновление...');
  }
};`
  );

  // 5. Refactor toggleFeedback & submitFeedback
  code = code.replace(
    /const toggleFeedback = \(id: string\) => {[\s\S]*?};/,
    `const toggleFeedback = (orderId: string, id: string) => {
  if (!orderFeedback.value[orderId]) orderFeedback.value[orderId] = [];
  if (orderFeedback.value[orderId].includes(id)) {
    orderFeedback.value[orderId] = orderFeedback.value[orderId].filter((x: string) => x !== id);
  } else {
    orderFeedback.value[orderId].push(id);
  }
};`
  );

  code = code.replace(
    /const submitFeedback = async \(\) => {[\s\S]*?try {[\s\S]*?const fbStr = orderFeedback\.value\.length > 0[\s\S]*?const fullText[\s\S]*?const res = await fetch\(`\${API_URL}\/api\/orders\/\${activeOrderId\.value}\/feedback`[\s\S]*?feedbackSubmitted\.value = true;[\s\S]*?catch \(e\) {[\s\S]*?}[\s\S]*?};/,
    `const submitFeedback = async (orderId: string) => {
  if (!orderId || !orderRating.value[orderId]) return;
  try {
    const fbArr = orderFeedback.value[orderId] || [];
    const fbStr = fbArr.length > 0 ? \`[\${fbArr.join(', ')}] \` : '';
    const fullText = fbStr + (orderFeedbackText.value[orderId] || '');
    const res = await fetch(\`\${API_URL}/api/orders/\${orderId}/feedback\`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating: orderRating.value[orderId], feedback: fullText })
    });
    if (res.ok) {
      feedbackSubmitted.value[orderId] = true;
    }
  } catch (e) {
    console.error(e);
  }
};`
  );

  // 6. Refactor confirmOrder success
  code = code.replace(
    /localStorage\.setItem\('active_order_id', result\.orderId\);[\s\S]*?activeOrderId\.value = result\.orderId;[\s\S]*?activeOrderNumber\.value = [\s\S]*?activeOrderStatus\.value = 'new';[\s\S]*?activeOrderData\.value = result\.order;[\s\S]*?startOrderPolling\(\);/,
    `if (!activeOrderIds.value.includes(result.orderId)) {
      activeOrderIds.value.push(result.orderId);
      activeOrders.value.push(result.order);
      localStorage.setItem('active_orders', JSON.stringify(activeOrderIds.value));
    }
    startOrderPolling();`
  );

  // 7. Refactor onMounted
  code = code.replace(
    /const savedOrderId = localStorage\.getItem\('active_order_id'\);[\s\S]*?if \(savedOrderId\) {[\s\S]*?activeOrderId\.value = savedOrderId;[\s\S]*?startOrderPolling\(\);[\s\S]*?}/,
    `try {
  const savedOrders = JSON.parse(localStorage.getItem('active_orders') || '[]');
  if (savedOrders && savedOrders.length > 0) {
    activeOrderIds.value = savedOrders;
    startOrderPolling();
  } else {
    // Migrate old single order
    const oldSaved = localStorage.getItem('active_order_id');
    if (oldSaved) {
      activeOrderIds.value = [oldSaved];
      localStorage.setItem('active_orders', JSON.stringify([oldSaved]));
      localStorage.removeItem('active_order_id');
      startOrderPolling();
    }
  }
} catch (e) { console.error(e); }`
  );

  // 8. Template replacement
  const oldTemplateRegex = /<div v-if="activeOrderId && !showCheckoutModal" class="active-order-container" style="position: absolute; top: 15px; left: 12px; right: 12px; z-index: 20; pointer-events: none; display: block;">[\s\S]*?<\/div> <!-- end of active-order-container -->|(<div v-if="activeOrderId && !showCheckoutModal" class="active-order-container" style="position: absolute; top: 15px; left: 12px; right: 12px; z-index: 20; pointer-events: none; display: block;">[\s\S]*?<div v-if="feedbackSubmitted" class="feedback-success-msg">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>)/;
  
  // Wait, regex might fail to grab the whole template. I'll use a script to replace the HTML exactly.

  fs.writeFileSync(filePath, code);
}

// I will just use string manipulation for the HTML part.
function replaceTemplate(filePath) {
  let code = fs.readFileSync(filePath, 'utf8');

  const startStr = '<div v-if="activeOrderId && !showCheckoutModal" class="active-order-container"';
  let startIndex = code.indexOf(startStr);
  if (startIndex === -1) {
    console.log("Could not find start in", filePath);
    return;
  }

  // We need to find the end of this div block. It ends right before `<div v-if="cartItems.length > 0`
  const nextDivIndex = code.indexOf('<div v-if="cartItems.length > 0 && !showCheckoutModal" class="floating-cart-bar"');
  if (nextDivIndex === -1) {
    console.log("Could not find next div in", filePath);
    return;
  }

  const replacement = `
<div v-if="activeOrders.length > 0 && !showCheckoutModal" class="active-orders-wrapper" style="position: absolute; top: 15px; left: 12px; right: 12px; z-index: 20; pointer-events: none; display: flex; flex-direction: column; gap: 8px;">
  <div v-for="order in activeOrders" :key="order.id" class="active-order-container" style="pointer-events: none; display: block;">
    <div class="floating-order-bar" @click="isOrderExpanded[order.id] = !isOrderExpanded[order.id]" style="pointer-events: auto; margin-bottom: 8px;">
      <div class="order-bar-icon-wrapper" :class="'status-' + order.status">
        <Clock v-if="order.status === 'new'" :size="20" stroke-width="2" />
        <ChefHat v-else-if="order.status === 'progress'" :size="20" stroke-width="2" />
        <CheckCircle v-else-if="order.status === 'done' || order.status === 'archived'" :size="20" stroke-width="2" />
        <XCircle v-else :size="20" stroke-width="2" />
      </div>
      <div class="order-bar-text">
        <strong>{{ tDyn('Заказ') }} #{{ order.orderNumber || order.id.slice(-4) }}</strong>
        <span>{{ getOrderStatusText(order.status) }}</span>
      </div>
      <div class="order-bar-right">
        <button v-if="order.status === 'done' || order.status === 'archived' || order.status === 'cancelled'" class="close-order-btn" @click.stop="clearActiveOrder(order.id)">
          <X :size="14" stroke-width="3" />
        </button>
        <ChevronDown class="order-bar-chevron" :class="{ 'expanded': isOrderExpanded[order.id] }" :size="20" />
      </div>
    </div>

    <div v-if="isOrderExpanded[order.id] && order.items" class="order-receipt-card" style="margin-bottom: 8px; pointer-events: auto; max-height: 300px; overflow-y: auto;">
      <div class="receipt-header">
        <strong>{{ tDyn('Чек заказа') }}</strong>
        <span>{{ new Date(order.createdAt || Date.now()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }}</span>
      </div>
      <div class="receipt-items">
        <div v-for="item in order.items" :key="item.id" class="receipt-item">
          <span class="r-name">{{ item.quantity }}x {{ item.name }}</span>
          <span class="r-price">{{ Number(item.price * item.quantity).toFixed(2) }} ₽</span>
        </div>
      </div>
      <div class="receipt-total">
        <span>{{ tDyn('Итого') }}</span>
        <span>{{ Number(order.totalPrice || order.total).toFixed(2) }} ₽</span>
      </div>
    </div>

    <div v-if="order.status === 'done' || order.status === 'archived'" style="animation: fadeIn 0.3s ease; box-shadow: 0 4px 20px rgba(0,0,0,0.4); border-radius: 16px; pointer-events: auto; margin-bottom: 8px;">
      <div class="feedback-widget" style="pointer-events: auto;">
        <div class="feedback-title">{{ tDyn('Вам все понравилось?') }}</div>
        <div class="stars-container">
          <Star 
            v-for="i in 5" :key="i"
            :class="['star-icon', { 'filled': i <= (orderRating[order.id] || 0) }]"
            @click="orderRating[order.id] = i"
          />
        </div>
        
        <div v-if="(orderRating[order.id] || 0) > 0 && !feedbackSubmitted[order.id]" class="feedback-extra" style="animation: slideDown 0.3s ease-out;">
          <div v-if="(orderRating[order.id] || 0) <= 3" class="feedback-options-grid">
            <div 
              v-for="opt in badFeedbackOptions" :key="opt.id"
              class="feedback-option-card"
              :class="{ 'selected': (orderFeedback[order.id] || []).includes(opt.id) }"
              @click.prevent="toggleFeedback(order.id, opt.id)"
            >
              <component :is="opt.icon" class="feedback-opt-icon" />
              <span class="feedback-opt-label">{{ tDyn(opt.label) }}</span>
            </div>
          </div>
          <div v-else class="feedback-options-grid">
            <div 
              v-for="opt in goodFeedbackOptions" :key="opt.id"
              class="feedback-option-card"
              :class="{ 'selected': (orderFeedback[order.id] || []).includes(opt.id) }"
              @click.prevent="toggleFeedback(order.id, opt.id)"
            >
              <component :is="opt.icon" class="feedback-opt-icon" />
              <span class="feedback-opt-label">{{ tDyn(opt.label) }}</span>
            </div>
          </div>
          
          <textarea v-model="orderFeedbackText[order.id]" class="feedback-textarea" :placeholder="tDyn('Расскажите подробнее...')"></textarea>
          <button class="feedback-submit-btn" @click="submitFeedback(order.id)">{{ tDyn('Отправить отзыв') }}</button>
          
          <div v-if="(orderRating[order.id] || 0) >= 4" class="yandex-review-prompt">
            <a :href="store.generalSettings?.yandexReviewLink || 'https://yandex.ru/maps/org/jazzve/43328610653/reviews/'" target="_blank" class="yandex-review-btn">
              Оставить отзыв на Яндекс Картах
            </a>
          </div>
        </div>
        <div v-if="feedbackSubmitted[order.id]" class="feedback-success-msg">
          {{ tDyn('Спасибо за ваш отзыв!') }}
          
          <div v-if="(orderRating[order.id] || 0) >= 4" class="yandex-review-prompt" style="margin-top: 12px;">
            <a :href="store.generalSettings?.yandexReviewLink || 'https://yandex.ru/maps/org/jazzve/43328610653/reviews/'" target="_blank" class="yandex-review-btn">
              Оставить отзыв на Яндекс Картах
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
`;

  code = code.substring(0, startIndex) + replacement + code.substring(nextDivIndex);
  fs.writeFileSync(filePath, code);
  console.log("Template replaced in", filePath);
}

refactorMultipleOrders('src/views/ClientView.vue');
replaceTemplate('src/views/ClientView.vue');

refactorMultipleOrders('src/components/PhoneMockupContent.vue');
replaceTemplate('src/components/PhoneMockupContent.vue');


