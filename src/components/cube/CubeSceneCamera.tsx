import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'

import {
  DEFAULT_CAMERA_TARGET,
  DEFAULT_CAMERA_UP,
} from '@/components/cube/cubeSceneConstants'
import type { ReplayCameraState } from '@/lib/replays'

const sameTuple = (a: [number, number, number] | null, b: [number, number, number]) =>
  a !== null && a[0] === b[0] && a[1] === b[1] && a[2] === b[2]

const sameOptionalTuple = (a: [number, number, number] | null, b: [number, number, number] | undefined) =>
  a !== null && b !== undefined && a[0] === b[0] && a[1] === b[1] && a[2] === b[2]

export function CameraUpdater({
  position,
  target,
  up = DEFAULT_CAMERA_UP,
  resetKey = 0,
}: {
  position: [number, number, number]
  target: [number, number, number]
  up?: [number, number, number]
  resetKey?: number
}) {
  const { camera, controls } = useThree()
  const previousPosition = useRef<[number, number, number] | null>(null)
  const previousTarget = useRef<[number, number, number] | null>(null)
  const previousUp = useRef<[number, number, number] | null>(null)
  const previousResetKey = useRef<number | null>(null)

  useEffect(() => {
    if (
      previousResetKey.current === resetKey &&
      sameTuple(previousPosition.current, position) &&
      sameTuple(previousTarget.current, target) &&
      sameOptionalTuple(previousUp.current, up)
    ) {
      return
    }

    previousPosition.current = [...position]
    previousTarget.current = [...target]
    previousUp.current = [...up]
    previousResetKey.current = resetKey

    camera.position.set(position[0], position[1], position[2])
    camera.up.set(up[0], up[1], up[2]).normalize()
    camera.lookAt(target[0], target[1], target[2])
    if (controls) {
      const orbitControls = controls as unknown as { target: THREE.Vector3; update: () => void }
      orbitControls.target.set(target[0], target[1], target[2])
      orbitControls.update()
    }
  }, [position, target, up, resetKey, camera, controls])

  return null
}

const roundCameraTuple = (value: THREE.Vector3): [number, number, number] => [
  Number(value.x.toFixed(3)),
  Number(value.y.toFixed(3)),
  Number(value.z.toFixed(3)),
]

const cameraStateId = (camera: ReplayCameraState) => [...camera.position, ...camera.target, ...(camera.up ?? [])].join(':')

export function CameraReporter({ onChange }: { onChange?: (camera: ReplayCameraState) => void }) {
  const { camera, controls } = useThree()
  const previous = useRef("")
  const lastReportedAt = useRef(0)

  useFrame(({ clock }) => {
    if (!onChange) return

    const orbitControls = controls as unknown as { target?: THREE.Vector3 } | null
    const state: ReplayCameraState = {
      position: roundCameraTuple(camera.position),
      target: orbitControls?.target ? roundCameraTuple(orbitControls.target) : DEFAULT_CAMERA_TARGET,
      up: roundCameraTuple(camera.up),
    }
    const nextId = cameraStateId(state)
    const now = clock.elapsedTime * 1000

    if (nextId === previous.current || now - lastReportedAt.current < 120) {
      return
    }

    previous.current = nextId
    lastReportedAt.current = now
    onChange(state)
  })

  return null
}
