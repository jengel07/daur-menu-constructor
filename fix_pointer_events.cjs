const fs = require('fs');

function updateFile(filePath) {
  let code = fs.readFileSync(filePath, 'utf8');

  // Fix the active-order-container styles
  code = code.replace(
    /class="active-order-container" style="position: absolute; top: 15px; left: 12px; right: 12px; bottom: 80px; z-index: 20; display: flex; flex-direction: column; gap: 8px; overflow-y: auto; padding-bottom: 16px; scrollbar-width: none;"/,
    'class="active-order-container" style="position: absolute; top: 15px; left: 12px; right: 12px; z-index: 20; display: flex; flex-direction: column; gap: 8px; max-height: calc(100% - 100px); pointer-events: none;"'
  );

  // Add pointer-events: auto to floating-order-bar
  code = code.replace(
    /<div class="floating-order-bar" @click="isOrderExpanded = !isOrderExpanded">/,
    '<div class="floating-order-bar" @click="isOrderExpanded = !isOrderExpanded" style="pointer-events: auto;">'
  );

  // Add pointer-events: auto and overflow to order-receipt-card
  code = code.replace(
    /<div v-if="isOrderExpanded && activeOrderData" class="order-receipt-card" style="margin-top: 8px;">/,
    '<div v-if="isOrderExpanded && activeOrderData" class="order-receipt-card" style="margin-top: 8px; pointer-events: auto; overflow-y: auto; max-height: 400px; scrollbar-width: none;">'
  );
  
  // Also, let's add a button in the order-receipt-card to say "Сделать дозаказ" (Make another order) which just collapses the order so they know they can order more!
  // Actually, we can just let them click the background since pointer-events is none! They will just scroll the menu naturally.

  fs.writeFileSync(filePath, code);
}

updateFile('src/views/ClientView.vue');
updateFile('src/components/PhoneMockupContent.vue');
console.log('Fixed pointer events for active order container');

