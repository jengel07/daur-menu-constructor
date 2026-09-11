const fs = require('fs');
const path = 'src/components/client/PromoBanners.vue';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  'onMounted(async () => {',
  `onMounted(async () => {
  console.log("PromoBanners mounted with restaurantId:", props.restaurantId);
  console.log("LocalStorage currentUser:", localStorage.getItem('currentUser'));`
);

fs.writeFileSync(path, code);
console.log('Added logs to PromoBanners.vue');

