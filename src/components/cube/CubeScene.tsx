import { OrbitControls } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { memo, Suspense } from 'react'
import * as THREE from 'three'

import {
  CameraReporter,
  CameraUpdater,
} from '@/components/cube/CubeSceneCamera'
import {
  DEFAULT_CAMERA_POSITION,
  DEFAULT_CAMERA_TARGET,
  MAX_CAMERA_DISTANCE,
  MIN_CAMERA_DISTANCE,
} from '@/components/cube/cubeSceneConstants'
import { FaceLabels, RubiksCube } from '@/components/cube/RubiksCube'
import { StageLights } from '@/components/cube/StageLights'
import { ViewerFaceTracker } from '@/components/cube/ViewerFaceTracker'
import type { ReplayCameraState } from '@/lib/replays'
import type { ActiveTurn, CanonicalFace, CubeState, ViewerFaceMap } from '@/types/cube'

export const CubeScene = memo(function CubeScene({
  cube,
  size,
  activeTurn,
  viewerMap,
  onViewerMapChange,
  showLabels = true,
  colors,
  cameraPosition = DEFAULT_CAMERA_POSITION,
  cameraTarget = DEFAULT_CAMERA_TARGET,
  cameraUp,
  cameraResetKey = 0,
  onCameraChange,
  interactive = true,
}: {
  cube: CubeState
  size: number
  activeTurn: ActiveTurn | null
  viewerMap: ViewerFaceMap
  onViewerMapChange: (map: ViewerFaceMap) => void
  showLabels?: boolean
  colors?: Record<CanonicalFace, string>
  cameraPosition?: [number, number, number]
  cameraTarget?: [number, number, number]
  cameraUp?: [number, number, number]
  cameraResetKey?: number
  onCameraChange?: (camera: ReplayCameraState) => void
  interactive?: boolean
}) {
  return (
    <Canvas camera={{ position: cameraPosition, fov: 39 }} shadows={{ type: THREE.PCFShadowMap }} dpr={[1, 1.75]} gl={{ alpha: true }}>
      <StageLights />
      <Suspense fallback={null}>
        <group>
          <RubiksCube cube={cube} size={size} activeTurn={activeTurn} colors={colors} />
          {showLabels ? <FaceLabels size={size} viewerMap={viewerMap} /> : null}
        </group>
      </Suspense>
      <OrbitControls enabled={interactive} enablePan={false} minDistance={MIN_CAMERA_DISTANCE} maxDistance={MAX_CAMERA_DISTANCE} rotateSpeed={0.7} target={cameraTarget} />
      <CameraUpdater position={cameraPosition} target={cameraTarget} up={cameraUp} resetKey={cameraResetKey} />
      <CameraReporter onChange={onCameraChange} />
      <ViewerFaceTracker cube={cube} size={size} onChange={onViewerMapChange} />
    </Canvas>
  )
})
