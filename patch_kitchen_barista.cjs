const fs = require('fs');
let code = fs.readFileSync('src/views/KitchenOrders.vue', 'utf8');

// 1. Update roleLabel
const labelOld = `const roleLabel = role === 'cook' ? '👨‍🍳 Повар' : role === 'waiter' ? '🤵 Официант' : '🛠️ Персонал'`;
const labelNew = `const roleLabel = role === 'cook' ? '👨‍🍳 Повар' : role === 'waiter' ? '🤵 Официант' : role === 'barista' ? '☕ Бариста' : '🛠️ Персонал'`;
code = code.replace(labelOld, labelNew);

// 2. Update isNewToWaiter
const waiterOld = `const isNewToWaiter = role === 'waiter' && (o.status === 'new' || o.status === 'open' || o.status === 'done') && oldStatus !== o.status;`;
const waiterNew = `const isNewToWaiter = (role === 'waiter' || role === 'barista') && (o.status === 'new' || o.status === 'open' || o.status === 'done') && oldStatus !== o.status;`;
code = code.replace(waiterOld, waiterNew);

fs.writeFileSync('src/views/KitchenOrders.vue', code);
console.log('KitchenOrders.vue patched!');

