// daur-menu-backend/menuParser.js

function parseMenuText(text) {
    console.log("Текст для обработки:", text);
    
    // 1. Разбиваем текст на строки
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    
    // 2. Инициализируем структуру
    const result = {
        categories: [],
        items: []
    };

    // 3. Тут будет ваша магия поиска (RegEx)
    // Например: поиск цен в строке
    lines.forEach(line => {
        const priceMatch = line.match(/\d+\s?[₽р]/);
        if (priceMatch) {
            console.log("Найдена цена:", priceMatch[0]);
        }
    });

    return result;
}

module.exports = { parseMenuText };