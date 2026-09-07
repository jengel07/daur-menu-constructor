const fs = require('fs');

let indexCode = fs.readFileSync('daur-menu-backend/index.js', 'utf8');

const achabFrom = `from: \`"Achab" <\${process.env.SMTP_USER}>\`,`;
const achabSubject = `subject: 'Добро пожаловать в команду Achab!',`;
const achabHtml = `<h2>Вы добавлены в команду Achab!</h2>`;

// We have 2 instances of these strings.
// 1. in /api/staff
// 2. in /api/superadmin/staff

// For the first one (staff) we need to fetch restaurant.
const oldStaffBlock = `      // Отправка email с магической ссылкой`;
const newStaffBlock = `      const restaurantData = await db.restaurant.findUnique({ where: { id: req.user.restaurantId } });
      const restName = restaurantData?.name || 'нашу команду';
      // Отправка email с магической ссылкой`;

indexCode = indexCode.replace(oldStaffBlock, newStaffBlock);

// Now replace Achab texts
// First instance uses restName
indexCode = indexCode.replace(achabFrom, `from: \`"\${restName}" <\${process.env.SMTP_USER}>\`,`);
indexCode = indexCode.replace(achabSubject, `subject: \`Добро пожаловать в команду \${restName}!\`,`);
indexCode = indexCode.replace(achabHtml, `<h2>Вы добавлены в команду \${restName}!</h2>`);

// Second instance (in superadmin) uses restaurant.name (since restaurant is defined there)
indexCode = indexCode.replace(achabFrom, `from: \`"\${restaurant.name || 'нашу команду'}" <\${process.env.SMTP_USER}>\`,`);
indexCode = indexCode.replace(achabSubject, `subject: \`Добро пожаловать в команду \${restaurant.name || 'нашу команду'}!\`,`);
indexCode = indexCode.replace(achabHtml, `<h2>Вы добавлены в команду \${restaurant.name || 'нашу команду'}!</h2>`);

fs.writeFileSync('daur-menu-backend/index.js', indexCode);

let ordersCode = fs.readFileSync('daur-menu-backend/orders.js', 'utf8');
ordersCode = ordersCode.replace(
  `from: \`"Achab Orders" <\${process.env.SMTP_USER}>\`,`,
  `from: \`"\${settings.restaurantName || 'Уведомления'}" <\${process.env.SMTP_USER}>\`,`
);
fs.writeFileSync('daur-menu-backend/orders.js', ordersCode);
console.log('Done!');

