const fs = require('fs');
let content = fs.readFileSync('src/components/OrderSettingsEditor.vue', 'utf8');

const targetRegex = /const getElapsedTime = \(createdAt: string \| number\) => \{[\s\S]*?return `\$\{String\(mins\)\.padStart\(2, '0'\)\}:\$\{String\(secs\)\.padStart\(2, '0'\)\}`;\n\};/;

const newFunc = `const getElapsedTime = (orderOrTime: any) => {
  if (!orderOrTime) return '00:00';
  
  let order = orderOrTime;
  let createdAt = orderOrTime;
  if (typeof orderOrTime === 'object') {
    createdAt = orderOrTime.createdAt;
  }
  
  if (!createdAt) return '00:00';

  let startMs: number;
  if (typeof createdAt === 'number') {
    startMs = createdAt;
  } else if (typeof createdAt === 'string' && (createdAt.includes('T') || createdAt.includes('-'))) {
    startMs = new Date(createdAt).getTime();
  } else if (typeof createdAt === 'string' && createdAt.includes(':')) {
    const [h, m] = createdAt.split(':').map(Number);
    const d = new Date();
    d.setHours(h, m, 0, 0);
    startMs = d.getTime();
  } else {
    return '00:00';
  }

  let endMs = now.value; // use reactive now
  
  if (typeof order === 'object' && (order.status === 'archived' || order.status === 'cancelled')) {
    if (order.updatedAt) {
      endMs = new Date(order.updatedAt).getTime();
    }
  }

  const diff = Math.max(0, endMs - startMs);
  const mins = Math.floor(diff / 60000);
  const secs = Math.floor((diff % 60000) / 1000);
  return \`\$\{String(mins).padStart(2, '0')}:\$\{String(secs).padStart(2, '0')\}\`;
};`;

if (content.match(targetRegex)) {
  content = content.replace(targetRegex, newFunc);
  fs.writeFileSync('src/components/OrderSettingsEditor.vue', content);
  console.log('Fixed getElapsedTime');
} else {
  console.log('Regex failed');
}

