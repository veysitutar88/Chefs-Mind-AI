import type { GraphState } from '../types.js';

export async function qualityControlNode(
  state: GraphState
): Promise<GraphState> {
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

  const placeholderPatterns = [
    /TODO/i,
    /FIXME/i,
    /\[placeholder\]/i,
    /XXX/i,
    /TBD/i,
  ];
  for (const pattern of placeholderPatterns) {
    if (pattern.test(response)) {
      reasons.push(`Contains placeholder text: ${pattern.source}`);
      break;
    }
  }

  // Media Routing Check (FoodFrame v3.0)
  const lastMsg = state.messages[state.messages.length - 1];
  if (lastMsg?.meta?.agent === 'Media' || lastMsg?.meta?.agent === 'FoodFrame AI') {
    const model = lastMsg.meta.mediaModel as string | undefined;
    const validModels = [
      'gemini-3-image-pro',
      'imagen-4',
      'gpt-image-1',
      'veo-3',
      'veo-3.1'
    ];

    if (model && !validModels.includes(model)) {
      reasons.push(`Invalid media model used: ${model}. Expected one of: ${validModels.join(', ')}`);
    }

    // Check for legacy model references in content if model meta is missing
    if (!model) {
      const legacyModels = ['imagen3', 'nanobanana', 'dall-e-2'];
      for (const legacy of legacyModels) {
        if (response.toLowerCase().includes(legacy)) {
          reasons.push(`Legacy model reference detected: ${legacy}`);
        }
      }
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
      score: passed ? 1.0 : 0.5,
    },
    ...(!passed && {
      errors: [
        ...(state.errors || []),
        {
          type: 'quality_check_failed',
          message: `Quality check failed: ${reasons.join(', ')}`,
          score: 0.5,
        },
      ],
    }),
  };
}
