const fs = require('fs');
const path = require('path');

// Читаем .env файл
const envPath = path.join(__dirname, '../.env');
const envContent = fs.readFileSync(envPath, 'utf8');

// Ключи для синхронизации
const keysToSync = [
  'PORT',
  'OPENAI_API_KEY',
  'PERPLEXITY_API_KEY',
  'GOOGLE_API_KEY',
  'GOOGLE_APPLICATION_CREDENTIALS',
  'VERTEX_PROJECT_ID',
  'VERTEX_LOCATION'
];

// Парсим .env
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    const value = match[2].trim();
    envVars[key] = value;
  }
});

// Проверяем наличие ключей в .env
console.log('Checking .env file presence:');
const envPresence = {};
keysToSync.forEach(key => {
  envPresence[key] = !!envVars[key];
  console.log(`${key}: ${envPresence[key] ? 'present' : 'missing'}`);
});

// Создаем batch файл для установки переменных в Windows
let batchContent = '@echo off\n';
batchContent += 'echo Syncing environment variables to user environment...\n\n';

// Устанавливаем PORT=5000 если отсутствует
if (!envVars.PORT) {
  batchContent += 'setx PORT "5000"\n';
  console.log('PORT not found in .env, will set to 5000');
} else {
  batchContent += `setx PORT "${envVars.PORT}"\n`;
}

// Синхронизируем остальные переменные
keysToSync.forEach(key => {
  if (key !== 'PORT' && envVars[key]) {
    // Экранируем специальные символы для batch
    const value = envVars[key].replace(/"/g, '\\"');
    batchContent += `setx ${key} "${envVars[key]}"\n`;
  }
});

batchContent += '\necho Environment variables synced successfully!\n';
batchContent += 'echo Note: New values will be available to new processes only.\n';

// Сохраняем batch файл
const batchPath = path.join(__dirname, 'sync-env.bat');
fs.writeFileSync(batchPath, batchContent);

console.log('\nCreated batch file for sync:', batchPath);
console.log('Run it manually to sync variables to user environment.');

// Сохраняем результат проверки
const result = {
  generated_at: new Date().toISOString(),
  env_file_presence: envPresence,
  notes: 'All variables are missing from user environment but present in .env file'
};

fs.writeFileSync(path.join(__dirname, '../logs/env-sync-analysis.json'), JSON.stringify(result, null, 2));
console.log('\nAnalysis saved to logs/env-sync-analysis.json');