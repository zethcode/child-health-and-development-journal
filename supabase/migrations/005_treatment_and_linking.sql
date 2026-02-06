-- Add 'treatment' to health_event_type enum
ALTER TYPE health_event_type ADD VALUE IF NOT EXISTS 'treatment';

-- Create junction table for linking health events to substances (medicines)
CREATE TABLE health_event_substances (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  health_event_id UUID NOT NULL REFERENCES health_events(id) ON DELETE CASCADE,
  substance_id UUID NOT NULL REFERENCES substances(id) ON DELETE CASCADE,
  dosage_override TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(health_event_id, substance_id)
);

-- Indexes for efficient lookups
CREATE INDEX idx_health_event_substances_event ON health_event_substances(health_event_id);
CREATE INDEX idx_health_event_substances_substance ON health_event_substances(substance_id);

-- Enable RLS
ALTER TABLE health_event_substances ENABLE ROW LEVEL SECURITY;

-- RLS policies: user can manage their own health event substance links
CREATE POLICY "Users can view their own health event substance links"
  ON health_event_substances FOR SELECT
  USING (
    health_event_id IN (
      SELECT id FROM health_events WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own health event substance links"
  ON health_event_substances FOR INSERT
  WITH CHECK (
    health_event_id IN (
      SELECT id FROM health_events WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own health event substance links"
  ON health_event_substances FOR UPDATE
  USING (
    health_event_id IN (
      SELECT id FROM health_events WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own health event substance links"
  ON health_event_substances FOR DELETE
  USING (
    health_event_id IN (
      SELECT id FROM health_events WHERE user_id = auth.uid()
    )
  );

-- Trigger for updated_at (reuse function from initial schema)
-- Note: no updated_at column on this table since it's a simple junction
