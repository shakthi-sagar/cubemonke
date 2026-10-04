import { Link } from 'react-router-dom'
import { Settings, Trophy, User } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { average, bestSolve, formatAccountTime } from '@/pages/account/accountStats'
import { EventSummary } from '@/pages/account/components/EventSummary'
import { SolveHistory } from '@/pages/account/components/SolveHistory'
import { StatCard } from '@/pages/account/components/StatCard'
import { useAccountSolves } from '@/pages/account/hooks/useAccountSolves'

export function AccountPage() {
  const {
    user,
    solves,
    isLoading,
    isLoadingMoreSolves,
    hasMoreSolves,
    loadError,
    loadMoreSolves,
  } = useAccountSolves()

  const eligibleSolves = solves.filter((solve) => solve.leaderboardEligible)
  const best = bestSolve(eligibleSolves)
  const avgTps = average(solves.map((solve) => solve.analytics.tpsAverage))
  const avgMoves = average(solves.map((solve) => solve.analytics.moveCount))

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center p-6">
        <div className="rounded-lg border border-border bg-card/40 px-6 py-4 text-sm font-semibold text-muted-foreground shadow-sm backdrop-blur-md">
          Loading your solves...
        </div>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="flex h-full w-full items-center justify-center p-6">
        <div className="max-w-md rounded-lg border border-destructive/25 bg-destructive/10 p-6 text-center shadow-sm backdrop-blur-md">
          <h1 className="text-xl font-black text-destructive">Solves unavailable</h1>
          <p className="mt-2 text-sm text-destructive/80">{loadError}</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="mx-auto flex h-full w-full max-w-6xl flex-col gap-6 p-4 md:p-6">
      <div className="rounded-lg border border-border bg-card/40 p-6 shadow-sm backdrop-blur-md">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
              <User className="h-7 w-7" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.24em] text-primary">Your stats</span>
            <h1 className="mt-1 text-3xl font-black tracking-tight">{user.userName}</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Your solve history and analytics, saved in this browser.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link to="/account/settings">
                <Settings className="mr-1.5 h-3.5 w-3.5" /> Name &amp; Data
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {solves.length > 0 ? (
        <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Best Standard Single" value={best ? formatAccountTime(best.timeMs) : 'n/a'} />
            <StatCard label="Solves" value={String(solves.length)} />
            <StatCard label="Average TPS" value={avgTps.toFixed(2)} />
            <StatCard label="Average Moves" value={avgMoves.toFixed(1)} />
          </div>

          <div>
            <div className="mb-3 flex items-center gap-2 text-sm font-black">
              <Trophy className="h-4 w-4 text-primary" /> Event Summary
            </div>
            <EventSummary solves={solves} />
          </div>

          <SolveHistory
            solves={solves}
            hasMoreSolves={hasMoreSolves}
            isLoadingMoreSolves={isLoadingMoreSolves}
            onLoadMoreSolves={loadMoreSolves}
          />
        </>
      ) : (
        <div className="rounded-lg border border-border bg-card/40 p-8 text-center shadow-sm backdrop-blur-md">
          <h2 className="text-xl font-black tracking-tight">No solves yet</h2>
          <p className="mt-2 text-sm text-muted-foreground">Complete a signed-in solve to build your stats.</p>
          <Button asChild className="mt-5">
            <Link to="/play">Start Solving</Link>
          </Button>
        </div>
      )}
    </div>
  )
}

export default AccountPage
