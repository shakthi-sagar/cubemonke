import type { SolveAnalytics } from "@/lib/solveAnalytics"

export const TPS_GRAPH_WIDTH = 560
export const TPS_GRAPH_HEIGHT = 180
export const TPS_GRAPH_PADDING = { top: 18, right: 16, bottom: 34, left: 34 }

export type PlottedTpsPoint = SolveAnalytics["tpsTimeline"][number] & {
  x: number
  y: number
  moveCount: number
  revertedMoves: number
  pauseMs: number
}

export const tpsGraphInnerSize = () => ({
  graphWidth: TPS_GRAPH_WIDTH - TPS_GRAPH_PADDING.left - TPS_GRAPH_PADDING.right,
  graphHeight: TPS_GRAPH_HEIGHT - TPS_GRAPH_PADDING.top - TPS_GRAPH_PADDING.bottom,
})

export const buildPlottedTpsPoints = (
  points: SolveAnalytics["tpsTimeline"]
) => {
  const { graphWidth, graphHeight } = tpsGraphInnerSize()
  const maxTps = Math.max(1, ...points.map((point) => point.tps))
  const maxMoves = Math.max(1, ...points.map((point) => point.moveCount ?? 0))
  const plottedPoints = points.map((point, index): PlottedTpsPoint => {
    const x =
      TPS_GRAPH_PADDING.left +
      (points.length <= 1
        ? graphWidth / 2
        : (index / (points.length - 1)) * graphWidth)
    const y =
      TPS_GRAPH_PADDING.top +
      graphHeight -
      (point.tps / maxTps) * graphHeight

    return {
      ...point,
      x,
      y,
      moveCount: point.moveCount ?? 0,
      revertedMoves: point.revertedMoves ?? 0,
      pauseMs: point.pauseMs ?? 0,
    }
  })

  return {
    plottedPoints,
    maxTps,
    maxMoves,
    graphWidth,
    graphHeight,
  }
}

const clampGraphY = (y: number) =>
  Math.max(
    TPS_GRAPH_PADDING.top,
    Math.min(TPS_GRAPH_HEIGHT - TPS_GRAPH_PADDING.bottom, y)
  )

export const buildTpsBezierPath = (plottedPoints: PlottedTpsPoint[]) => {
  if (plottedPoints.length === 0) return ""
  if (plottedPoints.length === 1)
    return `M ${plottedPoints[0].x.toFixed(2)} ${plottedPoints[0].y.toFixed(2)}`

  let path = `M ${plottedPoints[0].x.toFixed(2)} ${plottedPoints[0].y.toFixed(2)}`
  const k = 0.15

  for (let i = 0; i < plottedPoints.length - 1; i += 1) {
    const p0 = plottedPoints[i - 1] ?? plottedPoints[i]
    const p1 = plottedPoints[i]
    const p2 = plottedPoints[i + 1]
    const p3 = plottedPoints[i + 2] ?? p2

    const cp1x = p1.x + (p2.x - p0.x) * k
    const cp1y = clampGraphY(p1.y + (p2.y - p0.y) * k)
    const cp2x = p2.x - (p3.x - p1.x) * k
    const cp2y = clampGraphY(p2.y - (p3.y - p1.y) * k)

    path += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`
  }

  return path
}

export const nearestTpsPointIndex = (
  plottedPoints: PlottedTpsPoint[],
  x: number
) =>
  plottedPoints.reduce((nearestIndex, point, index) => {
    const nearestDistance = Math.abs(plottedPoints[nearestIndex].x - x)
    const distance = Math.abs(point.x - x)
    return distance < nearestDistance ? index : nearestIndex
  }, 0)
