-- Update orders table structure
ALTER TABLE "orders" DROP COLUMN IF EXISTS "customer_id";
ALTER TABLE "orders" DROP COLUMN IF EXISTS "total";
ALTER TABLE "orders" DROP COLUMN IF EXISTS "items";

ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "supplier_id" uuid;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "order_date" timestamp DEFAULT now() NOT NULL;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "status" varchar(50) NOT NULL DEFAULT 'pending';
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "total_amount" decimal(10, 2);
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "updated_at" timestamp DEFAULT now() NOT NULL;

-- Add foreign key constraint to suppliers table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'orders_supplier_id_fk' 
        AND conrelid = 'orders'::regclass
    ) THEN
        ALTER TABLE "orders" ADD CONSTRAINT "orders_supplier_id_fk" 
        FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") 
        ON DELETE SET NULL ON UPDATE no action;
    END IF;
END $$;

-- Create index for supplier_id
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'orders' 
        AND indexname = 'orders_supplier_id_idx'
    ) THEN
        CREATE INDEX "orders_supplier_id_idx" ON "orders" USING btree ("supplier_id");
    END IF;
END $$;