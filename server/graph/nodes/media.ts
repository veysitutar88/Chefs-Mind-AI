// server/graph/nodes/media.ts
import type { GraphState } from "../types.js";

/**
 * Минимальный media-узел: ничего не вызывает, только помечает,
 * что "медиа сгенерировано" (заглушка).
 * Позже сюда вставишь вызов enhancer → provider.
 */
export async function enhancedMediaNode(state: GraphState): Promise<GraphState> {
  const kind = state.plan?.kind ?? "image";
  const note = `MEDIA stub done for kind=${kind}`;
  
  return {
    ...state,
    response: note, // Добавляем response для QA проверки
    messages: [
      ...(state.messages || []),
      { role: "assistant", content: note, meta: { agent: "Media" } }
    ],
    meta: { ...(state.meta || {}), mediaRequested: false, mediaDone: true }
  };
}