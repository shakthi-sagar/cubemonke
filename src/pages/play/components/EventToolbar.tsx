import { X } from "lucide-react"

import { CubeSelector } from "@/components/event/CubeSelector"
import { ModeSelector } from "@/components/event/ModeSelector"
import { Button } from "@/components/ui/button"
import type { CubeId, ModeId } from "@/lib/events"
import type { TimerState } from "@/pages/play/types"

const CUSTOM_MOVE_BUTTONS = [
  "R",
  "R'",
  "U",
  "U'",
  "F",
  "F'",
  "L",
  "L'",
  "D",
  "D'",
  "B",
  "B'",
  "Rw",
  "Rw'",
]

type EventToolbarProps = {
  cubeId: CubeId
  mode: ModeId
  timerState: TimerState
  scramble: string
  customScrambleText: string
  customScrambleError: string | null
  canChangeEvent: boolean
  onCubeChange: (cube: CubeId) => void
  onModeChange: (mode: ModeId) => void
  onCustomScrambleChange: (value: string) => void
  onAppendCustomMove: (move: string) => void
  onClearCustomScramble: () => void
}

export function EventToolbar({
  cubeId,
  mode,
  timerState,
  scramble,
  customScrambleText,
  customScrambleError,
  canChangeEvent,
  onCubeChange,
  onModeChange,
  onCustomScrambleChange,
  onAppendCustomMove,
  onClearCustomScramble,
}: EventToolbarProps) {
  const isCustomMode = mode === "custom"

  return (
    <div className="z-10 mx-auto flex w-full max-w-fit flex-col gap-2">
      <div className="flex flex-wrap justify-center gap-16">
        <CubeSelector
          value={cubeId}
          onChange={onCubeChange}
          showLabel={false}
          disabled={!canChangeEvent}
        />
        <ModeSelector
          value={mode}
          onChange={onModeChange}
          showLabel={false}
          disabled={!canChangeEvent}
        />
      </div>
      {isCustomMode && timerState === "idle" ? (
        <div className="space-y-3 rounded-lg border border-border bg-card/55 p-2.5 shadow-md backdrop-blur-md">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
            <div>
              <span className="mb-1 block text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                Custom Scramble
              </span>
              <p className="text-xs text-muted-foreground">
                Build or paste a scramble, visualize it, then start inspection.
                Custom solves are practice-only.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClearCustomScramble}
              >
                <X className="mr-1.5 h-3.5 w-3.5" /> Clear
              </Button>
            </div>
          </div>
          <textarea
            value={customScrambleText}
            onChange={(event) => onCustomScrambleChange(event.target.value)}
            placeholder="Example: R U R' U' F2 2R Rw"
            className="min-h-16 w-full resize-y rounded-md border border-border bg-background/70 px-3 py-2 font-mono text-sm text-foreground transition outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          <div className="flex flex-wrap gap-2">
            {CUSTOM_MOVE_BUTTONS.map((move) => (
              <Button
                key={move}
                type="button"
                variant="outline"
                size="xs"
                className="min-w-11 font-mono tracking-normal normal-case"
                onClick={() => onAppendCustomMove(move)}
              >
                {move}
              </Button>
            ))}
          </div>
          {customScrambleError ? (
            <p className="rounded-md border border-destructive/25 bg-destructive/10 px-3 py-2 text-xs font-semibold text-destructive">
              {customScrambleError}
            </p>
          ) : null}
        </div>
      ) : null}
      {timerState === "inspection" && scramble ? (
        <div className="rounded-lg border border-border bg-card/55 p-2.5 shadow-md backdrop-blur-md">
          <span className="mb-1 block text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
            Scramble ({cubeId} / {mode})
          </span>
          <p className="font-mono text-sm tracking-wide text-foreground/90 select-text sm:text-base">
            {scramble}
          </p>
        </div>
      ) : null}
    </div>
  )
}
