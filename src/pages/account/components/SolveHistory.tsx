import { Link } from 'react-router-dom'
import { ChevronDown, Film } from 'lucide-react'

import { Button } from '@/components/ui/button'
import type { SolveRecord } from '@/lib/solves'
import { formatAccountTime } from '@/pages/account/accountStats'

type SolveHistoryProps = {
  solves: SolveRecord[]
  hasMoreSolves: boolean
  isLoadingMoreSolves: boolean
  onLoadMoreSolves: () => void
}

export function SolveHistory({
  solves,
  hasMoreSolves,
  isLoadingMoreSolves,
  onLoadMoreSolves,
}: SolveHistoryProps) {
  return (
    <div className="rounded-lg border border-border bg-card/45 p-4 shadow-sm backdrop-blur-md">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="text-sm font-black">Solve History</div>
        <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
          {solves.length} loaded
        </div>
      </div>
      <div className="divide-y divide-border/30">
        {solves.map((solve) => (
          <div key={solve.id} className="flex flex-col justify-between gap-3 py-3 sm:flex-row sm:items-center">
            <div>
              <div className="font-mono text-lg font-black">{formatAccountTime(solve.timeMs)}</div>
              <div className="text-xs text-muted-foreground">
                {solve.analytics.cube} / {solve.analytics.mode} - {solve.analytics.moveCount} moves - {solve.analytics.tpsAverage.toFixed(2)} TPS
              </div>
            </div>
            {solve.replayId ? (
              <Button asChild variant="outline" size="sm">
                <Link to={`/replays/${solve.replayId}`}>
                  <Film className="mr-1.5 h-3.5 w-3.5" /> Replay
                </Link>
              </Button>
            ) : null}
          </div>
        ))}
      </div>
      {hasMoreSolves ? (
        <Button
          type="button"
          variant="outline"
          onClick={onLoadMoreSolves}
          disabled={isLoadingMoreSolves}
          className="mt-4 w-full"
        >
          <ChevronDown className="mr-1.5 h-3.5 w-3.5" />
          {isLoadingMoreSolves ? 'Loading...' : 'Load More Solves'}
        </Button>
      ) : null}
    </div>
  )
}
