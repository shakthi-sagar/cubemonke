import { useCallback, useEffect, useRef, useState } from "react"

import {
  createReplayId,
  type ReplayCameraState,
  type ReplayMoveEvent,
  type ReplayPhase,
  type ReplayTimelineEventInput,
} from "@/lib/replays"
import type { CubeMove, ViewerFaceMap } from "@/types/cube"
import type { PreparedScramble, ReplaySession, TimerState } from "@/pages/play/types"
import {
  clearCurrentReplayDraft,
  writeCurrentReplayDraft,
} from "@/pages/play/replayDraftStorage"
import { initialViewerFaceMap } from "@/pages/play/utils"

type UseReplayCaptureArgs = {
  cameraSnapshot: ReplayCameraState
  timerState: TimerState
  getSolveElapsed: (timestamp?: number) => number | null
}

const activeReplayPhase = (timerState: TimerState): ReplayPhase | null => {
  if (timerState === "running") return "solve"
  if (timerState === "inspection") return "inspection"
  return null
}

export function useReplayCapture({
  cameraSnapshot,
  timerState,
  getSolveElapsed,
}: UseReplayCaptureArgs) {
  const [viewerMap, setViewerMap] = useState<ViewerFaceMap>(() =>
    initialViewerFaceMap()
  )
  const latestCameraRef = useRef<ReplayCameraState>(cameraSnapshot)
  const latestViewerMapRef = useRef<ViewerFaceMap>(viewerMap)
  const replaySessionRef = useRef<ReplaySession | null>(null)
  const replayDraftWriteRef = useRef<number | null>(null)

  useEffect(() => {
    latestCameraRef.current = cameraSnapshot
  }, [cameraSnapshot])

  const getReplayTime = useCallback(
    (phase: ReplayPhase, timestamp = performance.now()) => {
      const solveElapsed = getSolveElapsed(timestamp)
      if (phase === "solve" && solveElapsed !== null) return solveElapsed

      const session = replaySessionRef.current
      return session ? timestamp - session.inspectionStartedAt : 0
    },
    [getSolveElapsed]
  )

  const flushReplayDraft = useCallback(() => {
    const session = replaySessionRef.current
    if (session) writeCurrentReplayDraft(session)
  }, [])

  const scheduleReplayDraftWrite = useCallback(() => {
    if (replayDraftWriteRef.current !== null) return

    replayDraftWriteRef.current = window.setTimeout(() => {
      replayDraftWriteRef.current = null
      flushReplayDraft()
    }, 100)
  }, [flushReplayDraft])

  const addReplayEvent = useCallback(
    (event: ReplayTimelineEventInput) => {
      const session = replaySessionRef.current
      if (!session) return

      session.events.push({
        ...event,
        id: createReplayId(),
      })
      scheduleReplayDraftWrite()
    },
    [scheduleReplayDraftWrite]
  )

  const beginReplayCapture = useCallback(
    (prepared: PreparedScramble) => {
      const now = performance.now()
      const id = createReplayId()

      replaySessionRef.current = {
        id,
        inspectionStartedAt: now,
        scramble: prepared.text,
        scrambleMoves: prepared.moves,
        initialCamera: latestCameraRef.current,
        initialViewerMap: latestViewerMapRef.current,
        events: [
          {
            id: createReplayId(),
            type: "timer",
            phase: "inspection",
            time: 0,
            label: "inspection-start",
          },
        ],
        moves: [],
      }
      flushReplayDraft()
    },
    [flushReplayDraft]
  )

  const recordReplayMove = useCallback(
    (
      move: CubeMove,
      phase: ReplayPhase,
      time = getReplayTime(phase),
      inputTime?: number
    ) => {
      const session = replaySessionRef.current
      if (!session) return

      const event: ReplayMoveEvent = {
        id: createReplayId(),
        phase,
        time,
        ...(typeof inputTime === "number" ? { inputTime } : {}),
        move,
      }

      session.moves.push(event)
      session.events.push({
        ...event,
        type: "move",
      })
      scheduleReplayDraftWrite()
    },
    [getReplayTime, scheduleReplayDraftWrite]
  )

  const handleCameraChange = useCallback(
    (camera: ReplayCameraState) => {
      latestCameraRef.current = camera
      const phase = activeReplayPhase(timerState)
      if (!phase || !replaySessionRef.current) return

      addReplayEvent({
        type: "camera",
        phase,
        time: getReplayTime(phase),
        camera,
      })
    },
    [addReplayEvent, getReplayTime, timerState]
  )

  const handleViewerMapChange = useCallback(
    (nextViewerMap: ViewerFaceMap) => {
      latestViewerMapRef.current = nextViewerMap
      setViewerMap(nextViewerMap)

      const phase = activeReplayPhase(timerState)
      if (!phase || !replaySessionRef.current) return

      addReplayEvent({
        type: "viewer-map",
        phase,
        time: getReplayTime(phase),
        viewerMap: nextViewerMap,
      })
    },
    [addReplayEvent, getReplayTime, timerState]
  )

  const getReplaySession = useCallback(() => replaySessionRef.current, [])
  const getLatestViewerMap = useCallback(() => latestViewerMapRef.current, [])

  const clearReplayCapture = useCallback(() => {
    if (replayDraftWriteRef.current !== null) {
      window.clearTimeout(replayDraftWriteRef.current)
      replayDraftWriteRef.current = null
    }
    replaySessionRef.current = null
    const initialMap = initialViewerFaceMap()
    latestViewerMapRef.current = initialMap
    setViewerMap(initialMap)
    clearCurrentReplayDraft()
  }, [])

  return {
    viewerMap,
    beginReplayCapture,
    recordReplayMove,
    addReplayEvent,
    flushReplayDraft,
    getReplayTime,
    getReplaySession,
    getLatestViewerMap,
    clearReplayCapture,
    handleCameraChange,
    handleViewerMapChange,
  }
}
