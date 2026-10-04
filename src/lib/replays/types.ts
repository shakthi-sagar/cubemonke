import type { CubeId, ModeId } from "@/lib/events"
import type { SpeedcubeSettings } from "@/lib/settings"
import type { CubeMove, ViewerFaceMap } from "@/types/cube"

export type ReplayPhase = "inspection" | "solve"

export type ReplayCameraState = {
  position: [number, number, number]
  target: [number, number, number]
  up?: [number, number, number]
}

export type ReplayTimelineEvent =
  | {
      id: string
      type: "timer"
      phase: ReplayPhase
      time: number
      label: "inspection-start" | "solve-start" | "solve-stop"
    }
  | {
      id: string
      type: "move"
      phase: ReplayPhase
      time: number
      inputTime?: number
      move: CubeMove
    }
  | {
      id: string
      type: "camera"
      phase: ReplayPhase
      time: number
      camera: ReplayCameraState
    }
  | {
      id: string
      type: "viewer-map"
      phase: ReplayPhase
      time: number
      viewerMap: ViewerFaceMap
    }

type CompactPhase = 0 | 1
type CompactTimerLabel = 0 | 1 | 2

export type CompactReplayTimelineEvent =
  | ["t", CompactPhase, number, CompactTimerLabel]
  | ["m", CompactPhase, number, CubeMove["face"], CubeMove["direction"], string, 0 | 1, number?]
  | ["c", CompactPhase, number, ReplayCameraState["position"], ReplayCameraState["target"], ReplayCameraState["up"]?]
  | ["v", CompactPhase, number, ViewerFaceMap]

export type ReplayTimelineEventInput =
  | Omit<Extract<ReplayTimelineEvent, { type: "timer" }>, "id">
  | Omit<Extract<ReplayTimelineEvent, { type: "move" }>, "id">
  | Omit<Extract<ReplayTimelineEvent, { type: "camera" }>, "id">
  | Omit<Extract<ReplayTimelineEvent, { type: "viewer-map" }>, "id">

export type ReplayMoveEvent = {
  id: string
  phase: ReplayPhase
  time: number
  inputTime?: number
  move: CubeMove
}

export type ReplaySettingsSnapshot = Pick<
  SpeedcubeSettings,
  "turnSpeed" | "cubeColors"
>

export type ReplayMetadata = {
  createdAt: string
  userName: string
  cube: CubeId
  size: number
  mode: ModeId
  leaderboardEligible: boolean
  time: number
  scramble: string
}

export type ReplayPayload = ReplayMetadata & {
  scrambleMoves: CubeMove[]
  settings: ReplaySettingsSnapshot
  initialCamera: ReplayCameraState
  initialViewerMap: ViewerFaceMap
  finalViewerMap: ViewerFaceMap
  events: CompactReplayTimelineEvent[]
}

export type ReplayRecord = ReplayMetadata & {
  id: string
  solveId: string
  scrambleMoves: CubeMove[]
  settings: ReplaySettingsSnapshot
  initialCamera: ReplayCameraState
  initialViewerMap: ViewerFaceMap
  finalViewerMap: ViewerFaceMap
  events: ReplayTimelineEvent[]
  moves: ReplayMoveEvent[]
}
