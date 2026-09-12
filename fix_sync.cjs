const fs = require('fs');
let code = fs.readFileSync('src/Constructor.vue', 'utf8');

code = code.replace(
`image: item.image || ''`,
`image: item.image || '',\n          modifiers: item.modifiers || []`
);

fs.writeFileSync('src/Constructor.vue', code);
console.log('Fixed syncToTableStorage in Constructor.vue');

