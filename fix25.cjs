const fs = require('fs');

function applyNowrap(file) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/.price \{ font-weight: bold; font-size: 11px; \}/, '.price { font-weight: bold; font-size: 11px; white-space: nowrap; }');
  content = content.replace(/.menu-list-row .price \{ font-size: 12px; margin-bottom: 2px; \}/, '.menu-list-row .price { font-size: 12px; margin-bottom: 2px; white-space: nowrap; }');
  
  // also add it explicitly to the tags just in case
  content = content.replace(/class="price" :style="\{ color: restaurantInfo.primaryColor \|\| '#646cff' \}"/g, `class="price" :style="{ color: restaurantInfo.primaryColor || '#646cff', whiteSpace: 'nowrap' }"`);
  content = content.replace(/class="price" :style="\{ color: restaurantInfo.primaryColor \|\| '#646cff', fontSize: '14px', fontWeight: 'bold' \}"/g, `class="price" :style="{ color: restaurantInfo.primaryColor || '#646cff', fontSize: '14px', fontWeight: 'bold', whiteSpace: 'nowrap' }"`);
  
  // PhoneMockupContent uses currentRestaurantInfo
  content = content.replace(/class="price" :style="\{ color: currentRestaurantInfo.primaryColor \|\| '#646cff' \}"/g, `class="price" :style="{ color: currentRestaurantInfo.primaryColor || '#646cff', whiteSpace: 'nowrap' }"`);
  content = content.replace(/class="price" :style="\{ color: currentRestaurantInfo.primaryColor \|\| '#646cff', fontSize: '14px', fontWeight: 'bold' \}"/g, `class="price" :style="{ color: currentRestaurantInfo.primaryColor || '#646cff', fontSize: '14px', fontWeight: 'bold', whiteSpace: 'nowrap' }"`);

  fs.writeFileSync(file, content);
}

applyNowrap('src/views/ClientView.vue');
applyNowrap('src/components/PhoneMockupContent.vue');

console.log('Fixed line wrapping on prices');

