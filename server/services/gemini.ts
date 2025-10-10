import { GoogleGenerativeAI } from "@google/generative-ai";
import { generateWithOpenAI } from './openai';

// Initialize the Google AI client with the API key from Google AI Studio
try {
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || "");
} catch (importError) {
  console.error('Failed to import GoogleGenerativeAI:', importError instanceof Error ? importError.message : importError);
  throw new Error('Gemini AI initialization failed');
}

export async function analyzeWithGemini(text: string, agentType: string, availableTables?: string[], modelName?: string, customSystemPrompt?: string): Promise<{response: string, metadata: any}> {
  let systemPrompt = "";
  // Default to appropriate model based on agent type, but allow override
  let model = modelName || (agentType === 'accountant' ? "gemini-2.5-pro" : "gemini-2.5-flash");
  
  // Use custom system prompt if provided, otherwise fall back to default behavior
  if (customSystemPrompt) {
    systemPrompt = customSystemPrompt;
    
    // For accountant agent, append available tables information if provided
    if (agentType === 'accountant' && availableTables && availableTables.length > 0) {
      systemPrompt += ` Verfügbare Tabellen in der Datenbank: ${availableTables.join(', ')}. `;
    }
    
    // For structured responses (accountant/analyst), append JSON format requirement
    if (agentType === 'accountant' || agentType === 'analyst') {
      systemPrompt += `

WICHTIG: SQL-Abfragen NIEMALS mit Semikolon beenden. Wenn SQL erforderlich ist, füge es in das Metadatenfeld ein. Antworte auf Deutsch.

Antworte NUR mit einem gültigen JSON-Objekt in folgendem Format:
{
  "response": "Deine Antwort hier",
  "sqlQuery": "SELECT statement ohne Semikolon" oder null,
  "chartType": "bar|line|pie|doughnut" oder null,
  "confidence": 0.95
}`;
    }
  } else {
    // Fall back to original switch statement for default prompts
    switch (agentType) {
    case 'accountant':
      let tablesInfo = '';
      if (availableTables && availableTables.length > 0) {
        tablesInfo = ` Verfügbare Tabellen in der Datenbank: ${availableTables.join(', ')}. `;
      }
      systemPrompt = `Du bist ein IA-Assistent in der Anwendung 'Chef's Mind AI' für ein Restaurant in Berlin, Deutschland. Alle Finanzoperationen sollten in Euro (€) sein. Die Sprache für alle Berichte und Dokumente ist standardmäßig Deutsch (DE-DE). Du bist ein Experte für Finanzanalyse und Buchhaltung. Analysiere Daten, erstelle SQL-Abfragen für PostgreSQL und gib strukturierte Antworten zurück.${tablesInfo}

Besondere Fähigkeiten:
- Bei Anfragen nach "Lagerbeständen", "Bestände auf Lager", "Warenbeständen" oder "Reste auf Lager" erstelle eine SQL-Abfrage zur Tabelle 'ingredients'
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
  "chartType": "bar|line|pie|doughnut" или null,
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
    console.error('Gemini model creation failed:', error instanceof Error ? error.message : error);
    throw new Error('Gemini model creation failed');
  }
}

export async function generateWithGemini(prompt: string, type: 'image' | 'video'): Promise<{url: string, metadata: any}> {
  try {
    if (type === 'image') {
      console.log('🎨 Generating image with Imagen 3 via Vertex AI...');
      
      // Import Vertex AI for Imagen 3 with error handling
      let VertexAI;
      try {
        const vertexModule = await import('@google-cloud/vertexai');
        VertexAI = vertexModule.VertexAI;
      } catch (importError) {
        console.error('Failed to import VertexAI:', importError instanceof Error ? importError.message : importError);
        throw new Error('Gemini AI initialization failed');
      }
      
      // Check required environment variables
      if (!process.env.GOOGLE_CLOUD_PROJECT_ID) {
        throw new Error('GOOGLE_CLOUD_PROJECT_ID environment variable is required for Vertex AI');
      }

      if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        throw new Error('GOOGLE_APPLICATION_CREDENTIALS environment variable is required for Vertex AI');
      }

      // Parse service account credentials from environment variable
      let credentials;
      try {
        credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS || '{}');
        if (!credentials.project_id) {
          throw new Error('Invalid credentials: missing project_id');
        }
      } catch (error) {
        console.warn('⚠️ Vertex AI credentials issue:', error.message);
        console.warn('🔄 Falling back to DALL-E 3 for image generation');
        return await generateWithOpenAI(prompt, 'image');
      }

      // Initialize Vertex AI client with explicit credentials
      const vertexAI = new VertexAI({
        project: process.env.GOOGLE_CLOUD_PROJECT_ID,
        location: 'us-central1', // Imagen is available in us-central1
        googleAuthOptions: {
          credentials: credentials
        }
      });

      // Get Imagen 3 model
      const model = vertexAI.getGenerativeModel({
        model: 'imagen-3.0-generate-001'
      });

      // Generate image
      const request = {
        contents: [{
          role: 'user',
          parts: [{ text: prompt }]
        }]
      };

      console.log('📡 Calling Vertex AI Imagen 3 API...');
      const response = await model.generateContent(request);
      
      // Extract image data from response
      if (response.response && response.response.candidates && response.response.candidates[0]) {
        const candidate = response.response.candidates[0];
        
        // Check if there are any parts with inline data (base64 image)
        if (candidate.content && candidate.content.parts) {
          for (const part of candidate.content.parts) {
            if (part.inlineData && part.inlineData.data) {
              // Return the base64 image data
              const imageUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
              
              console.log('✅ Imagen 3 generation successful');
              return {
                url: imageUrl,
                metadata: {
                  model: "imagen-3",
                  prompt,
                  status: 'success',
                  generated: true,
                  timestamp: new Date().toISOString(),
                  mimeType: part.inlineData.mimeType || 'image/png'
                }
              };
            }
          }
        }
      }

      // If no image data found, throw error
      throw new Error('No image data returned from Vertex AI Imagen');

    } else if (type === 'video') {
      console.log('🎬 Video generation with Veo 3 is not yet available in this region');
      
      // Veo 3 is still in limited preview
      const placeholderData = "data:text/plain;base64," + Buffer.from(`Veo 3 generation requested for: ${prompt}`).toString('base64');
      
      return {
        url: placeholderData,
        metadata: {
          model: "veo-3",
          prompt,
          status: 'unavailable',
          generated: false,
          timestamp: new Date().toISOString(),
          note: "Veo 3 is in limited preview and not yet available in all regions"
        }
      };
    }
    
    throw new Error("Unsupported generation type");
    
  } catch (error) {
    console.error(`Vertex AI ${type} generation error:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Check for specific permission/service errors
    if (errorMessage.includes('PERMISSION_DENIED') || 
        errorMessage.includes('SERVICE_DISABLED') ||
        errorMessage.includes('Vertex AI API has not been used')) {
      console.warn('⚠️ Vertex AI API not enabled or permission denied for this project');
      console.warn('💡 To enable Vertex AI: Visit Google Cloud Console -> APIs & Services -> Enable Vertex AI API');
      
      // For image generation, try fallback to DALL-E 3
      if (type === 'image') {
        console.log('🔄 Falling back to DALL-E 3...');
        try {
          return await generateWithOpenAI(prompt, 'image');
        } catch (dalleError) {
          console.error('DALL-E 3 fallback also failed:', dalleError);
        }
      }
    }
    
    // Fallback to placeholder if Vertex AI fails
    const placeholderData = "data:text/plain;base64," + Buffer.from(`${type === 'image' ? 'Imagen 3' : 'Veo 3'} generation failed: ${errorMessage}`).toString('base64');
    
    return {
      url: placeholderData,
      metadata: {
        model: type === 'image' ? "imagen-3" : "veo-3",
        prompt,
        status: 'error',
        generated: false,
        timestamp: new Date().toISOString(),
        error: errorMessage,
        note: type === 'image' ? 
          'Vertex AI не настроен. Изображение будет создано через DALL-E 3.' :
          'Veo 3 недоступен в данном регионе. Попробуйте создать изображение.'
      }
    };
  }
}