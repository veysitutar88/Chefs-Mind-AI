import OpenAI from 'openai';
import type { WebSocket } from 'ws';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface STTMetrics {
  t_start: number;
  t_first_partial?: number;
  t_final?: number;
  audio_duration_ms?: number;
}

export interface STTResult {
  type: 'partial' | 'final';
  text: string;
  metrics?: Partial<STTMetrics>;
}

/**
 * Normalize MIME type for Whisper API
 * Removes codec suffixes and validates against Whisper's supported formats
 * @export for use in routes
 */
export function normalizeMimeType(mimeType: string): string {
  // Remove codec suffixes (e.g., audio/webm;codecs=opus -> audio/webm)
  const baseMimeType = mimeType.split(';')[0].trim();
  
  // Map to Whisper-supported formats
  const mimeMap: Record<string, string> = {
    'audio/webm': 'audio/webm',
    'audio/ogg': 'audio/ogg',
    'audio/mp4': 'audio/mp4',
    'audio/wav': 'audio/wav',
    'audio/mpeg': 'audio/mpeg',
    'audio/m4a': 'audio/m4a',
    'audio/x-m4a': 'audio/m4a',
  };
  
  return mimeMap[baseMimeType] || 'audio/webm';
}

/**
 * Transcribe audio buffer using OpenAI Whisper API
 * Returns the transcribed text
 */
export async function transcribeAudioBuffer(
  audioBuffer: Buffer,
  mimeType: string,
  language: string = 'ru'
): Promise<string> {
  try {
    // Normalize MIME type for Whisper compatibility
    const normalizedMimeType = normalizeMimeType(mimeType);
    
    // Determine file extension from normalized MIME type
    const extension = normalizedMimeType.includes('webm') ? 'webm' : 
                     normalizedMimeType.includes('ogg') ? 'ogg' : 
                     normalizedMimeType.includes('mp4') ? 'mp4' : 
                     normalizedMimeType.includes('m4a') ? 'm4a' : 
                     normalizedMimeType.includes('wav') ? 'wav' : 
                     normalizedMimeType.includes('mpeg') ? 'mp3' : 'webm';
    
    const audioBlob = new Blob([audioBuffer], { type: normalizedMimeType });
    const file = new File([audioBlob], `audio.${extension}`, { type: normalizedMimeType });
    
    const response = await openai.audio.transcriptions.create({
      file,
      model: 'whisper-1',
      language,
    });
    
    return response.text;
  } catch (error) {
    console.error('Whisper transcription error:', error);
    throw new Error(`Transcription failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Handle WebSocket STT streaming
 * Client sends audio chunks, server responds with partial and final results
 */
export class STTStreamHandler {
  private ws: WebSocket;
  private audioChunks: Buffer[] = [];
  private metrics: STTMetrics;
  private language: string = 'ru';
  private mimeType: string = 'audio/webm';
  private isClosed: boolean = false;

  constructor(ws: WebSocket) {
    this.ws = ws;
    this.metrics = {
      t_start: Date.now(),
    };
  }

  setLanguage(language: string) {
    this.language = language;
  }

  setMimeType(mimeType: string) {
    this.mimeType = mimeType;
  }

  addAudioChunk(chunk: Buffer) {
    if (this.isClosed) return;
    this.audioChunks.push(chunk);
  }

  async processPartial() {
    if (this.isClosed || this.audioChunks.length === 0) return;

    try {
      // Combine all chunks so far
      const combinedBuffer = Buffer.concat(this.audioChunks);
      
      // Only process if we have enough data (at least 0.5 seconds of audio ~8KB for webm)
      if (combinedBuffer.length < 8000) return;

      const text = await transcribeAudioBuffer(
        combinedBuffer,
        this.mimeType,
        this.language
      );

      if (!this.metrics.t_first_partial) {
        this.metrics.t_first_partial = Date.now();
      }

      const result: STTResult = {
        type: 'partial',
        text,
        metrics: {
          t_first_partial: this.metrics.t_first_partial - this.metrics.t_start,
        },
      };

      this.sendResult(result);
    } catch (error) {
      console.error('Partial transcription error:', error);
      // Don't send error for partial failures, just skip
    }
  }

  async finalize() {
    if (this.isClosed) return;

    try {
      if (this.audioChunks.length === 0) {
        throw new Error('No audio data received');
      }

      const combinedBuffer = Buffer.concat(this.audioChunks);
      const text = await transcribeAudioBuffer(
        combinedBuffer,
        this.mimeType,
        this.language
      );

      this.metrics.t_final = Date.now();

      const result: STTResult = {
        type: 'final',
        text,
        metrics: {
          t_first_partial: this.metrics.t_first_partial 
            ? this.metrics.t_first_partial - this.metrics.t_start 
            : undefined,
          t_final: this.metrics.t_final - this.metrics.t_start,
          audio_duration_ms: this.audioChunks.length * 100, // Rough estimate
        },
      };

      this.sendResult(result);
    } catch (error) {
      console.error('Final transcription error:', error);
      this.sendError(error instanceof Error ? error.message : 'Transcription failed');
    }
  }

  private sendResult(result: STTResult) {
    if (this.isClosed) return;
    
    try {
      this.ws.send(JSON.stringify({
        success: true,
        data: result,
        requestId: this.generateRequestId(),
      }));
    } catch (error) {
      console.error('Error sending result:', error);
    }
  }

  private sendError(message: string) {
    if (this.isClosed) return;
    
    try {
      this.ws.send(JSON.stringify({
        success: false,
        error: message,
        requestId: this.generateRequestId(),
      }));
    } catch (error) {
      console.error('Error sending error message:', error);
    }
  }

  private generateRequestId(): string {
    return `stt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  close() {
    this.isClosed = true;
    this.audioChunks = [];
  }
}

/**
 * Check if STT service is available
 */
export async function checkSTTHealth(): Promise<{ ok: boolean; provider: string; error?: string }> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return {
        ok: false,
        provider: 'openai-whisper',
        error: 'OPENAI_API_KEY not configured',
      };
    }

    // Just check if the API key exists and is formatted correctly
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey.startsWith('sk-')) {
      return {
        ok: false,
        provider: 'openai-whisper',
        error: 'Invalid OPENAI_API_KEY format',
      };
    }

    return {
      ok: true,
      provider: 'openai-whisper',
    };
  } catch (error) {
    return {
      ok: false,
      provider: 'openai-whisper',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
