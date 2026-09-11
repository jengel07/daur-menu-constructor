const fs = require('fs');
const path = 'src/views/ClientView.vue';
let code = fs.readFileSync(path, 'utf8');

// Import PromoBanners
code = code.replace(
  "import CheckoutModal from '../components/CheckoutModal.vue';",
  "import CheckoutModal from '../components/CheckoutModal.vue';\nimport PromoBanners from '../components/client/PromoBanners.vue';"
);

// Add PromoBanners above categories
code = code.replace(
  '<div class="phone-categories">',
  '<PromoBanners :restaurant-id="store.restaurantInfo.id" />\n\n          <div class="phone-categories">'
);

fs.writeFileSync(path, code);
console.log('ClientView.vue patched');

