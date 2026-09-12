const fs = require('fs');
let code = fs.readFileSync('daur-menu-backend/index.js', 'utf8');
code = code.replace(
  'modifiers: dish.modifiers ? JSON.stringify(dish.modifiers) : null',
  'modifiers: dish.modifiers || null'
);
fs.writeFileSync('daur-menu-backend/index.js', code);
console.log('Fixed modifiers in index.js');

