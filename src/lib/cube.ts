import type {
  Axis,
  CanonicalFace,
  CubeMove,
  CubeState,
  Sticker,
  Vec3,
} from "@/types/cube"

export const FACE_COLORS: Record<CanonicalFace, string> = {
  F: "#22c55e", // Green
  B: "#2563eb", // Blue
  R: "#ef4444", // Red
  L: "#f97316", // Orange
  U: "#f8fafc", // White
  D: "#facc15", // Yellow
}

export const FACE_NORMALS: Record<CanonicalFace, Vec3> = {
  F: { x: 0, y: 0, z: 1 },
  B: { x: 0, y: 0, z: -1 },
  R: { x: 1, y: 0, z: 0 },
  L: { x: -1, y: 0, z: 0 },
  U: { x: 0, y: 1, z: 0 },
  D: { x: 0, y: -1, z: 0 },
}

export const OPPOSITE_FACES: Record<CanonicalFace, CanonicalFace> = {
  F: "B",
  B: "F",
  R: "L",
  L: "R",
  U: "D",
  D: "U",
}

export const FACE_META: Record<
  CanonicalFace,
  { axis: Axis; layer: -1 | 1; sign: -1 | 1 }
> = {
  F: { axis: "z", layer: 1, sign: 1 },
  B: { axis: "z", layer: -1, sign: -1 },
  R: { axis: "x", layer: 1, sign: 1 },
  L: { axis: "x", layer: -1, sign: -1 },
  U: { axis: "y", layer: 1, sign: 1 },
  D: { axis: "y", layer: -1, sign: -1 },
}

const FACES = ["F", "B", "R", "L", "U", "D"] as const

const getCubeCoords = (size: number) =>
  Array.from({ length: size }, (_, index) => index - (size - 1) / 2)

const isOnFace = (position: Vec3, face: CanonicalFace, maxCoord: number) => {
  const normal = FACE_NORMALS[face]
  if (normal.x !== 0) return position.x === normal.x * maxCoord
  if (normal.y !== 0) return position.y === normal.y * maxCoord
  return position.z === normal.z * maxCoord
}

export const createSolvedCube = (size: number): CubeState => {
  const cubies: CubeState = []
  const coords = getCubeCoords(size)
  const maxCoord = (size - 1) / 2

  for (const x of coords) {
    for (const y of coords) {
      for (const z of coords) {
        const position = { x, y, z }
        const stickers: Sticker[] = FACES.filter((face) =>
          isOnFace(position, face, maxCoord)
        ).map((face) => ({
          normal: FACE_NORMALS[face],
          color: FACE_COLORS[face],
          face,
        }))

        if (stickers.length === 0) continue

        cubies.push({
          id: `${x}:${y}:${z}`,
          position,
          stickers,
        })
      }
    }
  }

  return cubies
}

export const getQuarterTurns = (move: CubeMove): 1 | -1 => {
  const { sign } = FACE_META[move.face]
  return (-move.direction * sign) as 1 | -1
}

export const getTurnAngle = (move: CubeMove, progress: number) => {
  return getQuarterTurns(move) * (Math.PI / 2) * progress
}

export const getFaceAxisAndLayers = (
  face: CanonicalFace,
  size: number,
  layerIndices: number[] = [0]
): { axis: Axis; coordValues: number[] } => {
  const meta = FACE_META[face]
  const coords = getCubeCoords(size)
  const layers = layerIndices.length > 0 ? layerIndices : [0]

  const coordValues = layers.map((idx) => {
    if (meta.layer === 1) {
      return coords[size - 1 - idx]
    }
    return coords[idx]
  })

  return { axis: meta.axis, coordValues }
}

export const isCubieInMove = (position: Vec3, size: number, move: CubeMove) => {
  if (move.entire) return true
  const { axis, coordValues } = getFaceAxisAndLayers(
    move.face,
    size,
    move.layers
  )
  const val = position[axis]
  return coordValues.some((target) => Math.abs(val - target) < 0.001)
}

export const rotateVec = (
  vec: Vec3,
  axis: Axis,
  quarterTurns: 1 | -1
): Vec3 => {
  const { x, y, z } = vec

  if (axis === "x") {
    return quarterTurns === 1 ? { x, y: -z, z: y } : { x, y: z, z: -y }
  }

  if (axis === "y") {
    return quarterTurns === 1 ? { x: z, y, z: -x } : { x: -z, y, z: x }
  }

  return quarterTurns === 1 ? { x: -y, y: x, z } : { x: y, y: -x, z }
}

export const applyMove = (
  cube: CubeState,
  size: number,
  move: CubeMove
): CubeState => {
  if (move.entire) {
    const { axis } = FACE_META[move.face]
    const quarterTurns = getQuarterTurns(move)
    return cube.map((cubie) => ({
      ...cubie,
      position: rotateVec(cubie.position, axis, quarterTurns),
      stickers: cubie.stickers.map((sticker) => ({
        ...sticker,
        normal: rotateVec(sticker.normal, axis, quarterTurns),
      })),
    }))
  }

  const { axis, coordValues } = getFaceAxisAndLayers(
    move.face,
    size,
    move.layers
  )
  const quarterTurns = getQuarterTurns(move)

  return cube.map((cubie) => {
    const val = cubie.position[axis]
    const matches = coordValues.some((target) => Math.abs(val - target) < 0.001)

    if (!matches) {
      return cubie
    }

    return {
      ...cubie,
      position: rotateVec(cubie.position, axis, quarterTurns),
      stickers: cubie.stickers.map((sticker) => ({
        ...sticker,
        normal: rotateVec(sticker.normal, axis, quarterTurns),
      })),
    }
  })
}

const normalizedMoveLayers = (layers: number[] | undefined) =>
  [...new Set(layers && layers.length > 0 ? layers : [0])].sort(
    (left, right) => left - right
  )

const movePrimeSuffix = (direction: 1 | -1) => (direction === -1 ? "'" : "")

const singleLayerMoveLabel = (
  move: CubeMove,
  layer: number,
  size?: number
) => {
  if (size && size > 1 && layer === size - 1) {
    return `${OPPOSITE_FACES[move.face]}${movePrimeSuffix(
      move.direction === 1 ? -1 : 1
    )}`
  }

  const prefix = layer === 0 ? "" : String(layer + 1)
  return `${prefix}${move.face}${movePrimeSuffix(move.direction)}`
}

const moveLayerAffixes = (layers: number[]) => {
  if (layers.length === 1) {
    return {
      prefix: layers[0] === 0 ? "" : String(layers[0] + 1),
      suffix: "",
    }
  }

  const isContiguousWideTurn = layers.every((layer, index) => layer === index)
  if (isContiguousWideTurn) {
    return {
      prefix: layers.length === 2 ? "" : String(layers.length),
      suffix: "w",
    }
  }

  return {
    prefix: "",
    suffix: `[${layers.map((layer) => layer + 1).join(",")}]`,
  }
}

export const moveToLabel = (move: CubeMove, size?: number) => {
  const layers = normalizedMoveLayers(move.layers)

  if (!move.entire && layers.length === 1) {
    return singleLayerMoveLabel(move, layers[0], size)
  }

  const isContiguousWideTurn = layers.every((layer, index) => layer === index)
  if (!move.entire && !isContiguousWideTurn && size) {
    return `[${layers.map((layer) => singleLayerMoveLabel(move, layer, size)).join(" ")}]`
  }

  const { prefix, suffix } = moveLayerAffixes(layers)
  return `${prefix}${move.face}${suffix}${movePrimeSuffix(move.direction)}`
}

export const formatQueue = (moves: CubeMove[], size?: number) =>
  moves.map((move) => moveToLabel(move, size)).join(" ")

export const isSolved = (cube: CubeState): boolean => {
  const faceColors: Record<string, Set<string>> = {
    "0,0,1": new Set(),
    "0,0,-1": new Set(),
    "1,0,0": new Set(),
    "-1,0,0": new Set(),
    "0,1,0": new Set(),
    "0,-1,0": new Set(),
  }

  for (const cubie of cube) {
    for (const sticker of cubie.stickers) {
      const key = `${sticker.normal.x},${sticker.normal.y},${sticker.normal.z}`
      if (key in faceColors) {
        faceColors[key].add(sticker.color)
      }
    }
  }

  return Object.values(faceColors).every((colors) => colors.size <= 1)
}
