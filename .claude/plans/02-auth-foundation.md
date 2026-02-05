# PLAN 02: Auth Foundation

## Existing Implementation (Reference)

**Files created:**
- `app/pages/login.vue` - Login form
- `app/pages/register.vue` - Registration with email confirmation
- `app/pages/confirm.vue` - Email confirmation landing
- `app/composables/useAuth.ts` - Auth composable
- `app/layouts/auth.vue` - Auth page layout
- `app/middleware/child.ts` - Protected route middleware

---

## Task 2.1: Configure Supabase Auth

**Step 1: Enable email auth**
- Dashboard > Authentication > Providers
- Email: Enabled
- Confirm email: Enabled (for production)

**Step 2: Set redirect URLs**
- Dashboard > Authentication > URL Configuration
- Site URL: `http://localhost:3000` (dev) or production URL
- Redirect URLs: Add `http://localhost:3000/confirm`

**Step 3: Customize email templates (optional)**
- Dashboard > Authentication > Email Templates
- Customize confirmation email

---

## Task 2.2: Test Auth Flow

**Step 1: Register**
- Go to `/register`
- Enter email, password
- Click "Create Account"
- Check email for confirmation link

**Step 2: Confirm**
- Click confirmation link
- Should redirect to `/confirm` then `/`

**Step 3: Login**
- Go to `/login`
- Enter credentials
- Should redirect to `/` (or `/settings/child` if no child)

**Step 4: Protected routes**
- Try accessing `/` when logged out
- Should redirect to `/login`
