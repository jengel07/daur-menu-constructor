const fs = require('fs');
let code = fs.readFileSync('daur-menu-backend/index.js', 'utf8');

// The block to move
const startMarker = '// ============================================================\n// СТОП-ЛИСТ (ДЛЯ ПЕРСОНАЛА)\n// ============================================================';
const endMarker = `    } catch (error) {\r\n      console.error('Ошибка обновления стоп-листа:', error.message);\r\n      res.status(500).json({ error: 'Ошибка сервера' });\r\n    }\r\n  });`;
const endMarkerUnix = `    } catch (error) {\n      console.error('Ошибка обновления стоп-листа:', error.message);\n      res.status(500).json({ error: 'Ошибка сервера' });\n    }\n  });`;

let block = '';
let startIndex = code.indexOf(startMarker);
if (startIndex !== -1) {
  let endIndex = code.indexOf(endMarker, startIndex);
  if (endIndex === -1) endIndex = code.indexOf(endMarkerUnix, startIndex);
  if (endIndex !== -1) {
    const endLen = endIndex === code.indexOf(endMarker, startIndex) ? endMarker.length : endMarkerUnix.length;
    block = code.substring(startIndex, endIndex + endLen);
    // Remove it from the current position
    code = code.substring(0, startIndex) + code.substring(endIndex + endLen);
  }
}

if (block) {
  // Insert it after adminOnly middleware
  const target = `  next();\n}\n`;
  const targetUnix = `  next();\r\n}\r\n`;
  
  let targetIndex = code.lastIndexOf(target);
  let useTarget = target;
  if (targetIndex === -1) {
    targetIndex = code.lastIndexOf(targetUnix);
    useTarget = targetUnix;
  }
  
  if (targetIndex !== -1) {
    code = code.substring(0, targetIndex + useTarget.length) + '\n' + block + '\n' + code.substring(targetIndex + useTarget.length);
  } else {
    console.log("Could not find insertion target");
  }
} else {
  console.log("Could not find block to extract");
}

fs.writeFileSync('daur-menu-backend/index.js', code);
console.log('Moved routes');

