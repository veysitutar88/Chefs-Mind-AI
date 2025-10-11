import express from 'express';
import cors from 'cors';
import enhancedAgentRouter from './routes/enhanced-agent-chat.js';
import authGoogle, { sessionMiddleware } from './auth/google.js';

const app = express();
const PORT = process.env.PORT || 5002;

// Middleware
app.use(cors({ origin: ['http://localhost:3001'], credentials: true }));
app.use(express.json({ limit: '10mb' })); // Увеличенный лимит для медиа
app.use(sessionMiddleware); // New middleware for session management

// Authentication middleware
app.use(authGoogle);

// Logging middleware с дополнительной информацией
app.use((req, res, next) => {
  const start = Date.now();
  const { method, path } = req;
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${method} ${path} ${res.statusCode} - ${duration}ms`);
  });
  
  next();
});

// Routes
app.use('/api/enhanced-agent', enhancedAgentRouter);
app.use('/auth', authGoogle);

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
      'GET /api/enhanced-agent/agents': 'Get enhanced agents'
    }
  });
});

// Root endpoint с информацией о системе
app.get('/', (req, res) => {
  res.json({
    name: "Chef's Mind AI - Enhanced Version",
    version: '2.0.0',
    description: 'AI-powered restaurant management system with 5 specialized agents',
    agents: {
      orchestrator: 'Intelligent query routing',
      chef: 'Culinary expertise and recipes',
      accountant: 'Financial management with Google integration',
      researcher: 'Market research and data analysis',
      media: 'Image and video generation with multiple AI models',
      quality: 'Fact-checking and hallucination control'
    },
    features: [
      'LangGraph.js architecture',
      'Google MCP integration',
      'Multi-model media generation',
      'Prompt enhancement with GPT-5',
      '5-level hallucination protection',
      'Emergency fallback systems',
      'Real-time streaming',
      'Cross-model validation'
    ],
    endpoints: {
      'POST /api/enhanced-agent/chat': 'Enhanced chat with all agents',
      'GET /api/enhanced-agent/agents': 'Get all 5 agents info',
      'POST /api/enhanced-agent/test-google-mcp': 'Test Google services',
      'POST /api/enhanced-agent/test-media': 'Test media generation',
      'POST /api/enhanced-agent/test-fact-check': 'Test fact checking',
      'GET /api/health': 'System health status',
      'POST /api/media/image/generate': 'Generate image',
      'POST /api/media/video/generate': 'Generate video',
      'GET /api/media/video/status/:id': 'Check the status of a generated video'
    }
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('🚨 System Error:', err);
  
  // Emergency fallback response
  res.status(500).json({
    error: 'Internal Server Error',
    message: 'The system encountered an error and is using emergency protocols.',
    fallback: true,
    timestamp: new Date().toISOString()
  });
});

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
      'GET /api/media/video/status/:id'
    ]
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

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Chef's Mind AI Enhanced Server running on port ${PORT}`);
  console.log(`📖 API Documentation: http://localhost:${PORT}/`);
  console.log(`🤖 Enhanced Agent Chat: POST http://localhost:${PORT}/api/enhanced-agent/chat`);
  console.log(`📊 All Agents: GET http://localhost:${PORT}/api/enhanced-agent/agents`);
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