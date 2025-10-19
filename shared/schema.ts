import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb, boolean, decimal, integer, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const chatSessions = pgTable("chat_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  agentType: text("agent_type").notNull(),
  title: text("title"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("chat_sessions_user_id_idx").on(table.userId),
  createdAtIdx: index("chat_sessions_created_at_idx").on(table.createdAt),
  userIdAgentTypeIdx: index("chat_sessions_user_id_agent_type_idx").on(table.userId, table.agentType),
}));

export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").references(() => chatSessions.id),
  role: text("role").notNull(), // 'user' | 'assistant'
  content: text("content").notNull(),
  metadata: jsonb("metadata"), // For SQL queries, model used, etc.
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  sessionIdIdx: index("messages_session_id_idx").on(table.sessionId),
  createdAtIdx: index("messages_created_at_idx").on(table.createdAt),
  sessionIdCreatedAtIdx: index("messages_session_id_created_at_idx").on(table.sessionId, table.createdAt),
}));

export const uploads = pgTable("uploads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  mimeType: text("mime_type").notNull(),
  size: text("size").notNull(),
  tableName: text("table_name"), // Name of created table
  processed: boolean("processed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("uploads_user_id_idx").on(table.userId),
  createdAtIdx: index("uploads_created_at_idx").on(table.createdAt),
  userIdProcessedIdx: index("uploads_user_id_processed_idx").on(table.userId, table.processed),
}));

export const generatedContent = pgTable("generated_content", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  type: text("type").notNull(), // 'image' | 'video'
  prompt: text("prompt").notNull(),
  model: text("model").notNull(), // 'imagen-3' | 'dall-e-3' | 'veo-3'
  url: text("url"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("generated_content_user_id_idx").on(table.userId),
  createdAtIdx: index("generated_content_created_at_idx").on(table.createdAt),
  userIdTypeIdx: index("generated_content_user_id_type_idx").on(table.userId, table.type),
  typeModelIdx: index("generated_content_type_model_idx").on(table.type, table.model),
}));

export const mediaJobs = pgTable("media_jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  kind: text("kind").notNull(), // 'image' | 'video' | 'video-from-image'
  provider: text("provider").notNull(), // 'imagen-3' | 'veo-3' | etc
  status: text("status").notNull().default('queued'), // 'queued' | 'running' | 'done' | 'failed'
  inputHash: text("input_hash"), // For caching/deduplication
  resultUrl: text("result_url"),
  error: text("error"),
  metadata: jsonb("metadata"), // prompt, modelHints, etc
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  statusIdx: index("media_jobs_status_idx").on(table.status),
  inputHashIdx: index("media_jobs_input_hash_idx").on(table.inputHash),
  statusProviderIdx: index("media_jobs_status_provider_idx").on(table.status, table.provider),
  createdAtIdx: index("media_jobs_created_at_idx").on(table.createdAt),
}));

export const ingredients = pgTable("ingredients", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  unit: text("unit").notNull(), // kg, g, liter, piece, etc.
  currentStock: decimal("current_stock", { precision: 10, scale: 2 }).notNull().default('0'),
  minStock: decimal("min_stock", { precision: 10, scale: 2 }).notNull().default('0'),
  pricePerUnit: decimal("price_per_unit", { precision: 10, scale: 2 }).notNull(),
  supplier: text("supplier"),
  category: text("category"), // vegetables, meat, dairy, etc.
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  nameIdx: index("ingredients_name_idx").on(table.name),
  categoryIdx: index("ingredients_category_idx").on(table.category),
  supplierIdx: index("ingredients_supplier_idx").on(table.supplier),
  nameCategoryIdx: index("ingredients_name_category_idx").on(table.name, table.category),
}));

export const recipes = pgTable("recipes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  servings: integer("servings").notNull().default(1),
  prepTime: integer("prep_time"), // minutes
  cookTime: integer("cook_time"), // minutes
  difficulty: text("difficulty"), // easy, medium, hard
  instructions: text("instructions").notNull(),
  category: text("category"), // appetizer, main, dessert, etc.
  cost: decimal("cost", { precision: 10, scale: 2 }), // calculated from ingredients
  price: decimal("price", { precision: 10, scale: 2 }), // selling price
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  nameIdx: index("recipes_name_idx").on(table.name),
  categoryIdx: index("recipes_category_idx").on(table.category),
  isActiveIdx: index("recipes_is_active_idx").on(table.isActive),
  nameCategoryIdx: index("recipes_name_category_idx").on(table.name, table.category),
  categoryActiveIdx: index("recipes_category_active_idx").on(table.category, table.isActive),
}));

export const invoices = pgTable("invoices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  invoiceNumber: text("invoice_number").notNull().unique(),
  supplier: text("supplier").notNull(),
  date: timestamp("date").notNull(),
  dueDate: timestamp("due_date"),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  taxAmount: decimal("tax_amount", { precision: 10, scale: 2 }).notNull().default('0'),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default('pending'), // pending, paid, overdue
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  supplierIdx: index("invoices_supplier_idx").on(table.supplier),
  statusIdx: index("invoices_status_idx").on(table.status),
  dateIdx: index("invoices_date_idx").on(table.date),
  supplierStatusIdx: index("invoices_supplier_status_idx").on(table.supplier, table.status),
  dateStatusIdx: index("invoices_date_status_idx").on(table.date, table.status),
}));

export const agentSettings = pgTable("agent_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  agentType: text("agent_type").notNull(), // 'Accountant' | 'Chef' | 'Analyst' | 'Media Studio'
  systemPrompt: text("system_prompt").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("agent_settings_user_id_idx").on(table.userId),
  userAgentIdx: index("agent_settings_user_agent_idx").on(table.userId, table.agentType),
  agentTypeIdx: index("agent_settings_agent_type_idx").on(table.agentType),
}));

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertChatSessionSchema = createInsertSchema(chatSessions).pick({
  agentType: true,
  title: true,
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  sessionId: true,
  role: true,
  content: true,
  metadata: true,
});

export const insertUploadSchema = createInsertSchema(uploads).pick({
  filename: true,
  originalName: true,
  mimeType: true,
  size: true,
  tableName: true,
});

export const insertGeneratedContentSchema = createInsertSchema(generatedContent).pick({
  type: true,
  prompt: true,
  model: true,
  url: true,
  metadata: true,
});

export const insertMediaJobSchema = createInsertSchema(mediaJobs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertIngredientSchema = createInsertSchema(ingredients).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRecipeSchema = createInsertSchema(recipes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertInvoiceSchema = createInsertSchema(invoices).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAgentSettingsSchema = createInsertSchema(agentSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateAgentSettingsSchema = createInsertSchema(agentSettings).pick({
  systemPrompt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertChatSession = z.infer<typeof insertChatSessionSchema>;
export type ChatSession = typeof chatSessions.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertUpload = z.infer<typeof insertUploadSchema>;
export type Upload = typeof uploads.$inferSelect;
export type InsertGeneratedContent = z.infer<typeof insertGeneratedContentSchema>;
export type GeneratedContent = typeof generatedContent.$inferSelect;
export type InsertMediaJob = z.infer<typeof insertMediaJobSchema>;
export type MediaJob = typeof mediaJobs.$inferSelect;
export type InsertIngredient = z.infer<typeof insertIngredientSchema>;
export type Ingredient = typeof ingredients.$inferSelect;
export type InsertRecipe = z.infer<typeof insertRecipeSchema>;
export type Recipe = typeof recipes.$inferSelect;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type Invoice = typeof invoices.$inferSelect;
export type InsertAgentSettings = z.infer<typeof insertAgentSettingsSchema>;
export type UpdateAgentSettings = z.infer<typeof updateAgentSettingsSchema>;
export type AgentSettings = typeof agentSettings.$inferSelect;
