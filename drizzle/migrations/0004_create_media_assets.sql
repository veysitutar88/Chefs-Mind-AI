-- Create or update media_assets table
-- Migration: 0004_create_media_assets
-- Created: 2025-11-15

CREATE TABLE IF NOT EXISTS "media_assets" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" varchar NOT NULL,
  "provider" varchar(50) NOT NULL,
  "prompt" text NOT NULL,
  "job_id" varchar(255) UNIQUE,
  "status" varchar(20) DEFAULT 'pending' NOT NULL,
  "asset_url" varchar(512),
  "error_message" text,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);

-- Add foreign key to users table
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_user_id_users_id_fk" 
  FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") 
  ON DELETE CASCADE ON UPDATE NO ACTION;

-- Create indexes
CREATE INDEX IF NOT EXISTS "media_assets_user_id_idx" ON "media_assets" USING btree ("user_id");
CREATE INDEX IF NOT EXISTS "media_assets_status_idx" ON "media_assets" USING btree ("status");
CREATE INDEX IF NOT EXISTS "media_assets_provider_idx" ON "media_assets" USING btree ("provider");
CREATE INDEX IF NOT EXISTS "media_assets_created_at_idx" ON "media_assets" USING btree ("created_at");