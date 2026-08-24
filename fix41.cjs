const fs = require('fs');

// 1. Fix backend
let backendContent = fs.readFileSync('daur-menu-backend/orders.js', 'utf8');
backendContent = backendContent.replace(
  /const allowedStatuses = \['new', 'progress', 'done', 'cancelled'\];/,
  "const allowedStatuses = ['new', 'progress', 'done', 'cancelled', 'archived'];"
);
fs.writeFileSync('daur-menu-backend/orders.js', backendContent);

// 2. Fix OrderSettingsEditor.vue declaration order
let frontendContent = fs.readFileSync('src/components/OrderSettingsEditor.vue', 'utf8');

const groupedLogicMatch = frontendContent.match(/const groupedArchivedOrders = computed\(\(\) => \{[\s\S]*?\}\);\n/);
if (groupedLogicMatch) {
  const groupedLogic = groupedLogicMatch[0];
  frontendContent = frontendContent.replace(groupedLogic, '');
  
  // insert after filteredOrders
  frontendContent = frontendContent.replace(
    /const filteredOrders = computed\(\(\) => \{[\s\S]*?\}\);\n/,
    match => match + '\n' + groupedLogic
  );
  
  fs.writeFileSync('src/components/OrderSettingsEditor.vue', frontendContent);
  console.log('Fixed OrderSettingsEditor order');
} else {
  console.log('Could not find groupedArchivedOrders');
}

