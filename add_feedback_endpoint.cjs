const fs = require('fs');
let path = 'daur-menu-backend/orders.js';
let code = fs.readFileSync(path, 'utf8');

const newEndpoint = `
  // PATCH /:id/feedback
  router.patch('/:id/feedback', async (req, res) => {
    try {
      const { id } = req.params;
      const { rating, feedback } = req.body;
      
      const order = await db.order.findUnique({ where: { id } });
      if (!order) return res.status(404).json({ error: 'Заказ не найден' });
      
      const updatedOrder = await db.order.update({
        where: { id },
        data: {
          rating: Number(rating),
          feedback: String(feedback)
        }
      });
      
      res.json({ success: true, updatedOrder });
    } catch (err) {
      console.error('Ошибка обновления отзыва:', err.message);
      res.status(500).json({ success: false, error: err.message });
    }
  });
`;

code = code.replace(
  /module\.exports = router;/,
  `${newEndpoint}\nmodule.exports = router;`
);

fs.writeFileSync(path, code);
console.log('Added PATCH /api/orders/:id/feedback endpoint');

