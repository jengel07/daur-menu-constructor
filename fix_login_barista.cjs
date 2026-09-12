const fs = require('fs');

let path = 'src/views/LoginView.vue';
let code = fs.readFileSync(path, 'utf8');

if (!code.includes("lowerRole.includes('barista')")) {
  code = code.replace(
    /lowerRole\.includes\('waiter'\) \|\|/g,
    `lowerRole.includes('waiter') ||
      lowerRole.includes('barista') ||
      lowerRole.includes('бармен') ||`
  );
  fs.writeFileSync(path, code);
  console.log('Fixed LoginView.vue for barista redirect');
} else {
  console.log('Already fixed');
}

