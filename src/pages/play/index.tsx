import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  useLayoutEffect,
} from "react"
import { Keyboard, Monitor, MousePointerClick } from "lucide-react"
import { useSearchParams } from "react-router-dom"

import { CubeScene } from "@/components/cube/CubeScene"
import {
  useCubeAnimator,
  type AppliedCubeMove,
} from "@/hooks/useCubeAnimator"
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts"
import { useSpeedcubeSettings } from "@/hooks/useSpeedcubeSettings"
import {
  cubeIdToSize,
  normalizeCubeId,
  normalizeModeId,
  type CubeId,
  type ModeId,
} from "@/lib/events"
import { isSolved } from "@/lib/cube"
import {
  cameraPositionFromViewport,
  cameraUpFromViewport,
} from "@/lib/settings"
import { AUTH_CHANGED_EVENT } from "@/hooks/useAuthUser"
import {
  type ReplayCameraState,
  type ReplayPhase,
  type ReplayRecord,
} from "@/lib/replays"
import type { CubeMove } from "@/types/cube"
import { EventToolbar } from "@/pages/play/components/EventToolbar"
import { SolveResultModal } from "@/pages/play/components/SolveResultModal"
import { TimerOverlay } from "@/pages/play/components/TimerOverlay"
import { useEnterTimerShortcut } from "@/pages/play/hooks/useEnterTimerShortcut"
import { useReplayCapture } from "@/pages/play/hooks/useReplayCapture"
import { useReplaySharing } from "@/pages/play/hooks/useReplaySharing"
import { useScrambleControl } from "@/pages/play/hooks/useScrambleControl"
import type {
  LastSolveInfo,
  ShareReplayStatus,
  TimerState,
} from "@/pages/play/types"
import { readCurrentReplayDraft } from "@/pages/play/replayDraftStorage"
import { completeSolvePersistence } from "@/pages/play/solvePersistence"
import { REPLAY_CAMERA_TARGET, reverseMoves } from "@/pages/play/utils"

const DEBUG_SOLVE_ENABLED = import.meta.env.DEV
const DEBUG_SOLVE_FIRST_MOVE_DELAY_MS = 240
const DEBUG_SOLVE_MOVE_INTERVAL_MS = 180

type PendingReplayMove = {
  move: CubeMove
  phase: ReplayPhase | null
  pressedAt: number
}

const isTypingTarget = (target: EventTarget | null) => {
  const element = target as HTMLElement | null
  return (
    element?.tagName === "INPUT" ||
    element?.tagName === "TEXTAREA" ||
    element?.isContentEditable
  )
}

function MobilePlayNotice() {
  return (
    <div className="flex h-full min-h-0 w-full items-center justify-center bg-background px-5 py-8 lg:hidden">
      <div className="w-full max-w-sm rounded-md border border-border bg-card/55 p-5 text-center shadow-xl backdrop-blur-md">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-md border border-border bg-background/70 text-primary">
          <Monitor className="h-5 w-5" />
        </div>
        <h1 className="mt-4 text-lg font-black tracking-wide uppercase">
          Desktop keyboard required
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          CubeMonke Play is built around multi-key cube turns. Use a desktop or
          laptop browser for the proper solving experience.
        </p>
        <div className="mt-5 flex items-center justify-center gap-2 rounded-md border border-border/70 bg-background/50 px-3 py-2 text-[11px] font-bold tracking-widest text-muted-foreground uppercase">
          <Keyboard className="h-3.5 w-3.5 text-primary" />
          Keys 1-4, arrows, and space
        </div>
      </div>
    </div>
  )
}

export function PlayPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const cubeId = normalizeCubeId(searchParams.get("cube"))
  const mode = normalizeModeId(searchParams.get("mode"))
  const size = cubeIdToSize(cubeId)
  const isCustomMode = mode === "custom"

  const [timerState, setTimerState] = useState<TimerState>("idle")
  const [inspectionSeconds, setInspectionSeconds] = useState(15)
  const [elapsed, setElapsed] = useState(0)
  const [lastSolve, setLastSolve] = useState<LastSolveInfo | null>(null)
  const [lastReplayPayload, setLastReplayPayload] =
    useState<ReplayRecord | null>(null)
  const [isReplaySaved, setIsReplaySaved] = useState(false)
  const [shareReplayStatus, setShareReplayStatus] =
    useState<ShareReplayStatus>("idle")
  const [hasCubeSceneFocus, setHasCubeSceneFocus] = useState(false)
  const [cameraResetVersion, setCameraResetVersion] = useState(0)
  const cubeSceneFocusRef = useRef<HTMLDivElement | null>(null)
  const pendingReplayMovesRef = useRef<PendingReplayMove[]>([])
  const debugSolveTimeoutsRef = useRef<number[]>([])
  const appliedMoveHandlerRef = useRef<(event: AppliedCubeMove) => void>(
    () => undefined
  )
  const { settings } = useSpeedcubeSettings()

  const cameraPosition = useMemo<[number, number, number]>(
    () => cameraPositionFromViewport(settings.cameraViewport),
    [settings.cameraViewport]
  )
  const cameraUp = useMemo<[number, number, number]>(
    () => cameraUpFromViewport(settings.cameraViewport),
    [settings.cameraViewport]
  )
  const cameraSnapshot = useMemo<ReplayCameraState>(
    () => ({
      position: cameraPosition,
      target: REPLAY_CAMERA_TARGET,
      up: cameraUp,
    }),
    [cameraPosition, cameraUp]
  )

  // 3D Cube Animator hook
  const notifyAppliedMove = useCallback((event: AppliedCubeMove) => {
    appliedMoveHandlerRef.current(event)
  }, [])
  const { cube, activeTurn, turnNow, reset, scrambleCube } = useCubeAnimator(
    size,
    settings.turnSpeed,
    notifyAppliedMove
  )
  const {
    scramble,
    customScrambleText,
    customScrambleError,
    prepareScrambledInspection,
    applyCustomScramble,
    appendCustomMove,
    clearCustomScramble,
    updateCustomScrambleText,
    resetScramble,
  } = useScrambleControl({
    size,
    isCustomMode,
    timerState,
    scrambleCube,
    resetCube: reset,
  })
  const canChangeEvent = timerState === "idle"

  const updateEventFilters = useCallback(
    (next: Partial<{ cube: CubeId; mode: ModeId }>) => {
      if (!canChangeEvent) return

      const nextCube = next.cube ?? cubeId
      const nextMode = next.mode ?? mode
      setSearchParams({ cube: nextCube, mode: nextMode }, { replace: true })
    },
    [canChangeEvent, cubeId, mode, setSearchParams]
  )

  const focusCubeScene = useCallback((target: EventTarget | null = null) => {
    if (!isTypingTarget(target)) {
      cubeSceneFocusRef.current?.focus({ preventScroll: true })
    }
    setHasCubeSceneFocus(true)
  }, [])

  const timerIntervalRef = useRef<number | null>(null)
  const inspectionIntervalRef = useRef<number | null>(null)
  const startTimeRef = useRef<number | null>(null)
  const resetVersionRef = useRef(0)
  const completionInFlightRef = useRef(false)

  const clearTimerRefs = useCallback(() => {
    if (timerIntervalRef.current) window.clearInterval(timerIntervalRef.current)
    if (inspectionIntervalRef.current)
      window.clearInterval(inspectionIntervalRef.current)
    timerIntervalRef.current = null
    inspectionIntervalRef.current = null
    startTimeRef.current = null
  }, [])

  const clearDebugSolveTimers = useCallback(() => {
    for (const timeoutId of debugSolveTimeoutsRef.current) {
      window.clearTimeout(timeoutId)
    }
    debugSolveTimeoutsRef.current = []
  }, [])

  const getSolveElapsed = useCallback(
    (timestamp = performance.now()) =>
      startTimeRef.current !== null
        ? timestamp - startTimeRef.current
        : null,
    []
  )
  const {
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
  } = useReplayCapture({
    cameraSnapshot,
    timerState,
    getSolveElapsed,
  })

  // Timer controls
  const startSolve = useCallback((startedAt = performance.now()) => {
    if (inspectionIntervalRef.current)
      window.clearInterval(inspectionIntervalRef.current)
    inspectionIntervalRef.current = null
    completionInFlightRef.current = false
    setTimerState("running")
    setElapsed(0)
    setLastSolve(null)
    setShareReplayStatus("idle")
    startTimeRef.current = startedAt
    addReplayEvent({
      type: "timer",
      phase: "inspection",
      time: getReplayTime("inspection", startedAt),
      label: "solve-start",
    })
    addReplayEvent({
      type: "timer",
      phase: "solve",
      time: 0,
      label: "solve-start",
    })

    if (timerIntervalRef.current) window.clearInterval(timerIntervalRef.current)
    timerIntervalRef.current = window.setInterval(() => {
      if (startTimeRef.current !== null) {
        setElapsed(performance.now() - startTimeRef.current)
      }
    }, 10)

    return startedAt
  }, [addReplayEvent, getReplayTime])

  const startInspection = useCallback(() => {
    if (timerState !== "idle") return
    focusCubeScene()

    const prepared = isCustomMode
      ? applyCustomScramble()
      : prepareScrambledInspection()
    if (!prepared) return

    beginReplayCapture(prepared)

    setTimerState("inspection")
    setInspectionSeconds(15)
    setLastSolve(null)
    setShareReplayStatus("idle")

    if (inspectionIntervalRef.current)
      window.clearInterval(inspectionIntervalRef.current)
    inspectionIntervalRef.current = window.setInterval(() => {
      setInspectionSeconds((prev) => {
        if (prev <= 1) {
          window.clearInterval(inspectionIntervalRef.current!)
          startSolve()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [
    applyCustomScramble,
    beginReplayCapture,
    isCustomMode,
    focusCubeScene,
    prepareScrambledInspection,
    startSolve,
    timerState,
  ])

  const stopSolve = useCallback(async (completedAt = performance.now()) => {
    if (completionInFlightRef.current) return
    completionInFlightRef.current = true
    const stopVersion = resetVersionRef.current
    setTimerState("stopped")

    const measuredSolveTime =
      startTimeRef.current !== null
        ? completedAt - startTimeRef.current
        : elapsed
    const finalSolveTime = Math.max(0, measuredSolveTime)
    if (timerIntervalRef.current) window.clearInterval(timerIntervalRef.current)
    timerIntervalRef.current = null
    startTimeRef.current = null
    setElapsed(finalSolveTime)
    addReplayEvent({
      type: "timer",
      phase: "solve",
      time: finalSolveTime,
      label: "solve-stop",
    })
    flushReplayDraft()

    const session = getReplaySession() ?? readCurrentReplayDraft()
    const finalViewerMap = getLatestViewerMap()
    clearReplayCapture()

    const result = await completeSolvePersistence({
      cubeId,
      size,
      mode,
      scramble,
      finalSolveTime,
      settings,
      session,
      finalViewerMap,
      shouldContinue: () => resetVersionRef.current === stopVersion,
      onReplayPayloadChange: setLastReplayPayload,
      onReplaySavedChange: setIsReplaySaved,
      onShareReplayStatusChange: setShareReplayStatus,
    })
    if (!result) return

    setLastSolve(result.lastSolve)
  }, [
    addReplayEvent,
    clearReplayCapture,
    cubeId,
    elapsed,
    flushReplayDraft,
    getLatestViewerMap,
    getReplaySession,
    mode,
    scramble,
    settings,
    size,
  ])

  const resetTimer = useCallback(() => {
    resetVersionRef.current += 1
    completionInFlightRef.current = false
    pendingReplayMovesRef.current = []
    clearDebugSolveTimers()
    clearTimerRefs()
    setTimerState("idle")
    setElapsed(0)
    setInspectionSeconds(15)
    resetScramble()
    setLastSolve(null)
    setLastReplayPayload(null)
    setIsReplaySaved(false)
    setShareReplayStatus("idle")
    clearReplayCapture()
    setCameraResetVersion((version) => version + 1)
    reset()
  }, [
    clearDebugSolveTimers,
    clearReplayCapture,
    clearTimerRefs,
    reset,
    resetScramble,
  ])

  const { saveReplay, discardLastSolve } = useReplaySharing({
    lastSolve,
    lastReplayPayload,
    isReplaySaved,
    setLastSolve,
    setIsReplaySaved,
    setShareReplayStatus,
    resetTimer,
  })

  const queueVisualMove = useCallback(
    (
      move: CubeMove,
      phase: ReplayPhase | null,
      pressedAt = performance.now()
    ) => {
      pendingReplayMovesRef.current.push({ move, phase, pressedAt })
      turnNow(move)
    },
    [turnNow]
  )

  useLayoutEffect(() => {
    appliedMoveHandlerRef.current = ({
      cube: appliedCube,
      appliedAt,
      isIdleAfter,
    }) => {
      const pending = pendingReplayMovesRef.current.shift()
      if (!pending) return

      if (pending.phase) {
        const appliedTime = Math.max(
          0,
          getReplayTime(pending.phase, appliedAt)
        )
        const inputTime = Math.max(
          0,
          getReplayTime(pending.phase, pending.pressedAt)
        )

        recordReplayMove(pending.move, pending.phase, appliedTime, inputTime)
      }

      if (
        pending.phase === "solve" &&
        isIdleAfter &&
        isSolved(appliedCube)
      ) {
        void stopSolve(appliedAt)
      }
    }
  }, [getReplayTime, recordReplayMove, stopSolve])

  const handleCubeMove = useCallback(
    (move: CubeMove) => {
      const pressedAt = performance.now()

      if (timerState === "inspection" && move.entire) {
        queueVisualMove(move, "inspection", pressedAt)
        return
      }

      if (timerState === "inspection" && !move.entire) {
        startSolve(pressedAt)
        queueVisualMove(move, "solve", pressedAt)
        return
      }

      const phase =
        timerState === "inspection"
          ? "inspection"
          : timerState === "running"
            ? "solve"
            : null
      queueVisualMove(move, phase, pressedAt)
    },
    [queueVisualMove, startSolve, timerState]
  )

  const debugSolveCurrentScramble = useCallback(() => {
    if (!DEBUG_SOLVE_ENABLED) return
    if (timerState !== "inspection" && timerState !== "running") return
    clearDebugSolveTimers()

    const session = getReplaySession()
    if (!session || session.scrambleMoves.length === 0) return

    const pressedAt = performance.now()
    if (timerState === "inspection") {
      startSolve(pressedAt)
    }

    const solutionMoves = reverseMoves(session.scrambleMoves)

    solutionMoves.forEach((move, index) => {
      const timeoutId = window.setTimeout(
        () => queueVisualMove(move, "solve"),
        DEBUG_SOLVE_FIRST_MOVE_DELAY_MS + index * DEBUG_SOLVE_MOVE_INTERVAL_MS
      )
      debugSolveTimeoutsRef.current.push(timeoutId)
    })
  }, [
    clearDebugSolveTimers,
    getReplaySession,
    queueVisualMove,
    startSolve,
    timerState,
  ])
  const keyboardControlsEnabled =
    hasCubeSceneFocus &&
    (timerState === "idle" ||
      timerState === "running" ||
      timerState === "inspection")

  // Bind keyboard actions to slice turns
  useKeyboardShortcuts(
    size,
    viewerMap,
    handleCubeMove,
    keyboardControlsEnabled,
    settings.keyboard
  )

  // Reset to a solved waiting state when the event changes.
  useEffect(() => {
    const timeoutId = window.setTimeout(resetTimer, 0)

    return () => window.clearTimeout(timeoutId)
  }, [cubeId, mode, resetTimer])

  useEffect(() => {
    window.addEventListener(AUTH_CHANGED_EVENT, resetTimer)
    return () => window.removeEventListener(AUTH_CHANGED_EVENT, resetTimer)
  }, [resetTimer])

  useEffect(() => clearTimerRefs, [clearTimerRefs])

  useEnterTimerShortcut({
    timerState,
    onStartInspection: startInspection,
    onResetTimer: () => {
      focusCubeScene()
      resetTimer()
    },
  })

  return (
    <>
      <MobilePlayNotice />

      <div
        className="hidden h-full min-h-0 w-full bg-background py-3 lg:block lg:py-6"
        onPointerDownCapture={(event) => focusCubeScene(event.target)}
      >
        <section className="relative flex h-full min-h-0 w-full flex-col justify-between overflow-hidden rounded-md bg-background">
          <div
            ref={cubeSceneFocusRef}
            tabIndex={-1}
            aria-label="Cube controls"
            className="absolute inset-0 z-0 outline-none"
            onPointerDown={(event) => focusCubeScene(event.target)}
          >
            <CubeScene
              cube={cube}
              size={size}
              activeTurn={activeTurn}
              viewerMap={viewerMap}
              onViewerMapChange={handleViewerMapChange}
              colors={settings.cubeColors}
              cameraPosition={cameraPosition}
              cameraUp={cameraUp}
              cameraResetKey={cameraResetVersion}
              onCameraChange={handleCameraChange}
            />
            {!hasCubeSceneFocus ? (
              <button
                type="button"
                onClick={(event) => focusCubeScene(event.target)}
                className="absolute inset-0 z-[5] flex items-center justify-center bg-background/35 text-foreground backdrop-blur-[2px] transition hover:bg-background/25"
              >
                <span className="flex items-center gap-2 rounded-md border border-border bg-card/85 px-4 py-3 text-sm font-semibold shadow-xl backdrop-blur-md">
                  <MousePointerClick className="h-4 w-4 text-primary" />
                  Click the cube to focus controls
                </span>
              </button>
            ) : null}
          </div>

          <EventToolbar
            cubeId={cubeId}
            mode={mode}
            timerState={timerState}
            scramble={scramble}
            customScrambleText={customScrambleText}
            customScrambleError={customScrambleError}
            canChangeEvent={canChangeEvent}
            onCubeChange={(cube) => updateEventFilters({ cube })}
            onModeChange={(nextMode) => updateEventFilters({ mode: nextMode })}
            onCustomScrambleChange={updateCustomScrambleText}
            onAppendCustomMove={appendCustomMove}
            onClearCustomScramble={clearCustomScramble}
          />

          <TimerOverlay
            timerState={timerState}
            elapsed={elapsed}
            inspectionSeconds={inspectionSeconds}
            debugSolveEnabled={DEBUG_SOLVE_ENABLED}
            onStartInspection={startInspection}
            onResetTimer={resetTimer}
            onDebugSolve={debugSolveCurrentScramble}
          />

          {timerState === "stopped" && lastSolve ? (
            <SolveResultModal
              lastSolve={lastSolve}
              isReplaySaved={isReplaySaved}
              shareReplayStatus={shareReplayStatus}
              replayAvailable={Boolean(
                lastReplayPayload || lastSolve.replayId
              )}
              onSaveReplay={() => void saveReplay()}
              onDiscardLastSolve={discardLastSolve}
              onResetTimer={resetTimer}
            />
          ) : null}
        </section>
      </div>
    </>
  )
}
export default PlayPage
