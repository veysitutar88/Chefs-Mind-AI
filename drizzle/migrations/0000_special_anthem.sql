CREATE TABLE "agent_settings" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"agent_type" text NOT NULL,
	"system_prompt" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "attachments" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" varchar NOT NULL,
	"file_id" varchar,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "calendar_links" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" varchar NOT NULL,
	"google_event_id" text,
	"event_date" timestamp,
	"reminder_24h" boolean DEFAULT false,
	"reminder_1h" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "chat_sessions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"agent_type" text NOT NULL,
	"title" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "generated_content" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"type" text NOT NULL,
	"prompt" text NOT NULL,
	"model" text NOT NULL,
	"url" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ingredients" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"unit" text NOT NULL,
	"current_stock" numeric(10, 2) DEFAULT '0' NOT NULL,
	"min_stock" numeric(10, 2) DEFAULT '0' NOT NULL,
	"price_per_unit" numeric(10, 2) NOT NULL,
	"supplier" text,
	"category" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invoice_number" text NOT NULL,
	"supplier" text NOT NULL,
	"date" timestamp NOT NULL,
	"due_date" timestamp,
	"subtotal" numeric(10, 2) NOT NULL,
	"tax_amount" numeric(10, 2) DEFAULT '0' NOT NULL,
	"total" numeric(10, 2) NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "invoices_invoice_number_unique" UNIQUE("invoice_number")
);
--> statement-breakpoint
CREATE TABLE "media_jobs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kind" text NOT NULL,
	"provider" text NOT NULL,
	"status" text DEFAULT 'queued' NOT NULL,
	"input_hash" text,
	"result_url" text,
	"error" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" varchar,
	"role" text NOT NULL,
	"content" text NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "notes" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" varchar NOT NULL,
	"user_id" varchar,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" varchar,
	"order_date" timestamp DEFAULT now(),
	"status" text NOT NULL,
	"total" numeric(10, 2),
	"items" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "purchase_orders" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"supplier_id" varchar,
	"order_date" timestamp DEFAULT now(),
	"delivery_date" timestamp,
	"status" text NOT NULL,
	"items" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "recipes" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"servings" integer DEFAULT 1 NOT NULL,
	"prep_time" integer,
	"cook_time" integer,
	"difficulty" text,
	"instructions" text NOT NULL,
	"category" text,
	"cost" numeric(10, 2),
	"price" numeric(10, 2),
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "suppliers" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"contact_info" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "uploads" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"filename" text NOT NULL,
	"original_name" text NOT NULL,
	"mime_type" text NOT NULL,
	"size" text NOT NULL,
	"table_name" text,
	"processed" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "agent_settings" ADD CONSTRAINT "agent_settings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_file_id_uploads_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."uploads"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_sessions" ADD CONSTRAINT "chat_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "generated_content" ADD CONSTRAINT "generated_content_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_session_id_chat_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."chat_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notes" ADD CONSTRAINT "notes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "uploads" ADD CONSTRAINT "uploads_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "agent_settings_user_id_idx" ON "agent_settings" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "agent_settings_user_agent_idx" ON "agent_settings" USING btree ("user_id","agent_type");--> statement-breakpoint
CREATE INDEX "agent_settings_agent_type_idx" ON "agent_settings" USING btree ("agent_type");--> statement-breakpoint
CREATE INDEX "attachments_entity_idx" ON "attachments" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "chat_sessions_user_id_idx" ON "chat_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "chat_sessions_created_at_idx" ON "chat_sessions" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "chat_sessions_user_id_agent_type_idx" ON "chat_sessions" USING btree ("user_id","agent_type");--> statement-breakpoint
CREATE INDEX "generated_content_user_id_idx" ON "generated_content" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "generated_content_created_at_idx" ON "generated_content" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "generated_content_user_id_type_idx" ON "generated_content" USING btree ("user_id","type");--> statement-breakpoint
CREATE INDEX "generated_content_type_model_idx" ON "generated_content" USING btree ("type","model");--> statement-breakpoint
CREATE INDEX "ingredients_name_idx" ON "ingredients" USING btree ("name");--> statement-breakpoint
CREATE INDEX "ingredients_category_idx" ON "ingredients" USING btree ("category");--> statement-breakpoint
CREATE INDEX "ingredients_supplier_idx" ON "ingredients" USING btree ("supplier");--> statement-breakpoint
CREATE INDEX "ingredients_name_category_idx" ON "ingredients" USING btree ("name","category");--> statement-breakpoint
CREATE INDEX "invoices_supplier_idx" ON "invoices" USING btree ("supplier");--> statement-breakpoint
CREATE INDEX "invoices_status_idx" ON "invoices" USING btree ("status");--> statement-breakpoint
CREATE INDEX "invoices_date_idx" ON "invoices" USING btree ("date");--> statement-breakpoint
CREATE INDEX "invoices_supplier_status_idx" ON "invoices" USING btree ("supplier","status");--> statement-breakpoint
CREATE INDEX "invoices_date_status_idx" ON "invoices" USING btree ("date","status");--> statement-breakpoint
CREATE INDEX "media_jobs_status_idx" ON "media_jobs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "media_jobs_input_hash_idx" ON "media_jobs" USING btree ("input_hash");--> statement-breakpoint
CREATE INDEX "media_jobs_status_provider_idx" ON "media_jobs" USING btree ("status","provider");--> statement-breakpoint
CREATE INDEX "media_jobs_created_at_idx" ON "media_jobs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "messages_session_id_idx" ON "messages" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "messages_created_at_idx" ON "messages" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "messages_session_id_created_at_idx" ON "messages" USING btree ("session_id","created_at");--> statement-breakpoint
CREATE INDEX "notes_entity_idx" ON "notes" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "orders_customer_id_idx" ON "orders" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "orders_status_idx" ON "orders" USING btree ("status");--> statement-breakpoint
CREATE INDEX "po_supplier_id_idx" ON "purchase_orders" USING btree ("supplier_id");--> statement-breakpoint
CREATE INDEX "po_status_idx" ON "purchase_orders" USING btree ("status");--> statement-breakpoint
CREATE INDEX "recipes_name_idx" ON "recipes" USING btree ("name");--> statement-breakpoint
CREATE INDEX "recipes_category_idx" ON "recipes" USING btree ("category");--> statement-breakpoint
CREATE INDEX "recipes_is_active_idx" ON "recipes" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "recipes_name_category_idx" ON "recipes" USING btree ("name","category");--> statement-breakpoint
CREATE INDEX "recipes_category_active_idx" ON "recipes" USING btree ("category","is_active");--> statement-breakpoint
CREATE INDEX "uploads_user_id_idx" ON "uploads" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "uploads_created_at_idx" ON "uploads" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "uploads_user_id_processed_idx" ON "uploads" USING btree ("user_id","processed");