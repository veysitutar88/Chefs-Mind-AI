import OpenAI from "openai";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function analyzeWithGPT(text: string, agentType: string, customSystemPrompt?: string): Promise<string> {
  let systemPrompt = "";
  
  // Use custom system prompt if provided, otherwise fall back to default behavior
  if (customSystemPrompt) {
    systemPrompt = customSystemPrompt;
  } else {
    // Fall back to original switch statement for default prompts
    switch (agentType) {
      case 'chef':
        systemPrompt = "Du bist ein IA-Assistent in der Anwendung 'Chef's Mind AI' für ein Restaurant in Berlin, Deutschland. Alle Finanzoperationen sollten in Euro (€) sein. Die Sprache für alle Berichte und Dokumente ist standardmäßig Deutsch (DE-DE). Du bist ein erfahrener Küchenchef und kulinarischer Experte. Gib praktische Rezepte, Kochtipps und Restaurantmanagement-Beratung. Antworte immer auf Deutsch.";
        break;
      case 'universal':
        systemPrompt = "Du bist ein IA-Assistent in der Anwendung 'Chef's Mind AI' für ein Restaurant in Berlin, Deutschland. Alle Finanzoperationen sollten in Euro (€) sein. Die Sprache für alle Berichte und Dokumente ist standardmäßig Deutsch (DE-DE). Du bist ein hilfsbereiter KI-Assistent für ein Restaurantmanagement-System. Du kannst bei verschiedenen Aufgaben helfen. Antworte immer auf Deutsch.";
        break;
      default:
        systemPrompt = "Du bist ein IA-Assistent in der Anwendung 'Chef's Mind AI' für ein Restaurant in Berlin, Deutschland. Alle Finanzoperationen sollten in Euro (€) sein. Die Sprache für alle Berichte und Dokumente ist standardmäßig Deutsch (DE-DE). Du bist ein hilfsbereiter KI-Assistent. Antworte auf Deutsch und sei präzise und informativ.";
    }
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: text }
      ]
    });

    return response.choices[0].message.content || "Entschuldigung, ich konnte keine Antwort generieren.";
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw new Error("Fehler bei der Verarbeitung mit GPT-5");
  }
}

export async function enhancePromptForMediaGeneration(userPrompt: string, mediaType: 'image' | 'video', customSystemPrompt?: string): Promise<string> {
  let systemPrompt = '';
  
  // Use custom system prompt if provided, otherwise fall back to default behavior
  if (customSystemPrompt) {
    systemPrompt = customSystemPrompt + '\n\nTransformiere den folgenden Benutzertext in einen detaillierten, professionellen Prompt für die ' + (mediaType === 'image' ? 'Bildgenerierung' : 'Videogenerierung') + '. Gib NUR den verbesserten englischen Prompt zurück, ohne Erklärungen oder zusätzlichen Text.';
  } else {
    // Fall back to original prompts
    systemPrompt = mediaType === 'image' 
      ? `Du bist ein Experte für Bildgenerierung und arbeitest mit AI-Bildgeneratoren wie DALL-E 3 und Imagen 3. 
         Deine Aufgabe ist es, einfache Benutzeranfragen in detaillierte, professionelle Prompts für die Bildgenerierung zu verwandeln.
         
         Transformiere den einfachen Benutzertext in einen reichen, detaillierten Prompt, der folgende Aspekte berücksichtigt:
         - Visueller Stil und Ästhetik
         - Beleuchtung und Atmosphäre  
         - Farben und Materialien
         - Komposition und Perspektive
         - Spezifische Details für Berlin/deutsche Restaurantszene wenn relevant
         
         Gib NUR den verbesserten englischen Prompt zurück, ohne Erklärungen oder zusätzlichen Text.`
      : `Du bist ein Experte für Videogenerierung und arbeitest mit AI-Videogeneratoren wie Veo 3.
         Deine Aufgabe ist es, einfache Benutzeranfragen in detaillierte, professionelle Prompts für die Videogenerierung zu verwandeln.
         
         Transformiere den einfachen Benutzertext in einen reichen, detaillierten Prompt, der folgende Aspekte berücksichtigt:
         - Kamerabewegung und Perspektive
         - Beleuchtung und Atmosphäre
         - Bewegungsabläufe und Dynamik
         - Visueller Stil und Qualität
         - Audio-relevante Beschreibungen
         - Spezifische Details für Berlin/deutsche Restaurantszene wenn relevant
         
         Gib NUR den verbesserten englischen Prompt zurück, ohne Erklärungen oder zusätzlichen Text.`;
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.8,
      max_completion_tokens: 500
    });

    const enhancedPrompt = response.choices[0].message.content?.trim() || userPrompt;
    console.log(`Prompt enhanced for ${mediaType}:`, { original: userPrompt, enhanced: enhancedPrompt });
    return enhancedPrompt;
  } catch (error) {
    console.error("Prompt enhancement failed, using original:", error);
    return userPrompt; // Fallback to original prompt if enhancement fails
  }
}

export async function generateWithOpenAI(prompt: string, type: 'image'): Promise<{url: string, metadata: any}> {
  if (type === 'image') {
    try {
      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: "1024x1024",
        quality: "standard"
      });

      return {
        url: response.data?.[0]?.url || '',
        metadata: {
          model: "dall-e-3",
          prompt,
          size: "1024x1024",
          quality: "standard"
        }
      };
    } catch (error) {
      console.error("DALL-E 3 generation error:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Fehler bei der Bildgenerierung mit DALL-E 3: ${errorMessage}`);
    }
  }
  
  throw new Error("Unsupported generation type for OpenAI");
}
