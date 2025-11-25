import { z } from 'zod';

export interface MediaModelConfig {
  provider: string;
  modelId: string;
  type: 'image' | 'video' | 'upscale';
  quality: 'standard' | 'hd' | 'premium';
  description: string;
  maxResolution?: string;
  maxDurationSec?: number;
  supportsNegativePrompt?: boolean;
  supportsSeed?: boolean;
  supportsSteps?: boolean;
}

export const MEDIA_MODELS: Record<string, MediaModelConfig> = {
  // Imagen models
  'imagen3': {
    provider: 'google',
    modelId: 'imagen3',
    type: 'image',
    quality: 'hd',
    description: 'Imagen 3 - High quality text-to-image generation',
    maxResolution: '1024x1024',
    supportsNegativePrompt: true,
    supportsSeed: true,
    supportsSteps: true,
  },
  'imagen4': {
    provider: 'google',
    modelId: 'imagen4',
    type: 'image',
    quality: 'premium',
    description: 'Imagen 4 - Premium quality text-to-image generation',
    maxResolution: '1024x1024',
    supportsNegativePrompt: true,
    supportsSeed: true,
    supportsSteps: true,
  },
  // Gemini image model
  'gemini_image': {
    provider: 'google',
    modelId: 'gemini_image',
    type: 'image',
    quality: 'standard',
    description: 'Gemini Image - Standard quality image generation',
    maxResolution: '1024x1024',
    supportsNegativePrompt: false,
    supportsSeed: false,
    supportsSteps: false,
  },
  // GPT image models
  'gpt_image_1': {
    provider: 'openai',
    modelId: 'gpt_image_1',
    type: 'image',
    quality: 'standard',
    description: 'GPT Image Generation - DALL-E based',
    maxResolution: '1024x1024',
    supportsNegativePrompt: true,
    supportsSeed: false,
    supportsSteps: false,
  },
  // NanoBanana models
  'nanobanana_pro': {
    provider: 'nanobanana',
    modelId: 'nanobanana_pro',
    type: 'upscale',
    quality: 'premium',
    description: 'NanoBanana Pro - Premium upscaling and enhancement',
    supportsNegativePrompt: false,
    supportsSeed: false,
    supportsSteps: false,
  },
  // Veo3 video model
 'veo3_video': {
    provider: 'google',
    modelId: 'veo3_video',
    type: 'video',
    quality: 'hd',
    description: 'Veo 3 - High quality text-to-video generation',
    maxDurationSec: 120,
    supportsNegativePrompt: true,
    supportsSeed: true,
    supportsSteps: false,
  },
};

export function getMediaModel(modelId: string): MediaModelConfig | null {
  return MEDIA_MODELS[modelId] || null;
}

export function validateMediaParams(
  modelId: string,
  params: {
    quality?: string;
    seed?: number;
    steps?: number;
    aspectRatio?: string;
    negativePrompt?: string;
  }
): { valid: boolean; errors: string[] } {
  const model = getMediaModel(modelId);
  if (!model) {
    return { valid: false, errors: [`Model ${modelId} not found`] };
  }

  const errors: string[] = [];

  // Validate quality
  if (params.quality && !['standard', 'hd', 'premium'].includes(params.quality)) {
    errors.push('Invalid quality value. Use: standard, hd, premium');
  }

  // Validate seed
  if (params.seed !== undefined && (!Number.isInteger(params.seed) || params.seed < 0 || params.seed > 99999)) {
    errors.push('Seed must be an integer between 0 and 999999');
  }

  // Validate steps
  if (params.steps !== undefined && (!Number.isInteger(params.steps) || params.steps < 1 || params.steps > 100)) {
    errors.push('Steps must be an integer between 1 and 100');
  }

  // Validate aspect ratio format
  if (params.aspectRatio && !/^\d+:\d+$/.test(params.aspectRatio)) {
    errors.push('Aspect ratio must be in format "width:height" (e.g., "16:9", "1:1")');
  }

 // Check if model supports requested features
 if (params.seed !== undefined && !model.supportsSeed) {
    errors.push(`Model ${modelId} does not support seed parameter`);
  }

  if (params.steps !== undefined && !model.supportsSteps) {
    errors.push(`Model ${modelId} does not support steps parameter`);
  }

  if (params.negativePrompt && !model.supportsNegativePrompt) {
    errors.push(`Model ${modelId} does not support negative prompt`);
  }

  return { valid: errors.length === 0, errors };
}

export function getMediaProvider(modelId: string): string | null {
  const model = getMediaModel(modelId);
  return model ? model.provider : null;
}

export function getMediaType(modelId: string): 'image' | 'video' | 'upscale' | null {
  const model = getMediaModel(modelId);
  return model ? model.type : null;
}

// Validation schema for API requests
export const mediaRequestSchema = z.object({
  prompt: z.string().min(1).max(1000),
  modelId: z.string().refine(modelId => Object.keys(MEDIA_MODELS).includes(modelId), {
    message: 'Invalid modelId'
  }),
  quality: z.enum(['standard', 'hd', 'premium']).optional(),
  seed: z.number().int().min(0).max(9999).optional(),
  steps: z.number().int().min(1).max(100).optional(),
  aspectRatio: z.string().regex(/^\d+:\d+$/, 'Aspect ratio must be in format "width:height"').optional(),
  negativePrompt: z.string().max(500).optional(),
  durationSec: z.number().min(1).max(120).optional(),
});