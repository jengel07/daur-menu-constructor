const fs = require('fs');
let code = fs.readFileSync('daur-menu-backend/index.js', 'utf8');

const apiBlock = `
// ============================================================
// СТОП-ЛИСТ (ДЛЯ ПЕРСОНАЛА)
// ============================================================

// GET /api/staff/menu - Получение меню для стоп-листа
app.get('/api/staff/menu', authMiddleware, async (req, res) => {
  try {
    const restaurantId = req.user.restaurantId;
    const categories = await db.category.findMany({
      where: { restaurantId },
      orderBy: { orderIndex: 'asc' }
    });
    const dishes = await db.dish.findMany({
      where: { restaurantId },
      orderBy: { name: 'asc' }
    });
    res.json({ categories, items: dishes });
  } catch (error) {
    console.error('Ошибка получения меню персоналом:', error.message);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// PATCH /api/staff/dishes/:id/availability - Обновление доступности блюда
app.patch('/api/staff/dishes/:id/availability', authMiddleware, async (req, res) => {
  try {
    const { isAvailable } = req.body;
    const { id } = req.params;
    const restaurantId = req.user.restaurantId;

    const dish = await db.dish.findFirst({
      where: { id, restaurantId }
    });

    if (!dish) {
      return res.status(404).json({ error: 'Блюдо не найдено' });
    }

    await db.dish.update({
      where: { id },
      data: { isAvailable }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Ошибка обновления стоп-листа:', error.message);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});
`;

// Insert the new block before OCR block or anywhere safe
code = code.replace(
  '// ============================================================',
  apiBlock + '\n// ============================================================'
);

fs.writeFileSync('daur-menu-backend/index.js', code);
console.log('Backend routes added');
