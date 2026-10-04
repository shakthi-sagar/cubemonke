import { Palette } from 'lucide-react'

import {
  COLOR_PRESETS,
  CUBE_FACES,
  type SpeedcubeSettings,
} from '@/lib/settings'
import type { CanonicalFace } from '@/types/cube'

type CubeColorsSectionProps = {
  cubeColors: SpeedcubeSettings['cubeColors']
  updateSettings: (settings: Partial<SpeedcubeSettings>) => void
}

export function CubeColorsSection({
  cubeColors,
  updateSettings,
}: CubeColorsSectionProps) {
  const setCubeColor = (face: CanonicalFace, color: string) => {
    updateSettings({ cubeColors: { ...cubeColors, [face]: color } })
  }

  return (
    <section className="rounded-lg border border-border bg-card/40 p-6 shadow-sm backdrop-blur-md">
      <div className="flex items-center justify-between gap-4 border-b border-border/40 pb-4">
        <h2 className="flex items-center gap-2 text-sm font-bold">
          <Palette className="h-4 w-4 text-primary" /> Custom Rubik&apos;s Theme
        </h2>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {COLOR_PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => updateSettings({ cubeColors: preset.colors })}
            className="rounded-lg border border-border bg-muted/20 p-4 text-left transition-colors hover:border-primary/50 hover:bg-primary/5"
          >
            <span className="block text-xs font-bold">{preset.label}</span>
            <div className="mt-3 flex gap-1">
              {CUBE_FACES.map((face) => (
                <span
                  key={face}
                  className="h-5 w-5 rounded-md border border-border shadow-inner"
                  style={{ backgroundColor: preset.colors[face] }}
                />
              ))}
            </div>
          </button>
        ))}
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {CUBE_FACES.map((face) => (
          <label key={face} className="flex items-center gap-3 rounded-lg border border-border bg-background/30 p-3">
            <input
              type="color"
              value={cubeColors[face]}
              onChange={(event) => setCubeColor(face, event.target.value)}
              className="h-9 w-12 cursor-pointer rounded-md border border-border bg-transparent p-1"
              aria-label={`Color for ${face} face`}
            />
            <span className="flex flex-col">
              <span className="text-xs font-bold">Face {face}</span>
              <span className="font-mono text-[10px] text-muted-foreground">{cubeColors[face]}</span>
            </span>
          </label>
        ))}
      </div>
    </section>
  )
}
