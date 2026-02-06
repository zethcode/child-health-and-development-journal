# 👶 Child Health & Development Journal

A mobile-first Progressive Web App for parents to track their child's medicines, health events, and developmental milestones — all in one place.

## Purpose

Managing a child's daily medications, vitamins, and health history can be overwhelming. This app provides a simple, beautiful interface to:

- Never miss a dose with scheduled reminders and daily progress tracking
- Keep a complete health timeline — illnesses, vaccinations, appointments, treatments
- Record fever readings instantly with auto-severity detection
- Track growth measurements and medical conditions over time
- Share health summaries with pediatricians during visits

## Features

### 💊 Medicine & Supplement Tracking
- Add medicines, vitamins, and supplements with dosage, unit, description, and instructions
- Search and filter by type (medicine / vitamin / supplement)
- Toggle active/inactive status

### ⏰ Dose Scheduling & Logging
- Create recurring daily schedules with specific times and days of the week
- Automatic intake log generation from schedules
- Daily progress dashboard showing taken, skipped, and pending doses
- Manual dose logging for as-needed medications

### 🩺 Health Events
- Record illnesses, vaccinations, milestones, appointments, and treatments
- Link medicines to illness and treatment events
- Track severity levels and date ranges
- Multi-day events displayed across calendar dates
- Structured fever recording with temperature, medication taken, and auto-severity

### 📅 Calendar View
- Monthly calendar with color-coded event indicators
- Multi-day illness/event spanning with visual start/middle/end markers
- Filter by intakes and health event sub-types
- Detailed event list for selected date

### 📋 Child Portfolio
- Profile with birth date, measurements (height, weight, head circumference)
- Blood type, allergies, and medical conditions
- Automatic change log tracking all profile updates over time
- Age calculation displayed throughout the app

### 🏠 Today Page
- Daily greeting with child's name and age
- Progress card with percentage and dose breakdown
- Quick actions: Add Medicine, Log Dose, Quick Fever, Add Event
- Active illness alerts and upcoming appointment reminders

### ✨ Additional
- Push notifications via Web Push API
- PWA — installable on mobile home screen
- Dark mode support
- Responsive design optimized for mobile

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Nuxt 4](https://nuxt.com) + [Vue 3](https://vuejs.org) + TypeScript |
| UI Components | [Nuxt UI](https://ui.nuxt.com) (Tailwind CSS) |
| Database | [Supabase](https://supabase.com) (PostgreSQL) with Row-Level Security |
| Authentication | Supabase Auth (email/password) |
| Notifications | Web Push API (VAPID) |
| PWA | [@vite-pwa/nuxt](https://vite-pwa-org.netlify.app/frameworks/nuxt) |
| Testing | [Playwright](https://playwright.dev) (E2E) |

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- A [Supabase](https://supabase.com) project

### Setup

```bash
# Clone the repository
git clone <repo-url>
cd child-health-and-development-journal

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Fill in your Supabase URL, anon key, and VAPID keys

# Run database migrations
# Apply the SQL files in supabase/migrations/ in order (001 through 006)

# Start development server
pnpm dev
```

### Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm preview` | Preview production build |
| `pnpm test` | Run Playwright E2E tests |
| `pnpm test:ui` | Run tests with Playwright UI |

## 📁 Project Structure

```
app/
├── components/          # Vue components (health, intake, schedule, substance)
├── composables/         # Data logic (useAuth, useChild, useSubstances, useSchedules,
│                        #   useIntakeLogs, useHealthEvents, useChildPortfolio, useNotifications)
├── layouts/             # App layout with bottom navigation (5 tabs)
├── middleware/           # Route guards (auth, child)
├── pages/               # Page components (16 total)
└── server/              # API routes
types/
└── database.types.ts    # TypeScript definitions for all tables & enums
supabase/
└── migrations/          # SQL migrations (001-006)
public/                  # Static assets & PWA icons
```

## 🗄 Database

Six migrations build the complete schema:

| Migration | Purpose |
|-----------|---------|
| 001 | Initial schema — all core tables, RLS policies, triggers |
| 002 | Child portfolio fields and profile change log |
| 003 | Web Push subscription table |
| 004 | Substance description column |
| 005 | Treatment event type and health_event_substances junction table |
| 006 | Health events metadata JSONB column |

All tables are protected by Row-Level Security policies scoped to `auth.uid()`.

## License

Private project.
