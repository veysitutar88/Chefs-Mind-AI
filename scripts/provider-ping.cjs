const https = require('https');
const http = require('http');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Функция для выполнения HTTP запроса с таймаутом
function makeRequest(url, options = {}, timeout = 5000) {
  return new Promise((resolve) => {
    const protocol = url.startsWith('https') ? https : http;
    
    const req = protocol.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          provider: options.provider || 'unknown',
          attempted: true,
          status: res.statusCode >= 200 && res.statusCode < 300 ? 'ok' : 'fail',
          http_status: res.statusCode,
          error_reason: res.statusCode >= 200 && res.statusCode < 300 ? null : `HTTP ${res.statusCode}`
        });
      });
    });

    req.on('error', (error) => {
      resolve({
        provider: options.provider || 'unknown',
        attempted: true,
        status: 'fail',
        http_status: null,
        error_reason: error.code || error.message
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        provider: options.provider || 'unknown',
        attempted: true,
        status: 'fail',
        http_status: null,
        error_reason: 'timeout'
      });
    });

    req.setTimeout(timeout);
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

// Получаем переменные окружения из user environment
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
  const results = [];
  
  // OpenAI проверка
  const openaiKey = getUserEnvVar('OPENAI_API_KEY');
  if (openaiKey) {
    const openaiResult = await makeRequest('https://api.openai.com/v1/models', {
      provider: 'openai',
      headers: {
        'Authorization': `Bearer ${openaiKey}`
      }
    });
    results.push(openaiResult);
  } else {
    results.push({
      provider: 'openai',
      attempted: false,
      status: 'fail',
      http_status: null,
      error_reason: 'missing_api_key'
    });
  }

  // Perplexity проверка
  const perplexityKey = getUserEnvVar('PERPLEXITY_API_KEY');
  if (perplexityKey) {
    const perplexityBody = JSON.stringify({
      model: "sonar",
      messages: [{ role: "user", content: "test" }],
      max_tokens: 1
    });
    
    const perplexityResult = await makeRequest('https://api.perplexity.ai/chat/completions', {
      provider: 'perplexity',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${perplexityKey}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(perplexityBody)
      },
      body: perplexityBody
    });
    results.push(perplexityResult);
  } else {
    results.push({
      provider: 'perplexity',
      attempted: false,
      status: 'fail',
      http_status: null,
      error_reason: 'missing_api_key'
    });
  }

  // Google API проверка
  const googleApiKey = getUserEnvVar('GOOGLE_API_KEY');
  if (googleApiKey) {
    const googleResult = await makeRequest(`https://generativelanguage.googleapis.com/v1/models?key=${googleApiKey}`, {
      provider: 'google_api'
    });
    results.push(googleResult);
  } else {
    results.push({
      provider: 'google_api',
      attempted: false,
      status: 'fail',
      http_status: null,
      error_reason: 'missing_api_key'
    });
  }

  // Google Vertex проверка (проверка файла учетных данных)
  const googleAppCreds = getUserEnvVar('GOOGLE_APPLICATION_CREDENTIALS');
  const vertexProjectId = getUserEnvVar('VERTEX_PROJECT_ID');
  const vertexLocation = getUserEnvVar('VERTEX_LOCATION');
  
  if (googleAppCreds && vertexProjectId && vertexLocation) {
    // Проверяем существование файла
    try {
      if (fs.existsSync(googleAppCreds)) {
        results.push({
          provider: 'vertex',
          attempted: true,
          status: 'ok',
          http_status: null,
          error_reason: null
        });
      } else {
        results.push({
          provider: 'vertex',
          attempted: true,
          status: 'fail',
          http_status: null,
          error_reason: 'missing_path'
        });
      }
    } catch (error) {
      results.push({
        provider: 'vertex',
        attempted: true,
        status: 'fail',
        http_status: null,
        error_reason: 'file_access_error'
      });
    }
  } else {
    results.push({
      provider: 'vertex',
      attempted: false,
      status: 'fail',
      http_status: null,
      error_reason: 'missing_credentials'
    });
  }

  // Сохраняем результаты
  fs.writeFileSync(path.join(__dirname, '../logs/keys_deep_diag.json'), JSON.stringify(results, null, 2));
  
  console.log('Provider diagnostics completed:');
  console.log(JSON.stringify(results, null, 2));
  console.log('\nResults saved to logs/keys_deep_diag.json');
  
  // Проверяем на критические ошибки
  const criticalIssues = results.filter(r => 
    r.attempted && 
    r.status === 'fail' && 
    (r.http_status === 401 || r.http_status === 403 || r.error_reason === 'missing_api_key')
  );
  
  if (criticalIssues.length > 0) {
    console.log('\n⚠️ НОВАЯ ПРОБЛЕМА:');
    criticalIssues.forEach(issue => {
      if (issue.http_status === 401) {
        console.log(`${issue.provider} invalid_api_key`);
      } else if (issue.http_status === 403) {
        console.log(`${issue.provider} billing_or_permission`);
      } else if (issue.error_reason === 'missing_api_key') {
        console.log(`${issue.provider} missing_api_key`);
      }
    });
  }
}

main().catch(console.error);