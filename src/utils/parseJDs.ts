/**
 * Parse a pasted block of JDs into individual items.
 *
 * Multiple JDs are separated by `---` on its own line.
 * Each block may start with `Company:` / `Role:` lines (checked in first 3 lines).
 * Falls back to the provided defaults for any block that lacks inline headers.
 */
export function parseJDs(
  text: string,
  defaultCompany: string,
  defaultRole: string,
): Array<{ company: string; role: string; jdText: string }> {
  const blocks = text.split(/^\s*---\s*$/m).map((b) => b.trim()).filter(Boolean)

  return blocks.map((block) => {
    const lines = block.split('\n')
    let company = defaultCompany
    let role = defaultRole
    let contentStart = 0

    for (let i = 0; i < Math.min(lines.length, 3); i++) {
      const cm = lines[i].match(/^company:\s*(.+)/i)
      if (cm) {
        company = cm[1].trim()
        contentStart = i + 1
        continue
      }
      const rm = lines[i].match(/^role:\s*(.+)/i)
      if (rm) {
        role = rm[1].trim()
        contentStart = Math.max(contentStart, i + 1)
      }
    }

    const jdText = lines.slice(contentStart).join('\n').trim()
    return { company, role, jdText }
  })
}
