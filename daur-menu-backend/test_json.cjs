const { PrismaClient } = require('./node_modules/@prisma/client');
const db = new PrismaClient();

async function main() {
  const d = await db.dish.findFirst({ where: { modifiers: { not: null } } });
  console.log("Dish with modifiers:", d);
  if (d) {
    console.log("Modifiers type:", typeof d.modifiers);
    console.log("Modifiers isArray:", Array.isArray(d.modifiers));
  }
}
main().finally(() => db.$disconnect());

