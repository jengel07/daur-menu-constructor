const fs = require('fs');
let content = fs.readFileSync('src/components/MenuEditor.vue', 'utf8');

// 1. Update the price display in the admin card
content = content.replace(
  '<span class="item-price">{{ item.price }} ₽</span>',
  `<span class="item-price">
            <template v-if="!item.priceBottle && !item.priceGlass">{{ item.price }} ₽</template>
            <template v-else>{{ [item.priceGlass, item.priceBottle].filter(p => p).join(' / ') }} ₽</template>
          </span>`
);

// 2. Hide the general price in the edit modal if variants are set, OR just show it side-by-side but clarify.
// The user said: "где редактируешь блюду у напитков не нужна общая цена там пусть будет двойная уена к примеру 100/1000"
// "where you edit the dish, for drinks the general price is not needed, let there be a double price 100/1000"
// Let's modify the form fields in the modal.
const oldFormFields = `<div class="form-row">
          <div class="form-group">
            <label>Цена (₽)</label>
            <input v-model.number="editingItem.price" type="number" min="0" placeholder="Стандартная цена" />
          </div>
          
          <div class="form-group">
            <label>Цена за бокал (₽) — опционально</label>
            <input v-model.number="editingItem.priceGlass" type="number" min="0" placeholder="Для напитков" />
          </div>
          
          <div class="form-group">
            <label>Цена за бутылку (₽) — опционально</label>
            <input v-model.number="editingItem.priceBottle" type="number" min="0" placeholder="Для напитков" />
          </div>`;

const newFormFields = `<div class="form-row">
          <div class="form-group" v-if="!editingItem.priceBottle && !editingItem.priceGlass">
            <label>Цена (₽)</label>
            <input v-model.number="editingItem.price" type="number" min="0" placeholder="Стандартная цена" />
          </div>
          
          <div class="form-group">
            <label>Цена за бокал (₽)</label>
            <input v-model.number="editingItem.priceGlass" type="number" min="0" placeholder="Оставьте пустым если не нужно" />
          </div>
          
          <div class="form-group">
            <label>Цена за бутылку (₽)</label>
            <input v-model.number="editingItem.priceBottle" type="number" min="0" placeholder="Оставьте пустым если не нужно" />
          </div>`;

content = content.replace(oldFormFields, newFormFields);

fs.writeFileSync('src/components/MenuEditor.vue', content);
console.log('Successfully updated MenuEditor.vue');

