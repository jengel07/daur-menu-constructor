const fs = require('fs');

let code = fs.readFileSync('src/views/ClientView.vue', 'utf8');

const regex = /const preparedItems = cartItems\.value\.map\(item => \(\{\s*id: item\.id,\s*name: getRussianName\(item\.name\),\s*price: Number\(item\.price \|\| 0\),\s*quantity: item\.quantity\s*\}\)\);/g;

const replacement = `const preparedItems = cartItems.value.map(item => {
    let itemName = getRussianName(item.name);
    if (item.selectedModifiers && item.selectedModifiers.length > 0) {
      const mods = item.selectedModifiers.map((m: any) => m.name).join(', ');
      itemName += \` (\${mods})\`;
    }
    return {
      id: String(item.id).split('_')[0], // strip modifier hash to keep original dishId if needed
      name: itemName,
      price: Number(item.price || 0),
      quantity: item.quantity
    };
  });`;

if (code.match(regex)) {
  code = code.replace(regex, replacement);
  fs.writeFileSync('src/views/ClientView.vue', code);
  console.log('Updated ClientView.vue confirmOrder');
} else {
  console.log('Regex did not match in ClientView.vue');
}

