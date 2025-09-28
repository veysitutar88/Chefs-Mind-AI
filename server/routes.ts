import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import multer from "multer";
import path from "path";
import { processCSVFile, processXLSXFile } from "./services/fileProcessor";
import { validateSQL, executeReadOnlySQL } from "./services/sqlValidator";
import { analyzeWithGemini, generateWithGemini } from "./services/gemini";
import { generateWithOpenAI, analyzeWithGPT } from "./services/openai";
import { insertMessageSchema, insertUploadSchema, insertChatSessionSchema, insertGeneratedContentSchema } from "@shared/schema";

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
        userId: req.user.id
      });
      res.json(session);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/chat/sessions", requireAuth, async (req, res) => {
    try {
      const sessions = await storage.getChatSessions(req.user.id);
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/chat/sessions/:id/messages", requireAuth, async (req, res) => {
    try {
      const messages = await storage.getMessages(req.params.id);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: error.message });
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
        if (session.agentType === 'accountant' || session.agentType === 'analyst') {
          // Use Gemini for data analysis and SQL generation
          const result = await analyzeWithGemini(data.content, session.agentType);
          aiResponse = result.response;
          metadata = result.metadata;
          
          // If SQL query is generated, validate and execute it
          if (result.metadata?.sqlQuery) {
            const validationResult = validateSQL(result.metadata.sqlQuery);
            if (!validationResult.isValid) {
              throw new Error(`SQL Validation Error: ${validationResult.error}`);
            }
            
            try {
              const queryResults = await executeReadOnlySQL(result.metadata.sqlQuery);
              metadata.queryResults = queryResults;
              metadata.debugSql = result.metadata.sqlQuery;
            } catch (sqlError) {
              metadata.sqlError = sqlError.message;
            }
          }
        } else if (session.agentType === 'media-studio') {
          // Handle media generation requests
          if (req.body.mediaType === 'image') {
            const model = req.body.model || 'imagen-3';
            let result;
            
            if (model === 'dall-e-3') {
              result = await generateWithOpenAI(data.content, 'image');
            } else {
              result = await generateWithGemini(data.content, 'image');
            }
            
            // Save generated content
            await storage.createGeneratedContent({
              userId: req.user.id,
              type: 'image',
              prompt: data.content,
              model,
              url: result.url,
              metadata: result.metadata
            });
            
            aiResponse = `Изображение создано успешно с использованием ${model}`;
            metadata = { imageUrl: result.url, model };
          } else if (req.body.mediaType === 'video') {
            const result = await generateWithGemini(data.content, 'video');
            
            await storage.createGeneratedContent({
              userId: req.user.id,
              type: 'video',
              prompt: data.content,
              model: 'veo-3',
              url: result.url,
              metadata: result.metadata
            });
            
            aiResponse = `Видео создано успешно с использованием Veo 3`;
            metadata = { videoUrl: result.url, model: 'veo-3' };
          } else {
            aiResponse = await analyzeWithGemini(data.content, session.agentType).then(r => r.response);
          }
        } else {
          // Use GPT-5 for creative and text-focused tasks
          aiResponse = await analyzeWithGPT(data.content, session.agentType);
          metadata = { model: 'gpt-5' };
        }
      } catch (aiError) {
        aiResponse = `Ошибка при обработке запроса: ${aiError.message}`;
        metadata = { error: aiError.message };
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
      res.status(400).json({ message: error.message });
    }
  });

  // File upload and processing
  app.post("/api/upload", requireAuth, upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const uploadData = {
        userId: req.user.id,
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
      res.status(500).json({ message: error.message });
    }
  });

  // Get uploads
  app.get("/api/uploads", requireAuth, async (req, res) => {
    try {
      const uploads = await storage.getUploads(req.user.id);
      res.json(uploads);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get generated content
  app.get("/api/generated-content", requireAuth, async (req, res) => {
    try {
      const content = await storage.getGeneratedContent(req.user.id);
      res.json(content);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // SQL validation endpoint
  app.post("/api/validate-sql", requireAuth, async (req, res) => {
    try {
      const { query } = req.body;
      const result = validateSQL(query);
      res.json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
