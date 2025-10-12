import type { GraphState } from "./types";
import { enhancedOrchestratorNode } from "./nodes/orchestrator";
import { enhancedChefNode } from "./nodes/chef";
import { enhancedAccountantNode } from "./nodes/accountant";
import { researcherNode } from "./nodes/researcher";
import { enhancedMediaNode } from "./nodes/media";
import { qualityControlNode } from "./nodes/quality_control";
import { finalAnswerNode } from "./nodes/router";

// Временный однопроходный раннер (чтобы снять TS-ошибки и иметь поведение по умолчанию)
export async function runEnhancedGraphOnce(input: string, history: GraphState["messages"] = []) {
  let state: GraphState = { 
    input, 
    messages: history || [],
    meta: {}
  };

  try {
    // 1) Orchestrate
    state = await enhancedOrchestratorNode(state);
    
    // 2) Route - простая логика
    const agent = state.agent?.toLowerCase();
    
    // 3) Exec node
    if (agent === "chef") {
      state = await enhancedChefNode(state);
    } else if (agent === "accountant") {
      state = await enhancedAccountantNode(state);
    } else if (agent === "researcher") {
      state = await researcherNode(state);
    } else if (agent === "media") {
      state = await enhancedMediaNode(state);
    } else {
      state = await qualityControlNode(state);
    }
    
    // 4) Finish
    return state;
  } catch (error) {
    console.error('Graph execution error:', error);
    return {
      ...state,
      messages: [
        ...(state.messages || []),
        {
          role: "assistant",
          content: `Ошибка выполнения графа: ${error instanceof Error ? error.message : 'Unknown error'}`,
          meta: { agent: "System", error: true }
        }
      ]
    };
  }
}

// Заглушка для совместимости
export const enhancedAgentGraph = {
  stream: async (state: GraphState) => {
    const result = await runEnhancedGraphOnce(state.input || '', state.messages);
    return [result];
  },
  invoke: runEnhancedGraphOnce
};

// Типы для совместимости
export type EnhancedGraphStateType = GraphState;