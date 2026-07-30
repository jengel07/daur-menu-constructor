import express from 'express';
import multer from 'multer';
import cors from 'cors';
import dotenv from 'dotenv';
import { createWorker } from 'tesseract.js';
import { parseMenuText } from './menuParser.js';
import db from './db.js'; // <--- Импортируем подключение к базе данных SQLite
import ordersRouter from './orders.js';

dotenv.config();

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Подключаем роуты заказов
app.use('/api', ordersRouter);

// --- Эндпоинты для сохранения и получения настроек меню, категорий и блюд ---

// 1. Получить всю информацию о ресторане, категориях и блюдах
app.get('/api/menu', (req, res) => {
    db.get("SELECT * FROM menu WHERE id = 1", (err, row) => {
        if (err) {
            console.error('❌ Ошибка чтения меню из БД:', err.message);
            return res.status(500).json({ error: err.message });
        }
        
        if (!row) {
            return res.json({ restaurantInfo: {}, categories: [], items: [] });
        }

        res.json({
            restaurantInfo: row.info ? JSON.parse(row.info) : {},
            categories: row.cats ? JSON.parse(row.cats) : [],
            items: row.items ? JSON.parse(row.items) : []
        });
    });
});

// 2. Сохранить / обновить всю информацию о ресторане, категориях и блюдах
app.post('/api/menu', (req, res) => {
    const { info, items, cats } = req.body;

    const query = `INSERT OR REPLACE INTO menu (id, info, items, cats) VALUES (1, ?, ?, ?)`;
    
    db.run(
        query, 
        [JSON.stringify(info || {}), JSON.stringify(items || []), JSON.stringify(cats || [])], 
        (err) => {
            if (err) {
                console.error('❌ Ошибка сохранения меню в БД:', err.message);
                return res.status(500).json({ error: err.message });
            }
            res.json({ success: true });
        }
    );
});

// Эндпоинт парсинга меню через OCR
app.post('/api/parse-menu', upload.single('menuFile'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'Файл не загружен' });
    }

    try {
        console.log(`📂 Получен файл: ${req.file.originalname}`);

        const worker = await createWorker('rus');
        const { data: { text } } = await worker.recognize(req.file.buffer);
        await worker.terminate();

        const parsedData = parseMenuText(text);

        res.json(parsedData);
    } catch (error) {
        console.error('❌ Ошибка OCR или парсинга:', error);
        res.status(500).json({ error: 'Не удалось распознать меню: ' + error.message });
    }
});

// Запуск сервера
app.listen(3000, '0.0.0.0', () => {
    console.log('🚀 Сервер запущен на http://localhost:3000');
});