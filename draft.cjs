const fs = require('fs');
let path = 'src/views/ClientView.vue';
let code = fs.readFileSync(path, 'utf8');

const regex = /<div class="feedback-widget">[\s\S]*?<\/a>\s*<\/div>\s*<\/div>\s*<\/div>/;
const match = code.match(regex);

if (match) {
  let widgetHtml = match[0];
  code = code.replace(widgetHtml, '');

  const orderBarRegex = /<div v-if="activeOrderId && !showCheckoutModal" class="floating-order-bar" :class="'status-' \+ activeOrderStatus">([\s\S]*?)<\/div>\s*<\/div>/;
  const barMatch = code.match(orderBarRegex);
  if (barMatch) {
    let orderBarInner = barMatch[1];
    
    // We only want the inner part without the outer </div>
    // wait, the regex captures the inner part correctly? 
    // let's just replace the whole match:
    
    // Actually, `</div>\s*</div>` is matching too much because `floating-order-bar` only has ONE `</div>` to close it, since there's an inner `div.order-bar-text` and a `<button>`.
    // Wait, `<div class="order-bar-text">...</div> <button>...</button> </div>`.
  }
}

