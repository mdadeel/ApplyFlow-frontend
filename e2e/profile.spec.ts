import { test, expect } from '@playwright/test'

test.describe('Career Profile Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/profile')
  })

  test.describe('Page Layout', () => {
    test('renders the page heading and action buttons', async ({ page }) => {
      await expect(page.getByText('My Profile')).toBeVisible()
      await expect(page.getByText('Upload PDF')).toBeVisible()
      await expect(page.getByText('Add Experience')).toBeVisible()
    })

    test('shows all 5 tab headers as buttons', async ({ page }) => {
      // The Tabs component renders plain <button> elements (no role="tab")
      // Use { exact: true } to avoid matching action buttons with the same prefix
      for (const tab of ['Experience', 'Projects', 'Skills', 'Education', 'Certificates']) {
        await expect(page.getByRole('button', { name: tab, exact: true })).toBeVisible()
      }
    })
  })

  test.describe('Experience Tab (default active)', () => {
    test('shows seeded experience companies', async ({ page }) => {
      // Use company names which are unique per card
      await expect(page.getByText('Freelance')).toBeVisible()
      await expect(page.getByText('Metro Optics')).toBeVisible()
      await expect(page.getByText('Ayash Tech')).toBeVisible()
    })

    test('shows responsibilities and technology chips', async ({ page }) => {
      // A responsibility unique to the first experience
      await expect(
        page.getByText('Built responsive, accessible user interfaces'),
      ).toBeVisible()

      // Technology chips
      await expect(page.getByText('Tailwind CSS').first()).toBeVisible()
    })

    test('shows date ranges with current position marker', async ({ page }) => {
      // Current position shows "Present"
      await expect(page.getByText('Present')).toBeVisible()

      // Past dates include "2024"
      await expect(page.getByText('2024').first()).toBeVisible()
    })

    test('edit and delete buttons exist on experience cards', async ({ page }) => {
      const editButtons = page.getByLabel('Edit')
      const deleteButtons = page.getByLabel('Delete')
      await expect(editButtons.first()).toBeVisible()
      await expect(deleteButtons.first()).toBeVisible()
    })
  })

  test.describe('Projects Tab', () => {
    test('switches to Projects tab and shows seeded project titles', async ({ page }) => {
      await page.getByRole('button', { name: 'Projects' }).click()

      // All 4 seeded project titles
      await expect(page.getByText('CodeArena - Competitive Programming Platform')).toBeVisible()
      await expect(page.getByText('eTuitionBD - Multi-Role Education Marketplace')).toBeVisible()
      await expect(page.getByText('Metro Optics - E-commerce Platform')).toBeVisible()
      await expect(page.getByText('Ayash Tech - Corporate Portfolio')).toBeVisible()
    })

    test('shows project descriptions and tech chips', async ({ page }) => {
      await page.getByRole('button', { name: 'Projects' }).click()

      await expect(
        page.getByText('Competitive programming platform featuring real-time contests'),
      ).toBeVisible()

      // Technology chips unique to CodeArena
      await expect(page.getByText('Monaco Editor')).toBeVisible()
      await expect(page.getByText('Socket.IO')).toBeVisible()
    })

    test('shows project features', async ({ page }) => {
      await page.getByRole('button', { name: 'Projects' }).click()

      // Seeded features as bullet items
      await expect(
        page.getByText('Real-time coding contests with live participant tracking'),
      ).toBeVisible()
      await expect(
        page.getByText('Multi-role dashboards for students, tutors, and admins'),
      ).toBeVisible()
    })
  })

  test.describe('Skills Tab', () => {
    test('shows skills grouped by category', async ({ page }) => {
      await page.getByRole('button', { name: 'Skills' }).click()

      // Category headings (these only appear in the Skills section)
      await expect(page.getByText('Frontend').first()).toBeVisible()
      await expect(page.getByText('Backend')).toBeVisible()
      await expect(page.getByText('Database')).toBeVisible()
      await expect(page.getByText('DevOps')).toBeVisible()

      // Specific skills
      await expect(page.getByText('TypeScript')).toBeVisible()
      await expect(page.getByText('Node.js')).toBeVisible()
      await expect(page.getByText('MongoDB')).toBeVisible()
    })

    test('shows skill level badges', async ({ page }) => {
      await page.getByRole('button', { name: 'Skills' }).click()

      await expect(page.getByText('Advanced').first()).toBeVisible()
      await expect(page.getByText('Intermediate').first()).toBeVisible()
    })
  })

  test.describe('Search/Filter', () => {
    test('filters experiences by search term', async ({ page }) => {
      const searchInput = page.getByLabel('Search')
      await searchInput.fill('Freelance')

      // Should show matching company
      await expect(page.getByText('Freelance')).toBeVisible({ timeout: 5_000 })

      // Non-matching should eventually be hidden after debounce (300ms) + re-render
      await expect(page.getByText('Metro Optics')).toBeHidden({ timeout: 5_000 })
    })

    test('filters projects by search term', async ({ page }) => {
      await page.getByRole('button', { name: 'Projects' }).click()

      const searchInput = page.getByLabel('Search')
      await searchInput.fill('CodeArena')

      await expect(page.getByText('CodeArena - Competitive Programming Platform')).toBeVisible({
        timeout: 5_000,
      })
      await expect(page.getByText('eTuitionBD')).toBeHidden({ timeout: 5_000 })
    })
  })
})
