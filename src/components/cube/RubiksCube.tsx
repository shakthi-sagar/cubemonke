import { Billboard, RoundedBox, Text } from '@react-three/drei'
import { memo, useMemo } from 'react'

import { FACE_COLORS, FACE_META, FACE_NORMALS, getTurnAngle, isCubieInMove } from '@/lib/cube'
import type { ActiveTurn, CanonicalFace, CubeState, CubieState, Sticker as StickerType, Vec3, ViewerFaceMap } from '@/types/cube'

const CUBIE_GAP = 1.005
const STICKER_OFFSET = 0.502
const STICKER_SIZE = 0.74
const BLACK_PLASTIC = '#24272d'

const normalToArray = (normal: Vec3, scale = 1): [number, number, number] => [
  normal.x * scale,
  normal.y * scale,
  normal.z * scale,
]

const positionToArray = (position: Vec3): [number, number, number] => [
  position.x * CUBIE_GAP,
  position.y * CUBIE_GAP,
  position.z * CUBIE_GAP,
]

const stickerRotation = (normal: Vec3): [number, number, number] => {
  if (normal.z === 1) return [0, 0, 0]
  if (normal.z === -1) return [0, Math.PI, 0]
  if (normal.x === 1) return [0, Math.PI / 2, 0]
  if (normal.x === -1) return [0, -Math.PI / 2, 0]
  if (normal.y === 1) return [-Math.PI / 2, 0, 0]
  return [Math.PI / 2, 0, 0]
}

const Sticker = memo(function Sticker({ sticker, colors }: { sticker: StickerType; colors: Record<CanonicalFace, string> }) {
  const color = colors[sticker.face] || sticker.color
  return (
    <mesh position={normalToArray(sticker.normal, STICKER_OFFSET)} rotation={stickerRotation(sticker.normal)}>
      <planeGeometry args={[STICKER_SIZE, STICKER_SIZE]} />
      <meshBasicMaterial color={color} toneMapped={false} />
    </mesh>
  )
})

const Cubie = memo(function Cubie({ cubie, colors }: { cubie: CubieState; colors: Record<CanonicalFace, string> }) {
  return (
    <group position={positionToArray(cubie.position)}>
      <RoundedBox args={[0.985, 0.985, 0.985]} radius={0.045} smoothness={5} castShadow receiveShadow>
        <meshPhysicalMaterial color={BLACK_PLASTIC} roughness={0.42} metalness={0.04} clearcoat={0.35} clearcoatRoughness={0.48} />
      </RoundedBox>
      {cubie.stickers.map((sticker) => (
        <Sticker
          key={`${cubie.id}:${sticker.face}:${sticker.normal.x}:${sticker.normal.y}:${sticker.normal.z}`}
          sticker={sticker}
          colors={colors}
        />
      ))}
    </group>
  )
})

const TurnLayer = memo(function TurnLayer({ cube, size, activeTurn, colors }: { cube: CubeState; size: number; activeTurn: ActiveTurn; colors: Record<CanonicalFace, string> }) {
  const { axis } = FACE_META[activeTurn.move.face]
  const rotation: [number, number, number] = [0, 0, 0]
  rotation[axis === 'x' ? 0 : axis === 'y' ? 1 : 2] = getTurnAngle(activeTurn.move, activeTurn.progress)

  return (
    <group rotation={rotation}>
      {cube
        .filter((cubie) => isCubieInMove(cubie.position, size, activeTurn.move))
        .map((cubie) => (
          <Cubie key={cubie.id} cubie={cubie} colors={colors} />
        ))}
    </group>
  )
})

export const RubiksCube = memo(function RubiksCube({
  cube,
  size,
  activeTurn,
  colors = FACE_COLORS,
}: {
  cube: CubeState
  size: number
  activeTurn: ActiveTurn | null
  colors?: Record<CanonicalFace, string>
}) {
  const restingCubies = activeTurn
    ? cube.filter((cubie) => !isCubieInMove(cubie.position, size, activeTurn.move))
    : cube

  return (
    <group>
      {restingCubies.map((cubie) => (
        <Cubie key={cubie.id} cubie={cubie} colors={colors} />
      ))}
      {activeTurn ? <TurnLayer cube={cube} size={size} activeTurn={activeTurn} colors={colors} /> : null}
    </group>
  )
})

export const FaceLabels = memo(function FaceLabels({ size, viewerMap }: { size: number; viewerMap: ViewerFaceMap }) {
  const canonicalLabels = useMemo(() => {
    const entries = Object.entries(viewerMap) as Array<[keyof ViewerFaceMap, CanonicalFace]>
    return new Map(entries.map(([relative, face]) => [face, relative.toUpperCase()]))
  }, [viewerMap])

  const labelDistance = size / 2 + 0.68

  return (
    <group>
      {(Object.keys(FACE_NORMALS) as CanonicalFace[]).map((face) => {
        const normal = FACE_NORMALS[face]
        const isPrimary = face === viewerMap.front || face === viewerMap.right || face === viewerMap.up
        const label = canonicalLabels.get(face) ?? face
        const color = face === viewerMap.front ? '#7dd3fc' : isPrimary ? '#fbbf24' : '#64748b'

        return (
          <Billboard key={face} position={normalToArray(normal, labelDistance)}>
            <Text
              fontSize={isPrimary ? 0.16 : 0.115}
              anchorX="center"
              anchorY="middle"
              color={color}
              outlineWidth={0.004}
              outlineColor="#020617"
            >
              {label}
            </Text>
          </Billboard>
        )
      })}
    </group>
  )
})
