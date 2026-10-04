import { Check, Flag, Play, RotateCcw } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { TimerState } from "@/pages/play/types"
import { formatTime } from "@/pages/play/utils"

type TimerOverlayProps = {
  timerState: TimerState
  elapsed: number
  inspectionSeconds: number
  debugSolveEnabled: boolean
  onStartInspection: () => void
  onResetTimer: () => void
  onDebugSolve: () => void
}

export function TimerOverlay({
  timerState,
  elapsed,
  inspectionSeconds,
  debugSolveEnabled,
  onStartInspection,
  onResetTimer,
  onDebugSolve,
}: TimerOverlayProps) {
  return (
    <div className="z-10 mb-2 flex w-full flex-col items-center justify-center text-center select-none">
      <div
        className="group cursor-pointer"
        onClick={() => {
          if (timerState === "idle") onStartInspection()
          else if (timerState === "stopped") onResetTimer()
        }}
      >
        {timerState === "inspection" ? (
          <div className="space-y-1">
            <span className="animate-pulse text-xs font-extrabold tracking-widest text-primary uppercase drop-shadow-md">
              Inspection Countdown
            </span>
            <h2 className="font-mono text-6xl font-black text-primary drop-shadow-[0_4px_20px_rgba(var(--primary),0.35)] sm:text-7xl">
              {inspectionSeconds}s
            </h2>
          </div>
        ) : (
          <div className="space-y-1">
            <span className="text-xs font-bold tracking-widest text-muted-foreground uppercase drop-shadow-sm transition-colors group-hover:text-foreground">
              {timerState === "idle" && "Ready to Solve"}
              {timerState === "running" && "Solving..."}
            </span>
            <h2
              className={`font-mono text-6xl font-black tracking-tighter drop-shadow-[0_4px_25px_rgba(0,0,0,0.7)] transition-all duration-200 sm:text-7xl ${
                timerState === "running"
                  ? "scale-105 text-primary"
                  : "text-foreground"
              }`}
            >
              {formatTime(elapsed)}
            </h2>
          </div>
        )}
      </div>

      <div className="mt-8 flex gap-4">
        {timerState === "idle" ? (
          <>
            <Button
              onClick={onResetTimer}
              variant="outline"
              className="h-11 px-5 text-sm font-semibold shadow-lg transition-all"
            >
              <RotateCcw className="mr-2 h-4.5 w-4.5" /> Reset Cube
            </Button>
            <Button
              onClick={onStartInspection}
              className="h-11 px-6 text-sm font-semibold shadow-lg shadow-primary/20 transition-all hover:shadow-primary/30"
            >
              <Play className="mr-2 h-4.5 w-4.5" /> Start Timer
            </Button>
          </>
        ) : null}
        {timerState === "inspection" || timerState === "running" ? (
          <>
            <Button
              onClick={onResetTimer}
              variant="destructive"
              className="h-11 px-6 text-sm font-semibold shadow-lg shadow-destructive/20 transition-all hover:shadow-destructive/30"
            >
              <Flag className="mr-2 h-4.5 w-4.5" /> Give Up
            </Button>
            {debugSolveEnabled ? (
              <Button
                type="button"
                onClick={onDebugSolve}
                variant="outline"
                className="h-11 px-5 text-sm font-semibold shadow-lg transition-all"
              >
                <Check className="mr-2 h-4.5 w-4.5" /> Debug Solve
              </Button>
            ) : null}
          </>
        ) : null}
      </div>
    </div>
  )
}
