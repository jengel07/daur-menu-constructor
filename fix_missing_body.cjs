const fs = require('fs');

let path = 'src/components/PhoneMockupContent.vue';
let lines = fs.readFileSync(path, 'utf8').split('\n');

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("template v-if=\"currentScreen === 'menu'\"")) {
    if (!lines[i+1].includes('class="phone-body"')) {
      lines.splice(i+1, 0, '          <div class="phone-body" @scroll="handlePhoneScroll" :style="{ backgroundColor: currentRestaurantInfo.backgroundColor, color: currentRestaurantInfo.textColor }">');
      console.log('Inserted missing phone-body at line ' + (i+1));
    }
  }
}

fs.writeFileSync(path, lines.join('\n'));

