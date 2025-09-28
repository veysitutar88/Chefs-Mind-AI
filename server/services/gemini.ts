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
      systemPrompt = `Du bist ein IA-Assistent in der Anwendung 'Chef's Mind AI' für ein Restaurant in Berlin, Deutschland. Alle Finanzoperationen sollten in Euro (€) sein. Die Sprache für alle Berichte und Dokumente ist standardmäßig Deutsch (DE-DE). Du bist ein Experte für Finanzanalyse und Buchhaltung. Analysiere Daten, erstelle SQL-Abfragen für PostgreSQL und gib strukturierte Antworten zurück.${tablesInfo}

Besondere Fähigkeiten:
- Bei Anfragen nach "Lagerbeständen", "Beständen auf Lager", "Warenbeständen" oder "Reste auf Lager" erstelle eine SQL-Abfrage zur Tabelle 'ingredients'
- Zeige current_stock, min_stock, name, unit, category und supplier
- Markiere Artikel mit geringem Bestand (current_stock <= min_stock) als kritisch
- Berechne den Gesamtwert des Lagers (current_stock * price_per_unit)

WICHTIG: SQL-Abfragen NIEMALS mit Semikolon beenden. Wenn SQL erforderlich ist, füge es in das Metadatenfeld ein. Antworte auf Deutsch.`;
      break;
    case 'analyst':
      let tablesInfoAnalyst = '';
      if (availableTables && availableTables.length > 0) {
        tablesInfoAnalyst = ` Verfügbare Tabellen in der Datenbank: ${availableTables.join(', ')}. `;
      }
      systemPrompt = `Du bist ein IA-Assistent in der Anwendung 'Chef's Mind AI' für ein Restaurant in Berlin, Deutschland. Alle Finanzoperationen sollten in Euro (€) sein. Die Sprache für alle Berichte und Dokumente ist standardmäßig Deutsch (DE-DE). Du bist ein Datenanalyst. Erstelle SQL-Abfragen, analysiere Trends und gib datengestützte Erkenntnisse. Verwende PostgreSQL-Syntax.${tablesInfoAnalyst}WICHTIG: SQL-Abfragen NIEMALS mit Semikolon beenden. Antworte auf Deutsch.`;
      break;
    case 'chef':
      systemPrompt = `Du bist ein IA-Assistent in der Anwendung 'Chef's Mind AI' für ein Restaurant in Berlin, Deutschland. Alle Finanzoperationen sollten in Euro (€) sein. Die Sprache für alle Berichte und Dokumente ist standardmäßig Deutsch (DE-DE). Du bist ein Küchenchef und kulinarischer Experte. Gib Rezepte, Kochtipps und Restaurantmanagement-Beratung. Antworte auf Deutsch.`;
      break;
    default:
      systemPrompt = `Du bist ein IA-Assistent in der Anwendung 'Chef's Mind AI' für ein Restaurant in Berlin, Deutschland. Alle Finanzoperationen sollten in Euro (€) sein. Die Sprache für alle Berichte und Dokumente ist standardmäßig Deutsch (DE-DE). Du bist ein hilfsbereiter KI-Assistent. Antworte auf Deutsch und sei präzise und informativ.`;
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
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  try {
    if (type === 'image') {
      // Use Imagen 3 generation
      const systemPrompt = `Du bist ein KI-Assistent für ein Restaurant in Berlin, Deutschland. Generiere hochwertige Bilder für Restaurant-Zwecke. Berücksichtige die deutsche Kultur und den Berliner Kontext.`;
      
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash-preview-image-generation",
        contents: [{ role: "user", parts: [{ text: `${systemPrompt}\n\nBildprompt: ${prompt}` }] }],
        config: {
          responseModalities: ["TEXT", "IMAGE"],
        },
      });

      // Extract image from response
      const candidates = response.candidates;
      if (!candidates || candidates.length === 0) {
        throw new Error('No candidates returned from Imagen 3');
      }

      const content = candidates[0].content;
      if (!content || !content.parts) {
        throw new Error('No content parts returned from Imagen 3');
      }

      let imageUrl = '';
      let generatedText = '';

      for (const part of content.parts) {
        if (part.text) {
          generatedText = part.text;
        } else if (part.inlineData && part.inlineData.data) {
          // Convert base64 to blob URL (in a real implementation, you'd upload to cloud storage)
          const imageData = Buffer.from(part.inlineData.data, 'base64');
          // For now, create a data URL (in production, upload to cloud storage)
          imageUrl = `data:image/jpeg;base64,${part.inlineData.data}`;
        }
      }

      if (!imageUrl) {
        throw new Error('No image data returned from Imagen 3');
      }

      return {
        url: imageUrl,
        metadata: {
          model: "imagen-3",
          prompt,
          generatedText,
          generated: true,
          timestamp: new Date().toISOString()
        }
      };

    } else if (type === 'video') {
      // Use Veo 3 generation
      const systemPrompt = `Du bist ein KI-Assistent für ein Restaurant in Berlin, Deutschland. Generiere hochwertige Videos für Restaurant-Zwecke. Berücksichtige die deutsche Kultur und den Berliner Kontext.`;
      
      const operation = await ai.models.generateVideos({
        model: "veo-3.0-generate-preview",
        prompt: `${systemPrompt}\n\nVideo-Prompt: ${prompt}`,
        config: {
          negativePrompt: "low quality, blurry, pixelated",
          aspectRatio: "16:9",
          resolution: "720p"
        }
      });

      // For video generation, we need to wait for the operation to complete
      // This is a long-running operation, so we'll return a placeholder for now
      // In a real implementation, you'd implement proper async handling
      
      return {
        url: "data:text/plain;base64,VmlkZW8gZ2VuZXJhdGlvbiBzdGFydGVk", // Placeholder
        metadata: {
          model: "veo-3",
          prompt,
          operationId: operation.name || 'unknown',
          status: 'generating',
          generated: true,
          timestamp: new Date().toISOString(),
          note: "Video wird generiert. Dies kann einige Minuten dauern."
        }
      };
    }
    
    throw new Error("Unsupported generation type");
    
  } catch (error) {
    console.error(`Gemini ${type} generation error:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Fehler bei der ${type === 'image' ? 'Bild' : 'Video'}-Generierung mit Gemini: ${errorMessage}`);
  }
}
