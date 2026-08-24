const fs = require('fs');

const file = 'src/views/ClientView.vue';
let content = fs.readFileSync(file, 'utf8');

const regex = /<div class="card-bottom-row" style="flex-direction: column; gap: 8px;">([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/;

const match = content.match(regex);
if (match) {
  console.log("FOUND!");
} else {
  console.log("NOT FOUND!");
}

