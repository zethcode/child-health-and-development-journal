# PLAN 07: Testing & Polish

## Task 7.1: Setup Playwright

**Step 1: Install**
```bash
npm install -D @playwright/test
npx playwright install chromium
```

**Step 2: Create config**

**Files:**
- Create: `playwright.config.ts`

```typescript
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  webServer: {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: true,
  },
  use: {
    baseURL: 'http://localhost:3000',
  },
})
```

---

## Task 7.2: Write Auth Tests

**Files:**
- Create: `tests/e2e/auth.spec.ts`

```typescript
import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('shows login page for unauthenticated users', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL('/login')
  })

  test('can navigate to register', async ({ page }) => {
    await page.goto('/login')
    await page.click('text=Create one')
    await expect(page).toHaveURL('/register')
  })
})
```

**Run:**
```bash
npx playwright test
```

---

## Task 7.3: Add Loading States

**Files to check:**
- `app/pages/index.vue` - Dashboard loading
- `app/pages/medicines/index.vue` - List loading
- `app/pages/calendar.vue` - Calendar loading

Ensure all pages show loading spinners while fetching data.

---

## Task 7.4: Add Error Handling

**Files to check:**
- All composables - Add try/catch with user-friendly errors
- All forms - Show error alerts on submit failure
