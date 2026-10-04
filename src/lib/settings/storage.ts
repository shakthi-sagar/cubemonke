import type { CanonicalFace } from "@/types/cube"

import { CUBE_FACES } from "./colors"
import { DEFAULT_SPEEDCUBE_SETTINGS } from "./defaults"
import { normalizeKeyboardSettings } from "./keyboard"
import { TURN_SPEED_INSTANT, TURN_SPEED_MIN } from "./speed"
import type { SpeedcubeSettings } from "./types"

export const SETTINGS_STORAGE_KEY = "speedcube_settings_v2"

const isHexColor = (value: unknown): value is string =>
  typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value)

export const normalizeSettings = (input: unknown): SpeedcubeSettings => {
  const data =
    input && typeof input === "object"
      ? (input as Partial<SpeedcubeSettings>)
      : {}
  const defaults = DEFAULT_SPEEDCUBE_SETTINGS
  const turnSpeed =
    typeof data.turnSpeed === "number"
      ? Math.min(TURN_SPEED_INSTANT, Math.max(TURN_SPEED_MIN, data.turnSpeed))
      : defaults.turnSpeed
  const keyboard = normalizeKeyboardSettings(data.keyboard)
  const cameraViewport = {
    azimuth:
      typeof data.cameraViewport?.azimuth === "number"
        ? Math.min(180, Math.max(-180, data.cameraViewport.azimuth))
        : defaults.cameraViewport.azimuth,
    elevation:
      typeof data.cameraViewport?.elevation === "number"
        ? Math.min(180, Math.max(-180, data.cameraViewport.elevation))
        : defaults.cameraViewport.elevation,
  }
  const colors = { ...defaults.cubeColors }

  if (data.cubeColors && typeof data.cubeColors === "object") {
    for (const face of CUBE_FACES) {
      const value = (data.cubeColors as Partial<Record<CanonicalFace, string>>)[
        face
      ]
      if (isHexColor(value)) colors[face] = value
    }
  }

  return {
    turnSpeed,
    cameraViewport,
    keyboard,
    cubeColors: colors,
  }
}

export const readCachedSpeedcubeSettings = (): SpeedcubeSettings | null => {
  if (typeof window === "undefined") return null

  try {
    const stored = window.localStorage.getItem(SETTINGS_STORAGE_KEY)
    return stored ? normalizeSettings(JSON.parse(stored)) : null
  } catch {
    return null
  }
}

export const readSpeedcubeSettings = (): SpeedcubeSettings =>
  readCachedSpeedcubeSettings() ?? DEFAULT_SPEEDCUBE_SETTINGS

export const writeSpeedcubeSettings = (settings: SpeedcubeSettings) => {
  if (typeof window === "undefined") return

  try {
    window.localStorage.setItem(
      SETTINGS_STORAGE_KEY,
      JSON.stringify(normalizeSettings(settings))
    )
  } catch {
    // Cached settings should never block active solving.
  }
}
