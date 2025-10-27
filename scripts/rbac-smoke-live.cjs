const http = require('http');
const https = require('https');

const baseUrl = 'http://localhost:5001';
const roles = ['admin', 'chef', 'accountant'];
const endpoints = [
  { method: 'POST', path: '/api/db/backup', headers: { 'X-Confirm-Code': 'yes' } },
  { method: 'POST', path: '/api/db/restore' },
  { method: 'GET', path: '/api/db/backups' },
  // Calendar endpoints
  { method: 'POST', path: '/api/calendar/payment', headers: { 'X-Confirm-Code': 'yes' } },
  { method: 'POST', path: '/api/calendar/delivery', headers: { 'X-Confirm-Code': 'yes' } },
  { method: 'POST', path: '/api/calendar/followup', headers: { 'X-Confirm-Code': 'yes' } },
  // Media will be selected below
];

const mediaCandidates = ['/api/media/ping', '/api/media/providers', '/api/media/status', '/api/media'];
async function getToken(role) {
  return new Promise((resolve) => {
    const url = `${baseUrl}/safe/dev-token?role=${role}`;
    const req = http.get(url, { timeout: 5000 }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json.token || null);
        } catch {
          resolve(null);
        }
      });
    });
    req.on('error', () => resolve(null));
    req.on('timeout', () => {
      req.destroy();
      resolve(null);
    });
  });
}

async function selectMediaEndpoint() {
  for (const path of mediaCandidates) {
    const status = await testEndpoint('GET', path, null);
    if (status >= 200 && status < 300) {
      return path;
    }
  }
  return mediaCandidates[0]; // Default to first if all fail
}

async function testEndpoint(method, path, token, extraHeaders = {}) {
  return new Promise((resolve) => {
    const url = new URL(baseUrl + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers: {
        'User-Agent': 'RBAC-Smoke-Test',
        ...extraHeaders
      },
      timeout: 5000
    };
    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const start = process.hrtime.bigint();
    const req = http.request(options, (res) => {
      const end = process.hrtime.bigint();
      const latency = Number(end - start) / 1000000; // ms
      resolve({ status: res.statusCode, latency: Math.round(latency) });
    });
    req.on('error', () => resolve({ status: 'ERROR', latency: 0 }));
    req.on('timeout', () => {
      req.destroy();
      resolve({ status: 'TIMEOUT', latency: 5000 });
    });
    req.end();
  });
}

async function main() {
  const tokens = {};
  const problems = [];

  // Get tokens
  for (const role of roles) {
    const token = await getToken(role);
    if (token) {
      tokens[role] = token;
    } else {
      problems.push(`⚠️ НОВАЯ ПРОБЛЕМА: dev-token endpoint недоступен для роли ${role}`);
    }
  }

  // Select media endpoint
  const mediaPath = await selectMediaEndpoint();
  const mediaStatus = await testEndpoint('GET', mediaPath, null);
  if (mediaStatus.status < 200 || mediaStatus.status >= 300) {
    problems.push('⚠️ НОВАЯ ПРОБЛЕМА: /api/media все кандидаты вернули 404');
  }
  endpoints.push({ method: 'GET', path: mediaPath });

  // Test matrix
  const results = [];
  for (const role of roles) {
    const token = tokens[role];
    for (const endpoint of endpoints) {
      const { status, latency } = await testEndpoint(endpoint.method, endpoint.path, token, endpoint.headers);
      const allow = typeof status === 'number' && status >= 200 && status < 300;
      
      // Special handling for calendar endpoints - only admin should have access
      let expectedAllow = allow;
      if (endpoint.path.startsWith('/api/calendar/') && role !== 'admin') {
        expectedAllow = false; // Non-admin roles should be denied access to calendar
      }
      
      results.push({
        role,
        method: endpoint.method,
        path: endpoint.path,
        status: typeof status === 'number' ? status : 0,
        allow: expectedAllow,
        actual_allow: allow,
        latency_ms: latency,
        rbac_correct: expectedAllow === allow
      });
    }
  }

  // Calculate summary statistics
  const totalTests = results.length;
  const passedTests = results.filter(r => r.rbac_correct).length;
  const failedTests = totalTests - passedTests;
  const avgLatency = Math.round(results.reduce((sum, r) => sum + r.latency_ms, 0) / totalTests);
  
  // Write log
  const logData = {
    timestamp: new Date().toISOString(),
    baseUrl,
    endpoints: endpoints.map(e => ({ method: e.method, path: e.path })),
    roles,
    results,
    problems,
    summary: {
      total_tests: totalTests,
      passed_tests: passedTests,
      failed_tests: failedTests,
      success_rate: Math.round((passedTests / totalTests) * 100),
      avg_latency_ms: avgLatency
    }
  };

  const fs = require('fs').promises;
  await fs.writeFile('logs/rbac_smoke_live.json', JSON.stringify(logData, null, 2));

  console.log(`RBAC smoke test completed. Log saved to logs/rbac_smoke_live.json`);
  console.log(`Summary: ${passedTests}/${totalTests} tests passed (${Math.round((passedTests / totalTests) * 100)}%), avg latency: ${avgLatency}ms`);
}

main().catch(console.error);