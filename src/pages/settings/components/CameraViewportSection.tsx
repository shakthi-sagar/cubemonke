import { Camera } from 'lucide-react'

import type { SpeedcubeSettings } from '@/lib/settings'

type CameraViewportSectionProps = {
  cameraViewport: SpeedcubeSettings['cameraViewport']
  updateSettings: (settings: Partial<SpeedcubeSettings>) => void
}

export function CameraViewportSection({
  cameraViewport,
  updateSettings,
}: CameraViewportSectionProps) {
  return (
    <section className="rounded-lg border border-border bg-card/40 p-6 shadow-sm backdrop-blur-md">
      <div className="flex items-center justify-between gap-4 border-b border-border/40 pb-4">
        <h2 className="flex items-center gap-2 text-sm font-bold">
          <Camera className="h-4 w-4 text-primary" /> Default Camera Viewport
        </h2>
        <span className="font-mono text-xs font-bold text-primary">
          {cameraViewport.azimuth.toFixed(0)}deg / {cameraViewport.elevation.toFixed(0)}deg
        </span>
      </div>

      <div className="mt-5 space-y-5">
        <div>
          <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <label htmlFor="cameraAzimuth">Horizontal Angle</label>
            <span className="font-mono text-foreground">{cameraViewport.azimuth.toFixed(0)}deg</span>
          </div>
          <input
            id="cameraAzimuth"
            type="range"
            min="-180"
            max="180"
            step="5"
            value={cameraViewport.azimuth}
            onChange={(event) =>
              updateSettings({
                cameraViewport: {
                  ...cameraViewport,
                  azimuth: Number(event.target.value),
                },
              })
            }
            className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-muted accent-primary"
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <label htmlFor="cameraElevation">Vertical Angle</label>
            <span className="font-mono text-foreground">{cameraViewport.elevation.toFixed(0)}deg</span>
          </div>
          <input
            id="cameraElevation"
            type="range"
            min="-180"
            max="180"
            step="5"
            value={cameraViewport.elevation}
            onChange={(event) =>
              updateSettings({
                cameraViewport: {
                  ...cameraViewport,
                  elevation: Number(event.target.value),
                },
              })
            }
            className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-muted accent-primary"
          />
        </div>
      </div>
    </section>
  )
}
