const fs = require('fs');
let content = fs.readFileSync('src/components/PhoneMockupContent.vue', 'utf8');

// The price spans in PhoneMockupContent.vue for grid and list mode
const listTarget = `<span v-if="viewMode === 'list'" class="price" :style="{ color: currentRestaurantInfo.primaryColor || '#646cff' }">{{ Number(item.price || 0).toFixed(2) }} ₽</span>`;
const listReplacement = `<span v-if="viewMode === 'list'" class="price" :style="{ color: currentRestaurantInfo.primaryColor || '#646cff' }">
                    <template v-if="!item.priceBottle && !item.priceGlass">{{ Number(item.price || 0).toFixed(2) }} ₽</template>
                    <template v-else>{{ [item.priceGlass, item.priceBottle].filter(p => p).join(' / ') }} ₽</template>
                  </span>`;

content = content.replace(listTarget, listReplacement);

const gridTarget = `<span v-if="viewMode === 'grid'" class="price" :style="{ color: currentRestaurantInfo.primaryColor || '#646cff', fontSize: '14px', fontWeight: 'bold' }">{{ Number(item.price || 0).toFixed(2) }} ₽</span>`;
const gridReplacement = `<span v-if="viewMode === 'grid'" class="price" :style="{ color: currentRestaurantInfo.primaryColor || '#646cff', fontSize: '14px', fontWeight: 'bold' }">
                    <template v-if="!item.priceBottle && !item.priceGlass">{{ Number(item.price || 0).toFixed(2) }} ₽</template>
                    <template v-else>{{ [item.priceGlass, item.priceBottle].filter(p => p).join(' / ') }} ₽</template>
                  </span>`;

content = content.replace(gridTarget, gridReplacement);

// Also need to handle the variant rows (bottle/glass rows) in the PhoneMockupContent? 
// The user said "должна через слэш как и в конструкторе (200/1000)".
// Wait! If they want it through slash, I should probably just replace the entire card-bottom-row logic to match ClientView!
fs.writeFileSync('src/components/PhoneMockupContent.vue', content);
console.log('PhoneMockupContent price tags fixed');

