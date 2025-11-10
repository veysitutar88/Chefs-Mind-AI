import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load models config
const modelsConfig = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'models.config.json'), 'utf8'));

// Mock API key check function
function checkApiKey(provider) {
  const keyMap = {
    'openai': process.env.OPENAI_API_KEY,
    'google': process.env.GOOGLE_API_KEY,
    'perplexity': process.env.PERPLEXITY_API_KEY
  };
  return keyMap[provider] && keyMap[provider].length > 10;
}

// Mock ping function (dry run)
async function mockPing(provider, model, type = 'text') {
  const startTime = Date.now();
  const hasKey = checkApiKey(provider);
  
  // Simulate API call without actually making request
  await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
  
  const latency = Date.now() - startTime;
  
  return {
    provider,
    model,
    type,
    status: hasKey ? 'success' : 'no_api_key',
    latency,
    hasApiKey: hasKey,
    endpoint: modelsConfig.providers[provider]?.endpoint || 'unknown',
    mock_response: type === 'text' ? 'pong' : type === 'image' ? 'image_stub_url' : 'video_stub_url'
  };
}

async function runSmokeTests() {
  console.log('🔥 Starting models smoke tests (dry run)...');
  
  const results = {
    timestamp: new Date().toISOString(),
    tests: [],
    summary: {
      total: 0,
      passed: 0,
      failed: 0,
      missing_keys: []
    }
  };
  
  const tests = [
    // OpenAI tests
    { provider: 'openai', model: 'gpt-5', type: 'text' },
    { provider: 'openai', model: 'gpt-image-1', type: 'image' },
    { provider: 'openai', model: 'dall-e-3', type: 'image' },
    { provider: 'openai', model: 'sora-1', type: 'video' },
    
    // Google tests
    { provider: 'google', model: 'imagen-3', type: 'image' },
    { provider: 'google', model: 'veo-3', type: 'video' },
    
    // Perplexity tests
    { provider: 'perplexity', model: 'sonar-large', type: 'text' },
    { provider: 'perplexity', model: 'sonar-pro', type: 'text' }
  ];
  
  for (const test of tests) {
    console.log(`🧪 Testing ${test.provider}/${test.model} (${test.type})...`);
    
    try {
      const result = await mockPing(test.provider, test.model, test.type);
      results.tests.push(result);
      
      if (result.status === 'success') {
        results.summary.passed++;
      } else {
        results.summary.failed++;
        if (result.status === 'no_api_key') {
          results.summary.missing_keys.push(test.provider);
        }
      }
      
      results.summary.total++;
      
      console.log(`  ${result.status === 'success' ? '✅' : '❌'} ${result.provider}/${test.model}: ${result.status} (${result.latency}ms)`);
      
    } catch (error) {
      const errorResult = {
        provider: test.provider,
        model: test.model,
        type: test.type,
        status: 'error',
        error: error.message,
        latency: 0
      };
      
      results.tests.push(errorResult);
      results.summary.failed++;
      results.summary.total++;
      
      console.log(`  ❌ ${test.provider}/${test.model}: error - ${error.message}`);
    }
  }
  
  // Write results
  const logPath = path.join(process.cwd(), 'logs', 'models_smoke.json');
  fs.writeFileSync(logPath, JSON.stringify(results, null, 2));
  
  console.log('\n📊 Smoke Test Summary:');
  console.log(`  Total: ${results.summary.total}`);
  console.log(`  Passed: ${results.summary.passed}`);
  console.log(`  Failed: ${results.summary.failed}`);
  console.log(`  Missing API Keys: ${results.summary.missing_keys.join(', ')}`);
  
  console.log('\n📝 Results saved to:', logPath);
  
  return results;
}

// Run tests
runSmokeTests().catch(console.error);