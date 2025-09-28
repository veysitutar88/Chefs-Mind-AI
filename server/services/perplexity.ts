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

export async function analyzeWithPerplexity(text: string, agentType: string): Promise<{response: string, metadata: any}> {
  if (!process.env.PERPLEXITY_API_KEY) {
    throw new Error('PERPLEXITY_API_KEY is not configured');
  }

  let systemPrompt = '';
  
  switch (agentType) {
    case 'analyst':
      systemPrompt = `Du bist ein IA-Assistent in der Anwendung 'Chef's Mind AI' für ein Restaurant in Berlin, Deutschland. Alle Finanzoperationen sollten in Euro (€) sein. Die Sprache für alle Berichte und Dokumente ist standardmäßig Deutsch (DE-DE). Du bist ein Datenanalyst. Führe gründliche Marktanalysen durch, suche nach aktuellen Trends und erstelle datenbasierte Insights. Antworte auf Deutsch.`;
      break;
    default:
      systemPrompt = `Du bist ein hilfreicher KI-Assistent in der Anwendung 'Chef's Mind AI' für ein Restaurant in Berlin, Deutschland. Alle Finanzoperationen sollten in Euro (€) sein. Die Sprache für alle Berichte und Dokumente ist standardmäßig Deutsch (DE-DE). Antworte auf Deutsch und sei präzise und informativ.`;
  }

  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
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
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Perplexity API Response:', response.status, errorText);
      throw new Error(`Perplexity API error: ${response.status} - ${errorText}`);
    }

    const data: PerplexityResponse = await response.json();
    
    return {
      response: data.choices[0]?.message?.content || 'Keine Antwort erhalten',
      metadata: {
        model: 'perplexity-sonar-small',
        citations: data.citations,
        usage: data.usage
      }
    };
  } catch (error) {
    console.error('Perplexity API error:', error);
    throw new Error(`Perplexity API Fehler: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`);
  }
}