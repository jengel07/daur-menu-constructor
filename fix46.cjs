const fs = require('fs');

const files = [
  'index.html',
  'src/Constructor.vue',
  'daur-menu-backend/index.js',
  'src/views/RoleSelector.vue'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/Daur Menu/g, 'Achab');
  content = content.replace(/daur-menu-constructor/g, 'Achab');
  fs.writeFileSync(file, content);
});

console.log('Renamed Daur Menu to Achab');

