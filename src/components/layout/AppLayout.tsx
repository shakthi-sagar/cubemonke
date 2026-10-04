import { Suspense } from 'react'
import { Outlet, useLocation } from 'react-router-dom'

import { AppFooter } from '@/components/layout/AppFooter'
import { AppHeader } from '@/components/layout/AppHeader'
import { AppLoadingScreen } from '@/components/layout/AppLoadingScreen'
import { TooltipProvider } from '@/components/ui/tooltip'
import { useAuthUser } from '@/hooks/useAuthUser'

export function AppLayout() {
  const location = useLocation()
  const { user, isLoading, error } = useAuthUser()

  if (isLoading) return <AppLoadingScreen />

  return (
    <TooltipProvider>
      <div className="flex h-svh w-full flex-col overflow-hidden bg-background text-foreground transition-colors duration-300">
        <AppHeader
          pathname={location.pathname}
          user={user}
          isLoading={isLoading}
          error={error}
        />
        <main className="relative min-h-0 w-full flex-1 overflow-y-auto">
          <div className="mx-auto h-full min-h-full w-full max-w-[980px]">
            <div className="h-full min-h-full min-w-0">
              <Suspense fallback={
                <div className="flex h-full min-h-[300px] w-full flex-1 items-center justify-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                      Loading Content
                    </span>
                  </div>
                </div>
              }>
                <Outlet />
              </Suspense>
            </div>
          </div>
        </main>
        <AppFooter />
      </div>
    </TooltipProvider>
  )
}

export default AppLayout
