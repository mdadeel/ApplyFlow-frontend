# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.setup.ts >> authenticate and capture storage state
- Location: e2e/auth.setup.ts:5:1

# Error details

```
TimeoutError: page.waitForURL: Timeout 15000ms exceeded.
=========================== logs ===========================
waiting for navigation to "/dashboard" until "load"
============================================================
```

# Test source

```ts
  1  | import { test as setup, expect } from '@playwright/test'
  2  | 
  3  | const AUTH_FILE = '.playwright/auth.json'
  4  | 
  5  | setup('authenticate and capture storage state', async ({ page }) => {
  6  |   // The LoginPage auto-tries dev-login on mount. Navigate there,
  7  |   // wait for redirect to dashboard, then save storage state.
  8  |   await page.goto('/auth/login')
> 9  |   await page.waitForURL('/dashboard', { timeout: 15_000 })
     |              ^ TimeoutError: page.waitForURL: Timeout 15000ms exceeded.
  10 | 
  11 |   // Confirm dashboard rendered with app shell
  12 |   await expect(page.locator('aside[aria-label="Main navigation"]')).toBeAttached({
  13 |     timeout: 5_000,
  14 |   })
  15 | 
  16 |   // Save storage state for the authenticated project
  17 |   await page.context().storageState({ path: AUTH_FILE })
  18 | })
  19 | 
```