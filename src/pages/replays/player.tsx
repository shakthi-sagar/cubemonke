import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Film, Pause, Play, RotateCcw } from 'lucide-react'

import { CubeScene } from '@/components/cube/CubeScene'
import { Button } from '@/components/ui/button'
import { useCubeAnimator } from '@/hooks/useCubeAnimator'
import { formatQueue, moveToLabel } from '@/lib/cube'
import { dbProvider } from '@/lib/data'
import type { ReplayRecord } from '@/lib/replays'
import { useReplayPlayback } from '@/pages/replays/useReplayPlayback'

const isReplaySolveMove = (moveEvent: ReplayRecord['moves'][number]) =>
  moveEvent.phase === 'solve' && !moveEvent.move.entire

const formatTime = (milliseconds: number) => {
  const totalCentiseconds = Math.floor(milliseconds / 10)
  const minutes = Math.floor(totalCentiseconds / 6000)
  const seconds = Math.floor((totalCentiseconds % 6000) / 100)
  const centiseconds = totalCentiseconds % 100

  if (minutes > 0) {
    return `${minutes}:${seconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`
  }
  return `${seconds}.${centiseconds.toString().padStart(2, '0')}`
}

function MissingReplay({ onClose }: { onClose?: () => void }) {
  return (
    <div className="flex h-full w-full items-center justify-center p-6 bg-background/50">
      <div className="max-w-xl rounded-lg border border-border bg-card/45 p-8 text-center shadow-sm backdrop-blur-md">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Film className="h-7 w-7" />
        </div>
        <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">Replay Not Found</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          This replay could not be found.
        </p>
        {onClose ? (
          <Button type="button" onClick={onClose} className="mt-5">
            Close
          </Button>
        ) : (
          <Button asChild className="mt-5">
            <Link to="/replays">Back to Replays</Link>
          </Button>
        )}
      </div>
    </div>
  )
}

export function ReplayPlayer({ replayId, onClose }: { replayId: string; onClose?: () => void }) {
  const [replay, setReplay] = useState<ReplayRecord | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    async function loadReplay() {
      setIsLoading(true)

      try {
        const nextReplay = await dbProvider.replays.get(replayId)
        if (!isMounted) return

        setReplay(nextReplay)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    void loadReplay()

    return () => {
      isMounted = false
    }
  }, [replayId])

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center p-6 text-sm font-semibold text-muted-foreground bg-background/30 backdrop-blur-md">
        Loading replay player...
      </div>
    )
  }

  if (!replay) return <MissingReplay onClose={onClose} />

  return (
    <LoadedReplayPlayer
      key={replay.id}
      replay={replay}
      onClose={onClose}
    />
  )
}

function LoadedReplayPlayer({
  replay,
  onClose,
}: {
  replay: ReplayRecord
  onClose?: () => void
}) {
  const solveMoves = useMemo(() => replay.moves.filter(isReplaySolveMove), [replay.moves])
  const { cube, activeTurn, queueMoves, scrambleCube } = useCubeAnimator(
    replay.size,
    replay.settings.turnSpeed
  )
  const {
    viewerMap,
    setViewerMap,
    camera,
    setCamera,
    playbackState,
    status,
    currentMoveIndex,
    resetPlayback,
    handlePlayPause,
  } = useReplayPlayback({
    replay,
    queueMoves,
    scrambleCube,
  })


  const topOverlayClassName = onClose
    ? 'order-1 z-10 flex w-full max-w-5xl flex-col items-start gap-2 md:w-[calc(100%-3.75rem)] md:self-start'
    : 'order-1 z-10 flex w-full flex-col items-start gap-2 md:mx-auto md:max-w-5xl'

  const movesTimelineClassName = 'w-full rounded-lg border border-border bg-card/65 p-3 shadow-lg backdrop-blur-md'

  return (
    <div className="flex min-h-full w-full flex-col gap-3 bg-background p-3 md:relative md:h-full md:min-h-[480px] md:justify-between md:gap-0 md:overflow-hidden md:p-6">
      <div className="relative order-2 h-[38svh] min-h-[280px] max-h-[380px] overflow-hidden rounded-lg border border-border/50 bg-background/40 md:absolute md:inset-0 md:order-none md:h-auto md:min-h-0 md:max-h-none md:rounded-none md:border-0">
        <CubeScene
          cube={cube}
          size={replay.size}
          activeTurn={activeTurn}
          viewerMap={viewerMap}
          onViewerMapChange={setViewerMap}
          showLabels
          colors={replay.settings.cubeColors}
          cameraPosition={camera.position}
          cameraTarget={camera.target}
          cameraUp={camera.up}
          interactive={playbackState !== 'playing'}
          onCameraChange={playbackState !== 'playing' ? (cam) => setCamera(cam) : undefined}
        />
      </div>

      {/* Moves sequence timeline at the top */}
      <div className={topOverlayClassName}>
        <div data-testid="replay-moves-timeline" className={movesTimelineClassName}>
          <span className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Solve Moves ({solveMoves.length})</span>
          <div className="flex flex-wrap gap-1.5 max-h-[80px] overflow-y-auto pr-1">
            {solveMoves.length > 0 ? (
              solveMoves.map((moveEvent, index) => {
                const isCurrent = currentMoveIndex === index
                const isPast = currentMoveIndex !== null && index < currentMoveIndex
                return (
                  <span
                    key={moveEvent.id || index}
                    className={`px-2 py-0.5 rounded-md text-xs font-mono transition-all duration-100 ${
                      isCurrent
                        ? "bg-primary text-primary-foreground font-black scale-105 shadow-sm"
                        : isPast
                          ? "text-foreground/40 bg-muted/20"
                          : "text-foreground/80 bg-muted/40"
                    }`}
                  >
                    {moveToLabel(moveEvent.move, replay.size)}
                  </span>
                )
              })
            ) : (
              <span className="text-xs text-muted-foreground italic">No moves recorded in this solve.</span>
            )}
          </div>
        </div>
        <div
          data-testid="replay-status-overlay"
          className="pointer-events-none w-fit rounded-md border border-primary/15 bg-primary/10 px-3 py-2 text-xs font-black uppercase tracking-widest text-primary shadow-lg backdrop-blur-md"
        >
          {status}
        </div>
      </div>

      <div data-testid="replay-controls-panel" className="order-3 z-10 flex w-full flex-col gap-3 rounded-lg border border-border bg-card/65 p-4 shadow-lg backdrop-blur-md md:mx-auto md:max-w-5xl">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.24em] text-primary">Replay Player</span>
            <h1 className="mt-1 font-mono text-3xl font-black tracking-tight">{formatTime(replay.time)}</h1>
            <div className="mt-1 text-xs text-muted-foreground">
              {replay.userName} · {replay.cube} / {replay.mode} · {solveMoves.length} moves
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap">
            <Button
              type="button"
              aria-label={playbackState === 'playing' ? 'Pause replay' : 'Play replay'}
              title={playbackState === 'playing' ? 'Pause replay' : 'Play replay'}
              onClick={handlePlayPause}
              className="w-full px-0 sm:w-auto sm:px-6"
            >
              {playbackState === 'playing' ? (
                <>
                  <Pause className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Pause</span>
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Play</span>
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              aria-label="Reset replay"
              title="Reset replay"
              onClick={resetPlayback}
              className="w-full px-0 sm:w-auto sm:px-6"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </Button>
          </div>
        </div>
        <div className="border-t border-border/40 pt-3">
          <div>
            <span className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Scramble</span>
            <p className="select-text break-all font-mono text-sm tracking-wide text-foreground/90">{replay.scramble || formatQueue(replay.scrambleMoves, replay.size)}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export function ReplayPlayerPage() {
  const { replayId = '' } = useParams()
  return (
    <div className="min-h-full w-full bg-background md:h-full">
      <ReplayPlayer replayId={replayId} />
    </div>
  )
}

export default ReplayPlayerPage
