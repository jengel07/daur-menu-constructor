const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const menus = await prisma.menu.findMany();
  for (let m of menus) {
    if (m.general_settings) {
      console.log('RestID:', m.restaurantId);
      console.log('Settings:', JSON.parse(m.general_settings).qrSettings);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());

