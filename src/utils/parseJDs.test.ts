import { describe, it, expect } from 'vitest'
import { parseJDs } from './parseJDs'

// ── Fixtures ──────────────────────────────────────────────

const JD_GOOGLE = `We are looking for a Senior Frontend Engineer to join Google Cloud Console team.
You will build and maintain the next generation of cloud management tools.
Requirements: 5+ years of React experience, TypeScript, performance optimization.`

const JD_STRIPE = `Stripe is hiring a Full Stack Developer for our payments platform.
You will work on the core checkout experience used by millions.
Requirements: 3+ years of Node.js, React, and PostgreSQL experience.`

const JD_NOTION = `Notion seeks a Product Engineer to build delightful user experiences.
You will own features end-to-end from design to deployment.
Requirements: Strong TypeScript skills, product thinking, 4+ years of experience.`

// ── Single JD (no separator) ──────────────────────────────

describe('single JD (no separator)', () => {
  it('returns one item when text has no separator', () => {
    const result = parseJDs(JD_GOOGLE, 'Google', 'Engineer')
    expect(result).toHaveLength(1)
    expect(result[0].company).toBe('Google')
    expect(result[0].role).toBe('Engineer')
    expect(result[0].jdText).toBe(JD_GOOGLE.trim())
  })

  it('strips leading/trailing whitespace from each block', () => {
    const result = parseJDs(`  \n${JD_STRIPE}\n  `, '', '')
    expect(result).toHaveLength(1)
    expect(result[0].jdText).toBe(JD_STRIPE.trim())
  })

  it('returns empty array for empty or whitespace-only text', () => {
    expect(parseJDs('', 'Google', 'Engineer')).toHaveLength(0)
    expect(parseJDs('   \n  \n  ', 'Google', 'Engineer')).toHaveLength(0)
    expect(parseJDs('\n\n\n', 'Google', 'Engineer')).toHaveLength(0)
  })

  it('uses defaults when no inline headers present', () => {
    const result = parseJDs(JD_NOTION, 'Acme Corp', 'Developer')
    expect(result[0].company).toBe('Acme Corp')
    expect(result[0].role).toBe('Developer')
  })
})

// ── Multiple JDs with `---` separator ─────────────────────

describe('multiple JDs with --- separator', () => {
  it('splits into correct number of blocks', () => {
    const text = [JD_GOOGLE, JD_STRIPE, JD_NOTION].join('\n---\n')
    const result = parseJDs(text, 'Default Co', 'Default Role')
    expect(result).toHaveLength(3)
  })

  it('uses defaults for blocks without inline headers', () => {
    const text = [JD_GOOGLE, JD_STRIPE].join('\n---\n')
    const result = parseJDs(text, 'My Company', 'Engineer')
    expect(result[0].company).toBe('My Company')
    expect(result[0].role).toBe('Engineer')
    expect(result[1].company).toBe('My Company')
    expect(result[1].role).toBe('Engineer')
  })

  it('preserves full JD text in each block', () => {
    const text = [JD_GOOGLE, JD_STRIPE].join('\n---\n')
    const result = parseJDs(text, '', '')
    expect(result[0].jdText).toBe(JD_GOOGLE.trim())
    expect(result[1].jdText).toBe(JD_STRIPE.trim())
  })

  it('handles separator with surrounding whitespace', () => {
    const text = `${JD_GOOGLE}\n  ---  \n${JD_STRIPE}`
    const result = parseJDs(text, '', '')
    expect(result).toHaveLength(2)
  })
})

// ── Inline company / role headers ─────────────────────────

describe('inline company/role headers', () => {
  it('parses Company: from the first line', () => {
    const text = `Company: Google\n${JD_GOOGLE}`
    const result = parseJDs(text, 'Fallback', 'Role')
    expect(result[0].company).toBe('Google')
    expect(result[0].role).toBe('Role')
    // Company header should be stripped from jdText
    expect(result[0].jdText).toBe(JD_GOOGLE.trim())
  })

  it('parses Role: from the second line', () => {
    const text = `Company: Google\nRole: Senior Engineer\n${JD_GOOGLE}`
    const result = parseJDs(text, 'Fallback', 'Fallback Role')
    expect(result[0].company).toBe('Google')
    expect(result[0].role).toBe('Senior Engineer')
    expect(result[0].jdText).toBe(JD_GOOGLE.trim())
  })

  it('parses Role: before Company: (different order)', () => {
    const text = `Role: Senior Engineer\nCompany: Google\n${JD_GOOGLE}`
    const result = parseJDs(text, 'Fallback', 'Fallback')
    expect(result[0].company).toBe('Google')
    expect(result[0].role).toBe('Senior Engineer')
    expect(result[0].jdText).toBe(JD_GOOGLE.trim())
  })

  it('parses only Role: without Company:', () => {
    const text = `Role: Engineer\n${JD_GOOGLE}`
    const result = parseJDs(text, 'Default Co', 'Default Role')
    expect(result[0].company).toBe('Default Co')
    expect(result[0].role).toBe('Engineer')
    expect(result[0].jdText).toBe(JD_GOOGLE.trim())
  })

  it('parses only Company: without Role:', () => {
    const text = `Company: Google\n${JD_GOOGLE}`
    const result = parseJDs(text, 'Default Co', 'Engineer')
    expect(result[0].company).toBe('Google')
    expect(result[0].role).toBe('Engineer')
    expect(result[0].jdText).toBe(JD_GOOGLE.trim())
  })

  it('is case-insensitive for Company: and Role:', () => {
    const text = `COMPANY: Google\nrole: engineer\n${JD_GOOGLE}`
    const result = parseJDs(text, '', '')
    expect(result[0].company).toBe('Google')
    expect(result[0].role).toBe('engineer')
  })

  it('only checks the first 3 lines for headers', () => {
    const text = `Some intro line\nNote: not a header\nCompany: Nested Inc\n${JD_GOOGLE}`
    const result = parseJDs(text, 'Default', 'Default')
    expect(result[0].company).toBe('Nested Inc')
    // Fourth line and beyond are NOT checked, so this is correct
    expect(result[0].jdText).toBe(JD_GOOGLE.trim())
  })

  it('does not treat a header after line 3 as a header', () => {
    // If Company: appears on line 4 (index 3), it should NOT be parsed as a header
    const text = `Line one\nLine two\nLine three\nCompany: Hidden Inc\n${JD_GOOGLE}`
    const result = parseJDs(text, 'Default Co', 'Default Role')
    expect(result[0].company).toBe('Default Co')
    // The "Company: Hidden Inc" line stays in the JD text
    expect(result[0].jdText).toContain('Company: Hidden Inc')
  })
})

// ── Mixed: per-block headers + defaults ───────────────────

describe('mixed per-block headers with defaults', () => {
  it('uses per-block headers when present, falls back to defaults otherwise', () => {
    const text = `Company: Google\nRole: Senior Engineer\n${JD_GOOGLE}\n---\n${JD_STRIPE}\n---\nCompany: Notion\n${JD_NOTION}`
    const result = parseJDs(text, 'Default Co', 'Default Role')

    // Block 0 has both headers
    expect(result[0].company).toBe('Google')
    expect(result[0].role).toBe('Senior Engineer')

    // Block 1 has no headers → uses defaults
    expect(result[1].company).toBe('Default Co')
    expect(result[1].role).toBe('Default Role')

    // Block 2 has Company: but no Role: → uses default for role
    expect(result[2].company).toBe('Notion')
    expect(result[2].role).toBe('Default Role')
  })
})

// ── Edge cases ────────────────────────────────────────────

describe('edge cases', () => {
  it('handles malformed separator (single dash, not triple)', () => {
    // Single `-` should NOT split
    const text = `${JD_GOOGLE}\n-\n${JD_STRIPE}`
    const result = parseJDs(text, '', '')
    expect(result).toHaveLength(1)
  })

  it('handles only separator with no content on one side', () => {
    const text = `---\n${JD_GOOGLE}`
    const result = parseJDs(text, '', '')
    expect(result).toHaveLength(1)
    expect(result[0].jdText).toBe(JD_GOOGLE.trim())
  })

  it('handles only separator with no content', () => {
    const result = parseJDs('---', '', '')
    expect(result).toHaveLength(0)
  })

  it('handles text that has only whitespace between separators', () => {
    const result = parseJDs(`${JD_GOOGLE}\n---\n  \n---\n${JD_STRIPE}`, '', '')
    expect(result).toHaveLength(2)
  })

  it('handles very long separator line with trailing dashes', () => {
    // Only exact `---` should match, not `----`
    const text = `${JD_GOOGLE}\n----\n${JD_STRIPE}`
    const result = parseJDs(text, '', '')
    expect(result).toHaveLength(1)
  })

  it('handles Company: with trailing whitespace', () => {
    const text = `Company:   Google   \n${JD_GOOGLE}`
    const result = parseJDs(text, '', '')
    expect(result[0].company).toBe('Google')
  })

  it('handles Role: with no space after colon', () => {
    const text = `Role:Engineer\n${JD_GOOGLE}`
    const result = parseJDs(text, '', '')
    expect(result[0].role).toBe('Engineer')
  })

  it('handlines lines that look like headers inside the JD body', () => {
    // "Company:" appearing mid-text should not be parsed as a header
    const jdWithCompanyRef = `We work closely with Company: Acme Corp on integrations.\nThis is a great opportunity.`
    const result = parseJDs(jdWithCompanyRef, 'Default', 'Default')
    expect(result[0].company).toBe('Default')
  })

  it('handles text with no JD content (only headers)', () => {
    const text = `Company: Test\nRole: Tester`
    const result = parseJDs(text, 'Default', 'Default')
    expect(result).toHaveLength(1)
    expect(result[0].company).toBe('Test')
    expect(result[0].role).toBe('Tester')
    expect(result[0].jdText).toBe('')
  })
})
