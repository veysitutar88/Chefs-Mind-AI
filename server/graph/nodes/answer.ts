// server/graph/nodes/answer.ts
import type { GraphState } from "../types";

/**
 * Финальный узел: возвращает последнее состояние без изменений.
 * Удобно как "стоп-узел" в условных переходах.
 */
export async function finalAnswerNode(state: GraphState): Promise<GraphState> {
  return state;
}
