// Финальная демонстрация работы системы Chef's Mind AI
const http = require('http');

const API_BASE = 'http://localhost:5001';
const FRONTEND_URL = 'http://localhost:3000';

function makeRequest(path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5001,
      path: path,
      method: data ? 'POST' : 'GET',
      headers: data ? {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(JSON.stringify(data))
      } : {}
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body }));
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function testFullSystem() {
  console.log('🎯 Финальное тестирование Chef\'s Mind AI\n');

  try {
    // Тест 1: Проверка здоровья системы
    console.log('1️⃣ Проверка здоровья системы...');
    const health = await makeRequest('/api/health');
    const healthData = JSON.parse(health.body);
    console.log(`✅ Статус: ${healthData.status}`);
    console.log(`📦 Версия: ${healthData.version}`);
    console.log(`🤖 Агенты: ${healthData.agents.join(', ')}\n`);

    // Тест 2: Проверка доступности агентов
    console.log('2️⃣ Проверка доступности агентов...');
    const agents = await makeRequest('/api/agent/agents');
    const agentsData = JSON.parse(agents.body);
    console.log('📋 Доступные агенты:');
    agentsData.agents.forEach(agent => {
      console.log(`  - ${agent.name}: ${agent.description} (${agent.model})`);
    });
    console.log('');

    // Тест 3: Сценарии использования
    const testScenarios = [
      {
        name: 'Запрос к Шефу',
        message: 'Посоветуй рецепт борща',
        expectedAgent: 'chef',
        description: 'Проверка работы кулинарного эксперта'
      },
      {
        name: 'Запрос к Учётчику',
        message: 'Какой у нас доход за последний месяц?',
        expectedAgent: 'accountant', 
        description: 'Проверка работы финансового аналитика'
      },
      {
        name: 'Сложный запрос',
        message: 'Составь меню на неделю и рассчитай стоимость',
        expectedAgent: 'chef',
        description: 'Проверка обработки комплексных запросов'
      },
      {
        name: 'Аналитический запрос',
        message: 'Проанализируй финансовые показатели',
        expectedAgent: 'accountant',
        description: 'Проверка аналитических возможностей'
      }
    ];

    console.log('3️⃣ Тестирование сценариев использования...\n');
    
    let successfulTests = 0;
    for (const scenario of testScenarios) {
      console.log(`📝 ${scenario.name}`);
      console.log(`💬 Сообщение: "${scenario.message}"`);
      console.log(`📖 Описание: ${scenario.description}`);
      
      const response = await makeRequest('/api/agent/chat', { message: scenario.message });
      
      if (response.status === 200) {
        const lines = response.body.split('\n');
        let selectedAgent = '';
        let responseContent = '';
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.type === 'metadata') {
                selectedAgent = data.agent;
              } else if (data.type === 'content') {
                responseContent += data.content;
              }
            } catch (e) {}
          }
        }
        
        console.log(`🎯 Выбранный агент: ${selectedAgent}`);
        console.log(`💬 Ответ: ${responseContent.substring(0, 100)}...`);
        
        if (selectedAgent === scenario.expectedAgent) {
          console.log('✅ Тест пройден');
          successfulTests++;
        } else {
          console.log(`❌ Ожидаемый агент: ${scenario.expectedAgent}`);
        }
      } else {
        console.log(`❌ Ошибка запроса: ${response.status}`);
      }
      console.log('─'.repeat(60));
    }

    // Итоги
    console.log('\n📊 Итоги тестирования:');
    console.log(`✅ Успешных тестов: ${successfulTests}/${testScenarios.length}`);
    console.log(`🎯 Точность маршрутизации: ${Math.round((successfulTests / testScenarios.length) * 100)}%`);

    if (successfulTests >= testScenarios.length * 0.75) {
      console.log('🎉 Система работает отлично!');
    } else {
      console.log('⚠️ Рекомендуется улучшить логику маршрутизации');
    }

    console.log('\n🌐 Доступ к интерфейсу:');
    console.log(`   Фронтенд: ${FRONTEND_URL}`);
    console.log(`   API: ${API_BASE}/api/health`);
    
    console.log('\n🚀 Chef\'s Mind AI готов к использованию!');

  } catch (error) {
    console.error('❌ Ошибка при тестировании:', error.message);
    console.log('\n💡 Убедитесь, что:');
    console.log('   1. Сервер запущен на порту 5001');
    console.log('   2. Фронтенд запущен на порту 3000');
    console.log('   3. Все зависимости установлены');
  }
}

// Запуск тестирования
testFullSystem();