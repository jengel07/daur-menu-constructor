const fs = require('fs');

function updateButtonText(filePath) {
  let lines = fs.readFileSync(filePath, 'utf8').split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('modifierItem = item : addToCart(item)')) {
      lines[i] = lines[i].replace(
        "+ {{ tDyn('добавить') }}",
        "+ {{ item.modifiers && item.modifiers.length > 0 ? 'Опции' : tDyn('добавить') }}"
      );
    }
  }
  fs.writeFileSync(filePath, lines.join('\n'));
}

updateButtonText('src/views/ClientView.vue');
updateButtonText('src/components/PhoneMockupContent.vue');
console.log('Updated button text');

