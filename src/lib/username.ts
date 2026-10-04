export const USERNAME_MIN_LENGTH = 3
export const USERNAME_MAX_LENGTH = 20

export const RESERVED_USERNAMES = new Set([
  'admin',
  'api',
  'account',
  'contact',
  'cubemonke',
  'leaderboard',
  'leaderboards',
  'login',
  'logout',
  'privacy',
  'profile',
  'profiles',
  'replay',
  'replays',
  'settings',
  'signup',
  'support',
  'terms',
  'user',
  'users',
])

export const normalizeUsername = (username: string) =>
  username
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')

export const usernameToSlug = (username: string) => normalizeUsername(username).replaceAll('_', '-')

export const validateUsername = (username: string) => {
  const normalized = normalizeUsername(username)

  if (normalized !== username.trim()) {
    throw new Error('Use lowercase letters, numbers, and underscores only.')
  }

  if (normalized.length < USERNAME_MIN_LENGTH) {
    throw new Error(`Username must be at least ${USERNAME_MIN_LENGTH} characters.`)
  }

  if (normalized.length > USERNAME_MAX_LENGTH) {
    throw new Error(`Username must be ${USERNAME_MAX_LENGTH} characters or less.`)
  }

  if (!/^[a-z0-9]/.test(normalized) || !/[a-z0-9]$/.test(normalized)) {
    throw new Error('Username cannot start or end with an underscore.')
  }

  if (normalized.includes('__')) {
    throw new Error('Username cannot contain consecutive underscores.')
  }

  if (!/^[a-z0-9_]+$/.test(normalized)) {
    throw new Error('Use lowercase letters, numbers, and underscores only.')
  }

  if (RESERVED_USERNAMES.has(normalized)) {
    throw new Error('That username is reserved.')
  }

  return normalized
}

export const usernameRulesText =
  '3-20 chars. Lowercase letters, numbers, and underscores only. No spaces.'
