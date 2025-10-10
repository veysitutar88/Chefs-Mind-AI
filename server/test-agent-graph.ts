import { processWithAgents } from './graph/demo-graph.js';

// Тестирование архитектуры агентов
async function testAgentGraph() {
  console.log('🤖 Тестирование архитектуры агентов Chef\'s Mind AI\n');

  const testQueries = [
    {
      query: 'Посоветуй рецепт борща',
      expectedAgent: 'chef'
    },
    {
      query: 'Какой у нас доход за последний месяц?',
      expectedAgent: 'accountant'
    },
    {
      query: 'Что приготовить на ужин?',
      expectedAgent: 'chef'
    },
    {
      query: 'Проанализируй наши финансовые показатели',
      expectedAgent: 'accountant'
    },
    {
      query: 'Как лучше приготовить стейк?',
      expectedAgent: 'chef'
    },
    {
      query: 'Какие у нас затраты на продукты?',
      expectedAgent: 'accountant'
    }
  ];

  let correctChoices = 0;
  
  for (const test of testQueries) {
    console.log(`\n📝 Запрос: "${test.query}"`);
    console.log(`🎯 Ожидаемый агент: ${test.expectedAgent}`);
    
    try {
      const result = await processWithAgents(test.query);
      console.log(`✅ Агент: ${result.agent}`);
      console.log(`🤖 Модель: ${result.model}`);
      console.log(`💬 Ответ: ${result.content.substring(0, 150)}...`);
      console.log(`📊 Метаданные:`, result.metadata);
      
      if (result.agent === test.expectedAgent) {
        console.log('✅ Правильный выбор агента!');
        correctChoices++;
      } else {
        console.log('❌ Неправильный выбор агента!');
      }
    } catch (error) {
      console.error('❌ Ошибка:', error instanceof Error ? error.message : error);
    }
    
    console.log('─'.repeat(60));
  }
  
  console.log(`\n📈 Результаты тестирования:`);
  console.log(`✅ Правильных выборов: ${correctChoices}/${testQueries.length}`);
  console.log(`🎯 Точность: ${Math.round((correctChoices / testQueries.length) * 100)}%`);
  
  if (correctChoices >= testQueries.length * 0.8) {
    console.log('🎉 Архитектура агентов работает отлично!');
  } else {
    console.log('⚠️ Нужно улучшить логику выбора агентов');
  }
}

// Запуск теста
testAgentGraph().catch(console.error);