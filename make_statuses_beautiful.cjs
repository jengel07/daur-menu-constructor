const fs = require('fs');
let path = 'src/views/ClientView.vue';
let code = fs.readFileSync(path, 'utf8');

// 1. Update imports
const importSearch = /import \{ ShoppingCart, Star, ConciergeBell, ClipboardCheck, Armchair \} from 'lucide-vue-next';/;
const importReplace = `import { ShoppingCart, Star, ConciergeBell, ClipboardCheck, Armchair, Clock, ChefHat, CheckCircle, XCircle, ChevronDown, X } from 'lucide-vue-next';`;
code = code.replace(importSearch, importReplace);

// 2. Update HTML of floating-order-bar
const barSearchRegex = /<div class="floating-order-bar" :class="'status-' \+ activeOrderStatus" @click="isOrderExpanded = !isOrderExpanded"[^>]*>.*?<\/button>\s*<\/div>/is;

const newBarHtml = `
            <div class="floating-order-bar" @click="isOrderExpanded = !isOrderExpanded">
              <div class="order-bar-icon-wrapper" :class="'status-' + activeOrderStatus">
                <Clock v-if="activeOrderStatus === 'new'" :size="20" stroke-width="2" />
                <ChefHat v-else-if="activeOrderStatus === 'progress'" :size="20" stroke-width="2" />
                <CheckCircle v-else-if="activeOrderStatus === 'done' || activeOrderStatus === 'archived'" :size="20" stroke-width="2" />
                <XCircle v-else :size="20" stroke-width="2" />
              </div>
              <div class="order-bar-text">
                <strong>{{ tDyn('Заказ') }} #{{ activeOrderNumber || activeOrderId.slice(-4) }}</strong>
                <span>{{ getOrderStatusText() }}</span>
              </div>
              <div class="order-bar-right">
                <button v-if="activeOrderStatus === 'done' || activeOrderStatus === 'archived' || activeOrderStatus === 'cancelled'" class="close-order-btn" @click.stop="clearActiveOrder">
                  <X :size="14" stroke-width="3" />
                </button>
                <ChevronDown class="order-bar-chevron" :class="{ 'expanded': isOrderExpanded }" :size="20" />
              </div>
            </div>`;

code = code.replace(barSearchRegex, newBarHtml.trim());

// 3. Update CSS
// Remove old CSS:
// .floating-order-bar { ... }
// .floating-order-bar.status-* { ... }
// .order-bar-text { ... }
// .order-bar-text strong { ... }
// .close-order-btn { ... }

// Let's replace the block from `.floating-order-bar {` to `.close-order-btn { ... }`
// Actually it's safer to just comment out the old ones or replace them via regex

const cssToRemoveRegex = /\.floating-order-bar \{[\s\S]*?cursor: pointer; \}/g;
// Wait, CSS replacement can be tricky if it spans multiple lines.
// Let's just find and replace using indexOf.
const cssStart = code.indexOf('.floating-order-bar {');
const emptySearchNotice = code.indexOf('.empty-search-notice {');

if (cssStart !== -1 && emptySearchNotice !== -1) {
  const oldCss = code.substring(cssStart, emptySearchNotice);
  
  const newCss = `.floating-order-bar {
  background: #ffffff;
  border-radius: 16px;
  padding: 12px 14px;
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 20;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  box-sizing: border-box;
  transition: all 0.3s ease;
  cursor: pointer;
  border: 1px solid rgba(0,0,0,0.05);
}
.order-bar-icon-wrapper {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: white;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
.order-bar-icon-wrapper.status-new { background: linear-gradient(135deg, #60a5fa, #3b82f6); }
.order-bar-icon-wrapper.status-progress { background: linear-gradient(135deg, #fbbf24, #f59e0b); }
.order-bar-icon-wrapper.status-done { background: linear-gradient(135deg, #34d399, #10b981); }
.order-bar-icon-wrapper.status-archived { background: linear-gradient(135deg, #9ca3af, #6b7280); }
.order-bar-icon-wrapper.status-cancelled { background: linear-gradient(135deg, #f87171, #ef4444); }

.order-bar-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.order-bar-text strong { font-size: 14px; color: #111; }
.order-bar-text span { font-size: 11px; color: #6b7280; font-weight: 600; line-height: 1.2; }

.order-bar-right {
  display: flex;
  align-items: center;
  gap: 10px;
}
.order-bar-chevron {
  color: #9ca3af;
  transition: transform 0.3s ease;
}
.order-bar-chevron.expanded {
  transform: rotate(180deg);
}
.close-order-btn {
  background: #f1f5f9;
  color: #64748b;
  border: none;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s;
  padding: 0;
}
.close-order-btn:hover { background: #e2e8f0; color: #334155; }

`;
  code = code.replace(oldCss, newCss);
}

fs.writeFileSync(path, code);
console.log('Successfully applied beautiful order statuses');

