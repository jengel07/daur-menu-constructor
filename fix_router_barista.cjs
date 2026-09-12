const fs = require('fs');

let path = 'src/router.ts';
let code = fs.readFileSync(path, 'utf8');

if (!code.includes("role === 'barista'")) {
  code = code.replace(
    /const isStaffRole = role === 'cook' \|\| role === 'waiter';/g,
    `const isStaffRole = role === 'cook' || role === 'waiter' || role === 'barista';`
  );
  fs.writeFileSync(path, code);
  console.log('Fixed router.ts for barista');
} else {
  console.log('Already fixed router.ts');
}

