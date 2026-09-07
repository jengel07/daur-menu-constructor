const fs = require('fs');
let ordersCode = fs.readFileSync('daur-menu-backend/orders.js', 'utf8');
ordersCode = ordersCode.replace('restaurantInfo.name', 'info.name');
fs.writeFileSync('daur-menu-backend/orders.js', ordersCode);
console.log('Fixed orders.js');

