/**
 * Validates that all required environment variables are set.
 * Throws an error if any variable is missing.
 * @param requiredKeys - An array of required environment variable keys.
 */
export function validateEnv(requiredKeys: string[]): void {
  const missingKeys = requiredKeys.filter(key => !process.env[key]);

  if (missingKeys.length > 0) {
    console.error(
      `[ENV Validation Error] Missing required environment variables: ${missingKeys.join(', ')}`
    );
    console.error('Please check your .env file or server configuration.');
    process.exit(1); // Exit process with failure code
  }
  console.log('[ENV Validation] All required environment variables are set.');
}
