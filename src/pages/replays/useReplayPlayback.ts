import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import type { ReplayCameraState, ReplayRecord, ReplayTimelineEvent } from '@/lib/replays'
import type { CubeMove, ViewerFaceMap } from '@/types/cube'

type PlaybackState = 'ready' | 'playing' | 'paused' | 'finished'

type CameraKeyframe = {
  time: number
  camera: ReplayCameraState
}

type UseReplayPlaybackArgs = {
  replay: ReplayRecord
  queueMoves: (moves: CubeMove[]) => void
  scrambleCube: (moves: CubeMove[]) => void
}

const getPlaybackDelay = (event: ReplayTimelineEvent, solveOffset: number) =>
  event.phase === 'inspection' ? event.time : solveOffset + event.time

const replayTimerStatusLabel = (label: Extract<ReplayTimelineEvent, { type: 'timer' }>['label']) => {
  if (label === 'inspection-start') return 'Inspecting'
  if (label === 'solve-start') return 'Solving'
  return 'Finished'
}

const lerp = (from: number, to: number, t: number) => from + (to - from) * t

const smoothstep = (t: number) => t * t * (3 - 2 * t)

const interpolateTuple = (
  from: [number, number, number],
  to: [number, number, number],
  t: number,
): [number, number, number] => [lerp(from[0], to[0], t), lerp(from[1], to[1], t), lerp(from[2], to[2], t)]

const interpolateCamera = (from: ReplayCameraState, to: ReplayCameraState, t: number): ReplayCameraState => ({
  position: interpolateTuple(from.position, to.position, t),
  target: interpolateTuple(from.target, to.target, t),
  ...(from.up || to.up ? { up: interpolateTuple(from.up ?? [0, 1, 0], to.up ?? [0, 1, 0], t) } : {}),
})

const cameraAtTime = (keyframes: CameraKeyframe[], time: number) => {
  if (keyframes.length === 0) return null
  if (time <= keyframes[0].time) return keyframes[0].camera

  for (let index = 1; index < keyframes.length; index += 1) {
    const previous = keyframes[index - 1]
    const next = keyframes[index]

    if (time <= next.time) {
      const span = Math.max(1, next.time - previous.time)
      const progress = smoothstep(Math.min(1, Math.max(0, (time - previous.time) / span)))
      return interpolateCamera(previous.camera, next.camera, progress)
    }
  }

  return keyframes[keyframes.length - 1].camera
}

export function useReplayPlayback({
  replay,
  queueMoves,
  scrambleCube,
}: UseReplayPlaybackArgs) {
  const [viewerMap, setViewerMap] = useState<ViewerFaceMap>(replay.initialViewerMap)
  const [camera, setCamera] = useState<ReplayCameraState>(replay.initialCamera)
  const [playbackState, setPlaybackState] = useState<PlaybackState>('ready')
  const [status, setStatus] = useState('Ready')
  const [currentMoveIndex, setCurrentMoveIndex] = useState<number | null>(null)

  const elapsedTimeRef = useRef<number>(0)
  const playbackStartedAtRef = useRef<number>(0)
  const timeoutsRef = useRef<number[]>([])
  const cameraFrameRef = useRef<number | null>(null)

  const solveOffset = useMemo(() => {
    const solveStartMarker = replay.events.find(
      (event) =>
        event.type === 'timer' &&
        event.phase === 'inspection' &&
        event.label === 'solve-start',
    )
    if (solveStartMarker) return solveStartMarker.time

    const inspectionMax = replay.events
      .filter((event) => event.phase === 'inspection')
      .reduce((max, event) => Math.max(max, event.time), 0)
    return inspectionMax + 700
  }, [replay])

  const clearPlaybackTimers = useCallback(() => {
    for (const timeoutId of timeoutsRef.current) {
      window.clearTimeout(timeoutId)
    }
    timeoutsRef.current = []

    if (cameraFrameRef.current !== null) {
      window.cancelAnimationFrame(cameraFrameRef.current)
      cameraFrameRef.current = null
    }
  }, [])

  const resetPlayback = useCallback(() => {
    clearPlaybackTimers()
    setPlaybackState('ready')
    setStatus('Ready')
    setViewerMap(replay.initialViewerMap)
    setCamera(replay.initialCamera)
    scrambleCube(replay.scrambleMoves)
    setCurrentMoveIndex(null)
    elapsedTimeRef.current = 0
    playbackStartedAtRef.current = 0
  }, [clearPlaybackTimers, replay, scrambleCube])

  useEffect(() => {
    scrambleCube(replay.scrambleMoves)
    return clearPlaybackTimers
  }, [clearPlaybackTimers, replay, scrambleCube])

  const pauseReplay = useCallback(() => {
    clearPlaybackTimers()
    setPlaybackState('paused')
    setStatus('Paused')
    if (playbackStartedAtRef.current > 0) {
      elapsedTimeRef.current = performance.now() - playbackStartedAtRef.current
    }
  }, [clearPlaybackTimers])

  const startReplay = useCallback(() => {
    let currentElapsed = elapsedTimeRef.current
    if (playbackState === 'finished') {
      resetPlayback()
      currentElapsed = 0
    }

    setPlaybackState('playing')
    setStatus('Inspecting')

    const sortedEvents = [...replay.events].sort((a, b) => getPlaybackDelay(a, solveOffset) - getPlaybackDelay(b, solveOffset))
    const cameraKeyframes: CameraKeyframe[] = [
      { time: 0, camera: replay.initialCamera },
      ...sortedEvents
        .filter((event): event is Extract<ReplayTimelineEvent, { type: 'camera' }> => event.type === 'camera')
        .map((event) => ({
          time: getPlaybackDelay(event, solveOffset),
          camera: event.camera,
        })),
    ]

    const snappedCamera = cameraAtTime(cameraKeyframes, currentElapsed)
    if (snappedCamera) {
      setCamera(snappedCamera)
    }

    playbackStartedAtRef.current = performance.now() - currentElapsed

    let maxDelay = 0
    for (const event of sortedEvents) {
      maxDelay = Math.max(maxDelay, getPlaybackDelay(event, solveOffset))
    }

    if (cameraKeyframes.length > 1) {
      const tickCamera = () => {
        const elapsed = performance.now() - playbackStartedAtRef.current
        elapsedTimeRef.current = elapsed

        const nextCamera = cameraAtTime(cameraKeyframes, elapsed)
        if (nextCamera) {
          setCamera(nextCamera)
        }

        if (elapsed <= maxDelay + 250) {
          cameraFrameRef.current = window.requestAnimationFrame(tickCamera)
          return
        }

        cameraFrameRef.current = null
      }

      cameraFrameRef.current = window.requestAnimationFrame(tickCamera)
    }

    const solveMoveEvents = sortedEvents.filter(
      (event): event is Extract<ReplayTimelineEvent, { type: 'move' }> =>
        event.type === 'move' && event.phase === 'solve' && !event.move.entire,
    )

    for (const event of sortedEvents) {
      const delay = getPlaybackDelay(event, solveOffset)
      if (delay <= currentElapsed) continue

      if (event.type === 'move') {
        const timeoutId = window.setTimeout(() => {
          queueMoves([event.move])
          if (event.phase === 'solve' && !event.move.entire) {
            setCurrentMoveIndex(solveMoveEvents.indexOf(event))
          }
        }, delay - currentElapsed)
        timeoutsRef.current.push(timeoutId)
      } else {
        const timeoutId = window.setTimeout(() => {
          if (event.type === 'viewer-map') setViewerMap(event.viewerMap)
          if (event.type === 'timer') setStatus(replayTimerStatusLabel(event.label))
        }, delay - currentElapsed)
        timeoutsRef.current.push(timeoutId)
      }
    }

    const doneTimeoutId = window.setTimeout(() => {
      setPlaybackState('finished')
      setStatus('Finished')
      clearPlaybackTimers()
    }, Math.max(0, maxDelay - currentElapsed + 1200))
    timeoutsRef.current.push(doneTimeoutId)
  }, [clearPlaybackTimers, playbackState, queueMoves, replay, resetPlayback, solveOffset])

  const handlePlayPause = useCallback(() => {
    if (playbackState === 'playing') {
      pauseReplay()
    } else {
      startReplay()
    }
  }, [pauseReplay, playbackState, startReplay])

  return {
    viewerMap,
    setViewerMap,
    camera,
    setCamera,
    playbackState,
    status,
    currentMoveIndex,
    resetPlayback,
    handlePlayPause,
  }
}
