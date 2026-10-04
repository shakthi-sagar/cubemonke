import type { ReplaySession } from "@/pages/play/types"

const CURRENT_REPLAY_DRAFT_STORAGE_KEY = "speedcube_current_replay_draft"

const isReplaySession = (value: unknown): value is ReplaySession => {
  if (!value || typeof value !== "object") return false

  const candidate = value as Partial<ReplaySession>
  return (
    typeof candidate.id === "string" &&
    typeof candidate.inspectionStartedAt === "number" &&
    typeof candidate.scramble === "string" &&
    Array.isArray(candidate.scrambleMoves) &&
    Boolean(candidate.initialCamera) &&
    Boolean(candidate.initialViewerMap) &&
    Array.isArray(candidate.events) &&
    Array.isArray(candidate.moves)
  )
}

export const readCurrentReplayDraft = () => {
  try {
    const raw = window.localStorage.getItem(CURRENT_REPLAY_DRAFT_STORAGE_KEY)
    if (!raw) return null

    const parsed = JSON.parse(raw)
    return isReplaySession(parsed) ? parsed : null
  } catch {
    return null
  }
}

export const writeCurrentReplayDraft = (session: ReplaySession) => {
  try {
    window.localStorage.setItem(
      CURRENT_REPLAY_DRAFT_STORAGE_KEY,
      JSON.stringify(session)
    )
  } catch {
    // Losing the local draft should not interrupt the active solve.
  }
}

export const clearCurrentReplayDraft = () => {
  try {
    window.localStorage.removeItem(CURRENT_REPLAY_DRAFT_STORAGE_KEY)
  } catch {
    // Ignore storage failures during cleanup.
  }
}
