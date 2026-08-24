const fs = require('fs');
let content = fs.readFileSync('daur-menu-backend/orders.js', 'utf8');

const deleteRoutes = `
// ============================================================
// DELETE /api/orders/all - Удалить все заказы ресторана
// ============================================================
router.delete('/all', async (req, res) => {
  try {
    await db.order.deleteMany({
      where: { restaurantId: req.user.restaurantId },
    });
    res.json({ success: true });
  } catch (err) {
    console.error('Ошибка удаления всех заказов:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ============================================================
// DELETE /api/orders/:id - Удалить один заказ
// ============================================================
router.delete('/:id', async (req, res) => {
  try {
    await db.order.delete({
      where: { id: req.params.id, restaurantId: req.user.restaurantId },
    });
    res.json({ success: true });
  } catch (err) {
    console.error('Ошибка удаления заказа:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});
`;

content = content.replace('export default router;', deleteRoutes + '\nexport default router;');
fs.writeFileSync('daur-menu-backend/orders.js', content);
console.log('Added delete routes to backend');

