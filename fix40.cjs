const fs = require('fs');
let content = fs.readFileSync('src/api.ts', 'utf8');

content = content.replace(
`  deleteAll: () =>
    request<{ success: boolean }>('/api/orders/all', { method: 'DELETE' }),
    }),`,
`  deleteAll: () =>
    request<{ success: boolean }>('/api/orders/all', { method: 'DELETE' }),`
);

fs.writeFileSync('src/api.ts', content);
console.log('Fixed syntax in api.ts');

