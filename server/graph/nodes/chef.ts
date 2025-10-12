// server/graph/nodes/chef.ts
import type { GraphState, Role } from "../types";

/**
 * Простейший узел «Шеф»: формирует ответ и, если в плане медиа,
 * добавляет «заказ» на медиа (дальше это подхватит media-узел/роут).
 */
export async function enhancedChefNode(state: GraphState): Promise<GraphState> {
  const planKind = state.plan?.kind ?? "text";
  const user = state.input?.trim() || "…";

  const assistantReply =
    planKind === "text"
      ? `Вот мои рекомендации по запросу: «${user}». (демо-ответ шефа; без генерации медиа)`
      : `Запрос понял: «${user}». Готовлю задание на ${planKind} для генератора.`;

  const next = {
    ...state,
    messages: [
      ...(state.messages || []),
      { role: "assistant" as Role, content: assistantReply, meta: { agent: "Chef" } }
    ],
  };

  // Если нужен медиа-аутпут — оставляем маркер для последующей ветки
  if (planKind === "image" || planKind === "video") {
    next.meta = { ...(next.meta || {}), mediaRequested: true };
  }
  return next;
}