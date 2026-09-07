const fs = require('fs');

let indexCode = fs.readFileSync('daur-menu-backend/index.js', 'utf8');

// For /api/staff
// We need to fetch the restaurant inside /api/staff before sending the email.
// Currently it doesn't fetch the restaurant.

indexCode = indexCode.replace(
  `      // Отправка email с магической ссылкой (не ждем завершения чтобы не тормозить)`,
  `      // Fetch restaurant name for email
      const restaurant = await db.restaurant.findUnique({ where: { id: req.user.restaurantId } });
      const restName = restaurant?.name || 'нашу команду';

      // Отправка email с магической ссылкой (не ждем завершения чтобы не тормозить)`
);

// Now replace Achab in /api/staff email
// We have to be careful not to replace the other one incorrectly.
// Let's replace using regex for the first one (which doesn't have restaurant defined previously)
indexCode = indexCode.replace(
  /from: `"Achab" <\$\{process\.env\.SMTP_USER\}>`,\s*to: email,\s*subject: 'Добро пожаловать в команду Achab!',\s*html: `[\s\S]*?<h2>Вы добавлены в команду Achab!<\/h2>/,
  `from: \`"\${restName}" <\${process.env.SMTP_USER}>\`,
          to: email,
          subject: \`Добро пожаловать в команду \${restName}!\`,
          html: \`
            <div style="font-family: sans-serif; padding: 20px; max-width: 500px;">
              <h2>Вы добавлены в команду \${restName}!</h2>`
);

// Now for /api/superadmin/staff
// Here `restaurant` is already defined and fetched.
// We can use `const restName2 = restaurant.name || 'нашу команду';` or just `restaurant.name`
indexCode = indexCode.replace(
  /from: `"Achab" <\$\{process\.env\.SMTP_USER\}>`,\s*to: email,\s*subject: 'Добро пожаловать в команду Achab!',\s*html: `[\s\S]*?<h2>Вы добавлены в команду Achab!<\/h2>/,
  `from: \`"\${restaurant.name || 'команду'}" <\${process.env.SMTP_USER}>\`,
          to: email,
          subject: \`Добро пожаловать в команду \${restaurant.name || 'команду'}!\`,
          html: \`
            <div style="font-family: sans-serif; padding: 20px; max-width: 500px;">
              <h2>Вы добавлены в команду \${restaurant.name || 'команду'}!</h2>`
);

fs.writeFileSync('daur-menu-backend/index.js', indexCode);

let ordersCode = fs.readFileSync('daur-menu-backend/orders.js', 'utf8');

// The new order email has "Achab Orders"
ordersCode = ordersCode.replace(
  /from: `"Achab Orders" <\$\{process\.env\.SMTP_USER\}>`,/,
  `from: \`"\${restaurantInfo.name || 'Уведомления'}" <\${process.env.SMTP_USER}>\`,`
);

fs.writeFileSync('daur-menu-backend/orders.js', ordersCode);
console.log('Patched emails!');

