import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react'

import { applyMove, createSolvedCube, moveToLabel } from '@/lib/cube'
import { TURN_SPEED_INSTANT } from '@/lib/settings'
import type { ActiveTurn, CubeMove, CubeState } from '@/types/cube'

type AnimatorState = {
  cube: CubeState
  queue: CubeMove[]
  activeMove: CubeMove | null
  progress: number
  appliedBatchId: number
  appliedEvents: AppliedCubeMove[]
}

type AnimatorAction =
  | { type: 'queue'; moves: CubeMove[]; instant: boolean; at: number }
  | { type: 'progress'; progress: number }
  | { type: 'finish'; at: number }
  | { type: 'reset' }
  | { type: 'scramble'; moves: CubeMove[] }

export type AppliedCubeMove = {
  move: CubeMove
  cube: CubeState
  appliedAt: number
  isIdleAfter: boolean
}

type CubeAnimator = {
  cube: CubeState
  queue: CubeMove[]
  activeTurn: ActiveTurn | null
  queueMoves: (moves: CubeMove[]) => void
  scrambleCube: (moves: CubeMove[]) => void
  turnNow: (move: CubeMove) => void
  reset: () => void
  isBusy: boolean
  currentLabel: string
}

const initialState = (size: number): AnimatorState => ({
  cube: createSolvedCube(size),
  queue: [],
  activeMove: null,
  progress: 0,
  appliedBatchId: 0,
  appliedEvents: [],
})

const startNextMove = (state: AnimatorState, queue: CubeMove[]): AnimatorState => {
  if (state.activeMove || queue.length === 0) {
    return { ...state, queue }
  }

  const [activeMove, ...rest] = queue
  return { ...state, queue: rest, activeMove, progress: 0 }
}

const createAnimatorReducer = (size: number) => {
  return (state: AnimatorState, action: AnimatorAction): AnimatorState => {
    switch (action.type) {
      case 'queue': {
        if (action.instant && !state.activeMove) {
          let cube = state.cube
          const moves = [...state.queue, ...action.moves]
          const appliedEvents: AppliedCubeMove[] = []

          moves.forEach((move, index) => {
            cube = applyMove(cube, size, move)
            appliedEvents.push({
              move,
              cube,
              appliedAt: action.at,
              isIdleAfter: index === moves.length - 1,
            })
          })

          return {
            cube,
            queue: [],
            activeMove: null,
            progress: 0,
            appliedBatchId:
              appliedEvents.length > 0
                ? state.appliedBatchId + 1
                : state.appliedBatchId,
            appliedEvents,
          }
        }

        return startNextMove(state, [...state.queue, ...action.moves])
      }
      case 'progress':
        return { ...state, progress: action.progress }
      case 'finish': {
        if (!state.activeMove) return state
        const appliedMove = state.activeMove
        const cube = applyMove(state.cube, size, state.activeMove)
        const nextState = startNextMove(
          { ...state, cube, activeMove: null, progress: 0 },
          state.queue,
        )

        return {
          ...nextState,
          appliedBatchId: state.appliedBatchId + 1,
          appliedEvents: [
            {
              move: appliedMove,
              cube,
              appliedAt: action.at,
              isIdleAfter:
                nextState.activeMove === null && nextState.queue.length === 0,
            },
          ],
        }
      }
      case 'scramble': {
        let cube = createSolvedCube(size)
        for (const move of action.moves) {
          cube = applyMove(cube, size, move)
        }
        return {
          cube,
          queue: [],
          activeMove: null,
          progress: 0,
          appliedBatchId: state.appliedBatchId,
          appliedEvents: [],
        }
      }
      case 'reset':
        return initialState(size)
      default:
        return state
    }
  }
}

export function useCubeAnimator(
  size: number,
  turnsPerSecond: number,
  onMoveApplied?: (event: AppliedCubeMove) => void,
): CubeAnimator {
  const reducer = useMemo(() => createAnimatorReducer(size), [size])
  const [state, dispatch] = useReducer(reducer, undefined, () => initialState(size))
  const startedAtRef = useRef<number | null>(null)
  const notifiedBatchIdRef = useRef(0)

  const queueMoves = useCallback((moves: CubeMove[]) => {
    dispatch({
      type: 'queue',
      moves,
      instant: turnsPerSecond >= TURN_SPEED_INSTANT,
      at: performance.now(),
    })
  }, [turnsPerSecond])

  const scrambleCube = useCallback((moves: CubeMove[]) => {
    dispatch({ type: 'scramble', moves })
  }, [])

  const turnNow = useCallback(
    (move: CubeMove) => {
      queueMoves([move])
    },
    [queueMoves],
  )

  const reset = useCallback(() => {
    startedAtRef.current = null
    dispatch({ type: 'reset' })
  }, [])

  // Monitor activeMove changes and animate progress
  useEffect(() => {
    if (!state.activeMove) return

    if (turnsPerSecond >= TURN_SPEED_INSTANT) {
      dispatch({ type: 'finish', at: performance.now() })
      return
    }

    let frame = 0
    const duration = 1000 / turnsPerSecond

    const tick = (timestamp: number) => {
      if (startedAtRef.current === null) {
        startedAtRef.current = timestamp
      }

      const elapsed = timestamp - startedAtRef.current
      const rawProgress = Math.min(1, elapsed / duration)
      // Ease out cubic
      dispatch({ type: 'progress', progress: 1 - Math.pow(1 - rawProgress, 3) })

      if (rawProgress < 1) {
        frame = window.requestAnimationFrame(tick)
        return
      }

      startedAtRef.current = null
      dispatch({ type: 'finish', at: timestamp })
    }

    frame = window.requestAnimationFrame(tick)

    return () => window.cancelAnimationFrame(frame)
  }, [state.activeMove, turnsPerSecond])

  useEffect(() => {
    if (!onMoveApplied) return
    if (state.appliedBatchId === notifiedBatchIdRef.current) return

    notifiedBatchIdRef.current = state.appliedBatchId
    for (const event of state.appliedEvents) {
      onMoveApplied(event)
    }
  }, [onMoveApplied, state.appliedBatchId, state.appliedEvents])

  const activeTurn = useMemo<ActiveTurn | null>(() => {
    if (!state.activeMove) return null
    return { move: state.activeMove, progress: state.progress }
  }, [state.activeMove, state.progress])

  return {
    cube: state.cube,
    queue: state.queue,
    activeTurn,
    queueMoves,
    scrambleCube,
    turnNow,
    reset,
    isBusy: Boolean(state.activeMove) || state.queue.length > 0,
    currentLabel: state.activeMove ? moveToLabel(state.activeMove, size) : 'idle',
  }
}
