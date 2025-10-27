import type { GraphState } from "../types.js";

export async function researcherNode(state: GraphState): Promise<GraphState> {
  return state;
}

export async function enhancedResearcherNode(state: GraphState): Promise<GraphState> {
  const user = state.input?.trim() || "…";
  const assistantReply = `Вот результаты моего исследования по запросу: «${user}». (демо-ответ исследователя)`;
  
  return {
    ...state,
    response: assistantReply, // Добавляем response для QA проверки
    messages: [
      ...(state.messages || []),
      { role: "assistant", content: assistantReply, meta: { agent: "Researcher" } }
    ],
  };
}