const fs = require('fs');
const path = require('path');

const logFile = path.join(__dirname, 'reports', 'artifacts', 'ci_logs', 'eslint_install.log');

try {
  // Читаем файл с UTF-8 кодировкой
  let content = fs.readFileSync(logFile, 'utf8');
  
  // Заменяем CRLF (\r\n) на LF (\n)
  content = content.replace(/\r\n/g, '\n');
  
  // Записываем обратно с UTF-8 кодировкой
  fs.writeFileSync(logFile, content, 'utf8');
  
  console.log('Log file normalized: CRLF -> LF');
} catch (error) {
  console.error('Error normalizing log file:', error.message);
  process.exit(1);
}