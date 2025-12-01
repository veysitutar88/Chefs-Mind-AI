-- Create followup_tasks table for payment/delivery reminders and follow-up tasks
-- Migration: 0005_create_followup_tasks
-- Created: 2025-12-01

CREATE TABLE IF NOT EXISTS "followup_tasks" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" varchar NOT NULL,
  "type" text NOT NULL,
  "related_entity" text,
  "entity_id" varchar,
  "due_date" timestamp NOT NULL,
  "title" text NOT NULL,
  "notes" text,
  "status" text DEFAULT 'pending' NOT NULL,
  "google_event_id" text,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);

-- Add NOT NULL constraint separately in case the column already exists
ALTER TABLE "followup_tasks" ALTER COLUMN "user_id" SET NOT NULL;
ALTER TABLE "followup_tasks" ALTER COLUMN "type" SET NOT NULL;
ALTER TABLE "followup_tasks" ALTER COLUMN "due_date" SET NOT NULL;
ALTER TABLE "followup_tasks" ALTER COLUMN "title" SET NOT NULL;
ALTER TABLE "followup_tasks" ALTER COLUMN "status" SET NOT NULL;

-- Add foreign key to users table
ALTER TABLE "followup_tasks" ADD CONSTRAINT "followup_tasks_user_id_users_id_fk" 
  FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") 
  ON DELETE CASCADE ON UPDATE NO ACTION;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS "followup_tasks_user_id_idx" ON "followup_tasks" USING btree ("user_id");
CREATE INDEX IF NOT EXISTS "followup_tasks_status_idx" ON "followup_tasks" USING btree ("status");
CREATE INDEX IF NOT EXISTS "followup_tasks_due_date_idx" ON "followup_tasks" USING btree ("due_date");
CREATE INDEX IF NOT EXISTS "followup_tasks_type_idx" ON "followup_tasks" USING btree ("type");
CREATE INDEX IF NOT EXISTS "followup_tasks_user_status_idx" ON "followup_tasks" USING btree ("user_id", "status");
