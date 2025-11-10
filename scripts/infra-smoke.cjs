// API Smoke Test R1 - Infrastructure Health Checks
// CommonJS module for Node.js execution

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

/**
 * Execute HTTP request with timing
 */
async function makeRequest(url) {
    const startTime = Date.now();
    const isHttps = url.startsWith('https://');
    const client = isHttps ? https : http;
    
    return new Promise((resolve) => {
        const request = client.get(url, (response) => {
            const duration_ms = Date.now() - startTime;
            const ts_utc = new Date().toISOString();
            
            let body = '';
            let body_text = '';
            
            // Collect response data
            response.on('data', (chunk) => {
                body += chunk;
            });
            
            response.on('end', () => {
                const headers = {};
                for (const [key, value] of response.headers.entries()) {
                    headers[key] = value;
                }
                
                const status = response.statusCode;
                const ok = status < 400;
                
                // Try to parse as JSON, fallback to text
                if (body && response.headers['content-type']?.includes('application/json')) {
                    try {
                        body = JSON.parse(body);
                    } catch (e) {
                        body_text = body;
                        body = null;
                    }
                } else {
                    body_text = body;
                    body = null;
                }
                
                resolve({
                    url,
                    ok,
                    status,
                    headers,
                    duration_ms,
                    ts_utc,
                    body,
                    body_text
                });
            });
        });
        
        request.on('error', (error) => {
            const duration_ms = Date.now() - startTime;
            const ts_utc = new Date().toISOString();
            
            resolve({
                url,
                ok: false,
                status: 0,
                headers: {},
                duration_ms,
                ts_utc,
                body: null,
                body_text: error.message,
                error: error.message
            });
        });
        
        request.setTimeout(30000, () => {
            request.destroy();
            const duration_ms = Date.now() - startTime;
            const ts_utc = new Date().toISOString();
            
            resolve({
                url,
                ok: false,
                status: 0,
                headers: {},
                duration_ms,
                ts_utc,
                body: null,
                body_text: 'Request timeout',
                error: 'Request timeout'
            });
        });
    });
}

/**
 * Format timestamp for directory name (UTC, replace colons with dashes)
 */
function formatTimestampForDir(timestamp) {
    return timestamp.replace(/:/g, '-').replace(/\..+/, 'Z');
}

/**
 * Main smoke test execution
 */
async function runSmokeTests() {
    console.log('🚀 Starting API Smoke R1 Tests...');
    
    // Determine base URL
    const BASE_URL = process.env.BASE_URL || 'http://localhost:5003';
    console.log(`📡 Target URL: ${BASE_URL}`);
    
    // Test endpoints
    const endpoints = [
        { name: 'reports_last', path: '/reports/last' },
        { name: 'google_status', path: '/auth/google/status' }
    ];
    
    const results = [];
    const baseTimestamp = new Date().toISOString();
    const dirName = formatTimestampForDir(baseTimestamp);
    const outputDir = path.join('reports', 'artifacts', 'infra_smoke', dirName);
    
    // Create output directory
    fs.mkdirSync(outputDir, { recursive: true });
    console.log(`📁 Output directory: ${outputDir}`);
    
    // Execute tests
    for (const endpoint of endpoints) {
        const url = BASE_URL + endpoint.path;
        console.log(`🔍 Testing: ${endpoint.name} (${url})`);
        
        const result = await makeRequest(url);
        result.name = endpoint.name;
        results.push(result);
        
        const status = result.ok ? '✅' : '❌';
        console.log(`${status} ${endpoint.name}: ${result.status} (${result.duration_ms}ms)`);
    }
    
    // Save individual results
    for (const result of results) {
        const filename = result.name === 'reports_last' ? 'reports_last.json' : 'google_status.json';
        const filepath = path.join(outputDir, filename);
        
        fs.writeFileSync(filepath, JSON.stringify(result, null, 2));
        console.log(`💾 Saved: ${filename}`);
    }
    
    // Create summary
    const summary = {
        ts_utc: baseTimestamp,
        base_url: BASE_URL,
        endpoints: results.map(result => ({
            name: result.name,
            file: result.name === 'reports_last' ? 'reports_last.json' : 'google_status.json',
            status: result.status,
            ok: result.ok,
            duration_ms: result.duration_ms
        }))
    };
    
    const summaryPath = path.join(outputDir, 'summary.json');
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
    console.log(`💾 Saved: summary.json`);
    
    // Print summary
    console.log('\n📊 SUMMARY:');
    console.log(`Base URL: ${BASE_URL}`);
    console.log(`Timestamp: ${baseTimestamp}`);
    console.log('Results:');
    for (const endpoint of summary.endpoints) {
        const status = endpoint.ok ? '✅' : '❌';
        console.log(`  ${status} ${endpoint.name}: ${endpoint.status} (${endpoint.duration_ms}ms)`);
    }
    
    console.log(`\n📁 Artifacts saved in: ${outputDir}`);
    
    return summary;
}

// Execute if run directly
if (require.main === module) {
    runSmokeTests().catch(error => {
        console.error('❌ Smoke test failed:', error);
        process.exit(1);
    });
}

module.exports = { runSmokeTests };