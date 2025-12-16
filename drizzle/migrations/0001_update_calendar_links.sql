-- Migration: Update calendar_links table structure
-- Created: 2025-11-12

-- Drop the existing table and recreate with new structure
DROP TABLE IF EXISTS calendar_links;

CREATE TABLE calendar_links (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id varchar REFERENCES orders(id),
  google_event_id text,
  user_id text NOT NULL,
  created_at timestamp DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX idx_calendar_links_user_id ON calendar_links(user_id);
CREATE INDEX idx_calendar_links_order_id ON calendar_links(order_id);
CREATE INDEX idx_calendar_links_google_event_id ON calendar_links(google_event_id);