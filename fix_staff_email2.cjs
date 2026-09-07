const fs = require('fs');

let indexCode = fs.readFileSync('daur-menu-backend/index.js', 'utf8');

const badCode = `      // Отправка email с магической ссылкой (не ждем завершения чтобы не тормозить)
      try {
        await transporter.sendMail({
          from: \`"\${restName}" <\${process.env.SMTP_USER}>\`,`;

const goodCode = `      // Отправка email с магической ссылкой (не ждем завершения чтобы не тормозить)
      try {
        const restaurantData = await db.restaurant.findUnique({ where: { id: req.user.restaurantId } });
        const restName = restaurantData?.name || 'нашу команду';

        await transporter.sendMail({
          from: \`"\${restName}" <\${process.env.SMTP_USER}>\`,`;

indexCode = indexCode.replace(badCode, goodCode);

// Also replace the remaining "Achab" in the html
indexCode = indexCode.replace(`<h2>Вы добавлены в команду Achab!</h2>`, `<h2>Вы добавлены в команду \${restName}!</h2>`);

fs.writeFileSync('daur-menu-backend/index.js', indexCode);
console.log('Fixed it properly this time');

