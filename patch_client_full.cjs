const fs = require('fs');
let path = 'src/views/ClientView.vue';
let code = fs.readFileSync(path, 'utf8');

// 1. Update viewMode ref
code = code.replace(
  /const viewMode = ref<'grid' \| 'list'>\('list'\);/,
  `const viewMode = ref<'grid' | 'list' | 'full'>('full');`
);

// 2. Update toggleViewMode logic
code = code.replace(
  /const toggleViewMode = \(\) => {\s*viewMode\.value = viewMode\.value === 'grid' \? 'list' : 'grid';\s*};/,
  `const toggleViewMode = () => {
    if (viewMode.value === 'list') viewMode.value = 'grid';
    else if (viewMode.value === 'grid') viewMode.value = 'full';
    else viewMode.value = 'list';
  };`
);

// 3. Update template classes
// Old: <div v-else :class="viewMode === 'grid' ? 'menu-items-grid-phone' : 'menu-items-list-phone'">
// New: <div v-else :class="viewMode === 'grid' ? 'menu-items-grid-phone' : (viewMode === 'full' ? 'menu-items-full-phone' : 'menu-items-list-phone')">
code = code.replace(
  /<div v-else :class="viewMode === 'grid' \? 'menu-items-grid-phone' : 'menu-items-list-phone'">/,
  `<div v-else :class="viewMode === 'grid' ? 'menu-items-grid-phone' : (viewMode === 'full' ? 'menu-items-full-phone' : 'menu-items-list-phone')">`
);

// Old: <div v-for="item in filteredItems" :key="item.id" :class="viewMode === 'grid' ? 'menu-card' : 'menu-list-row'">
// New: <div v-for="item in filteredItems" :key="item.id" :class="viewMode === 'grid' ? 'menu-card' : (viewMode === 'full' ? 'menu-card-full' : 'menu-list-row')">
code = code.replace(
  /<div v-for="item in filteredItems" :key="item\.id" :class="viewMode === 'grid' \? 'menu-card' : 'menu-list-row'">/,
  `<div v-for="item in filteredItems" :key="item.id" :class="viewMode === 'grid' ? 'menu-card' : (viewMode === 'full' ? 'menu-card-full' : 'menu-list-row')">`
);

// Old: <img v-if="viewMode === 'grid' && item.image" :src="item.image" :alt="getItemName(item)" />
// New: <img v-if="(viewMode === 'grid' || viewMode === 'full') && item.image" :src="item.image" :alt="getItemName(item)" />
code = code.replace(
  /<img v-if="viewMode === 'grid' && item\.image" :src="item\.image" :alt="getItemName\(item\)" \/>/,
  `<img v-if="(viewMode === 'grid' || viewMode === 'full') && item.image" :src="item.image" :alt="getItemName(item)" />`
);

// Old: <p v-if="viewMode === 'grid' && getItemDescription(item)">{{ getItemDescription(item) }}</p>
// New: <p v-if="(viewMode === 'grid' || viewMode === 'full') && getItemDescription(item)">{{ getItemDescription(item) }}</p>
code = code.replace(
  /<p v-if="viewMode === 'grid' && getItemDescription\(item\)">\{\{ getItemDescription\(item\) \}\}<\/p>/,
  `<p v-if="(viewMode === 'grid' || viewMode === 'full') && getItemDescription(item)">{{ getItemDescription(item) }}</p>`
);

// Price blocks update:
// Need to adjust logic where it says `v-if="viewMode === 'list'"` vs `v-if="viewMode === 'grid'"`
// In the current layout:
// <span v-if="viewMode === 'list'" class="price" ...> (Top price for list view)
// <span v-if="viewMode === 'grid'" class="price" ...> (Bottom price for grid view)
// 'full' view mode has the price at the bottom, so it aligns with 'grid' view logic.

code = code.replace(
  /<span v-if="viewMode === 'grid'" class="price"/,
  `<span v-if="viewMode === 'grid' || viewMode === 'full'" class="price"`
);

// 4. Add CSS
const cssSearch = `</style>`;
const cssReplace = `.menu-items-full-phone { display: flex; flex-direction: column; gap: 12px; padding: 0 16px 100px; }
.menu-card-full {
  background: #ffffff;
  color: #111111;
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  padding: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.06);
}
.menu-card-full img {
  width: 100%;
  height: 220px;
  object-fit: cover;
  border-radius: 12px;
}
.menu-card-full .card-content {
  padding: 12px 4px 4px;
}
.menu-card-full .card-text-block h3 {
  font-size: 15px;
  margin: 0 0 6px 0;
  font-weight: bold;
}
.menu-card-full .card-text-block p {
  font-size: 12px;
  color: #555;
  margin: 0 0 16px 0;
  line-height: 1.4;
}
.menu-card-full .card-bottom-row {
  display: flex;
  flex-direction: row !important;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}
.menu-card-full .add-to-cart-btn {
  width: auto;
  padding: 8px 20px;
  font-size: 12px;
}
.menu-card-full .counter-controls {
  width: auto;
  min-width: 90px;
}
</style>`;

code = code.replace(cssSearch, cssReplace);

fs.writeFileSync(path, code);
console.log('Patched ClientView.vue');

