export function StageLights() {
  return (
    <>
      <ambientLight intensity={0.72} />
      <directionalLight castShadow position={[4, 6, 5]} intensity={1.15} shadow-mapSize={[1024, 1024]} />
      <directionalLight position={[-5, 3, -4]} intensity={0.35} />
    </>
  )
}
