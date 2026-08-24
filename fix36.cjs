const fs = require('fs');
let content = fs.readFileSync('src/api.ts', 'utf8');

const target = `    updateStatusWithNote: (id: string, status: string, note?: string) =>
      request<{ success: boolean }>(\`/api/orders/\${id}/status\`, {
        method: 'PATCH',
        body: JSON.stringify({ status, rejectionNote: note }),
      }),`;

const replacement = `    updateStatusWithNote: (id: string, status: string, note?: string) =>
      request<{ success: boolean }>(\`/api/orders/\${id}/status\`, {
        method: 'PATCH',
        body: JSON.stringify({ status, rejectionNote: note }),
      }),
      
    delete: (id: string) =>
      request<{ success: boolean }>(\`/api/orders/\${id}\`, { method: 'DELETE' }),
      
    deleteAll: () =>
      request<{ success: boolean }>('/api/orders/all', { method: 'DELETE' }),`;

content = content.replace(target, replacement);
fs.writeFileSync('src/api.ts', content);
console.log('Added delete methods to api.ts');

