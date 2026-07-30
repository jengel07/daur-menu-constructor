import express from 'express';
import db from './db.js';

const router = express.Router();

// --- РОУТЫ ДЛЯ ЗАКАЗОВ ---

router.get('/orders', (req, res) => {
    db.all('SELECT * FROM orders ORDER BY created_at DESC', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        const orders = rows.map(row => ({
            ...row,
            items: JSON.parse(row.items)
        }));
        res.json(orders);
    });
});

router.post('/orders', (req, res) => {
    const { order_number, customer_name, customer_phone, table_number, total_amount, items } = req.body;
    
    const query = `
        INSERT INTO orders (order_number, customer_name, customer_phone, table_number, total_amount, items, status)
        VALUES (?, ?, ?, ?, ?, ?, 'new')
    `;
    
    const params = [
        order_number, 
        customer_name || 'Гость', 
        customer_phone || '', 
        table_number || '1', 
        total_amount, 
        JSON.stringify(items)
    ];

    db.run(query, params, function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ 
            id: this.lastID, 
            order_number, 
            status: 'new', 
            total_amount, 
            items 
        });
    });
});

router.patch('/orders/:id/status', (req, res) => {
    const { status } = req.body;
    db.run('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ success: true, updatedID: req.params.id, status });
    });
});


// --- РОУТЫ ДЛЯ СОХРАНЕНИЯ И ЗАГРУЗКИ МЕНЮ ---

// Сохранить или обновить состояние меню
router.post('/menu', (req, res) => {
    const menuData = JSON.stringify(req.body);
    
    db.get('SELECT id FROM menu_state LIMIT 1', (err, row) => {
        if (err) return res.status(500).json({ error: err.message });

        if (row) {
            db.run('UPDATE menu_state SET data = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [menuData, row.id], (updateErr) => {
                if (updateErr) return res.status(500).json({ error: updateErr.message });
                res.json({ success: true, message: 'Меню успешно обновлено' });
            });
        } else {
            db.run('INSERT INTO menu_state (data) VALUES (?)', [menuData], (insertErr) => {
                if (insertErr) return res.status(500).json({ error: insertErr.message });
                res.json({ success: true, message: 'Меню успешно сохранено' });
            });
        }
    });
});

// Получить сохраненное меню
router.get('/menu', (req, res) => {
    db.get('SELECT data FROM menu_state LIMIT 1', (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.json(null);
        
        res.json(JSON.parse(row.data));
    });
});

export default router;