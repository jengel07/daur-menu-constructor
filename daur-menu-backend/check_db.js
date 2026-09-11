const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();
db.promotionBanner.findMany().then(r => console.log(r)).catch(console.error).finally(() => db.$disconnect());

