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
  type UpdateAgentSettings,
} from '@shared/schema';
import { dbRead, dbWrite } from './db.js';
import { eq, desc, and } from 'drizzle-orm';
import session from 'express-session';
import connectPg from 'connect-pg-simple';
import { pool } from './db.js';

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  createChatSession(
    session: InsertChatSession & { userId: string }
  ): Promise<ChatSession>;
  getChatSessions(userId: string): Promise<ChatSession[]>;
  getChatSession(id: string): Promise<ChatSession | undefined>;

  createMessage(message: InsertMessage): Promise<Message>;
  getMessages(sessionId: string): Promise<Message[]>;

  createUpload(upload: InsertUpload & { userId: string }): Promise<Upload>;
  getUpload(id: string): Promise<Upload | undefined>;
  getUploads(userId: string): Promise<Upload[]>;
  updateUpload(id: string, data: Partial<Upload>): Promise<Upload | undefined>;

  createGeneratedContent(
    content: InsertGeneratedContent & { userId: string }
  ): Promise<GeneratedContent>;
  getGeneratedContent(userId: string): Promise<GeneratedContent[]>;

  createAgentSettings(
    settings: InsertAgentSettings & { userId: string }
  ): Promise<AgentSettings>;
  getAgentSettings(userId: string): Promise<AgentSettings[]>;
  getAgentSettingsByType(
    userId: string,
    agentType: string
  ): Promise<AgentSettings | undefined>;
  getAgentSettingsById(
    id: string,
    userId: string
  ): Promise<AgentSettings | undefined>;
  updateAgentSettings(
    id: string,
    data: UpdateAgentSettings
  ): Promise<AgentSettings | undefined>;

  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await dbRead.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await dbRead
      .select()
      .from(users)
      .where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await dbWrite.insert(users).values(insertUser).returning();
    return user;
  }

  async createChatSession(
    sessionData: InsertChatSession & { userId: string }
  ): Promise<ChatSession> {
    const [session] = await dbWrite
      .insert(chatSessions)
      .values(sessionData)
      .returning();
    return session;
  }

  async getChatSessions(
    userId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<ChatSession[]> {
    return await dbRead
      .select({
        id: chatSessions.id,
        userId: chatSessions.userId,
        agentType: chatSessions.agentType,
        title: chatSessions.title,
        createdAt: chatSessions.createdAt,
      })
      .from(chatSessions)
      .where(eq(chatSessions.userId, userId))
      .orderBy(desc(chatSessions.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getChatSession(id: string): Promise<ChatSession | undefined> {
    const [session] = await dbRead
      .select()
      .from(chatSessions)
      .where(eq(chatSessions.id, id));
    return session || undefined;
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const [msg] = await dbWrite.insert(messages).values(message).returning();
    return msg;
  }

  async getMessages(
    sessionId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<Message[]> {
    return await dbRead
      .select({
        id: messages.id,
        sessionId: messages.sessionId,
        role: messages.role,
        content: messages.content,
        metadata: messages.metadata,
        createdAt: messages.createdAt,
      })
      .from(messages)
      .where(eq(messages.sessionId, sessionId))
      .orderBy(messages.createdAt)
      .limit(limit)
      .offset(offset);
  }

  async createUpload(
    upload: InsertUpload & { userId: string }
  ): Promise<Upload> {
    const [uploadRecord] = await dbWrite
      .insert(uploads)
      .values(upload)
      .returning();
    return uploadRecord;
  }

  async getUpload(id: string): Promise<Upload | undefined> {
    const [upload] = await dbRead
      .select()
      .from(uploads)
      .where(eq(uploads.id, id));
    return upload || undefined;
  }

  async getUploads(userId: string): Promise<Upload[]> {
    return await dbRead
      .select()
      .from(uploads)
      .where(eq(uploads.userId, userId))
      .orderBy(desc(uploads.createdAt));
  }

  async updateUpload(
    id: string,
    data: Partial<Upload>
  ): Promise<Upload | undefined> {
    const [upload] = await dbWrite
      .update(uploads)
      .set(data)
      .where(eq(uploads.id, id))
      .returning();
    return upload || undefined;
  }

  async createGeneratedContent(
    content: InsertGeneratedContent & { userId: string }
  ): Promise<GeneratedContent> {
    const [generated] = await dbWrite
      .insert(generatedContent)
      .values(content)
      .returning();
    return generated;
  }

  async getGeneratedContent(userId: string): Promise<GeneratedContent[]> {
    return await dbRead
      .select()
      .from(generatedContent)
      .where(eq(generatedContent.userId, userId))
      .orderBy(desc(generatedContent.createdAt));
  }

  async createAgentSettings(
    settings: InsertAgentSettings & { userId: string }
  ): Promise<AgentSettings> {
    const [agentSetting] = await dbWrite
      .insert(agentSettings)
      .values(settings)
      .returning();
    return agentSetting;
  }

  async getAgentSettings(userId: string): Promise<AgentSettings[]> {
    return await dbRead
      .select()
      .from(agentSettings)
      .where(eq(agentSettings.userId, userId))
      .orderBy(agentSettings.agentType);
  }

  async getAgentSettingsByType(
    userId: string,
    agentType: string
  ): Promise<AgentSettings | undefined> {
    const [setting] = await dbRead
      .select()
      .from(agentSettings)
      .where(
        and(
          eq(agentSettings.userId, userId),
          eq(agentSettings.agentType, agentType)
        )
      );
    return setting || undefined;
  }

  async getAgentSettingsById(
    id: string,
    userId: string
  ): Promise<AgentSettings | undefined> {
    const [setting] = await dbRead
      .select()
      .from(agentSettings)
      .where(and(eq(agentSettings.id, id), eq(agentSettings.userId, userId)));
    return setting || undefined;
  }

  async updateAgentSettings(
    id: string,
    data: UpdateAgentSettings
  ): Promise<AgentSettings | undefined> {
    const [updated] = await dbWrite
      .update(agentSettings)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(agentSettings.id, id))
      .returning();
    return updated || undefined;
  }
}

export const storage = new DatabaseStorage();
