// Load environment variables first so LLM clients pick up API keys at init time
import { config as loadEnv } from 'dotenv';
loadEnv();                               // reads .env
loadEnv({ path: '.env.local', override: true }); // reads .env.local (real keys override dummies)

import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import enhancedAgentRouter from './routes/enhanced-agent-chat.js';
import modelsRouter from './routes/models.js';
import mediaRouter from './routes/media.js';
import searchRouter from './routes/search.js';
import toolsRouter from './routes/tools.js';
import sidebarAdvancedRouter from './routes/sidebar-advanced.js';
import followupsDebugRouter from './routes/followups-debug.js';

const app = express();
const server = http.createServer(app); // Создаем HTTP сервер
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3001',
    methods: ['GET', 'POST'],
  },
});

const PORT = process.env.PORT || 5002;

// Middleware
app.use(cors({ origin: ['http://localhost:3001'], credentials: true }));
app.use(express.json({ limit: '10mb' })); // Увеличенный лимит для медиа

// Routes
app.use('/api/enhanced-agent', enhancedAgentRouter);
app.use('/api/models', modelsRouter);
app.use('/api/media', mediaRouter);
app.use('/api/search', searchRouter);
app.use('/api/tools', toolsRouter);
app.use('/api/sidebar', sidebarAdvancedRouter);
app.use('/api/followups/debug', followupsDebugRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    version: '2.0.0-enhanced',
    timestamp: new Date().toISOString(),
    routes: {
      'GET /': 'Root endpoint',
      'GET /api/health': 'Health check',
      'POST /api/enhanced-agent/chat': 'Enhanced agent chat',
      'GET /api/enhanced-agent/agents': 'Get enhanced agents',
    },
  });
});

// Root endpoint с информацией о системе
app.get('/', (req, res) => {
  res.json({
    name: "Chef's Mind AI - Enhanced Version",
    version: '2.0.0',
    description:
      'AI-powered restaurant management system with 5 specialized agents',
    agents: {
      orchestrator: 'Intelligent query routing',
      chef: 'Culinary expertise and recipes',
      accountant: 'Financial management with Google integration',
      researcher: 'Market research and data analysis',
      media: 'Image and video generation with multiple AI models',
      quality: 'Fact-checking and hallucination control',
    },
    features: [
      'LangGraph.js architecture',
      'Google MCP integration',
      'Multi-model media generation',
      'Prompt enhancement with GPT-5',
      '5-level hallucination protection',
      'Emergency fallback systems',
      'Real-time streaming',
      'Cross-model validation',
    ],
    endpoints: {
      'POST /api/enhanced-agent/chat': 'Enhanced chat with all agents',
      'GET /api/enhanced-agent/agents': 'Get all 5 agents info',
      'POST /api/media/image/generate': 'Generate image',
      'POST /api/media/video/generate': 'Generate video',
      'GET /api/media/video/status/:id':
        'Check the status of a generated video',
    },
  });
});

// Error handling middleware
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error('🚨 System Error:', err);

    // Emergency fallback response
    res.status(500).json({
      error: 'Internal Server Error',
      message:
        'The system encountered an error and is using emergency protocols.',
      fallback: true,
      timestamp: new Date().toISOString(),
    });
  }
);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
    availableEndpoints: [
      'GET /',
      'GET /api/health',
      'POST /api/enhanced-agent/chat',
      'GET /api/enhanced-agent/agents',
      'POST /api/media/image/generate',
      'POST /api/media/video/generate',
      'GET /api/media/video/status/:id',
    ],
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  process.exit(0);
});

// WebSocket обработчики
io.on('connection', socket => {
  console.log('Пользователь подключился:', socket.id);

  // Отправляем приветственное сообщение при подключении
  socket.emit('welcome', {
    message: "Добро пожаловать в Chef's Mind AI WebSocket!",
  });

  // Обработчик события chat_message
  socket.on('chat_message', data => {
    console.log('Получено сообщение:', data);

    // Эмулируем ответ агента
    const response = {
      id: Date.now(),
      text: `Это эмуляция ответа агента на ваше сообщение: "${data.text}"`,
      timestamp: new Date().toISOString(),
    };

    // Отправляем ответ обратно клиенту
    socket.emit('agent_response', response);
  });

  // Обработчик отключения
  socket.on('disconnect', () => {
    console.log('Пользователь отключился:', socket.id);
  });
});

// Start server
server.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`🚀 Chef's Mind AI Enhanced Server running on port ${PORT}`);
  console.log(`📖 API Documentation: http://localhost:${PORT}/`);
  console.log(
    `🤖 Enhanced Agent Chat: POST http://localhost:${PORT}/api/enhanced-agent/chat`
  );
  console.log(
    `📊 All Agents: GET http://localhost:${PORT}/api/enhanced-agent/agents`
  );
  console.log(`🏥 Health Check: GET http://localhost:${PORT}/api/health`);
  console.log('\n🎯 Enhanced Features Active:');
  console.log('   ✅ 5 Specialized Agents');
  console.log('   ✅ Google MCP Integration');
  console.log('   ✅ Multi-Model Media Generation');
  console.log('   ✅ 5-Level Hallucination Protection');
  console.log('   ✅ Prompt Enhancement');
  console.log('   ✅ Emergency Fallback Systems');
  console.log('   ✅ Cross-Model Validation');
  console.log('   ✅ Real-time Streaming');
});

export default app;
