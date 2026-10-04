import { useFrame, useThree } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'

import { FACE_NORMALS, OPPOSITE_FACES } from '@/lib/cube'
import type { CanonicalFace, CubeState, Vec3, ViewerFaceMap } from '@/types/cube'

const INITIAL_VIEWER_MAP: ViewerFaceMap = {
  front: 'F',
  back: 'B',
  right: 'R',
  left: 'L',
  up: 'U',
  down: 'D',
}

const sameMap = (a: ViewerFaceMap, b: ViewerFaceMap) =>
  a.front === b.front &&
  a.back === b.back &&
  a.right === b.right &&
  a.left === b.left &&
  a.up === b.up &&
  a.down === b.down

const toVector = (normal: Vec3) => new THREE.Vector3(normal.x, normal.y, normal.z)

const getCenterStickerNormals = (cube: CubeState, size: number): Partial<Record<CanonicalFace, THREE.Vector3>> => {
  if (size % 2 === 0) return {}

  const maxCoord = (size - 1) / 2
  const centers: Partial<Record<CanonicalFace, THREE.Vector3>> = {}

  // Match v1's stable center-sticker behavior for odd cubes. Non-center stickers move during scrambles.
  for (const cubie of cube) {
    const { x, y, z } = cubie.position
    const centerFace = (Object.keys(FACE_NORMALS) as CanonicalFace[]).find((face) => {
      const normal = FACE_NORMALS[face]
      return x === normal.x * maxCoord && y === normal.y * maxCoord && z === normal.z * maxCoord
    })
    const centerSticker = centerFace ? cubie.stickers.find((sticker) => sticker.face === centerFace) : null
    if (centerFace && centerSticker) centers[centerFace] = toVector(centerSticker.normal)
  }

  return centers
}

const getRotatedFaceNormals = (cube: CubeState, size: number): Record<CanonicalFace, THREE.Vector3> => {
  const centerNormals = getCenterStickerNormals(cube, size)

  return {
    F: centerNormals.F ?? toVector(FACE_NORMALS.F),
    B: centerNormals.B ?? toVector(FACE_NORMALS.B),
    R: centerNormals.R ?? toVector(FACE_NORMALS.R),
    L: centerNormals.L ?? toVector(FACE_NORMALS.L),
    U: centerNormals.U ?? toVector(FACE_NORMALS.U),
    D: centerNormals.D ?? toVector(FACE_NORMALS.D),
  }
}

export function ViewerFaceTracker({
  cube,
  size,
  onChange,
}: {
  cube: CubeState
  size: number
  onChange: (map: ViewerFaceMap) => void
}) {
  const { camera } = useThree()
  const previous = useRef<ViewerFaceMap>(INITIAL_VIEWER_MAP)

  useFrame(() => {
    camera.updateMatrixWorld()

    const fromOriginToCamera = camera.position.clone().normalize()
    const cameraRight = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 0).normalize()
    const cameraUp = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 1).normalize()

    const rotatedNormals = getRotatedFaceNormals(cube, size)
    const normalVectors = Object.entries(rotatedNormals).map(([face, vector]) => ({
      face: face as CanonicalFace,
      vector,
    }))

    const chooseFaceRotated = (direction: THREE.Vector3, exclude = new Set<CanonicalFace>()) => {
      let best: CanonicalFace = 'F'
      let bestScore = -Infinity

      for (const item of normalVectors) {
        if (exclude.has(item.face)) continue
        const score = item.vector.dot(direction)
        if (score > bestScore) {
          bestScore = score
          best = item.face
        }
      }

      return best
    }

    const front = chooseFaceRotated(fromOriginToCamera)
    const back = OPPOSITE_FACES[front]
    const right = chooseFaceRotated(cameraRight, new Set([front, back]))
    const left = OPPOSITE_FACES[right]
    const up = chooseFaceRotated(cameraUp, new Set([front, back, right, left]))
    const down = OPPOSITE_FACES[up]
    const next = { front, back, right, left, up, down }

    if (!sameMap(previous.current, next)) {
      previous.current = next
      onChange(next)
    }
  })

  return null
}
