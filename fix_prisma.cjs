const fs = require('fs');
let content = fs.readFileSync('daur-menu-backend/prisma/schema.prisma', 'utf8');

const target = `  createdAt     DateTime    @default(now())`;
const replacement = `  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt @default(now())`;

if (!content.includes('updatedAt')) {
  content = content.replace(target, replacement);
  fs.writeFileSync('daur-menu-backend/prisma/schema.prisma', content);
  console.log('Added updatedAt to Order model');
} else {
  console.log('updatedAt already exists');
}

