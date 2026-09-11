const fs = require('fs');
let path = 'src/store/menuStore.ts';
let code = fs.readFileSync(path, 'utf8');

// Remove from restaurantInfo
code = code.replace(
  `    wifiPassword: '',\n    yandexReviewLink: '',`,
  `    wifiPassword: '',`
);

// Add to generalSettings
const search = `  const generalSettings = ref({
    wifiEnabled: true,
    wifiSsid: '',
    wifiPassword: '',
  });`;

const replace = `  const generalSettings = ref({
    wifiEnabled: true,
    wifiSsid: '',
    wifiPassword: '',
    yandexReviewLink: 'https://yandex.ru/maps/org/jazzve/43328610653/reviews/',
  });`;

code = code.replace(search, replace);

fs.writeFileSync(path, code);
console.log('Fixed menuStore.ts');

