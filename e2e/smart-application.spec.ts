import { test, expect, type Route } from '@playwright/test'

const SMART_CREATE_URL = '**/api/applications/smart-create'
const RESUMES_URL = '**/api/profile/resumes'

const VALID_JD =
  'We are looking for a Senior Frontend Engineer with React and TypeScript experience to join our team. ' +
  'You will build scalable user interfaces, collaborate with designers and backend engineers, and ship high-quality features. ' +
  'Five plus years of frontend experience required. Must be comfortable with modern CSS, GraphQL, and testing.'

const MOCK_APPLICATION_RESULT = {
  applicationId: 'app-playwright-123',
  exportPath: '/exports/app-playwright-123',
  scores: { ats: 85, match: 78, overall: 82 },
  output: {
    analysis: {
      company: 'Acme Corp',
      role: 'Senior Frontend Engineer',
      employmentType: 'full-time',
      experienceLevel: 'senior',
      requiredSkills: ['React', 'TypeScript'],
      preferredSkills: ['GraphQL'],
      responsibilities: ['Build UI', 'Ship features'],
      keywords: ['React'],
      atsKeywords: ['React', 'TypeScript', 'GraphQL'],
      softSkills: ['Communication'],
      redFlags: [],
      matchPercent: 78,
      salaryRange: null,
      location: 'Remote',
    },
    resume: {
      markdown:
        '# John Doe\n\nSenior Frontend Engineer with 5 years experience.\n\n' +
        '## Experience\n\n- Built apps with React\n- Worked with TypeScript\n',
      sections: {
        summary: 'Senior Frontend Engineer with 5 years experience.',
        experience: [
          {
            company: 'Previous Co',
            role: 'Engineer',
            startDate: '2020',
            endDate: 'Present',
            bullets: ['Built apps with React', 'Worked with TypeScript'],
          },
        ],
        projects: [],
        skills: [{ category: 'Languages', items: ['TypeScript', 'JavaScript'] }],
        education: [{ degree: 'BS Computer Science', institution: 'University', year: '2020' }],
        certifications: [],
      },
    },
    email: {
      subject: 'Application for Senior Frontend Engineer at Acme Corp',
      body:
        'Dear Hiring Manager,\n\nI am writing to express my interest in the Senior Frontend Engineer role at Acme Corp.\n\n' +
        'Best regards,\nJohn',
      tone: 'professional',
    },
    coverLetter:
      'Dear Hiring Team,\n\nI am excited to apply for the Senior Frontend Engineer role at Acme Corp. ' +
      'With 5 years of experience building scalable React applications, I am confident I can contribute to your team.\n\n' +
      'Thank you for your consideration.\n\nSincerely,\nJohn Doe',
    validationHints: {
      atsKeywordsToInclude: ['GraphQL'],
      truthFlags: [],
      humanizationTips: ['Add more specific metrics'],
    },
  },
}

async function mockSmartCreate(
  page: import('@playwright/test').Page,
  options: { delayMs?: number } = {},
): Promise<void> {
  await page.route(SMART_CREATE_URL, async (route: Route) => {
    if (options.delayMs && options.delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, options.delayMs))
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: MOCK_APPLICATION_RESULT }),
    })
  })
}

test.describe('Smart Application Page', () => {
  test.beforeEach(async ({ page }) => {
    // Mock resume library endpoint so the page's mount-time fetch does not
    // hit the (non-existent in CI) backend proxy.
    await page.route(RESUMES_URL, async (route: Route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: { resumes: [] } }),
      })
    })

    // The auth-setup project already logged in. The 'authenticated' project
    // loads that storageState, so navigating to /smart-application should
    // land on the protected page without redirect.
    await page.goto('/smart-application')
  })

  test.describe('Page Layout', () => {
    test('shows JD input tabs for Single / Multiple / CSV', async ({ page }) => {
      const singleTab = page.getByRole('button', { name: 'Single', exact: true })
      const multipleTab = page.getByRole('button', { name: 'Multiple', exact: true })
      const csvTab = page.getByRole('button', { name: 'CSV', exact: true })

      await expect(singleTab).toBeVisible()
      await expect(multipleTab).toBeVisible()
      await expect(csvTab).toBeVisible()

      // Single is the default mode — JD textarea is visible
      await expect(
        page.getByPlaceholder('Paste the full job description here...'),
      ).toBeVisible()
    })

    test('shows the empty state on the right panel before generation', async ({ page }) => {
      await expect(page.getByText('Ready to generate')).toBeVisible()
      await expect(
        page.getByText(
          'Paste a job description and click generate to see your tailored resume, email, and cover letter.',
        ),
      ).toBeVisible()
    })

    test('shows the Generate Application Package button', async ({ page }) => {
      await expect(
        page.getByRole('button', { name: 'Generate Application Package' }),
      ).toBeVisible()
    })
  })

  test.describe('Generation Flow (Mocked API)', () => {
    test('shows loading state, then result panel after generating a Single JD', async ({
      page,
    }) => {
      await mockSmartCreate(page, { delayMs: 600 })

      // Fill the JD textarea (validation requires >= 50 chars)
      await page.getByPlaceholder('Paste the full job description here...').fill(VALID_JD)

      const generateBtn = page.getByRole('button', {
        name: 'Generate Application Package',
      })
      await generateBtn.click()

      // Loading state appears while the mock delays
      await expect(page.getByText('Generating application...')).toBeVisible()
      await expect(page.getByRole('button', { name: 'Generating...' })).toBeVisible()

      // Result panel renders the company header from the mocked response
      await expect(page.getByRole('heading', { name: 'Acme Corp' })).toBeVisible({
        timeout: 15_000,
      })
      await expect(page.getByText('Senior Frontend Engineer').first()).toBeVisible()

      // Loading state has cleared
      await expect(page.getByText('Generating application...')).toBeHidden()
    })

    test('result panel shows Resume / Email / Cover Letter tabs that switch content', async ({
      page,
    }) => {
      await mockSmartCreate(page)

      await page.getByPlaceholder('Paste the full job description here...').fill(VALID_JD)
      await page.getByRole('button', { name: 'Generate Application Package' }).click()

      await expect(page.getByRole('heading', { name: 'Acme Corp' })).toBeVisible({
        timeout: 15_000,
      })

      // Resume tab is active by default — editor textarea is visible
      await expect(page.locator('#resume-editor')).toBeVisible()

      // Switch to Email tab
      await page.getByRole('button', { name: 'Email', exact: true }).click()
      await expect(
        page.getByText('Application for Senior Frontend Engineer at Acme Corp'),
      ).toBeVisible()
      // Email content area shows tone badge
      await expect(page.getByText('professional')).toBeVisible()

      // Switch to Cover Letter tab
      await page.getByRole('button', { name: 'Cover Letter', exact: true }).click()
      await expect(page.getByText('Dear Hiring Team,')).toBeVisible()
      await expect(page.getByText(/Sincerely,/)).toBeVisible()

      // Switch back to Resume tab
      await page.getByRole('button', { name: 'Resume', exact: true }).click()
      await expect(page.locator('#resume-editor')).toBeVisible()
    })

    test('shows Validation badges with score rings and metric values', async ({ page }) => {
      await mockSmartCreate(page)

      await page.getByPlaceholder('Paste the full job description here...').fill(VALID_JD)
      await page.getByRole('button', { name: 'Generate Application Package' }).click()

      await expect(page.getByRole('heading', { name: 'Acme Corp' })).toBeVisible({
        timeout: 15_000,
      })

      // Validation section heading
      await expect(page.getByText('Validation', { exact: true })).toBeVisible()

      // Three score-ring labels
      await expect(page.getByText('Overall', { exact: true })).toBeVisible()
      await expect(page.getByText('Match', { exact: true })).toBeVisible()
      await expect(page.getByText('ATS', { exact: true })).toBeVisible()

      // Three score-ring SVG icons
      await expect(page.locator('svg').filter({ has: page.locator('circle') }).first()).toBeAttached()

      // Score values from mock: overall=82, match=78, ats=85
      // The numbers are rendered inside the rings. .first() avoids strict mode
      // violations since other UI elements may also display these digits.
      await expect(page.getByText('82', { exact: true }).first()).toBeVisible()
      await expect(page.getByText('78', { exact: true }).first()).toBeVisible()
      await expect(page.getByText('85', { exact: true }).first()).toBeVisible()

      // Truth Passed badge (since truthFlags is empty in mock)
      await expect(page.getByText('Truth Passed')).toBeVisible()
    })

    test('typing in resume editor updates the live preview', async ({ page }) => {
      await mockSmartCreate(page)

      await page.getByPlaceholder('Paste the full job description here...').fill(VALID_JD)
      await page.getByRole('button', { name: 'Generate Application Package' }).click()

      await expect(page.getByRole('heading', { name: 'Acme Corp' })).toBeVisible({
        timeout: 15_000,
      })

      const editor = page.locator('#resume-editor')
      await expect(editor).toBeVisible()

      // Append a unique marker that the preview should reflect
      const markerHeading = 'PLAYWRIGHT_EDIT_MARKER_12345'
      const markerParagraph = 'This is an edited paragraph for preview verification.'
      const newValue =
        (await editor.inputValue()) +
        `\n\n## ${markerHeading}\n\n${markerParagraph}\n`
      await editor.fill(newValue)

      // Preview is in split mode by default — the marker should appear
      await expect(page.getByText(markerHeading)).toBeVisible()
      await expect(page.getByText(markerParagraph)).toBeVisible()

      // Textarea still holds the new content
      expect(await editor.inputValue()).toContain(markerHeading)
    })
  })

  test.describe('Input Mode Switching', () => {
    test('switching to CSV mode shows the CSV upload zone', async ({ page }) => {
      await page.getByRole('button', { name: 'CSV', exact: true }).click()

      // Instructions panel above the upload zone
      await expect(page.getByText(/Upload a CSV with columns:/)).toBeVisible()

      // Upload zone heading & helper text
      await expect(page.getByText('Upload CSV of JDs')).toBeVisible()
      await expect(page.getByText('Drag & drop or click to browse')).toBeVisible()

      // Generate button is still visible regardless of mode
      await expect(
        page.getByRole('button', { name: 'Generate Application Package' }),
      ).toBeVisible()
    })

    test('switching to Multiple mode shows multiple JD form entries', async ({ page }) => {
      await page.getByRole('button', { name: 'Multiple', exact: true }).click()

      // First JD entry is labeled "JD #1"
      await expect(page.getByText('JD #1')).toBeVisible()

      // Add another JD button is shown
      await expect(page.getByRole('button', { name: 'Add another JD' })).toBeVisible()

      // Clicking it adds a second entry
      await page.getByRole('button', { name: 'Add another JD' }).click()
      await expect(page.getByText('JD #2')).toBeVisible()
    })
  })
})
