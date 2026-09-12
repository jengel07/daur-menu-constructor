const fs = require('fs');
let code = fs.readFileSync('daur-menu-backend/index.js', 'utf8');

code = code.replace(
`        if (items.length > 0) {
          const formattedDishes = items.map(dish => ({`,
`        if (items.length > 0) {
          console.log("First item modifiers received:", items[0] && items[0].modifiers);
          const formattedDishes = items.map(dish => ({`
);

fs.writeFileSync('daur-menu-backend/index.js', code);
console.log('Added console.log');

