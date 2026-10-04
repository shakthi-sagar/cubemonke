import type { CubeMove, ViewerFaceMap } from "@/types/cube"

export const REPLAY_CAMERA_TARGET: [number, number, number] = [0, -0.4, 0]

export const initialViewerFaceMap = (): ViewerFaceMap => ({
  front: "F",
  back: "B",
  right: "R",
  left: "L",
  up: "U",
  down: "D",
})

export const invertMove = (move: CubeMove): CubeMove => ({
  ...move,
  direction: move.direction === 1 ? -1 : 1,
  layers: move.layers ? [...move.layers] : move.layers,
})

export const reverseMoves = (moves: CubeMove[]) =>
  [...moves].reverse().map(invertMove)

export const formatTime = (milliseconds: number) => {
  const totalCentiseconds = Math.floor(milliseconds / 10)
  const minutes = Math.floor(totalCentiseconds / 6000)
  const seconds = Math.floor((totalCentiseconds % 6000) / 100)
  const centiseconds = totalCentiseconds % 100

  if (minutes > 0) {
    return `${minutes}:${seconds.toString().padStart(2, "0")}.${centiseconds.toString().padStart(2, "0")}`
  }

  return `${seconds}.${centiseconds.toString().padStart(2, "0")}`
}

export const formatMetric = (value: number) => value.toFixed(2)
