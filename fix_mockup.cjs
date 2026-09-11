const fs = require('fs');
const path = 'src/components/PhoneMockupContent.vue';
let code = fs.readFileSync(path, 'utf8');

// 1. Add computedRestaurantId to script
const scriptSetupRegex = /<script setup lang="ts">\s*import { ref, computed, reactive } from 'vue';/;
code = code.replace(scriptSetupRegex, `<script setup lang="ts">
import { ref, computed, reactive } from 'vue';

const computedRestaurantId = computed(() => {
  try {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    return props.restaurantInfo?.id || user.restaurantId;
  } catch (e) {
    return props.restaurantInfo?.id;
  }
});`);

// 2. Fix the template
code = code.replace(
  /<PromoBanners v-if="currentRestaurantInfo\?\.id \|\| JSON.parse\(localStorage.getItem\('currentUser'\) \|\| '\{\}'\)\.restaurantId" :restaurantId="currentRestaurantInfo\?\.id \|\| JSON.parse\(localStorage.getItem\('currentUser'\) \|\| '\{\}'\)\.restaurantId" :key="Date\.now\(\)" \/>/g,
  `<PromoBanners v-if="computedRestaurantId" :restaurantId="computedRestaurantId" :key="Date.now()" />`
);

fs.writeFileSync(path, code);
console.log('PhoneMockupContent.vue fixed');

