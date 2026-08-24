const fs = require('fs');

function refactorFile(file) {
  let content = fs.readFileSync(file, 'utf8');

  // We find the activeModal ref to add variant
  if (file.includes('ClientView.vue')) {
    content = content.replace(
      "const activeModal = ref<'none' | 'cart' | 'filters' | 'search' | 'share' | 'language'>('none');",
      "const activeModal = ref<'none' | 'cart' | 'filters' | 'search' | 'share' | 'language' | 'variant'>('none');\nconst selectedVariantItem = ref<any>(null);\nconst openVariantModal = (item: any) => { selectedVariantItem.value = item; activeModal.value = 'variant'; };"
    );
  } else {
    content = content.replace(
      "const activeModal = ref<'none' | 'filters' | 'cart' | 'search' | 'share' | 'language'>('none');",
      "const activeModal = ref<'none' | 'filters' | 'cart' | 'search' | 'share' | 'language' | 'variant'>('none');\nconst selectedVariantItem = ref<any>(null);\nconst openVariantModal = (item: any) => { selectedVariantItem.value = item; activeModal.value = 'variant'; };"
    );
  }

  const oldBottomRowRegex = /<div class="card-bottom-row" style="flex-direction: column; gap: 8px;">([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/;
  const newBottomRow = `<div class="card-bottom-row" style="flex-direction: row; justify-content: space-between; align-items: center; width: 100%;">
                    <span class="price" :style="{ color: restaurantInfo.primaryColor || '#646cff', fontSize: '14px', fontWeight: 'bold' }">
                      <template v-if="!item.priceBottle && !item.priceGlass">
                        {{ Number(item.price || 0).toFixed(2) }} ₽
                      </template>
                      <template v-else>
                        {{ tDyn('от') }} {{ Number(item.priceGlass || item.priceBottle || 0).toFixed(2) }} ₽
                      </template>
                    </span>

                    <div v-if="!item.priceBottle && !item.priceGlass">
                      <div v-if="getItemQuantity(item.id) > 0" class="counter-controls" :style="{ borderColor: restaurantInfo.primaryColor || '#646cff' }">
                        <button class="counter-btn" @click="decreaseQuantity(item.id)">-</button>
                        <span class="counter-value">{{ getItemQuantity(item.id) }}</span>
                        <button class="counter-btn" @click="increaseQuantity(item.id)">+</button>
                      </div>
                      <button v-else class="add-to-cart-btn" :style="{ backgroundColor: restaurantInfo.primaryColor || '#646cff', width: 'auto', padding: '6px 12px' }" @click="addToCart(item)">
                        + {{ tDyn('добавить') }}
                      </button>
                    </div>

                    <div v-else>
                      <button class="add-to-cart-btn" :style="{ backgroundColor: restaurantInfo.primaryColor || '#646cff', width: 'auto', padding: '6px 12px' }" @click="openVariantModal(item)">
                        + {{ tDyn('выбрать') }}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>`;

  const oldBottomRowPhoneRegex = /<div style="display: flex; flex-direction: column; gap: 8px; margin-top: 8px;">([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/;
  const newBottomRowPhone = `<div style="display: flex; flex-direction: row; justify-content: space-between; align-items: center; margin-top: 8px; width: 100%;">
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
                    </div>
                  </div>
                </div>
              </div>`;


  if (file.includes('ClientView.vue')) {
    content = content.replace(oldBottomRowRegex, newBottomRow);
  } else {
    content = content.replace(oldBottomRowPhoneRegex, newBottomRowPhone);
  }

  // Inject Variant Modal
  const variantModalClient = `
        <!-- Модалка вариантов -->
        <div v-if="activeModal === 'variant' && selectedVariantItem" class="bottom-sheet-overlay" @click.self="activeModal = 'none'">
          <div class="bottom-sheet">
            <div class="sheet-indicator"></div>
            <div class="sheet-header-flex">
              <h3 style="margin: 0; font-size: 16px;">{{ getItemName(selectedVariantItem) }}</h3>
              <button class="close-modal-btn" @click="activeModal = 'none'">✕</button>
            </div>
            
            <div style="display: flex; flex-direction: column; gap: 12px; margin-top: 16px;">
              <div v-if="selectedVariantItem.priceGlass" style="display: flex; justify-content: space-between; align-items: center; background: #f9f9f9; padding: 12px; border-radius: 12px;">
                <span style="font-weight: bold; font-size: 14px;">{{ tDyn('Бокал') }}<br><span style="color: #666; font-size: 12px; font-weight: normal;">{{ Number(selectedVariantItem.priceGlass || 0).toFixed(2) }} ₽</span></span>
                
                <div v-if="getItemQuantity(selectedVariantItem.id + '_glass') > 0" class="counter-controls" :style="{ borderColor: restaurantInfo.primaryColor || '#646cff', width: '90px' }">
                  <button class="counter-btn" @click="decreaseQuantity(selectedVariantItem.id + '_glass')">-</button>
                  <span class="counter-value">{{ getItemQuantity(selectedVariantItem.id + '_glass') }}</span>
                  <button class="counter-btn" @click="increaseQuantity(selectedVariantItem.id + '_glass')">+</button>
                </div>
                <button v-else class="add-to-cart-btn" :style="{ backgroundColor: restaurantInfo.primaryColor || '#646cff', width: 'auto', padding: '8px 16px' }" @click="addToCart({ ...selectedVariantItem, id: selectedVariantItem.id + '_glass', price: selectedVariantItem.priceGlass, name: ((selectedVariantItem.name?.ru || selectedVariantItem.name) + ' (' + tDyn('Бокал') + ')') })">
                  + {{ tDyn('добавить') }}
                </button>
              </div>

              <div v-if="selectedVariantItem.priceBottle" style="display: flex; justify-content: space-between; align-items: center; background: #f9f9f9; padding: 12px; border-radius: 12px;">
                <span style="font-weight: bold; font-size: 14px;">{{ tDyn('Бутылка') }}<br><span style="color: #666; font-size: 12px; font-weight: normal;">{{ Number(selectedVariantItem.priceBottle || 0).toFixed(2) }} ₽</span></span>
                
                <div v-if="getItemQuantity(selectedVariantItem.id + '_bottle') > 0" class="counter-controls" :style="{ borderColor: restaurantInfo.primaryColor || '#646cff', width: '90px' }">
                  <button class="counter-btn" @click="decreaseQuantity(selectedVariantItem.id + '_bottle')">-</button>
                  <span class="counter-value">{{ getItemQuantity(selectedVariantItem.id + '_bottle') }}</span>
                  <button class="counter-btn" @click="increaseQuantity(selectedVariantItem.id + '_bottle')">+</button>
                </div>
                <button v-else class="add-to-cart-btn" :style="{ backgroundColor: restaurantInfo.primaryColor || '#646cff', width: 'auto', padding: '8px 16px' }" @click="addToCart({ ...selectedVariantItem, id: selectedVariantItem.id + '_bottle', price: selectedVariantItem.priceBottle, name: ((selectedVariantItem.name?.ru || selectedVariantItem.name) + ' (' + tDyn('Бутылка') + ')') })">
                  + {{ tDyn('добавить') }}
                </button>
              </div>
            </div>
          </div>
        </div>
`;

  const variantModalPhone = `
              <!-- Модалка вариантов -->
              <div v-if="activeModal === 'variant' && selectedVariantItem" class="bottom-sheet-overlay" @click.self="activeModal = 'none'">
                <div class="bottom-sheet">
                  <div class="sheet-indicator"></div>
                  <div class="sheet-header-flex">
                    <h3 style="margin: 0; font-size: 16px;">{{ getLocalizedItemName(selectedVariantItem.name) }}</h3>
                    <button class="close-modal-btn" style="border: none; background: none; font-size: 16px; cursor: pointer;" @click="activeModal = 'none'">✕</button>
                  </div>
                  
                  <div style="display: flex; flex-direction: column; gap: 12px; margin-top: 16px;">
                    <div v-if="selectedVariantItem.priceGlass" style="display: flex; justify-content: space-between; align-items: center; background: #f9f9f9; padding: 12px; border-radius: 12px;">
                      <span style="font-weight: bold; font-size: 14px;">{{ tDyn('Бокал') }}<br><span style="color: #666; font-size: 12px; font-weight: normal;">RUB {{ Number(selectedVariantItem.priceGlass || 0).toFixed(2) }}</span></span>
                      
                      <div v-if="getItemQuantity(selectedVariantItem.id + '_glass') > 0" class="counter-controls" :style="{ borderColor: currentRestaurantInfo.primaryColor, width: '90px' }">
                        <button class="counter-btn" @click="decreaseQuantity(selectedVariantItem.id + '_glass')">-</button>
                        <span class="counter-value">{{ getItemQuantity(selectedVariantItem.id + '_glass') }}</span>
                        <button class="counter-btn" @click="increaseQuantity(selectedVariantItem.id + '_glass')">+</button>
                      </div>
                      <button v-else class="add-to-cart-btn" :style="{ backgroundColor: currentRestaurantInfo.primaryColor, width: 'auto', padding: '8px 16px' }" @click="addToCart({ ...selectedVariantItem, id: selectedVariantItem.id + '_glass', price: selectedVariantItem.priceGlass, name: ((selectedVariantItem.name?.ru || selectedVariantItem.name) + ' (' + tDyn('Бокал') + ')') })">
                        + {{ t('addBtn') }}
                      </button>
                    </div>

                    <div v-if="selectedVariantItem.priceBottle" style="display: flex; justify-content: space-between; align-items: center; background: #f9f9f9; padding: 12px; border-radius: 12px;">
                      <span style="font-weight: bold; font-size: 14px;">{{ tDyn('Бутылка') }}<br><span style="color: #666; font-size: 12px; font-weight: normal;">RUB {{ Number(selectedVariantItem.priceBottle || 0).toFixed(2) }}</span></span>
                      
                      <div v-if="getItemQuantity(selectedVariantItem.id + '_bottle') > 0" class="counter-controls" :style="{ borderColor: currentRestaurantInfo.primaryColor, width: '90px' }">
                        <button class="counter-btn" @click="decreaseQuantity(selectedVariantItem.id + '_bottle')">-</button>
                        <span class="counter-value">{{ getItemQuantity(selectedVariantItem.id + '_bottle') }}</span>
                        <button class="counter-btn" @click="increaseQuantity(selectedVariantItem.id + '_bottle')">+</button>
                      </div>
                      <button v-else class="add-to-cart-btn" :style="{ backgroundColor: currentRestaurantInfo.primaryColor, width: 'auto', padding: '8px 16px' }" @click="addToCart({ ...selectedVariantItem, id: selectedVariantItem.id + '_bottle', price: selectedVariantItem.priceBottle, name: ((selectedVariantItem.name?.ru || selectedVariantItem.name) + ' (' + tDyn('Бутылка') + ')') })">
                        + {{ t('addBtn') }}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
`;

  if (file.includes('ClientView.vue')) {
    content = content.replace(/<div v-if="showCheckoutModal"/, variantModalClient + '\n\n        <div v-if="showCheckoutModal"');
  } else {
    content = content.replace(/<!-- \s*Модальное окно корзины\s*-->/, variantModalPhone + '\n\n              <!-- Модальное окно корзины -->');
  }

  fs.writeFileSync(file, content);
}

try {
  refactorFile('src/views/ClientView.vue');
  refactorFile('src/components/PhoneMockupContent.vue');
  console.log('Successfully refactored variants');
} catch(e) {
  console.error(e);
}

