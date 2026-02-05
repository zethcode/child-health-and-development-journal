-- Child Portfolio Migration
-- Adds detailed profile fields and change logging

-- Add portfolio fields to children table
ALTER TABLE children
ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('male', 'female', 'other')),
ADD COLUMN IF NOT EXISTS height_cm DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS weight_kg DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS head_circumference_cm DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS blood_type TEXT,
ADD COLUMN IF NOT EXISTS allergies TEXT[],
ADD COLUMN IF NOT EXISTS medical_conditions TEXT;

-- Create change log table for tracking profile updates
CREATE TABLE IF NOT EXISTS child_profile_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    child_id UUID REFERENCES children(id) ON DELETE CASCADE NOT NULL,
    changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    changes JSONB NOT NULL, -- { field: { old: value, new: value } }
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_child_profile_logs_child_id ON child_profile_logs(child_id);
CREATE INDEX IF NOT EXISTS idx_child_profile_logs_changed_at ON child_profile_logs(changed_at DESC);
CREATE INDEX IF NOT EXISTS idx_child_profile_logs_user_id ON child_profile_logs(user_id);

-- Enable RLS
ALTER TABLE child_profile_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own child profile logs"
    ON child_profile_logs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own child profile logs"
    ON child_profile_logs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own child profile logs"
    ON child_profile_logs FOR DELETE
    USING (auth.uid() = user_id);

-- Comment on table
COMMENT ON TABLE child_profile_logs IS 'Tracks manual changes to child profile information for historical reference';
COMMENT ON COLUMN child_profile_logs.changes IS 'JSON object storing field changes in format: { fieldName: { old: value, new: value } }';
