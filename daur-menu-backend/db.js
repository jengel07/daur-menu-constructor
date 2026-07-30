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
    db.run(`
        CREATE TABLE IF NOT EXISTS menu_state (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            data TEXT NOT NULL,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
});

export default db;