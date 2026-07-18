const express = require('express');
const multer = require('multer');
const cors = require('cors');
const dotenv = require('dotenv');
const { createWorker } = require('tesseract.js');

dotenv.config();

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

// Функция для ручного парсинга текста (здесь вы будете писать свои правила)
function parseMenuText(text) {
    console.log("📝 Обработка текста:", text.substring(0, 200) + "...");
    
    // ВАША ЛОГИКА: Здесь нужно будет с помощью RegEx или split
    // превратить 'text' в массив категорий и блюд
    return {
        categories: [{ id: 'cat-1', name: 'Основное меню' }],
        items: [] // Пока пусто, так как нужно настроить парсинг под ваш формат
    };
}

app.post('/api/parse-menu', upload.single('menuFile'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'Файл не загружен' });
    }

    try {
        console.log(`📂 Получен файл: ${req.file.originalname}`);

        // Инициализируем Tesseract
        const worker = await createWorker('rus');
        const { data: { text } } = await worker.recognize(req.file.buffer);
        await worker.terminate();

        // Парсим полученный текст
        const parsedData = parseMenuText(text);

        res.json(parsedData);
    } catch (error) {
        console.error('❌ Ошибка OCR:', error);
        res.status(500).json({ error: 'Не удалось распознать меню' });
    }
});

app.use((err, req, res, next) => {
    console.error('💥 Критическая ошибка:', err);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на http://localhost:${PORT} (без ИИ)`);
});