const fs = require('fs');

let path = 'src/components/kitchen/StopListModal.vue';
let code = fs.readFileSync(path, 'utf8');

// Fix getDishesForCategory to allow categoryId === null
code = code.replace(
  /const getDishesForCategory = \(categoryId: string\) => \{/g,
  `const getDishesForCategory = (categoryId: string | null) => {`
);

// Fix filteredCategories to include uncategorized dishes
code = code.replace(
  /const filteredCategories = computed\(\(\) => \{\s*return categories\.value\.filter\(cat => getDishesForCategory\(cat\.id\)\.length > 0\);\s*\}\);/g,
  `const filteredCategories = computed(() => {
  const cats = categories.value.filter(cat => getDishesForCategory(cat.id).length > 0);
  const uncategorized = items.value.filter(i => !i.categoryId);
  if (uncategorized.length > 0) {
    cats.push({ id: null, name: 'Без категории' });
  }
  return cats;
});`
);

fs.writeFileSync(path, code);
console.log('Fixed StopListModal uncategorized dishes');

