import { useCallback, useEffect, useState } from 'react'

import { authProvider, dbProvider, type AuthUser } from '@/lib/data'
import type { SolveRecord } from '@/lib/solves'

const SOLVE_PAGE_SIZE = 12

export function useAccountSolves() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [solves, setSolves] = useState<SolveRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMoreSolves, setIsLoadingMoreSolves] = useState(false)
  const [hasMoreSolves, setHasMoreSolves] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  const loadSolvePage = useCallback(async (userSlug: string, offset: number) => {
    const page = await dbProvider.solves.list({
      userSlug,
      limit: SOLVE_PAGE_SIZE + 1,
      offset,
    })

    return {
      solves: page.slice(0, SOLVE_PAGE_SIZE),
      hasMore: page.length > SOLVE_PAGE_SIZE,
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    async function loadAccount() {
      setIsLoading(true)
      setLoadError(null)

      try {
        const currentUser = await authProvider.getCurrentUser()

        if (currentUser.isAnonymous) {
          if (!isMounted) return
          setUser(currentUser)
          setSolves([])
          setHasMoreSolves(false)
          return
        }

        const nextPage = await loadSolvePage(currentUser.userSlug, 0)

        if (!isMounted) return
        setUser(currentUser)
        setSolves(nextPage.solves)
        setHasMoreSolves(nextPage.hasMore)
      } catch (error) {
        if (isMounted) setLoadError(error instanceof Error ? error.message : 'Unable to load account.')
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    void loadAccount()

    return () => {
      isMounted = false
    }
  }, [loadSolvePage])

  const loadMoreSolves = async () => {
    if (!user || user.isAnonymous || isLoadingMoreSolves) return

    setIsLoadingMoreSolves(true)
    setLoadError(null)

    try {
      const nextPage = await loadSolvePage(user.userSlug, solves.length)
      setSolves((current) => [...current, ...nextPage.solves])
      setHasMoreSolves(nextPage.hasMore)
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Unable to load more solves.')
    } finally {
      setIsLoadingMoreSolves(false)
    }
  }

  return {
    user,
    solves,
    isLoading,
    isLoadingMoreSolves,
    hasMoreSolves,
    loadError,
    loadMoreSolves,
  }
}
