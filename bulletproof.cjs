const fs = require('fs');

function makeBulletproof(filePath) {
  let code = fs.readFileSync(filePath, 'utf8');

  // Change the active order container to be absolutely harmless
  // No display: flex, no max-height, no bottom. Just a simple block div that passes pointer events.
  const regex = /class="active-order-container" style="position: absolute; top: 15px; left: 12px; right: 12px; z-index: 20; display: flex; flex-direction: column; gap: 8px; overflow-y: auto; padding-bottom: 16px; scrollbar-width: none;"/;
  
  if (code.match(regex)) {
    code = code.replace(regex, 'class="active-order-container" style="position: absolute; top: 15px; left: 12px; right: 12px; z-index: 20; pointer-events: none;">\n<div style="display: flex; flex-direction: column; gap: 8px;">');
    
    // We added a wrapper <div>, so we need to close it.
    // The closing of active-order-container is at the end. We'll just rely on the Vue compiler auto-closing it? No, Vue needs valid HTML.
    // Actually, I'll just replace the original style completely!
  } else {
    // If we already ran fix_clean.cjs:
    code = code.replace(
      /class="active-order-container" style="position: absolute; top: 15px; left: 12px; right: 12px; z-index: 20; display: flex; pointer-events: none; max-height: calc\(100% - 100px\); flex-direction: column; gap: 8px; overflow-y: auto; padding-bottom: 16px; scrollbar-width: none;"/,
      'class="active-order-container" style="position: absolute; top: 15px; left: 12px; right: 12px; z-index: 20; pointer-events: none; display: flex; flex-direction: column; gap: 8px;"'
    );
  }

  // Let's just blindly replace the style string because it might be varying.
  code = code.replace(
    /class="active-order-container" style="[^"]*"/g,
    'class="active-order-container" style="position: absolute; top: 15px; left: 12px; right: 12px; z-index: 20; pointer-events: none; display: block;"'
  );

  // Since we changed to display: block, the gap: 8px won't work. We need margin-bottom on the children.
  code = code.replace(
    /class="floating-order-bar" @click="isOrderExpanded = !isOrderExpanded" style="pointer-events: auto;"/g,
    'class="floating-order-bar" @click="isOrderExpanded = !isOrderExpanded" style="pointer-events: auto; margin-bottom: 8px;"'
  );

  // Feedback widget
  code = code.replace(
    /style="animation: fadeIn 0.3s ease; box-shadow: 0 4px 20px rgba\(0,0,0,0.4\); border-radius: 16px;"/g,
    'style="animation: fadeIn 0.3s ease; box-shadow: 0 4px 20px rgba(0,0,0,0.4); border-radius: 16px; pointer-events: auto; margin-top: 8px;"'
  );

  fs.writeFileSync(filePath, code);
}

makeBulletproof('src/views/ClientView.vue');
makeBulletproof('src/components/PhoneMockupContent.vue');
console.log('Applied bulletproof styles');

