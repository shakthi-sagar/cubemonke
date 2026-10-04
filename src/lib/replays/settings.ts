import type { SpeedcubeSettings } from "@/lib/settings"
import type { ReplaySettingsSnapshot } from "@/lib/replays/types"

export const createReplaySettingsSnapshot = (
  settings: Pick<SpeedcubeSettings, "turnSpeed" | "cubeColors">
): ReplaySettingsSnapshot => ({
  turnSpeed: settings.turnSpeed,
  cubeColors: { ...settings.cubeColors },
})
