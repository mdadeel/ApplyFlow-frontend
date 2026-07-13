import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { Experience, Project, Skill, Education, Certificate, Award, Publication, Volunteering, Language, Interest } from '../../types'
import type { PersonalData } from '../../services/profile'

import { ExperienceForm } from './ExperienceForm'
import { ProjectForm } from './ProjectForm'
import { SkillForm } from './SkillForm'
import { EducationForm } from './EducationForm'
import { CertificateForm } from './CertificateForm'
import { AwardForm } from './AwardForm'
import { PublicationForm } from './PublicationForm'
import { VolunteeringForm } from './VolunteeringForm'
import { LanguageForm } from './LanguageForm'
import { InterestForm } from './InterestForm'
import { PersonalForm } from './PersonalForm'

// ── Factories ──────────────────────────────────────────────────────

function makeExperience(overrides: Partial<Experience> = {}): Experience {
  return {
    _id: 'exp-1',
    company: 'Acme Corp',
    role: 'Frontend Engineer',
    startDate: '2020-01-01',
    endDate: '2023-06-01',
    current: false,
    responsibilities: ['Led frontend dev'],
    technologies: ['React', 'TypeScript'],
    achievements: ['Shipped v2'],
    metrics: ['40% perf improvement'],
    projects: [],
    ...overrides,
  }
}

function makeProject(overrides: Partial<Project> = {}): Project {
  return {
    _id: 'proj-1',
    title: 'Dashboard App',
    description: 'A metrics dashboard',
    technologies: ['React'],
    features: ['Real-time charts'],
    outcome: 'Served 500 users',
    ...overrides,
  }
}

function makeSkill(overrides: Partial<Skill> = {}): Skill {
  return {
    _id: 'skill-1',
    name: 'React',
    category: 'Frontend',
    level: 'Advanced',
    ...overrides,
  }
}

function makeEducation(overrides: Partial<Education> = {}): Education {
  return {
    _id: 'edu-1',
    degree: 'B.Sc. Computer Science',
    institution: 'MIT',
    startDate: '2015-09-01',
    endDate: '2019-06-01',
    result: 'GPA 3.8',
    ...overrides,
  }
}

function makeCertificate(overrides: Partial<Certificate> = {}): Certificate {
  return {
    _id: 'cert-1',
    name: 'AWS Solutions Architect',
    issuer: 'Amazon Web Services',
    date: '2023-03-15',
    url: 'https://example.com/cred',
    ...overrides,
  }
}

function makeAward(overrides: Partial<Award> = {}): Award {
  return {
    _id: 'award-1',
    title: 'Employee of the Month',
    issuer: 'Acme Corp',
    date: '2023-01-01',
    description: 'For outstanding performance',
    ...overrides,
  }
}

function makePublication(overrides: Partial<Publication> = {}): Publication {
  return {
    _id: 'pub-1',
    title: 'React Best Practices',
    publisher: 'Dev Journal',
    date: '2022-06-15',
    authors: ['John Doe', 'Jane Smith'],
    description: 'A guide to React patterns',
    url: 'https://example.com/pub',
    ...overrides,
  }
}

function makeVolunteering(overrides: Partial<Volunteering> = {}): Volunteering {
  return {
    _id: 'vol-1',
    organization: 'Code for Good',
    role: 'Mentor',
    startDate: '2021-01-01',
    endDate: '2023-01-01',
    current: false,
    description: 'Mentored junior developers',
    technologies: ['React', 'Python'],
    ...overrides,
  }
}

function makeLanguage(overrides: Partial<Language> = {}): Language {
  return {
    _id: 'lang-1',
    name: 'English',
    proficiency: 'Native',
    ...overrides,
  }
}

function makeInterest(overrides: Partial<Interest> = {}): Interest {
  return {
    _id: 'int-1',
    name: 'Machine Learning',
    category: 'Technology',
    ...overrides,
  }
}

function makePersonal(overrides: Partial<PersonalData> = {}): PersonalData {
  return {
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1-555-1234',
    location: 'San Francisco, CA',
    title: 'Senior Software Engineer',
    summary: 'Experienced full-stack developer',
    portfolio: 'https://johndoe.dev',
    linkedIn: 'https://linkedin.com/in/johndoe',
    github: 'https://github.com/johndoe',
    ...overrides,
  }
}

// ── Render helpers ─────────────────────────────────────────────────

function renderExperiencelForm(props: Partial<Parameters<typeof ExperienceForm>[0]> = {}) {
  const onSubmit = vi.fn()
  const onCancel = vi.fn()
  return {
    onSubmit,
    onCancel,
    ...render(<ExperienceForm item={undefined} submitting={false} onSubmit={onSubmit} onCancel={onCancel} {...props} />),
    onSubmitMock: onSubmit,
    onCancelMock: onCancel,
  }
}

function renderProjectForm(props: Partial<Parameters<typeof ProjectForm>[0]> = {}) {
  const onSubmit = vi.fn()
  const onCancel = vi.fn()
  return {
    onSubmit,
    onCancel,
    ...render(<ProjectForm item={undefined} submitting={false} onSubmit={onSubmit} onCancel={onCancel} {...props} />),
    onSubmitMock: onSubmit,
    onCancelMock: onCancel,
  }
}

function renderSkillForm(props: Partial<Parameters<typeof SkillForm>[0]> = {}) {
  const onSubmit = vi.fn()
  const onCancel = vi.fn()
  return {
    onSubmit,
    onCancel,
    ...render(<SkillForm item={undefined} submitting={false} onSubmit={onSubmit} onCancel={onCancel} {...props} />),
    onSubmitMock: onSubmit,
    onCancelMock: onCancel,
  }
}

function renderEducationForm(props: Partial<Parameters<typeof EducationForm>[0]> = {}) {
  const onSubmit = vi.fn()
  const onCancel = vi.fn()
  return {
    onSubmit,
    onCancel,
    ...render(<EducationForm item={undefined} submitting={false} onSubmit={onSubmit} onCancel={onCancel} {...props} />),
    onSubmitMock: onSubmit,
    onCancelMock: onCancel,
  }
}

function renderCertificateForm(props: Partial<Parameters<typeof CertificateForm>[0]> = {}) {
  const onSubmit = vi.fn()
  const onCancel = vi.fn()
  return {
    onSubmit,
    onCancel,
    ...render(<CertificateForm item={undefined} submitting={false} onSubmit={onSubmit} onCancel={onCancel} {...props} />),
    onSubmitMock: onSubmit,
    onCancelMock: onCancel,
  }
}

function renderAwardForm(props: Partial<Parameters<typeof AwardForm>[0]> = {}) {
  const onSubmit = vi.fn()
  const onCancel = vi.fn()
  return {
    onSubmit,
    onCancel,
    ...render(<AwardForm item={undefined} submitting={false} onSubmit={onSubmit} onCancel={onCancel} {...props} />),
    onSubmitMock: onSubmit,
    onCancelMock: onCancel,
  }
}

function renderPublicationForm(props: Partial<Parameters<typeof PublicationForm>[0]> = {}) {
  const onSubmit = vi.fn()
  const onCancel = vi.fn()
  return {
    onSubmit,
    onCancel,
    ...render(<PublicationForm item={undefined} submitting={false} onSubmit={onSubmit} onCancel={onCancel} {...props} />),
    onSubmitMock: onSubmit,
    onCancelMock: onCancel,
  }
}

function renderVolunteeringForm(props: Partial<Parameters<typeof VolunteeringForm>[0]> = {}) {
  const onSubmit = vi.fn()
  const onCancel = vi.fn()
  return {
    onSubmit,
    onCancel,
    ...render(<VolunteeringForm item={undefined} submitting={false} onSubmit={onSubmit} onCancel={onCancel} {...props} />),
    onSubmitMock: onSubmit,
    onCancelMock: onCancel,
  }
}

function renderLanguageForm(props: Partial<Parameters<typeof LanguageForm>[0]> = {}) {
  const onSubmit = vi.fn()
  const onCancel = vi.fn()
  return {
    onSubmit,
    onCancel,
    ...render(<LanguageForm item={undefined} submitting={false} onSubmit={onSubmit} onCancel={onCancel} {...props} />),
    onSubmitMock: onSubmit,
    onCancelMock: onCancel,
  }
}

function renderInterestForm(props: Partial<Parameters<typeof InterestForm>[0]> = {}) {
  const onSubmit = vi.fn()
  const onCancel = vi.fn()
  return {
    onSubmit,
    onCancel,
    ...render(<InterestForm item={undefined} submitting={false} onSubmit={onSubmit} onCancel={onCancel} {...props} />),
    onSubmitMock: onSubmit,
    onCancelMock: onCancel,
  }
}

function renderPersonalForm(props: Partial<Parameters<typeof PersonalForm>[0]> = {}) {
  const onSubmit = vi.fn()
  const onCancel = vi.fn()
  return {
    onSubmit,
    onCancel,
    ...render(<PersonalForm item={null} submitting={false} onSubmit={onSubmit} onCancel={onCancel} {...props} />),
    onSubmitMock: onSubmit,
    onCancelMock: onCancel,
  }
}

// ── Tests ──────────────────────────────────────────────────────────

describe('ExperienceForm', () => {
  it('renders empty form for new experience', () => {
    renderExperiencelForm()
    expect(screen.getByPlaceholderText('Company name')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Job title')).toBeInTheDocument()
    expect(screen.getByText('I currently work here')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /save/i })).toBeDisabled()
  })

  it('pre-fills form when editing an existing experience', () => {
    const item = makeExperience()
    renderExperiencelForm({ item })
    expect(screen.getByPlaceholderText('Company name')).toHaveValue(item.company)
    expect(screen.getByPlaceholderText('Job title')).toHaveValue(item.role)
  })

  it('enables Save when required fields are filled', async () => {
    const user = userEvent.setup()
    renderExperiencelForm()
    await user.type(screen.getByPlaceholderText('Company name'), 'Acme')
    await user.type(screen.getByPlaceholderText('Job title'), 'Engineer')
    // Fill start date
    const startDateInput = screen.getByLabelText(/start date/i)
    await user.type(startDateInput, '2020-01-01')
    expect(screen.getByRole('button', { name: /save/i })).not.toBeDisabled()
  })

  it('disables end date when current is checked', async () => {
    const user = userEvent.setup()
    renderExperiencelForm()
    await user.click(screen.getByText('I currently work here'))
    expect(screen.getByLabelText(/end date/i)).toBeDisabled()
  })

  it('calls onSubmit with formatted data', async () => {
    const user = userEvent.setup()
    const { onSubmitMock } = renderExperiencelForm()
    await user.type(screen.getByPlaceholderText('Company name'), 'Acme')
    await user.type(screen.getByPlaceholderText('Job title'), 'Engineer')
    await user.type(screen.getByLabelText(/start date/i), '2020-01-01')
    await user.click(screen.getByRole('button', { name: /save/i }))
    expect(onSubmitMock).toHaveBeenCalledWith({
      company: 'Acme',
      role: 'Engineer',
      startDate: '2020-01-01',
      endDate: undefined,
      current: false,
      responsibilities: [],
      technologies: [],
      achievements: [],
      metrics: [],
    })
  })

  it('calls onCancel when Cancel is clicked', async () => {
    const user = userEvent.setup()
    const { onCancelMock } = renderExperiencelForm()
    await user.click(screen.getByRole('button', { name: /cancel/i }))
    expect(onCancelMock).toHaveBeenCalledOnce()
  })

  it('shows submitting state', () => {
    renderExperiencelForm({ submitting: true })
    expect(screen.getByRole('button', { name: /save/i })).toBeDisabled()
  })
})

describe('ProjectForm', () => {
  it('renders empty form for new project', () => {
    renderProjectForm()
    expect(screen.getByPlaceholderText('Project name')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /save/i })).toBeDisabled()
  })

  it('pre-fills form when editing', () => {
    const item = makeProject()
    renderProjectForm({ item })
    expect(screen.getByPlaceholderText('Project name')).toHaveValue(item.title)
  })

  it('calls onSubmit with formatted data', async () => {
    const user = userEvent.setup()
    const { onSubmitMock } = renderProjectForm()
    await user.type(screen.getByPlaceholderText('Project name'), 'My Project')
    await user.type(screen.getByPlaceholderText(/brief description/i), 'A great project')
    await user.click(screen.getByRole('button', { name: /save/i }))
    expect(onSubmitMock).toHaveBeenCalledWith({
      title: 'My Project',
      description: 'A great project',
      technologies: [],
      features: [],
      outcome: undefined,
      github: undefined,
      demo: undefined,
    })
  })

  it('calls onCancel when Cancel is clicked', async () => {
    const user = userEvent.setup()
    const { onCancelMock } = renderProjectForm()
    await user.click(screen.getByRole('button', { name: /cancel/i }))
    expect(onCancelMock).toHaveBeenCalledOnce()
  })
})

describe('SkillForm', () => {
  it('renders empty form for new skill', () => {
    renderSkillForm()
    expect(screen.getByPlaceholderText('e.g. React')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /save/i })).toBeDisabled()
  })

  it('pre-fills form when editing', () => {
    const item = makeSkill()
    renderSkillForm({ item })
    expect(screen.getByPlaceholderText('e.g. React')).toHaveValue(item.name)
  })

  it('renders category and level select options', () => {
    renderSkillForm()
    expect(screen.getByLabelText(/category/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/level/i)).toBeInTheDocument()
  })

  it('calls onSubmit with skill data', async () => {
    const user = userEvent.setup()
    const { onSubmitMock } = renderSkillForm()
    await user.type(screen.getByPlaceholderText('e.g. React'), 'TypeScript')
    await user.click(screen.getByRole('button', { name: /save/i }))
    expect(onSubmitMock).toHaveBeenCalledWith({
      name: 'TypeScript',
      category: 'Frontend',
      level: 'Intermediate',
    })
  })
})

describe('EducationForm', () => {
  it('renders empty form for new education', () => {
    renderEducationForm()
    expect(screen.getByPlaceholderText('B.Sc. in Computer Science')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('University name')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /save/i })).toBeDisabled()
  })

  it('pre-fills form when editing', () => {
    const item = makeEducation()
    renderEducationForm({ item })
    expect(screen.getByPlaceholderText('B.Sc. in Computer Science')).toHaveValue(item.degree)
  })

  it('calls onSubmit with education data', async () => {
    const user = userEvent.setup()
    const { onSubmitMock } = renderEducationForm()
    await user.type(screen.getByPlaceholderText('B.Sc. in Computer Science'), 'B.A. Design')
    await user.type(screen.getByPlaceholderText('University name'), 'Stanford')
    await user.type(screen.getByLabelText(/^start date/i), '2015-09-01')
    await user.type(screen.getByLabelText(/^end date/i), '2019-06-01')
    await user.click(screen.getByRole('button', { name: /save/i }))
    expect(onSubmitMock).toHaveBeenCalledWith({
      degree: 'B.A. Design',
      institution: 'Stanford',
      startDate: '2015-09-01',
      endDate: '2019-06-01',
      result: undefined,
    })
  })
})

describe('CertificateForm', () => {
  it('renders empty form', () => {
    renderCertificateForm()
    expect(screen.getByPlaceholderText('AWS Solutions Architect')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /save/i })).toBeDisabled()
  })

  it('pre-fills form when editing', () => {
    const item = makeCertificate()
    renderCertificateForm({ item })
    expect(screen.getByPlaceholderText('AWS Solutions Architect')).toHaveValue(item.name)
  })

  it('calls onSubmit with certificate data', async () => {
    const user = userEvent.setup()
    const { onSubmitMock } = renderCertificateForm()
    await user.type(screen.getByPlaceholderText('AWS Solutions Architect'), 'CKAD')
    await user.type(screen.getByPlaceholderText('Amazon Web Services'), 'CNCF')
    await user.type(screen.getByLabelText(/date/i), '2024-01-01')
    await user.click(screen.getByRole('button', { name: /save/i }))
    expect(onSubmitMock).toHaveBeenCalledWith({
      name: 'CKAD',
      issuer: 'CNCF',
      date: '2024-01-01',
      url: undefined,
    })
  })
})

describe('AwardForm', () => {
  it('renders empty form', () => {
    renderAwardForm()
    expect(screen.getByPlaceholderText('Employee of the Month')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /save/i })).toBeDisabled()
  })

  it('pre-fills form when editing', () => {
    const item = makeAward()
    renderAwardForm({ item })
    expect(screen.getByPlaceholderText('Employee of the Month')).toHaveValue(item.title)
  })

  it('calls onSubmit with award data', async () => {
    const user = userEvent.setup()
    const { onSubmitMock } = renderAwardForm()
    await user.type(screen.getByPlaceholderText('Employee of the Month'), 'Best Dev')
    await user.type(screen.getByPlaceholderText('Company name'), 'Google')
    await user.click(screen.getByRole('button', { name: /save/i }))
    expect(onSubmitMock).toHaveBeenCalledWith({
      title: 'Best Dev',
      issuer: 'Google',
      date: undefined,
      description: undefined,
      url: undefined,
    })
  })
})

describe('PublicationForm', () => {
  it('renders empty form', () => {
    renderPublicationForm()
    expect(screen.getByPlaceholderText('Publication title')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /save/i })).toBeDisabled()
  })

  it('pre-fills form when editing', () => {
    const item = makePublication()
    renderPublicationForm({ item })
    expect(screen.getByPlaceholderText('Publication title')).toHaveValue(item.title)
    expect(screen.getByPlaceholderText('John Doe, Jane Smith')).toHaveValue('John Doe, Jane Smith')
  })

  it('calls onSubmit with publication data', async () => {
    const user = userEvent.setup()
    const { onSubmitMock } = renderPublicationForm()
    await user.type(screen.getByPlaceholderText('Publication title'), 'New Paper')
    await user.type(screen.getByPlaceholderText('Publisher or journal name'), 'ACM')
    await user.click(screen.getByRole('button', { name: /save/i }))
    expect(onSubmitMock).toHaveBeenCalledWith({
      title: 'New Paper',
      publisher: 'ACM',
      date: undefined,
      description: undefined,
      url: undefined,
      authors: [],
    })
  })
})

describe('VolunteeringForm', () => {
  it('renders empty form', () => {
    renderVolunteeringForm()
    expect(screen.getByPlaceholderText('Nonprofit name')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Volunteer role')).toBeInTheDocument()
    expect(screen.getByText('I currently volunteer here')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /save/i })).toBeDisabled()
  })

  it('pre-fills form when editing', () => {
    const item = makeVolunteering()
    renderVolunteeringForm({ item })
    expect(screen.getByPlaceholderText('Nonprofit name')).toHaveValue(item.organization)
  })

  it('disables end date when current is checked', async () => {
    const user = userEvent.setup()
    renderVolunteeringForm()
    await user.click(screen.getByText('I currently volunteer here'))
    expect(screen.getByLabelText(/end date/i)).toBeDisabled()
  })

  it('calls onSubmit with volunteering data', async () => {
    const user = userEvent.setup()
    const { onSubmitMock } = renderVolunteeringForm()
    await user.type(screen.getByPlaceholderText('Nonprofit name'), 'Red Cross')
    await user.type(screen.getByPlaceholderText('Volunteer role'), 'Volunteer')
    await user.click(screen.getByRole('button', { name: /save/i }))
    expect(onSubmitMock).toHaveBeenCalledWith({
      organization: 'Red Cross',
      role: 'Volunteer',
      startDate: undefined,
      endDate: undefined,
      current: false,
      description: undefined,
      technologies: [],
    })
  })
})

describe('LanguageForm', () => {
  it('renders empty form', () => {
    renderLanguageForm()
    expect(screen.getByPlaceholderText('e.g. English, Spanish')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /save/i })).toBeDisabled()
  })

  it('pre-fills form when editing', () => {
    const item = makeLanguage()
    renderLanguageForm({ item })
    expect(screen.getByPlaceholderText('e.g. English, Spanish')).toHaveValue(item.name)
  })

  it('renders proficiency select', () => {
    renderLanguageForm()
    expect(screen.getByLabelText(/proficiency/i)).toBeInTheDocument()
  })

  it('calls onSubmit with language data', async () => {
    const user = userEvent.setup()
    const { onSubmitMock } = renderLanguageForm()
    await user.type(screen.getByPlaceholderText('e.g. English, Spanish'), 'Spanish')
    await user.click(screen.getByRole('button', { name: /save/i }))
    expect(onSubmitMock).toHaveBeenCalledWith({
      name: 'Spanish',
      proficiency: 'Intermediate',
    })
  })
})

describe('InterestForm', () => {
  it('renders empty form', () => {
    renderInterestForm()
    expect(screen.getByPlaceholderText('e.g. Machine Learning, Hiking')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /save/i })).toBeDisabled()
  })

  it('pre-fills form when editing', () => {
    const item = makeInterest()
    renderInterestForm({ item })
    expect(screen.getByPlaceholderText('e.g. Machine Learning, Hiking')).toHaveValue(item.name)
  })

  it('calls onSubmit with interest data', async () => {
    const user = userEvent.setup()
    const { onSubmitMock } = renderInterestForm()
    await user.type(screen.getByPlaceholderText('e.g. Machine Learning, Hiking'), 'Photography')
    await user.click(screen.getByRole('button', { name: /save/i }))
    expect(onSubmitMock).toHaveBeenCalledWith({
      name: 'Photography',
      category: undefined,
    })
  })

  it('includes category when provided', async () => {
    const user = userEvent.setup()
    const { onSubmitMock } = renderInterestForm()
    await user.type(screen.getByPlaceholderText('e.g. Machine Learning, Hiking'), 'Photography')
    await user.type(screen.getByPlaceholderText('e.g. Technology, Sports'), 'Art')
    await user.click(screen.getByRole('button', { name: /save/i }))
    expect(onSubmitMock).toHaveBeenCalledWith({
      name: 'Photography',
      category: 'Art',
    })
  })
})

describe('PersonalForm', () => {
  it('renders empty form', () => {
    renderPersonalForm()
    expect(screen.getByPlaceholderText('John Doe')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('john@example.com')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /save/i })).toBeDisabled()
  })

  it('pre-fills form when editing', () => {
    const item = makePersonal()
    renderPersonalForm({ item })
    expect(screen.getByPlaceholderText('John Doe')).toHaveValue(item.name)
    expect(screen.getByPlaceholderText('john@example.com')).toHaveValue(item.email)
    expect(screen.getByPlaceholderText('https://yoursite.com')).toHaveValue(item.portfolio)
  })

  it('enables Save when name and email are filled', async () => {
    const user = userEvent.setup()
    renderPersonalForm()
    await user.type(screen.getByPlaceholderText('John Doe'), 'Jane Doe')
    await user.type(screen.getByPlaceholderText('john@example.com'), 'jane@example.com')
    expect(screen.getByRole('button', { name: /save/i })).not.toBeDisabled()
  })

  it('calls onSubmit with personal data', async () => {
    const user = userEvent.setup()
    const { onSubmitMock } = renderPersonalForm()
    await user.type(screen.getByPlaceholderText('John Doe'), 'Jane Doe')
    await user.type(screen.getByPlaceholderText('john@example.com'), 'jane@example.com')
    await user.click(screen.getByRole('button', { name: /save/i }))
    expect(onSubmitMock).toHaveBeenCalledWith({
      name: 'Jane Doe',
      email: 'jane@example.com',
      phone: undefined,
      location: undefined,
      title: undefined,
      summary: undefined,
      portfolio: undefined,
      linkedIn: undefined,
      github: undefined,
    })
  })

  it('renders links section', () => {
    renderPersonalForm()
    expect(screen.getByText('Links')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('https://yoursite.com')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('https://linkedin.com/in/...')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('https://github.com/...')).toBeInTheDocument()
  })

  it('calls onCancel when Cancel is clicked', async () => {
    const user = userEvent.setup()
    const { onCancelMock } = renderPersonalForm()
    await user.click(screen.getByRole('button', { name: /cancel/i }))
    expect(onCancelMock).toHaveBeenCalledOnce()
  })
})
