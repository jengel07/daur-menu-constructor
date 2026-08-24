const fs = require('fs');
let content = fs.readFileSync('src/views/ClientView.vue', 'utf8');

const target = `<span v-if="viewMode === 'list'" class="price" :style="{ color: restaurantInfo.primaryColor || '#646cff' }">{{ Number(item.price || 0).toFixed(2) }} ₽</span>`;

const replacement = `<span v-if="viewMode === 'list'" class="price" :style="{ color: restaurantInfo.primaryColor || '#646cff' }">
                    <template v-if="!item.priceBottle && !item.priceGlass">{{ Number(item.price || 0).toFixed(2) }} ₽</template>
                    <template v-else>{{ [item.priceGlass, item.priceBottle].filter(p => p).join(' / ') }} ₽</template>
                  </span>`;

content = content.replace(target, replacement);

fs.writeFileSync('src/views/ClientView.vue', content);
console.log('ClientView fixed');

