const fs = require('fs');

function updateButtonText(filePath) {
  let code = fs.readFileSync(filePath, 'utf8');
  
  // Replace:
  // @click="item.modifiers && item.modifiers.length > 0 ? modifierItem = item : addToCart(item)">+ {{ tDyn('Добавить') }}</button>
  // With:
  // @click="item.modifiers && item.modifiers.length > 0 ? modifierItem = item : addToCart(item)">+ {{ item.modifiers && item.modifiers.length > 0 ? 'Опции' : tDyn('Добавить') }}</button>
  
  // Actually, let's use a regex to match the button content
  code = code.replace(
    /@click="item\.modifiers\s*&&\s*item\.modifiers\.length\s*>\s*0\s*\?\s*modifierItem\s*=\s*item\s*:\s*addToCart\(item\)"\s*>\+\s*\{\{\s*tDyn\('Добавить'\)\s*\}\}/g,
    `@click="item.modifiers && item.modifiers.length > 0 ? modifierItem = item : addToCart(item)">+ {{ item.modifiers && item.modifiers.length > 0 ? 'Выбрать' : tDyn('Добавить') }}`
  );

  fs.writeFileSync(filePath, code);
}

updateButtonText('src/views/ClientView.vue');
updateButtonText('src/components/PhoneMockupContent.vue');
console.log('Updated button text');

