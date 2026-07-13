export const skillCategories = [
  'Frontend', 'Backend', 'Database', 'Cloud', 'Testing', 'DevOps', 'Languages', 'Soft Skills',
] as const

export const languageProficiencies = ['Native', 'Fluent', 'Advanced', 'Intermediate', 'Basic'] as const

export const skillLevels = ['Beginner', 'Intermediate', 'Advanced', 'Expert'] as const

export function parseListInput(value: string): string[] {
  return value
    .split(/[,;\\n]/)
    .map((s) => s.trim())
    .filter(Boolean)
}

export function formatListInput(items: string[]): string {
  return items.join(', ')
}
