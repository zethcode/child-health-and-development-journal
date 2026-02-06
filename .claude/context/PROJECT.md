# Child Health & Development Journal

## What This App Does

A mobile-first Progressive Web App (PWA) for parents to track their child's:
- **Medicines, vitamins, and supplements** — with dosage, instructions, descriptions
- **Dose schedules** — recurring daily schedules with reminders
- **Intake logs** — daily progress tracking (taken/skipped/pending)
- **Health events** — illnesses, vaccinations, milestones, appointments, treatments
- **Child portfolio** — profile with measurements, allergies, medical conditions, change history
- **Fever quick-add** — structured temperature recording with auto-severity
- **Medicine-event linking** — connect medicines to illness/treatment events

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Nuxt 4 + Vue 3 + TypeScript |
| UI | Nuxt UI (Tailwind CSS) — coral/orange gradient theme |
| Database | Supabase (PostgreSQL) with Row-Level Security |
| Auth | Supabase Auth (email/password) |
| Notifications | Web Push API (VAPID) |
| PWA | Vite PWA Plugin |
| Testing | Playwright (E2E) |

## Project Structure

```
app/
├── components/         # Reusable Vue components
│   ├── app/            # AppHeader
│   ├── child/          # ProfileLogEntry
│   ├── health/         # QuickAddFever, EventWithMedicines
│   ├── intake/         # IntakeCard
│   ├── schedule/       # ScheduleCard
│   └── substance/      # SubstanceCard
├── composables/        # State management & data logic
│   ├── useAuth.ts
│   ├── useChild.ts
│   ├── useChildPortfolio.ts
│   ├── useHealthEvents.ts
│   ├── useIntakeLogs.ts
│   ├── useNotifications.ts
│   ├── useSchedules.ts
│   └── useSubstances.ts
├── layouts/            # default.vue (bottom nav with 5 tabs)
├── middleware/          # Route guards (auth, child)
├── pages/              # 16 page components
│   ├── index.vue       # Today page (daily progress, quick actions)
│   ├── calendar.vue    # Calendar with multi-day events, sub-filters
│   ├── medicines/      # CRUD + log + search
│   ├── schedules/      # CRUD
│   └── settings/       # Profile, child, health events
├── server/             # API routes
└── app.vue             # Root component
types/
└── database.types.ts   # Manual TypeScript types for all tables + enums
supabase/
└── migrations/         # 6 SQL migration files (001-006)
```

## Database Schema

### Tables
| Table | Purpose |
|-------|---------|
| `profiles` | User settings (timezone, notifications) |
| `children` | Child info (name, birth_date, measurements, allergies) |
| `substances` | Medicines, vitamins, supplements (with description field) |
| `schedules` | Recurring dose schedules (time, days_of_week) |
| `intake_logs` | Individual dose records (status: pending/taken/skipped/missed) |
| `health_events` | Illness, vaccination, milestone, appointment, treatment, other (with metadata JSONB) |
| `health_event_substances` | Junction: links health events to substances |
| `child_profile_logs` | Change history for child profile updates |
| `push_subscriptions` | Web Push subscription data |
| `scheduled_notifications` | Notification queue |

### Key Enums
- `substance_type`: medicine, vitamin, supplement
- `health_event_type`: illness, vaccination, milestone, appointment, treatment, other
- `intake_status`: pending, taken, skipped, missed
- `severity_level`: low, medium, high

## Architecture Patterns

### Composables (State Management)
- All data access through composables using `useSupabaseClient()`
- Reactive state with `useState()` for cross-component sharing
- Loading/error states managed per composable
- User/child context injected via `useSupabaseUser()` and `useChild()`

### Data Flow
1. Page mounts → calls composable's `fetch*()` function
2. Composable queries Supabase with RLS (auto-filtered by user_id)
3. Data stored in `useState()` reactive refs
4. Components render from shared state
5. Mutations update both database and local state

### UI Design System
- **Colors**: Coral/orange gradient for primary, type-specific gradients for categories
- **Cards**: `rounded-2xl` with `ring-1 ring-gray-200` border, `shadow-sm`
- **Icons**: Gradient background squares with shadow (`shadow-lg shadow-X-200`)
- **Bottom nav**: 5 tabs (Today, Calendar, Medicines, Schedules, Settings)
- **Forms**: `rounded-xl` inputs, gradient submit buttons, inline validation errors
- **Loading**: Skeleton placeholders (animated pulse), not spinners
- **Empty states**: Centered icon + message + action button

### Security
- All tables have Row-Level Security policies
- Queries auto-scoped to `auth.uid()`
- Junction table RLS via parent table join
- No secrets in client code (VAPID key is public)

## Known Issues / Technical Debt
- Supabase client types resolve to `never` — the Database generic isn't properly wired to `useSupabaseClient()`. Build works fine; only `nuxi typecheck` complains.
- Module alias `~/types/database.types` fails TS resolution in strict typecheck but resolves at build time via Vite.
- FCM was replaced with Web Push API but some migration naming may reference old pattern.

## Development

```bash
# Install dependencies
pnpm install

# Dev server
pnpm dev

# Build
pnpm build

# Type check (expect pre-existing errors)
npx nuxi typecheck
```

## Future Considerations

See `.claude/plans/02-release/` for the current release 2 plan details.
See "Planned / Potential Features" section below for what's next.

### Planned / Potential Features
- **Data export** — PDF/CSV reports of intake history and health events
- **Multi-child support** — switch between children within the same account
- **Doctor visit summaries** — auto-generate health summary for pediatrician visits
- **Growth charts** — plot height/weight/head circumference over time with WHO percentiles
- **Medication reminders** — timed push notifications before scheduled doses
- **Offline support** — service worker caching for offline viewing of recent data
- **Photo attachments** — attach photos to health events (rashes, milestone moments)
- **Shared access** — invite partner/caregiver with read or read/write access
- **Medication interactions** — basic warnings when adding conflicting medicines
- **Recurring health events** — templates for regular appointments (well-child visits)
- **Dashboard analytics** — adherence rates, missed dose patterns, illness frequency
- **i18n** — multi-language support
- **Dark mode refinement** — full dark mode audit and polish

### Architecture Evolution Candidates
- Migrate to auto-generated Supabase types (fix the `never` typing issue)
- Add Pinia if state management grows more complex
- Add unit tests for composables
- Server-side rendering for initial page loads
- Real-time subscriptions for multi-device sync
