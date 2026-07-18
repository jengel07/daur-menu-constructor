import { ref } from 'vue';
import type { MenuItem, MenuCategory } from '../types/menu';


export function useMenuParser() {
  const isParsing = ref(false);
  const error = ref<string | null>(null);

  // Конвертируем файл в нужный для SDK формат base64
  const fileToGenerativePart = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Data = (reader.result as string).split(',')[1];
        resolve({
          inlineData: {
            data: base64Data,
            mimeType: file.type
          }
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const parseMenuFile = async (file: File): Promise<{ categories: MenuCategory[]; items: MenuItem[] }> => {
    isParsing.value = true;
    error.value = null;

    try {
      const filePart = await fileToGenerativePart(file);

      const prompt = `
        Ты — профессиональный парсер ресторанных меню. Анализируй прикрепленный файл меню.
        Извлеки все разделы (категории) и все блюда.

        Сгенерируй ответ СТРОГО в формате JSON со следующей структурой:
        {
          "categories": [
            { "id": "cat-1", "name": "Название категории" }
          ],
          "items": [
            {
              "id": "item-1",
              "categoryId": "cat-1",
              "name": "Название блюда",
              "description": "Описание состава блюда на русском языке (если в меню его нет, придумай короткое аппетитное описание сам)",
              "price": 450,
              "isAvailable": true
            }
          ]
        }

        Правила:
        1. Названия категорий пиши с большой буквы.
        2. Цены преобразуй в чистые целые числа.
        3. Отвечай ТОЛЬКО чистым JSON без markdown разметки \`\`\`json.
      `;

      // Самая стабильная, быстрая и дешевая модель на сегодня
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [filePart, prompt],
      });

      const responseText = response.text ? response.text.trim() : '';
      
      // Очистка от возможных кавычек, если модель их вернет
      const cleanJsonString = responseText.replace(/^```json\s*/i, '').replace(/```$/, '').trim();
      const parsedData = JSON.parse(cleanJsonString);

      const timestamp = Date.now();
      const categories: MenuCategory[] = parsedData.categories.map((c: any, index: number) => ({
        id: `cat-${timestamp}-${index}`,
        name: c.name
      }));

      const items: MenuItem[] = parsedData.items.map((item: any, index: number) => {
        const oldCatIndex = parsedData.categories.findIndex((c: any) => c.id === item.categoryId);
        const newCatId = oldCatIndex !== -1 ? categories[oldCatIndex].id : categories[0].id;

        return {
          id: `item-${timestamp}-${index}`,
          categoryId: newCatId,
          name: item.name,
          description: item.description || 'Фирменное предложение.',
          price: Number(item.price) || 0,
          isAvailable: true
        };
      });

      return { categories, items };

    } catch (err: any) {
      console.error('Ошибка Gemini-парсинга:', err);
      error.value = 'Нейросети не удалось распознать меню. Проверьте ваш API-ключ или попробуйте загрузить файл меньшего размера.';
      throw err;
    } finally {
      isParsing.value = false;
    }
  };

return {
  isParsing,
  progress: ref(0), // Заглушка для прогресс-бара, чтобы не ругался TS
  error,
  parseMenuFile
};
}