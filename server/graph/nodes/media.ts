import type { GraphState } from '../types.js';
import { getEnhancedMediaTool } from '../../services/enhanced-media.js';

/**
 * Media Node (FoodFrame v3.0)
 * Handles image and video generation using the EnhancedMediaTool.
 * Routing logic is encapsulated in the tool itself.
 */
export async function enhancedMediaNode(
  state: GraphState
): Promise<GraphState> {
  const lastMessage = state.messages[state.messages.length - 1];
  const prompt = lastMessage?.content || "Food presentation";
  const kind = (state.plan?.kind === 'video') ? 'video' : 'image';

  try {
    const tool = getEnhancedMediaTool();

    // Call the tool which handles routing (Gemini 3, Imagen 4, etc.)
    const result = await tool.generateMedia({
      prompt: prompt,
      generator: 'auto' // Explicitly request auto routing
    }, kind);

    const note = `Media generated successfully.\nURL: ${result.url}\nModel: ${result.model}`;

    return {
      ...state,
      response: note,
      messages: [
        ...(state.messages || []),
        {
          role: 'assistant',
          content: note,
          meta: {
            agent: 'Media',
            mediaUrl: result.url,
            mediaModel: result.model
          }
        },
      ],
      meta: { ...(state.meta || {}), mediaRequested: false, mediaDone: true },
    };
  } catch (error) {
    const note = `Media generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
    return {
      ...state,
      response: note,
      messages: [
        ...(state.messages || []),
        { role: 'assistant', content: note, meta: { agent: 'Media', error: true } },
      ],
      meta: { ...(state.meta || {}), mediaRequested: false, mediaDone: true },
    };
  }
}
