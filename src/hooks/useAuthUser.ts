import { useCallback, useEffect, useState } from 'react'

import { authProvider, type AuthUser } from '@/lib/data'

export const AUTH_CHANGED_EVENT = 'cubemonke-auth-change'

const anonymousUser = (): AuthUser => ({
  id: null,
  email: null,
  userName: 'Guest Monke',
  userSlug: 'guest-monke',
  isAnonymous: true,
  usernameCompleted: false,
  emailConfirmed: false,
})

export function useAuthUser() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setIsLoading(true)
    try {
      const nextUser = await authProvider.getCurrentUser()
      setUser(nextUser)
      setError(null)
    } catch (nextError) {
      setUser(anonymousUser())
      setError(nextError instanceof Error ? nextError.message : 'Unable to load auth status.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    queueMicrotask(() => void refresh())

    window.addEventListener(AUTH_CHANGED_EVENT, refresh)
    return () => window.removeEventListener(AUTH_CHANGED_EVENT, refresh)
  }, [refresh])

  const signOut = useCallback(async () => {
    await authProvider.signOut()
    setUser(anonymousUser())
    setError(null)
    setIsLoading(false)
  }, [])

  return {
    user,
    isLoading,
    error,
    isSignedIn: Boolean(user && !user.isAnonymous),
    needsUsername: Boolean(user && !user.isAnonymous && !user.usernameCompleted),
    refresh,
    signOut,
  }
}
