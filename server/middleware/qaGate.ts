import type { Request, Response, NextFunction } from "express";
import fs from 'fs/promises';
import path from 'path';

interface QAResult {
  score: number;
  reasons?: string[];
  passed: boolean;
}

export interface QARequest extends Request {
  qaResult?: QAResult;
}

// Mock QA-Gate implementation for now
export async function qaGateMiddleware(req: QARequest, res: Response, next: NextFunction) {
  try {
    // Mock QA scoring - in real implementation this would call actual QA service
    const qaScore = Math.random() * 0.3 + 0.7; // Random score between 0.7 and 1.0
    const passed = qaScore >= 0.75;
    
    req.qaResult = {
      score: qaScore,
      reasons: passed ? [] : ['Content quality below threshold'],
      passed
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
      passed: false
    };
    next();
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
    result: result
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