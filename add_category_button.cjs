const fs = require('fs');

let path = 'src/components/MenuEditor.vue';
let code = fs.readFileSync(path, 'utf8');

// Replace the template part
const oldTemplate = `<div class="form-group">
            <label>Категория</label>
            <select v-model="editingItem.categoryId" v-if="categories && categories.length > 0">
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                {{ cat.name }}
              </option>
            </select>
            <div v-else style="color: #e74c3c; font-size: 13px; padding: 6px 0;">
              ⚠️ Нет доступных категорий! Сначала создайте категорию.
            </div>
          </div>`;

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

if (code.includes(oldTemplate)) {
  code = code.replace(oldTemplate, newTemplate);
  console.log('Replaced template');
} else {
  console.log('Template not found or already replaced');
  if (code.includes('promptNewCategory')) {
    console.log('Already has promptNewCategory');
  }
}

// Add the promptNewCategory method
if (!code.includes('const promptNewCategory')) {
  // Find a good place to insert it. e.g., before `const syncWithServer`
  const insertIndex = code.indexOf('const syncWithServer');
  const methodCode = `
  const promptNewCategory = () => {
    const name = prompt('Введите название новой категории:');
    if (!name || !name.trim()) return;
    const newCat = {
      id: 'cat-' + Date.now(),
      name: name.trim(),
      orderIndex: props.categories ? props.categories.length : 0
    };
    const newCats = [...(props.categories || []), newCat];
    emit('update-categories', newCats);
    if (editingItem.value) {
      editingItem.value.categoryId = newCat.id;
    }
  };
  
`;
  code = code.slice(0, insertIndex) + methodCode + code.slice(insertIndex);
  console.log('Added promptNewCategory method');
}

fs.writeFileSync(path, code);

