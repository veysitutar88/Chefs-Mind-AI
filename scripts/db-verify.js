import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testDbConnection() {
  const logPath = path.join(process.cwd(), 'logs', 'db_ping.json');
  
  try {
    console.log('🔍 Testing database connection...');
    
    // Read DATABASE_URL from .env
    const envPath = path.join(process.cwd(), '.env');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const dbUrlMatch = envContent.match(/DATABASE_URL=(.+)/);
    
    if (!dbUrlMatch) {
      throw new Error('DATABASE_URL not found in .env file');
    }
    
    const databaseUrl = dbUrlMatch[1].trim();
    console.log(`📡 Connecting to: ${databaseUrl.replace(/\/\/.*@/, '//***:***@')}`);
    
    const pool = new Pool({
      connectionString: databaseUrl,
      ssl: databaseUrl.includes('sslmode=require') ? { rejectUnauthorized: false } : false
    });
    
    const startTime = Date.now();
    const result = await pool.query('SELECT 1 as test');
    const latency = Date.now() - startTime;
    
    await pool.end();
    
    const logEntry = {
      status: 'success',
      timestamp: new Date().toISOString(),
      database_url: databaseUrl.replace(/\/\/.*@/, '//***:***@'),
      latency_ms: latency,
      result: result.rows[0],
      message: 'Database connection successful'
    };
    
    fs.writeFileSync(logPath, JSON.stringify(logEntry, null, 2));
    console.log('✅ Database connection successful');
    console.log(`⏱️  Latency: ${latency}ms`);
    
  } catch (error) {
    const logEntry = {
      status: 'error',
      timestamp: new Date().toISOString(),
      database_url: dbUrlMatch ? dbUrlMatch[1].replace(/\/\/.*@/, '//***:***@') : 'not_found',
      error: error.message,
      message: 'Database connection failed'
    };
    
    fs.writeFileSync(logPath, JSON.stringify(logEntry, null, 2));
    console.log('❌ Database connection failed:', error.message);
  }
}

testDbConnection();