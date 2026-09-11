const fs = require('fs');
const path = 'src/views/ClientView.vue';
let code = fs.readFileSync(path, 'utf8');

// Use optional chaining for id, and v-if
code = code.replace(
  '<PromoBanners :restaurant-id="store.restaurantInfo.id" />',
  '<PromoBanners v-if="store.restaurantInfo?.id" :restaurant-id="store.restaurantInfo.id" />'
);

fs.writeFileSync(path, code);
console.log('ClientView.vue patched again');

