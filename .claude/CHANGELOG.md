# Changelog

All notable changes to the Child Health & Development Journal are documented here.

---

## [0.2.0] — 2026-02-07 — Release 2: Bug Fixes, Features & UI/UX

### Plan Organization
- Moved 9 completed MVP plan files to `.claude/plans/01-mvp/`
- Created `.claude/plans/02-release/` with 4 phase plan files: A-bug-fixes, B-migrations, C-features, D-ui-ux
- Added `.claude/context/PROJECT.md` with full project context, architecture docs, and future roadmap
- Added `.claude/CHANGELOG.md` (this file)

### Bug Fixes (Phase A)
- **A1: Schedules tab in bottom nav** — Added 5th navigation tab (`i-heroicons-clock` icon) between Medicines and Settings in `app/layouts/default.vue`. Reduced font size from `text-[10px]` to `text-[9px]` to prevent cramping on small screens.
- **A2: Multi-day illness on calendar** — Fixed `getEventsForDate()` in `app/pages/calendar.vue` to check if a date falls within `[start_date, end_date]` range for health events. Updated the Supabase query to fetch events that overlap the displayed month (not just those starting in it). Added visual distinction: connecting bars for middle days, rounded start/end indicators.

### Database Migrations (Phase B)
- **B1: `004_substance_description.sql`** — Added `description TEXT` column to `substances` table.
- **B2: `005_treatment_and_linking.sql`** — Added `'treatment'` value to `health_event_type` enum. Created `health_event_substances` junction table (health_event_id, substance_id, dosage_override, notes) with unique constraint, indexes on both FKs, and 4 RLS policies (SELECT/INSERT/UPDATE/DELETE via health_events user_id join).
- **B3: `006_health_event_metadata.sql`** — Added `metadata JSONB` column to `health_events` table for structured data (fever readings, etc.).
- **B4: Type definitions** — Updated `types/database.types.ts`:
  - Added `description` field to substances Row/Insert/Update
  - Added `'treatment'` to health_event_type enum and all health_events type unions
  - Added `metadata: Json | null` to health_events Row/Insert/Update
  - Added `health_event_substances` table type (Row/Insert/Update)
  - Added `HealthEventSubstance` convenience alias
  - Added `HealthEventWithSubstances` extended type with nested substance relations

### Core Features (Phase C)
- **C1: Medicine description field**
  - Added `description` to form reactive state in `app/pages/medicines/new.vue` and `app/pages/medicines/[id].vue`
  - Added description textarea (placeholder: "Reduces fever and relieves pain") between dosage and instructions in both forms
  - Included description in create/update payloads
  - Displayed description in `app/components/substance/SubstanceCard.vue` below name in muted text

- **C2: `useHealthEvents` composable** — Created `app/composables/useHealthEvents.ts`:
  - CRUD: `fetchHealthEvents`, `createHealthEvent`, `updateHealthEvent`, `deleteHealthEvent`
  - Linking: `fetchHealthEventWithSubstances`, `fetchEventsWithSubstances`, `linkSubstanceToEvent`, `unlinkSubstanceFromEvent`
  - Computed: `activeIllnesses` (illness without end_date), `upcomingAppointments` (future appointments)
  - Refactored `app/pages/settings/health-events.vue` to use composable instead of direct Supabase calls

- **C3: Treatment event type + medicine linking UI** — Updated `app/pages/settings/health-events.vue`:
  - Added "Treatment" to typeOptions (pink gradient, `i-heroicons-heart` icon)
  - Changed type grid from 5-column to 3-column to accommodate 6 types
  - Added medicine multi-select (checkbox list of active substances) when type is illness or treatment
  - Submit handler now syncs medicine links (adds new, removes unlinked)
  - Event cards show expandable "Medicines" toggle with linked medicine badges
  - Added severity option for treatment type
  - Updated `getTypeShadow()` and `getTypeConfig()` for treatment type

- **C4: Quick Add Fever** — Created `app/components/health/QuickAddFever.vue`:
  - Modal form: temperature (number + C/F toggle), date/time, medication checkbox (brand + dosage), notes
  - Auto-severity: >=39°C = high, >=38°C = medium, >=37.5°C = low (with F equivalents)
  - Visual severity indicator with color-coded label
  - Saves as health_event type=illness with structured `metadata` JSONB
  - Integrated on Today page (`app/pages/index.vue`) via Quick Actions grid and modal

- **C5: Medicine grouping display** — Created `app/components/health/EventWithMedicines.vue`:
  - Expandable card showing health event with type icon and gradient
  - Badge showing linked medicine count
  - Expand to reveal individual medicines with name, dosage override, and notes
  - Supports all health event types with color-coded gradients

### UI/UX Improvements (Phase D)
- **D1: Today page quick actions** — Updated `app/pages/index.vue`:
  - Added 2x2 quick action grid: Add Medicine (blue), Log Dose (emerald), Quick Fever (red/orange), Add Event (rose/pink)
  - Added active illness alert banner (red) when illness has no end_date
  - Added upcoming appointment reminder (teal) for future appointments
  - Integrated QuickAddFever modal triggered from quick action card

- **D2: Calendar visual improvements** — Updated `app/pages/calendar.vue`:
  - Added health event sub-filter chips (illness, treatment, vaccination, milestone, appointment, other) — togglable per type
  - Events filtered by sub-type in both calendar dots and event list
  - Added `treatment` to `getEventTypeColor()` (pink) and `getEventTypeIcon()` (heart)
  - Multi-day events show position label in event list (started/ongoing/ended)
  - Updated event badge colors to be type-specific (red, pink, blue, teal, purple)

- **D3: Medicine page search** — Updated `app/pages/medicines/index.vue`:
  - Added search bar at top with magnifying glass icon and clear button
  - Filters by name, description, and instructions (case-insensitive)
  - Search-aware empty state ("No results for X" vs category empty message)
  - Improved default empty state with tip text

- **D4: General UX polish**:
  - **Skeleton loading states**: Today page (card + grid + list skeletons), medicines list (3 card skeletons), health events list (3 card skeletons)
  - **Form validation**: Name min 2 chars (medicines new/edit), title min 2 chars (health events), end date after start date. Inline error display via UFormGroup `:error` prop.
  - **Disabled submit buttons** when form is invalid with opacity/cursor styling

### Files Changed
```
Modified:
  app/layouts/default.vue                    — 5-tab nav, smaller font
  app/pages/calendar.vue                     — multi-day events, sub-filters, treatment type
  app/pages/index.vue                        — quick actions, alerts, fever modal, skeleton loading
  app/pages/medicines/index.vue              — search bar, skeleton loading, improved empty state
  app/pages/medicines/new.vue                — description field, form validation
  app/pages/medicines/[id].vue               — description field, form validation
  app/pages/settings/health-events.vue       — composable refactor, treatment type, medicine linking, validation, skeleton loading
  app/components/substance/SubstanceCard.vue — description display
  types/database.types.ts                    — new fields, tables, enums, extended types

Created:
  app/composables/useHealthEvents.ts         — health events composable
  app/components/health/QuickAddFever.vue    — fever quick-add modal
  app/components/health/EventWithMedicines.vue — expandable event+medicines card
  supabase/migrations/004_substance_description.sql
  supabase/migrations/005_treatment_and_linking.sql
  supabase/migrations/006_health_event_metadata.sql
  .claude/plans/02-release/A-bug-fixes.md
  .claude/plans/02-release/B-migrations.md
  .claude/plans/02-release/C-features.md
  .claude/plans/02-release/D-ui-ux.md
  .claude/context/PROJECT.md
  .claude/CHANGELOG.md

Moved:
  .claude/plans/*.md → .claude/plans/01-mvp/  (9 files)
```

---

## [0.1.0] — 2026-02-06 — MVP Release

### Initial Implementation
- User authentication (register, login, logout, email confirmation)
- Substance tracking (medicines, vitamins, supplements CRUD)
- Schedule management (recurring daily schedules with day-of-week selection)
- Intake log generation and daily progress tracking
- Calendar view with monthly navigation and event indicators
- Health events (illness, vaccination, milestone, appointment, other)
- Child portfolio with measurements, allergies, medical conditions
- Profile change log (automatic tracking of child profile updates)
- Web Push notifications (VAPID-based, replaced FCM)
- PWA support (installable, offline-capable shell)
- Responsive mobile-first design with coral/orange theme
- Row-Level Security on all database tables
- Playwright E2E test framework

### Database Migrations
- `001_initial_schema.sql` — Full schema with RLS, triggers, auto-profile creation
- `002_child_portfolio.sql` — Portfolio fields and child_profile_logs
- `003_web_push_migration.sql` — Web Push subscription table (replaced FCM)
