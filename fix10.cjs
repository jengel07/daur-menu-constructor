const fs = require('fs');

const file = 'src/views/ClientView.vue';
let content = fs.readFileSync(file, 'utf8');

// 1. Replace the bottom row
const oldBottomRow = `                <div class="card-bottom-row" style="flex-direction: column; gap: 8px;">
                  <div v-if="!item.priceBottle && !item.priceGlass" style="display: flex; justify-content: space-between; width: 100%; align-items: center;">
                    <span v-if="viewMode === 'grid'" class="price" :style="{ color: restaurantInfo.primaryColor || '#646cff' }">{{ Number(item.price || 0).toFixed(2) }} ₽</span>
                    
                    <div v-if="getItemQuantity(item.id) > 0" class="counter-controls" :style="{ borderColor: restaurantInfo.primaryColor || '#646cff' }">
                      <button class="counter-btn" @click="decreaseQuantity(item.id)">-</button>
                      <span class="counter-value">{{ getItemQuantity(item.id) }}</span>
                      <button class="counter-btn" @click="increaseQuantity(item.id)">+</button>
                    </div>
                    <button v-else class="add-to-cart-btn" :style="{ backgroundColor: restaurantInfo.primaryColor || '#646cff', width: 'auto', padding: '6px 12px' }" @click="addToCart(item)">+ {{ tDyn('добавить') }}</button>
                  </div>

                  

                  <div v-if="item.priceGlass" style="display: flex; justify-content: space-between; width: 100%; align-items: center;">
                    <span class="price" :style="{ color: restaurantInfo.primaryColor || '#646cff', fontSize: '12px' }">{{ tDyn('Бокал') }}: {{ Number(item.priceGlass || 0).toFixed(2) }} ₽</span>
                    
                    <div v-if="getItemQuantity(item.id + '_glass') > 0" class="counter-controls" :style="{ borderColor: restaurantInfo.primaryColor || '#646cff', width: '80px', padding: '4px 8px' }">
                      <button class="counter-btn" @click="decreaseQuantity(item.id + '_glass')">-</button>
                      <span class="counter-value">{{ getItemQuantity(item.id + '_glass') }}</span>
                      <button class="counter-btn" @click="increaseQuantity(item.id + '_glass')">+</button>
                    </div>
                    <button v-else class="add-to-cart-btn" :style="{ backgroundColor: restaurantInfo.primaryColor || '#646cff', width: 'auto', padding: '4px 10px', fontSize: '10px' }" @click="addToCart({ ...item, id: item.id + '_glass', price: item.priceGlass, name: ((item.name as any)?.ru || item.name) + ' (' + tDyn('Бокал') + ')' })">+ {{ tDyn('добавить') }}</button>
                  </div>

                  <div v-if="item.priceBottle" style="display: flex; justify-content: space-between; width: 100%; align-items: center;">
                    <span class="price" :style="{ color: restaurantInfo.primaryColor || '#646cff', fontSize: '12px' }">{{ tDyn('Бутылка') }}: {{ Number(item.priceBottle || 0).toFixed(2) }} ₽</span>
                    
                    <div v-if="getItemQuantity(item.id + '_bottle') > 0" class="counter-controls" :style="{ borderColor: restaurantInfo.primaryColor || '#646cff', width: '80px', padding: '4px 8px' }">
                      <button class="counter-btn" @click="decreaseQuantity(item.id + '_bottle')">-</button>
                      <span class="counter-value">{{ getItemQuantity(item.id + '_bottle') }}</span>
                      <button class="counter-btn" @click="increaseQuantity(item.id + '_bottle')">+</button>
                    </div>
                    <button v-else class="add-to-cart-btn" :style="{ backgroundColor: restaurantInfo.primaryColor || '#646cff', width: 'auto', padding: '4px 10px', fontSize: '10px' }" @click="addToCart({ ...item, id: item.id + '_bottle', price: item.priceBottle, name: ((item.name as any)?.ru || item.name) + ' (' + tDyn('Бутылка') + ')' })">+ {{ tDyn('добавить') }}</button>
                  </div>
                </div>`;

const newBottomRow = `                <div class="card-bottom-row" style="flex-direction: row; justify-content: space-between; width: 100%; align-items: center;">
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

content = content.replace(oldBottomRow, newBottomRow);


// 2. Add VariantModal
const variantModal = `        <!-- Модалка вариантов -->
        <div v-if="activeModal === 'variant' && selectedVariantItem" class="checkout-modal-overlay" @click.self="activeModal = 'none'">
          <div class="checkout-modal" style="border-radius: 20px 20px 0 0;">
            <div class="checkout-header">
              <h3 style="margin: 0; font-size: 16px;">{{ getItemName(selectedVariantItem) }}</h3>
              <button class="close-modal-btn" @click="activeModal = 'none'">✕</button>
            </div>
            
            <div style="display: flex; flex-direction: column; gap: 12px; margin-top: 16px;">
              <div v-if="selectedVariantItem.priceGlass" style="display: flex; justify-content: space-between; align-items: center; background: #f9f9f9; padding: 12px; border-radius: 12px;">
                <span style="font-weight: bold; font-size: 14px; color: #111;">{{ tDyn('Бокал') }}<br><span style="color: #666; font-size: 12px; font-weight: normal;">{{ Number(selectedVariantItem.priceGlass || 0).toFixed(2) }} ₽</span></span>
                
                <div v-if="getItemQuantity(selectedVariantItem.id + '_glass') > 0" class="counter-controls" :style="{ borderColor: restaurantInfo.primaryColor || '#646cff', width: '90px' }">
                  <button class="counter-btn" @click="decreaseQuantity(selectedVariantItem.id + '_glass')">-</button>
                  <span class="counter-value">{{ getItemQuantity(selectedVariantItem.id + '_glass') }}</span>
                  <button class="counter-btn" @click="increaseQuantity(selectedVariantItem.id + '_glass')">+</button>
                </div>
                <button v-else class="add-to-cart-btn" :style="{ backgroundColor: restaurantInfo.primaryColor || '#646cff', width: 'auto', padding: '8px 16px', color: 'white' }" @click="addToCart({ ...selectedVariantItem, id: selectedVariantItem.id + '_glass', price: selectedVariantItem.priceGlass, name: ((selectedVariantItem.name?.ru || selectedVariantItem.name) + ' (' + tDyn('Бокал') + ')') })">
                  + {{ tDyn('добавить') }}
                </button>
              </div>

              <div v-if="selectedVariantItem.priceBottle" style="display: flex; justify-content: space-between; align-items: center; background: #f9f9f9; padding: 12px; border-radius: 12px;">
                <span style="font-weight: bold; font-size: 14px; color: #111;">{{ tDyn('Бутылка') }}<br><span style="color: #666; font-size: 12px; font-weight: normal;">{{ Number(selectedVariantItem.priceBottle || 0).toFixed(2) }} ₽</span></span>
                
                <div v-if="getItemQuantity(selectedVariantItem.id + '_bottle') > 0" class="counter-controls" :style="{ borderColor: restaurantInfo.primaryColor || '#646cff', width: '90px' }">
                  <button class="counter-btn" @click="decreaseQuantity(selectedVariantItem.id + '_bottle')">-</button>
                  <span class="counter-value">{{ getItemQuantity(selectedVariantItem.id + '_bottle') }}</span>
                  <button class="counter-btn" @click="increaseQuantity(selectedVariantItem.id + '_bottle')">+</button>
                </div>
                <button v-else class="add-to-cart-btn" :style="{ backgroundColor: restaurantInfo.primaryColor || '#646cff', width: 'auto', padding: '8px 16px', color: 'white' }" @click="addToCart({ ...selectedVariantItem, id: selectedVariantItem.id + '_bottle', price: selectedVariantItem.priceBottle, name: ((selectedVariantItem.name?.ru || selectedVariantItem.name) + ' (' + tDyn('Бутылка') + ')') })">
                  + {{ tDyn('добавить') }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div v-if="showCheckoutModal"`;
content = content.replace(/<div v-if="showCheckoutModal"/, variantModal);


// 3. Update the activeModal ref type
content = content.replace(
  "const activeModal = ref<'none' | 'cart' | 'filters' | 'search' | 'share' | 'language'>('none');",
  "const activeModal = ref<'none' | 'cart' | 'filters' | 'search' | 'share' | 'language' | 'variant'>('none');\nconst selectedVariantItem = ref<any>(null);\nconst openVariantModal = (item: any) => { selectedVariantItem.value = item; activeModal.value = 'variant'; };"
);

fs.writeFileSync(file, content);
console.log('ClientView successfully refactored');

