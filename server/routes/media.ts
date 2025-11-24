import { Router, Request, Response } from 'express';
import { jwtAuthMiddleware } from '../middleware/jwtAuth.js';
import { requireAuth, requireRole } from '../middleware/rbac.js';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { dbWrite as db } from '../db.js';
import { mediaAssets } from '../../shared/schema.js';
import { eq, and } from 'drizzle-orm';
import { getEnhancedMediaTool } from '../services/enhanced-media.js';
import { agentRouting } from '../config/agent-routing.js';
import { llmConfig } from '../config/llm-config.js';

// Импорт провайдеров (удалены старые)

// Валидационные схемы
const generateImageSchema = z.object({
  provider: z.enum(['dalle', 'imagen']).default('dalle'),
  prompt: z.string().min(1).max(1000),
  options: z.object({
    resolution: z.string().optional(),
    quality: z.string().optional(),
  }).optional(),
});

const generateVideoSchema = z.object({
  provider: z.enum(['veo']).default('veo'),
  prompt: z.string().min(1).max(1000),
  options: z.object({
    duration: z.number().optional(),
    style: z.string().optional(),
  }).optional(),
});

const getAssetsSchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
  provider: z.string().optional(),
});

// Helper для маппинга провайдеров в EnhancedMediaTool
// EnhancedMediaTool mapping; keep compatibility with existing request schema
function mapProviderToGenerator(provider: string): string {
  switch (provider) {
    case 'dalle': return 'dall-e-3';
    case 'imagen': return 'imagen-3';
    case 'veo': return 'veo-3';
    default: return provider;
  }
}

// Типы
type JobStatus = 'pending' | 'in_progress' | 'completed' | 'failed';

interface JobData {
  id: string;
  userId: string;
  provider: string;
  prompt: string;
  status: JobStatus;
  progress?: number;
  assetUrl?: string;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

const router = Router();

// Хранилище активных задач (в памяти для простоты)
const jobStore = new Map<string, JobData>();

/**
 * GET /api/media/models
 * Возвращает список доступных моделей и флагов
 */
router.get('/models', (req, res) => {
  const flags = agentRouting.getMediaFlags();
  const imageModel = agentRouting.getImageModel();
  const videoModel = agentRouting.getVideoModel();
  const upscaleProvider = agentRouting.getUpscaleProvider();

  res.json({
    flags,
    defaults: {
      image: imageModel,
      video: videoModel,
      upscale: upscaleProvider
    },
    providers: {
      image: ['dall-e-3', 'imagen-3'],
      video: ['veo-3'],
      upscale: ['nanobanana', 'openai', 'google']
    }
  });
});

/**
 * POST /api/media/upscale
 * Инициирует задачу апскейла
 */
router.post(
  '/upscale',
  jwtAuthMiddleware,
  requireAuth,
  requireRole(['admin', 'chef', 'media_creator']),
  async (req: Request, res: Response) => {
    // TODO: Implement upscale logic using agentRouting.getUpscaleProvider()
    // For now, return a mock response or 501 Not Implemented
    res.status(501).json({ message: 'Upscale not yet implemented' });
  }
);

/**
 * POST /api/media/generate/image
 * Инициирует задачу генерации изображения
 */
router.post(
  '/generate/image',
  jwtAuthMiddleware,
  requireAuth,
  requireRole(['admin', 'chef', 'media_creator']),
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const validatedData = generateImageSchema.parse(req.body);

      const { provider, prompt, options } = validatedData;

      // Создание jobId
      const jobId = `img-${uuidv4()}`;

      // Создание записи в БД
      await db.insert(mediaAssets).values({
        userId,
        provider,
        prompt,
        jobId,
        status: 'pending',
      });

      // Создание записи в памяти для асинхронной обработки
      const jobData: JobData = {
        id: jobId,
        userId,
        provider,
        prompt,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jobStore.set(jobId, jobData);

      // Запуск асинхронной обработки
      // Use agent routing to determine provider/model if not explicitly set (or override based on logic)
      // For now, we respect the requested provider but could fallback to defaults
      const effectiveProvider = provider || agentRouting.getImageModel().provider;
      processImageGeneration(jobId, effectiveProvider, prompt, options || {});

      console.log(`🖼️ Image generation job started: ${jobId} for user ${userId}`);

      res.status(202).json({
        jobId,
        status: 'pending',
        provider,
      });

    } catch (error) {
      console.error('Image generation error:', error);

      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Invalid request',
          message: error.errors.map(e => e.message).join(', '),
        });
      }

      res.status(500).json({
        error: 'Failed to start image generation',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

/**
 * POST /api/media/generate/video
 * Инициирует задачу генерации видео
 */
router.post(
  '/generate/video',
  jwtAuthMiddleware,
  requireAuth,
  requireRole(['admin', 'chef', 'media_creator']),
  async (req: Request, res: Response) => {
    try {
      // Проверка feature-флага
      const enableVideo = process.env.ENABLE_VIDEO === 'true';

      if (!enableVideo) {
        console.log('🎬 Video generation disabled by feature flag');
        return res.status(200).json({
          ok: false,
          reason: 'video_disabled',
        });
      }

      const userId = (req as any).user.id;
      const validatedData = generateVideoSchema.parse(req.body);

      const { provider, prompt, options } = validatedData;

      // Создание jobId
      const jobId = `vid-${uuidv4()}`;

      // Создание записи в БД
      await db.insert(mediaAssets).values({
        userId,
        provider,
        prompt,
        jobId,
        status: 'pending',
      });

      // Создание записи в памяти для асинхронной обработки
      const jobData: JobData = {
        id: jobId,
        userId,
        provider,
        prompt,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jobStore.set(jobId, jobData);

      // Запуск асинхронной обработки
      const effectiveProvider = provider || agentRouting.getVideoModel().provider;
      processVideoGeneration(jobId, effectiveProvider, prompt, options || {});

      console.log(`🎬 Video generation job started: ${jobId} for user ${userId}`);

      res.status(202).json({
        jobId,
        status: 'pending',
        provider,
      });

    } catch (error) {
      console.error('Video generation error:', error);

      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Invalid request',
          message: error.errors.map(e => e.message).join(', '),
        });
      }

      res.status(500).json({
        error: 'Failed to start video generation',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

/**
 * GET /api/media/jobs/:jobId
 * Возвращает статус конкретной задачи генерации
 */
router.get(
  '/jobs/:jobId',
  jwtAuthMiddleware,
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const { jobId } = req.params;
      const userId = (req as any).user.id;

      // Получение из локального хранилища
      const job = jobStore.get(jobId);

      if (!job || job.userId !== userId) {
        return res.status(404).json({
          error: 'Job not found',
        });
      }

      res.json({
        jobId: job.id,
        status: job.status,
        progress: job.progress,
        assetUrl: job.assetUrl,
        error: job.error,
      });

    } catch (error) {
      console.error('Get job status error:', error);
      res.status(500).json({
        error: 'Failed to get job status',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

/**
 * GET /api/media/assets
 * Возвращает список сгенерированных медиа-ассетов
 */
router.get(
  '/assets',
  jwtAuthMiddleware,
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const validatedQuery = getAssetsSchema.parse(req.query);

      const { limit, offset, provider } = validatedQuery;

      // Построение условий для запроса
      const conditions = [eq(mediaAssets.userId, userId)];

      if (provider) {
        conditions.push(eq(mediaAssets.provider, provider));
      }

      // Запрос к БД
      const assets = await db
        .select({
          id: mediaAssets.id,
          userId: mediaAssets.userId,
          provider: mediaAssets.provider,
          prompt: mediaAssets.prompt,
          status: mediaAssets.status,
          assetUrl: mediaAssets.assetUrl,
          createdAt: mediaAssets.createdAt,
          updatedAt: mediaAssets.updatedAt,
        })
        .from(mediaAssets)
        .where(and(...conditions))
        .limit(limit)
        .offset(offset)
        .orderBy(mediaAssets.createdAt);

      // Получение общего количества
      const countResult = await db
        .select({ count: db.$count(mediaAssets) })
        .from(mediaAssets)
        .where(and(...conditions));

      const total = countResult[0]?.count || 0;

      res.json({
        total,
        assets: assets.map(asset => ({
          id: asset.id,
          userId: asset.userId,
          provider: asset.provider,
          prompt: asset.prompt,
          status: asset.status,
          assetUrl: asset.assetUrl,
          createdAt: asset.createdAt,
          updatedAt: asset.updatedAt,
        })),
      });

    } catch (error) {
      console.error('Get assets error:', error);

      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Invalid query parameters',
          message: error.errors.map(e => e.message).join(', '),
        });
      }

      res.status(500).json({
        error: 'Failed to get assets',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

/**
 * Асинхронная обработка генерации изображений
 */
async function processImageGeneration(
  jobId: string,
  provider: string,
  prompt: string,
  options: any
) {
  let errorMessage: string | undefined;
  try {
    updateJobStatus(jobId, 'in_progress', 25);

    const tool = getEnhancedMediaTool();
    const userId = jobStore.get(jobId)?.userId || '';
    const generator = mapProviderToGenerator(provider);

    updateJobStatus(jobId, 'in_progress', 50);

    const result = await tool.generateMedia({
      prompt,
      generator,
    }, 'image');

    updateJobStatus(jobId, 'in_progress', 75);

    const assetUrl = result?.url || `/assets/generated/${jobId}.png`;

    await db
      .update(mediaAssets)
      .set({
        status: 'completed',
        assetUrl,
        updatedAt: new Date(),
      })
      .where(eq(mediaAssets.jobId, jobId));

    updateJobStatus(jobId, 'completed', 100, assetUrl);

    console.log(`✅ Image generation completed: ${jobId}`);

  } catch (error) {
    console.error(`❌ Image generation failed: ${jobId}`, error);

    errorMessage = error instanceof Error ? error.message : 'Unknown error';

    await db
      .update(mediaAssets)
      .set({
        status: 'failed',
        errorMessage,
        updatedAt: new Date(),
      })
      .where(eq(mediaAssets.jobId, jobId));

    updateJobStatus(jobId, 'failed', 0, undefined, errorMessage);
  }
}

/**
 * Асинхронная обработка генерации видео
 */
async function processVideoGeneration(
  jobId: string,
  provider: string,
  prompt: string,
  options: any
) {
  let errorMessage: string | undefined;
  try {
    updateJobStatus(jobId, 'in_progress', 20);

    const tool = getEnhancedMediaTool();
    const userId = jobStore.get(jobId)?.userId || '';
    const generator = mapProviderToGenerator(provider);

    updateJobStatus(jobId, 'in_progress', 40);

    const result = await tool.generateMedia({
      prompt,
      generator,
      durationSec: typeof options?.duration === 'number' ? options.duration : undefined,
    }, 'video');

    updateJobStatus(jobId, 'in_progress', 70);

    const assetUrl = result?.url || `/assets/generated/${jobId}.mp4`;

    await db
      .update(mediaAssets)
      .set({
        status: 'completed',
        assetUrl,
        updatedAt: new Date(),
      })
      .where(eq(mediaAssets.jobId, jobId));

    updateJobStatus(jobId, 'completed', 100, assetUrl);

    console.log(`✅ Video generation completed: ${jobId}`);

  } catch (error) {
    console.error(`❌ Video generation failed: ${jobId}`, error);

    errorMessage = error instanceof Error ? error.message : 'Unknown error';

    await db
      .update(mediaAssets)
      .set({
        status: 'failed',
        errorMessage,
        updatedAt: new Date(),
      })
      .where(eq(mediaAssets.jobId, jobId));

    updateJobStatus(jobId, 'failed', 0, undefined, errorMessage);
  }
}

/**
 * Обновление статуса задачи в памяти
 */
function updateJobStatus(
  jobId: string,
  status: JobStatus,
  progress?: number,
  assetUrl?: string,
  error?: string
) {
  const job = jobStore.get(jobId);
  if (job) {
    job.status = status;
    job.progress = progress;
    job.assetUrl = assetUrl;
    job.error = error;
    job.updatedAt = new Date();
    jobStore.set(jobId, job);
  }
}

export default router;