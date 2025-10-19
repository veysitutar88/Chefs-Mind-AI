import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { MODEL_REGISTRY, selectModelForQuery } from '../config/models.js';

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || 'test-key-for-smoke-testing',
  dangerouslyAllowBrowser: true
});
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || 'test-key');

export interface UniversalAskParams {
  query: string;
  model?: string;
  systemPrompt?: string;
  stream?: boolean;
}

export interface StreamChunk {
  content: string;
  done: boolean;
  model?: string;
}

// OpenAI streaming handler
async function* streamOpenAI(model: string, systemPrompt: string, query: string): AsyncGenerator<StreamChunk> {
  const stream = await openai.chat.completions.create({
    model: model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: query }
    ],
    stream: true,
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content || '';
    if (content) {
      yield { content, done: false, model };
    }
  }
  
  yield { content: '', done: true, model };
}

// Gemini streaming handler
async function* streamGemini(model: string, systemPrompt: string, query: string): AsyncGenerator<StreamChunk> {
  const geminiModel = genAI.getGenerativeModel({ 
    model: model,
    systemInstruction: systemPrompt
  });

  const result = await geminiModel.generateContentStream([
    { text: query }
  ]);

  for await (const chunk of result.stream) {
    const content = chunk.text();
    if (content) {
      yield { content, done: false, model };
    }
  }
  
  yield { content: '', done: true, model };
}

// Perplexity streaming handler
async function* streamPerplexity(systemPrompt: string, query: string): AsyncGenerator<StreamChunk> {
  if (!process.env.PERPLEXITY_API_KEY) {
    throw new Error('PERPLEXITY_API_KEY is not configured');
  }

  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'sonar',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: query }
      ],
      stream: true,
    }),
  });

  if (!response.ok) {
    throw new Error(`Perplexity API error: ${response.statusText}`);
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  if (!reader) {
    throw new Error('No response body from Perplexity');
  }

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split('\n').filter(line => line.trim().startsWith('data:'));

    for (const line of lines) {
      const data = line.replace('data:', '').trim();
      if (data === '[DONE]') {
        yield { content: '', done: true, model: 'perplexity' };
        return;
      }

      try {
        const parsed = JSON.parse(data);
        const content = parsed.choices?.[0]?.delta?.content || '';
        if (content) {
          yield { content, done: false, model: 'perplexity' };
        }
      } catch (e) {
        // Skip invalid JSON
      }
    }
  }
  
  yield { content: '', done: true, model: 'perplexity' };
}

// Main universal ask function with streaming
export async function* universalAskStream(params: UniversalAskParams): AsyncGenerator<StreamChunk> {
  const selectedModel = params.model === 'auto' || !params.model 
    ? selectModelForQuery(params.query, params.model)
    : params.model;

  const modelConfig = MODEL_REGISTRY[selectedModel];
  if (!modelConfig) {
    throw new Error(`Unknown model: ${selectedModel}`);
  }

  const systemPrompt = params.systemPrompt || 
    "Du bist ein hilfsbereiter KI-Assistent in der Anwendung 'Chef's Mind AI' für ein Restaurant in Berlin, Deutschland. Antworte auf Deutsch und sei präzise und informativ.";

  console.log(`🤖 Universal Ask: Using model ${selectedModel} (${modelConfig.name}) via ${modelConfig.provider}`);

  switch (modelConfig.provider) {
    case 'openai':
      yield* streamOpenAI(modelConfig.id, systemPrompt, params.query);
      break;
    case 'google':
      yield* streamGemini(modelConfig.id, systemPrompt, params.query);
      break;
    case 'perplexity':
      yield* streamPerplexity(systemPrompt, params.query);
      break;
    default:
      throw new Error(`Unsupported provider: ${modelConfig.provider}`);
  }
}

// Non-streaming version for backward compatibility
export async function universalAsk(params: UniversalAskParams): Promise<{ response: string; model: string }> {
  let fullResponse = '';
  let usedModel = '';

  for await (const chunk of universalAskStream(params)) {
    if (chunk.done) {
      usedModel = chunk.model || usedModel;
      break;
    }
    fullResponse += chunk.content;
    if (chunk.model) usedModel = chunk.model;
  }

  return { response: fullResponse, model: usedModel };
}
