const requiredEnv = [
  'DATABASE_URL',
  'SESSION_SECRET',
  'OPENAI_API_KEY',
  'GOOGLE_API_KEY',
  'GOOGLE_CLOUD_PROJECT_ID',
];

function verifyEnv() {
  const missing = requiredEnv.filter(v => !process.env[v]);
  if (missing.length > 0) {
    console.error(`Missing required environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }
  console.log('All required environment variables are set.');
}

verifyEnv();