import { test, expect } from '@playwright/test'

test.describe('Authenticated Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // The auth-setup project already logged in and saved storageState.
    // The 'authenticated' project loads that state, so navigating to
    // /dashboard should show the protected page without redirect.
    await page.goto('/dashboard')
  })

  test.describe('Sidebar Navigation', () => {
    test('renders main nav items', async ({ page }) => {
      const sidebar = page.locator('aside[aria-label="Main navigation"]')
      await expect(sidebar).toBeVisible()

      await expect(sidebar.getByLabel('Dashboard')).toBeVisible()
      await expect(sidebar.getByLabel('Applications')).toBeVisible()
      await expect(sidebar.getByLabel('Career Profile')).toBeVisible()
      await expect(sidebar.getByLabel('Analytics')).toBeVisible()
      await expect(sidebar.getByLabel('Settings')).toBeVisible()
    })

    test('shows branding and new application button', async ({ page }) => {
      const sidebar = page.locator('aside[aria-label="Main navigation"]')

      await expect(sidebar.getByText('ApplyFlow AI')).toBeVisible()
      await expect(sidebar.getByText('Career Workspace')).toBeVisible()

      // New Application button
      await expect(sidebar.getByText('New Application')).toBeVisible()
    })

    test('navigates to Applications page', async ({ page }) => {
      await page.getByLabel('Applications').click()
      await expect(page).toHaveURL('/applications')
    })

    test('navigates to Career Profile page', async ({ page }) => {
      await page.getByLabel('Career Profile').click()
      await expect(page).toHaveURL('/profile')
    })

    test('navigates to Settings page', async ({ page }) => {
      await page.getByLabel('Settings').click()
      await expect(page).toHaveURL('/settings')
    })

    test('collapse toggle works', async ({ page }) => {
      const sidebar = page.locator('aside[aria-label="Main navigation"]')
      const collapseBtn = sidebar.getByLabel('Collapse sidebar')
      await expect(collapseBtn).toBeVisible()

      await collapseBtn.click()

      // After collapse nav labels should be hidden, expand button should show
      await expect(sidebar.getByLabel('Expand sidebar')).toBeVisible()
    })
  })

  test.describe('Top Bar', () => {
    test('shows user avatar and search bar', async ({ page }) => {
      // User avatar initials in top bar
      await expect(page.getByLabel('User avatar')).toBeVisible()
      await expect(page.getByLabel('User avatar')).toHaveText('SA')

      // Search bar
      await expect(page.getByLabel('Search')).toBeVisible()

      // Notification bell
      await expect(page.getByLabel('Notifications')).toBeVisible()

      // Help button
      await expect(page.getByLabel('Help')).toBeVisible()
    })
  })

  test.describe('Dashboard Sections', () => {
    test('shows stat cards with section headings', async ({ page }) => {
      await expect(page.getByText('Total Applications')).toBeVisible()
      await expect(page.getByText('Active Applications')).toBeVisible()
      await expect(page.getByText('Interviews Scheduled')).toBeVisible()
      await expect(page.getByText('Offers Received')).toBeVisible()
    })

    test('shows stat card values (loading states or zeroes)', async ({ page }) => {
      // The cards show '-' when loading or '0' when no data exists
      const statValues = page.locator('text=-').or(page.locator('text=0'))
      await expect(statValues.first()).toBeAttached({ timeout: 5_000 })
    })

    test('shows Recent Applications section', async ({ page }) => {
      await expect(page.getByText('Recent Applications')).toBeVisible()
      await expect(page.getByText('View All')).toBeVisible()
    })

    test('shows Activity Feed section', async ({ page }) => {
      await expect(page.getByText('Activity Feed')).toBeVisible()
    })

    test('shows Quick Actions section with all 4 cards', async ({ page }) => {
      await expect(page.getByText('Quick Actions')).toBeVisible()
      await expect(page.getByText('Jump to any part of the workflow')).toBeVisible()

      await expect(page.getByText('Analyze New Job')).toBeVisible()
      await expect(page.getByText('View Applications')).toBeVisible()
      await expect(page.getByText('Update Profile')).toBeVisible()
      await expect(page.getByText('Prepare for Interview')).toBeVisible()
    })

    test('quick action card navigates to JD Analysis', async ({ page }) => {
      await page.getByText('Analyze New Job').click()
      await expect(page).toHaveURL('/jd-analysis')
    })

    test('quick action card navigates to Applications', async ({ page }) => {
      await page.getByText('View Applications').click()
      await expect(page).toHaveURL('/applications')
    })

    test('quick action card navigates to Interview Prep', async ({ page }) => {
      await page.getByText('Prepare for Interview').click()
      await expect(page).toHaveURL('/interview')
    })

    test('View All link navigates to Applications page', async ({ page }) => {
      await page.getByText('View All').click()
      await expect(page).toHaveURL('/applications')
    })
  })
})
