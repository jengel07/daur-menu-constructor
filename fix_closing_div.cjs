const fs = require('fs');

let path = 'src/components/PhoneMockupContent.vue';
let lines = fs.readFileSync(path, 'utf8').split('\n');

let menuTemplateIndex = -1;
let occurrences = 0;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("template v-if=\"currentScreen === 'menu'\"")) {
    occurrences++;
    if (occurrences === 2) {
      menuTemplateIndex = i;
    }
  }
}

if (menuTemplateIndex !== -1) {
  // find the corresponding </template>
  for (let i = menuTemplateIndex; i < lines.length; i++) {
    if (lines[i].includes("</template>")) {
      // Check if it's the right one by looking at previous line
      if (lines[i-1].includes('</div>') || lines[i-4].includes('floating-cart-bar')) {
        // Insert closing div before </template>
        lines.splice(i, 0, '          </div>');
        console.log('Inserted closing div for phone-body before line ' + i);
        break;
      }
    }
  }
}

fs.writeFileSync(path, lines.join('\n'));

