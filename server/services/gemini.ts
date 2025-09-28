import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Google AI client with the API key from Google AI Studio
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || "");

export async function analyzeWithGemini(text: string, agentType: string, availableTables?: string[]): Promise<{response: string, metadata: any}> {
  let systemPrompt = "";
  let model = "gemini-1.5-pro"; // Using the correct model name for Google AI Studio
  
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

WICHTIG: SQL-Abfragen NIEMALS mit Semikolon beenden. Wenn SQL erforderlich ist, füge es in das Metadatenfeld ein. Antworte auf Deutsch.

Antworte NUR mit einem gültigen JSON-Objekt in folgendem Format:
{
  "response": "Deine Antwort hier",
  "sqlQuery": "SELECT statement ohne Semikolon" oder null,
  "chartType": "bar|line|pie|doughnut" oder null,
  "confidence": 0.95
}`;
      break;
    case 'analyst':
      let tablesInfoAnalyst = '';
      if (availableTables && availableTables.length > 0) {
        tablesInfoAnalyst = ` Verfügbare Tabellen in der Datenbank: ${availableTables.join(', ')}. `;
      }
      systemPrompt = `Du bist ein IA-Assistent in der Anwendung 'Chef's Mind AI' für ein Restaurant in Berlin, Deutschland. Alle Finanzoperationen sollten in Euro (€) sein. Die Sprache für alle Berichte und Dokumente ist standardmäßig Deutsch (DE-DE). Du bist ein Datenanalyst. Erstelle SQL-Abfragen, analysiere Trends und gib datengestützte Erkenntnisse. Verwende PostgreSQL-Syntax.${tablesInfoAnalyst}WICHTIG: SQL-Abfragen NIEMALS mit Semikolon beenden. Antworte auf Deutsch.

Antworte NUR mit einem gültigen JSON-Objekt in folgendem Format:
{
  "response": "Deine Antwort hier",
  "sqlQuery": "SELECT statement ohne Semikolon" oder null,
  "chartType": "bar|line|pie|doughnut" oder null,
  "confidence": 0.95
}`;
      break;
    case 'chef':
      systemPrompt = `Du bist ein IA-Assistent in der Anwendung 'Chef's Mind AI' für ein Restaurant in Berlin, Deutschland. Alle Finanzoperationen sollten in Euro (€) sein. Die Sprache für alle Berichte und Dokumente ist standardmäßig Deutsch (DE-DE). Du bist ein Küchenchef und kulinarischer Experte. Gib Rezepte, Kochtipps und Restaurantmanagement-Beratung. Antworte auf Deutsch.

Antworte NUR mit einem gültigen JSON-Objekt in folgendem Format:
{
  "response": "Deine Antwort hier",
  "sqlQuery": null,
  "chartType": null,
  "confidence": 0.95
}`;
      break;
    default:
      systemPrompt = `Du bist ein IA-Assistent in der Anwendung 'Chef's Mind AI' für ein Restaurant in Berlin, Deutschland. Alle Finanzoperationen sollten in Euro (€) sein. Die Sprache für alle Berichte und Dokumente ist standardmäßig Deutsch (DE-DE). Du bist ein hilfsbereiter KI-Assistent. Antworte auf Deutsch und sei präzise und informativ.

Antworte NUR mit einem gültigen JSON-Objekt in folgendem Format:
{
  "response": "Deine Antwort hier",
  "sqlQuery": null,
  "chartType": null,
  "confidence": 0.95
}`;
  }

  try {
    // Get the generative model
    const geminiModel = genAI.getGenerativeModel({ model: model });

    // Generate content using the correct API method
    const result = await geminiModel.generateContent([
      systemPrompt,
      `Benutzeranfrage: ${text}`
    ]);

    const response = await result.response;
    const resultText = response.text();
    
    // Parse JSON response
    let parsedResult;
    try {
      parsedResult = JSON.parse(resultText);
    } catch (parseError) {
      // Fallback if JSON parsing fails
      console.warn("Failed to parse JSON response, using fallback:", parseError);
      parsedResult = {
        response: resultText,
        sqlQuery: null,
        chartType: null,
        confidence: 0.8
      };
    }
    
    return {
      response: parsedResult.response || "Entschuldigung, ich konnte keine Antwort generieren.",
      metadata: {
        model: model,
        sqlQuery: parsedResult.sqlQuery,
        chartType: parsedResult.chartType,
        confidence: parsedResult.confidence
      }
    };
  } catch (error) {
    console.error("Gemini API error:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      response: "Es gab einen Fehler bei der Verarbeitung Ihrer Anfrage.",
      metadata: { error: errorMessage, model: model }
    };
  }
}

export async function generateWithGemini(prompt: string, type: 'image' | 'video'): Promise<{url: string, metadata: any}> {
  // Check if the API key is configured
  if (!process.env.GOOGLE_API_KEY && !process.env.GEMINI_API_KEY) {
    throw new Error('GOOGLE_API_KEY is not configured');
  }

  try {
    if (type === 'image') {
      // Imagen 3 is available through Google AI Studio
      // Using Gemini 1.5 Pro with vision capabilities as a workaround
      // Note: Direct image generation is not available in free Google AI Studio
      // This is a placeholder implementation
      
      console.log('🎨 Attempting Imagen 3 generation through Google AI Studio...');
      
      // For now, return a placeholder until proper Imagen 3 integration
      const placeholderData = "data:text/plain;base64," + Buffer.from(`Imagen 3 generation requested for: ${prompt}`).toString('base64');
      
      return {
        url: placeholderData,
        metadata: {
          model: "imagen-3",
          prompt,
          status: 'placeholder',
          generated: false,
          timestamp: new Date().toISOString(),
          note: "Imagen 3 Integration wird konfiguriert. Verwenden Sie DALL-E 3 für sofortige Bilderzeugung."
        }
      };

    } else if (type === 'video') {
      // Veo 3 is available through Google AI Studio but requires special access
      // This is a placeholder implementation
      
      console.log('🎬 Attempting Veo 3 generation through Google AI Studio...');
      
      const placeholderData = "data:text/plain;base64," + Buffer.from(`Veo 3 generation requested for: ${prompt}`).toString('base64');
      
      return {
        url: placeholderData,
        metadata: {
          model: "veo-3",
          prompt,
          status: 'placeholder',
          generated: false,
          timestamp: new Date().toISOString(),
          note: "Veo 3 Integration wird konfiguriert. Video-Generation erfordert spezielle API-Berechtigung."
        }
      };
    }
    
    throw new Error("Unsupported generation type");
    
  } catch (error) {
    console.error(`Gemini ${type} generation error:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Fehler bei der ${type === 'image' ? 'Bild' : 'Video'}-Generierung mit Google AI: ${errorMessage}`);
  }
}