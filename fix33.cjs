const fs = require('fs');
let content = fs.readFileSync('src/components/OrderSettingsEditor.vue', 'utf8');

// fix currentTab type
content = content.replace(
  /const currentTab = ref<'new' \| 'progress' \| 'done' \| 'cancelled'>\('new'\);/,
  "const currentTab = ref<'new' | 'progress' | 'done' | 'cancelled' | 'archived'>('new');"
);

// replace typeLabel with getOrderTypeLabel inside the archive block
content = content.replace(/\{\{\stypeLabel\(order.type\)\s\}\}/g, "{{ getOrderTypeLabel(order.type) }}");

fs.writeFileSync('src/components/OrderSettingsEditor.vue', content);
console.log('Fixed OrderSettingsEditor types');

