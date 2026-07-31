import express from 'express';
import multer from 'multer';
import cors from 'cors';
import dotenv from 'dotenv';
import { createWorker } from 'tesseract.js';
import { parseMenuText } from './menuParser.js';
import db from './db.js'; // Импортируем подключение к базе данных SQLite
import ordersRouter from './orders.js';

dotenv.config();

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Убедимся, что таблица menu существует и содержит все необходимые колонки
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS menu (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            info TEXT,
            items TEXT,
            cats TEXT,
            general_settings TEXT
        )
    `, (err) => {
        if (!err) {
            // Миграция на случай, если таблица уже была создана без колонки general_settings
            db.run(`ALTER TABLE menu ADD COLUMN general_settings TEXT`, () => {});
        }
    });
});

// Подключаем роуты заказов
app.use('/api', ordersRouter);

// --- Эндпоинты для сохранения и получения настроек меню, категорий и блюд ---

// 1. Получить всю информацию о ресторане, категориях, блюдах и общих настройках (включая Wi-Fi)
app.get('/api/menu', (req, res) => {
    db.get("SELECT * FROM menu WHERE id = 1", (err, row) => {
        if (err) {
            console.error('❌ Ошибка чтения меню из БД:', err.message);
            return res.status(500).json({ error: err.message });
        }
        
        if (!row) {
            return res.json({ restaurantInfo: {}, categories: [], items: [], generalSettings: {} });
        }

        res.json({
            restaurantInfo: row.info ? JSON.parse(row.info) : {},
            categories: row.cats ? JSON.parse(row.cats) : [],
            items: row.items ? JSON.parse(row.items) : [],
            generalSettings: row.general_settings ? JSON.parse(row.general_settings) : {}
        });
    });
});

// 2. Сохранить / обновить всю информацию, включая generalSettings (Wi-Fi и т.д.)
app.post('/api/menu', (req, res) => {
    const { info, items, cats, generalSettings } = req.body;

    const query = `INSERT OR REPLACE INTO menu (id, info, items, cats, general_settings) VALUES (1, ?, ?, ?, ?)`;
    
    db.run(
        query, 
        [
            JSON.stringify(info || {}), 
            JSON.stringify(items || []), 
            JSON.stringify(cats || []),
            JSON.stringify(generalSettings || {})
        ], 
        (err) => {
            if (err) {
                console.error('❌ Ошибка сохранения меню в БД:', err.message);
                return res.status(500).json({ error: err.message });
            }
            res.json({ success: true });
        }
    );
});

// --- Эндпоинт для приглашения сотрудников ---
app.post('/api/staff/invite', async (req, res) => {
    try {
        const { email, role } = req.body;
        
        // Здесь вы можете добавить логику сохранения сотрудника в БД, если потребуется
        console.log(`✉️ Получено приглашение для email: ${email}, с ролью: ${role}`);

        res.status(200).json({ 
            success: true, 
            message: 'Приглашение успешно отправлено',
            staff: { email, role, status: 'pending' } 
        });
    } catch (err) {
        console.error('❌ Ошибка при отправке приглашения:', err);
        res.status(500).json({ success: false, message: 'Ошибка сервера' });
    }
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