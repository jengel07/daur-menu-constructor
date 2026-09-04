const fs = require('fs');

// Patch Constructor.vue to save to backend
let constructor = fs.readFileSync('src/Constructor.vue', 'utf8');
constructor = constructor.replace(
  /const saveFilterSettings = \(\) => localStorage\.setItem\('filter_settings', JSON\.stringify\(filterSettings\.value\)\);/,
  `const saveFilterSettings = () => {
  localStorage.setItem('filter_settings', JSON.stringify(filterSettings.value));
  if (!menuStore.restaurantInfo) return;
  menuStore.restaurantInfo = { ...menuStore.restaurantInfo, filterSettings: filterSettings.value };
  if (typeof syncToTableStorage === 'function') syncToTableStorage();
};`
);
fs.writeFileSync('src/Constructor.vue', constructor);

// Patch SettingsbarForClient.vue to show dynamic toggles
let settingsbar = fs.readFileSync('src/components/SettingsbarForClient.vue', 'utf8');
const oldFilters = /<div class="filter-options-grid">[\s\S]*?<\/div>/;
const newFilters = `<div class="filter-options-grid">
            <button v-if="restaurantInfo?.filterSettings?.nutFree !== false" class="filter-option-btn" :class="{ active: selectedFilters.includes('nutFree') }" :style="selectedFilters.includes('nutFree') ? { borderColor: primaryColor, backgroundColor: primaryColor, color: '#fff' } : {}" @click="$emit('toggle-filter', 'nutFree')">
              🥜 {{ tDyn('Без орехов') }}
            </button>
            <button v-if="restaurantInfo?.filterSettings?.glutenFree !== false" class="filter-option-btn" :class="{ active: selectedFilters.includes('glutenFree') }" :style="selectedFilters.includes('glutenFree') ? { borderColor: primaryColor, backgroundColor: primaryColor, color: '#fff' } : {}" @click="$emit('toggle-filter', 'glutenFree')">
              🌾 {{ tDyn('Без глютена') }}
            </button>
            <button v-if="restaurantInfo?.filterSettings?.vegetarian !== false" class="filter-option-btn" :class="{ active: selectedFilters.includes('vegetarian') }" :style="selectedFilters.includes('vegetarian') ? { borderColor: primaryColor, backgroundColor: primaryColor, color: '#fff' } : {}" @click="$emit('toggle-filter', 'vegetarian')">
              🥗 {{ tDyn('Вегетарианское') }}
            </button>
            <button v-if="restaurantInfo?.filterSettings?.vegan !== false" class="filter-option-btn" :class="{ active: selectedFilters.includes('vegan') }" :style="selectedFilters.includes('vegan') ? { borderColor: primaryColor, backgroundColor: primaryColor, color: '#fff' } : {}" @click="$emit('toggle-filter', 'vegan')">
              🌱 {{ tDyn('Веганское') }}
            </button>
          </div>`;
settingsbar = settingsbar.replace(oldFilters, newFilters);
fs.writeFileSync('src/components/SettingsbarForClient.vue', settingsbar);

