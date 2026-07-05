import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ValidationBadges } from '../ValidationBadges'
import type {
  SmartApplicationScores,
  ValidationHintsOutput,
} from '../../../services/smartApplication'

function makeScores(overall: number, match = overall, ats = overall): SmartApplicationScores {
  return { overall, match, ats }
}

function makeHints(overrides: Partial<ValidationHintsOutput> = {}): ValidationHintsOutput {
  return {
    atsKeywordsToInclude: [],
    truthFlags: [],
    humanizationTips: [],
    ...overrides,
  }
}

describe('ValidationBadges', () => {
  it('renders the three score labels and overall number', () => {
    render(
      <ValidationBadges
        scores={makeScores(85, 80, 90)}
        hints={makeHints()}
        atsKeywords={[]}
      />,
    )

    expect(screen.getByText('Overall')).toBeInTheDocument()
    expect(screen.getByText('Match')).toBeInTheDocument()
    expect(screen.getByText('ATS')).toBeInTheDocument()
    // Score numbers render inside the rings
    expect(screen.getAllByText('85').length).toBeGreaterThan(0)
    expect(screen.getAllByText('80').length).toBeGreaterThan(0)
    expect(screen.getAllByText('90').length).toBeGreaterThan(0)
  })

  it('shows Truth Passed when there are no truth flags', () => {
    render(
      <ValidationBadges
        scores={makeScores(80)}
        hints={makeHints()}
        atsKeywords={[]}
      />,
    )

    expect(screen.getByText('Truth Passed')).toBeInTheDocument()
  })

  it('shows truth flag count when issues exist', () => {
    render(
      <ValidationBadges
        scores={makeScores(70)}
        hints={makeHints({ truthFlags: ['Claim not supported', 'Date mismatch'] })}
        atsKeywords={[]}
      />,
    )

    expect(screen.getByText('Truth 2 issues')).toBeInTheDocument()
  })

  it('expands details and reveals truth flags and humanization tips', async () => {
    const user = userEvent.setup()
    render(
      <ValidationBadges
        scores={makeScores(75)}
        hints={makeHints({
          atsKeywordsToInclude: ['Kubernetes'],
          truthFlags: ['Metric looks inflated'],
          humanizationTips: ['Vary sentence length'],
        })}
        atsKeywords={['TypeScript', 'React']}
      />,
    )

    await user.click(screen.getByRole('button', { name: /details/i }))

    // Truth checks heading + flag text
    expect(screen.getByText('Truth Checks')).toBeInTheDocument()
    expect(screen.getByText('Metric looks inflated')).toBeInTheDocument()

    // Humanization tips heading + tip text
    expect(screen.getByText('Humanization Tips')).toBeInTheDocument()
    expect(screen.getByText('Vary sentence length')).toBeInTheDocument()

    // ATS Keywords sections
    const atsSection = screen.getByText('ATS Keywords').parentElement
    expect(atsSection).not.toBeNull()
    expect(within(atsSection as HTMLElement).getByText('TypeScript')).toBeInTheDocument()
    expect(within(atsSection as HTMLElement).getByText('React')).toBeInTheDocument()

    // Keywords to Include
    expect(screen.getByText('Keywords to Include')).toBeInTheDocument()
    expect(screen.getByText('Kubernetes')).toBeInTheDocument()

    // Toggle now reads "Less"
    expect(screen.getByRole('button', { name: /less/i })).toBeInTheDocument()
  })
})
