const fs = require('fs');
let code = fs.readFileSync('src/api.ts', 'utf8');

const injection = `
// ============================================================
// STAFF MENU API (STOP-LIST)
// ============================================================
export const staffMenuApi = {
  getMenu: () => request<{ categories: any[]; items: any[] }>('/api/staff/menu'),
  updateAvailability: (id: string, isAvailable: boolean) => 
    request<{ success: boolean }>(\`/api/staff/dishes/\${id}/availability\`, {
      method: 'PATCH',
      body: JSON.stringify({ isAvailable })
    })
};
`;

code = code.replace(
  '// ============================================================',
  injection + '\n// ============================================================'
);

fs.writeFileSync('src/api.ts', code);
console.log('Added staffMenuApi to api.ts');
