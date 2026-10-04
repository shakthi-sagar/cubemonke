import { useState } from "react"
import { RotateCcw, Shuffle } from "lucide-react"

import { CubeScene } from "@/components/cube/CubeScene"
import { Button } from "@/components/ui/button"
import { useCubeAnimator } from "@/hooks/useCubeAnimator"
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts"
import { createScramble } from "@/lib/scramble"
import {
  cameraPositionFromViewport,
  cameraUpFromViewport,
  type SpeedcubeSettings,
} from "@/lib/settings"
import type { CanonicalFace, ViewerFaceMap } from "@/types/cube"

const PREVIEW_VIEWER_MAP: ViewerFaceMap = {
  front: "F",
  back: "B",
  right: "R",
  left: "L",
  up: "U",
  down: "D",
}

const SAMPLE_TURNS: Array<{
  label: string
  face: CanonicalFace
  direction: 1 | -1
}> = [
  { label: "R", face: "R", direction: 1 },
  { label: "R'", face: "R", direction: -1 },
  { label: "U", face: "U", direction: 1 },
  { label: "U'", face: "U", direction: -1 },
  { label: "F", face: "F", direction: 1 },
  { label: "F'", face: "F", direction: -1 },
]

export function SettingsPreviewCube({
  settings,
  keyboardEnabled,
}: {
  settings: SpeedcubeSettings
  keyboardEnabled: boolean
}) {
  const [viewerMap, setViewerMap] = useState<ViewerFaceMap>(PREVIEW_VIEWER_MAP)
  const {
    cube,
    activeTurn,
    turnNow,
    scrambleCube,
    reset,
    isBusy,
    currentLabel,
  } = useCubeAnimator(3, settings.turnSpeed)

  useKeyboardShortcuts(
    3,
    viewerMap,
    turnNow,
    keyboardEnabled,
    settings.keyboard
  )

  return (
    <section className="rounded-lg border border-border bg-card/40 p-6 shadow-sm backdrop-blur-md">
      <div className="flex items-center justify-between gap-4 border-b border-border/40 pb-4">
        <div>
          <h2 className="text-sm font-bold">Live Preview Cube</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Uses your current colors, turn speed, viewport, and keyboard layout.
          </p>
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-lg border border-border bg-background/70">
        <div className="relative h-72 sm:h-80">
          <span className="absolute top-3 right-3 z-10 rounded-md border border-border bg-background/75 px-2 py-1 font-mono text-[10px] font-bold text-muted-foreground uppercase shadow-sm backdrop-blur-md">
            {currentLabel}
          </span>
          <CubeScene
            cube={cube}
            size={3}
            activeTurn={activeTurn}
            viewerMap={viewerMap}
            onViewerMapChange={setViewerMap}
            colors={settings.cubeColors}
            cameraPosition={cameraPositionFromViewport(settings.cameraViewport)}
            cameraUp={cameraUpFromViewport(settings.cameraViewport)}
          />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-6">
        {SAMPLE_TURNS.map((turn) => (
          <Button
            key={turn.label}
            type="button"
            variant="outline"
            size="sm"
            disabled={isBusy}
            onClick={() =>
              turnNow({ face: turn.face, direction: turn.direction })
            }
          >
            {turn.label}
          </Button>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isBusy}
          onClick={() => scrambleCube(createScramble(3))}
        >
          <Shuffle className="h-3.5 w-3.5" /> Scramble
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={reset}>
          <RotateCcw className="h-3.5 w-3.5" /> Reset Preview
        </Button>
      </div>

      <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
        Try the configured shortcuts here too. Keybindings are paused while
        recording a new key.
      </p>
    </section>
  )
}
