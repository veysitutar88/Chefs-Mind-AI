import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import multer from "multer";
import path from "path";
import { processCSVFile, processXLSXFile } from "./services/fileProcessor";
import { validateSQL, executeReadOnlySQL } from "./services/sqlValidator";
import { analyzeWithGemini, generateWithGemini } from "./services/gemini";
import { generateWithOpenAI, analyzeWithGPT, enhancePromptForMediaGeneration } from "./services/openai";
import { analyzeWithPerplexity } from "./services/perplexity";
import { insertMessageSchema, insertUploadSchema, insertChatSessionSchema, insertGeneratedContentSchema, insertAgentSettingsSchema, updateAgentSettingsSchema } from "@shared/schema";
import { pool } from "./db";
import { getAgentSystemPrompt } from "./utils/agentPrompts";

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
      cb(new Error(`Invalid file type. Allowed: images, PDF, CSV, Excel files. Received: ${file.mimetype}`), false);
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
      cb(new Error('Only audio files are allowed for transcription'), false);
    }
  }
});

export function registerRoutes(app: Express): Server {
  // Setup authentication routes
  setupAuth(app);

  // Middleware to check authentication
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  };

  // Chat sessions
  app.post("/api/chat/sessions", requireAuth, async (req, res) => {
    try {
      const data = insertChatSessionSchema.parse(req.body);
      const session = await storage.createChatSession({
        ...data,
        userId: req.user!.id
      });
      res.json(session);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(400).json({ message: errorMessage });
    }
  });

  app.get("/api/chat/sessions", requireAuth, async (req, res) => {
    try {
      const sessions = await storage.getChatSessions(req.user.id);
      res.json(sessions);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ message: errorMessage });
    }
  });

  app.get("/api/chat/sessions/:id/messages", requireAuth, async (req, res) => {
    try {
      const messages = await storage.getMessages(req.params.id);
      res.json(messages);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ message: errorMessage });
    }
  });

  // Chat messages and AI processing
  app.post("/api/chat/messages", requireAuth, async (req, res) => {
    try {
      const data = insertMessageSchema.parse(req.body);
      
      // Save user message
      const userMessage = await storage.createMessage(data);
      
      // Determine which AI service to use based on agent type and content
      let aiResponse: string;
      let metadata: any = {};
      
      const session = await storage.getChatSession(data.sessionId!);
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
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

        // Helper function to get default model for each agent
        function getDefaultModelForAgent(agentType: string): string {
          switch (agentType) {
            case 'universal': return 'auto';
            case 'accountant': return 'gemini-2.5-pro';
            case 'chef': return 'gpt-5';
            case 'analyst': return 'perplexity';
            default: return 'gpt-5';
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
        userMessage,
        assistantMessage
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(400).json({ message: errorMessage });
    }
  });

  // File upload and processing
  // Whisper transcription endpoint
  app.post("/api/transcribe", requireAuth, uploadToMemory.single('audio'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No audio file provided" });
      }

      console.log('🎙️ Transcribing audio with OpenAI Whisper...');
      
      // Use OpenAI Whisper API for transcription
      const formData = new FormData();
      const audioBlob = new Blob([req.file.buffer], { type: req.file.mimetype });
      formData.append('file', audioBlob, req.file.originalname || 'audio.wav');
      formData.append('model', 'whisper-1');
      formData.append('language', 'ru'); // Russian language for better accuracy

      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenAI Whisper API error:', errorText);
        throw new Error(`Whisper API error: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Transcription successful:', result.text);

      res.json({ text: result.text });
    } catch (error) {
      console.error('Transcription error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ message: `Transcription failed: ${errorMessage}` });
    }
  });

  app.post("/api/upload", requireAuth, (req, res, next) => {
    uploadToStorage.single('file')(req, res, (err) => {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ message: 'File too large. Maximum size is 20MB.' });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
          return res.status(400).json({ message: 'Too many files. Maximum 5 files allowed.' });
        }
        if (err.message.includes('Invalid file type')) {
          return res.status(400).json({ message: err.message });
        }
        return res.status(400).json({ message: 'File upload failed: ' + err.message });
      }
      next();
    });
  }, async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
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
        return res.status(400).json({ message: "Unsupported file type. Only CSV and XLSX files are supported." });
      }

      // Update upload record with table name
      await storage.updateUpload(uploadRecord.id, {
        tableName,
        processed: true
      });

      res.json({
        ...uploadRecord,
        tableName,
        processed: true
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ message: errorMessage });
    }
  });

  // Get uploads
  app.get("/api/uploads", requireAuth, async (req, res) => {
    try {
      const uploads = await storage.getUploads(req.user.id);
      res.json(uploads);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ message: errorMessage });
    }
  });

  // Get single upload by ID
  app.get("/api/uploads/:id", requireAuth, async (req, res) => {
    try {
      const upload = await storage.getUpload(req.params.id);
      if (!upload) {
        return res.status(404).json({ message: "Upload not found" });
      }
      
      // Ensure user owns the upload
      if (upload.userId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(upload);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ message: errorMessage });
    }
  });

  // Get generated content
  app.get("/api/generated-content", requireAuth, async (req, res) => {
    try {
      const content = await storage.getGeneratedContent(req.user.id);
      res.json(content);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ message: errorMessage });
    }
  });

  // SQL validation endpoint
  app.post("/api/validate-sql", requireAuth, async (req, res) => {
    try {
      const { query } = req.body;
      const result = validateSQL(query);
      res.json(result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(400).json({ message: errorMessage });
    }
  });

  // Agent settings endpoints
  app.get("/api/agent-settings", requireAuth, async (req, res) => {
    try {
      const settings = await storage.getAgentSettings(req.user.id);
      res.json(settings);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ message: errorMessage });
    }
  });

  app.post("/api/agent-settings", requireAuth, async (req, res) => {
    try {
      const data = insertAgentSettingsSchema.parse(req.body);
      const settings = await storage.createAgentSettings({
        ...data,
        userId: req.user!.id
      });
      res.json(settings);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(400).json({ message: errorMessage });
    }
  });

  app.put("/api/agent-settings/:id", requireAuth, async (req, res) => {
    try {
      // First, verify that the agent settings belong to the current user
      const existingSettings = await storage.getAgentSettingsById(req.params.id, req.user!.id);
      if (!existingSettings) {
        return res.status(404).json({ message: "Agent settings not found" });
      }

      const data = updateAgentSettingsSchema.parse(req.body);
      const settings = await storage.updateAgentSettings(req.params.id, data);
      if (!settings) {
        return res.status(404).json({ message: "Failed to update agent settings" });
      }
      res.json(settings);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(400).json({ message: errorMessage });
    }
  });

  // Universal Ask endpoint - unified dispatcher for all agent roles
  app.post("/api/universal-ask", requireAuth, async (req, res) => {
    try {
      const { role, query, context } = req.body;
      
      if (!role || !query) {
        return res.status(400).json({ message: "Missing required fields: role, query" });
      }

      const validRoles = ['Chef', 'Accountant', 'Media', 'Research'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ message: `Invalid role. Must be one of: ${validRoles.join(', ')}` });
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
          
          // Get available tables for context
          const tablesQuery = await pool.query(
            "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE' AND (table_name LIKE 'imported_%' OR table_name IN ('ingredients', 'recipes', 'invoices', 'users', 'chat_sessions', 'messages'))"
          );
          const availableTables = tablesQuery.rows.map(row => row.table_name);
          
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
          // Media: Generate image (Imagen 3, fallback DALL-E 3), video = 501
          if (context?.mediaType === 'video') {
            return res.status(501).json({ 
              message: "Video generation not implemented yet",
              role: 'Media',
              type: 'video'
            });
          }

          console.log('🎨 Media image generation');
          const customPrompt = await getAgentSystemPrompt(req.user!.id, 'media-studio');
          const enhancedPrompt = await enhancePromptForMediaGeneration(query, 'image', customPrompt);
          
          let result;
          const model = context?.model || 'imagen-3';
          
          if (model === 'dall-e-3') {
            result = await generateWithOpenAI(enhancedPrompt, 'image');
          } else {
            result = await generateWithGemini(enhancedPrompt, 'image');
          }

          response = {
            role: 'Media',
            type: 'image',
            url: result.url,
            prompt: query,
            enhancedPrompt,
            model,
            metadata: result.metadata
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
        ...response,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Universal Ask error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ 
        success: false,
        message: errorMessage,
        role: req.body.role 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
