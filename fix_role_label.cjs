const fs = require('fs');

let path = 'src/Constructor.vue';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  /const getRoleLabel = \(role: string\) =>\s*\(\{\s*cook: '[^']+', chef: '[^']+', waiter: '[^']+', admin: '[^']+'\s*\}\)\[role\] \|\| role;/g,
  `const getRoleLabel = (role: string) =>
  ({ cook: '👨‍🍳 Повар', chef: '👨‍🍳 Повар', waiter: '👱‍♀️🍽️ Официант', barista: '☕ Бармен', admin: '👑 Администратор' })[role] || role;`
);

fs.writeFileSync(path, code);
console.log('Fixed getRoleLabel in Constructor.vue');

