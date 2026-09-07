const fs = require('fs');

let indexCode = fs.readFileSync('daur-menu-backend/index.js', 'utf8');

// Just inject the code before `await transporter.sendMail`
indexCode = indexCode.replace(
  /await transporter\.sendMail/g,
  `const restaurantData = await db.restaurant.findUnique({ where: { id: req.user?.restaurantId || restaurantId } }).catch(()=>null);
        const restName = restaurantData?.name || 'нашу команду';
        await transporter.sendMail`
);

indexCode = indexCode.replace(/<h2>Вы добавлены в команду Achab!<\/h2>/g, `<h2>Вы добавлены в команду \${restName}!</h2>`);

fs.writeFileSync('daur-menu-backend/index.js', indexCode);
console.log('Fixed globally!');

