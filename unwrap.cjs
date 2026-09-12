const fs = require('fs');

function unwrapActiveOrderContainer(filePath) {
  let code = fs.readFileSync(filePath, 'utf8');

  // Replace active-order-container opening tag and floating-order-bar
  const regex1 = /<div v-if="activeOrderId && !showCheckoutModal" class="active-order-container"[\s\S]*?<div class="floating-order-bar" @click="isOrderExpanded = !isOrderExpanded"[^>]*>/;
  
  if (code.match(regex1)) {
    code = code.replace(regex1, '<div v-if="activeOrderId && !showCheckoutModal" class="floating-order-bar" @click="isOrderExpanded = !isOrderExpanded" style="position: absolute; top: 15px; left: 12px; right: 12px; z-index: 20; box-shadow: 0 4px 15px rgba(0,0,0,0.15);">');
  } else {
    console.log("Could not find active-order-container in " + filePath);
  }

  // Replace order-receipt-card
  const regex2 = /<div v-if="isOrderExpanded && activeOrderData" class="order-receipt-card"[^>]*>/;
  if (code.match(regex2)) {
    code = code.replace(regex2, '<div v-if="activeOrderId && !showCheckoutModal && isOrderExpanded && activeOrderData" class="order-receipt-card" style="position: absolute; top: 80px; left: 12px; right: 12px; z-index: 20; overflow-y: auto; max-height: 400px; scrollbar-width: none; box-shadow: 0 4px 15px rgba(0,0,0,0.15);">');
  }

  // We need to remove the closing </div> of active-order-container.
  // The structure was:
  // <active-order-container>
  //   <floating-order-bar> ... </floating-order-bar>
  //   <order-receipt-card> ... </order-receipt-card>
  // </active-order-container>
  // We can just use a specific regex to find the end of order-receipt-card or floating-order-bar.
  // Actually, wait, let's just use string replacement carefully.
  
  code = code.replace('              </div>\n            </div>\n          </div>', '              </div>\n            </div>\n');
  code = code.replace('              </div>\n            </div>\n          </div>', '              </div>\n            </div>\n');

  fs.writeFileSync(filePath, code);
  console.log('Unwrapped in ' + filePath);
}

unwrapActiveOrderContainer('src/views/ClientView.vue');
unwrapActiveOrderContainer('src/components/PhoneMockupContent.vue');

