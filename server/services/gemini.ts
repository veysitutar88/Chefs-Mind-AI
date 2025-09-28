import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ 
  apiKey: process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || "" 
});

export async function analyzeWithGemini(text: string, agentType: string, availableTables?: string[]): Promise<{response: string, metadata: any}> {
  let systemPrompt = "";
  let model = "gemini-2.5-pro";
  
  switch (agentType) {
    case 'accountant':
      let tablesInfo = '';
      if (availableTables && availableTables.length > 0) {
        tablesInfo = ` Verfügbare Tabellen in der Datenbank: ${availableTables.join(', ')}. `;
      }
      systemPrompt = `Du bist ein Experte für Finanzanalyse und Buchhaltung. Analysiere Daten, erstelle SQL-Abfragen für PostgreSQL und gib strukturierte Antworten zurück.${tablesInfo}WICHTIG: SQL-Abfragen NIEMALS mit Semikolon beenden. Wenn SQL erforderlich ist, füge es in das Metadatenfeld ein. Antworte auf Deutsch.`;
      break;
    case 'analyst':
      let tablesInfoAnalyst = '';
      if (availableTables && availableTables.length > 0) {
        tablesInfoAnalyst = ` Verfügbare Tabellen in der Datenbank: ${availableTables.join(', ')}. `;
      }
      systemPrompt = `Du bist ein Datenanalyst. Erstelle SQL-Abfragen, analysiere Trends und gib datengestützte Erkenntnisse. Verwende PostgreSQL-Syntax.${tablesInfoAnalyst}WICHTIG: SQL-Abfragen NIEMALS mit Semikolon beenden. Antworte auf Deutsch.`;
      break;
    case 'chef':
      systemPrompt = `Du bist ein Küchenchef und kulinarischer Experte. Gib Rezepte, Kochtipps und Restaurantmanagement-Beratung. Antworte auf Deutsch.`;
      break;
    default:
      systemPrompt = `Du bist ein hilfsbereiter KI-Assistent. Antworte auf Deutsch und sei präzise und informativ.`;
  }

  try {
    const response = await ai.models.generateContent({
      model: model,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            response: { type: "string" },
            sqlQuery: { type: "string" },
            chartType: { type: "string" },
            confidence: { type: "number" }
          },
          required: ["response"]
        }
      },
      contents: text
    });

    const result = JSON.parse(response.text || "{}");
    
    return {
      response: result.response || "Entschuldigung, ich konnte keine Antwort generieren.",
      metadata: {
        model: model,
        sqlQuery: result.sqlQuery,
        chartType: result.chartType,
        confidence: result.confidence
      }
    };
  } catch (error) {
    console.error("Gemini API error:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      response: "Es gab einen Fehler bei der Verarbeitung Ihrer Anfrage.",
      metadata: { error: errorMessage }
    };
  }
}

export async function generateWithGemini(prompt: string, type: 'image' | 'video'): Promise<{url: string, metadata: any}> {
  // Note: Implement actual Gemini image/video generation when available
  // For now, return placeholder response
  
  if (type === 'image') {
    // Use Imagen 3 generation (placeholder implementation)
    return {
      url: "https://placeholder-image-url.com/generated.jpg",
      metadata: {
        model: "imagen-3",
        prompt,
        generated: true
      }
    };
  } else if (type === 'video') {
    // Use Veo 3 generation (placeholder implementation)
    return {
      url: "https://placeholder-video-url.com/generated.mp4",
      metadata: {
        model: "veo-3",
        prompt,
        generated: true
      }
    };
  }
  
  throw new Error("Unsupported generation type");
}
