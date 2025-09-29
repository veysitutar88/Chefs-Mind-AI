interface PerplexityResponse {
  id: string;
  model: string;
  object: string;
  created: number;
  citations?: string[];
  choices: {
    index: number;
    finish_reason: string;
    message: {
      role: string;
      content: string;
    };
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export async function analyzeWithPerplexity(text: string, agentType: string, customSystemPrompt?: string): Promise<{response: string, metadata: any}> {
  if (!process.env.PERPLEXITY_API_KEY) {
    throw new Error('PERPLEXITY_API_KEY is not configured');
  }

  let systemPrompt = '';
  
  // Use custom system prompt if provided, otherwise fall back to default behavior
  if (customSystemPrompt) {
    systemPrompt = customSystemPrompt;
  } else {
    // Fall back to original switch statement for default prompts
    switch (agentType) {
      case 'analyst':
        systemPrompt = `Du bist ein IA-Assistent in der Anwendung 'Chef's Mind AI' für ein Restaurant in Berlin, Deutschland. Alle Finanzoperationen sollten in Euro (€) sein. Die Sprache für alle Berichte und Dokumente ist standardmäßig Deutsch (DE-DE). Du bist ein Datenanalyst. Führe gründliche Marktanalysen durch, suche nach aktuellen Trends und erstelle datenbasierte Insights. Antworte auf Deutsch.`;
        break;
      default:
        systemPrompt = `Du bist ein hilfreicher KI-Assistent in der Anwendung 'Chef's Mind AI' für ein Restaurant in Berlin, Deutschland. Alle Finanzoperationen sollten in Euro (€) sein. Die Sprache für alle Berichte und Dokumente ist standardmäßig Deutsch (DE-DE). Antworte auf Deutsch und sei präzise und informativ.`;
    }
  }

  // Configure request with extended timeout and retry logic
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout
  
  let lastError: Error | null = null;
  const maxRetries = 3;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔍 Perplexity API attempt ${attempt}/${maxRetries}...`);
      
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'sonar',
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: text
            }
          ],
          max_tokens: 1000,
          temperature: 0.2,
          top_p: 0.9,
          return_images: false,
          return_related_questions: false,
          search_recency_filter: 'month',
          stream: false,
          presence_penalty: 0,
          frequency_penalty: 1
        }),
        signal: controller.signal
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Perplexity API error on attempt ${attempt}: ${response.status} - ${errorText}`);
        
        // Don't retry on 401/403 (auth errors) or 400 (bad request)
        if (response.status === 401 || response.status === 403 || response.status === 400) {
          clearTimeout(timeoutId);
          throw new Error(`Perplexity API authentication/request error: ${response.status} - ${errorText}`);
        }
        
        lastError = new Error(`Perplexity API HTTP error: ${response.status} - ${errorText}`);
        if (attempt === maxRetries) {
          throw lastError;
        }
        
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        continue;
      }

      console.log(`✅ Perplexity API successful on attempt ${attempt}`);
      
      const data: PerplexityResponse = await response.json();
      clearTimeout(timeoutId);
      
      // Validate response structure
      if (!data.choices || !Array.isArray(data.choices) || data.choices.length === 0) {
        throw new Error('Invalid response structure from Perplexity API');
      }
      
      const responseContent = data.choices[0]?.message?.content;
      if (!responseContent) {
        throw new Error('No content received from Perplexity API');
      }
      
      console.log(`📊 Perplexity response: ${responseContent.substring(0, 100)}...`);
      
      return {
        response: responseContent,
        metadata: {
          model: 'perplexity-sonar-small',
          citations: data.citations || [],
          usage: data.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
          attempt: attempt
        }
      };
      
    } catch (error: any) {
      console.error(`⚠️ Perplexity API attempt ${attempt} failed:`, error.message);
      lastError = error;
      
      // Don't retry on abort (timeout) or auth errors
      if (error.name === 'AbortError' || error.message.includes('authentication')) {
        clearTimeout(timeoutId);
        throw error;
      }
      
      if (attempt === maxRetries) {
        clearTimeout(timeoutId);
        throw lastError;
      }
      
      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
  
  // If we get here, all retries failed
  clearTimeout(timeoutId);
  throw lastError || new Error('Perplexity API: All retry attempts failed');
}