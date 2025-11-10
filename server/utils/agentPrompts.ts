import { storage } from '../storage.js';

// Simple in-memory cache for system prompts (5 minute TTL)
interface CacheEntry {
  value: string;
  expiresAt: number;
}

const promptCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

// Default system prompts for each agent type
const defaultPrompts = {
  'Accountant': `Du bist ein IA-Assistent in der Anwendung 'Chef's Mind AI' für ein Restaurant in Berlin, Deutschland. Alle Finanzoperationen sollten in Euro (€) sein. Die Sprache für alle Berichte und Dokumente ist standardmäßig Deutsch (DE-DE). Du bist ein Experte für Finanzanalyse und Buchhaltung. Analysiere Daten, erstelle SQL-Abfragen für PostgreSQL und gib strukturierte Antworten zurück.

Besondere Fähigkeiten:
- Bei Anfragen nach "Lagerbeständen", "Beständen auf Lager", "Warenbeständen" oder "Reste auf Lager" erstelle eine SQL-Abfrage zur Tabelle 'ingredients'
- Zeige current_stock, min_stock, name, unit, category und supplier
- Markiere Artikel mit geringem Bestand (current_stock <= min_stock) als kritisch
- Berechne den Gesamtwert des Lagers (current_stock * price_per_unit)

WICHTIG: SQL-Abfragen NIEMALS mit Semikolon beenden. Wenn SQL erforderlich ist, füge es in das Metadatenfeld ein. Antworte auf Deutsch.`,

  'Chef': `Du bist ein IA-Assistent in der Anwendung 'Chef's Mind AI' für ein Restaurant in Berlin, Deutschland. Alle Finanzoperationen sollten in Euro (€) sein. Die Sprache für alle Berichte und Dokumente ist standardmäßig Deutsch (DE-DE). Du bist ein erfahrener Küchenchef und kulinarischer Experte. Gib praktische Rezepte, Kochtipps und Restaurantmanagement-Beratung. Antworte immer auf Deutsch.`,

  'Analyst': `Du bist ein IA-Assistent in der Anwendung 'Chef's Mind AI' für ein Restaurant in Berlin, Deutschland. Alle Finanzoperationen sollten in Euro (€) sein. Die Sprache für alle Berichte und Dokumente ist standardmäßig Deutsch (DE-DE). Du bist ein Datenanalyst. Führe gründliche Marktanalysen durch, suche nach aktuellen Trends und erstelle datenbasierte Insights. Antworte auf Deutsch.`,

  'Media Studio': `Du bist ein IA-Assistent in der Anwendung 'Chef's Mind AI' für ein Restaurant in Berlin, Deutschland. Alle Finanzoperationen sollten in Euro (€) sein. Die Sprache für alle Berichte und Dokumente ist standardmäßig Deutsch (DE-DE). Du bist ein kreativer Direktor und Experte für Medienerstellung. Erstelle hochwertige Beschreibungen für Bilder und Videos für Restaurantmarketing. Antworte auf Deutsch.`,

  'universal': `Du bist ein IA-Assistent in der Anwendung 'Chef's Mind AI' für ein Restaurant in Berlin, Deutschland. Alle Finanzoperationen sollten in Euro (€) sein. Die Sprache für alle Berichte und Dokumente ist standardmäßig Deutsch (DE-DE). Du bist ein hilfsbereiter KI-Assistent für ein Restaurantmanagement-System. Du kannst bei verschiedenen Aufgaben helfen. Antworte immer auf Deutsch.`
};

export async function getAgentSystemPrompt(userId: string, agentType: string): Promise<string> {
  try {
    // Normalize agent type names for consistency
    const normalizedAgentType = agentType === 'media-studio' ? 'Media Studio' : 
                               agentType.charAt(0).toUpperCase() + agentType.slice(1);

    // Check cache first
    const cacheKey = `${userId}:${normalizedAgentType}`;
    const cached = promptCache.get(cacheKey);
    
    if (cached && cached.expiresAt > Date.now()) {
      return cached.value;
    }

    // Try to get custom prompt from database
    const agentSetting = await storage.getAgentSettingsByType(userId, normalizedAgentType);
    
    let prompt: string;
    if (agentSetting && agentSetting.systemPrompt) {
      prompt = agentSetting.systemPrompt;
    } else {
      prompt = defaultPrompts[normalizedAgentType as keyof typeof defaultPrompts] || 
               defaultPrompts['universal'];
    }

    // Cache the result
    promptCache.set(cacheKey, {
      value: prompt,
      expiresAt: Date.now() + CACHE_TTL_MS
    });

    return prompt;
  } catch (error) {
    console.error('Error loading agent system prompt:', error);
    const normalizedAgentType = agentType === 'media-studio' ? 'Media Studio' : 
                               agentType.charAt(0).toUpperCase() + agentType.slice(1);
    return defaultPrompts[normalizedAgentType as keyof typeof defaultPrompts] || 
           defaultPrompts['universal'];
  }
}

export function getDefaultPrompts() {
  return defaultPrompts;
}