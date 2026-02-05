import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('shows login page for unauthenticated users', async ({ page }) => {
    await page.goto('/')
    // Should redirect to login page
    await expect(page).toHaveURL('/login')
  })

  test('login page has required elements', async ({ page }) => {
    await page.goto('/login')

    // Check for email input
    await expect(page.getByPlaceholder(/email/i)).toBeVisible()

    // Check for password input
    await expect(page.getByPlaceholder(/password/i)).toBeVisible()

    // Check for sign in button
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()

    // Check for link to register
    await expect(page.getByText(/create one/i)).toBeVisible()
  })

  test('can navigate to register page', async ({ page }) => {
    await page.goto('/login')
    await page.getByText(/create one/i).click()
    await expect(page).toHaveURL('/register')
  })

  test('register page has required elements', async ({ page }) => {
    await page.goto('/register')

    // Check for email input
    await expect(page.getByPlaceholder(/email/i)).toBeVisible()

    // Check for password input
    await expect(page.getByPlaceholder(/password/i).first()).toBeVisible()

    // Check for create account button
    await expect(page.getByRole('button', { name: /create account/i })).toBeVisible()

    // Check for link back to login
    await expect(page.getByText(/sign in/i)).toBeVisible()
  })

  test('can navigate back to login from register', async ({ page }) => {
    await page.goto('/register')
    await page.getByText(/sign in/i).click()
    await expect(page).toHaveURL('/login')
  })

  test('shows validation error for empty login', async ({ page }) => {
    await page.goto('/login')

    // Click sign in without filling fields
    await page.getByRole('button', { name: /sign in/i }).click()

    // Should still be on login page (form validation prevents submission)
    await expect(page).toHaveURL('/login')
  })
})

test.describe('Protected Routes', () => {
  test('medicines page redirects to login', async ({ page }) => {
    await page.goto('/medicines')
    await expect(page).toHaveURL('/login')
  })

  test('schedules page redirects to login', async ({ page }) => {
    await page.goto('/schedules')
    await expect(page).toHaveURL('/login')
  })

  test('calendar page redirects to login', async ({ page }) => {
    await page.goto('/calendar')
    await expect(page).toHaveURL('/login')
  })

  test('settings page redirects to login', async ({ page }) => {
    await page.goto('/settings')
    await expect(page).toHaveURL('/login')
  })
})
