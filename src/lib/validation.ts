export function readString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

export function requireString(value: unknown, field: string): string {
  const normalized = readString(value)
  if (!normalized) {
    throw new Error(`${field} is required`)
  }

  return normalized
}

export function requireEmail(value: unknown): string {
  const email = requireString(value, 'Email')
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('Email is invalid')
  }

  return email.toLowerCase()
}

export function readOptionalString(value: unknown): string | null {
  const normalized = readString(value)
  return normalized ? normalized : null
}

export function parseBoolean(value: unknown): boolean {
  if (typeof value === 'boolean') return value
  if (typeof value === 'string') return ['true', '1', 'yes', 'on'].includes(value.toLowerCase())
  return false
}

export function parseInteger(value: unknown, field: string): number {
  const raw = readString(value)
  const parsed = Number.parseInt(raw, 10)
  if (!Number.isFinite(parsed)) {
    throw new Error(`${field} must be a number`)
  }

  return parsed
}