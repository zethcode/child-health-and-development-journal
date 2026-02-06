# PLAN 01: Supabase Setup

## Task 1.1: Create Supabase Project

**Step 1: Create project**
- Go to https://supabase.com
- Click "New Project"
- Name: `child-health-journal`
- Region: Southeast Asia (Singapore) for Philippine users
- Wait for provisioning (~2 minutes)

**Step 2: Get credentials**
- Settings > API
- Copy `Project URL` → `SUPABASE_URL`
- Copy `anon public` key → `SUPABASE_KEY`
- Copy `service_role` key → `SUPABASE_SERVICE_KEY`

---

## Task 1.2: Run Database Migration

**Files:**
- Execute: `supabase/migrations/001_initial_schema.sql`

**Step 1: Open SQL Editor**
- Dashboard > SQL Editor > New query

**Step 2: Run migration**
- Paste entire contents of `001_initial_schema.sql`
- Click "Run"
- Verify: No errors, tables created

**Step 3: Verify tables**
Run:
```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public';
```
Expected: 8 tables (profiles, children, substances, schedules, intake_logs, health_events, push_subscriptions, scheduled_notifications)

---

## Task 1.3: Verify RLS Policies

**Step 1: Check RLS enabled**
```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';
```
Expected: All tables show `rowsecurity = true`

**Step 2: Test policy (from SQL Editor)**
```sql
-- This should return 0 rows (no user context)
SELECT * FROM profiles;
```

---

## Task 1.4: Configure Environment

**Files:**
- Create: `.env` from `.env.example`

```bash
cp .env.example .env
```

Edit `.env`:
```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Verification:**
```bash
npm run dev
# Open http://localhost:3000
# Should load without Supabase warnings
```
