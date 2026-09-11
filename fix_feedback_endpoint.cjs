const fs = require('fs');
let path = 'daur-menu-backend/orders.js';
let code = fs.readFileSync(path, 'utf8');

const newEndpoint = `
// ============================================================
// PATCH /:id/feedback
// ============================================================
router.patch('/:id/feedback', async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, feedback } = req.body;
    
    const order = await db.order.findUnique({ 
      where: { id },
      include: { restaurant: true } 
    });
    
    if (!order) return res.status(404).json({ error: 'Заказ не найден' });
    
    const updatedOrder = await db.order.update({
      where: { id },
      data: {
        rating: Number(rating),
        feedback: String(feedback)
      }
    });

    // Send to Telegram if configured
    try {
      const menu = await db.menu.findFirst({ where: { restaurantId: order.restaurantId } });
      const info = menu?.info ? JSON.parse(menu.info) : {};
      const settings = info.orderSettings || {};
      
      if (settings.notifType === 'telegram' && settings.telegramWebhook) {
        let url = settings.telegramWebhook;
        
        const stars = '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
        const textMsg = \`📝 <b>Новый отзыв на заказ #\${order.orderNumber}</b>\\n\\nОценка: \${stars}\\nКомментарий: <i>\${feedback || 'Без текста'}</i>\`;
        
        if (url.includes('api.telegram.org') && url.includes('sendMessage')) {
          const separator = url.includes('?') ? '&' : '?';
          url = \`\${url}\${separator}text=\${encodeURIComponent(textMsg)}&parse_mode=HTML\`;
          
          fetch(url)
            .then(r => r.json())
            .then(data => console.log('Telegram feedback sent:', data.ok))
            .catch(e => console.error('Telegram error:', e));
        } else {
          // Webhook
          fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              event: 'feedback',
              orderId: order.orderNumber,
              rating,
              feedback,
              text: textMsg
            })
          }).catch(e => console.error('Webhook error:', e));
        }
      }
    } catch(err) {
      console.error('Error sending feedback to TG:', err);
    }
    
    res.json({ success: true, updatedOrder });
  } catch (err) {
    console.error('Ошибка обновления отзыва:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});
`;

if (!code.includes('PATCH /:id/feedback')) {
  code = code.replace(
    /export default router;/,
    `${newEndpoint}\nexport default router;`
  );
  fs.writeFileSync(path, code);
  console.log('Added PATCH /api/orders/:id/feedback endpoint with Telegram support');
} else {
  console.log('Endpoint already exists!');
}

