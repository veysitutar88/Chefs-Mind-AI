import { Router, Request, Response } from "express";
import { qaGateMiddleware, logQAResult, QARequest } from "../middleware/qaGate.js";
import { jwtAuthMiddleware } from "../middleware/jwtAuth.js";
import { requireAuth, requireRole } from "../middleware/rbac.js";
import { getEnhancedMediaTool } from "../services/enhanced-media.js";
import { MediaGenerationParams, MediaGenerationResult } from "../../shared/types.js";

const router = Router();

// POST /api/media/image/generate
router.post("/image/generate", jwtAuthMiddleware, requireAuth, requireRole(['admin', 'chef']), qaGateMiddleware, async (req: QARequest, res: Response) => {
  try {
    const { prompt, generator, negativePrompt } = req.body as MediaGenerationParams;

    // Валидация входных данных
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({
        error: "Invalid request",
        message: "Prompt is required and must be a string"
      });
    }

    console.log(`🎨 Media generation request: ${prompt}`);

    // Проверка feature-флагов
    const allowFallback = process.env.ALLOW_MEDIA_FALLBACK === 'true';
    const defaultProvider = process.env.MEDIA_PROVIDER_DEFAULT || 'dall-e-3';

    // Подготовка параметров для генерации
    const generationParams: MediaGenerationParams = {
      prompt,
      generator: generator || defaultProvider,
      negativePrompt
    };

    // Вызов enhanced-media сервиса
    const mediaTool = getEnhancedMediaTool();
    let result: MediaGenerationResult;

    try {
      result = await mediaTool.generateMedia(generationParams, 'image');
    } catch (error) {
      // Если включен fallback и основной генератор не сработал
      if (allowFallback && generator && generator !== defaultProvider) {
        console.log(`🔄 Fallback: trying ${defaultProvider} after ${generator} failed`);
        result = await mediaTool.generateMedia({
          ...generationParams,
          generator: defaultProvider
        }, 'image');
      } else {
        throw error;
      }
    }

    // Логирование QA результата
    const qaLogEntry = logQAResult(req, {
      success: true,
      imageUrl: result.url,
      model: result.model,
      fallbackUsed: result.fallbackUsed || false
    });

    // Возврат результата
    res.json({
      success: true,
      data: {
        url: result.url,
        model: result.model,
        metadata: result.metadata,
        fallbackUsed: result.fallbackUsed || false
      },
      qaScore: req.qaResult?.score || 0,
      qaPassed: req.qaResult?.passed || false
    });

  } catch (error) {
    console.error('Media generation error:', error);
    
    // Логирование ошибки QA
    logQAResult(req, {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    res.status(500).json({
      error: "Media generation failed",
      message: error instanceof Error ? error.message : 'Unknown error',
      qaScore: req.qaResult?.score || 0,
      qaPassed: req.qaResult?.passed || false
    });
  }
});

// POST /api/media/video/generate
router.post("/video/generate", jwtAuthMiddleware, requireAuth, requireRole(['admin', 'chef']), qaGateMiddleware, async (req: QARequest, res: Response) => {
  try {
    const { prompt, generator, durationSec, negativePrompt } = req.body as MediaGenerationParams;

    // Валидация входных данных
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({
        error: "Invalid request",
        message: "Prompt is required and must be a string"
      });
    }

    console.log(`🎬 Video generation request: ${prompt}`);

    // Проверка feature-флагов
    const allowFallback = process.env.ALLOW_MEDIA_FALLBACK === 'true';
    const defaultProvider = process.env.MEDIA_PROVIDER_DEFAULT || 'veo-3';

    // Подготовка параметров для генерации
    const generationParams: MediaGenerationParams = {
      prompt,
      generator: generator || defaultProvider,
      durationSec: durationSec || 10,
      negativePrompt
    };

    // Вызов enhanced-media сервиса
    const mediaTool = getEnhancedMediaTool();
    let result: MediaGenerationResult;

    try {
      result = await mediaTool.generateMedia(generationParams, 'video');
    } catch (error) {
      // Если включен fallback и основной генератор не сработал
      if (allowFallback && generator && generator !== defaultProvider) {
        console.log(`🔄 Fallback: trying ${defaultProvider} after ${generator} failed`);
        result = await mediaTool.generateMedia({
          ...generationParams,
          generator: defaultProvider
        }, 'video');
      } else {
        throw error;
      }
    }

    // Логирование QA результата
    const qaLogEntry = logQAResult(req, {
      success: true,
      videoUrl: result.url,
      model: result.model,
      fallbackUsed: result.fallbackUsed || false
    });

    // Возврат результата
    res.json({
      success: true,
      data: {
        url: result.url,
        model: result.model,
        metadata: result.metadata,
        fallbackUsed: result.fallbackUsed || false
      },
      qaScore: req.qaResult?.score || 0,
      qaPassed: req.qaResult?.passed || false
    });

  } catch (error) {
    console.error('Video generation error:', error);
    
    // Логирование ошибки QA
    logQAResult(req, {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    res.status(500).json({
      error: "Video generation failed",
      message: error instanceof Error ? error.message : 'Unknown error',
      qaScore: req.qaResult?.score || 0,
      qaPassed: req.qaResult?.passed || false
    });
  }
});

export default router;