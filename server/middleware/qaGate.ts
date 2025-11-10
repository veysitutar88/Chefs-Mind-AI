import type { Request, Response, NextFunction } from 'express';
import fs from 'fs/promises';
import path from 'path';
import { analyzeWithGPT } from '../services/openai.js';

interface QAResult {
  score: number;
  reasons?: string[];
  passed: boolean;
}

export interface QARequest extends Request {
  qaResult?: QAResult;
}

// Mock QA-Gate implementation for now
export async function qaGateMiddleware(
  req: QARequest,
  res: Response,
  next: NextFunction
) {
  try {
    // Mock QA scoring - in real implementation this would call actual QA service
    const qaScore = Math.random() * 0.3 + 0.7; // Random score between 0.7 and 1.0
    const passed = qaScore >= 0.75;

    req.qaResult = {
      score: qaScore,
      reasons: passed ? [] : ['Content quality below threshold'],
      passed,
    };

    // Log QA result
    console.log(`🔍 QA-Gate: score=${qaScore.toFixed(2)}, passed=${passed}`);

    next();
  } catch (error) {
    console.error('QA-Gate middleware error:', error);
    // Fail open - allow request to proceed if QA fails
    req.qaResult = {
      score: 0.5,
      reasons: ['QA service unavailable'],
      passed: false,
    };
    next();
  }
}

export interface QAResponse {
  correctedResponse: string;
  originalResponse: string;
  wasCorrected: boolean;
  qaScore: number;
  reasons?: string[];
}

/**
 * Validates and corrects agent response using QA expert GPT model
 * @param originalResponse - The original response from the agent
 * @param agentType - The type of agent that generated the response
 * @param userQuery - The original user query for context
 * @returns Promise<QAResponse> - QA validation result
 */
export async function validateAndCorrectResponse(
  originalResponse: string,
  agentType: string,
  userQuery: string
): Promise<QAResponse> {
  try {
    console.log(`🔍 QA-Gate: Validating response from ${agentType} agent`);

    // QA expert system prompt
    const qaSystemPrompt = `Du bist ein QA-Experte für 'Chef's Mind AI' Restaurantmanagementsystem. Deine Aufgabe ist es, KI-generierte Antworten auf Fakten zu prüfen, die Qualität zu bewerten und bei Bedarf zu korrigieren.

ANWEISUNGEN:
1. Prüfe die Antwort auf:
   - Faktische Korrektheit
   - Vollständigkeit der Antwort
   - Relevanz für die Restaurantbranche
   - Einhaltung deutscher Sprachstandards
   - Sicherheit und Compliance

2. Bewerte die Antwort mit einer Punktzahl von 0.0 bis 1.0:
   - 0.8-1.0: Ausgezeichnet (keine Korrekturen nötig)
   - 0.6-0.7: Gut (kleine Korrekturen möglich)
   - 0.4-0.5: Akzeptabel (Korrekturen empfohlen)
   - 0.0-0.3: Schlecht (erhebliche Korrekturen nötig)

3. Wenn die Bewertung unter 0.8 liegt:
   - Korrigiere die Antwort unter Beibehaltung der ursprünglichen Absicht
   - Verbessere die Klarheit und Präzision
   - Убедись, что вся соответствующая информация включена

4. Gib deine Antwort im folgenden JSON-Format zurück:
{
  "qaScore": 0.85,
  "wasCorrected": false,
  "correctedResponse": "Die ursprüngliche oder korrigierte Antwort",
  "reasons": ["Grund für die Bewertung"]
}

KONTEXT:
- Agent-Typ: ${agentType}
- Benutzeranfrage: ${userQuery}
- Ursprüngliche Antwort: ${originalResponse}`;

    // Call GPT with QA expert prompt
    const qaResponse = await analyzeWithGPT(
      `Analysiere und bewerte diese Antwort: ${originalResponse}`,
      'qa-expert',
      qaSystemPrompt
    );

    // Parse JSON response
    let qaResult: QAResponse;
    try {
      // Extract JSON from response
      const jsonMatch = qaResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        qaResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse QA response:', parseError);
      // Fallback to original response if parsing fails
      qaResult = {
        correctedResponse: originalResponse,
        originalResponse,
        wasCorrected: false,
        qaScore: 0.5,
        reasons: ['Failed to parse QA response'],
      };
    }

    // Ensure required fields
    qaResult.originalResponse = originalResponse;
    qaResult.wasCorrected = qaResult.correctedResponse !== originalResponse;

    console.log(
      `🔍 QA-Gate: score=${qaResult.qaScore}, corrected=${qaResult.wasCorrected}`
    );

    return qaResult;
  } catch (error) {
    console.error('QA validation error:', error);
    // Fail open - return original response if QA fails
    return {
      correctedResponse: originalResponse,
      originalResponse,
      wasCorrected: false,
      qaScore: 0.5,
      reasons: ['QA service unavailable'],
    };
  }
}
export function logQAResult(req: QARequest, result: any) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method,
    qaScore: req.qaResult?.score || 0,
    qaPassed: req.qaResult?.passed || false,
    qaReasons: req.qaResult?.reasons || [],
    result: result,
  };

  // Write to logs/task_Q1.json
  const logPath = path.join(process.cwd(), 'logs', 'task_Q1.json');

  // Async write - don't block the request
  (async () => {
    try {
      let existingLogs = [];
      try {
        const existing = await fs.readFile(logPath, 'utf8');
        existingLogs = JSON.parse(existing);
        if (!Array.isArray(existingLogs)) {
          existingLogs = [existingLogs];
        }
      } catch (error) {
        // File doesn't exist or is invalid, start with empty array
      }

      existingLogs.push(logEntry);

      await fs.writeFile(logPath, JSON.stringify(existingLogs, null, 2));
    } catch (writeError) {
      console.error('Failed to write QA log:', writeError);
    }
  })();

  // Also log to console
  console.log('QA-Gate Result:', JSON.stringify(logEntry, null, 2));

  return logEntry;
}
