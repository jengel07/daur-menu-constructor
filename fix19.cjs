const fs = require('fs');
let content = fs.readFileSync('daur-menu-backend/prisma/schema.prisma', 'utf8');

const oldDish = `model Dish {
  id           String      @id @default(uuid())
  name         String
  price        Float
  description  String?     @db.Text
  image        String?
  categoryId   String?
  category     Category?   @relation(fields: [categoryId], references: [id], onDelete: SetNull)
  restaurantId String      
  restaurant   Restaurant  @relation(fields: [restaurantId], references: [id], onDelete: Cascade) 
  isAvailable  Boolean     @default(true)
  noNuts       Boolean     @default(false)
  noLactose    Boolean     @default(false)
  noGluten     Boolean     @default(false)
  tags         DishTag[]
  orderItems   OrderItem[]
}`;

const newDish = `model Dish {
  id           String      @id @default(uuid())
  name         String
  price        Float
  priceGlass   Float?
  priceBottle  Float?
  description  String?     @db.Text
  image        String?
  categoryId   String?
  category     Category?   @relation(fields: [categoryId], references: [id], onDelete: SetNull)
  restaurantId String      
  restaurant   Restaurant  @relation(fields: [restaurantId], references: [id], onDelete: Cascade) 
  isAvailable  Boolean     @default(true)
  noNuts       Boolean     @default(false)
  noLactose    Boolean     @default(false)
  noGluten     Boolean     @default(false)
  tags         DishTag[]
  orderItems   OrderItem[]
}`;

content = content.replace(oldDish, newDish);
fs.writeFileSync('daur-menu-backend/prisma/schema.prisma', content);

