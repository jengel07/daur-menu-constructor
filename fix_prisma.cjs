const fs = require('fs');
const path = 'daur-menu-backend/prisma/schema.prisma';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  '  banners    PromotionBanner[] ресторана',
  '  banners    PromotionBanner[]'
);

fs.writeFileSync(path, code);
console.log('Fixed schema.prisma');
