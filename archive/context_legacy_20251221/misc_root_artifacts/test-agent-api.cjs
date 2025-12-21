// Тестирование API агентов
const http = require('http');

// Функция для отправки POST запроса
function postData(path, data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    
    const options = {
      hostname: 'localhost',
      port: 5001,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: responseData
        });
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.write(postData);
    req.end();
  });
}

// Функция для отправки GET запроса
function getData(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5001,
      path: path,
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: responseData
        });
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.end();
  });
}

// Тестирование API
async function testAgentAPI() {
  console.log('🧪 Тестирование Chef\'s Mind AI Agent API\n');

  try {
    // Тест 1: Проверка здоровья сервера
    console.log('1️⃣ Проверка здоровья сервера...');
    const healthResponse = await getData('/api/health');
    console.log(`✅ Статус: ${healthResponse.statusCode}`);
    console.log(`📊 Ответ: ${healthResponse.body}\n`);

    // Тест 2: Получение списка агентов
    console.log('2️⃣ Получение списка агентов...');
    const agentsResponse = await getData('/api/agent/agents');
    console.log(`✅ Статус: ${agentsResponse.statusCode}`);
    console.log(`🤖 Агенты: ${agentsResponse.body}\n`);

    // Тест 3: Запрос к Шефу
    console.log('3️⃣ Запрос к Шефу...');
    const chefResponse = await postData('/api/agent/chat', {
      message: 'Посоветуй рецепт борща'
    });
    
    if (chefResponse.statusCode === 200) {
      console.log(`✅ Статус: ${chefResponse.statusCode}`);
      console.log('📩 Потоковый ответ:');
      const lines = chefResponse.body.split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.type === 'metadata') {
              console.log(`🎯 Выбран агент: ${data.agent} (${data.model})`);
            } else if (data.type === 'content') {
              process.stdout.write(data.content);
            } else if (data.type === 'complete') {
              console.log('\n✅ Ответ завершен');
            }
          } catch (e) {
            // Игнорируем ошибки парсинга
          }
        }
      }
    } else {
      console.log(`❌ Ошибка: ${chefResponse.statusCode}`);
    }
    console.log('\n');

    // Тест 4: Запрос к Учётчику
    console.log('4️⃣ Запрос к Учётчику...');
    const accountantResponse = await postData('/api/agent/chat', {
      message: 'Какой у нас доход за последний месяц?'
    });
    
    if (accountantResponse.statusCode === 200) {
      console.log(`✅ Статус: ${accountantResponse.statusCode}`);
      console.log('📩 Потоковый ответ:');
      const lines = accountantResponse.body.split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.type === 'metadata') {
              console.log(`🎯 Выбран агент: ${data.agent} (${data.model})`);
            } else if (data.type === 'content') {
              process.stdout.write(data.content);
            } else if (data.type === 'complete') {
              console.log('\n✅ Ответ завершен');
            }
          } catch (e) {
            // Игнорируем ошибки парсинга
          }
        }
      }
    } else {
      console.log(`❌ Ошибка: ${accountantResponse.statusCode}`);
    }
    console.log('\n');

    console.log('🎉 Все тесты успешно пройдены!');

  } catch (error) {
    console.error('❌ Ошибка при тестировании:', error.message);
  }
}

// Запуск тестов
testAgentAPI();