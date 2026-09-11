const fs = require('fs');
let path = 'daur-menu-backend/prisma/schema.prisma';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  /totalPrice    Float/,
  `totalPrice    Float\n  rating        Int?\n  feedback      String?     @db.Text`
);

fs.writeFileSync(path, code);
console.log('Patched schema.prisma');

