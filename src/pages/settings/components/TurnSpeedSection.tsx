import { Gauge } from 'lucide-react'

import {
  TURN_SPEED_INSTANT,
  TURN_SPEED_MIN,
  type SpeedcubeSettings,
} from '@/lib/settings'

type TurnSpeedSectionProps = {
  turnSpeed: number
  updateSettings: (settings: Partial<SpeedcubeSettings>) => void
}

export function TurnSpeedSection({ turnSpeed, updateSettings }: TurnSpeedSectionProps) {
  return (
    <section className="rounded-lg border border-border bg-card/40 p-6 shadow-sm backdrop-blur-md">
      <div className="flex items-center justify-between gap-4 border-b border-border/40 pb-4">
        <h2 className="flex items-center gap-2 text-sm font-bold">
          <Gauge className="h-4 w-4 text-primary" /> Turn Speed
        </h2>
        <span className="font-mono text-sm font-bold text-primary">
          {turnSpeed >= TURN_SPEED_INSTANT ? 'Instant' : `${turnSpeed.toFixed(1)} TPS`}
        </span>
      </div>

      <div className="mt-5 space-y-2">
        <input
          type="range"
          min={TURN_SPEED_MIN}
          max={TURN_SPEED_INSTANT}
          step="0.5"
          value={turnSpeed}
          onChange={(event) => updateSettings({ turnSpeed: Number(event.target.value) })}
          className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-muted accent-primary"
          aria-label="Turn animation speed"
        />
        <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          <span>Slow</span>
          <span>Fast</span>
          <span>Instant</span>
        </div>
      </div>
    </section>
  )
}
