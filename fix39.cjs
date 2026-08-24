const fs = require('fs');
let content = fs.readFileSync('src/api.ts', 'utf8');

const replacement = `  updateStatusWithNote: (id: string, status: string, rejectionNote?: string) =>
    request<{ success: boolean }>(\`/api/orders/\${id}/status\`, {
      method: 'PATCH',
      body: JSON.stringify({ status, rejectionNote }),
    }),
    
  delete: (id: string) =>
    request<{ success: boolean }>(\`/api/orders/\${id}\`, { method: 'DELETE' }),
    
  deleteAll: () =>
    request<{ success: boolean }>('/api/orders/all', { method: 'DELETE' }),`;

content = content.replace(
  /updateStatusWithNote: \(id: string, status: string, rejectionNote\?: string\) =>[\s\S]*?\}\),/,
  replacement
);

fs.writeFileSync('src/api.ts', content);
console.log('Fixed api.ts');

