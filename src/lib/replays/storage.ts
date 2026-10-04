import type { ReplayRecord } from "@/lib/replays/types"

export const REPLAY_STORAGE_KEY = "speedcube_replays"

const isReplayRecord = (value: unknown): value is ReplayRecord => {
  if (!value || typeof value !== "object") return false
  const candidate = value as Partial<ReplayRecord>
  return (
    typeof candidate.id === "string" &&
    typeof candidate.solveId === "string" &&
    typeof candidate.createdAt === "string" &&
    typeof candidate.userName === "string" &&
    typeof candidate.time === "number" &&
    typeof candidate.scramble === "string" &&
    typeof candidate.cube === "string" &&
    typeof candidate.mode === "string" &&
    typeof candidate.size === "number" &&
    Array.isArray(candidate.scrambleMoves) &&
    Boolean(candidate.settings) &&
    Boolean(candidate.initialCamera) &&
    Boolean(candidate.initialViewerMap) &&
    Boolean(candidate.finalViewerMap) &&
    Array.isArray(candidate.events) &&
    Array.isArray(candidate.moves)
  )
}

export const readReplays = (): ReplayRecord[] => {
  try {
    const raw = localStorage.getItem(REPLAY_STORAGE_KEY)
    if (!raw) return []

    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter(isReplayRecord) : []
  } catch {
    return []
  }
}

export const writeReplays = (replays: ReplayRecord[]) => {
  localStorage.setItem(REPLAY_STORAGE_KEY, JSON.stringify(replays))
}

export const saveReplay = (replay: ReplayRecord) => {
  const next = [replay, ...readReplays()].slice(0, 200)
  writeReplays(next)
  return replay
}

export const getReplay = (id: string) =>
  readReplays().find((replay) => replay.id === id) ?? null

export const deleteReplay = (id: string) => {
  writeReplays(readReplays().filter((replay) => replay.id !== id))
}
