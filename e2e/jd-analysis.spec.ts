import { test, expect } from '@playwright/test'

test.describe('JD Analysis Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/jd-analysis')
  })

  test.describe('Page Layout', () => {
    test('renders the page heading and description', async ({ page }) => {
      await expect(page.getByText('Paste Job Description')).toBeVisible()
      await expect(
        page.getByText('Paste the full job description to extract skills, keywords, and insights'),
      ).toBeVisible()
    })

    test('shows empty state on the right panel', async ({ page }) => {
      await expect(page.getByText('No Analysis Yet')).toBeVisible()
      await expect(
        page.getByText("Paste a job description on the left panel and click 'Analyze' to get started."),
      ).toBeVisible()
    })

    test('shows recent analyses list', async ({ page }) => {
      await expect(page.getByText('Recent Analyses')).toBeVisible()
      for (const company of ['Google', 'Meta', 'Stripe']) {
        await expect(page.getByText(company)).toBeVisible()
      }
    })

    test('shows Analyze and Sample JD buttons', async ({ page }) => {
      await expect(page.getByRole('button', { name: 'Analyze' })).toBeVisible()
      await expect(page.getByRole('button', { name: 'Sample JD', exact: true })).toBeVisible()
      // The empty state has a 'Try Sample JD' action too
      await expect(page.getByRole('button', { name: 'Try Sample JD' })).toBeVisible()
    })
  })

  test.describe('Sample JD', () => {
    test('fills the textarea with sample job description', async ({ page }) => {
      await page.getByRole('button', { name: 'Sample JD', exact: true }).click()

      const textarea = page.getByPlaceholder('Paste the full job description here...')
      const value = await textarea.inputValue()
      expect(value.length).toBeGreaterThan(100)
      expect(value).toContain('Senior Frontend Engineer')
      expect(value).toContain('React.js')
      expect(value).toContain('TypeScript')
    })

    test('overwrites existing text when sample is clicked', async ({ page }) => {
      const textarea = page.getByPlaceholder('Paste the full job description here...')

      await textarea.fill('Some custom text')
      await page.getByRole('button', { name: 'Sample JD', exact: true }).click()

      const value = await textarea.inputValue()
      expect(value).toContain('Senior Frontend Engineer')
    })
  })

  test.describe('Analysis Flow', () => {
    test('analyzes sample JD and shows results on the right panel', async ({ page }) => {
      // Fill with sample JD and analyze
      await page.getByRole('button', { name: 'Sample JD', exact: true }).click()
      await page.getByRole('button', { name: 'Analyze' }).click()

      // Wait for results to appear on the right panel
      // The textarea still shows the sample JD, so many words overlap between
      // the left (textarea) and right (results) panels. Use .first() to avoid
      // strict mode violations from matching both sides.

      // Company heading — mock extracts from "with Tailwind CSS and modern CSS"
      await expect(page.getByText('Tailwind CSS').first()).toBeVisible({ timeout: 15_000 })

      // Role appears as a heading
      await expect(page.getByText('Senior Frontend Engineer').first()).toBeVisible()

      // Location and experience level (also in textarea: "Remote-first", "Senior Frontend")
      await expect(page.getByText('senior').first()).toBeVisible()

      // Required Skills section heading
      await expect(page.getByText('Required Skills')).toBeVisible()

      // Nice-to-Have section heading + badge
      await expect(page.getByText('Nice-to-Have')).toBeVisible()
      // Also appears in textarea "Experience with Next.js"
      await expect(page.getByText('Next.js').first()).toBeVisible()

      // ATS Keywords section
      await expect(page.getByText('ATS Keywords')).toBeVisible()

      // Summary section heading
      await expect(page.getByText('Summary')).toBeVisible()

      // Match Score is calculated by the route (72 from calculateMatchScore)
      await expect(page.getByText('Match Score')).toBeVisible()
    })

    test('shows Generate Resume Strategy button after analysis', async ({ page }) => {
      await page.getByRole('button', { name: 'Sample JD', exact: true }).click()
      await page.getByRole('button', { name: 'Analyze' }).click()

      await expect(page.getByRole('button', { name: 'Generate Resume Strategy' })).toBeVisible({
        timeout: 15_000,
      })
    })
  })
})
