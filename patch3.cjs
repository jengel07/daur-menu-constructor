const fs = require('fs');

let clientView = fs.readFileSync('src/views/ClientView.vue', 'utf8');
clientView = clientView.replace(
  /if \(f === 'glutenFree'\) return item\.noGluten \|\| item\.glutenFree \|\| item\.isGlutenFree \|\| item\.gluten_free \|\| \(Array\.isArray\(item\.tags\) && item\.tags\.includes\('glutenFree'\)\);/,
  `if (f === 'glutenFree') return item.noGluten || item.glutenFree || item.isGlutenFree || item.gluten_free || (Array.isArray(item.tags) && item.tags.includes('glutenFree'));
        if (f === 'vegetarian') return item.vegetarian || item.isVegetarian || (Array.isArray(item.tags) && item.tags.includes('vegetarian'));
        if (f === 'vegan') return item.vegan || item.isVegan || (Array.isArray(item.tags) && item.tags.includes('vegan'));`
);

fs.writeFileSync('src/views/ClientView.vue', clientView);

