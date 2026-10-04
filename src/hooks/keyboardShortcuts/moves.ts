import { FACE_META, FACE_NORMALS, getQuarterTurns, rotateVec } from "@/lib/cube"
import type {
  LayerTurnDirection,
  NotationTurn,
  ViewDirection,
} from "@/lib/settings"
import type { CanonicalFace, CubeMove, ViewerFaceMap } from "@/types/cube"

const findDirection = (
  axisFace: CanonicalFace,
  fromFace: CanonicalFace,
  toFace: CanonicalFace
): 1 | -1 => {
  const { axis } = FACE_META[axisFace]

  for (const direction of [1, -1] as const) {
    const rotated = rotateVec(
      FACE_NORMALS[fromFace],
      axis,
      getQuarterTurns({ face: axisFace, direction })
    )
    const target = FACE_NORMALS[toFace]

    if (
      rotated.x === target.x &&
      rotated.y === target.y &&
      rotated.z === target.z
    ) {
      return direction
    }
  }

  return 1
}

export const actionToLayerMove = (
  direction: LayerTurnDirection,
  layers: number[],
  viewerMap: ViewerFaceMap
): CubeMove | null => {
  if (direction === "left" || direction === "right") {
    const face = viewerMap.up
    const toFace = direction === "left" ? viewerMap.left : viewerMap.right

    return {
      face,
      direction: findDirection(face, viewerMap.front, toFace),
      layers,
    }
  }

  if (direction === "up" || direction === "down") {
    const face = viewerMap.left
    const toFace = direction === "up" ? viewerMap.up : viewerMap.down

    return {
      face,
      direction: findDirection(face, viewerMap.front, toFace),
      layers,
    }
  }

  return null
}

export const actionToFaceTurnMove = (
  direction: LayerTurnDirection,
  layers: number[],
  viewerMap: ViewerFaceMap
): CubeMove | null => {
  const face = viewerMap.front

  if (direction === "up" || direction === "down") {
    const toFace = direction === "up" ? viewerMap.up : viewerMap.down

    return {
      face,
      direction: findDirection(face, viewerMap.right, toFace),
      layers,
    }
  }

  const toFace = direction === "left" ? viewerMap.left : viewerMap.right

  return {
    face,
    direction: findDirection(face, viewerMap.up, toFace),
    layers,
  }
}

export const actionToViewMove = (
  direction: ViewDirection,
  viewerMap: ViewerFaceMap
): CubeMove | null => {
  if (direction === "left")
    return { face: viewerMap.up, direction: -1, entire: true }
  if (direction === "right")
    return { face: viewerMap.up, direction: 1, entire: true }
  if (direction === "up")
    return { face: viewerMap.right, direction: -1, entire: true }
  if (direction === "down")
    return { face: viewerMap.right, direction: 1, entire: true }
  return null
}

export const actionToNotationMove = (
  turn: NotationTurn,
  layers: number[],
  viewerMap: ViewerFaceMap
): CubeMove | null => {
  if (turn === "R") return { face: viewerMap.right, direction: 1, layers }
  if (turn === "RPrime") return { face: viewerMap.right, direction: -1, layers }
  if (turn === "L") return { face: viewerMap.left, direction: 1, layers }
  if (turn === "LPrime") return { face: viewerMap.left, direction: -1, layers }
  if (turn === "U") return { face: viewerMap.up, direction: 1, layers }
  if (turn === "UPrime") return { face: viewerMap.up, direction: -1, layers }
  if (turn === "D") return { face: viewerMap.down, direction: 1, layers }
  if (turn === "DPrime") return { face: viewerMap.down, direction: -1, layers }
  if (turn === "F") return { face: viewerMap.front, direction: 1, layers }
  if (turn === "FPrime") return { face: viewerMap.front, direction: -1, layers }
  if (turn === "B") return { face: viewerMap.back, direction: 1, layers }
  if (turn === "BPrime") return { face: viewerMap.back, direction: -1, layers }

  return null
}
