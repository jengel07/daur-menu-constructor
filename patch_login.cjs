const fs = require('fs');
let c = fs.readFileSync('src/views/LoginView.vue', 'utf8');

c = c.replace(/import \{ ref \} from 'vue';/, "import { ref, onMounted } from 'vue';");
c = c.replace(/import \{ useRouter \} from 'vue-router';/, "import { useRouter, useRoute } from 'vue-router';");
c = c.replace(/const router = useRouter\(\);/, "const router = useRouter();\nconst route = useRoute();");

const onMountedCode = `
onMounted(() => {
  if (route.query.email && route.query.password) {
    email.value = route.query.email;
    password.value = route.query.password;
    isRegistering.value = false;
    handleSubmit();
  }
});
</script>
`;

c = c.replace(/<\/script>/, onMountedCode);

fs.writeFileSync('src/views/LoginView.vue', c);

