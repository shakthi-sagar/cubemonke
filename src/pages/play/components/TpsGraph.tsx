import { useId, useMemo, useState } from "react"
import type {
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
} from "react"

import type { SolveAnalytics } from "@/lib/solveAnalytics"
import {
  TPS_GRAPH_HEIGHT,
  TPS_GRAPH_PADDING,
  TPS_GRAPH_WIDTH,
  buildPlottedTpsPoints,
  buildTpsBezierPath,
  nearestTpsPointIndex,
} from "@/pages/play/components/tpsGraphMath"
import { formatMetric } from "@/pages/play/utils"

type TpsGraphProps = {
  points: SolveAnalytics["tpsTimeline"]
}

export function TpsGraph({ points }: TpsGraphProps) {
  const gradientId = useId()
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [pinnedIndex, setPinnedIndex] = useState<number | null>(null)
  const width = TPS_GRAPH_WIDTH
  const height = TPS_GRAPH_HEIGHT
  const padding = TPS_GRAPH_PADDING
  const { plottedPoints, maxTps, maxMoves, graphHeight } = useMemo(
    () => buildPlottedTpsPoints(points),
    [points]
  )

  const bezierPath = useMemo(() => {
    return buildTpsBezierPath(plottedPoints)
  }, [plottedPoints])

  const activeIndex = pinnedIndex ?? hoveredIndex
  const activePoint =
    activeIndex === null ? null : (plottedPoints[activeIndex] ?? null)

  const selectNearestPoint = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (plottedPoints.length === 0) return

    const rect = event.currentTarget.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width) * width
    setHoveredIndex(nearestTpsPointIndex(plottedPoints, x))
  }

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (plottedPoints.length === 0) return

    const currentIndex = activeIndex ?? 0

    if (event.key === "ArrowLeft") {
      event.preventDefault()
      setPinnedIndex(Math.max(0, currentIndex - 1))
    }

    if (event.key === "ArrowRight") {
      event.preventDefault()
      setPinnedIndex(Math.min(plottedPoints.length - 1, currentIndex + 1))
    }

    if (event.key === "Escape") {
      setPinnedIndex(null)
      setHoveredIndex(null)
    }
  }

  if (points.length === 0) {
    return (
      <div className="rounded-2xl border border-border/30 bg-background/20 p-4 text-left backdrop-blur-md">
        <div className="text-[10px] font-bold tracking-widest text-muted-foreground/80 uppercase">
          TPS Timeline
        </div>
        <div className="mt-3 rounded-xl border border-dashed border-border/40 p-8 text-center text-xs font-bold text-muted-foreground/60">
          No solve turns captured.
        </div>
      </div>
    )
  }

  return (
    <div
      className="group rounded-2xl border border-border/20 bg-black/40 p-4 text-left shadow-inner backdrop-blur-md transition-all duration-300 outline-none focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/40"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <div className="mb-3 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-extrabold tracking-widest text-muted-foreground/75 uppercase">
            TPS Timeline
          </span>
          <div className="mt-1 flex h-6 items-center gap-1.5 font-mono text-sm font-black text-foreground">
            {activePoint ? (
              <>
                <span className="text-primary">
                  {(activePoint.time / 1000).toFixed(2)}s
                </span>
                <span className="text-muted-foreground/45">/</span>
                <span>{formatMetric(activePoint.tps)} TPS</span>
              </>
            ) : (
              <span className="text-xs font-normal text-muted-foreground/40 italic">
                Hover to explore details
              </span>
            )}
          </div>
        </div>
        <div className="text-right">
          <span className="rounded-full border border-primary/20 bg-primary/5 px-2 py-0.5 font-mono text-xs font-black text-primary shadow-sm">
            Peak: {formatMetric(maxTps)} TPS
          </span>
          <div className="mt-1.5 h-3 text-[9px] font-bold tracking-widest text-muted-foreground/50 uppercase">
            {pinnedIndex !== null
              ? "Pinned / Esc clears"
              : hoveredIndex !== null
                ? "Click to pin"
                : ""}
          </div>
        </div>
      </div>

      <div className="relative">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label="Turns per second graph"
          className="h-44 w-full cursor-crosshair overflow-visible select-none"
          onPointerMove={selectNearestPoint}
          onPointerLeave={() => setHoveredIndex(null)}
          onClick={() => setPinnedIndex(activeIndex)}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.25" />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
            </linearGradient>
          </defs>

          <line
            x1={padding.left}
            y1={height - padding.bottom}
            x2={width - padding.right}
            y2={height - padding.bottom}
            stroke="var(--border)"
            strokeOpacity="0.4"
            strokeWidth="1"
          />
          {[0.25, 0.5, 0.75].map((ratio) => (
            <line
              key={ratio}
              x1={padding.left}
              y1={padding.top + graphHeight * ratio}
              x2={width - padding.right}
              y2={padding.top + graphHeight * ratio}
              stroke="var(--border)"
              strokeDasharray="4 6"
              strokeOpacity="0.12"
              strokeWidth="1"
            />
          ))}

          <text
            x={padding.left - 10}
            y={padding.top + 4}
            textAnchor="end"
            className="fill-muted-foreground/60 font-mono text-[9px] font-bold"
          >
            {Math.round(maxTps)}
          </text>
          <text
            x={padding.left - 10}
            y={height - padding.bottom + 3}
            textAnchor="end"
            className="fill-muted-foreground/40 font-mono text-[9px] font-bold"
          >
            0
          </text>

          {plottedPoints.map((point, index) => {
            const barHeight = (point.moveCount / maxMoves) * 16
            const barWidth = 2

            return (
              <g key={`${point.time}-${index}`}>
                <rect
                  x={point.x - barWidth / 2}
                  y={height - padding.bottom - barHeight}
                  width={barWidth}
                  height={barHeight}
                  rx="1"
                  fill={
                    point.revertedMoves > 0
                      ? "var(--destructive)"
                      : "var(--primary)"
                  }
                  opacity={point.revertedMoves > 0 ? 0.35 : 0.1}
                />
              </g>
            )
          })}

          {bezierPath ? (
            <>
              <path
                d={`${bezierPath} L ${(plottedPoints[plottedPoints.length - 1]?.x ?? width - padding.right).toFixed(2)} ${(height - padding.bottom).toFixed(2)} L ${plottedPoints[0].x.toFixed(2)} ${(height - padding.bottom).toFixed(2)} Z`}
                fill={`url(#${gradientId})`}
              />
              <path
                d={bezierPath}
                fill="none"
                stroke="var(--primary)"
                strokeWidth="10"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.08"
              />
              <path
                d={bezierPath}
                fill="none"
                stroke="var(--primary)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </>
          ) : null}

          {plottedPoints.map((point, index) => {
            if (point.revertedMoves > 0) {
              return (
                <g key={`reverted-${index}`}>
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r="4"
                    fill="var(--destructive)"
                    opacity="0.85"
                  />
                  <path
                    d={`M ${point.x - 2} ${point.y - 2} L ${point.x + 2} ${point.y + 2} M ${point.x + 2} ${point.y - 2} L ${point.x - 2} ${point.y + 2}`}
                    stroke="white"
                    strokeWidth="1"
                  />
                </g>
              )
            }

            if (point.pauseMs > 0) {
              return (
                <circle
                  key={`pause-${index}`}
                  cx={point.x}
                  cy={point.y}
                  r="3.5"
                  fill="hsl(38 92% 50%)"
                  stroke="var(--background)"
                  strokeWidth="1"
                  opacity="0.9"
                />
              )
            }

            return null
          })}

          {activePoint ? (
            <g>
              <line
                x1={activePoint.x}
                y1={padding.top}
                x2={activePoint.x}
                y2={height - padding.bottom}
                stroke="var(--primary)"
                strokeDasharray="3 3"
                strokeOpacity="0.4"
                strokeWidth="1.5"
              />
              <circle
                cx={activePoint.x}
                cy={activePoint.y}
                r="6"
                fill="var(--background)"
                stroke="var(--primary)"
                strokeWidth="3"
              />
              <circle
                cx={activePoint.x}
                cy={activePoint.y}
                r="2"
                fill="var(--primary)"
              />
            </g>
          ) : null}
        </svg>

        {activePoint ? (
          <div
            className="pointer-events-none absolute top-4 flex min-w-[140px] -translate-x-1/2 flex-col gap-1 rounded-xl border border-primary/20 bg-slate-950/95 px-3 py-2 text-xs shadow-2xl backdrop-blur-md transition-all duration-100"
            style={{ left: `${(activePoint.x / width) * 100}%` }}
          >
            <div className="mb-1 flex items-center justify-between border-b border-primary/10 pb-1 font-mono text-xs font-black text-primary">
              <span>{formatMetric(activePoint.tps)} TPS</span>
              <span className="text-[10px] text-muted-foreground/80">
                {(activePoint.time / 1000).toFixed(2)}s
              </span>
            </div>
            <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[9px] font-bold text-muted-foreground/80">
              <span>turns</span>
              <span className="text-right font-mono text-foreground">
                {activePoint.moveCount}
              </span>
              <span>reverted</span>
              <span
                className={`text-right font-mono ${activePoint.revertedMoves > 0 ? "font-black text-destructive" : "text-foreground"}`}
              >
                {activePoint.revertedMoves}
              </span>
              {activePoint.pauseMs > 0 ? (
                <>
                  <span>pause</span>
                  <span className="text-right font-mono text-amber-500">
                    {activePoint.pauseMs}ms
                  </span>
                </>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-4 border-t border-border/10 pt-3 text-[9px] font-black tracking-widest text-muted-foreground/60 uppercase">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-primary" /> TPS Curve
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-1.5 w-1 rounded-sm bg-primary/30" /> Keystroke
          Count
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="flex h-2 w-2 items-center justify-center rounded-full bg-destructive text-[6px] text-white">
            x
          </span>{" "}
          Reverted Turn
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-amber-500" /> Pause Event
        </span>
      </div>
    </div>
  )
}
