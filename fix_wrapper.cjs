const fs = require('fs');

function updateFile(filePath) {
  let code = fs.readFileSync(filePath, 'utf8');

  // Replace active-order-container
  const regex1 = /<div v-if="activeOrderId && !showCheckoutModal" class="active-order-container"[^>]*>/;
  code = code.replace(regex1, '<div v-if="activeOrderId && !showCheckoutModal" class="active-order-container" style="position: absolute; top: 15px; left: 12px; right: 12px; z-index: 20; pointer-events: none;">');

  // Add pointer-events: auto to children
  code = code.replace(
    /<div class="floating-order-bar" @click="isOrderExpanded = !isOrderExpanded">/,
    '<div class="floating-order-bar" @click="isOrderExpanded = !isOrderExpanded" style="pointer-events: auto; margin-bottom: 8px;">'
  );

  code = code.replace(
    /<div v-if="isOrderExpanded && activeOrderData" class="order-receipt-card" style="margin-top: 8px;">/,
    '<div v-if="isOrderExpanded && activeOrderData" class="order-receipt-card" style="margin-bottom: 8px; pointer-events: auto; max-height: 400px; overflow-y: auto;">'
  );

  code = code.replace(
    /<div v-if="activeOrderStatus === 'done' || activeOrderStatus === 'archived'" style="animation: fadeIn 0.3s ease; box-shadow: 0 4px 20px rgba\(0,0,0,0.4\); border-radius: 16px;">/,
    '<div v-if="activeOrderStatus === \'done\' || activeOrderStatus === \'archived\'" style="animation: fadeIn 0.3s ease; box-shadow: 0 4px 20px rgba(0,0,0,0.4); border-radius: 16px; pointer-events: auto; max-height: 400px; overflow-y: auto;">'
  );

  fs.writeFileSync(filePath, code);
}

updateFile('src/views/ClientView.vue');
updateFile('src/components/PhoneMockupContent.vue');
console.log('Fixed wrapper logic');

