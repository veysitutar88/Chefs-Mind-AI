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

// --- Per-Agent Model Options (Block 2 / v2.3) ---

export type AgentKey = "sous_chef" | "gastro_count" | "gastro_mind" | "food_frame";

export interface AgentModelOption {
    id: string;          // internal model id used by routing
    label: string;       // human-readable name for the UI
    provider: "gemini" | "gpt" | "perplexity" | "imagen" | "veo" | "nanobanana";
    kind: "chat" | "vision" | "image" | "video";
    default?: boolean;
}

export const AGENT_MODEL_OPTIONS: Record<AgentKey, AgentModelOption[]> = {
    sous_chef: [
        { id: "gemini-3-pro", label: "Gemini 3 Pro", provider: "gemini", kind: "chat", default: true },
        { id: "gpt-5.1", label: "GPT-5.1", provider: "gpt", kind: "chat" }
    ],
    gastro_count: [
        { id: "gemini-3-pro-structured", label: "Gemini 3 Pro Structured", provider: "gemini", kind: "chat", default: true },
        { id: "gpt-5.1-analytical", label: "GPT-5.1 Analytical", provider: "gpt", kind: "chat" }
    ],
    gastro_mind: [
        { id: "perplexity-sonar", label: "Perplexity (Online)", provider: "perplexity", kind: "chat", default: true },
        { id: "gemini-3-pro", label: "Gemini 3 Pro", provider: "gemini", kind: "chat" },
        { id: "gpt-5.1", label: "GPT-5.1", provider: "gpt", kind: "chat" }
    ],
    food_frame: [
        { id: "imagen-3", label: "Imagen 3", provider: "imagen", kind: "image", default: true },
        { id: "imagen-4", label: "Imagen 4", provider: "imagen", kind: "image" },
        { id: "gemini-vision", label: "Gemini Image", provider: "gemini", kind: "image" },
        { id: "gpt-image-1", label: "GPT Image 1", provider: "gpt", kind: "image" },
        { id: "nanobanana-pro", label: "NanoBanana Pro", provider: "nanobanana", kind: "image" },
        { id: "veo-3", label: "Veo 3 (Video)", provider: "veo", kind: "video" }
    ]
};

export function getDefaultModelForAgent(agent: AgentKey): AgentModelOption {
    const options = AGENT_MODEL_OPTIONS[agent];
    return options.find(o => o.default) || options[0];
}
