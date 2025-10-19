const fs = require('fs');
const path = require('path');

// Ключи для проверки
const keysToCheck = [
  'PORT',
  'OPENAI_API_KEY',
  'PERPLEXITY_API_KEY',
  'GOOGLE_API_KEY',
  'GOOGLE_APPLICATION_CREDENTIALS',
  'VERTEX_PROJECT_ID',
  'VERTEX_LOCATION'
];

// Читаем .env для сравнения
const envPath = path.join(__dirname, '../.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    const value = match[2].trim();
    envVars[key] = value;
  }
});

// Проверяем наличие в .env
const envFilePresence = {};
keysToCheck.forEach(key => {
  envFilePresence[key] = !!envVars[key];
});

// Проверяем наличие в runtime
const runtimePresence = {};
keysToCheck.forEach(key => {
  runtimePresence[key] = !!process.env[key];
});

// Проверяем наличие в user environment через reg query
const { execSync } = require('child_process');
const userEnvPresence = {};

keysToCheck.forEach(key => {
  try {
    const result = execSync(`reg query "HKCU\\Environment" /v ${key} 2>nul`, { encoding: 'utf8' });
    userEnvPresence[key] = result.includes('REG_');
  } catch (error) {
    userEnvPresence[key] = false;
  }
});

// Создаем результат верификации
const verificationResult = {
  generated_at: new Date().toISOString(),
  chosen_source: "user_env",
  synced_from_env_file: true,
  keys: {}
};

keysToCheck.forEach(key => {
  verificationResult.keys[key] = {
    user_env: userEnvPresence[key],
    env_file: envFilePresence[key],
    effective_runtime: runtimePresence[key]
  };
});

// Добавляем заметку если нужно
const missingKeys = keysToCheck.filter(key => !runtimePresence[key]);
if (missingKeys.length > 0) {
  verificationResult.notes = `Missing keys in runtime: ${missingKeys.join(', ')}`;
}

// Сохраняем результат
fs.writeFileSync(path.join(__dirname, '../logs/env_verify.json'), JSON.stringify(verificationResult, null, 2));

console.log('Environment verification completed:');
console.log(JSON.stringify(verificationResult, null, 2));
console.log('\nResults saved to logs/env_verify.json');