export interface ModelConfig {
  id: string;
  name: string;
  provider: 'openai' | 'google' | 'perplexity';
  costPerToken: number;
  maxTokens: number;
  speed: 'fast' | 'medium' | 'slow';
  capabilities: string[];
  contextWindow: number;
}

export const MODEL_REGISTRY: Record<string, ModelConfig> = {
  'gpt-4o-mini': {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'openai',
    costPerToken: 0.00015,
    maxTokens: 16000,
    speed: 'fast',
    capabilities: ['chat', 'analysis', 'coding'],
    contextWindow: 128000
  },
  'gpt-4o': {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'openai',
    costPerToken: 0.005,
    maxTokens: 16000,
    speed: 'medium',
    capabilities: ['chat', 'analysis', 'coding', 'reasoning'],
    contextWindow: 128000
  },
  'gpt-4.1': {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    provider: 'openai',
    costPerToken: 0.01,
    maxTokens: 4096,
    speed: 'medium',
    capabilities: ['chat', 'analysis', 'coding', 'reasoning'],
    contextWindow: 128000
  },
  'gpt-5': {
    id: 'gpt-5',
    name: 'GPT-5',
    provider: 'openai',
    costPerToken: 0.015,
    maxTokens: 16000,
    speed: 'slow',
    capabilities: ['chat', 'analysis', 'coding', 'reasoning', 'creative'],
    contextWindow: 200000
  },
  'o3-mini': {
    id: 'o3-mini',
    name: 'O3 Mini',
    provider: 'openai',
    costPerToken: 0.0002,
    maxTokens: 100000,
    speed: 'fast',
    capabilities: ['reasoning', 'analysis'],
    contextWindow: 128000
  },
  'gemini-1.5-pro': {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    provider: 'google',
    costPerToken: 0.00125,
    maxTokens: 8192,
    speed: 'medium',
    capabilities: ['chat', 'analysis', 'coding', 'vision'],
    contextWindow: 2000000
  },
  'gemini-1.5-flash': {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    provider: 'google',
    costPerToken: 0.000075,
    maxTokens: 8192,
    speed: 'fast',
    capabilities: ['chat', 'analysis', 'vision'],
    contextWindow: 1000000
  },
  'perplexity': {
    id: 'sonar',
    name: 'Perplexity Sonar',
    provider: 'perplexity',
    costPerToken: 0.001,
    maxTokens: 4096,
    speed: 'medium',
    capabilities: ['search', 'research', 'analysis'],
    contextWindow: 127000
  }
};

export const DEFAULT_MODEL = 'gpt-4o-mini';

export interface QueryComplexity {
  type: 'simple' | 'moderate' | 'complex' | 'research';
  reasoning?: string;
}

export function analyzeQueryComplexity(query: string): QueryComplexity {
  const lowerQuery = query.toLowerCase();
  
  // Research indicators
  const researchKeywords = ['suche', 'finde', 'recherche', 'aktuell', 'trend', 'markt', 'search', 'find', 'research', 'current', 'latest'];
  if (researchKeywords.some(kw => lowerQuery.includes(kw))) {
    return { type: 'research', reasoning: 'Query requires web search and current information' };
  }
  
  // Complex reasoning indicators
  const complexKeywords = ['analysiere', 'vergleiche', 'optimiere', 'strategie', 'prognose', 'analyze', 'compare', 'optimize', 'strategy', 'forecast'];
  const hasMultipleSteps = (lowerQuery.match(/und|oder|dann|danach|außerdem|and|or|then|also/g) || []).length > 2;
  const isLongQuery = query.length > 200;
  
  if (complexKeywords.some(kw => lowerQuery.includes(kw)) || hasMultipleSteps || isLongQuery) {
    return { type: 'complex', reasoning: 'Query requires deep reasoning or multi-step analysis' };
  }
  
  // Moderate complexity indicators
  const moderateKeywords = ['erkläre', 'beschreibe', 'wie', 'warum', 'was', 'explain', 'describe', 'how', 'why', 'what'];
  if (moderateKeywords.some(kw => lowerQuery.includes(kw)) || query.length > 50) {
    return { type: 'moderate', reasoning: 'Query requires detailed explanation' };
  }
  
  // Simple queries
  return { type: 'simple', reasoning: 'Simple question or command' };
}

export function selectModelForQuery(query: string, userPreference?: string): string {
  // If user specified a model, use it
  if (userPreference && userPreference !== 'auto' && MODEL_REGISTRY[userPreference]) {
    return userPreference;
  }
  
  const complexity = analyzeQueryComplexity(query);
  
  switch (complexity.type) {
    case 'research':
      return 'perplexity';
    case 'complex':
      return 'gpt-4o'; // Use GPT-4o for complex reasoning
    case 'moderate':
      return 'gemini-1.5-pro'; // Good balance of speed and capability
    case 'simple':
    default:
      return DEFAULT_MODEL; // gpt-4o-mini for simple queries
  }
}
