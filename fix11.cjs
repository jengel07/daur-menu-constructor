const fs = require('fs');

const file = 'src/components/PhoneMockupContent.vue';
let content = fs.readFileSync(file, 'utf8');

const oldPhoneRow = `                    <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 8px;">
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

const newPhoneRow = `                    <div style="display: flex; flex-direction: row; justify-content: space-between; align-items: center; margin-top: 8px; width: 100%;">
                      <span class="price">
                        <template v-if="!item.priceBottle && !item.priceGlass">
                          RUB {{ Number(item.price || 0).toFixed(2) }}
                        </template>
                        <template v-else>
                          {{ tDyn('от') }} RUB {{ Number(item.priceGlass || item.priceBottle || 0).toFixed(2) }}
                        </template>
                      </span>

                      <div v-if="!item.priceBottle && !item.priceGlass">
                        <div v-if="getItemQuantity(item.id) > 0" class="counter-controls" :style="{ width: '80px', padding: '4px' }">
                          <button @click="decreaseQuantity(item.id)">-</button>
                          <span>{{ getItemQuantity(item.id) }}</span>
                          <button @click="increaseQuantity(item.id)">+</button>
                        </div>
                        <button v-else class="add-to-cart-btn" :style="{ backgroundColor: currentRestaurantInfo.primaryColor, width: 'auto', padding: '4px 12px' }" @click="addToCart(item)">
                          {{ t('addBtn') }}
                        </button>
                      </div>

                      <div v-else>
                        <button class="add-to-cart-btn" :style="{ backgroundColor: currentRestaurantInfo.primaryColor, width: 'auto', padding: '4px 12px' }" @click="openVariantModal(item)">
                          + {{ tDyn('выбрать') }}
                        </button>
                      </div>
                    </div>`;

content = content.replaceAll(oldPhoneRow, newPhoneRow);


const variantModalPhone = `              <!-- Модалка вариантов -->
              <div v-if="activeModal === 'variant' && selectedVariantItem" class="bottom-sheet-overlay" @click.self="activeModal = 'none'">
                <div class="bottom-sheet">
                  <div class="sheet-indicator"></div>
                  <div class="sheet-header-flex">
                    <h3 style="margin: 0; font-size: 16px;">{{ getLocalizedItemName(selectedVariantItem.name) }}</h3>
                    <button class="close-modal-btn" style="border: none; background: none; font-size: 16px; cursor: pointer; color: #666;" @click="activeModal = 'none'">✕</button>
                  </div>
                  
                  <div style="display: flex; flex-direction: column; gap: 12px; margin-top: 16px;">
                    <div v-if="selectedVariantItem.priceGlass" style="display: flex; justify-content: space-between; align-items: center; background: #f9f9f9; padding: 12px; border-radius: 12px;">
                      <span style="font-weight: bold; font-size: 14px; color: #111;">{{ tDyn('Бокал') }}<br><span style="color: #666; font-size: 12px; font-weight: normal;">RUB {{ Number(selectedVariantItem.priceGlass || 0).toFixed(2) }}</span></span>
                      
                      <div v-if="getItemQuantity(selectedVariantItem.id + '_glass') > 0" class="counter-controls" :style="{ borderColor: currentRestaurantInfo.primaryColor, width: '90px' }">
                        <button class="counter-btn" @click="decreaseQuantity(selectedVariantItem.id + '_glass')">-</button>
                        <span class="counter-value">{{ getItemQuantity(selectedVariantItem.id + '_glass') }}</span>
                        <button class="counter-btn" @click="increaseQuantity(selectedVariantItem.id + '_glass')">+</button>
                      </div>
                      <button v-else class="add-to-cart-btn" :style="{ backgroundColor: currentRestaurantInfo.primaryColor, width: 'auto', padding: '8px 16px', color: 'white' }" @click="addToCart({ ...selectedVariantItem, id: selectedVariantItem.id + '_glass', price: selectedVariantItem.priceGlass, name: ((selectedVariantItem.name?.ru || selectedVariantItem.name) + ' (' + tDyn('Бокал') + ')') })">
                        + {{ t('addBtn') }}
                      </button>
                    </div>

                    <div v-if="selectedVariantItem.priceBottle" style="display: flex; justify-content: space-between; align-items: center; background: #f9f9f9; padding: 12px; border-radius: 12px;">
                      <span style="font-weight: bold; font-size: 14px; color: #111;">{{ tDyn('Бутылка') }}<br><span style="color: #666; font-size: 12px; font-weight: normal;">RUB {{ Number(selectedVariantItem.priceBottle || 0).toFixed(2) }}</span></span>
                      
                      <div v-if="getItemQuantity(selectedVariantItem.id + '_bottle') > 0" class="counter-controls" :style="{ borderColor: currentRestaurantInfo.primaryColor, width: '90px' }">
                        <button class="counter-btn" @click="decreaseQuantity(selectedVariantItem.id + '_bottle')">-</button>
                        <span class="counter-value">{{ getItemQuantity(selectedVariantItem.id + '_bottle') }}</span>
                        <button class="counter-btn" @click="increaseQuantity(selectedVariantItem.id + '_bottle')">+</button>
                      </div>
                      <button v-else class="add-to-cart-btn" :style="{ backgroundColor: currentRestaurantInfo.primaryColor, width: 'auto', padding: '8px 16px', color: 'white' }" @click="addToCart({ ...selectedVariantItem, id: selectedVariantItem.id + '_bottle', price: selectedVariantItem.priceBottle, name: ((selectedVariantItem.name?.ru || selectedVariantItem.name) + ' (' + tDyn('Бутылка') + ')') })">
                        + {{ t('addBtn') }}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Модальное окно корзины -->`;

content = content.replace(/<!-- \s*Модальное окно корзины\s*-->/, variantModalPhone);

content = content.replace(
  "const activeModal = ref<'none' | 'filters' | 'cart' | 'search' | 'share' | 'language'>('none');",
  "const activeModal = ref<'none' | 'filters' | 'cart' | 'search' | 'share' | 'language' | 'variant'>('none');\nconst selectedVariantItem = ref<any>(null);\nconst openVariantModal = (item: any) => { selectedVariantItem.value = item; activeModal.value = 'variant'; };"
);

fs.writeFileSync(file, content);
console.log('PhoneMockupContent successfully refactored');

