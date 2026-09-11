const fs = require('fs');

// Fix PhoneMockupContent.vue
let path = 'src/components/PhoneMockupContent.vue';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  /:key="Date\.now\(\)"/g,
  ''
);

// Fallback to currentUser in computedRestaurantId if not there
code = code.replace(
  /const computedRestaurantId = computed\(\(\) => \{[\s\S]*?\}\);/,
  `const computedRestaurantId = computed(() => {
  try {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    return props.restaurantInfo?.id || props.restaurantInfo?.restaurantId || user.restaurantId;
  } catch (e) {
    return props.restaurantInfo?.id || props.restaurantInfo?.restaurantId;
  }
});`
);

fs.writeFileSync(path, code);


// Fix ClientView.vue
path = 'src/views/ClientView.vue';
code = fs.readFileSync(path, 'utf8');

code = code.replace(
  /const computedRestaurantId = computed\(\(\) => \{[\s\S]*?\}\);/,
  `const computedRestaurantId = computed(() => {
  try {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    return (store.restaurantInfo as any)?.id || (store.restaurantInfo as any)?.restaurantId || user.restaurantId;
  } catch (e) {
    return (store.restaurantInfo as any)?.id || (store.restaurantInfo as any)?.restaurantId;
  }
});`
);

fs.writeFileSync(path, code);

console.log('Fixed computed keys and fallbacks');

