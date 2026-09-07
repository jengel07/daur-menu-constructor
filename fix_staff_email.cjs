const fs = require('fs');

let indexCode = fs.readFileSync('daur-menu-backend/index.js', 'utf8');

// The block to replace in POST /api/staff
const staffRegex = /\/\/ Отправка email с магической ссылкой \([\s\S]*?\} catch \(mailErr\) \{[\s\S]*?\}/;

const newStaffCode = `// Отправка email с магической ссылкой (не ждем завершения чтобы не тормозить)
      try {
        const restaurantData = await db.restaurant.findUnique({ where: { id: req.user.restaurantId } });
        const restName = restaurantData?.name || 'нашу команду';

        await transporter.sendMail({
          from: \`"\${restName}" <\${process.env.SMTP_USER}>\`,
          to: email,
          subject: \`Добро пожаловать в команду \${restName}!\`,
          html: \`
            <div style="font-family: sans-serif; padding: 20px; max-width: 500px;">
              <h2>Вы добавлены в команду \${restName}!</h2>
              <p>Роль: <strong>\${normalizedRole === 'cook' ? 'Повар' : normalizedRole === 'waiter' ? 'Официант' : normalizedRole}</strong></p>
              <p>Для входа на кухонный экран используйте:</p>
              <ul>
                <li>Email: <b>\${email}</b></li>
                <li>Пароль: <b>\${password}</b></li>
              </ul>
              <p>Ссылка для входа: <a href="\${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?email=\${encodeURIComponent(email)}&password=\${encodeURIComponent(password)}">Войти</a></p>
            </div>
          \`,
        });
      } catch (mailErr) {
        console.warn('Не удалось отправить email сотруднику:', mailErr.message);
      }`;

indexCode = indexCode.replace(staffRegex, newStaffCode);
fs.writeFileSync('daur-menu-backend/index.js', indexCode);
console.log('Fixed /api/staff email template');

