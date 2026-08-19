# 🍽️ Daur Menu Constructor

Платформа для создания цифровых меню ресторанов с QR-кодами, управлением заказами и настройкой брендинга.

## 🛠️ Стек технологий

| Слой | Технологии |
|------|-----------|
| **Фронтенд** | Vue 3 + TypeScript + Vite + Pinia |
| **Бэкенд** | Express.js + Prisma 7 |
| **БД** | PostgreSQL (Supabase) |
| **Авторизация** | JWT + bcryptjs |
| **Email** | Nodemailer (Gmail SMTP) |
| **OCR** | Tesseract.js |

---

## 🚀 Запуск проекта

### Бэкенд

```bash
cd daur-menu-backend
npm install
node index.js
```

Сервер запускается на `http://localhost:3000`

### Фронтенд

```bash
npm install
npm run dev
```

Приложение открывается на `http://localhost:5173`

---

## ⚙️ Переменные окружения

### `daur-menu-backend/.env`

```env
DATABASE_URL="postgresql://user:password@host:port/db"
JWT_SECRET=your_super_secret_key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your@email.com
SMTP_PASS=your_app_password
PORT=3000
FRONTEND_URL=http://localhost:5173
```

### `.env` (корень — фронтенд)

```env
VITE_API_URL=http://localhost:3000
```

---

## 🔌 API

| Метод | Путь | Доступ | Описание |
|-------|------|--------|---------|
| `POST` | `/api/auth/register` | Публичный | Регистрация |
| `POST` | `/api/auth/login` | Публичный | Вход (получить JWT) |
| `POST` | `/api/auth/refresh` | JWT | Обновить токен |
| `GET` | `/api/menu/:id` | JWT | Получить меню |
| `POST` | `/api/menu/:id` | JWT (owner) | Сохранить меню |
| `GET` | `/api/orders` | JWT | Список заказов |
| `POST` | `/api/orders` | JWT | Создать заказ |
| `PATCH` | `/api/orders/:id/status` | JWT | Изменить статус |
| `POST` | `/api/staff/invite` | JWT | Пригласить сотрудника |
| `POST` | `/api/parse-menu` | JWT | OCR-распознавание |

> Все JWT-роуты требуют заголовок: `Authorization: Bearer <token>`

---

## 🔐 Безопасность

- Пароли хэшируются через **bcrypt** (12 rounds)
- Авторизация через **JWT** токены (срок: 30 дней)
- Каждый ресторан имеет доступ **только к своим данным**
- Автоматический редирект на `/login` при истёкшем токене
