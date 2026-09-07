const fs = require('fs');
let code = fs.readFileSync('src/Constructor.vue', 'utf8');

// 1. Add barista to select dropdown
const selectOld = `<option value="waiter">🤵 Официант</option>
                <option value="admin">🛒 Администратор</option>`;
const selectNew = `<option value="waiter">🤵 Официант</option>
                <option value="barista">☕ Бариста</option>
                <option value="admin">🛒 Администратор</option>`;
code = code.replace(selectOld, selectNew);

// 2. Add barista to getRoleLabel
const labelOld = `cook: '👨‍🍳 Повар', chef: '👨‍🍳 Повар', waiter: '🤵 Официант', admin: '🛒 Администратор'`;
const labelNew = `cook: '👨‍🍳 Повар', chef: '👨‍🍳 Повар', waiter: '🤵 Официант', barista: '☕ Бариста', admin: '🛒 Администратор'`;
code = code.replace(labelOld, labelNew);

fs.writeFileSync('src/Constructor.vue', code);
console.log('Constructor.vue patched!');

