import {
  cubeIdToSize,
  normalizeCubeId,
  normalizeModeId,
  type CubeId,
  type CubeSize,
  type ModeId,
} from "@/lib/events"
import type { SolveAnalytics } from "@/lib/solveAnalytics"
import { usernameToSlug } from "@/lib/username"

export const SOLVE_STORAGE_KEY = "speedcube_solves_v2"

export type SolveAnalyticsSnapshot = SolveAnalytics & {
  cube: CubeId
  size: CubeSize
  mode: ModeId
  createdAt: string
}

export type SolveRecord = {
  id: string
  userId: string | null
  userName: string
  userSlug: string
  timeMs: number
  scramble: string
  replayId: string | null
  leaderboardEligible: boolean
  analytics: SolveAnalyticsSnapshot
}

export type CreateSolveInput = {
  id: string
  userId: string
  timeMs: number
  scramble: string
  replayId: string | null
  leaderboardEligible: boolean
  analytics: SolveAnalyticsSnapshot
}

export const createSolveAnalyticsSnapshot = (
  analytics: SolveAnalytics,
  metadata: Pick<SolveAnalyticsSnapshot, "cube" | "size" | "mode" | "createdAt">
): SolveAnalyticsSnapshot => ({
  ...analytics,
  ...metadata,
})

export const normalizeSolveAnalyticsSnapshot = (
  analytics: SolveAnalytics & Partial<SolveAnalyticsSnapshot>
): SolveAnalyticsSnapshot => {
  const cube = normalizeCubeId(analytics.cube ?? null)
  const mode = normalizeModeId(analytics.mode ?? null)
  const size =
    typeof analytics.size === "number" ? analytics.size : cubeIdToSize(cube)
  const createdAt =
    typeof analytics.createdAt === "string"
      ? analytics.createdAt
      : new Date(0).toISOString()

  return {
    ...analytics,
    cube,
    size,
    mode,
    createdAt,
  }
}

export const userNameToSlug = (name: string) =>
  usernameToSlug(name) || "local-player"

const isSolveRecord = (value: unknown): value is SolveRecord => {
  if (!value || typeof value !== "object") return false
  const candidate = value as Partial<SolveRecord>
  const analytics = candidate.analytics as
    | Partial<SolveAnalyticsSnapshot>
    | undefined

  return (
    typeof candidate.id === "string" &&
    typeof candidate.userName === "string" &&
    typeof candidate.userSlug === "string" &&
    typeof candidate.timeMs === "number" &&
    typeof candidate.scramble === "string" &&
    Boolean(analytics) &&
    typeof analytics?.createdAt === "string" &&
    typeof analytics?.cube === "string" &&
    typeof analytics?.mode === "string"
  )
}

export const readSolves = (): SolveRecord[] => {
  try {
    const raw = localStorage.getItem(SOLVE_STORAGE_KEY)
    if (!raw) return []

    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter(isSolveRecord) : []
  } catch {
    return []
  }
}

export const writeSolves = (solves: SolveRecord[]) => {
  localStorage.setItem(SOLVE_STORAGE_KEY, JSON.stringify(solves))
}

export const saveSolve = (solve: SolveRecord) => {
  const next = [
    solve,
    ...readSolves().filter((candidate) => candidate.id !== solve.id),
  ].slice(0, 500)
  writeSolves(next)
  return solve
}

export const deleteSolve = (id: string) => {
  writeSolves(readSolves().filter((solve) => solve.id !== id))
}

export const readPublicSolvesForUser = (userSlug: string) =>
  readSolves().filter((solve) => solve.userSlug === userSlug)
