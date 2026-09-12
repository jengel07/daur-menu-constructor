const fs = require('fs');

let path = 'src/components/MenuEditor.vue';
let code = fs.readFileSync(path, 'utf8');

const regex = /<div class="form-group">\s*<label>Категория<\/label>\s*<select v-model="editingItem.categoryId" v-if="categories && categories\.length > 0">[\s\S]*?<\/div>\s*<\/div>/;

const newTemplate = `<div class="form-group">
            <label>Категория</label>
            <div style="display: flex; gap: 8px;">
              <select v-model="editingItem.categoryId" v-if="categories && categories.length > 0" style="flex: 1;">
                <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                  {{ cat.name }}
                </option>
              </select>
              <div v-else style="color: #e74c3c; font-size: 13px; padding: 6px 0; flex: 1;">
                ⚠️ Нет категорий!
              </div>
              <button type="button" class="btn-secondary" style="flex-shrink: 0; padding: 0 12px; height: 42px;" @click="promptNewCategory">+ Новая</button>
            </div>
          </div>`;

if (regex.test(code)) {
  code = code.replace(regex, newTemplate);
  fs.writeFileSync(path, code);
  console.log('Template replaced');
} else {
  console.log('Regex did not match');
}

