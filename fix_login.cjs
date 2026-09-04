const fs = require('fs');
let c = fs.readFileSync('src/views/LoginView.vue', 'utf8');

c = c.replace(/  padding: 30px 40px;\r?\n  }/, '  .top-nav {\n    padding: 30px 40px;\n  }');

fs.writeFileSync('src/views/LoginView.vue', c);
