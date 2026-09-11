const fs = require('fs');
let path = 'src/views/ClientView.vue';
let code = fs.readFileSync(path, 'utf8');

// 1. Extract the feedback-widget from step 2
const feedbackRegex = /([ \t]*)<div class="feedback-widget">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/;
const match = code.match(feedbackRegex);

if (match) {
  let widgetHtml = match[0];
  code = code.replace(widgetHtml, '');
  
  // 2. Adjust formatting of widgetHtml for its new position
  // The widgetHtml currently has too much indentation, but it's fine.

  // 3. Find floating-order-bar
  const orderBarRegex = /([ \t]*)<div v-if="activeOrderId && !showCheckoutModal" class="floating-order-bar" :class="'status-' \+ activeOrderStatus">([\s\S]*?)<\/div>\s*<\/div>/;
  
  const orderBarMatch = code.match(orderBarRegex);
  if (orderBarMatch) {
    let indent = orderBarMatch[1];
    let orderBarInner = orderBarMatch[2];
    
    // Create new structure
    const newStructure = `${indent}<div v-if="activeOrderId && !showCheckoutModal" class="active-order-container" style="position: absolute; top: 115px; left: 12px; right: 12px; z-index: 20; display: flex; flex-direction: column; gap: 8px;">
${indent}  <div class="floating-order-bar" :class="'status-' + activeOrderStatus" style="position: static; width: 100%; box-shadow: 0 4px 15px rgba(0,0,0,0.3);">
${orderBarInner}  </div>
${indent}  
${indent}  <div v-if="activeOrderStatus === 'done' || activeOrderStatus === 'archived'" style="animation: fadeIn 0.3s ease;">
${widgetHtml}
${indent}  </div>
${indent}</div>`;

    code = code.replace(orderBarMatch[0], newStructure);
    
    // We also need to remove the position: absolute from the CSS of floating-order-bar because we moved it to the container
    code = code.replace(
      /\.floating-order-bar { position: absolute; top: 115px; left: 12px; right: 12px; /,
      `.floating-order-bar { `
    );

    fs.writeFileSync(path, code);
    console.log('Moved feedback widget to floating order bar');
  } else {
    console.log('Could not find floating-order-bar');
  }
} else {
  console.log('Could not find feedback-widget');
}

