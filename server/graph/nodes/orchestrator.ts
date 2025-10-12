// server/graph/nodes/orchestrator.ts
import type { GraphState, Agent, Plan } from "../types";

function guessAgentAndPlan(input: string): { agent: Agent; plan: Plan } {
  const t = input.toLowerCase();

  // очень простой «рутер» по ключевым словам (можно заменить на LLM позже)
  const isVideo = /\b(video|видео|veo|sora)\b/.test(t);
  const isImage = /\b(image|картинк|изображен|dalle|imagen|gpt-image)\b/.test(t);
  const isFood  = /\b(рецепт|блюд|тарелк|салат|паста|пицца|шеф|chef)\b/.test(t);
  const isFinance = /\b(бюджет|себестоим|учет|инвойс|доход|расход)\b/.test(t);
  const isResearch= /\b(найди|поиск|исслед|research|сравни)\b/.test(t);

  let agent: Agent = "Researcher";
  if (isFood) agent = "Chef";
  else if (isVideo || isImage) agent = "Media";
  else if (isFinance) agent = "Accountant";
  else if (isResearch) agent = "Researcher";
  else agent = "Quality";

  let kind: Plan["kind"] = "text";
  if (isVideo) kind = "video";
  else if (isImage) kind = "image";

  const plan: Plan = { kind };

  return { agent, plan };
}

/** Оркестратор: решает, к какому агенту пойдём и какой план действия */
export async function enhancedOrchestratorNode(state: GraphState): Promise<GraphState> {
  const { agent, plan } = guessAgentAndPlan(state.input || "");
  const sysNote = `ORCH → agent=${agent}, kind=${plan.kind}`;
  return {
    ...state,
    agent,
    plan,
    messages: [...(state.messages || []), { role: "system", content: sysNote }],
    meta: { ...(state.meta || {}), routedAt: Date.now() }
  };
}
