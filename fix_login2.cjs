const fs = require('fs');
let c = fs.readFileSync('src/views/LoginView.vue', 'utf8');

c = c.replace(/<style scoped>[\s\S]*?\.brand-logo/, `<style scoped>
.login-page {
  min-height: 100vh;
  background-color: #ffffff;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #1a1a1a;
  display: flex;
  flex-direction: column;
}

.top-nav {
  padding: 30px 40px;
}

.brand-logo`);

fs.writeFileSync('src/views/LoginView.vue', c);

