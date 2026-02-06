# PLAN 05: Calendar View

## Existing Implementation (Reference)

**Files created:**
- `app/pages/calendar.vue` - Calendar with month view
- `app/pages/settings/health-events.vue` - Health events CRUD
- `server/api/calendar/events.get.ts` - Aggregated events API

---

## Task 5.1: Test Calendar

**Step 1: View calendar**
- Go to `/calendar`
- Verify: Current month displays
- Verify: Event dots show on days with data

**Step 2: Navigate months**
- Click < and > arrows
- Verify: Month changes, events update

**Step 3: Filter events**
- Toggle "Intakes" off
- Verify: Only health events show
- Toggle "Health Events" off
- Verify: Only intake events show

---

## Task 5.2: Test Health Events

**Step 1: Add illness**
- Go to `/settings` > "Health Events"
- Click "Add"
- Type="Illness", Title="Fever", Start date=Today
- Save
- Verify: Appears in list

**Step 2: View on calendar**
- Go to `/calendar`
- Verify: Today shows illness indicator
