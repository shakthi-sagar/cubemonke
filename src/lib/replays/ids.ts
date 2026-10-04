export const createReplayId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID()
  }

  return `replay_${Date.now()}_${Math.random().toString(36).slice(2)}`
}
