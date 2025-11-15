import { sql } from 'drizzle-orm';
import {
  pgTable,
  text,
  varchar,
  timestamp,
  uuid,
  index,
} from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';

export const mediaAssets = pgTable(
  'media_assets',
  {
    id: varchar('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: varchar('user_id').references(() => users.id).notNull(),
    provider: varchar('provider', { length: 50 }).notNull(),
    prompt: text('prompt').notNull(),
    jobId: varchar('job_id', { length: 255 }).unique(),
    status: varchar('status', { length: 20 }).notNull().default('pending'),
    assetUrl: varchar('asset_url', { length: 512 }),
    errorMessage: text('error_message'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  table => ({
    userIdIdx: index('media_assets_user_id_idx').on(table.userId),
    statusIdx: index('media_assets_status_idx').on(table.status),
    providerIdx: index('media_assets_provider_idx').on(table.provider),
    createdAtIdx: index('media_assets_created_at_idx').on(table.createdAt),
  })
);

// Insert schema
export const insertMediaAssetSchema = createInsertSchema(mediaAssets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});