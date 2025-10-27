import type { GraphState } from '../types.js';

export async function qualityControlNode(state: GraphState): Promise<GraphState> {
  // Используем state.response, если доступно, иначе берем последний assistant message
  let response = state.response || '';
  
  if (!response && state.messages && state.messages.length > 0) {
    // Находим последнее сообщение от ассистента
    const lastAssistantMessage = state.messages
      .reverse()
      .find(msg => msg.role === 'assistant');
    
    if (lastAssistantMessage) {
      response = lastAssistantMessage.content;
    }
  }
  
  const reasons: string[] = [];
  
  // Validation checks
  if (response.length <= 10) {
    reasons.push('Response too short (must be > 10 characters)');
  }
  
  if (!response.trim()) {
    reasons.push('Response is empty');
  }
  
  const placeholderPatterns = [/TODO/i, /FIXME/i, /\[placeholder\]/i, /XXX/i, /TBD/i];
  for (const pattern of placeholderPatterns) {
    if (pattern.test(response)) {
      reasons.push(`Contains placeholder text: ${pattern.source}`);
      break;
    }
  }
  
  const passed = reasons.length === 0;
  
  console.log('[QA] passed=' + passed, 'reasons:', reasons);
  
  // Update state
  return {
    ...state,
    qualityCheck: {
      passed,
      reason: reasons.length > 0 ? reasons.join(', ') : undefined,
      score: passed ? 1.0 : 0.5
    },
    ...(!passed && {
      errors: [...(state.errors || []), {
        type: 'quality_check_failed',
        message: `Quality check failed: ${reasons.join(', ')}`,
        score: 0.5
      }]
    })
  };
}