#!/usr/bin/env node
/**
 * UI Screenshots Capture Script
 * Captures screenshots of key UI pages using Playwright
 */

import { chromium } from 'playwright';
import { promises as fs } from 'fs';
import path from 'path';

const BASENAME = 'capture-ui-screenshots.mjs';
const SCRIPT_NAME = 'UI Screenshots Capture';
const VERSION = '1.0.0';

console.log(`🚀 ${SCRIPT_NAME} v${VERSION} (${BASENAME})`);

// Configuration
const CONFIG = {
  baseURL: 'http://localhost:3000',
  pages: [
    { path: '/', name: 'landing-page' },
    { path: '/dashboard', name: 'dashboard' },
    { path: '/agents', name: 'agents' },
    { path: '/media', name: 'media' },
    { path: '/status', name: 'status' }
  ],
  outputDir: 'reports/ui_screenshots',
  viewport: { width: 1920, height: 1080 },
  timeout: 30000
};

// Create output directory
async function createOutputDir() {
  try {
    await fs.mkdir(CONFIG.outputDir, { recursive: true });
    console.log(`📁 Created output directory: ${CONFIG.outputDir}`);
  } catch (error) {
    if (error.code !== 'EEXIST') {
      throw error;
    }
  }
}

// Capture screenshots
async function captureScreenshots() {
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({
    viewport: CONFIG.viewport,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  });
  
  const page = await context.newPage();
  
  const results = [];
  
  for (const pageConfig of CONFIG.pages) {
    try {
      console.log(`📸 Capturing screenshot: ${pageConfig.path} (${pageConfig.name})`);
      
      const fullURL = `${CONFIG.baseURL}${pageConfig.path}`;
      const response = await page.goto(fullURL, { 
        timeout: CONFIG.timeout,
        waitUntil: 'networkidle' 
      });
      
      if (response.status() >= 400) {
        console.warn(`⚠️  Warning: ${pageConfig.path} returned status ${response.status()}`);
      }
      
      // Wait for content to load
      await page.waitForLoadState('domcontentloaded', { timeout: CONFIG.timeout });
      await page.waitForTimeout(2000); // Additional wait for dynamic content
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('.')[0];
      const filename = `${pageConfig.name}_${timestamp}.png`;
      const filePath = path.join(CONFIG.outputDir, filename);
      
      await page.screenshot({
        path: filePath,
        fullPage: true,
        type: 'png'
      });
      
      results.push({
        page: pageConfig.path,
        name: pageConfig.name,
        filename,
        filePath,
        status: 'success',
        url: fullURL
      });
      
      console.log(`✅ Screenshot saved: ${filename}`);
      
    } catch (error) {
      console.error(`❌ Error capturing ${pageConfig.path}:`, error.message);
      results.push({
        page: pageConfig.path,
        name: pageConfig.name,
        status: 'error',
        error: error.message
      });
    }
  }
  
  await browser.close();
  return results;
}

// Generate report
function generateReport(results) {
  const successful = results.filter(r => r.status === 'success');
  const failed = results.filter(r => r.status === 'error');
  const total = results.length;
  
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      total,
      successful: successful.length,
      failed: failed.length,
      successRate: `${Math.round((successful.length / total) * 100)}%`
    },
    results: results.map(r => ({
      page: r.page,
      name: r.name,
      status: r.status,
      url: r.url,
      filename: r.filename,
      filePath: r.filePath,
      error: r.error
    }))
  };
  
  return report;
}

// Main execution
async function main() {
  try {
    console.log('🎯 Starting UI screenshot capture...');
    console.log(`🌐 Base URL: ${CONFIG.baseURL}`);
    console.log(`📋 Pages: ${CONFIG.pages.length}`);
    console.log(`📁 Output: ${CONFIG.outputDir}`);
    console.log('─'.repeat(50));
    
    await createOutputDir();
    const results = await captureScreenshots();
    const report = generateReport(results);
    
    // Save report
    const reportPath = path.join(CONFIG.outputDir, 'screenshots-report.json');
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    
    // Summary
    console.log('─'.repeat(50));
    console.log('📊 SUMMARY');
    console.log(`   Total: ${report.summary.total}`);
    console.log(`   ✅ Success: ${report.summary.successful}`);
    console.log(`   ❌ Failed: ${report.summary.failed}`);
    console.log(`   📈 Success Rate: ${report.summary.successRate}`);
    console.log('─'.repeat(50));
    
    if (failed.length > 0) {
      console.log('❌ Failed captures:');
      failed.forEach(f => {
        console.log(`   - ${f.page}: ${f.error}`);
      });
    }
    
    console.log(`📋 Full report: ${reportPath}`);
    console.log('🎉 UI screenshot capture completed!');
    
    process.exit(failed.length > 0 ? 1 : 0);
    
  } catch (error) {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { captureScreenshots, generateReport, CONFIG };