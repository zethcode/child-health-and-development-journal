-- Add metadata JSONB column to health_events for structured data (e.g., fever details)
-- Stores: temperature, unit (C/F), medication_taken, brand, dosage, recorded_at
ALTER TABLE health_events ADD COLUMN metadata JSONB;
