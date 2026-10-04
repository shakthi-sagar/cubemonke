import type { CanonicalFace } from "@/types/cube"

import type { CameraViewport } from "./camera"
import type { KeyboardSettings } from "./keyboard"

export type SpeedcubeSettings = {
  turnSpeed: number
  cameraViewport: CameraViewport
  keyboard: KeyboardSettings
  cubeColors: Record<CanonicalFace, string>
}
