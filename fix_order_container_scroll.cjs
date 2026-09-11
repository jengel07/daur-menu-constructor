const fs = require('fs');
let path = 'src/views/ClientView.vue';
let code = fs.readFileSync(path, 'utf8');

// Update active-order-container styles
code = code.replace(
  /class="active-order-container" style="position: absolute; top: 115px; left: 12px; right: 12px; z-index: 20; display: flex; flex-direction: column; gap: 8px;"/g,
  `class="active-order-container" style="position: absolute; top: 115px; left: 12px; right: 12px; bottom: 80px; z-index: 20; display: flex; flex-direction: column; gap: 8px; overflow-y: auto; padding-bottom: 16px; scrollbar-width: none;"`
);

fs.writeFileSync(path, code);
console.log('Fixed active-order-container overflow');

