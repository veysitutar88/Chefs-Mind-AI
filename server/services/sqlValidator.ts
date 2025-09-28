import { Pool } from "@neondatabase/serverless";

// Read-only database connection
const readOnlyPool = new Pool({ 
  connectionString: process.env.DATABASE_READONLY_URL || process.env.DATABASE_URL 
});

export interface SQLValidationResult {
  isValid: boolean;
  error?: string;
  sanitizedQuery?: string;
}

export function validateSQL(query: string): SQLValidationResult {
  // Remove comments and normalize whitespace
  const cleanQuery = query.replace(/--.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '').trim();
  
  // Check for semicolons (not allowed)
  if (cleanQuery.includes(';')) {
    return {
      isValid: false,
      error: "Semicolons are not allowed in SQL queries"
    };
  }
  
  // Check if query starts with SELECT (only SELECT operations allowed)
  if (!cleanQuery.toLowerCase().startsWith('select')) {
    return {
      isValid: false,
      error: "Only SELECT operations are allowed"
    };
  }
  
  // Check for dangerous keywords
  const forbiddenKeywords = [
    'insert', 'update', 'delete', 'drop', 'create', 'alter', 'truncate',
    'grant', 'revoke', 'exec', 'execute', 'call', 'declare', 'set',
    'begin', 'commit', 'rollback', 'savepoint'
  ];
  
  const lowerQuery = cleanQuery.toLowerCase();
  for (const keyword of forbiddenKeywords) {
    if (lowerQuery.includes(keyword)) {
      return {
        isValid: false,
        error: `Forbidden keyword '${keyword}' found in query`
      };
    }
  }
  
  // Add LIMIT if not present
  let sanitizedQuery = cleanQuery;
  if (!lowerQuery.includes('limit')) {
    sanitizedQuery += ' LIMIT 100';
  }
  
  return {
    isValid: true,
    sanitizedQuery
  };
}

export async function executeReadOnlySQL(query: string): Promise<any[]> {
  const validation = validateSQL(query);
  
  if (!validation.isValid) {
    throw new Error(`SQL Validation Failed: ${validation.error}`);
  }
  
  try {
    const client = await readOnlyPool.connect();
    try {
      const result = await client.query(validation.sanitizedQuery!);
      return result.rows;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("SQL execution error:", error);
    throw new Error(`SQL Execution Error: ${error.message}`);
  }
}
