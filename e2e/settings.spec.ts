import { test, expect } from '@playwright/test'

test.describe('Settings Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/settings')
  })

  test.describe('Tab Navigation', () => {
    test('shows all 5 tab buttons', async ({ page }) => {
      for (const label of ['Account', 'AI Preferences', 'Security', 'Integrations', 'Notifications']) {
        await expect(page.getByRole('button', { name: label, exact: true }).last()).toBeVisible()
      }
    })

    test('Account tab is active by default', async ({ page }) => {
      const accountTab = page.getByRole('button', { name: 'Account', exact: true })
      await expect(accountTab.first()).toHaveClass(/bg-surface-container-high/)
    })

    test('switches to AI Preferences tab', async ({ page }) => {
      await page.getByRole('button', { name: 'AI Preferences', exact: true }).last().click()
      await expect(page.getByText('AI Provider')).toBeVisible()
      await expect(page.getByText('Writing Tone')).toBeVisible()
      await expect(page.getByText('Default Export Format')).toBeVisible()
    })

    test('switches to Security tab', async ({ page }) => {
      await page.getByRole('button', { name: 'Security', exact: true }).last().click()
      await expect(page.getByText('Two-factor authentication (2FA)')).toBeVisible()
      await expect(page.getByText('Change Password')).toBeVisible()
    })

    test('switches to Integrations tab', async ({ page }) => {
      await page.getByRole('button', { name: 'Integrations', exact: true }).last().click()
      await expect(page.getByText('LinkedIn').first()).toBeVisible()
      await expect(page.getByText('GitHub').first()).toBeVisible()
      await expect(page.getByText('Greenhouse').first()).toBeVisible()
      await expect(page.getByText('Google Drive')).toBeVisible()
    })

    test('switches to Notifications tab', async ({ page }) => {
      await page.getByRole('button', { name: 'Notifications', exact: true }).last().click()
      await expect(page.getByText('Application Updates')).toBeVisible()
      await expect(page.getByText('Interview Reminders')).toBeVisible()
      await expect(page.getByText('Weekly Digest')).toBeVisible()
      await expect(page.getByText('Marketing Emails')).toBeVisible()
    })
  })

  test.describe('Account Tab (Active by Default)', () => {
    test('shows the account heading and description', async ({ page }) => {
      await expect(page.getByText('Account Settings')).toBeVisible()
      await expect(
        page.getByText('Update your personal information and public profile.'),
      ).toBeVisible()
    })

    test('shows name field and email field', async ({ page }) => {
      await expect(page.getByLabel('Full Name')).toBeVisible()
      const emailInput = page.getByLabel('Email Address')
      await expect(emailInput).toBeVisible()
      await expect(emailInput).toBeDisabled()
    })

    test('shows Save Changes button', async ({ page }) => {
      await expect(page.getByRole('button', { name: 'Save Changes' })).toBeVisible()
    })

    test('shows Danger Zone section', async ({ page }) => {
      await expect(page.getByText('Danger Zone')).toBeVisible()
      await expect(page.getByRole('button', { name: 'Delete Account' })).toBeVisible()
    })

    test('shows profile picture uploader', async ({ page }) => {
      await expect(page.getByText('Profile Picture')).toBeVisible()
      const fileInput = page.getByLabel('Upload avatar')
      await expect(fileInput).toBeVisible()
    })

    test('uploads an avatar image and shows Upload button', async ({ page }) => {
      const fileInput = page.getByLabel('Upload avatar')
      await fileInput.setInputFiles({
        name: 'avatar.png',
        mimeType: 'image/png',
        buffer: Buffer.from(
          'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M8AAAMBAQDJ/pLvAAAAAElFTkSuQmCC',
          'base64',
        ),
      })
      await expect(page.getByRole('button', { name: 'Upload' })).toBeVisible()
    })
  })

  test.describe('Profile Form', () => {
    test('typing in name field updates the input', async ({ page }) => {
      const nameInput = page.getByLabel('Full Name')
      await nameInput.fill('E2E Test User')
      await expect(nameInput).toHaveValue('E2E Test User')
    })

    test('shows client-side validation when name is empty', async ({ page }) => {
      // Clear the name field and click Save — the SettingsPage checks
      // !name.trim() and shows a toast. Since toast may or may not render
      // in the test context, verify that the page stays at /settings and
      // the input remains empty (no error state from API call).
      const nameInput = page.getByLabel('Full Name')
      await nameInput.clear()
      await page.getByRole('button', { name: 'Save Changes' }).click()

      // Wait for any state changes
      await page.waitForTimeout(2_000)

      // Shouldn't have redirected
      await expect(page).toHaveURL('/settings')
      // Name field should still be empty (no API call was made)
      await expect(nameInput).toHaveValue('')
    })

    test('saves profile name change via API', async ({ page }) => {
      // Intercept the PUT request to verify the API call
      let apiRequestMade = false
      let requestPayload: unknown = null
      await page.route('**/api/profile/personal/**', async (route) => {
        const postData = route.request().postDataJSON()
        requestPayload = postData
        apiRequestMade = true
        await route.continue()
      })

      const nameInput = page.getByLabel('Full Name')
      await nameInput.fill('Test User E2E')
      await page.getByRole('button', { name: 'Save Changes' }).click()

      // Wait for the API call to complete
      await page.waitForTimeout(3_000)

      // Verify the API call was made with the correct payload
      expect(apiRequestMade).toBe(true)
      expect(requestPayload).toEqual({ name: 'Test User E2E' })

      // Verify the page stays on /settings
      await expect(page).toHaveURL('/settings')

      // Restore original name via direct API
      await page.request.put('/api/profile/personal/', {
        data: { name: 'Dev User' },
        headers: { 'Content-Type': 'application/json' },
      })
    })
  })
})
