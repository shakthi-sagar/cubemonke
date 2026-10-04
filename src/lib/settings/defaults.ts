import { COLOR_PRESETS } from "./colors"
import { DEFAULT_KEYBOARD_SETTINGS } from "./keyboard"
import type { SpeedcubeSettings } from "./types"

export const DEFAULT_SPEEDCUBE_SETTINGS: SpeedcubeSettings = {
  turnSpeed: 4.5,
  cameraViewport: { azimuth: 39, elevation: 30 },
  keyboard: DEFAULT_KEYBOARD_SETTINGS,
  cubeColors: COLOR_PRESETS[0].colors,
}
