import { 
  users, 
  chatSessions, 
  messages, 
  uploads, 
  generatedContent,
  agentSettings,
  type User, 
  type InsertUser,
  type ChatSession,
  type InsertChatSession,
  type Message,
  type InsertMessage,
  type Upload,
  type InsertUpload,
  type GeneratedContent,
  type InsertGeneratedContent,
  type AgentSettings,
  type InsertAgentSettings,
  type UpdateAgentSettings
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  createChatSession(session: InsertChatSession & { userId: string }): Promise<ChatSession>;
  getChatSessions(userId: string): Promise<ChatSession[]>;
  getChatSession(id: string): Promise<ChatSession | undefined>;
  
  createMessage(message: InsertMessage): Promise<Message>;
  getMessages(sessionId: string): Promise<Message[]>;
  
  createUpload(upload: InsertUpload & { userId: string }): Promise<Upload>;
  getUpload(id: string): Promise<Upload | undefined>;
  getUploads(userId: string): Promise<Upload[]>;
  updateUpload(id: string, data: Partial<Upload>): Promise<Upload | undefined>;
  
  createGeneratedContent(content: InsertGeneratedContent & { userId: string }): Promise<GeneratedContent>;
  getGeneratedContent(userId: string): Promise<GeneratedContent[]>;
  
  createAgentSettings(settings: InsertAgentSettings & { userId: string }): Promise<AgentSettings>;
  getAgentSettings(userId: string): Promise<AgentSettings[]>;
  getAgentSettingsByType(userId: string, agentType: string): Promise<AgentSettings | undefined>;
  updateAgentSettings(id: string, data: UpdateAgentSettings): Promise<AgentSettings | undefined>;
  
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async createChatSession(sessionData: InsertChatSession & { userId: string }): Promise<ChatSession> {
    const [session] = await db
      .insert(chatSessions)
      .values(sessionData)
      .returning();
    return session;
  }

  async getChatSessions(userId: string): Promise<ChatSession[]> {
    return await db
      .select()
      .from(chatSessions)
      .where(eq(chatSessions.userId, userId))
      .orderBy(desc(chatSessions.createdAt));
  }

  async getChatSession(id: string): Promise<ChatSession | undefined> {
    const [session] = await db.select().from(chatSessions).where(eq(chatSessions.id, id));
    return session || undefined;
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const [msg] = await db
      .insert(messages)
      .values(message)
      .returning();
    return msg;
  }

  async getMessages(sessionId: string): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.sessionId, sessionId))
      .orderBy(messages.createdAt);
  }

  async createUpload(upload: InsertUpload & { userId: string }): Promise<Upload> {
    const [uploadRecord] = await db
      .insert(uploads)
      .values(upload)
      .returning();
    return uploadRecord;
  }

  async getUpload(id: string): Promise<Upload | undefined> {
    const [upload] = await db.select().from(uploads).where(eq(uploads.id, id));
    return upload || undefined;
  }

  async getUploads(userId: string): Promise<Upload[]> {
    return await db
      .select()
      .from(uploads)
      .where(eq(uploads.userId, userId))
      .orderBy(desc(uploads.createdAt));
  }

  async updateUpload(id: string, data: Partial<Upload>): Promise<Upload | undefined> {
    const [upload] = await db
      .update(uploads)
      .set(data)
      .where(eq(uploads.id, id))
      .returning();
    return upload || undefined;
  }

  async createGeneratedContent(content: InsertGeneratedContent & { userId: string }): Promise<GeneratedContent> {
    const [generated] = await db
      .insert(generatedContent)
      .values(content)
      .returning();
    return generated;
  }

  async getGeneratedContent(userId: string): Promise<GeneratedContent[]> {
    return await db
      .select()
      .from(generatedContent)
      .where(eq(generatedContent.userId, userId))
      .orderBy(desc(generatedContent.createdAt));
  }

  async createAgentSettings(settings: InsertAgentSettings & { userId: string }): Promise<AgentSettings> {
    const [agentSetting] = await db
      .insert(agentSettings)
      .values(settings)
      .returning();
    return agentSetting;
  }

  async getAgentSettings(userId: string): Promise<AgentSettings[]> {
    return await db
      .select()
      .from(agentSettings)
      .where(eq(agentSettings.userId, userId))
      .orderBy(agentSettings.agentType);
  }

  async getAgentSettingsByType(userId: string, agentType: string): Promise<AgentSettings | undefined> {
    const [setting] = await db
      .select()
      .from(agentSettings)
      .where(and(eq(agentSettings.userId, userId), eq(agentSettings.agentType, agentType)));
    return setting || undefined;
  }

  async updateAgentSettings(id: string, data: UpdateAgentSettings): Promise<AgentSettings | undefined> {
    const [updated] = await db
      .update(agentSettings)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(agentSettings.id, id))
      .returning();
    return updated || undefined;
  }
}

export const storage = new DatabaseStorage();
