# PLAN 08: Child Portfolio

## Overview

Add detailed child profile information (height, weight, blood type, etc.) with a manual update log that tracks when and what changes were made.

---

## Database Schema

### Task 8.1: Create Migration File

**Files:**
- Create: `supabase/migrations/002_child_portfolio.sql`

```sql
-- Add portfolio fields to children table
ALTER TABLE children
ADD COLUMN gender TEXT,
ADD COLUMN height_cm DECIMAL(5,2),
ADD COLUMN weight_kg DECIMAL(5,2),
ADD COLUMN head_circumference_cm DECIMAL(5,2),
ADD COLUMN blood_type TEXT,
ADD COLUMN allergies TEXT[],
ADD COLUMN medical_conditions TEXT;

-- Create change log table for tracking profile updates
CREATE TABLE child_profile_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    child_id UUID REFERENCES children(id) ON DELETE CASCADE NOT NULL,
    changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    changes JSONB NOT NULL, -- { field: { old: value, new: value } }
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for efficient queries
CREATE INDEX idx_child_profile_logs_child_id ON child_profile_logs(child_id);
CREATE INDEX idx_child_profile_logs_changed_at ON child_profile_logs(changed_at DESC);

-- RLS
ALTER TABLE child_profile_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own child profile logs"
    ON child_profile_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own child profile logs"
    ON child_profile_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own child profile logs"
    ON child_profile_logs FOR DELETE USING (auth.uid() = user_id);
```

**Verification:**
```sql
-- Check new columns
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'children';

-- Check log table exists
SELECT * FROM child_profile_logs LIMIT 0;
```

---

## Frontend Implementation

### Task 8.2: Create useChildPortfolio Composable

**Files:**
- Create: `app/composables/useChildPortfolio.ts`

**Features:**
- `updatePortfolio(updates)` - Updates profile and creates log entry
- `getProfileLogs()` - Fetches change history
- `calculateAge(birthDate)` - Helper to compute age from birth date

**Log entry structure:**
```typescript
interface ProfileLog {
  id: string
  child_id: string
  changed_at: string
  changes: Record<string, { old: any; new: any }>
  notes?: string
}
```

---

### Task 8.3: Update Child Profile Page

**Files:**
- Modify: `app/pages/settings/child.vue`

**New fields to add:**
| Field | Type | Notes |
|-------|------|-------|
| Gender | Select | Male, Female, Other |
| Height | Number input | cm, with decimal |
| Weight | Number input | kg, with decimal |
| Head Circumference | Number input | cm, for infants |
| Blood Type | Select | A+, A-, B+, B-, O+, O-, AB+, AB- |
| Allergies | Tag input | Multiple entries |
| Medical Conditions | Textarea | Free text |

**Layout:**
- Section 1: Basic Info (name, birth date, gender)
- Section 2: Measurements (height, weight, head circumference)
- Section 3: Medical Info (blood type, allergies, conditions)
- Section 4: Change History (collapsible, shows recent logs)

---

### Task 8.4: Create Profile Log Component

**Files:**
- Create: `app/components/child/ProfileLogEntry.vue`

**Display format:**
```
February 5, 2026 at 2:30 PM
├─ Weight: 12.5 kg → 13.0 kg
├─ Height: 85 cm → 87 cm
└─ Note: "Monthly checkup measurement"
```

---

### Task 8.5: Add Computed Age Display

**Files:**
- Modify: `app/pages/settings/child.vue`

**Features:**
- Calculate age from birth_date
- Display as "X years, Y months" or "X months, Y days" for infants
- Show alongside birth date field

---

## Type Definitions

### Task 8.6: Update Types

**Files:**
- Modify: `types/database.ts`

```typescript
interface Child {
  id: string
  user_id: string
  name: string
  birth_date: string | null
  gender: 'male' | 'female' | 'other' | null
  height_cm: number | null
  weight_kg: number | null
  head_circumference_cm: number | null
  blood_type: string | null
  allergies: string[] | null
  medical_conditions: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

interface ChildProfileLog {
  id: string
  user_id: string
  child_id: string
  changed_at: string
  changes: Record<string, { old: any; new: any }>
  notes: string | null
  created_at: string
}
```

---

## Testing

### Task 8.7: Manual Testing Checklist

**Step 1: Update profile**
- Go to `/settings/child`
- Update height from empty to "85"
- Update weight from empty to "12.5"
- Save
- Verify: Changes saved, log entry created

**Step 2: View change log**
- Scroll to "Update History" section
- Verify: Shows entry with timestamp and changes

**Step 3: Multiple updates**
- Change weight to "13.0"
- Add note: "Monthly checkup"
- Save
- Verify: New log entry appears at top

**Step 4: Age calculation**
- Set birth date to 1 year ago
- Verify: Age displays as "1 year, 0 months"

---

## UI/UX Notes

- Use clear labels with units (e.g., "Height (cm)")
- Show placeholders with example values
- Allergies as chips/tags for easy viewing
- Change log collapsed by default, expandable
- Most recent changes at top of log
- Optional "Add note" field when saving changes
