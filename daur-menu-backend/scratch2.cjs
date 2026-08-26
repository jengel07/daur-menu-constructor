const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.menu.findMany({orderBy: {id: 'desc'}, take: 1}).then(console.log).finally(() => prisma.$disconnect());
