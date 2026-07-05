import { test as setup, expect } from '@playwright/test'

const AUTH_FILE = '.playwright/auth.json'

setup('authenticate and capture storage state', async ({ page }) => {
  // The LoginPage auto-tries dev-login on mount. Navigate there,
  // wait for redirect to dashboard, then save storage state.
  await page.goto('/auth/login')
  await page.waitForURL('/dashboard', { timeout: 15_000 })

  // Confirm dashboard rendered with app shell
  await expect(page.locator('aside[aria-label="Main navigation"]')).toBeAttached({
    timeout: 5_000,
  })

  // Save storage state for the authenticated project
  await page.context().storageState({ path: AUTH_FILE })
})
