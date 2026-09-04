const fs = require('fs');

let c = fs.readFileSync('src/views/LoginView.vue', 'utf8');

c = c.replace(/import \{ ref, onMounted \} from 'vue';/, "import { ref, onMounted, watch } from 'vue';");

const oldCodeRegex = /onMounted\(\(\) => \{[\s\S]*?\}\);\s*<\/script>/;

const newCode = `const checkAutoLogin = () => {
  if (route.query.email && route.query.password) {
    email.value = Array.isArray(route.query.email) ? route.query.email[0] : route.query.email;
    password.value = Array.isArray(route.query.password) ? route.query.password[0] : route.query.password;
    
    // Clear query so it doesn't loop
    const query = { ...route.query };
    delete query.email;
    delete query.password;
    router.replace({ query });

    isRegistering.value = false;
    handleSubmit();
  }
};

onMounted(checkAutoLogin);
watch(() => route.query, checkAutoLogin, { immediate: true });
</script>`;

c = c.replace(oldCodeRegex, newCode);
fs.writeFileSync('src/views/LoginView.vue', c);
console.log("Patched!");

