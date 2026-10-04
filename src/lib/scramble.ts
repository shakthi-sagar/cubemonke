import type { CanonicalFace, CubeMove } from '@/types/cube'

const FACES: CanonicalFace[] = ['F', 'B', 'R', 'L', 'U', 'D']
const OPPOSITES: Record<CanonicalFace, CanonicalFace> = {
  F: 'B',
  B: 'F',
  R: 'L',
  L: 'R',
  U: 'D',
  D: 'U',
}

export const createScramble = (size: number, length = 20): CubeMove[] => {
  const scramble: CubeMove[] = []
  let previous: CanonicalFace | null = null

  while (scramble.length < length) {
    const face = FACES[Math.floor(Math.random() * FACES.length)]

    if (face === previous) {
      continue
    }

    const twoBack = scramble.at(-2)?.face
    if (twoBack === face && previous && OPPOSITES[previous] === face) {
      continue
    }

    // For 4x4, sometimes include a wide move
    const isWide = size >= 4 && Math.random() > 0.6
    const layers = isWide ? [0, 1] : [0]

    scramble.push({
      face,
      direction: Math.random() > 0.5 ? 1 : -1,
      layers,
    })
    previous = face
  }

  return scramble
}

const SCRAMBLE_TOKEN_RE = /^(\d+)?([FBRLUD])(w)?(2|')?$/

export const parseScramble = (input: string, size: number): CubeMove[] => {
  const tokens = input.trim().split(/\s+/).filter(Boolean)

  if (tokens.length === 0) {
    throw new Error('Add at least one scramble move.')
  }

  return tokens.flatMap((token) => {
    const match = token.match(SCRAMBLE_TOKEN_RE)
    if (!match) {
      throw new Error(`Invalid move "${token}". Use moves like R, U', F2, Rw, 3Rw, or 2R.`)
    }

    const [, depthRaw, faceRaw, wideRaw, suffix] = match
    const face = faceRaw as CanonicalFace
    const depth = depthRaw ? Number(depthRaw) : null

    if (wideRaw) {
      const width = depth ?? 2
      if (width < 2 || width > size) {
        throw new Error(`Move "${token}" needs a wide depth between 2 and ${size}.`)
      }

      const move: CubeMove = {
        face,
        direction: suffix === "'" ? -1 : 1,
        layers: Array.from({ length: width }, (_, index) => index),
      }

      return suffix === '2' ? [move, move] : [move]
    }

    const layerIndex = depth ? depth - 1 : 0
    if (layerIndex < 0 || layerIndex >= size) {
      throw new Error(`Move "${token}" targets layer ${layerIndex + 1}, but ${size}x${size} only has ${size} layers.`)
    }

    const move: CubeMove = {
      face,
      direction: suffix === "'" ? -1 : 1,
      layers: [layerIndex],
    }

    return suffix === '2' ? [move, move] : [move]
  })
}
