const fs = require('fs');
let code = fs.readFileSync('daur-menu-backend/index.js', 'utf8');

// 1. Update adminOnly middleware
code = code.replace(/if \(role === 'cook' \|\| role === 'waiter'\) \{/g, "if (role === 'cook' || role === 'waiter' || role === 'barista') {");

// 2. Update roleMap in POST /api/auth/login
const roleMapLoginOld = `'cook': 'cook',
      'waiter': 'waiter',
      'Повар': 'cook',
      'Официант': 'waiter',`;
const roleMapLoginNew = `'cook': 'cook',
      'waiter': 'waiter',
      'barista': 'barista',
      'Повар': 'cook',
      'Официант': 'waiter',
      'Бариста': 'barista',`;
code = code.replace(roleMapLoginOld, roleMapLoginNew);

// 3. Update roleMap in POST /api/staff
const roleMapStaffOld = `const roleMap = { chef: 'cook', cook: 'cook', waiter: 'waiter', admin: 'admin' };`;
const roleMapStaffNew = `const roleMap = { chef: 'cook', cook: 'cook', waiter: 'waiter', barista: 'barista', admin: 'admin' };`;
code = code.replace(new RegExp(roleMapStaffOld.replace(/[.*+?^\${}()|[\]\\]/g, '\\$&'), 'g'), roleMapStaffNew);

// 4. Update the email text template in POST /api/staff
const emailRoleOld = `normalizedRole === 'cook' ? 'Повар' : normalizedRole === 'waiter' ? 'Официант' : normalizedRole`;
const emailRoleNew = `normalizedRole === 'cook' ? 'Повар' : normalizedRole === 'waiter' ? 'Официант' : normalizedRole === 'barista' ? 'Бариста' : normalizedRole`;
code = code.replace(new RegExp(emailRoleOld.replace(/[.*+?^\${}()|[\]\\]/g, '\\$&'), 'g'), emailRoleNew);

fs.writeFileSync('daur-menu-backend/index.js', code);
console.log('Backend patched!');

