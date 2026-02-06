# Phase B: Database Migrations

## B1: Add Description Column to Substances
- **File:** `supabase/migrations/004_substance_description.sql`
- `ALTER TABLE substances ADD COLUMN description TEXT;`

## B2: Add Treatment Event Type + Junction Table
- **File:** `supabase/migrations/005_treatment_and_linking.sql`
- Add `'treatment'` to `health_event_type` enum
- Create `health_event_substances` junction table
- Add RLS policies and indexes

## B3: Add Metadata JSONB to Health Events
- **File:** `supabase/migrations/006_health_event_metadata.sql`
- `ALTER TABLE health_events ADD COLUMN metadata JSONB;`

## B4: Update Type Definitions
- **File:** `types/database.types.ts`
- Add all new fields and table types
