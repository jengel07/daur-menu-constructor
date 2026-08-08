import express from 'express';
import multer from 'multer';
import cors from 'cors';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import { createWorker } from 'tesseract.js';
import { parseMenuText } from './menuParser.js';
import db from './db.js';
import ordersRouter from './orders.js';

dotenv.config();

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 465,
    secure: true,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

transporter.verify((error) => {
    if (error) {
        console.error('❌ Ошибка настройки SMTP почты:', error.message);
    } else {
        console.log('✅ Почтовый сервер ready к отправке писем');
    }
});

// Создаём таблицу, затем отдельно пытаемся добавить колонку general_settings
// Если колонка уже есть — ошибка игнорируется
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
        if (err) {
            console.error('❌ Ошибка создания таблицы menu:', err.message);
        }
    });

    // Миграция: добавляем колонку если её нет (ошибка = уже существует, игнорируем)
    db.run(`ALTER TABLE menu ADD COLUMN general_settings TEXT`, (err) => {
        if (err && !err.message.includes('duplicate column')) {
            console.error('❌ Ошибка миграции general_settings:', err.message);
        }
    });
});

// Логгер для отладки всех запросов
app.use((req, res, next) => {
    console.log(`📥 ${req.method} запрос на ${req.url}`);
    next();
});

// Подключаем роутер заказов (убедитесь, что в orders.js настроен обработчик POST /)
app.use('/api/orders', ordersRouter);

// GET /api/menu — получить все данные ресторана
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

// POST /api/menu — сохранить все данные ресторана
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

// POST /api/staff/invite — отправить приглашение сотруднику
app.post('/api/staff/invite', async (req, res) => {
    try {
        const { email, role } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: 'Email обязателен' });
        }

        console.log(`✉️ Попытка отправки приглашения для email: ${email}, с ролью: ${role}`);

        const mailOptions = {
            from: `"Daur Menu" <${process.env.SMTP_USER}>`,
            to: email,
            subject: 'Приглашение в команду Daur Menu',
            html: `
                <div style="font-family: sans-serif; padding: 20px;">
                    <h2>Вас пригласили в команду Daur Menu!</h2>
                    <p>Вам назначена роль: <strong>${role}</strong>.</p>
                    <p>Для входа в систему используйте ваш email: <b>${email}</b></p>
                </div>
            `
        };

        const mailResult = await transporter.sendMail(mailOptions);
        console.log('✅ Письмо успешно отправлено! ID:', mailResult.messageId);

        res.status(200).json({ 
            success: true, 
            message: 'Приглашение успешно отправлено на почту',
            staff: { email, role, status: 'pending' } 
        });
    } catch (err) {
        console.error('❌ Ошибка при отправке письма через SMTP:', err);
        res.status(500).json({ 
            success: false, 
            message: 'Не удалось отправить письмо на почту: ' + err.message 
        });
    }
});

// POST /api/parse-menu — OCR-парсинг изображения меню
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

app.listen(3000, '0.0.0.0', () => {
    console.log('🚀 Сервер запущен на http://localhost:3000');
});