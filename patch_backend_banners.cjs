const fs = require('fs');
const path = 'daur-menu-backend/index.js';
let code = fs.readFileSync(path, 'utf8');

const bannersApi = `
// ============================================================
// БАННЕРЫ С АКЦИЯМИ
// ============================================================

app.get('/api/banners/:restaurantId', authMiddleware, adminOnly, async (req, res) => {
  if (req.user.restaurantId !== req.params.restaurantId) {
    return res.status(403).json({ error: 'Доступ запрещен' });
  }
  try {
    const banners = await db.promotionBanner.findMany({
      where: { restaurantId: req.params.restaurantId },
      orderBy: { order: 'asc' }
    });
    res.json({ banners });
  } catch (error) {
    console.error('Ошибка получения баннеров:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.get('/api/banners/active/:restaurantId', async (req, res) => {
  try {
    const banners = await db.promotionBanner.findMany({
      where: { restaurantId: req.params.restaurantId, isActive: true },
      orderBy: { order: 'asc' }
    });
    res.json({ banners });
  } catch (error) {
    console.error('Ошибка получения активных баннеров:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.post('/api/banners/:restaurantId', authMiddleware, adminOnly, async (req, res) => {
  if (req.user.restaurantId !== req.params.restaurantId) {
    return res.status(403).json({ error: 'Доступ запрещен' });
  }
  try {
    const { imageUrl, targetItemId, order } = req.body;
    if (!imageUrl) {
      return res.status(400).json({ error: 'Необходимо изображение' });
    }
    const banner = await db.promotionBanner.create({
      data: {
        restaurantId: req.params.restaurantId,
        imageUrl,
        targetItemId: targetItemId || null,
        order: order || 0,
        isActive: true
      }
    });
    res.status(201).json({ banner });
  } catch (error) {
    console.error('Ошибка создания баннера:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.patch('/api/banners/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const bannerId = req.params.id;
    const { isActive, targetItemId, order } = req.body;
    
    const banner = await db.promotionBanner.findUnique({ where: { id: bannerId } });
    if (!banner || banner.restaurantId !== req.user.restaurantId) {
      return res.status(404).json({ error: 'Баннер не найден' });
    }

    const updated = await db.promotionBanner.update({
      where: { id: bannerId },
      data: {
        ...(isActive !== undefined && { isActive }),
        ...(targetItemId !== undefined && { targetItemId }),
        ...(order !== undefined && { order })
      }
    });
    res.json({ banner: updated });
  } catch (error) {
    console.error('Ошибка обновления баннера:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.delete('/api/banners/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const bannerId = req.params.id;
    
    const banner = await db.promotionBanner.findUnique({ where: { id: bannerId } });
    if (!banner || banner.restaurantId !== req.user.restaurantId) {
      return res.status(404).json({ error: 'Баннер не найден' });
    }

    await db.promotionBanner.delete({ where: { id: bannerId } });
    res.json({ success: true });
  } catch (error) {
    console.error('Ошибка удаления баннера:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});
`;

const insertRegex = /(app\.use\('\/api\/orders', ordersRouter\);)/;
if (insertRegex.test(code)) {
  code = code.replace(insertRegex, '$1\n\n' + bannersApi);
  fs.writeFileSync(path, code);
  console.log('Backend routes patched');
} else {
    // If we can't find that, just put it before app.use('/api', authMiddleware) or similar
    const insertRegex2 = /(app\.get\('\/api\/menu', async)/;
    if (insertRegex2.test(code)) {
      code = code.replace(insertRegex2, bannersApi + '\n\n$1');
      fs.writeFileSync(path, code);
      console.log('Backend routes patched (method 2)');
    } else {
      console.log('Could not find ANY insert point!');
    }
}

