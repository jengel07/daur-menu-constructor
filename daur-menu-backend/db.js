import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Ошибка подключения к SQLite:', err.message);
    } else {
        console.log('Успешное подключение к базе данных SQLite.');
    }
});

db.serialize(() => {
    // 1. Таблица заказов
    db.run(`
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_number INTEGER NOT NULL,
            customer_name TEXT,
            customer_phone TEXT,
            table_number TEXT,
            status TEXT DEFAULT 'new',
            total_amount REAL NOT NULL,
            items TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // 2. Таблица состояния меню (JSON-структура)
    db.run(`
        CREATE TABLE IF NOT EXISTS menu_state (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            data TEXT NOT NULL,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // 3. Таблица пользователей и профилей (с ролями)
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT UNIQUE,
        password TEXT,
        role TEXT DEFAULT 'owner',
        restaurant_id INTEGER
    )`);

    // 4. Таблица меню
    db.run(`CREATE TABLE IF NOT EXISTS menus (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        title TEXT,
        is_available BOOLEAN DEFAULT 1,
        FOREIGN KEY(user_id) REFERENCES users(id)
    )`);

    // 5. Таблица категорий
    db.run(`CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        menu_id INTEGER,
        name TEXT,
        FOREIGN KEY(menu_id) REFERENCES menus(id)
    )`);

    // 6. Таблица блюд/элементов
    db.run(`CREATE TABLE IF NOT EXISTS items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category_id INTEGER,
        name TEXT,
        description TEXT,
        price REAL,
        image TEXT,
        is_active BOOLEAN DEFAULT 1,
        FOREIGN KEY(category_id) REFERENCES categories(id)
    )`);

    // 7. Таблица персонала (для привязки сотрудников к владельцу)
    db.run(`CREATE TABLE IF NOT EXISTS staff (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        owner_id INTEGER,
        email TEXT,
        role TEXT,
        status TEXT DEFAULT 'active',
        FOREIGN KEY(owner_id) REFERENCES users(id)
    )`);
});

export default db;