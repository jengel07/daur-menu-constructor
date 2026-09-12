const fs = require('fs');
let schema = fs.readFileSync('daur-menu-backend/prisma/schema.prisma', 'utf8');

// Find the model Dish block
const match = schema.match(/model Dish\s*\{([\s\S]*?)\}/);
if (match) {
  let block = match[1];
  if (!block.includes('modifiers')) {
    block = block + '  modifiers   Json?\n';
    schema = schema.replace(match[1], block);
    fs.writeFileSync('daur-menu-backend/prisma/schema.prisma', schema);
    console.log('Added modifiers to Dish');
  } else {
    console.log('Already has modifiers');
  }
} else {
  console.log('Could not find model Dish');
}

