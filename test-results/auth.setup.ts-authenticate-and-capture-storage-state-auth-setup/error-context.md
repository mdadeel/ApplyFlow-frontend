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
  navigated to "http://localhost:5173/auth/login"
  navigated to "http://localhost:5173/auth/login"
============================================================
```

# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e8]:
    - img [ref=e10]
    - heading "ApplyFlow AI" [level=1] [ref=e12]
    - paragraph [ref=e13]: Your Intelligent Job Application OS
    - paragraph [ref=e14]: Streamline your job search with AI-powered resume tailoring, intelligent job matching, and automated application tracking.
  - generic [ref=e17]:
    - generic [ref=e18]:
      - heading "Welcome Back" [level=2] [ref=e19]
      - paragraph [ref=e20]: Sign in to your account
    - generic [ref=e21]:
      - generic [ref=e22]:
        - generic [ref=e23]: Email
        - textbox "Email" [ref=e25]:
          - /placeholder: you@example.com
      - generic [ref=e26]:
        - generic [ref=e27]:
          - generic [ref=e28]: Password
          - textbox "Password" [ref=e30]:
            - /placeholder: Enter your password
        - button [ref=e31] [cursor=pointer]:
          - img [ref=e32]
      - generic [ref=e35] [cursor=pointer]:
        - switch "Remember me" [ref=e36]
        - generic [ref=e38]: Remember me
      - button "Sign In" [ref=e39] [cursor=pointer]
    - generic [ref=e44]: or
    - button "Try Demo Account" [ref=e45] [cursor=pointer]
    - paragraph [ref=e46]: No registration needed — instantly explore all features.
    - paragraph [ref=e47]:
      - text: Don't have an account?
      - link "Register" [ref=e48] [cursor=pointer]:
        - /url: /auth/register
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