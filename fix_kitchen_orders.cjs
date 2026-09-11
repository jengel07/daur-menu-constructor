const fs = require('fs');

let path = 'src/views/KitchenOrders.vue';
let code = fs.readFileSync(path, 'utf8');

// 1. Add lucide imports
code = code.replace(
  /import \{ ref, computed, onMounted, onUnmounted \} from 'vue'/,
  `import { ref, computed, onMounted, onUnmounted } from 'vue'\nimport { LogOut, RefreshCw, Moon, Sun, AlertOctagon } from 'lucide-vue-next'`
);

// 2. Replace action buttons in header with nice icons
code = code.replace(
  /<div class="k-header-actions">[\s\S]*?<\/div>/,
  `<div class="k-header-actions">
        <button class="k-btn-icon btn-stoplist" @click="showStopList = true" title="Стоп-лист">
          <AlertOctagon :size="18" />
          <span class="btn-text">Стоп-лист</span>
        </button>
        <button class="k-btn-icon" :title="isLight ? 'Тёмная тема' : 'Светлая тема'" @click="isLight = !isLight">
          <Moon v-if="isLight" :size="18" />
          <Sun v-else :size="18" />
        </button>
        <button class="k-btn-icon" :class="{ rotating: loading }" @click="fetchOrders" title="Обновить">
          <RefreshCw :size="18" />
        </button>
        <button class="k-btn-icon btn-logout" @click="logout" title="Выйти">
          <LogOut :size="18" />
        </button>
      </div>`
);

// 3. Update CSS for k-header, k-tabs, and k-header-actions
// I'll replace a block of CSS
const cssReplace = `.k-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  background: #1a1d2e;
  border-bottom: 1px solid #2d3148;
  gap: 16px;
}
.light-theme .k-header { background: #fff; border-color: #e2e5f0; }
.k-title-block { display: flex; align-items: center; gap: 12px; }
.k-logo { font-size: 24px; }
.k-title { font-size: 16px; font-weight: 700; margin: 0; white-space: nowrap; }
.k-role { font-size: 11px; color: #8b90b5; white-space: nowrap; }
.light-theme .k-role { color: #6b7080; }

.k-tabs { 
  display: flex; 
  gap: 8px; 
  flex: 1; 
  overflow-x: auto; 
  scrollbar-width: none;
  padding-bottom: 2px;
}
.k-tabs::-webkit-scrollbar { display: none; }
.k-tab {
  display: flex; align-items: center; gap: 6px;
  padding: 8px 14px;
  border: 1.5px solid transparent;
  border-radius: 24px;
  cursor: pointer;
  font-size: 13px; font-weight: 600;
  background: #23263b; color: #8b90b5;
  transition: all 0.2s;
  white-space: nowrap;
  flex-shrink: 0;
}
.light-theme .k-tab { background: #f0f2f8; color: #6b7080; }
.k-tab-count {
  background: #333660; color: #fff;
  border-radius: 12px; padding: 2px 6px; font-size: 11px;
}
.k-tab.new.active { border-color: #f59e0b; color: #f59e0b; background: rgba(245,158,11,.12); }
.k-tab.progress.active { border-color: #3b82f6; color: #3b82f6; background: rgba(59,130,246,.12); }
.k-tab.done.active { border-color: #22c55e; color: #22c55e; background: rgba(34,197,94,.12); }
.k-tab.cancelled.active { border-color: #ef4444; color: #ef4444; background: rgba(239,68,68,.12); }

.k-header-actions { display: flex; gap: 8px; align-items: center; }
.k-btn-icon {
  display: flex; align-items: center; justify-content: center; gap: 6px;
  background: #23263b; border: 1px solid #333660; color: #8b90b5;
  border-radius: 10px; padding: 8px; font-size: 13px; cursor: pointer;
  transition: all 0.2s;
}
.light-theme .k-btn-icon { background: #f0f2f8; border-color: #e2e5f0; color: #475569; }
.k-btn-icon:hover { background: #2d3148; color: #fff; }
.light-theme .k-btn-icon:hover { background: #e2e8f0; color: #0f172a; }

.btn-stoplist { background: rgba(245,158,11,.1); color: #f59e0b; border-color: rgba(245,158,11,.3); padding: 8px 12px; }
.btn-stoplist:hover { background: rgba(245,158,11,.2) !important; color: #f59e0b !important; }
.btn-logout { background: rgba(239,68,68,.1); color: #ef4444; border-color: rgba(239,68,68,.3); }
.btn-logout:hover { background: rgba(239,68,68,.2) !important; color: #ef4444 !important; }

.k-btn-icon.rotating svg { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* Mobile layout adjustments */
@media (max-width: 768px) {
  .k-header { flex-direction: column; align-items: stretch; padding: 16px; gap: 16px; }
  .k-title-block { justify-content: space-between; }
  .k-header-actions { justify-content: space-between; }
  .btn-text { display: none; }
  .k-btn-icon { flex: 1; padding: 10px; }
  .k-tabs { padding-bottom: 4px; }
}
`;

// Find where .k-header CSS starts and ends.
const cssStart = code.indexOf('.k-header {');
const cssEnd = code.indexOf('.k-autorefresh-bar {');

if (cssStart !== -1 && cssEnd !== -1) {
  code = code.substring(0, cssStart) + cssReplace + '\n' + code.substring(cssEnd);
}

fs.writeFileSync(path, code);
console.log('Fixed KitchenOrders design');
