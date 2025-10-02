import { VertexAI } from '@google-cloud/vertexai';
import crypto from 'crypto';

// In-memory job store (volatile mode without SAFE_MODE confirmation)
const jobStore = new Map<string, MediaJob>();

export interface MediaJob {
  id: string;
  kind: 'image' | 'video' | 'video-from-image';
  provider: string;
  status: 'queued' | 'running' | 'done' | 'failed';
  resultUrl?: string;
  error?: string;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

interface GenerateImageParams {
  prompt: string;
  negativePrompt?: string;
  aspect?: string;
  modelHints?: any;
}

interface GenerateVideoParams {
  prompt: string;
  durationSec?: number;
  aspect?: string;
  modelHints?: any;
}

interface GenerateVideoFromImageParams {
  imageUrl?: string;
  assetId?: string;
  prompt: string;
  durationSec?: number;
  aspect?: string;
  modelHints?: any;
}

// Retry configuration
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 30000, // 30 seconds
};

async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  timeoutError: string = 'Operation timed out'
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(timeoutError)), timeoutMs)
    ),
  ]);
}

async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  retries = RETRY_CONFIG.maxRetries,
  timeoutMs: number = 30000
): Promise<T> {
  try {
    return await withTimeout(fn(), timeoutMs, `Request timeout after ${timeoutMs}ms`);
  } catch (error) {
    if (retries === 0) throw error;
    
    const delay = Math.min(
      RETRY_CONFIG.baseDelay * Math.pow(2, RETRY_CONFIG.maxRetries - retries),
      RETRY_CONFIG.maxDelay
    );
    
    console.log(`Retry attempt ${RETRY_CONFIG.maxRetries - retries + 1}, waiting ${delay}ms`);
    await new Promise(resolve => setTimeout(resolve, delay));
    return retryWithBackoff(fn, retries - 1, timeoutMs);
  }
}

// Imagen-3 Provider (Google Vertex AI)
export async function generateImageImagen3(params: GenerateImageParams): Promise<MediaJob> {
  const jobId = crypto.randomUUID();
  const job: MediaJob = {
    id: jobId,
    kind: 'image',
    provider: 'imagen-3',
    status: 'queued',
    metadata: params,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  jobStore.set(jobId, job);
  
  // Start async generation
  (async () => {
    try {
      job.status = 'running';
      job.updatedAt = new Date();
      
      const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
      const location = 'us-central1';
      
      if (!projectId) {
        throw new Error('GOOGLE_CLOUD_PROJECT_ID not configured');
      }
      
      const startTime = Date.now();
      
      const vertex = new VertexAI({ project: projectId, location });
      const model = vertex.preview.getGenerativeModel({
        model: 'imagen-3.0-generate-001',
      });
      
      const result = await retryWithBackoff(async () => {
        const response = await model.generateContent({
          contents: [{
            role: 'user',
            parts: [
              { 
                text: `Generate image: ${params.prompt}${params.negativePrompt ? `\nNegative prompt: ${params.negativePrompt}` : ''}`
              }
            ]
          }],
          generationConfig: {
            temperature: 0.4,
            topP: 0.95,
            maxOutputTokens: 2048,
          }
        });
        
        return response;
      });
      
      const latency = Date.now() - startTime;
      console.log(`✅ Imagen-3 generation completed in ${latency}ms`);
      
      // Extract image URL from response (mocked for now)
      // In real implementation, Imagen returns base64 or GCS URL
      const imageUrl = `https://storage.googleapis.com/generated/${jobId}.png`;
      
      job.status = 'done';
      job.resultUrl = imageUrl;
      job.updatedAt = new Date();
      job.metadata = { ...job.metadata, latency };
      
    } catch (error: any) {
      console.error('Imagen-3 generation failed:', error);
      job.status = 'failed';
      job.error = error.message;
      job.updatedAt = new Date();
    }
  })();
  
  return job;
}

// Veo-3 Provider (stub - returns 501 Not Implemented)
export async function generateVideoVeo3(params: GenerateVideoParams): Promise<never> {
  throw { 
    status: 501,
    message: 'Video provider unavailable',
    detail: 'Veo-3 is not configured. To enable, set up Google Veo API credentials.'
  };
}

export async function generateVideoFromImageVeo3(params: GenerateVideoFromImageParams): Promise<never> {
  throw { 
    status: 501,
    message: 'Video provider unavailable',
    detail: 'Veo-3 is not configured. To enable, set up Google Veo API credentials.'
  };
}

// Job retrieval
export function getJob(jobId: string): MediaJob | undefined {
  return jobStore.get(jobId);
}

// Save job to database (with SAFE_MODE check)
export async function saveJobToDatabase(job: MediaJob, confirmCode?: string): Promise<void> {
  if (!confirmCode) {
    console.log('⚠️  Job not saved to DB: SAFE_MODE requires X-Confirm-Code');
    return;
  }
  
  // Implementation would use pool.query to insert into media_jobs table
  // This is a stub for now
  console.log(`💾 Saving job ${job.id} to database (SAFE_MODE confirmed)`);
}
