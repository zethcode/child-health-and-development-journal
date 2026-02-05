# PLAN 04: Schedule Management

## Existing Implementation (Reference)

**Files created:**
- `app/pages/schedules/index.vue` - Schedule list
- `app/pages/schedules/new.vue` - Add schedule
- `app/pages/schedules/[id].vue` - Edit schedule
- `app/components/schedule/ScheduleCard.vue` - Card component
- `app/composables/useSchedules.ts` - CRUD composable
- `server/api/intake-logs/generate.post.ts` - Log generation

---

## Task 4.1: Test Schedule Creation

**Step 1: Create schedule**
- Go to `/schedules`
- Click "Add"
- Select medicine, time="08:00", days=Every day
- Submit
- Verify: Appears in schedule list

**Step 2: Verify log generation**
- Call API: `POST /api/intake-logs/generate`
- Check dashboard: New pending intake appears

---

## Task 4.2: Implement Auto-Generation (pg_cron)

**Files:**
- Create: `supabase/migrations/002_daily_log_generation.sql`

```sql
-- Enable pg_cron extension (requires Supabase Pro)
-- CREATE EXTENSION IF NOT EXISTS pg_cron;

-- For now, use Supabase Edge Function with cron trigger
-- See Plan 06 for Edge Function setup
```
