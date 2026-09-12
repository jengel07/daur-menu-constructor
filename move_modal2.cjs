const fs = require('fs');
let code = fs.readFileSync('src/components/MenuEditor.vue', 'utf8');

const regex = /<ModifiersEditor[\s\S]*?\/>/;
const match = code.match(regex);

if (match) {
  const modalHtml = match[0];
  // Remove it from current position
  code = code.replace(modalHtml, '');
  
  // Find the LAST </template>
  const lastIndex = code.lastIndexOf('</template>');
  if (lastIndex !== -1) {
    code = code.slice(0, lastIndex) + modalHtml + '\n  ' + code.slice(lastIndex);
    fs.writeFileSync('src/components/MenuEditor.vue', code);
    console.log('Successfully moved ModifiersEditor to the correct place');
  } else {
    console.log('Could not find </template>');
  }
} else {
  console.log('Could not find ModifiersEditor in the template');
}

