import type { GraphState } from "../types.js";

export async function accountantNode(state: GraphState): Promise<GraphState> {
  return state;
}

export async function enhancedAccountantNode(state: GraphState): Promise<GraphState> {
  const user = state.input?.trim() || "…";
  const assistantReply = `Вот мой финансовый анализ по запросу: «${user}». (демо-ответ бухгалтера)`;
  
  return {
    ...state,
    response: assistantReply, // Добавляем response для QA проверки
    messages: [
      ...(state.messages || []),
      { role: "assistant", content: assistantReply, meta: { agent: "Accountant" } }
    ],
  };
}