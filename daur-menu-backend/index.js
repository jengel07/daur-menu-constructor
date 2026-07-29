import express from 'express';
import multer from 'multer';
import cors from 'cors';
import dotenv from 'dotenv';
import { createWorker } from 'tesseract.js';
import { parseMenuText } from './menuParser.js';

dotenv.config();

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

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