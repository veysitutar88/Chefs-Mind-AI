import { envSchema } from './env.schema.js';
import dotenv from 'dotenv';

dotenv.config();

const parsedEnv = envSchema.parse(process.env);

export const llmConfig = {
    providers: {
        openai: {
            apiKey: parsedEnv.OPENAI_API_KEY,
        },
        google: {
            projectId: parsedEnv.GOOGLE_VERTEX_PROJECT_ID,
            location: parsedEnv.GOOGLE_VERTEX_LOCATION,
        },
        perplexity: {
            apiKey: parsedEnv.PERPLEXITY_API_KEY,
        },
        nanobanana: {
            apiKey: parsedEnv.NANOBANANA_API_KEY,
        },
    },
    agents: {
        sousChef: {
            provider: parsedEnv.SOUSCHEF_PROVIDER,
            model: parsedEnv.SOUSCHEF_MODEL,
        },
        gastroCount: {
            provider: parsedEnv.GASTROCOUNT_PROVIDER,
            model: parsedEnv.GASTROCOUNT_MODEL,
        },
        gastroMind: {
            provider: parsedEnv.GASTROMIND_PROVIDER,
            model: parsedEnv.GASTROMIND_MODEL,
        },
        foodFrame: {
            imageProvider: parsedEnv.FOODFRAME_IMG_PROVIDER,
            imageModel: parsedEnv.FOODFRAME_IMG_MODEL,
            videoProvider: parsedEnv.FOODFRAME_VIDEO_PROVIDER,
            videoModel: parsedEnv.FOODFRAME_VIDEO_MODEL,
            upscaleProvider: parsedEnv.FOODFRAME_UPSCALE_PROVIDER,
        },
    },
    media: {
        flags: {
            enableUpscale: parsedEnv.ENABLE_UPSCALE_BUTTON,
            enableModelSwitcher: parsedEnv.ENABLE_MODEL_SWITCHER,
            enableVideo: parsedEnv.ENABLE_VIDEO_GENERATION,
        },
        defaults: {
            aspectRatio: parsedEnv.DEFAULT_ASPECT_RATIO,
            fallback: parsedEnv.ALLOW_MEDIA_FALLBACK === 'true',
        },
    },
};
