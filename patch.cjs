const fs = require('fs');
let content = fs.readFileSync('src/components/MenuEditor.vue', 'utf8');

// Update refs
content = content.replace(/noNuts: false,\s*noLactose: false,\s*noGluten: false/g, "nutFree: false,\n    glutenFree: false,\n    vegetarian: false,\n    vegan: false");
content = content.replace(/noNuts\?: boolean; noLactose\?: boolean; noGluten\?: boolean/g, "nutFree?: boolean; glutenFree?: boolean; vegetarian?: boolean; vegan?: boolean");

// Update filtering logic
content = content.replace(/const matchesNoNuts = !dietaryFilters\.value\.noNuts \|\| \(item as any\)\.noNuts;/g, 
  "const matchesNutFree = !dietaryFilters.value.nutFree || (item as any).nutFree;");
content = content.replace(/const matchesNoLactose = !dietaryFilters\.value\.noLactose \|\| \(item as any\)\.noLactose;/g, 
  "const matchesGlutenFree = !dietaryFilters.value.glutenFree || (item as any).glutenFree;");
content = content.replace(/const matchesNoGluten = !dietaryFilters\.value\.noGluten \|\| \(item as any\)\.noGluten;/g, 
  "const matchesVegetarian = !dietaryFilters.value.vegetarian || (item as any).vegetarian;\n      const matchesVegan = !dietaryFilters.value.vegan || (item as any).vegan;");
content = content.replace(/return matchesSearch && matchesCategory && matchesNoNuts && matchesNoLactose && matchesNoGluten;/g, 
  "return matchesSearch && matchesCategory && matchesNutFree && matchesGlutenFree && matchesVegetarian && matchesVegan;");

// Update initial state in openEditModal
content = content.replace(/noNuts: false,\n        noLactose: false,\n        noGluten: false,/g, 
  "nutFree: false,\n        glutenFree: false,\n        vegetarian: false,\n        vegan: false,");

// Also replace standard regex if they used different whitespace
content = content.replace(/noNuts: false,([\s]*)noLactose: false,([\s]*)noGluten: false,/g, 
  "nutFree: false,$1glutenFree: false,$2vegetarian: false,$2vegan: false,");

// Update dish card tag display
// Find the card tags block. It might have cyrillic encoded weirdly in the regex, so let's match broadly.
const oldCardTags = `<div style="display: flex; gap: 4px; flex-wrap: wrap; margin-top: 8px;" v-if="(item as any).noNuts || (item as any).noLactose || (item as any).noGluten">`;
const newCardTagsStr = `<div style="display: flex; gap: 6px; flex-wrap: wrap; margin-top: 8px;" v-if="(item as any).nutFree || (item as any).glutenFree || (item as any).vegetarian || (item as any).vegan">
            <span v-if="(item as any).nutFree" style="font-size: 14px;" title="Без орехов">🥜</span>
            <span v-if="(item as any).glutenFree" style="font-size: 14px;" title="Без глютена">🌾</span>
            <span v-if="(item as any).vegetarian" style="font-size: 14px;" title="Вегетарианское">🥗</span>
            <span v-if="(item as any).vegan" style="font-size: 14px;" title="Веганское">🌱</span>
          </div><!--`;

// Replace the start of the block and comment out the old spans
content = content.replace(oldCardTags, newCardTagsStr);
// Find the closing div of that block
content = content.replace(/<\/span>\s*<\/div>/, '</span>-->\n          </div>');

// Update modal edit tags
const modalTagRegex = /<div class="form-group">\s*<label>[^<]*<\/label>\s*<div style="display: flex; gap: 15px; margin-top: 6px; flex-wrap: wrap;">[\s\S]*?<\/div>\s*<\/div>/;
const newModalTags = `<div class="form-group">
            <label>Диетические теги</label>
            <div style="display: flex; gap: 8px; margin-top: 6px; flex-wrap: wrap;">
              <label class="compact-tag-toggle" :class="{ active: editingItem.nutFree }">
                <input type="checkbox" v-model="editingItem.nutFree" style="display: none;" />
                <span class="tag-icon">🥜</span>
                <span class="tag-text">Без орехов</span>
              </label>
              <label class="compact-tag-toggle" :class="{ active: editingItem.glutenFree }">
                <input type="checkbox" v-model="editingItem.glutenFree" style="display: none;" />
                <span class="tag-icon">🌾</span>
                <span class="tag-text">Без глютена</span>
              </label>
              <label class="compact-tag-toggle" :class="{ active: editingItem.vegetarian }">
                <input type="checkbox" v-model="editingItem.vegetarian" style="display: none;" />
                <span class="tag-icon">🥗</span>
                <span class="tag-text">Вег.</span>
              </label>
              <label class="compact-tag-toggle" :class="{ active: editingItem.vegan }">
                <input type="checkbox" v-model="editingItem.vegan" style="display: none;" />
                <span class="tag-icon">🌱</span>
                <span class="tag-text">Веган</span>
              </label>
            </div>
          </div>`;
content = content.replace(modalTagRegex, newModalTags);

// Add CSS for .compact-tag-toggle
const cssTarget = "</style>";
const compactCSS = `
.compact-tag-toggle {
  display: flex;
  align-items: center;
  gap: 4px;
  background: var(--bg-card, #2d2d2d);
  border: 1px solid var(--border-color, #3d3d3d);
  padding: 6px 10px;
  border-radius: 8px;
  cursor: pointer;
  user-select: none;
  font-size: 12px;
  transition: all 0.2s;
  white-space: nowrap;
}
.compact-tag-toggle.active {
  background: rgba(99, 102, 241, 0.15);
  border-color: #6366f1;
  color: #818cf8;
}
.tag-icon { font-size: 14px; }
`;
content = content.replace(cssTarget, compactCSS + '\n</style>');

fs.writeFileSync('src/components/MenuEditor.vue', content);
