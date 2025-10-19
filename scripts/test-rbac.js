import { createServer } from 'http';
import { parse } from 'url';
import { request } from 'http';
import { writeFile } from 'fs/promises';
import { join } from 'path';

// Test RBAC functionality
async function testRBAC() {
  const testResults = [];
  
  // Test endpoints with different roles
  const endpoints = [
    { path: '/api/db/backup', method: 'POST', requiredRoles: ['admin'] },
    { path: '/api/db/restore', method: 'POST', requiredRoles: ['admin'] },
    { path: '/api/media/image/generate', method: 'POST', requiredRoles: ['admin', 'chef', 'accountant'] },
    { path: '/api/media/video/generate', method: 'POST', requiredRoles: ['admin', 'chef', 'accountant'] },
    { path: '/api/media/job/test', method: 'GET', requiredRoles: ['admin', 'chef', 'accountant'] }
  ];
  
  const roles = ['admin', 'chef', 'accountant', 'anonymous'];
  
  for (const endpoint of endpoints) {
    for (const role of roles) {
      const result = await testEndpoint(endpoint, role);
      testResults.push({
        endpoint: endpoint.path,
        method: endpoint.method,
        role: role,
        requiredRoles: endpoint.requiredRoles,
        ...result
      });
    }
  }
  
  // Save results
  const logPath = join(process.cwd(), 'logs', 'rbac_smoke.json');
  await writeFile(logPath, JSON.stringify(testResults, null, 2));
  
  console.log('🔐 RBAC tests completed. Results saved to logs/rbac_smoke.json');
  return testResults;
}

async function testEndpoint(endpoint, role) {
  return new Promise((resolve) => {
    const postData = JSON.stringify({
      prompt: 'test prompt',
      filename: 'test_backup.sql.gz'
    });
    
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: endpoint.path,
      method: endpoint.method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'User-Agent': 'RBAC-Test-Client'
      }
    };
    
    // Add role header for testing (in real implementation, this would come from JWT)
    if (role !== 'anonymous') {
      options.headers['X-Test-Role'] = role;
    }
    
    const req = request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          response: data,
          success: res.statusCode === 200 || res.statusCode === 201,
          denied: res.statusCode === 403,
          unauthorized: res.statusCode === 401
        });
      });
    });
    
    req.on('error', (error) => {
      resolve({
        status: 'ERROR',
        response: error.message,
        success: false,
        error: true
      });
    });
    
    if (endpoint.method === 'POST') {
      req.write(postData);
    }
    
    req.end();
  });
}

// Run tests
testRBAC().catch(console.error);