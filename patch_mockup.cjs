const fs = require('fs');
const path = 'src/components/PhoneMockupContent.vue';
let code = fs.readFileSync(path, 'utf8');

// Import PromoBanners
code = code.replace(
  "import { useMenuStore } from '../store/menuStore';",
  "import { useMenuStore } from '../store/menuStore';\nimport PromoBanners from './client/PromoBanners.vue';"
);

// Add PromoBanners above <div class="phone-categories">
// We use a regex with global flag to replace all instances (fullscreen and normal)
code = code.replace(
  /<!-- [А-Яа-яA-Za-z\s]*Категории блюд[А-Яа-яA-Za-z\s]*-->\s*<div class="phone-categories">/g,
  `<PromoBanners v-if="currentRestaurantInfo?.id || JSON.parse(localStorage.getItem('currentUser') || '{}').restaurantId" :restaurantId="currentRestaurantInfo?.id || JSON.parse(localStorage.getItem('currentUser') || '{}').restaurantId" :key="Date.now()" />
                <!-- Категории блюд -->
                <div class="phone-categories">`
);

// If the regex above fails because the comment is different, let's also try directly replacing <div class="phone-categories">
if (!code.includes('<PromoBanners')) {
  code = code.replace(
    /<div class="phone-categories">/g,
    `<PromoBanners v-if="currentRestaurantInfo?.id || JSON.parse(localStorage.getItem('currentUser') || '{}').restaurantId" :restaurantId="currentRestaurantInfo?.id || JSON.parse(localStorage.getItem('currentUser') || '{}').restaurantId" :key="Date.now()" />
                    <div class="phone-categories">`
  );
}

fs.writeFileSync(path, code);
console.log('PhoneMockupContent.vue patched');

