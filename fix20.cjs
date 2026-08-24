const fs = require('fs');
let content = fs.readFileSync('daur-menu-backend/index.js', 'utf8');

const oldBackendMap = `          const formattedDishes = items.map(dish => ({
            id: dish.id, // Сохраняем оригинальный ID для корзины и фронта
            name: dish.name || 'Без названия',
            price: parseFloat(dish.price) || 0,
            description: dish.description || '',
            image: dish.image || '',
            categoryId: dish.categoryId || null,
            restaurantId: restaurantId,
            isAvailable: dish.isAvailable ?? true,
            noNuts: dish.noNuts ?? false,
            noLactose: dish.noLactose ?? false,
            noGluten: dish.noGluten ?? false
          }));`;

const newBackendMap = `          const formattedDishes = items.map(dish => ({
            id: dish.id, // Сохраняем оригинальный ID для корзины и фронта
            name: dish.name || 'Без названия',
            price: parseFloat(dish.price) || 0,
            priceGlass: parseFloat(dish.priceGlass) || null,
            priceBottle: parseFloat(dish.priceBottle) || null,
            description: dish.description || '',
            image: dish.image || '',
            categoryId: dish.categoryId || null,
            restaurantId: restaurantId,
            isAvailable: dish.isAvailable ?? true,
            noNuts: dish.noNuts ?? false,
            noLactose: dish.noLactose ?? false,
            noGluten: dish.noGluten ?? false
          }));`;

content = content.replace(oldBackendMap, newBackendMap);
fs.writeFileSync('daur-menu-backend/index.js', content);
console.log('Successfully updated index.js backend map');

