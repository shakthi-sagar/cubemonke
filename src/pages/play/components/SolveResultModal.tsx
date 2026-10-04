import { Award, Check, Loader2, RotateCcw, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { LastSolveInfo, ShareReplayStatus } from "@/pages/play/types"
import { formatMetric, formatTime } from "@/pages/play/utils"
import { TpsGraph } from "@/pages/play/components/TpsGraph"

type SolveResultModalProps = {
  lastSolve: LastSolveInfo
  isReplaySaved: boolean
  shareReplayStatus: ShareReplayStatus
  replayAvailable: boolean
  onSaveReplay: () => void
  onDiscardLastSolve: () => void
  onResetTimer: () => void
}

function saveReplayLabel(status: ShareReplayStatus, isReplaySaved: boolean) {
  if (status === "saving") return "Saving Replay"
  if (isReplaySaved || status === "saved" || status === "copied")
    return "Replay Saved"
  return "Save Replay"
}


export function SolveResultModal({
  lastSolve,
  isReplaySaved,
  shareReplayStatus,
  replayAvailable,
  onSaveReplay,
  onDiscardLastSolve,
  onResetTimer,
}: SolveResultModalProps) {
  const isSavingReplay = shareReplayStatus === "saving"
  const isCopyingReplay = shareReplayStatus === "copying"
  const replayActionBusy = isSavingReplay || isCopyingReplay
  const replayActionDone =
    isReplaySaved ||
    shareReplayStatus === "saved" ||
    shareReplayStatus === "copied"

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/90 p-4 backdrop-blur-md">
      <div className="relative max-h-[92svh] w-full max-w-3xl animate-in overflow-y-auto rounded-3xl border border-border/40 bg-card/85 p-6 text-center shadow-[0_0_50px_rgba(0,0,0,0.4)] backdrop-blur-xl duration-300 zoom-in-95 fade-in md:p-8">
        {lastSolve.isNewPB ? (
          <div className="mx-auto mb-4 flex w-fit items-center gap-1.5 rounded-full bg-amber-500 px-4 py-1 text-[10px] font-black tracking-widest text-slate-950 uppercase shadow-lg shadow-amber-500/20">
            <Award className="h-3.5 w-3.5" /> New Personal Best!
          </div>
        ) : null}

        <span className="mt-2 mb-2 block text-[10px] font-extrabold tracking-widest text-muted-foreground uppercase">
          Solve Completed
        </span>

        <h2 className="my-4 font-mono text-6xl font-black tracking-tight text-foreground">
          {formatTime(lastSolve.time)}
        </h2>
        {!lastSolve.leaderboardEligible ? (
          <p className="mb-4 rounded-md border border-primary/15 bg-primary/10 px-3 py-2 text-xs font-bold text-primary">
            Practice solve: saved, but not counted toward your standard best.
          </p>
        ) : null}

        <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <div className="rounded-lg border border-border/30 bg-muted/25 p-3">
            <div className="text-[9px] font-black tracking-widest text-muted-foreground uppercase">
              Avg TPS
            </div>
            <div className="mt-1 font-mono text-xl font-black text-primary">
              {formatMetric(lastSolve.analytics.tpsAverage)}
            </div>
          </div>
          <div className="rounded-lg border border-border/30 bg-muted/25 p-3">
            <div className="text-[9px] font-black tracking-widest text-muted-foreground uppercase">
              Peak TPS
            </div>
            <div className="mt-1 font-mono text-xl font-black text-primary">
              {formatMetric(lastSolve.analytics.tpsPeak)}
            </div>
          </div>
          <div className="rounded-lg border border-border/30 bg-muted/25 p-3">
            <div className="text-[9px] font-black tracking-widest text-muted-foreground uppercase">
              Moves
            </div>
            <div className="mt-1 font-mono text-xl font-black">
              {lastSolve.analytics.moveCount}
            </div>
          </div>
          <div className="rounded-lg border border-border/30 bg-muted/25 p-3">
            <div className="text-[9px] font-black tracking-widest text-muted-foreground uppercase">
              Reverted
            </div>
            <div className="mt-1 font-mono text-xl font-black">
              {lastSolve.analytics.revertedMoves}
            </div>
          </div>
        </div>

        <div className="mb-4 grid gap-2 sm:grid-cols-3">
          <div className="rounded-lg border border-border/30 bg-background/35 p-3 text-left">
            <div className="text-[9px] font-black tracking-widest text-muted-foreground uppercase">
              First Move
            </div>
            <div className="mt-1 font-mono text-sm font-bold">
              {lastSolve.analytics.firstMoveMs === null
                ? "n/a"
                : `${Math.round(lastSolve.analytics.firstMoveMs)}ms`}
            </div>
          </div>
          <div className="rounded-lg border border-border/30 bg-background/35 p-3 text-left">
            <div className="text-[9px] font-black tracking-widest text-muted-foreground uppercase">
              Pauses
            </div>
            <div className="mt-1 font-mono text-sm font-bold">
              {lastSolve.analytics.pauseCount}
            </div>
          </div>
          <div className="rounded-lg border border-border/30 bg-background/35 p-3 text-left">
            <div className="text-[9px] font-black tracking-widest text-muted-foreground uppercase">
              Longest Pause
            </div>
            <div className="mt-1 font-mono text-sm font-bold">
              {lastSolve.analytics.longestPauseMs}ms
            </div>
          </div>
        </div>

        <div className="mb-4">
          <TpsGraph points={lastSolve.analytics.tpsTimeline} />
        </div>

        <div className="mb-6 rounded-lg border border-border/20 bg-muted/30 p-4 text-left">
          <span className="mb-1 block text-[9px] font-bold tracking-wider text-muted-foreground uppercase">
            Scramble Solved
          </span>
          <p className="font-mono text-xs leading-relaxed tracking-wide break-all text-foreground/80">
            {lastSolve.scramble}
          </p>
        </div>

        <div className="flex w-full flex-col gap-3">
          <div className="grid w-full grid-cols-1 gap-2">
            <Button
              type="button"
              variant={replayActionDone ? "outline" : "default"}
              onClick={onSaveReplay}
              disabled={
                !lastSolve.isSignedIn ||
                !lastSolve.isSaved ||
                !replayAvailable ||
                replayActionDone ||
                replayActionBusy
              }
              className={`transition-all duration-200 ${
                replayActionDone
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/15"
                  : "bg-primary text-primary-foreground shadow-md shadow-primary/10 hover:bg-primary/90"
              }`}
            >
              {isSavingReplay ? (
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              ) : replayActionDone ? (
                <Check className="mr-1.5 h-4 w-4" />
              ) : null}
              {saveReplayLabel(shareReplayStatus, isReplaySaved)}
            </Button>
          </div>
          <Button
            onClick={onDiscardLastSolve}
            variant="outline"
            className="w-full border-destructive/20 text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            {lastSolve.isSaved ? (
              <Trash2 className="mr-1.5 h-4 w-4" />
            ) : (
              <RotateCcw className="mr-1.5 h-4 w-4" />
            )}
            {lastSolve.isSaved ? "Discard Solve" : "Reset Cube"}
          </Button>
          <Button
            onClick={onResetTimer}
            className="w-full bg-primary text-primary-foreground shadow-md shadow-primary/15 hover:bg-primary/95"
          >
            Next Solve
          </Button>
        </div>

        <div className="mt-5 text-[10px] text-muted-foreground/60">
          Tip: Press{" "}
          <kbd className="rounded border border-border bg-muted/60 px-1 py-0.5 font-sans text-[9px]">
            Enter
          </kbd>{" "}
          to reset to a solved cube.
        </div>
      </div>
    </div>
  )
}
