const fs = require('fs');
let lines = fs.readFileSync('src/views/ClientView.vue', 'utf8').split('\n');

const startIdx = lines.findIndex(l => l.includes('const confirmOrder = async () => {'));
if (startIdx !== -1) {
  const endIdx = lines.findIndex((l, i) => i > startIdx && l.includes('  }));'));
  
  if (endIdx !== -1) {
    const replacement = `  const preparedItems = cartItems.value.map(item => {
    let itemName = getRussianName(item.name);
    if (item.selectedModifiers && item.selectedModifiers.length > 0) {
      const mods = item.selectedModifiers.map((m) => m.name).join(', ');
      itemName += \` (\${mods})\`;
    }
    return {
      id: String(item.id).split('_')[0],
      name: itemName,
      price: Number(item.price || 0),
      quantity: item.quantity
    };
  });`;
  
    lines.splice(startIdx + 1, endIdx - startIdx, replacement);
    fs.writeFileSync('src/views/ClientView.vue', lines.join('\n'));
    console.log('Replaced confirmOrder mapping');
  } else {
    console.log('Could not find end of map');
  }
} else {
  console.log('Could not find confirmOrder');
}

