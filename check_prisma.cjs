const { PrismaClient } = require('./daur-menu-backend/node_modules/@prisma/client');
const prisma = new PrismaClient();
prisma.$queryRaw`SELECT column_name FROM information_schema.columns WHERE table_name = 'Dish'`
  .then(res => console.log(res))
  .catch(err => console.error(err))
  .finally(() => prisma.$disconnect());

