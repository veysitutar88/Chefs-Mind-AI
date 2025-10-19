const https = require('https');
const { execSync } = require('child_process');

// Функция для выполнения HTTP запроса с детальным выводом ответа
function makeDetailedRequest(url, options = {}, timeout = 5000) {
  return new Promise((resolve) => {
    const protocol = url.startsWith('https') ? https : require('http');
    
    const req = protocol.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`\n=== DETAIL RESPONSE FOR ${options.provider || 'unknown'} ===`);
        console.log(`Status: ${res.statusCode}`);
        console.log(`Headers:`, res.headers);
        console.log(`Body:`, data);
        console.log(`=== END RESPONSE ===\n`);
        
        resolve({
          provider: options.provider || 'unknown',
          attempted: true,
          status: res.statusCode >= 200 && res.statusCode < 300 ? 'ok' : 'fail',
          http_status: res.statusCode,
          error_reason: res.statusCode >= 200 && res.statusCode < 300 ? null : `HTTP ${res.statusCode}`,
          response_body: data,
          response_headers: res.headers
        });
      });
    });

    req.on('error', (error) => {
      console.log(`\n=== REQUEST ERROR FOR ${options.provider || 'unknown'} ===`);
      console.log(`Error:`, error);
      console.log(`=== END ERROR ===\n`);
      
      resolve({
        provider: options.provider || 'unknown',
        attempted: true,
        status: 'fail',
        http_status: null,
        error_reason: error.code || error.message,
        response_body: null,
        response_headers: null
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        provider: options.provider || 'unknown',
        attempted: true,
        status: 'fail',
        http_status: null,
        error_reason: 'timeout',
        response_body: null,
        response_headers: null
      });
    });

    req.setTimeout(timeout);
    
    if (options.body) {
      console.log(`\n=== REQUEST DETAILS FOR ${options.provider || 'unknown'} ===`);
      console.log(`URL:`, url);
      console.log(`Method:`, options.method || 'GET');
      console.log(`Headers:`, options.headers);
      console.log(`Body:`, options.body);
      console.log(`=== END REQUEST ===\n`);
      
      req.write(options.body);
    }
    
    req.end();
  });
}

// Получаем переменные окружения
function getUserEnvVar(varName) {
  try {
    const result = execSync(`reg query "HKCU\\Environment" /v ${varName} 2>nul`, { encoding: 'utf8' });
    const match = result.match(/REG_(?:SZ|EXPAND_SZ)\s+(.+)$/m);
    return match ? match[1].trim() : null;
  } catch (error) {
    return null;
  }
}

async function main() {
  console.log('🔍 DETECTED PERPLEXITY API DEBUG');
  
  const perplexityKey = getUserEnvVar('PERPLEXITY_API_KEY');
  
  if (!perplexityKey) {
    console.log('❌ PERPLEXITY_API_KEY not found');
    return;
  }
  
  console.log(`✅ Found PERPLEXITY_API_KEY: ${perplexityKey.substring(0, 10)}...`);
  
  // Тест 1: Используем модель из ping скрипта
  console.log('\n🧪 TEST 1: Using model from ping script (llama-3.1-sonar-small-128k-online)');
  const test1Body = JSON.stringify({
    model: "llama-3.1-sonar-small-128k-online",
    messages: [{ role: "user", content: "test" }],
    max_tokens: 1
  });
  
  const test1Result = await makeDetailedRequest('https://api.perplexity.ai/chat/completions', {
    provider: 'perplexity_test1',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${perplexityKey}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(test1Body)
    },
    body: test1Body
  });
  
  // Тест 2: Используем модель из основного кода
  console.log('\n🧪 TEST 2: Using model from main code (sonar)');
  const test2Body = JSON.stringify({
    model: 'sonar',
    messages: [{ role: "user", content: "test" }],
    max_tokens: 1
  });
  
  const test2Result = await makeDetailedRequest('https://api.perplexity.ai/chat/completions', {
    provider: 'perplexity_test2',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${perplexityKey}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(test2Body)
    },
    body: test2Body
  });
  
  // Тест 3: Попробуем другую модель
  console.log('\n🧪 TEST 3: Using common model (llama-3.1-sonar-small-128k-online)');
  const test3Body = JSON.stringify({
    model: "llama-3.1-sonar-small-128k-online",
    messages: [{ role: "user", content: "test" }],
    max_tokens: 1
  });
  
  const test3Result = await makeDetailedRequest('https://api.perplexity.ai/chat/completions', {
    provider: 'perplexity_test3',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${perplexityKey}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(test3Body)
    },
    body: test3Body
  });
  
  // Сохраняем результаты
  const fs = require('fs');
  const results = [test1Result, test2Result, test3Result];
  fs.writeFileSync('./logs/perplexity_debug.json', JSON.stringify(results, null, 2));
  
  console.log('\n📊 SUMMARY RESULTS:');
  results.forEach(result => {
    console.log(`${result.provider}: ${result.status} (${result.http_status}) - ${result.error_reason || 'OK'}`);
  });
  
  console.log('\n📁 Detailed results saved to logs/perplexity_debug.json');
}

main().catch(console.error);