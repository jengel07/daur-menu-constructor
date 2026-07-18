import express from 'express';
import multer from 'multer';
import cors from 'cors';
import dotenv from 'dotenv';
import { createWorker } from 'tesseract.js';
import { parseMenuText } from './menuParser.js'; // Добавьте .js в конце

dotenv.config();

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

// Логика парсинга (будем расширять)
function parseMenuText(text) {
    if (!text || text.trim().length === 0) return { categories: [], items: [] };

    console.log("📝 Начало парсинга текста...");
    
    // Пример простого поиска цен (цифры + символ рубля)
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 3);
    const items = [];

    lines.forEach((line, index) => {
        const priceMatch = line.match(/(\d+)\s*[₽рP]/i);
        if (priceMatch) {
            items.push({
                id: `item-${index}`,
                categoryId: 'cat-1',
                name: line.replace(priceMatch[0], '').trim(),
                price: Number(priceMatch[1]),
                description: 'Описание из меню'
            });
        }
    });

    return {
        categories: [{ id: 'cat-1', name: 'Основное меню' }],
        items: items
    };
}

app.post('/api/parse-menu', upload.single('menuFile'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'Файл не загружен' });
    }

    try {
        console.log(`📂 Получен файл: ${req.file.originalname}`);

        // Инициализируем Worker правильно
        const worker = await createWorker('rus');
        
        // Распознавание
        const { data: { text } } = await worker.recognize(req.file.buffer);
        await worker.terminate();

        // Парсим
        const parsedData = parseMenuText(text);

        res.json(parsedData);
    } catch (error) {
        console.error('❌ Ошибка OCR или парсинга:', error);
        res.status(500).json({ error: 'Не удалось распознать меню: ' + error.message });
    }
});

app.listen(3000, () => {
    console.log('🚀 Сервер запущен на http://localhost:3000');
});