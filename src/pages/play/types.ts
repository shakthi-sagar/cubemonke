import type {
  ReplayCameraState,
  ReplayMoveEvent,
  ReplayTimelineEvent,
} from "@/lib/replays"
import type { SolveAnalyticsSnapshot } from "@/lib/solves"
import type { CubeMove, ViewerFaceMap } from "@/types/cube"

export type TimerState = "idle" | "inspection" | "running" | "stopped"

export type ShareReplayStatus =
  | "idle"
  | "saving"
  | "saved"
  | "copying"
  | "copied"
  | "failed"

export type LastSolveInfo = {
  solveId: string
  time: number
  scramble: string
  isNewPB: boolean
  leaderboardEligible: boolean
  isSaved: boolean
  isSignedIn: boolean
  replayId: string | null
  analytics: SolveAnalyticsSnapshot
}

export type PreparedScramble = {
  text: string
  moves: CubeMove[]
}

export type ReplaySession = {
  id: string
  inspectionStartedAt: number
  scramble: string
  scrambleMoves: CubeMove[]
  initialCamera: ReplayCameraState
  initialViewerMap: ViewerFaceMap
  events: ReplayTimelineEvent[]
  moves: ReplayMoveEvent[]
}
