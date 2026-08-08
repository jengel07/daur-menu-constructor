import express from 'express';
import { PrismaClient } from './generated/prisma/index.js';

const prisma = new PrismaClient();
const router = express.Router();

// --- РОУТЫ ДЛЯ ЗАКАЗОВ (ПРОВЕРЕНО С PRISMA) ---

// 1. Получение списка заказов (для дашборда)
router.get('/orders', async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' }
    });

    const formattedOrders = orders.map(order => ({
      ...order,
      id: order.id, 
      items: order.items ? JSON.parse(order.items) : []
    }));

    res.json(formattedOrders);
  } catch (err) {
    console.error('Ошибка при получении заказов:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// 2. Создание/сохранение нового заказа (POST /api/orders)
router.post('/orders', async (req, res) => {
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
      restaurantId 
    } = req.body;

    const itemsString = JSON.stringify(items || []);

    const newOrder = await prisma.order.create({
      data: {
        orderNumber: String(Date.now()).slice(-4), // Генерация номера заказа
        type: type || 'onsite',
        status: 'new',
        tableNumber: tableNumber ? String(tableNumber) : null,
        customerName: customerName || '',
        customerPhone: customerPhone || '',
        address: address || '',
        totalPrice: Number(total) || 0,
        items: itemsString, // Сохранение товаров
        restaurantId: restaurantId || "default_restaurant_id" 
      }
    });

    res.status(201).json({ 
      success: true, 
      orderId: newOrder.id,
      order: newOrder,
      message: 'Заказ успешно сохранен' 
    });
  } catch (err) {
    console.error('Ошибка при сохранении заказа через Prisma:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Обновление статуса заказа (PATCH /api/orders/:id/status)
router.patch('/orders/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status }
    });

    res.json({ success: true, updatedOrder });
  } catch (err) {
    console.error('Ошибка при обновлении статуса:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;