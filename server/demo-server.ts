import express from 'express';
import cors from 'cors';
import agentChatRouter from './routes/agent-chat.js';

const app = express();
const PORT = process.env.PORT || 5001; // Используем порт 5001

// Middleware
app.use(cors());
app.use(express.json());

// Logging middleware
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
app.use('/api/agent', agentChatRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    version: '1.0.0-demo',
    agents: ['chef', 'accountant'],
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Chef\'s Mind AI - Agent Architecture Demo',
    endpoints: {
      'POST /api/agent/chat': 'Chat with agents',
      'GET /api/agent/agents': 'Get available agents',
      'GET /api/health': 'Health check'
    }
  });
});

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Chef's Mind AI Demo Server running on port ${PORT}`);
  console.log(`📖 API Documentation: http://localhost:${PORT}/`);
  console.log(`🤖 Agent Chat: POST http://localhost:${PORT}/api/agent/chat`);
  console.log(`📊 Available Agents: GET http://localhost:${PORT}/api/agent/agents`);
});