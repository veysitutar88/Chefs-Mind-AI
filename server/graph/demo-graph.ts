// Демонстрационная версия архитектуры агентов без реальных API вызовов

export interface GraphStateType {
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
    agent?: string;
    model?: string;
  }>;
  agentOutcome?: string;
  currentAgent?: string;
  usedModel?: string;
  metadata?: Record<string, any>;
}

// Системные промпты для агентов
const ORCHESTRATOR_PROMPT = `Ты - Оркестратор в системе Chef's Mind AI. Твоя задача - проанализировать запрос пользователя и направить его к правильному специалисту.

Доступные специалисты:
1. "chef" - Шеф-повар: отвечает за рецепты, кулинарные советы, ингредиенты, меню, приготовление блюд
2. "accountant" - Учётчик: отвечает за финансовые отчёты, учёт, затраты, выручку, статистику

Проанализируй запрос и верни только имя специалиста (chef или accountant). Если запрос неясен, выбери наиболее подходящего специалиста.`;

const CHEF_PROMPT = `Ты - Шеф-повар в ресторане в Берлине, Германия. Ты эксперт в кулинарии, рецептах, ингредиентах и управлении кухней. 
Отвечай на русском языке. Будь дружелюбным, профессиональным и давай практические советы по приготовлению блюд.`;

const ACCOUNTANT_PROMPT = `Ты - Учётчик/финансовый специалист в ресторане. Ты эксперт в финансовом анализе, отчётности, учёте затрат и выручки.
Отвечай на русском языке. Будь точным, аналитичным и предоставляй ясные финансовые инсайты.`;

// Узел Оркестратора (демо версия с улучшенной эвристикой)
export async function orchestratorNode(state: GraphStateType): Promise<Partial<GraphStateType>> {
  const lastMessage = state.messages[state.messages.length - 1];
  
  if (!lastMessage || lastMessage.role !== 'user') {
    return { agentOutcome: 'error', currentAgent: 'none' };
  }

  // Улучшенная эвристика для демонстрации
  const message = lastMessage.content.toLowerCase();
  
  // Ключевые слова для шефа (более специфичные)
  const chefKeywords = [
    'рецепт', 'кухня', 'блюдо', 'ингредиент', 'приготовить', 'готовка', 'меню', 'шеф', 
    'вкус', 'еда', 'борщ', 'суп', 'мясо', 'рыба', 'овощи', 'десерт', 'напиток', 'завтрак',
    'обед', 'ужин', 'закуска', 'салат', 'гарниr', 'соус', 'специи', 'пекарня', 'конdитер'
  ];
  
  // Ключевые слова для учётчика (более специфичные)
  const accountantKeywords = [
    'финанс', 'деньги', 'отчет', 'учет', 'стоимость', 'выручка', 'затраты', 'бюджет', 
    'статистика', 'доход', 'прибыль', 'расход', 'цена', 'себестоимость', 'маржа', 'налог',
    'продажа', 'клиент', 'чек', 'касса', 'инвентаризация', 'склад', 'поставщик', 'закупка',
    'анализ', 'показатель', 'grafик', 'таблица', 'данные', 'месяц', 'квартал', 'год'
  ];
  
  let chefScore = 0;
  let accountantScore = 0;
  
  // Подсчёт очков для каждого агента
  chefKeywords.forEach(keyword => {
    if (message.includes(keyword)) chefScore += 2; // Увеличиваем вес
  });
  
  accountantKeywords.forEach(keyword => {
    if (message.includes(keyword)) accountantScore += 2; // Увеличиваем вес
  });
  
  // Дополнительные эвристики
  if (message.includes('сколько стоит') || message.includes('цена')) {
    accountantScore += 3; // Сильный индикатор финансового вопроса
  }
  
  if (message.includes('как приготовить') || message.includes('как сделать')) {
    chefScore += 3; // Сильный индикатор кулинарного вопроса
  }
  
  // Выбор агента на основе очков
  let selectedAgent = 'chef'; // по умолчанию
  let confidence = chefScore - accountantScore;
  
  if (accountantScore > chefScore) {
    selectedAgent = 'accountant';
  }
  
  return {
    agentOutcome: selectedAgent,
    currentAgent: selectedAgent,
    usedModel: selectedAgent === 'chef' ? 'gpt-4-turbo-preview' : 'gemini-2.0-flash-exp',
    metadata: {
      orchestratorDecision: selectedAgent,
      originalQuery: lastMessage.content,
      confidence: confidence,
      chefScore: chefScore,
      accountantScore: accountantScore,
      heuristicRouting: true,
      improved: true
    }
  };
}

// Узел Шефа (демо версия)
export async function chefNode(state: GraphStateType): Promise<Partial<GraphStateType>> {
  const lastMessage = state.messages[state.messages.length - 1];
  
  if (!lastMessage || lastMessage.role !== 'user') {
    return { agentOutcome: 'error' };
  }

  // Демо ответы для шефа
  const query = lastMessage.content.toLowerCase();
  let response = '';
  
  if (query.includes('рецепт') && query.includes('борщ')) {
    response = 'Конечно! Вот мой фирменный рецепт борща: \n\n🥣 Ингредиенты:\n- Мясо говяжье - 500г\n- Свекла - 2 шт\n- Капуста - 300г\n- Картофель - 3 шт\n- Морковь - 1 шт\n- Лук - 1 шт\n- Томатная паста - 2 ст.л.\n\n🔥 Приготовление:\n1. Сварить бульон из говядины\n2. Нарезать овощи и пассировать лук с морковью\n3. Добавить свеклу и томатную пасту\n4. Варить 30 минут до готовности\n\nПриятного аппетита! 🍽️';
  } else if (query.includes('меню') && (query.includes('неделя') || query.includes('стоимость'))) {
    response = '📋 Меню на неделю с расчётом стоимости:\n\n📅 Понедельник:\n- Борщ: 150₽\n- Котлеты с пюре: 280₽\n- Салат: 120₽\n\n📅 Вторник:\n- Куриный суп: 130₽\n- Гречка с грибами: 250₽\n- Овощной салат: 100₽\n\n📅 Среда:\n- Рыбный суп: 180₽\n- Паста карbонара: 320₽\n- Цезарь: 150₽\n\n💰 Средняя стоимость обеда: 190₽\n💸 Себестоимость: 45% от цены продажи';
  } else if (query.includes('ужин')) {
    response = 'На ужин рекомендую приготовить сочную куриную грудку в сливочном соусе с овощами гриль. Это блюдо готовится 25 минут, получается питательным и вкусным. Нужно: куриная грудка, сливки, чеснок, смесь овощей.';
  } else {
    response = 'Как шеф-повар, я с радостью помогу вам с кулинарными вопросами! Можем обсудить рецепты, техники приготовления, подбор ингредиентов или составление меню. Что именно вас интересует? 🍳';
  }

  const assistantMessage = {
    role: 'assistant' as const,
    content: response,
    agent: 'chef',
    model: 'gpt-4-turbo-preview'
  };

  return {
    messages: [...state.messages, assistantMessage],
    agentOutcome: 'complete',
    usedModel: 'gpt-4-turbo-preview'
  };
}

// Узел Учётчика (демо версия)
export async function accountantNode(state: GraphStateType): Promise<Partial<GraphStateType>> {
  const lastMessage = state.messages[state.messages.length - 1];
  
  if (!lastMessage || lastMessage.role !== 'user') {
    return { agentOutcome: 'error' };
  }

  // Демо ответы для учётчика
  const query = lastMessage.content.toLowerCase();
  let response = '';
  
  if (query.includes('доход') && (query.includes('месяц') || query.includes('последний'))) {
    response = '📊 Финансовый отчет за последний месяц:\n\n💰 Общий доход: €45,670\n📈 Рост: +12% к предыдущему месяцу\n🍽️ Основные источники:\n- Основное меню: €38,200\n- Напитки: €5,150\n- Доставка: €2,320\n\n📉 Расходы: €32,450\n💸 Чистая прибыль: €13,220\n\nРекомендую увеличить акцент на доставку для дальнейшего роста.';
  } else if (query.includes('финансов') && query.includes('показатель')) {
    response = '📈 Анализ финансовых показателей показывает стабильный рост. За последние 3 месяца средний чек увеличился на 8%, а количество посетителей выросло на 15%. Рентабельность составляет 29%, что является хорошим показателем для ресторной отrasли.';
  } else if (query.includes('стоимость') && query.includes('меню')) {
    response = '💰 Анализ стоимости меню:\n\n📊 Средняя себестоимость блюд: 42%\n🍽️ Самые маржинальные позиции:\n- Напитки: 85% маржа\n- Десерты: 70% маржа\n- Основные блюда: 45% маржа\n\n💡 Рекомендации:\n- Увеличить ассортимент напитков\n- Ввести сезонные десерты\n- Оптимизировать закупку ингредиентов';
  } else {
    response = 'Как финансовый специалист, я готов помочь вам с анализом финансовых показателей, составлением отчетов, оптимизацией затрат и планированием бюджета. Какие конкретные финансовые вопросы вас интересуют? 💼';
  }

  const assistantMessage = {
    role: 'assistant' as const,
    content: response,
    agent: 'accountant',
    model: 'gemini-2.0-flash-exp'
  };

  return {
    messages: [...state.messages, assistantMessage],
    agentOutcome: 'complete',
    usedModel: 'gemini-2.0-flash-exp'
  };
}

// Функция маршрутизации
export function routeToAgent(state: GraphStateType): string {
  if (state.agentOutcome === 'error') {
    return 'END';
  }
  
  switch (state.agentOutcome) {
    case 'chef':
      return 'chef_node';
    case 'accountant':
      return 'accountant_node';
    default:
      return 'END';
  }
}

// Упрощенная версия обработки с агентами
export async function processWithAgents(message: string): Promise<{
  content: string;
  agent: string;
  model: string;
  metadata?: any;
}> {
  try {
    // Сначала определяем агента
    const orchestratorResult = await orchestratorNode({
      messages: [{ role: 'user', content: message }]
    });

    if (orchestratorResult.agentOutcome === 'error' || !orchestratorResult.currentAgent) {
      throw new Error('Failed to determine agent');
    }

    // Затем выполняем запрос через выбранного агента
    const state: GraphStateType = {
      messages: [{ role: 'user', content: message }],
      agentOutcome: orchestratorResult.agentOutcome,
      currentAgent: orchestratorResult.currentAgent,
      usedModel: orchestratorResult.usedModel,
      metadata: orchestratorResult.metadata
    };

    let result;
    if (orchestratorResult.currentAgent === 'chef') {
      result = await chefNode(state);
    } else if (orchestratorResult.currentAgent === 'accountant') {
      result = await accountantNode(state);
    } else {
      throw new Error('Unknown agent selected');
    }

    if (result.agentOutcome === 'error' || !result.messages) {
      throw new Error('Agent processing failed');
    }

    const lastMessage = result.messages[result.messages.length - 1];
    return {
      content: lastMessage.content,
      agent: lastMessage.agent || 'unknown',
      model: lastMessage.model || 'unknown',
      metadata: result.metadata
    };

  } catch (error) {
    console.error('Agent processing error:', error);
    throw error;
  }
}