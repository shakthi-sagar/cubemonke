export type CameraViewport = {
  azimuth: number
  elevation: number
}

export const cameraPositionFromViewport = (
  viewport: CameraViewport,
  distance = 15,
  target: [number, number, number] = [0, -0.4, 0],
): [number, number, number] => {
  const azimuth = (viewport.azimuth * Math.PI) / 180
  const elevation = (viewport.elevation * Math.PI) / 180
  const horizontalDistance = Math.cos(elevation) * distance

  return [
    target[0] + Math.sin(azimuth) * horizontalDistance,
    target[1] + Math.sin(elevation) * distance,
    target[2] + Math.cos(azimuth) * horizontalDistance,
  ]
}

export const cameraUpFromViewport = (
  viewport: CameraViewport,
): [number, number, number] => {
  const azimuth = (viewport.azimuth * Math.PI) / 180
  const elevation = (viewport.elevation * Math.PI) / 180

  return [
    -Math.sin(azimuth) * Math.sin(elevation),
    Math.cos(elevation),
    -Math.cos(azimuth) * Math.sin(elevation),
  ]
}
