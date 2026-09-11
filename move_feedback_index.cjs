const fs = require('fs');
let path = 'src/views/ClientView.vue';
let code = fs.readFileSync(path, 'utf8');

const startStr = `<div class="feedback-widget">`;
const endStr = `                        </a>\n                      </div>\n                    </div>\n                  </div>`;

let startIndex = code.indexOf(startStr);
let endIndex = code.indexOf(endStr, startIndex);

if (startIndex !== -1 && endIndex !== -1) {
  endIndex += endStr.length;
  let widgetHtml = code.substring(startIndex, endIndex);
  
  // Remove widget from its current place
  code = code.replace(widgetHtml, '');

  const orderBarStart = `<div v-if="activeOrderId && !showCheckoutModal" class="floating-order-bar" :class="'status-' + activeOrderStatus">`;
  const orderBarEnd = `            </div>`; // end of floating-order-bar

  let barStartIndex = code.indexOf(orderBarStart);
  let barEndIndex = code.indexOf(orderBarEnd, barStartIndex);
  if (barStartIndex !== -1 && barEndIndex !== -1) {
    barEndIndex += orderBarEnd.length;
    let orderBarHtml = code.substring(barStartIndex, barEndIndex);

    const newStructure = `
          <div v-if="activeOrderId && !showCheckoutModal" class="active-order-container" style="position: absolute; top: 115px; left: 12px; right: 12px; z-index: 20; display: flex; flex-direction: column; gap: 8px;">
            <div class="floating-order-bar" :class="'status-' + activeOrderStatus" style="position: static; width: 100%; box-shadow: 0 4px 15px rgba(0,0,0,0.3);">
${orderBarHtml.replace(orderBarStart, `              <div class="order-bar-text">`).replace(`            </div>`, `            </div>`)}
            
            <div v-if="activeOrderStatus === 'done' || activeOrderStatus === 'archived'" style="animation: fadeIn 0.3s ease;">
              ${widgetHtml}
            </div>
          </div>
    `;

    // Wait, the replace string logic above is a bit messy. Let's do it cleaner.
    const cleanOrderBarInner = orderBarHtml.replace(orderBarStart, '').replace(/<\/div>$/, '');

    const finalStructure = `          <div v-if="activeOrderId && !showCheckoutModal" class="active-order-container" style="position: absolute; top: 115px; left: 12px; right: 12px; z-index: 20; display: flex; flex-direction: column; gap: 8px;">
            <div class="floating-order-bar" :class="'status-' + activeOrderStatus" style="position: static; width: 100%; box-shadow: 0 4px 15px rgba(0,0,0,0.3);">
${cleanOrderBarInner}            </div>
            
            <div v-if="activeOrderStatus === 'done' || activeOrderStatus === 'archived'" style="animation: fadeIn 0.3s ease; box-shadow: 0 4px 20px rgba(0,0,0,0.4); border-radius: 16px;">
              ${widgetHtml}
            </div>
          </div>`;

    code = code.replace(orderBarHtml, finalStructure);

    // Remove absolute position from floating-order-bar
    code = code.replace(
      /\.floating-order-bar \{ position: absolute; top: 115px; left: 12px; right: 12px; /,
      `.floating-order-bar { `
    );

    fs.writeFileSync(path, code);
    console.log('Moved widget successfully!');
  } else {
    console.log('Could not find floating-order-bar');
  }
} else {
  console.log('Could not find feedback-widget endpoints');
}

