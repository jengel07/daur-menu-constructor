async function run() {
  const { PrismaClient } = await import('@prisma/client');
  const prisma = new PrismaClient();
  const menus = await prisma.menu.findMany({orderBy: {id: 'desc'}, take: 1});
  const restaurantId = menus[0]?.restaurantId;
  console.log("Last Menu Restaurant ID:", restaurantId);
  const dishes = await prisma.dish.findMany({where: {restaurantId}});
  console.log("Dishes count:", dishes.length);
  console.log("Dishes:", dishes);
  await prisma.$disconnect();
}
run();

