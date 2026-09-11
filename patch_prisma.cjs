const fs = require('fs');
const path = 'daur-menu-backend/prisma/schema.prisma';
let schema = fs.readFileSync(path, 'utf8');

const bannerModel = `
model PromotionBanner {
  id           String     @id @default(uuid())
  imageUrl     String     @db.Text
  isActive     Boolean    @default(true)
  targetItemId String?
  order        Int        @default(0)
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt
  restaurantId String
  restaurant   Restaurant @relation(fields: [restaurantId], references: [id], onDelete: Cascade)
}
`;

// Add banners to Restaurant
schema = schema.replace(
  '  categories Category[] // Связь с категориями',
  '  categories Category[] // Связь с категориями\n  banners    PromotionBanner[]'
);

// Fallback if Russian comment wasn't exactly that
if (!schema.includes('banners    PromotionBanner[]')) {
  schema = schema.replace(
    '  categories Category[]',
    '  categories Category[]\n  banners    PromotionBanner[]'
  );
}

schema += bannerModel;

fs.writeFileSync(path, schema);
console.log('schema.prisma updated');

