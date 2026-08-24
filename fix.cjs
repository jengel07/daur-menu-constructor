const fs = require('fs');

const files = ['src/views/ClientView.vue', 'src/components/PhoneMockupContent.vue'];
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  while (true) {
    let startIndex = content.indexOf('<div v-if="item.price" v-show="item.priceBottle || item.priceGlass"');
    if (startIndex === -1) {
      startIndex = content.indexOf('<div v-if="item.price" style="display: flex; justify-content: space-between; width: 100%; align-items: center;" v-show="item.priceBottle || item.priceGlass">');
    }
    
    if (startIndex === -1) break;
    
    let endIndex = startIndex;
    let divCount = 0;
    
    let match;
    const regex = /<\/?div[^>]*>/g;
    regex.lastIndex = startIndex;
    
    while ((match = regex.exec(content)) !== null) {
      if (match[0].startsWith('</')) {
        divCount--;
      } else {
        divCount++;
      }
      if (divCount === 0) {
        endIndex = match.index + match[0].length;
        break;
      }
    }
    
    if (endIndex > startIndex) {
      content = content.substring(0, startIndex) + content.substring(endIndex);
    } else {
      break;
    }
  }

  if (file === 'src/views/ClientView.vue') {
    if (content.includes('translateQueue.add(cacheKey);') && !content.includes('langCodeMap')) {
      content = content.replace(
        'translateQueue.add(cacheKey);',
        'translateQueue.add(cacheKey);\n\n    const langCodeMap: Record<string, string> = {\n      \'English\': \'en\',\n      \'Deutsch\': \'de\',\n      \'Аҧсшәа\': \'ab\'\n    };\n    const targetCode = langCodeMap[targetLangCode];\n    if (!targetCode) return;'
      );
      content = content.replace(
        /tl=\$\{targetLangCode\}/g,
        'tl=${targetCode}'
      );
    }
  }
  
  fs.writeFileSync(file, content);
});
console.log('Fixed');
