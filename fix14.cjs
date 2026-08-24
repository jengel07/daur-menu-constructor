const fs = require('fs');
let content = fs.readFileSync('src/views/ClientView.vue', 'utf8');

const oldStart = '<div class="card-bottom-row" style="flex-direction: column; gap: 8px;">';
const startIndex = content.indexOf(oldStart);

if (startIndex === -1) {
  console.log("oldStart not found");
  process.exit(1);
}

// Find the corresponding closing div!
let currentIdx = startIndex;
let divCount = 0;
let endIndex = -1;

const divRegex = /<div|<\/div>/g;
divRegex.lastIndex = startIndex;

let match;
while ((match = divRegex.exec(content)) !== null) {
  if (match[0] === '<div') divCount++;
  else divCount--;
  
  if (divCount === 0) {
    endIndex = match.index + 6; // include </div>
    break;
  }
}

if (endIndex !== -1) {
  const oldHTML = content.substring(startIndex, endIndex);
  
  const newHTML = `<div class="card-bottom-row" style="flex-direction: row; justify-content: space-between; width: 100%; align-items: center;">
                  <span v-if="viewMode === 'grid'" class="price" :style="{ color: restaurantInfo.primaryColor || '#646cff', fontSize: '14px', fontWeight: 'bold' }">
                    <template v-if="!item.priceBottle && !item.priceGlass">
                      {{ Number(item.price || 0).toFixed(2) }} ₽
                    </template>
                    <template v-else>
                      {{ tDyn('от') }} {{ Number(item.priceGlass || item.priceBottle || 0).toFixed(2) }} ₽
                    </template>
                  </span>
                  
                  <div v-else></div>

                  <div v-if="!item.priceBottle && !item.priceGlass">
                    <div v-if="getItemQuantity(item.id) > 0" class="counter-controls" :style="{ borderColor: restaurantInfo.primaryColor || '#646cff' }">
                      <button class="counter-btn" @click="decreaseQuantity(item.id)">-</button>
                      <span class="counter-value">{{ getItemQuantity(item.id) }}</span>
                      <button class="counter-btn" @click="increaseQuantity(item.id)">+</button>
                    </div>
                    <button v-else class="add-to-cart-btn" :style="{ backgroundColor: restaurantInfo.primaryColor || '#646cff', width: 'auto', padding: '6px 12px' }" @click="addToCart(item)">+ {{ tDyn('добавить') }}</button>
                  </div>

                  <div v-else>
                    <button class="add-to-cart-btn" :style="{ backgroundColor: restaurantInfo.primaryColor || '#646cff', width: 'auto', padding: '6px 12px' }" @click="openVariantModal(item)">
                      + {{ tDyn('выбрать') }}
                    </button>
                  </div>
                </div>`;
                
  content = content.replace(oldHTML, newHTML);
  fs.writeFileSync('src/views/ClientView.vue', content);
  console.log("Successfully replaced card-bottom-row via AST!");
} else {
  console.log("Could not find matching div");
}

