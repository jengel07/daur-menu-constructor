const fs = require('fs');

let path = 'src/Constructor.vue';
let code = fs.readFileSync(path, 'utf8');

if (!code.includes('<option value="barista">')) {
  code = code.replace(
    /<option value="waiter">[^<]+<\/option>/,
    `$&
                  <option value="barista">☕ Бармен</option>`
  );
  fs.writeFileSync(path, code);
  console.log('Added barista to Constructor.vue');
} else {
  console.log('Already there');
}

