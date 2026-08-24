// daur-menu-backend/menuParser.js

function parseMenuText(text) {
    console.log("Текст для обработки:", text);
    
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    
    const result = {
        categories: [{ id: 'cat-ocr', name: 'Распознанные блюда' }],
        items: []
    };

    lines.forEach((line, index) => {
        // Ищем паттерн: Название блюда [точки/пробелы] [цена] [руб/р/₽]
        // Например: "Борщ со сметаной 350 р" или "Салат Цезарь . . . 450"
        const match = line.match(/^(.+?)(?:[. \-]*?)\b(\d+(?:[.,]\d{1,2})?)\s*(?:₽|р|руб|rur)?\.?$/i);
        
        if (match) {
            const name = match[1].trim();
            const price = parseFloat(match[2].replace(',', '.'));
            
            if (name.length > 2) {
                result.items.push({
                    id: 'ocr-item-' + index + '-' + Math.random().toString(36).substr(2, 9),
                    categoryId: 'cat-ocr',
                    category: 'Распознанные блюда',
                    name: name,
                    description: '',
                    price: price,
                    isAvailable: true,
                    image: ''
                });
            }
        }
    });

    return result;
}

export { parseMenuText };