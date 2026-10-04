import { useCallback, type Dispatch, type SetStateAction } from "react"
import { toast } from "sonner"

import { dbProvider } from "@/lib/data"
import type { ReplayRecord } from "@/lib/replays"
import type {
  LastSolveInfo,
  ShareReplayStatus,
} from "@/pages/play/types"
import { persistReplayForSolve } from "@/pages/play/solvePersistence"

type UseReplaySharingArgs = {
  lastSolve: LastSolveInfo | null
  lastReplayPayload: ReplayRecord | null
  isReplaySaved: boolean
  setLastSolve: Dispatch<SetStateAction<LastSolveInfo | null>>
  setIsReplaySaved: Dispatch<SetStateAction<boolean>>
  setShareReplayStatus: Dispatch<SetStateAction<ShareReplayStatus>>
  resetTimer: () => void
}

export function useReplaySharing({
  lastSolve,
  lastReplayPayload,
  isReplaySaved,
  setLastSolve,
  setIsReplaySaved,
  setShareReplayStatus,
  resetTimer,
}: UseReplaySharingArgs) {
  const saveReplay = useCallback(async () => {
    if (isReplaySaved) return true
    if (!lastSolve?.isSaved) {
      toast.error("Solve is not saved", {
        description: "Save the solve before saving a replay.",
      })
      return false
    }
    if (!lastReplayPayload) {
      toast.error("Replay is unavailable", {
        description: "There is no replay data for this solve.",
      })
      return false
    }

    setShareReplayStatus("saving")

    try {
      await persistReplayForSolve(lastReplayPayload)
      setIsReplaySaved(true)
      setLastSolve((current) =>
        current ? { ...current, replayId: lastReplayPayload.id } : current
      )
      setShareReplayStatus("saved")
      toast.success("Replay saved")
      return true
    } catch (error) {
      console.error("Failed to save replay", error)
      setShareReplayStatus("failed")
      toast.error("Replay save failed", {
        description: "Please try again in a moment.",
      })
      return false
    }
  }, [
    isReplaySaved,
    lastSolve?.isSaved,
    lastReplayPayload,
    setIsReplaySaved,
    setLastSolve,
    setShareReplayStatus,
  ])


  const discardLastSolve = useCallback(async () => {
    if (!lastSolve) return

    try {
      if (isReplaySaved && lastSolve.replayId) {
        await dbProvider.replays.delete(lastSolve.replayId)
      }
      if (lastSolve.isSaved) await dbProvider.solves.delete(lastSolve.solveId)
    } catch (error) {
      console.error("Failed to discard solve", error)
      toast.error("Discard failed", {
        description: "Could not delete all saved data for this solve.",
      })
      return
    }

    resetTimer()
  }, [isReplaySaved, lastSolve, resetTimer])

  return {
    saveReplay,
    discardLastSolve,
  }
}
