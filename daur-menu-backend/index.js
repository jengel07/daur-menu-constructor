import express from 'express';
import multer from 'multer';
import cors from 'cors';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createWorker } from 'tesseract.js';
import { parseMenuText } from './menuParser.js';
import db from './db.js';
import ordersRouter from './orders.js';

dotenv.config();

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_change_in_production';
const SALT_ROUNDS = 12;

// ============================================================
// MIDDLEWARES
// ============================================================

app.use(cors({
  origin: true, // <-- Автоматически разрешает любой источник, сохраняя работу credentials
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Логгер запросов
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.url}`);
  next();
});

// ============================================================
// JWT MIDDLEWARE — защита приватных роутов
// ============================================================

export function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ error: 'Токен не предоставлен' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { restaurantId, email }
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Токен недействителен или истёк' });
  }
}

// ============================================================
// EMAIL (SMTP)
// ============================================================

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
    console.error('❌ Ошибка настройки SMTP:', error.message);
  } else {
    console.log('✅ Почтовый сервер готов к отправке писем');
  }
});

// ============================================================
// РОУТЕР ЗАКАЗОВ
// POST — публичный (клиент без токена), GET/PATCH — только для авторизованных
// ============================================================

// POST /api/orders — публичный, клиент оформляет заказ без токена
// (ordersRouter обрабатывает POST / внутри, передаём напрямую без authMiddleware)
app.post('/api/orders', (req, res, next) => {
  req.url = '/';
  ordersRouter(req, res, next);
});

// GET /api/orders и PATCH /api/orders/:id/status — защищены JWT
app.use('/api/orders', authMiddleware, ordersRouter);

// ============================================================
// АВТОРИЗАЦИЯ И РЕГИСТРАЦИЯ
// ============================================================

// POST /api/auth/register
app.post('/api/auth/register', async (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email и пароль обязательны' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Пароль должен быть не менее 6 символов' });
  }

  try {
    // Хэшируем пароль
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const newRestaurant = await db.restaurant.create({
      data: {
        email,
        password: hashedPassword,
        name: name || email.split('@')[0],
        menus: { create: {} },
      },
    });

    const token = jwt.sign(
      { restaurantId: newRestaurant.id, email: newRestaurant.email },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(201).json({
      success: true,
      token,
      restaurantId: newRestaurant.id,
      name: newRestaurant.name,
    });
  } catch (err) {
    console.error('❌ Ошибка регистрации:', err.message);
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'Пользователь с таким email уже существует' });
    }
    res.status(500).json({ error: 'Ошибка регистрации: ' + err.message });
  }
});

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email и пароль обязательны' });
  }

  try {
    const user = await db.restaurant.findUnique({ where: { email } });

    if (!user) {
      return res.status(401).json({ error: 'Неверный логин или пароль' });
    }

    // Сравниваем хэши
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Неверный логин или пароль' });
    }

    const token = jwt.sign(
      { restaurantId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      token,
      restaurantId: user.id,
      name: user.name,
    });
  } catch (err) {
    console.error('❌ Ошибка входа:', err.message);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// POST /api/auth/refresh — обновление токена
app.post('/api/auth/refresh', authMiddleware, async (req, res) => {
  try {
    const token = jwt.sign(
      { restaurantId: req.user.restaurantId, email: req.user.email },
      JWT_SECRET,
      { expiresIn: '30d' }
    );
    res.json({ success: true, token });
  } catch (err) {
    res.status(500).json({ error: 'Не удалось обновить токен' });
  }
});

// ============================================================
// МЕНЮ (защищено JWT — только свой ресторан)
// ============================================================

// GET /api/menu — публичный, для клиентского просмотра
app.get('/api/menu', async (req, res) => {
  try {
    const { restaurantId } = req.query; // Ловим ID из параметров ссылки

    // Если клиент пришел по QR-коду с ID, ищем конкретное меню. Если нет — берем первое
    const whereClause = restaurantId ? { restaurantId } : {};

    const menuRecord = await db.menu.findFirst({
      where: whereClause
    });

    if (!menuRecord) {
      return res.json({ restaurantInfo: {}, categories: [], items: [], generalSettings: {} });
    }

    res.json({
      restaurantInfo: {
        ...(menuRecord.info ? JSON.parse(menuRecord.info) : {}),
        id: menuRecord.restaurantId // <-- ДОБАВЛЕН ID РЕСТОРАНА
      },
      categories: menuRecord.cats ? JSON.parse(menuRecord.cats) : [],
      items: menuRecord.items ? JSON.parse(menuRecord.items) : [],
      generalSettings: menuRecord.general_settings ? JSON.parse(menuRecord.general_settings) : {},
    });
  } catch (err) {
    console.error('❌ Ошибка чтения публичного меню:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/menu/:restaurantId — защищён JWT, для авторизованного администратора
app.get('/api/menu/:restaurantId', authMiddleware, async (req, res) => {
  // Пользователь может читать только своё меню
  if (req.user.restaurantId !== req.params.restaurantId) {
    return res.status(403).json({ error: 'Доступ запрещён' });
  }

  try {
    const menuRecord = await db.menu.findFirst({
      where: { restaurantId: req.params.restaurantId },
    });

    if (!menuRecord) {
      return res.json({ restaurantInfo: {}, categories: [], items: [], generalSettings: {} });
    }

    res.json({
      restaurantInfo: {
        ...(menuRecord.info ? JSON.parse(menuRecord.info) : {}),
        id: menuRecord.restaurantId // <-- ДОБАВЛЕН ID РЕСТОРАНА
      },
      categories: menuRecord.cats ? JSON.parse(menuRecord.cats) : [],
      items: menuRecord.items ? JSON.parse(menuRecord.items) : [],
      generalSettings: menuRecord.general_settings ? JSON.parse(menuRecord.general_settings) : {},
    });
  } catch (err) {
    console.error('❌ Ошибка чтения меню:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/menu/:restaurantId
app.post('/api/menu/:restaurantId', authMiddleware, async (req, res) => {
  // Пользователь может писать только в своё меню
  if (req.user.restaurantId !== req.params.restaurantId) {
    return res.status(403).json({ error: 'Доступ запрещён' });
  }

  const { info, items, cats, generalSettings } = req.body;
  try {
    await db.menu.updateMany({
      where: { restaurantId: req.params.restaurantId },
      data: {
        info: JSON.stringify(info || {}),
        items: JSON.stringify(items || []),
        cats: JSON.stringify(cats || []),
        general_settings: JSON.stringify(generalSettings || {}),
      },
    });
    res.json({ success: true });
  } catch (err) {
    console.error('❌ Ошибка сохранения меню:', err.message);
    res.status(500).json({ error: 'Ошибка сохранения меню: ' + err.message });
  }
});

// ============================================================
// ПРИГЛАШЕНИЯ СОТРУДНИКОВ (защищено JWT)
// ============================================================

app.post('/api/staff/invite', authMiddleware, async (req, res) => {
  try {
    const { email, role } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email обязателен' });
    }

    const mailOptions = {
      from: `"Daur Menu" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Приглашение в команду Daur Menu',
      html: `
        <div style="font-family: sans-serif; padding: 20px; max-width: 500px;">
          <h2>Вас пригласили в команду Daur Menu!</h2>
          <p>Вам назначена роль: <strong>${role || 'Сотрудник'}</strong>.</p>
          <p>Для входа в систему используйте ваш email: <b>${email}</b></p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, message: 'Приглашение успешно отправлено' });
  } catch (err) {
    console.error('❌ Ошибка при отправке письма:', err);
    res.status(500).json({ success: false, message: 'Не удалось отправить письмо: ' + err.message });
  }
});

// ============================================================
// OCR-ПАРСИНГ (защищено JWT)
// ============================================================

app.post('/api/parse-menu', authMiddleware, upload.single('menuFile'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Файл не загружен' });
  }

  try {
    const worker = await createWorker('rus');
    const { data: { text } } = await worker.recognize(req.file.buffer);
    await worker.terminate();

    const parsedData = parseMenuText(text);
    res.json(parsedData);
  } catch (error) {
    console.error('❌ Ошибка OCR:', error);
    res.status(500).json({ error: 'Не удалось распознать меню: ' + error.message });
  }
});

// ============================================================
// ЗАПУСК СЕРВЕРА
// ============================================================

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
});