const fs = require('fs');
const path = 'src/api.ts';
let code = fs.readFileSync(path, 'utf8');

const bannersApi = `
// ============================================================
// BANNERS API
// ============================================================
export const bannersApi = {
  getAll: (restaurantId: string) => request<{ banners: any[] }>(\`/api/banners/\${restaurantId}\`),
  getActive: (restaurantId: string) => request<{ banners: any[] }>(\`/api/banners/active/\${restaurantId}\`, { skipAuth: true }),
  create: (restaurantId: string, data: { imageUrl: string; targetItemId?: string; order?: number }) => 
    request<{ banner: any }>(\`/api/banners/\${restaurantId}\`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  update: (id: string, data: { isActive?: boolean; targetItemId?: string; order?: number }) =>
    request<{ banner: any }>(\`/api/banners/\${id}\`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    }),
  remove: (id: string) => request<{ success: boolean }>(\`/api/banners/\${id}\`, { method: 'DELETE' })
};
`;

code += '\n' + bannersApi;

fs.writeFileSync(path, code);
console.log('bannersApi added to src/api.ts');

