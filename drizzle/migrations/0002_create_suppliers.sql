-- Create updated suppliers table
ALTER TABLE "suppliers" DROP COLUMN IF EXISTS "contact_info";
ALTER TABLE "suppliers" ADD COLUMN IF NOT EXISTS "name" varchar(255) NOT NULL;
ALTER TABLE "suppliers" ADD COLUMN IF NOT EXISTS "contact_person" varchar(255);
ALTER TABLE "suppliers" ADD COLUMN IF NOT EXISTS "phone" varchar(50);
ALTER TABLE "suppliers" ADD COLUMN IF NOT EXISTS "email" varchar(255);
ALTER TABLE "suppliers" ADD COLUMN IF NOT EXISTS "address" text;
ALTER TABLE "suppliers" ADD COLUMN IF NOT EXISTS "updated_at" timestamp DEFAULT now() NOT NULL;

-- Add unique constraint on email
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'suppliers_email_unique' 
        AND conrelid = 'suppliers'::regclass
    ) THEN
        ALTER TABLE "suppliers" ADD CONSTRAINT "suppliers_email_unique" UNIQUE("email");
    END IF;
END $$;