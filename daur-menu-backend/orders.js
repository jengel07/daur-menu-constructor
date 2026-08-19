import express from 'express';
import db from './db.js';

const router = express.Router();

// ============================================================
// GET / — список заказов ресторана (защищён через app-level authMiddleware)
// ============================================================
router.get('/', async (req, res) => {
  try {
    const orders = await db.order.findMany({
      where: { restaurantId: req.user.restaurantId },
      orderBy: { createdAt: 'desc' },
      include: { items: true },
    });

    const formattedOrders = orders.map(order => ({
      ...order,
      totalPrice: Number(order.totalPrice),
    }));

    res.json(formattedOrders);
  } catch (err) {
    console.error('❌ Ошибка при получении заказов:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// POST / — создание нового заказа (ПУБЛИЧНЫЙ — клиент без токена)
// req.user может быть undefined, берём restaurantId из тела или БД
// ============================================================
router.post('/', async (req, res) => {
  try {
    const {
      items,
      total,
      type,
      customerName,
      customerPhone,
      tableNumber,
      address,
      comment,
      scheduledTime,
      restaurantId: bodyRestaurantId,
    } = req.body;

    // Авторизованный пользователь → его restaurantId
    // Гость без токена → из тела запроса или первый ресторан в БД
    let restaurantId = req.user?.restaurantId || bodyRestaurantId;

    if (!restaurantId) {
      const firstRestaurant = await db.restaurant.findFirst();
      if (!firstRestaurant) {
        return res.status(400).json({ success: false, error: 'Ресторан не найден' });
      }
      restaurantId = firstRestaurant.id;
    }

    // Создаём заказ с вложенными позициями
    const newOrder = await db.order.create({
      data: {
        orderNumber: String(Date.now()).slice(-4),
        type: type || 'onsite',
        status: 'new',
        tableNumber: tableNumber ? String(tableNumber) : null,
        customerName: customerName || null,
        customerPhone: customerPhone || null,
        address: address || null,
        comment: comment || null,
        scheduledTime: scheduledTime || null,
        totalPrice: Number(total) || 0,
        restaurantId,
        items: {
          create: (items || []).map(item => ({
            name: String(item.name),
            price: Number(item.price) || 0, // Исправлено: Prisma ожидает Float, а не String
            quantity: Number(item.quantity) || 1,
          })),
        },
      },
      include: { items: true },
    });

    res.status(201).json({
      success: true,
      orderId: newOrder.id,
      order: newOrder,
      message: 'Заказ успешно сохранён',
    });
  } catch (err) {
    console.error('❌ Ошибка при сохранении заказа:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ============================================================
// PATCH /:id/status — обновление статуса (защищён через app-level authMiddleware)
// ============================================================
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ['new', 'progress', 'done', 'cancelled'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ error: `Недопустимый статус. Допустимые: ${allowedStatuses.join(', ')}` });
    }

    // Проверяем, что заказ принадлежит этому ресторану
    const order = await db.order.findUnique({ where: { id } });
    if (!order || order.restaurantId !== req.user.restaurantId) {
      return res.status(403).json({ error: 'Заказ не найден или доступ запрещён' });
    }

    const updatedOrder = await db.order.update({
      where: { id },
      data: { status },
    });

    res.json({ success: true, updatedOrder });
  } catch (err) {
    console.error('❌ Ошибка при обновлении статуса:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;