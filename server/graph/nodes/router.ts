// server/graph/nodes/router.ts
import type { GraphState } from '../types.js';

/**
 * Функция маршрутизации для enhanced графа
 */
export function enhancedRouteToAgent(state: GraphState): string {
  const agent = state.agent?.toLowerCase();
  
  switch (agent) {
    case 'chef':
      return 'chef_node';
    case 'accountant':
      return 'accountant_node';
    case 'researcher':
      return 'researcher_node';
    case 'media':
      return 'media_node';
    case 'quality':
      return 'quality_control_node';
    default:
      return 'final_answer';
  }
}

/**
 * Узел финального ответа
 */
export function finalAnswerNode(state: GraphState): GraphState {
  // Если QA проверка не прошла, добавляем ошибку в state.errors
  if (state.qualityCheck && !state.qualityCheck.passed) {
    return {
      ...state,
      errors: [
        ...(state.errors || []),
        {
          type: 'quality_check_failed',
          message: state.qualityCheck.reason || 'Quality check failed',
          score: state.qualityCheck.score
        }
      ]
    };
  }
  
  // В противном случае просто возвращаем состояние без изменений
  return state;
}