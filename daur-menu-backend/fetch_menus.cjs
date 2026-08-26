const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.menu.findMany({orderBy: {id: 'desc'}, take: 2}).then(menus => {
  console.log("Last 2 menus:", JSON.stringify(menus, null, 2));
  prisma.$disconnect();
});

