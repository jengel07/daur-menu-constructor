const fs = require('fs');
let path = 'src/store/menuStore.ts';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  `wifiPassword: '',`,
  `wifiPassword: '',\n    yandexReviewLink: '',`
);

fs.writeFileSync(path, code);
console.log('Added yandexReviewLink to menuStore');

