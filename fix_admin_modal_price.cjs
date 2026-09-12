const fs = require('fs');

let code = fs.readFileSync('src/components/ModifiersEditor.vue', 'utf8');

const regex = /<select v-model="group\.type" class="group-type-select">[\s\S]*?<\/select>\s*<button type="button" class="btn-icon text-red" @click="removeGroup\(gIdx\)" title="Удалить группу">🗑️<\/button>\s*<\/div>/;

const replacement = `<select v-model="group.type" class="group-type-select">
              <option value="radio">Один вариант (Радио)</option>
              <option value="checkbox">Несколько (Галочки)</option>
            </select>
            <button type="button" class="btn-icon text-red" @click="removeGroup(gIdx)" title="Удалить группу">🗑️</button>
          </div>
          <div class="group-settings" v-if="group.type === 'radio'">
            <label class="checkbox-label" style="font-size: 13px; display: flex; align-items: center; gap: 6px; margin: 8px 0 12px 0; color: #475569; cursor: pointer;">
              <input type="checkbox" v-model="group.isAbsolute" />
              Заменяет базовую цену блюда (например, для размеров)
            </label>
          </div>`;

// And update the + sign in price input
const priceRegex = /<span>\+<\/span>\s*<input v-model\.number="opt\.price"/;
const priceReplacement = `<span v-if="!group.isAbsolute">+</span>
                <input v-model.number="opt.price"`;

if (code.match(regex)) {
  code = code.replace(regex, replacement);
  code = code.replace(priceRegex, priceReplacement);
  // replace globally for the price part if multiple exist? It's inside v-for, so only 1 exists
  fs.writeFileSync('src/components/ModifiersEditor.vue', code);
  console.log('Updated ModifiersEditor.vue');
} else {
  console.log('Regex did not match ModifiersEditor.vue');
}

