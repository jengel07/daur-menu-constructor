const fs = require('fs');
let content = fs.readFileSync('src/components/PhoneMockupContent.vue', 'utf8');

const target = `                    <div>
                      <h3>{{ getLocalizedItemName(item.name) }}</h3>
                      <div class="price">RUB {{ Number(item.price).toFixed(2) }}</div>
                    </div>

                    <button 
                      v-if="getItemQuantity(item.id) === 0" 
                      class="add-to-cart-btn" 
                      @click="addToCart(item)"
                      :style="{ backgroundColor: currentRestaurantInfo.primaryColor }"
                    >
                      {{ t('addBtn') }}
                    </button>

                    <div v-else class="counter-controls">
                      <button @click="decreaseQuantity(item.id)">-</button>
                      <span>{{ getItemQuantity(item.id) }}</span>
                      <button @click="increaseQuantity(item.id)">+</button>
                    </div>`;

const replacement = `                    <div>
                      <h3>{{ getLocalizedItemName(item.name) }}</h3>
                    </div>
                    
                    <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 8px;">
                      <div v-if="!item.priceBottle && !item.priceGlass" style="display: flex; justify-content: space-between; align-items: center;">
                        <div class="price">RUB {{ Number(item.price || 0).toFixed(2) }}</div>
                        <button v-if="getItemQuantity(item.id) === 0" class="add-to-cart-btn" @click="addToCart(item)" :style="{ backgroundColor: currentRestaurantInfo.primaryColor, width: 'auto', padding: '4px 12px' }">{{ t('addBtn') }}</button>
                        <div v-else class="counter-controls" :style="{ width: '80px', padding: '4px' }">
                          <button @click="decreaseQuantity(item.id)">-</button>
                          <span>{{ getItemQuantity(item.id) }}</span>
                          <button @click="increaseQuantity(item.id)">+</button>
                        </div>
                      </div>

                      <div v-if="item.priceGlass" style="display: flex; justify-content: space-between; align-items: center;">
                        <div class="price" style="font-size: 12px;">{{ tDyn('Бокал') }}: RUB {{ Number(item.priceGlass || 0).toFixed(2) }}</div>
                        <button v-if="getItemQuantity(item.id + '_glass') === 0" class="add-to-cart-btn" @click="addToCart({ ...item, id: item.id + '_glass', price: item.priceGlass, name: ((item.name as any)?.ru || item.name) + ' (Бокал)' })" :style="{ backgroundColor: currentRestaurantInfo.primaryColor, width: 'auto', padding: '4px 8px', fontSize: '10px' }">{{ t('addBtn') }}</button>
                        <div v-else class="counter-controls" :style="{ width: '70px', padding: '2px 4px' }">
                          <button @click="decreaseQuantity(item.id + '_glass')">-</button>
                          <span>{{ getItemQuantity(item.id + '_glass') }}</span>
                          <button @click="increaseQuantity(item.id + '_glass')">+</button>
                        </div>
                      </div>

                      <div v-if="item.priceBottle" style="display: flex; justify-content: space-between; align-items: center;">
                        <div class="price" style="font-size: 12px;">{{ tDyn('Бутылка') }}: RUB {{ Number(item.priceBottle || 0).toFixed(2) }}</div>
                        <button v-if="getItemQuantity(item.id + '_bottle') === 0" class="add-to-cart-btn" @click="addToCart({ ...item, id: item.id + '_bottle', price: item.priceBottle, name: ((item.name as any)?.ru || item.name) + ' (Бутылка)' })" :style="{ backgroundColor: currentRestaurantInfo.primaryColor, width: 'auto', padding: '4px 8px', fontSize: '10px' }">{{ t('addBtn') }}</button>
                        <div v-else class="counter-controls" :style="{ width: '70px', padding: '2px 4px' }">
                          <button @click="decreaseQuantity(item.id + '_bottle')">-</button>
                          <span>{{ getItemQuantity(item.id + '_bottle') }}</span>
                          <button @click="increaseQuantity(item.id + '_bottle')">+</button>
                        </div>
                      </div>
                    </div>`;

// Replace ignoring precise whitespace since line endings might differ
const targetRegex = /<div>\s*<h3>\{\{\s*getLocalizedItemName\(item\.name\)\s*\}\}<\/h3>\s*<div class="price">RUB \{\{\s*Number\(item\.price\)\.toFixed\(2\)\s*\}\}<\/div>\s*<\/div>\s*<button\s*v-if="getItemQuantity\(item\.id\) === 0"\s*class="add-to-cart-btn"\s*@click="addToCart\(item\)"\s*:style="\{\s*backgroundColor:\s*currentRestaurantInfo\.primaryColor\s*\}"\s*>\s*\{\{\s*t\('addBtn'\)\s*\}\}\s*<\/button>\s*<div v-else class="counter-controls">\s*<button @click="decreaseQuantity\(item\.id\)">-<\/button>\s*<span>\{\{\s*getItemQuantity\(item\.id\)\s*\}\}<\/span>\s*<button @click="increaseQuantity\(item\.id\)">\+<\/button>\s*<\/div>/g;

if (targetRegex.test(content)) {
  content = content.replace(targetRegex, replacement);
  fs.writeFileSync('src/components/PhoneMockupContent.vue', content);
  console.log('Successfully applied multiprice UI');
} else {
  console.log('Regex did not match!');
}

