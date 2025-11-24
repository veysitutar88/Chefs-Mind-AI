import { llmConfig } from './llm-config.js';

type AgentAlias = 'sousChef' | 'gastroCount' | 'gastroMind' | 'foodFrame';

export const agentRouting = {
    getTextModel(agent: AgentAlias) {
        switch (agent) {
            case 'sousChef':
                return { provider: llmConfig.agents.sousChef.provider, model: llmConfig.agents.sousChef.model };
            case 'gastroCount':
                return { provider: llmConfig.agents.gastroCount.provider, model: llmConfig.agents.gastroCount.model };
            case 'gastroMind':
                return { provider: llmConfig.agents.gastroMind.provider, model: llmConfig.agents.gastroMind.model };
            default:
                return { provider: 'openai', model: 'gpt-4o-mini' };
        }
    },

    getImageModel() {
        return {
            provider: llmConfig.agents.foodFrame.imageProvider,
            model: llmConfig.agents.foodFrame.imageModel,
        };
    },

    getVideoModel() {
        return {
            provider: llmConfig.agents.foodFrame.videoProvider,
            model: llmConfig.agents.foodFrame.videoModel,
        };
    },

    getUpscaleProvider() {
        return llmConfig.agents.foodFrame.upscaleProvider;
    },

    getMediaFlags() {
        return llmConfig.media.flags;
    }
};
