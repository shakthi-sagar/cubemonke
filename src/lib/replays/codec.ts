import type {
  CompactReplayTimelineEvent,
  ReplayMoveEvent,
  ReplayPhase,
  ReplayTimelineEvent,
} from "@/lib/replays/types"

const compactPhase = (phase: ReplayPhase) => (phase === "solve" ? 1 : 0)

const expandPhase = (phase: 0 | 1): ReplayPhase =>
  phase === 1 ? "solve" : "inspection"

const compactTimerLabel = (
  label: Extract<ReplayTimelineEvent, { type: "timer" }>["label"]
) => {
  if (label === "solve-start") return 1
  if (label === "solve-stop") return 2
  return 0
}

const expandTimerLabel = (
  label: 0 | 1 | 2
): Extract<ReplayTimelineEvent, { type: "timer" }>["label"] => {
  if (label === 1) return "solve-start"
  if (label === 2) return "solve-stop"
  return "inspection-start"
}

const compactLayers = (layers: number[] | undefined) =>
  layers && layers.length > 0 && !(layers.length === 1 && layers[0] === 0)
    ? layers.join(",")
    : ""

const expandLayers = (layers: string) =>
  layers
    ? layers
        .split(",")
        .map((layer) => Number(layer))
        .filter((layer) => Number.isInteger(layer) && layer >= 0)
    : [0]

const roundReplayTime = (time: number) => Math.max(0, Math.round(time))

export const compactReplayEvents = (
  events: ReplayTimelineEvent[]
): CompactReplayTimelineEvent[] =>
  events.map((event) => {
    const phase = compactPhase(event.phase)
    const time = roundReplayTime(event.time)

    if (event.type === "timer") {
      return ["t", phase, time, compactTimerLabel(event.label)]
    }

    if (event.type === "move") {
      const compactEvent: CompactReplayTimelineEvent = [
        "m",
        phase,
        time,
        event.move.face,
        event.move.direction,
        compactLayers(event.move.layers),
        event.move.entire ? 1 : 0,
      ]

      if (typeof event.inputTime === "number") {
        compactEvent.push(roundReplayTime(event.inputTime))
      }

      return compactEvent
    }

    if (event.type === "camera") {
      return event.camera.up
        ? ["c", phase, time, event.camera.position, event.camera.target, event.camera.up]
        : ["c", phase, time, event.camera.position, event.camera.target]
    }

    return ["v", phase, time, event.viewerMap]
  })

const expandCompactReplayEvent = (
  event: CompactReplayTimelineEvent,
  index: number
): ReplayTimelineEvent | null => {
  const [type, phaseFlag, time] = event
  const id = `${type}-${index}`
  const phase = expandPhase(phaseFlag)

  if (type === "t") {
    return {
      id,
      type: "timer",
      phase,
      time,
      label: expandTimerLabel(event[3]),
    }
  }

  if (type === "m") {
    const [, , , face, direction, layers, entire, inputTime] = event
    return {
      id,
      type: "move",
      phase,
      time,
      ...(typeof inputTime === "number" ? { inputTime } : {}),
      move: {
        face,
        direction,
        layers: expandLayers(layers),
        ...(entire ? { entire: true } : {}),
      },
    }
  }

  if (type === "c") {
    return {
      id,
      type: "camera",
      phase,
      time,
      camera: {
        position: event[3],
        target: event[4],
        ...(event[5] ? { up: event[5] } : {}),
      },
    }
  }

  if (type === "v") {
    return {
      id,
      type: "viewer-map",
      phase,
      time,
      viewerMap: event[3],
    }
  }

  return null
}

export const expandReplayEvents = (
  events: CompactReplayTimelineEvent[]
): ReplayTimelineEvent[] =>
  events
    .map((event, index) => expandCompactReplayEvent(event, index))
    .filter((event): event is ReplayTimelineEvent => event !== null)

export const replayMovesFromEvents = (
  events: ReplayTimelineEvent[]
): ReplayMoveEvent[] =>
  events
    .filter(
      (
        event
      ): event is Extract<ReplayTimelineEvent, { type: "move" }> =>
        event.type === "move"
    )
    .map(({ id, phase, time, inputTime, move }) => ({
      id,
      phase,
      time,
      ...(typeof inputTime === "number" ? { inputTime } : {}),
      move,
    }))
