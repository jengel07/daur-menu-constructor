const fs = require('fs');
let path = 'src/views/ClientView.vue';
let code = fs.readFileSync(path, 'utf8');

// 1. Find the feedback widget block
const widgetRegex = /<div class="feedback-widget">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/;
const match = code.match(widgetRegex);

if (match) {
  let widgetHtml = match[0];
  code = code.replace(widgetHtml, '');

  // 2. Find the floating-order-bar block
  const barRegex = /<div v-if="activeOrderId && !showCheckoutModal" class="floating-order-bar" :class="'status-' \+ activeOrderStatus">\s*<div class="order-bar-text">[\s\S]*?<\/div>\s*<button v-if="activeOrderStatus === 'done'[^>]*>.*?<\/button>\s*<\/div>/;
  const barMatch = code.match(barRegex);
  
  if (barMatch) {
    let barHtml = barMatch[0];
    
    // We want to replace barHtml with the new container
    const newBarHtml = `
          <div v-if="activeOrderId && !showCheckoutModal" class="active-order-container" style="position: absolute; top: 115px; left: 12px; right: 12px; z-index: 20; display: flex; flex-direction: column; gap: 8px;">
            ${barHtml.replace(/<div v-if="activeOrderId && !showCheckoutModal" class="floating-order-bar"/, `<div class="floating-order-bar"`).replace('position: absolute;', 'position: relative;').replace('top: 115px;', '').replace('left: 12px;', '').replace('right: 12px;', '').replace('z-index: 20;', '')}
            
            <div v-if="activeOrderStatus === 'done' || activeOrderStatus === 'archived'" style="animation: fadeIn 0.3s ease; box-shadow: 0 4px 20px rgba(0,0,0,0.4); border-radius: 16px;">
              ${widgetHtml}
            </div>
          </div>
    `;

    code = code.replace(barHtml, newBarHtml);
    
    // 3. Remove CSS positioning from floating-order-bar
    code = code.replace(
      /\.floating-order-bar \{ position: absolute; top: 115px; left: 12px; right: 12px; /,
      `.floating-order-bar { position: relative; `
    );

    fs.writeFileSync(path, code);
    console.log('Successfully moved the widget!');
  } else {
    console.log('Could not match barRegex');
  }
} else {
  console.log('Could not match widgetRegex');
}

