import type { ReplayMoveEvent } from '@/lib/replays'
import type { CubeMove } from '@/types/cube'

export type TpsPoint = {
  time: number
  tps: number
  moveCount?: number
  revertedMoves?: number
  pauseMs?: number
}

export type SolveAnalytics = {
  moveCount: number
  turnCount: number
  tpsAverage: number
  tpsPeak: number
  tpsTimeline: TpsPoint[]
  revertedMoves: number
  firstMoveMs: number | null
  pauseCount: number
  longestPauseMs: number
}

const sameLayers = (a?: number[], b?: number[]) => {
  const aLayers = a?.length ? [...a].sort((left, right) => left - right) : [0]
  const bLayers = b?.length ? [...b].sort((left, right) => left - right) : [0]

  return aLayers.length === bLayers.length && aLayers.every((layer, index) => layer === bLayers[index])
}

const isInverseMove = (a: CubeMove, b: CubeMove) =>
  !a.entire && !b.entire && a.face === b.face && a.direction === -b.direction && sameLayers(a.layers, b.layers)

const roundMetric = (value: number) => Number(value.toFixed(2))
const PAUSE_THRESHOLD_MS = 800

const buildTpsTimeline = (moves: ReplayMoveEvent[], timeMs: number): TpsPoint[] => {
  if (timeMs <= 0) return []

  const boundedMoves = moves.filter((move) => move.time >= 0 && move.time <= timeMs)
  const bucketMs = timeMs < 2500 ? 250 : 500
  const bucketCount = Math.max(1, Math.ceil(timeMs / bucketMs))
  const inverseMoveIds = new Set<string>()
  const pauseByBucket = new Map<number, number>()
  const firstMoveMs = boundedMoves[0]?.time ?? null

  if (firstMoveMs !== null && firstMoveMs >= PAUSE_THRESHOLD_MS) {
    pauseByBucket.set(0, Math.round(firstMoveMs))
  }

  for (let index = 1; index < boundedMoves.length; index += 1) {
    const previous = boundedMoves[index - 1]
    const current = boundedMoves[index]
    const gap = current.time - previous.time

    if (isInverseMove(previous.move, current.move)) {
      inverseMoveIds.add(current.id)
    }

    if (gap >= PAUSE_THRESHOLD_MS) {
      const bucketIndex = Math.min(bucketCount - 1, Math.max(0, Math.floor(current.time / bucketMs)))
      pauseByBucket.set(bucketIndex, Math.max(pauseByBucket.get(bucketIndex) ?? 0, Math.round(gap)))
    }
  }

  return Array.from({ length: bucketCount }, (_, index) => {
    const start = index * bucketMs
    const end = Math.min(timeMs, start + bucketMs)
    const duration = Math.max(1, end - start)
    const bucketMoves = boundedMoves.filter((move) => move.time >= start && (index === bucketCount - 1 ? move.time <= end : move.time < end))
    const count = bucketMoves.length

    return {
      time: start,
      tps: roundMetric((count / duration) * 1000),
      moveCount: count,
      revertedMoves: bucketMoves.filter((move) => inverseMoveIds.has(move.id)).length,
      pauseMs: pauseByBucket.get(index) ?? 0,
    }
  })
}

const getPeakTps = (moves: ReplayMoveEvent[], timeMs: number) => {
  if (moves.length === 0 || timeMs <= 0) return 0

  const boundedMoves = moves.filter((move) => move.time >= 0 && move.time <= timeMs)
  if (boundedMoves.length === 0) return 0

  const windowMs = Math.min(1000, Math.max(250, timeMs))
  let peak = 0

  for (const move of boundedMoves) {
    const start = Math.max(0, move.time - windowMs)
    const end = Math.min(timeMs, start + windowMs)
    const duration = Math.max(1, end - start)
    const count = boundedMoves.filter((candidate) => candidate.time >= start && candidate.time <= end).length
    peak = Math.max(peak, (count / duration) * 1000)
  }

  return roundMetric(peak)
}

export const buildSolveAnalytics = (moves: ReplayMoveEvent[], timeMs: number): SolveAnalytics => {
  const solveMoves = moves
    .filter((event) => event.phase === 'solve' && !event.move.entire)
    .sort((a, b) => a.time - b.time)

  const moveCount = solveMoves.length
  const tpsAverage = timeMs > 0 ? roundMetric(moveCount / (timeMs / 1000)) : 0
  const firstMoveMs = solveMoves[0]?.time ?? null

  let revertedMoves = 0
  let pauseCount = 0
  let longestPauseMs = 0

  if (firstMoveMs !== null && firstMoveMs >= PAUSE_THRESHOLD_MS) {
    pauseCount += 1
    longestPauseMs = firstMoveMs
  }

  for (let index = 1; index < solveMoves.length; index += 1) {
    const previous = solveMoves[index - 1]
    const current = solveMoves[index]
    const gap = current.time - previous.time

    if (isInverseMove(previous.move, current.move)) {
      revertedMoves += 1
    }

    if (gap >= PAUSE_THRESHOLD_MS) {
      pauseCount += 1
      longestPauseMs = Math.max(longestPauseMs, gap)
    }
  }

  return {
    moveCount,
    turnCount: moveCount,
    tpsAverage,
    tpsPeak: getPeakTps(solveMoves, timeMs),
    tpsTimeline: buildTpsTimeline(solveMoves, timeMs),
    revertedMoves,
    firstMoveMs,
    pauseCount,
    longestPauseMs: Math.round(longestPauseMs),
  }
}
