import { CUBE_OPTIONS, MODE_OPTIONS } from '@/lib/events'
import type { SolveRecord } from '@/lib/solves'
import { average, bestSolve, formatAccountTime } from '@/pages/account/accountStats'

export function EventSummary({ solves }: { solves: SolveRecord[] }) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {CUBE_OPTIONS.flatMap((cube) =>
        MODE_OPTIONS.map((mode) => {
          const eventSolves = solves.filter((solve) => solve.analytics.cube === cube.id && solve.analytics.mode === mode.id)
          if (eventSolves.length === 0) return null

          const best = bestSolve(eventSolves)
          const avgTps = average(eventSolves.map((solve) => solve.analytics.tpsAverage))

          return (
            <div key={`${cube.id}-${mode.id}`} className="rounded-lg border border-border bg-card/45 p-4 shadow-sm backdrop-blur-md">
              <div className="text-[10px] font-black uppercase tracking-widest text-primary">
                {cube.label} / {mode.label}
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
                <div>
                  <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">PB</div>
                  <div className="mt-1 font-mono font-black">{best ? formatAccountTime(best.timeMs) : 'n/a'}</div>
                </div>
                <div>
                  <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Solves</div>
                  <div className="mt-1 font-mono font-black">{eventSolves.length}</div>
                </div>
                <div>
                  <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Avg TPS</div>
                  <div className="mt-1 font-mono font-black">{avgTps.toFixed(2)}</div>
                </div>
              </div>
            </div>
          )
        }),
      )}
    </div>
  )
}
