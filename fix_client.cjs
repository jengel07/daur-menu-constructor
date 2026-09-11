const fs = require('fs');
const path = 'src/views/ClientView.vue';
let code = fs.readFileSync(path, 'utf8');

// 1. Add computedRestaurantId to script
const scriptSetupRegex = /<script setup lang="ts">\s*import { ref, computed, onMounted, onUnmounted, reactive } from 'vue';/;
code = code.replace(scriptSetupRegex, `<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, reactive } from 'vue';

const computedRestaurantId = computed(() => {
  return (store.restaurantInfo as any)?.id || (store.restaurantInfo as any)?.restaurantId;
});`);

// 2. Fix the template
code = code.replace(
  /<PromoBanners v-if="store\.restaurantInfo\?\.id" :restaurant-id="store\.restaurantInfo\.id" \/>/g,
  `<PromoBanners v-if="computedRestaurantId" :restaurant-id="computedRestaurantId" />`
);

fs.writeFileSync(path, code);
console.log('ClientView.vue fixed');

