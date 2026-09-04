const fs = require('fs');
let c = fs.readFileSync('src/components/MenuEditor.vue', 'utf8');

c = c.replace(/<\/span>-->\r?\n\s*<\/div><!--[\s\S]*?<\/span>\r?\n\s*<\/div>/, '</span>\n          </div>');

fs.writeFileSync('src/components/MenuEditor.vue', c);
