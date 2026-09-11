const fs = require('fs');
const path = 'src/Constructor.vue';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  "import {\n  Image as ImageIcon, useRouter } from 'vue-router';",
  "import { useRouter } from 'vue-router';"
);

code = code.replace(
  "import {\n  UtensilsCrossed,",
  "import {\n  Image as ImageIcon,\n  UtensilsCrossed,"
);

fs.writeFileSync(path, code);
console.log('Fixed Constructor.vue imports');

