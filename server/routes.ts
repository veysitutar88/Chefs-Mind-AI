import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer } from 'ws';
import { setupAuth } from "./auth";
import { storage } from "./storage";
import multer from "multer";
import path from "path";
import { processCSVFile, processXLSXFile } from "./services/fileProcessor";
import { validateSQL, executeReadOnlySQL } from "./services/sqlValidator";
import { analyzeWithGemini, generateWithGemini } from "./services/gemini";
import { generateWithOpenAI, analyzeWithGPT, enhancePromptForMediaGeneration } from "./services/openai";
import { analyzeWithPerplexity } from "./services/perplexity";
import { universalAskStream } from "./services/universal";
import { MODEL_REGISTRY, selectModelForQuery } from "./config/models";
import { insertMessageSchema, insertUploadSchema, insertChatSessionSchema, insertGeneratedContentSchema, insertAgentSettingsSchema, updateAgentSettingsSchema } from "@shared/schema";
import { pool } from "./db";
import { getAgentSystemPrompt } from "./utils/agentPrompts";
import { requireWriteConfirm } from "./middleware/safeMode";
import { getAvailableTables } from "./utils/tableCache";
import { generateMediaPrompt } from './lib/mediaPrompter';
import { generateImageImagen3, getJob } from './lib/mediaProviders';
import { STTStreamHandler, transcribeAudioBuffer, checkSTTHealth, normalizeMimeType } from './services/stt';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';

// Different storage configurations for different endpoints
const uploadToStorage = multer({ 
  dest: 'uploads/',
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB limit per file
    files: 5 // Max 5 files per request
  },
  fileFilter: (req, file, cb) => {
    // Allow only specific file types
    const allowedMimeTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf',
      'text/csv', 'application/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf', '.csv', '.xls', '.xlsx'];
    const fileExtension = path.extname(file.originalname).toLowerCase();
    
    if (allowedMimeTypes.includes(file.mimetype) && allowedExtensions.includes(fileExtension)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type. Allowed: images, PDF, CSV, Excel files. Received: ${file.mimetype}`));
    }
  }
}); // For file uploads that need persistence
const uploadToMemory = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB limit for audio files
    files: 1
  },
  fileFilter: (req, file, cb) => {
    // Allow audio files for transcription
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed for transcription'));
    }
  }
});

export function registerRoutes(app: Express): Server {
  // Setup authentication routes
  setupAuth(app);
  
  // Health check endpoint - no auth required (placed AFTER setupAuth)
  app.get("/api/health", async (req, res) => {
    try {
      const startTime = Date.now();
      
      // Get version from package.json
      const version = '1.0.0';
      
      // Check database connectivity
      let dbOk = false;
      try {
        await pool.query('SELECT 1');
        dbOk = true;
      } catch (error) {
        console.error('Health check DB error:', error);
      }
      
      // Check external services (API keys presence, not actual API calls)
      const ext = {
        openai: !!process.env.OPENAI_API_KEY,
        vertex: !!(process.env.GOOGLE_API_KEY || process.env.GOOGLE_CLOUD_PROJECT_ID),
        pplx: !!process.env.PERPLEXITY_API_KEY
      };
      
      const responseTime = Date.now() - startTime;
      
      res.json({
        ok: dbOk && ext.openai && ext.vertex && ext.pplx,
        version,
        uptime: process.uptime(),
        db: { ok: dbOk },
        ext,
        responseTime
      });
    } catch (error) {
      res.status(503).json({
        ok: false,
        error: 'Health check failed',
        uptime: process.uptime()
      });
    }
  });

  // STT Health check endpoint - no auth required
  app.get("/api/health/stt", async (req, res) => {
    try {
      const sttHealth = await checkSTTHealth();
      
      res.json({
        success: true,
        data: {
          ok: sttHealth.ok,
          provider: sttHealth.provider,
          error: sttHealth.error,
        },
        requestId: req.requestId
      });
    } catch (error) {
      res.status(503).json({
        success: false,
        error: 'STT health check failed',
        requestId: req.requestId
      });
    }
  });

  // Middleware to check authentication (supports both JWT and session)
  const requireAuth = (req: any, res: any, next: any) => {
    if (req.user || req.isAuthenticated()) {
      return next();
    }
    return res.status(401).json({ 
      success: false, 
      error: "Unauthorized",
      requestId: req.requestId 
    });
  };

  // Debug endpoint for SAFE_MODE status (temporary)
  app.get("/api/debug/safe-mode", requireAuth, (req, res) => {
    res.json({
      safe_mode: process.env.SAFE_MODE || "not set (defaults to 'on')",
      confirm_code_set: !!process.env.CONFIRM_CODE,
      confirm_code_length: process.env.CONFIRM_CODE?.length || 0,
      provided_header: req.header("x-confirm-code") || "not provided"
    });
  });

  // Database backup endpoint - requires auth and confirmation
  app.get("/api/db/backup", requireAuth, requireWriteConfirm, async (req, res) => {
    const execAsync = promisify(exec);
    let tempFilePath: string | null = null;

    try {
      console.log('📦 Database backup requested...');
      
      // Generate timestamp for backup filename
      const now = new Date();
      const timestamp = now.toISOString()
        .replace(/[-:]/g, '')
        .replace(/\.\d{3}Z/, '')
        .replace('T', '_');
      const filename = `backup_${timestamp}.dump`;
      tempFilePath = `/tmp/${filename}`;
      
      // Use pg_dump with environment variables from DATABASE_URL or PG* vars
      const pgHost = process.env.PGHOST || 'localhost';
      const pgPort = process.env.PGPORT || '5432';
      const pgDatabase = process.env.PGDATABASE || 'postgres';
      const pgUser = process.env.PGUSER || 'postgres';
      const pgPassword = process.env.PGPASSWORD || '';
      
      // Build pg_dump command with connection parameters
      const dumpCommand = `PGPASSWORD="${pgPassword}" pg_dump -h ${pgHost} -p ${pgPort} -U ${pgUser} -F c -f ${tempFilePath} ${pgDatabase}`;
      
      console.log(`📦 Running pg_dump to ${tempFilePath}...`);
      const { stdout, stderr } = await execAsync(dumpCommand);
      
      if (stderr && !stderr.includes('pg_dump:')) {
        console.warn('pg_dump stderr:', stderr);
      }
      
      console.log('✅ Database backup created successfully');
      
      // Send the file
      res.download(tempFilePath, filename, async (err) => {
        // Clean up temp file after download
        if (tempFilePath) {
          try {
            await fs.unlink(tempFilePath);
            console.log('🗑️  Temporary backup file deleted');
          } catch (cleanupError) {
            console.error('Failed to delete temp backup file:', cleanupError);
          }
        }
        
        if (err) {
          console.error('Error sending backup file:', err);
        }
      });
      
    } catch (error: any) {
      console.error('❌ Database backup failed:', error);
      
      // Clean up temp file on error
      if (tempFilePath) {
        try {
          await fs.unlink(tempFilePath);
        } catch {}
      }
      
      res.status(500).json({
        success: false,
        error: 'Database backup failed',
        detail: error.message,
        requestId: req.requestId
      });
    }
  });

  // Chat sessions
  app.post("/api/chat/sessions", requireAuth, requireWriteConfirm, async (req, res, next) => {
    try {
      const data = insertChatSessionSchema.parse(req.body);
      const session = await storage.createChatSession({
        ...data,
        userId: req.user!.id
      });
      res.json({ success: true, data: session, requestId: req.requestId });
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/chat/sessions", requireAuth, async (req, res, next) => {
    try {
      const sessions = await storage.getChatSessions(req.user!.id);
      res.json({ success: true, data: sessions, requestId: req.requestId });
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/chat/sessions/:id/messages", requireAuth, async (req, res, next) => {
    try {
      const messages = await storage.getMessages(req.params.id);
      res.json({ success: true, data: messages, requestId: req.requestId });
    } catch (error) {
      next(error);
    }
  });

  // Chat messages and AI processing
  app.post("/api/chat/messages", requireAuth, requireWriteConfirm, async (req, res, next) => {
    try {
      const data = insertMessageSchema.parse(req.body);
      
      // Save user message
      const userMessage = await storage.createMessage(data);
      
      // Determine which AI service to use based on agent type and content
      let aiResponse: string;
      let metadata: any = {};
      
      const session = await storage.getChatSession(data.sessionId!);
      if (!session) {
        return res.status(404).json({ 
          success: false, 
          error: "Session not found",
          requestId: req.requestId 
        });
      }

      try {
        // Debug: Log all request parameters
        console.log('🔍 Request body params:', { 
          aiModel: req.body.aiModel, 
          mediaType: req.body.mediaType, 
          agentType: session.agentType 
        });

        if (session.agentType === 'media-studio') {
          console.log('🎨 Media Studio - Two-Step Generation Process Started');
          console.log('Request params:', { mediaType: req.body.mediaType, model: req.body.model });
          
          // Handle media generation requests with two-step architecture
          if (req.body.mediaType === 'text') {
            // Direct text generation with GPT-5 (no prompt enhancement needed)
            console.log('📝 Step 1/1: Direct text generation with GPT-5');
            // Load custom system prompt for the agent
            const customPrompt = await getAgentSystemPrompt(req.user!.id, session.agentType);
            aiResponse = await analyzeWithGPT(data.content, session.agentType, customPrompt);
            metadata = { model: 'gpt-5', contentType: 'text' };
            
          } else if (req.body.mediaType === 'image') {
            console.log('🖼️ Step 1/2: Enhancing prompt for image generation');
            // Step 1: Enhance prompt using GPT-5 as prompt expert with custom Media Studio prompt
            const customPrompt = await getAgentSystemPrompt(req.user!.id, session.agentType);
            const enhancedPrompt = await enhancePromptForMediaGeneration(data.content, 'image', customPrompt);
            
            console.log('🎯 Step 2/2: Generating image with enhanced prompt');
            const model = req.body.model || 'imagen-3';
            let result;
            
            if (model === 'dall-e-3') {
              console.log('🤖 Using DALL-E 3 for image generation');
              result = await generateWithOpenAI(enhancedPrompt, 'image');
            } else {
              console.log('🎨 Using Imagen 3 for image generation');
              result = await generateWithGemini(enhancedPrompt, 'image');
            }
            
            // Save generated content with both original and enhanced prompts
            await storage.createGeneratedContent({
              userId: req.user!.id,
              type: 'image',
              prompt: data.content,
              model,
              url: result.url,
              metadata: {
                ...result.metadata,
                originalPrompt: data.content,
                enhancedPrompt: enhancedPrompt,
                twoStepProcess: true
              }
            });
            
            aiResponse = `✨ Изображение создано успешно с использованием ${model}\n\n` +
                        `📝 Ваш запрос: "${data.content}"\n` +
                        `🎯 Улучшенный промпт: "${enhancedPrompt}"\n\n` +
                        `🎨 Изображение сгенерировано с высококачественными деталями и профессиональным подходом.`;
            metadata = { 
              imageUrl: result.url, 
              model, 
              contentType: 'image',
              originalPrompt: data.content,
              enhancedPrompt: enhancedPrompt,
              twoStepProcess: true
            };
            
          } else if (req.body.mediaType === 'video') {
            console.log('🎥 Step 1/2: Enhancing prompt for video generation');
            // Step 1: Enhance prompt using GPT-5 as prompt expert with custom Media Studio prompt
            const customPrompt = await getAgentSystemPrompt(req.user!.id, session.agentType);
            const enhancedPrompt = await enhancePromptForMediaGeneration(data.content, 'video', customPrompt);
            
            console.log('🎬 Step 2/2: Generating video with enhanced prompt');
            const model = req.body.model || 'veo-3';
            const result = await generateWithGemini(enhancedPrompt, 'video');
            
            // Save generated content with both original and enhanced prompts
            await storage.createGeneratedContent({
              userId: req.user!.id,
              type: 'video',
              prompt: data.content,
              model,
              url: result.url,
              metadata: {
                ...result.metadata,
                originalPrompt: data.content,
                enhancedPrompt: enhancedPrompt,
                twoStepProcess: true
              }
            });
            
            aiResponse = `🎬 Видео создано успешно с использованием ${model}\n\n` +
                        `📝 Ваш запрос: "${data.content}"\n` +
                        `🎯 Улучшенный промпт: "${enhancedPrompt}"\n\n` +
                        `🎥 Видео генерируется с профессиональной кинематографией и вниманием к деталям.`;
            metadata = { 
              videoUrl: result.url, 
              model, 
              contentType: 'video',
              originalPrompt: data.content,
              enhancedPrompt: enhancedPrompt,
              twoStepProcess: true
            };
            
          } else {
            // Default to GPT-5 for text generation
            console.log('📝 Fallback: Default text generation with GPT-5');
            // Load custom system prompt for the agent
            const customPrompt = await getAgentSystemPrompt(req.user!.id, session.agentType);
            aiResponse = await analyzeWithGPT(data.content, session.agentType, customPrompt);
            metadata = { model: 'gpt-5', contentType: 'text' };
          }
          
          console.log('🎉 Media Studio - Two-Step Generation Process Completed');
        } else {
          // Helper: get default model for each agent
          const getDefaultModelForAgent = (agentType: string): string => {
            switch (agentType) {
              case 'universal': return 'auto';
              case 'accountant': return 'gemini-2.5-pro';
              case 'chef': return 'gpt-5';
              case 'analyst': return 'perplexity';
              default: return 'gpt-5';
            }
          };

          // Handle regular agents with AI model selection
          const selectedModel = req.body.aiModel || getDefaultModelForAgent(session.agentType);
          
          console.log(`🤖 ${session.agentType} agent using model: ${selectedModel}`);
          
          if (selectedModel === 'auto') {
            // Universal agent with automatic routing
            if (session.agentType === 'universal') {
              // Use Gemini for analytical tasks, GPT-5 for creative tasks
              const isAnalytical = /\b(анализ|данные|таблица|статистика|график|отчет|sql|query)\b/i.test(data.content);
              if (isAnalytical) {
                // Load custom system prompt for the agent
                const customPrompt = await getAgentSystemPrompt(req.user!.id, session.agentType);
                const result = await analyzeWithGemini(data.content, session.agentType, undefined, 'gemini-2.5-flash', customPrompt);
                aiResponse = result.response;
                metadata = { ...result.metadata, autoRouted: 'gemini-2.5-flash' };
              } else {
                // Load custom system prompt for the agent
                const customPrompt = await getAgentSystemPrompt(req.user!.id, session.agentType);
                aiResponse = await analyzeWithGPT(data.content, session.agentType, customPrompt);
                metadata = { model: 'gpt-5', autoRouted: 'gpt' };
              }
            } else {
              // Fallback to GPT-5
              // Load custom system prompt for the agent
              const customPrompt = await getAgentSystemPrompt(req.user!.id, session.agentType);
              aiResponse = await analyzeWithGPT(data.content, session.agentType, customPrompt);
              metadata = { model: 'gpt-5' };
            }
          } else if (selectedModel === 'gemini-2.5-pro' || selectedModel === 'gemini-2.5-flash') {
            // Use Gemini 2.5 Pro or Flash
            console.log(`🔵 Calling analyzeWithGemini with ${selectedModel}...`);
            
            // Special handling for accountant: provide available tables
            let availableTables;
            if (session.agentType === 'accountant') {
              const tablesQuery = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE' AND (table_name LIKE 'imported_%' OR table_name IN ('ingredients', 'recipes', 'invoices'))");
              availableTables = tablesQuery.rows.map(row => row.table_name);
            }
            
            // Load custom system prompt for the agent
            const customPrompt = await getAgentSystemPrompt(req.user!.id, session.agentType);
            
            const result = await analyzeWithGemini(data.content, session.agentType, availableTables, selectedModel, customPrompt);
            aiResponse = result.response;
            metadata = result.metadata;
            
            // If SQL query is generated for accountant, validate and execute it
            if (session.agentType === 'accountant' && result.metadata?.sqlQuery) {
              console.log('Generated SQL Query:', result.metadata.sqlQuery);
              const validationResult = validateSQL(result.metadata.sqlQuery);
              console.log('SQL Validation Result:', validationResult);
              if (!validationResult.isValid) {
                throw new Error(`SQL Validation Error: ${validationResult.error}`);
              }
              
              try {
                const queryResults = await executeReadOnlySQL(result.metadata.sqlQuery);
                metadata.queryResults = queryResults;
                metadata.debugSql = validationResult.sanitizedQuery || result.metadata.sqlQuery;
              } catch (sqlError) {
                const sqlErrorMessage = sqlError instanceof Error ? sqlError.message : 'SQL execution error';
                metadata.sqlError = sqlErrorMessage;
              }
            }
            
            console.log('🔵 Gemini response metadata:', JSON.stringify(metadata, null, 2));
          } else if (selectedModel === 'gpt-5') {
            // Use GPT-5
            // Load custom system prompt for the agent
            const customPrompt = await getAgentSystemPrompt(req.user!.id, session.agentType);
            aiResponse = await analyzeWithGPT(data.content, session.agentType, customPrompt);
            metadata = { model: 'gpt-5' };
          } else if (selectedModel === 'perplexity') {
            // Use Perplexity (mainly for analyst)
            try {
              // Load custom system prompt for the agent
              const customPrompt = await getAgentSystemPrompt(req.user!.id, session.agentType);
              const result = await analyzeWithPerplexity(data.content, session.agentType, customPrompt);
              aiResponse = result.response;
              metadata = result.metadata;
            } catch (perplexityError) {
              console.error('Perplexity failed, falling back to GPT-5:', perplexityError);
              // Load custom system prompt for the agent
              const customPrompt = await getAgentSystemPrompt(req.user!.id, session.agentType);
              aiResponse = await analyzeWithGPT(data.content, session.agentType, customPrompt);
              metadata = { model: 'gpt-5-fallback', error: 'Perplexity API unavailable' };
            }
          } else {
            // Default to GPT-5 for unknown models
            // Load custom system prompt for the agent
            const customPrompt = await getAgentSystemPrompt(req.user!.id, session.agentType);
            aiResponse = await analyzeWithGPT(data.content, session.agentType, customPrompt);
            metadata = { model: 'gpt-5', note: `Unknown model ${selectedModel}, using GPT-5` };
          }
        }
      } catch (aiError) {
        const aiErrorMessage = aiError instanceof Error ? aiError.message : 'Unknown error';
        aiResponse = `Ошибка при обработке запроса: ${aiErrorMessage}`;
        metadata = { error: aiErrorMessage };
      }

      // Save AI response
      const assistantMessage = await storage.createMessage({
        sessionId: data.sessionId!,
        role: 'assistant',
        content: aiResponse,
        metadata
      });

      res.json({
        success: true,
        data: {
          userMessage,
          assistantMessage
        },
        requestId: req.requestId
      });
    } catch (error) {
      next(error);
    }
  });

  // File upload and processing
  // STT: One-shot transcription endpoint (REST)
  app.post("/api/stt/once", requireAuth, uploadToMemory.single('audio'), async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ 
          success: false, 
          error: "No audio file provided",
          requestId: req.requestId 
        });
      }

      console.log('🎙️ STT: One-shot transcription with OpenAI Whisper...');
      const startTime = Date.now();
      
      const language = req.body.language || 'ru';
      const normalizedMimeType = normalizeMimeType(req.file.mimetype);
      
      const text = await transcribeAudioBuffer(
        req.file.buffer,
        normalizedMimeType,
        language
      );

      const duration = Date.now() - startTime;
      console.log(`✅ STT: Transcription successful in ${duration}ms`);

      res.json({ 
        success: true, 
        data: { 
          text,
          metrics: {
            duration_ms: duration,
            audio_size_bytes: req.file.size
          }
        },
        requestId: req.requestId 
      });
    } catch (error) {
      console.error('STT transcription error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ 
        success: false, 
        error: `Transcription failed: ${errorMessage}`,
        requestId: req.requestId 
      });
    }
  });

  // Legacy Whisper transcription endpoint (for backward compatibility)
  app.post("/api/transcribe", requireAuth, requireWriteConfirm, uploadToMemory.single('audio'), async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ 
          success: false, 
          error: "No audio file provided",
          requestId: req.requestId 
        });
      }

      console.log('🎙️ Transcribing audio with OpenAI Whisper (legacy)...');
      const startTime = Date.now();
      
      const language = req.body.language || 'ru';
      const normalizedMimeType = normalizeMimeType(req.file.mimetype);
      
      const text = await transcribeAudioBuffer(
        req.file.buffer,
        normalizedMimeType,
        language
      );

      const duration = Date.now() - startTime;
      console.log(`✅ Transcription successful in ${duration}ms:`, text);

      res.json({ 
        success: true, 
        data: { text },
        requestId: req.requestId 
      });
    } catch (error) {
      console.error('Transcription error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ 
        success: false, 
        error: `Transcription failed: ${errorMessage}`,
        requestId: req.requestId 
      });
    }
  });

  app.post("/api/upload", requireAuth, requireWriteConfirm, (req, res, next: any) => {
    uploadToStorage.single('file')(req, res, (err) => {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ 
            success: false, 
            error: 'File too large. Maximum size is 20MB.',
            requestId: req.requestId 
          });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
          return res.status(400).json({ 
            success: false, 
            error: 'Too many files. Maximum 5 files allowed.',
            requestId: req.requestId 
          });
        }
        if (err.message.includes('Invalid file type')) {
          return res.status(400).json({ 
            success: false, 
            error: err.message,
            requestId: req.requestId 
          });
        }
        return res.status(400).json({ 
          success: false, 
          error: 'File upload failed: ' + err.message,
          requestId: req.requestId 
        });
      }
      next();
    });
  }, async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ 
          success: false, 
          error: "No file uploaded",
          requestId: req.requestId 
        });
      }

      const uploadData = {
        userId: req.user!.id,
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size.toString()
      };

      const uploadRecord = await storage.createUpload(uploadData);

      // Process file based on type
      let tableName: string;
      if (req.file.mimetype === 'text/csv') {
        tableName = await processCSVFile(req.file.path, req.file.originalname);
      } else if (req.file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        tableName = await processXLSXFile(req.file.path, req.file.originalname);
      } else {
        return res.status(400).json({ 
          success: false, 
          error: "Unsupported file type. Only CSV and XLSX files are supported.",
          requestId: req.requestId 
        });
      }

      // Update upload record with table name
      await storage.updateUpload(uploadRecord.id, {
        tableName,
        processed: true
      });

      res.json({
        success: true,
        data: {
          ...uploadRecord,
          tableName,
          processed: true
        },
        requestId: req.requestId
      });
    } catch (error) {
      next(error);
    }
  });

  // Get uploads
  app.get("/api/uploads", requireAuth, async (req, res, next) => {
    try {
      const uploads = await storage.getUploads(req.user!.id);
      res.json({
        success: true,
        data: uploads,
        requestId: req.requestId
      });
    } catch (error) {
      next(error);
    }
  });

  // Get single upload by ID
  app.get("/api/uploads/:id", requireAuth, async (req, res, next) => {
    try {
      const upload = await storage.getUpload(req.params.id);
      if (!upload) {
        return res.status(404).json({ 
          success: false, 
          error: "Upload not found",
          requestId: req.requestId 
        });
      }
      
      // Ensure user owns the upload
      if (upload.userId !== req.user!.id) {
        return res.status(403).json({ 
          success: false, 
          error: "Access denied",
          requestId: req.requestId 
        });
      }
      
      res.json({
        success: true,
        data: upload,
        requestId: req.requestId
      });
    } catch (error) {
      next(error);
    }
  });

  // Get generated content
  app.get("/api/generated-content", requireAuth, async (req, res, next) => {
    try {
      const content = await storage.getGeneratedContent(req.user!.id);
      res.json({
        success: true,
        data: content,
        requestId: req.requestId
      });
    } catch (error) {
      next(error);
    }
  });

  // SQL validation endpoint
  app.post("/api/validate-sql", requireAuth, async (req, res, next) => {
    try {
      const { query } = req.body;
      const result = validateSQL(query);
      res.json({
        success: true,
        data: result,
        requestId: req.requestId
      });
    } catch (error) {
      next(error);
    }
  });

  // Agent settings endpoints
  app.get("/api/agent-settings", requireAuth, async (req, res, next) => {
    try {
      const settings = await storage.getAgentSettings(req.user!.id);
      res.json({
        success: true,
        data: settings,
        requestId: req.requestId
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/agent-settings", requireAuth, requireWriteConfirm, async (req, res, next) => {
    try {
      const data = insertAgentSettingsSchema.parse(req.body);
      const settings = await storage.createAgentSettings({
        ...data,
        userId: req.user!.id
      });
      res.json({
        success: true,
        data: settings,
        requestId: req.requestId
      });
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/agent-settings/:id", requireAuth, requireWriteConfirm, async (req, res, next) => {
    try {
      // First, verify that the agent settings belong to the current user
      const existingSettings = await storage.getAgentSettingsById(req.params.id, req.user!.id);
      if (!existingSettings) {
        return res.status(404).json({ 
          success: false, 
          error: "Agent settings not found",
          requestId: req.requestId 
        });
      }

      const data = updateAgentSettingsSchema.parse(req.body);
      const settings = await storage.updateAgentSettings(req.params.id, data);
      if (!settings) {
        return res.status(404).json({ 
          success: false, 
          error: "Failed to update agent settings",
          requestId: req.requestId 
        });
      }
      res.json({
        success: true,
        data: settings,
        requestId: req.requestId
      });
    } catch (error) {
      next(error);
    }
  });

  // Media Prompter - AI-powered prompt enhancement (no DB write, fast response)
  app.post("/api/media/prompter", requireAuth, async (req, res, next) => {
    try {
      const { goal, promptDraft, refs, style, aspect, durationSec } = req.body;
      
      if (!goal || !promptDraft) {
        return res.status(400).json({
          success: false,
          error: "Missing required fields: goal, promptDraft",
          requestId: req.requestId
        });
      }

      const validGoals = ['image', 'video', 'video-from-image'];
      if (!validGoals.includes(goal)) {
        return res.status(400).json({
          success: false,
          error: `Invalid goal. Must be one of: ${validGoals.join(', ')}`,
          requestId: req.requestId
        });
      }

      const { generateMediaPrompt } = await import('./lib/mediaPrompter');
      const result = await generateMediaPrompt({
        goal,
        promptDraft,
        refs,
        style,
        aspect,
        durationSec
      });

      res.json({
        success: true,
        prompt: result.prompt,
        negativePrompt: result.negativePrompt,
        modelHints: result.modelHints,
        requestId: req.requestId
      });
    } catch (error) {
      next(error);
    }
  });

  // Image generation endpoint
  app.post("/api/media/image/generate", requireAuth, async (req, res, next) => {
    try {
      const { prompt, negativePrompt, aspect, modelHints } = req.body;
      
      if (!prompt) {
        return res.status(400).json({
          success: false,
          error: "Missing required field: prompt",
          requestId: req.requestId
        });
      }

      const { generateImageImagen3, saveJobToDatabase } = await import('./lib/mediaProviders');
      const job = await generateImageImagen3({
        prompt,
        negativePrompt,
        aspect,
        modelHints
      });

      // Optionally save to DB if SAFE_MODE confirmation provided
      const confirmCode = req.headers['x-confirm-code'] as string;
      if (confirmCode) {
        await saveJobToDatabase(job, confirmCode);
      }

      res.json({
        success: true,
        jobId: job.id,
        provider: job.provider,
        etaSec: 10, // Estimated time
        requestId: req.requestId
      });
    } catch (error) {
      next(error);
    }
  });

  // Video generation endpoint (stub - returns 501)
  app.post("/api/media/video/generate", requireAuth, async (req, res, next) => {
    try {
      return res.status(501).json({
        success: false,
        error: "Video provider unavailable",
        detail: "Veo-3 is not configured. To enable, set up Google Veo API credentials.",
        requestId: req.requestId
      });
    } catch (error) {
      next(error);
    }
  });

  // Video from image endpoint (stub - returns 501)
  app.post("/api/media/video/from-image", requireAuth, async (req, res, next) => {
    try {
      return res.status(501).json({
        success: false,
        error: "Video provider unavailable",
        detail: "Veo-3 is not configured. To enable, set up Google Veo API credentials.",
        requestId: req.requestId
      });
    } catch (error) {
      next(error);
    }
  });

  // Job status endpoint
  app.get("/api/media/job/:id", requireAuth, async (req, res, next) => {
    try {
      const job = getJob(req.params.id);
      
      if (!job) {
        return res.status(404).json({
          success: false,
          error: "Job not found",
          requestId: req.requestId
        });
      }

      res.json({
        success: true,
        status: job.status,
        url: job.resultUrl,
        error: job.error,
        provider: job.provider,
        requestId: req.requestId
      });
    } catch (error) {
      next(error);
    }
  });

  // Universal Ask endpoint - unified dispatcher for all agent roles
  // Note: Temporarily removed requireWriteConfirm for latency testing
  app.post("/api/universal-ask", requireAuth, async (req, res, next) => {
    try {
      const { role, query, context } = req.body;
      
      if (!role || !query) {
        return res.status(400).json({ 
          success: false, 
          error: "Missing required fields: role, query",
          requestId: req.requestId 
        });
      }

      const validRoles = ['Chef', 'Accountant', 'Media', 'Research'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ 
          success: false, 
          error: `Invalid role. Must be one of: ${validRoles.join(', ')}`,
          requestId: req.requestId 
        });
      }

      let response: any = {};

      switch (role) {
        case 'Chef': {
          // Chef role: Use GPT-5, check for visual_brief in context
          if (context?.visual_brief) {
            // Redirect to Media generation (image)
            console.log('🍳 Chef detected visual_brief, redirecting to Media generation');
            const customPrompt = await getAgentSystemPrompt(req.user!.id, 'media-studio');
            const enhancedPrompt = await enhancePromptForMediaGeneration(query, 'image', customPrompt);
            const result = await generateWithGemini(enhancedPrompt, 'image');
            
            response = {
              role: 'Chef→Media',
              type: 'image',
              url: result.url,
              prompt: query,
              enhancedPrompt,
              metadata: result.metadata
            };
          } else {
            // Standard Chef text response via GPT-5
            console.log('🍳 Chef text response via GPT-5');
            const customPrompt = await getAgentSystemPrompt(req.user!.id, 'chef');
            const aiResponse = await analyzeWithGPT(query, 'chef', customPrompt);
            
            response = {
              role: 'Chef',
              type: 'text',
              answer: aiResponse,
              model: 'gpt-5'
            };
          }
          break;
        }

        case 'Accountant': {
          // Accountant: Gemini generates SELECT, validate, execute on RO-DB, return markdown + debug.sql
          console.log('💰 Accountant SQL generation via Gemini');
          
          // Get available tables for context (cached)
          const availableTables = await getAvailableTables();
          
          const customPrompt = await getAgentSystemPrompt(req.user!.id, 'accountant');
          const geminiResult = await analyzeWithGemini(
            query, 
            'accountant', 
            availableTables, 
            'gemini-2.5-pro',
            customPrompt
          );
          
          let queryResults: any[] = [];
          let debugSql = '';
          let sqlError = null;

          if (geminiResult.metadata?.sqlQuery) {
            const sqlQuery = geminiResult.metadata.sqlQuery;
            debugSql = sqlQuery;
            
            const validationResult = validateSQL(sqlQuery);
            if (!validationResult.isValid) {
              sqlError = `SQL Validation Error: ${validationResult.error}`;
            } else {
              try {
                queryResults = await executeReadOnlySQL(validationResult.sanitizedQuery || sqlQuery);
                debugSql = validationResult.sanitizedQuery || sqlQuery;
              } catch (execError) {
                sqlError = execError instanceof Error ? execError.message : 'SQL execution error';
              }
            }
          }

          // Format as markdown
          let markdownResponse = `## 💰 Accountant Analysis\n\n${geminiResult.response}\n\n`;
          
          if (queryResults.length > 0) {
            markdownResponse += `### Query Results (${queryResults.length} rows)\n\n`;
            markdownResponse += '```json\n' + JSON.stringify(queryResults, null, 2) + '\n```\n\n';
          }
          
          if (sqlError) {
            markdownResponse += `### ⚠️ SQL Error\n\n${sqlError}\n\n`;
          }

          response = {
            role: 'Accountant',
            type: 'sql_analysis',
            markdown: markdownResponse,
            debug_sql: debugSql,
            results: queryResults,
            error: sqlError,
            metadata: geminiResult.metadata
          };
          break;
        }

        case 'Media': {
          // Media: Use new media prompter + generation pipeline
          const goal = context?.goal || 'image'; // 'image' | 'video' | 'video-from-image'
          
          console.log(`🎨 Media generation: ${goal}`);
          
          // Step 1: Generate enhanced prompt via media prompter
          const prompterResult = await generateMediaPrompt({
            goal: goal as 'image' | 'video' | 'video-from-image',
            promptDraft: query,
            refs: context?.refs,
            style: context?.style,
            aspect: context?.aspect,
            durationSec: context?.durationSec
          });
          
          // Step 2: Route to appropriate provider
          if (goal === 'video' || goal === 'video-from-image') {
            return res.status(501).json({ 
              success: false,
              error: "Video provider unavailable",
              detail: "Veo-3 is not configured. To enable, set up Google Veo API credentials.",
              promptPreview: prompterResult.prompt,
              requestId: req.requestId
            });
          }
          
          // Step 3: Generate image via Imagen-3
          const job = await generateImageImagen3({
            prompt: prompterResult.prompt,
            negativePrompt: prompterResult.negativePrompt,
            aspect: prompterResult.modelHints.aspect,
            modelHints: prompterResult.modelHints
          });

          response = {
            role: 'Media',
            intent: 'media.generate',
            routedTo: '/api/media/image/generate',
            jobId: job.id,
            promptPreview: prompterResult.prompt,
            provider: job.provider,
            etaSec: 10,
            modelHints: prompterResult.modelHints
          };
          break;
        }

        case 'Research': {
          // Research: Perplexity query → brief summary + reference metadata
          console.log('🔍 Research via Perplexity');
          const customPrompt = await getAgentSystemPrompt(req.user!.id, 'analyst');
          const perplexityResult = await analyzeWithPerplexity(query, 'analyst', customPrompt);
          
          response = {
            role: 'Research',
            type: 'research',
            summary: perplexityResult.response,
            metadata: perplexityResult.metadata,
            citations: perplexityResult.metadata?.citations || [],
            model: 'perplexity-sonar'
          };
          break;
        }
      }

      res.json({
        success: true,
        data: response,
        timestamp: new Date().toISOString(),
        requestId: req.requestId
      });

    } catch (error) {
      next(error);
    }
  });

  // Model registry endpoints
  app.get("/api/models", requireAuth, async (req, res) => {
    res.json({
      success: true,
      data: Object.values(MODEL_REGISTRY),
      requestId: req.requestId
    });
  });

  app.post("/api/models/select", requireAuth, async (req, res) => {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({
        success: false,
        error: "Query is required",
        requestId: req.requestId
      });
    }

    const selectedModel = selectModelForQuery(query);
    const modelConfig = MODEL_REGISTRY[selectedModel];

    res.json({
      success: true,
      data: {
        selectedModel,
        config: modelConfig,
        reasoning: `Selected based on query complexity analysis`
      },
      requestId: req.requestId
    });
  });

  // Streaming Universal Ask endpoint
  app.post("/api/ask/stream", requireAuth, async (req, res, next) => {
    try {
      const { query, model, systemPrompt } = req.body;
      
      if (!query) {
        return res.status(400).json({ 
          success: false, 
          error: "Query is required",
          requestId: req.requestId 
        });
      }

      // Set headers for Server-Sent Events
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.flushHeaders();

      const startTime = Date.now();
      let usedModel = '';

      try {
        for await (const chunk of universalAskStream({ 
          query, 
          model: model || 'auto',
          systemPrompt 
        })) {
          if (chunk.model) {
            usedModel = chunk.model;
          }

          if (chunk.done) {
            const latency = Date.now() - startTime;
            res.write(`data: ${JSON.stringify({ 
              done: true, 
              model: usedModel,
              latency
            })}\n\n`);
            res.end();
            console.log(`✅ Stream completed: model=${usedModel}, latency=${latency}ms`);
            break;
          } else {
            res.write(`data: ${JSON.stringify({ content: chunk.content })}\n\n`);
          }
        }
      } catch (streamError) {
        console.error('Stream error:', streamError);
        res.write(`data: ${JSON.stringify({ 
          error: streamError instanceof Error ? streamError.message : 'Stream error' 
        })}\n\n`);
        res.end();
      }

    } catch (error) {
      next(error);
    }
  });

  const httpServer = createServer(app);
  
  // Setup WebSocket server for STT streaming
  const wss = new WebSocketServer({ 
    server: httpServer,
    path: '/ws/stt'
  });

  wss.on('connection', (ws, req) => {
    console.log('🎙️ STT WebSocket connection established');
    
    const handler = new STTStreamHandler(ws);
    let partialTimer: NodeJS.Timeout | null = null;
    let isFinalized = false;

    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());

        switch (message.type) {
          case 'config':
            // Set language and MIME type configuration with validation
            const language = message.language || 'ru';
            const mimeType = message.mimeType || 'audio/webm';
            
            // Validate MIME type (allow codec suffixes, they will be normalized)
            const baseMimeType = mimeType.split(';')[0].trim();
            const validBaseMimeTypes = ['audio/webm', 'audio/ogg', 'audio/mp4', 'audio/wav', 'audio/mpeg', 'audio/m4a', 'audio/x-m4a'];
            
            if (!validBaseMimeTypes.includes(baseMimeType)) {
              ws.send(JSON.stringify({
                success: false,
                error: `Invalid MIME type: ${baseMimeType}. Supported: ${validBaseMimeTypes.join(', ')}`,
                requestId: `config-error-${Date.now()}`
              }));
              break;
            }
            
            handler.setLanguage(language);
            handler.setMimeType(normalizeMimeType(mimeType)); // Normalize before storing
            
            ws.send(JSON.stringify({
              success: true,
              data: { 
                configured: true, 
                language,
                mimeType
              },
              requestId: `config-${Date.now()}`
            }));
            break;

          case 'audio':
            // Receive audio chunk
            if (message.data) {
              const audioBuffer = Buffer.from(message.data, 'base64');
              handler.addAudioChunk(audioBuffer);

              // Process partial results periodically (every 2 seconds)
              if (!partialTimer) {
                partialTimer = setInterval(() => {
                  handler.processPartial().catch(console.error);
                }, 2000);
              }
            }
            break;

          case 'finalize':
            // Finalize and get final transcription
            if (partialTimer) {
              clearInterval(partialTimer);
              partialTimer = null;
            }
            
            if (!isFinalized) {
              isFinalized = true;
              await handler.finalize();
            }
            break;

          default:
            ws.send(JSON.stringify({
              success: false,
              error: `Unknown message type: ${message.type}`,
              requestId: `error-${Date.now()}`
            }));
        }
      } catch (error) {
        console.error('STT WebSocket message error:', error);
        ws.send(JSON.stringify({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          requestId: `error-${Date.now()}`
        }));
      }
    });

    ws.on('close', () => {
      console.log('🎙️ STT WebSocket connection closed');
      if (partialTimer) {
        clearInterval(partialTimer);
      }
      handler.close();
    });

    ws.on('error', (error) => {
      console.error('STT WebSocket error:', error);
      if (partialTimer) {
        clearInterval(partialTimer);
      }
      handler.close();
    });

    // Send initial connection success message
    ws.send(JSON.stringify({
      success: true,
      data: { 
        connected: true,
        message: 'STT WebSocket ready. Send audio chunks with type="audio"'
      },
      requestId: `connect-${Date.now()}`
    }));
  });

  console.log('✅ WebSocket STT server ready at /ws/stt');
  
  return httpServer;
}
