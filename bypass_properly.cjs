const fs = require('fs');
let path = 'daur-menu-backend/index.js';
let code = fs.readFileSync(path, 'utf8');

const bypassCode = `
app.patch('/api/orders/:id/feedback', (req, res, next) => {
  req.url = \`/\${req.params.id}/feedback\`;
  ordersRouter(req, res, next);
});
`;

if (!code.includes('/api/orders/:id/feedback')) {
  // Find where app.use('/api/orders', authMiddleware, ordersRouter); is
  code = code.replace(
    /app\.use\('\/api\/orders', authMiddleware, ordersRouter\);/,
    `${bypassCode}\napp.use('/api/orders', authMiddleware, ordersRouter);`
  );
  fs.writeFileSync(path, code);
  console.log('Successfully patched index.js for feedback bypass!');
} else {
  console.log('Bypass already exists');
}

