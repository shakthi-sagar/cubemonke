import { toast } from "sonner"

import { authProvider, dbProvider, type AuthUser } from "@/lib/data"
import type { CubeId, CubeSize, ModeId } from "@/lib/events"
import {
  compactReplayEvents,
  createReplayId,
  expandReplayEvents,
  replayMovesFromEvents,
  type ReplayTimelineEvent,
  type ReplayRecord,
} from "@/lib/replays"
import { buildSolveAnalytics } from "@/lib/solveAnalytics"
import { createSolveAnalyticsSnapshot, type SolveRecord } from "@/lib/solves"
import type { SpeedcubeSettings } from "@/lib/settings"
import type { ViewerFaceMap } from "@/types/cube"
import type {
  LastSolveInfo,
  ReplaySession,
  ShareReplayStatus,
} from "@/pages/play/types"

const ANONYMOUS_USER: AuthUser = {
  id: null,
  email: null,
  userName: "Guest",
  userSlug: "guest",
  isAnonymous: true,
  usernameCompleted: false,
  emailConfirmed: false,
}

type CompleteSolvePersistenceArgs = {
  cubeId: CubeId
  size: CubeSize
  mode: ModeId
  scramble: string
  finalSolveTime: number
  settings: SpeedcubeSettings
  session: ReplaySession | null
  finalViewerMap: ViewerFaceMap
  shouldContinue: () => boolean
  onReplayPayloadChange: (replay: ReplayRecord | null) => void
  onReplaySavedChange: (isSaved: boolean) => void
  onShareReplayStatusChange: (status: ShareReplayStatus) => void
}

type CompleteSolvePersistenceResult = {
  lastSolve: LastSolveInfo
}

const normalizeReplayEvents = (
  events: ReplayTimelineEvent[]
): ReplayTimelineEvent[] => expandReplayEvents(compactReplayEvents(events))

export const persistReplayForSolve = async (replay: ReplayRecord) => {
  await dbProvider.replays.create(replay)
  try {
    await dbProvider.solves.updateReplayId(replay.solveId, replay.id)
  } catch (error) {
    await dbProvider.replays.delete(replay.id).catch(() => undefined)
    throw error
  }
}

export async function completeSolvePersistence({
  cubeId,
  size,
  mode,
  scramble,
  finalSolveTime,
  settings,
  session,
  finalViewerMap,
  shouldContinue,
  onReplayPayloadChange,
  onReplaySavedChange,
  onShareReplayStatusChange,
}: CompleteSolvePersistenceArgs): Promise<CompleteSolvePersistenceResult | null> {
  let user = ANONYMOUS_USER

  try {
    user = await authProvider.getCurrentUser()
  } catch (error) {
    console.error("Failed to load auth user for solve persistence", error)
    toast.error("Could not save this solve", {
      description: "The result is shown, but it was not saved.",
    })
  }
  if (!shouldContinue()) return null

  const isSignedIn = !user.isAnonymous
  const leaderboardEligible = isSignedIn && mode !== "custom"
  const shouldPersist = isSignedIn
  const replayEvents = session ? normalizeReplayEvents(session.events) : []
  const solveMoves = replayMovesFromEvents(replayEvents)
  const createdAt = new Date().toISOString()
  const analytics = createSolveAnalyticsSnapshot(
    buildSolveAnalytics(solveMoves, finalSolveTime),
    {
      cube: cubeId,
      size,
      mode,
      createdAt,
    }
  )
  const solveId = createReplayId()

  const replayPayload =
    session && shouldPersist
      ? {
          id: session.id,
          solveId,
          createdAt,
          userName: user.userName,
          cube: cubeId,
          size,
          mode,
          leaderboardEligible,
          time: finalSolveTime,
          scramble: session.scramble,
          scrambleMoves: session.scrambleMoves,
          settings,
          initialCamera: session.initialCamera,
          initialViewerMap: session.initialViewerMap,
          finalViewerMap,
          events: replayEvents,
          moves: solveMoves,
        }
      : null

  onReplayPayloadChange(replayPayload)
  onReplaySavedChange(false)

  let solvePersisted = false

  if (shouldPersist && user.id) {
    try {
      await dbProvider.solves.create({
        id: solveId,
        userId: user.id,
        timeMs: finalSolveTime,
        scramble,
        replayId: null,
        leaderboardEligible,
        analytics,
      })
      solvePersisted = true
    } catch (error) {
      console.error("Failed to save solve", error)
      toast.error("Solve save failed", {
        description:
          "Your result is still shown locally. Try again on the next solve.",
      })
    }
  }
  if (!shouldContinue()) return null

  let previousSolves: SolveRecord[] = []
  if (solvePersisted) {
    try {
      previousSolves = (
        await dbProvider.solves.list({
          cube: cubeId,
          mode,
          userSlug: user.userSlug,
        })
      ).filter((solve) => solve.id !== solveId)
    } catch (error) {
      console.error("Failed to check personal best", error)
      toast.error("Could not check personal best", {
        description:
          "The solve was saved, but PB detection could not finish.",
      })
    }
  }
  if (!shouldContinue()) return null

  const currentBest =
    previousSolves.length > 0
      ? Math.min(...previousSolves.map((solve) => solve.timeMs))
      : Infinity
  const isNewPB = solvePersisted && finalSolveTime < currentBest

  let savedReplayId: string | null = null
  if (isNewPB && replayPayload) {
    onShareReplayStatusChange("saving")
    try {
      await persistReplayForSolve(replayPayload)
      savedReplayId = replayPayload.id
      onReplaySavedChange(true)
      onShareReplayStatusChange("saved")
      toast.success("Personal best replay saved")
    } catch (error) {
      console.error("Failed to auto-save PB replay", error)
      onShareReplayStatusChange("failed")
      toast.error("PB replay save failed", {
        description: "The solve was saved, but the replay was not.",
      })
    }
  }
  if (!shouldContinue()) return null

  return {
    lastSolve: {
      solveId,
      time: finalSolveTime,
      scramble,
      isNewPB,
      leaderboardEligible,
      isSaved: solvePersisted,
      isSignedIn,
      replayId: savedReplayId,
      analytics,
    },
  }
}
