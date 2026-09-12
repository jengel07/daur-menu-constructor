const fs = require('fs');

function updateStyles(filePath) {
  let code = fs.readFileSync(filePath, 'utf8');

  // Fix container: Remove bottom: 80px and add pointer-events: none; but KEEP display: flex
  code = code.replace(
    'bottom: 80px; z-index: 20; display: flex;',
    'z-index: 20; display: flex; pointer-events: none; max-height: calc(100% - 100px);'
  );

  // floating-order-bar
  code = code.replace(
    'class="floating-order-bar" @click="isOrderExpanded = !isOrderExpanded"',
    'class="floating-order-bar" @click="isOrderExpanded = !isOrderExpanded" style="pointer-events: auto;"'
  );

  // order-receipt-card
  code = code.replace(
    'class="order-receipt-card" style="margin-top: 8px;"',
    'class="order-receipt-card" style="margin-top: 8px; pointer-events: auto;"'
  );

  // feedback widget wrapper
  code = code.replace(
    'class="feedback-widget"',
    'class="feedback-widget" style="pointer-events: auto;"'
  );

  fs.writeFileSync(filePath, code);
}

updateStyles('src/views/ClientView.vue');
updateStyles('src/components/PhoneMockupContent.vue');

// Also apply the persistence and rewrite_confirm logic because we reverted!
const persist = fs.readFileSync('persist_form.cjs', 'utf8');
eval(persist);

const rewrite = fs.readFileSync('rewrite_confirm.cjs', 'utf8');
eval(rewrite);

const fixImport = fs.readFileSync('fix_import.cjs', 'utf8');
eval(fixImport);

