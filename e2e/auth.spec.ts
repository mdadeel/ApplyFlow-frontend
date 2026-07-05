import { test, expect } from '@playwright/test'

test.describe('Login Page', () => {
  test.beforeEach(async ({ page }) => {
    // Block the dev-login auto-redirect so the form stays visible
    await page.route('**/api/auth/dev-login', (route) =>
      route.fulfill({ status: 404, body: 'not available' }),
    )
    await page.goto('/auth/login')
  })

  test('renders the login page with all key elements', async ({ page }) => {
    // Branding
    await expect(page.getByText('ApplyFlow AI')).toBeVisible()
    await expect(page.getByText('Your Intelligent Job Application OS')).toBeVisible()

    // Form heading
    await expect(page.getByText('Welcome Back')).toBeVisible()
    await expect(page.getByText('Sign in to your account')).toBeVisible()

    // Form fields
    await expect(page.getByPlaceholder('you@example.com')).toBeVisible()
    await expect(page.getByPlaceholder('Enter your password')).toBeVisible()

    // Buttons / links
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible()
    await expect(page.getByText('Register')).toBeVisible()
  })

  test('shows validation error on empty form submission', async ({ page }) => {
    const signInButton = page.getByRole('button', { name: 'Sign In' })
    await signInButton.click()

    // The app validates empty fields client-side
    await expect(page.getByText('Please fill in all fields')).toBeVisible()
  })

  test('navigates to register page', async ({ page }) => {
    await page.getByRole('link', { name: 'Register' }).click()
    await expect(page).toHaveURL('/auth/register')
  })
})

test.describe('Login Page — API-dependent', () => {
  test.beforeEach(async ({ page }) => {
    // Block dev-login so we stay on the form
    await page.route('**/api/auth/dev-login', (route) =>
      route.fulfill({ status: 404, body: 'not available' }),
    )
    await page.goto('/auth/login')
  })

  test('shows error on invalid credentials', async ({ page }) => {
    await page.getByPlaceholder('you@example.com').fill('wrong@example.com')
    await page.getByPlaceholder('Enter your password').fill('wrongpassword')

    await page.getByRole('button', { name: 'Sign In' }).click()

    // The API layer throws 'Unauthorized' for any 401 response
    await expect(page.getByText('Unauthorized')).toBeVisible({ timeout: 10_000 })
  })
})

test.describe('Register Page', () => {
  test.beforeEach(async ({ page }) => {
    // Block dev-login so the user stays on the register page
    await page.route('**/api/auth/dev-login', (route) =>
      route.fulfill({ status: 404, body: 'not available' }),
    )
    await page.goto('/auth/register')
  })

  test('renders the registration form', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Create Account' })).toBeVisible()
    await expect(page.getByPlaceholder('John Doe')).toBeVisible()
    await expect(page.getByPlaceholder('you@example.com')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Create Account' })).toBeVisible()

    // Link back to login
    await expect(page.getByRole('link', { name: 'Sign In' })).toBeVisible()
  })

  test('shows validation error on empty registration', async ({ page }) => {
    await page.getByRole('button', { name: 'Create Account' }).click()
    await expect(page.getByText('Please fill in all fields')).toBeVisible()
  })

  test('navigates back to login page', async ({ page }) => {
    await page.getByRole('link', { name: 'Sign In' }).click()
    await expect(page).toHaveURL('/auth/login')
  })
})
