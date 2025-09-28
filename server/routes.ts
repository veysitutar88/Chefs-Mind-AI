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
import { insertMessageSchema, insertUploadSchema, insertChatSessionSchema, insertGeneratedContentSchema } from "@shared/schema";
import { pool } from "./db";

const upload = multer({ dest: 'uploads/' });

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
        if (session.agentType === 'accountant') {
          // Get available tables for Gemini context
          const tablesQuery = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE' AND (table_name LIKE 'imported_%' OR table_name IN ('ingredients', 'recipes', 'invoices'))");
          const availableTables = tablesQuery.rows.map(row => row.table_name);
          
          // Use Gemini for data analysis and SQL generation
          const result = await analyzeWithGemini(data.content, session.agentType, availableTables);
          aiResponse = result.response;
          metadata = result.metadata;
          
          // If SQL query is generated for accountant, validate and execute it
          if (result.metadata?.sqlQuery) {
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
        } else if (session.agentType === 'analyst') {
          // Use Perplexity for market analysis and research
          try {
            const result = await analyzeWithPerplexity(data.content, session.agentType);
            aiResponse = result.response;
            metadata = result.metadata;
          } catch (perplexityError) {
            console.error('Perplexity failed, falling back to GPT-5:', perplexityError);
            // Fallback to GPT-5 if Perplexity fails
            aiResponse = await analyzeWithGPT(data.content, session.agentType);
            metadata = { model: 'gpt-5-fallback', error: 'Perplexity API unavailable' };
          }
        } else if (session.agentType === 'media-studio') {
          console.log('🎨 Media Studio - Two-Step Generation Process Started');
          console.log('Request params:', { mediaType: req.body.mediaType, model: req.body.model });
          
          // Handle media generation requests with two-step architecture
          if (req.body.mediaType === 'text') {
            // Direct text generation with GPT-5 (no prompt enhancement needed)
            console.log('📝 Step 1/1: Direct text generation with GPT-5');
            aiResponse = await analyzeWithGPT(data.content, session.agentType);
            metadata = { model: 'gpt-5', contentType: 'text' };
            
          } else if (req.body.mediaType === 'image') {
            console.log('🖼️ Step 1/2: Enhancing prompt for image generation');
            // Step 1: Enhance prompt using GPT-5 as prompt expert
            const enhancedPrompt = await enhancePromptForMediaGeneration(data.content, 'image');
            
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
            // Step 1: Enhance prompt using GPT-5 as prompt expert
            const enhancedPrompt = await enhancePromptForMediaGeneration(data.content, 'video');
            
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
            aiResponse = await analyzeWithGPT(data.content, session.agentType);
            metadata = { model: 'gpt-5', contentType: 'text' };
          }
          
          console.log('🎉 Media Studio - Two-Step Generation Process Completed');
        } else {
          // Use GPT-5 for creative and text-focused tasks
          aiResponse = await analyzeWithGPT(data.content, session.agentType);
          metadata = { model: 'gpt-5' };
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
  app.post("/api/upload", requireAuth, upload.single('file'), async (req, res) => {
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

  const httpServer = createServer(app);
  return httpServer;
}
