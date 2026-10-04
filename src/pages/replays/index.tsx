import { useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { Film, Play, Trash2 } from "lucide-react"

import { CubeSelector } from "@/components/event/CubeSelector"
import { Button } from "@/components/ui/button"
import { useAuthUser } from "@/hooks/useAuthUser"
import { useIsMobile } from "@/hooks/use-mobile"
import { dbProvider } from "@/lib/data"
import type { ReplayRecord } from "@/lib/replays"
import { normalizeCubeId } from "@/lib/events"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { ReplayPlayer } from "./player"

const formatTime = (milliseconds: number) => {
  const totalCentiseconds = Math.floor(milliseconds / 10)
  const minutes = Math.floor(totalCentiseconds / 6000)
  const seconds = Math.floor((totalCentiseconds % 6000) / 100)
  const centiseconds = totalCentiseconds % 100

  if (minutes > 0) {
    return `${minutes}:${seconds.toString().padStart(2, "0")}.${centiseconds.toString().padStart(2, "0")}`
  }
  return `${seconds}.${centiseconds.toString().padStart(2, "0")}`
}

const replaySolveMoveCount = (replay: ReplayRecord) =>
  replay.moves.filter((moveEvent) => moveEvent.phase === "solve" && !moveEvent.move.entire)
    .length

function ReplayCard({
  replay,
  onDelete,
  onWatch,
}: {
  replay: ReplayRecord
  onDelete: (id: string) => void
  onWatch: (id: string) => void
}) {
  const solveMoveCount = replaySolveMoveCount(replay)


  return (
    <div className="rounded-lg border border-border bg-card/45 p-4 shadow-sm backdrop-blur-md transition hover:border-primary/30">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md border border-primary/15 bg-primary/10 px-2 py-1 text-[10px] font-black tracking-widest text-primary uppercase">
              {replay.cube}
            </span>
            <span className="rounded-md border border-border bg-muted/30 px-2 py-1 text-[10px] font-black tracking-widest text-muted-foreground uppercase">
              {replay.mode}
            </span>
            {!replay.leaderboardEligible ? (
              <span className="rounded-md border border-amber-500/20 bg-amber-500/10 px-2 py-1 text-[10px] font-black tracking-widest text-amber-500 uppercase">
                Practice
              </span>
            ) : null}
          </div>
          <h2 className="mt-3 font-mono text-3xl font-black tracking-tight">
            {formatTime(replay.time)}
          </h2>
          <div className="mt-1 text-xs text-muted-foreground">
            {replay.userName} · {new Date(replay.createdAt).toLocaleString()} ·{" "}
            {solveMoveCount} moves
          </div>
          <p className="mt-3 line-clamp-2 font-mono text-xs leading-relaxed break-all text-foreground/70">
            {replay.scramble}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Button
            size="sm"
            aria-label="Watch replay"
            title="Watch replay"
            className="h-9 w-9 px-0 sm:w-auto sm:px-4"
            onClick={() => onWatch(replay.id)}
          >
            <Play className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Watch</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            aria-label="Delete replay"
            title="Delete replay"
            className="h-9 w-9 px-0 text-destructive hover:text-destructive sm:w-auto sm:px-4"
            onClick={() => onDelete(replay.id)}
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Delete</span>
          </Button>
        </div>
      </div>
    </div>
  )
}

export function ReplaysPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const cube = normalizeCubeId(searchParams.get("cube"))
  const { user, isLoading: isAuthLoading, isSignedIn } = useAuthUser()
  const isMobile = useIsMobile()
  const [filteredReplays, setFilteredReplays] = useState<ReplayRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [selectedReplayId, setSelectedReplayId] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    const userSlug = user?.userSlug

    if (isAuthLoading) return undefined

    if (!isSignedIn || !userSlug) {
      return undefined
    }

    async function loadReplays() {
      setIsLoading(true)
      setLoadError(null)

      try {
        const replays = await dbProvider.replays.list({ cube, userSlug })
        if (isMounted) setFilteredReplays(replays)
      } catch (error) {
        if (isMounted)
          setLoadError(
            error instanceof Error ? error.message : "Unable to load replays."
          )
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    void loadReplays()

    return () => {
      isMounted = false
    }
  }, [cube, isAuthLoading, isSignedIn, user?.userSlug])

  const handleDelete = async (id: string) => {
    if (!user?.userSlug) return
    await dbProvider.replays.delete(id)
    setFilteredReplays(
      await dbProvider.replays.list({ cube, userSlug: user.userSlug })
    )
  }

  const handleWatch = (id: string) => {
    if (isMobile) {
      void navigate(`/replays/${id}`)
      return
    }

    setSelectedReplayId(id)
  }

  return (
    <div className="mx-auto flex h-full w-full max-w-6xl flex-col p-4 md:p-6">
      <div className="flex flex-1 flex-col gap-6 rounded-lg border border-border bg-card/40 p-6 shadow-sm backdrop-blur-md">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-black tracking-tight">Replays</h1>
            <p className="max-w-2xl text-sm text-muted-foreground">
              View your saved solve replays here and open any solve to watch it
              back.
            </p>
          </div>
          <CubeSelector
            value={cube}
            showLabel={false}
            onChange={(nextCube) =>
              setSearchParams({ cube: nextCube }, { replace: true })
            }
          />
        </div>

        {loadError ? (
          <div className="flex min-h-80 flex-1 items-center justify-center rounded-lg border border-destructive/25 bg-destructive/10 p-8 text-center">
            <div>
              <h2 className="text-xl font-black tracking-tight text-destructive">
                Replays unavailable
              </h2>
              <p className="mt-2 text-sm text-destructive/80">{loadError}</p>
            </div>
          </div>
        ) : isLoading || isAuthLoading ? (
          <div className="flex min-h-80 flex-1 items-center justify-center rounded-lg border border-border/40 bg-background/30 p-8 text-center text-sm font-semibold text-muted-foreground">
            Loading replays...
          </div>
        ) : filteredReplays.length > 0 ? (
          <div className="grid gap-3">
            {filteredReplays.map((replay) => (
              <ReplayCard
                key={replay.id}
                replay={replay}
                onDelete={handleDelete}
                onWatch={handleWatch}
              />
            ))}
          </div>
        ) : (
          <div className="flex min-h-80 flex-1 items-center justify-center rounded-lg border border-border/40 bg-background/30 p-8 text-center">
            <div className="max-w-md">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Film className="h-7 w-7" />
              </div>
              <h2 className="text-xl font-black tracking-tight">
                No {cube} replays yet
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Complete a solve on Play and it will appear here automatically.
              </p>
            </div>
          </div>
        )}
      </div>

      <Dialog
        open={!isMobile && !!selectedReplayId}
        onOpenChange={(open) => !open && setSelectedReplayId(null)}
      >
        <DialogContent className="h-[80vh] max-w-4xl overflow-hidden border-border bg-background/95 p-0 shadow-2xl">
          <DialogTitle className="sr-only">
            {selectedReplayId
              ? `Replay player ${selectedReplayId}`
              : "Replay player"}
          </DialogTitle>
          {selectedReplayId && (
            <ReplayPlayer
              replayId={selectedReplayId}
              onClose={() => setSelectedReplayId(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ReplaysPage
