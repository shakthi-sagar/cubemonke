export type Axis = 'x' | 'y' | 'z'

export type CanonicalFace = 'F' | 'B' | 'R' | 'L' | 'U' | 'D'

export type RelativeFace = 'front' | 'back' | 'right' | 'left' | 'up' | 'down'

export type Vec3 = {
  x: number
  y: number
  z: number
}

export type Sticker = {
  normal: Vec3
  color: string
  face: CanonicalFace
}

export type CubieState = {
  id: string
  position: Vec3
  stickers: Sticker[]
}

export type CubeState = CubieState[]

export type CubeMove = {
  face: CanonicalFace
  direction: 1 | -1
  layers?: number[] // layer indices to rotate, e.g. [0] for outer layer, [0, 1] for wide turns.
  entire?: boolean // if true, rotates the entire cube (viewer rotation)
}

export type ActiveTurn = {
  move: CubeMove
  progress: number
}

export type ViewerFaceMap = Record<RelativeFace, CanonicalFace>
