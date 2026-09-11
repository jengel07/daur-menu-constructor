const fs = require('fs');
let path = 'daur-menu-backend/index.js';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  /\/\/ GET \/api\/orders и PATCH \/api\/orders\/:id\/status требуют JWT/,
  `app.patch('/api/orders/:id/feedback', (req, res, next) => {
    req.url = \`/\${req.params.id}/feedback\`;
    ordersRouter(req, res, next);
  });\n\n  // GET /api/orders и PATCH /api/orders/:id/status требуют JWT`
);

fs.writeFileSync(path, code);
console.log('Patched index.js for feedback bypass');

