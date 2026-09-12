import { PrismaClient } from './prisma/generated/client/index.js';
const db = new PrismaClient();

async function main() {
  const d = await db.dish.findFirst({ where: { NOT: { modifiers: null } } });
  if (d) {
    console.log("Modifiers type:", typeof d.modifiers);
    console.log("Modifiers isArray:", Array.isArray(d.modifiers));
    console.log("Modifiers content:", d.modifiers);
  } else {
    console.log("No dish found with modifiers");
  }
}
main().finally(() => db.$disconnect());

