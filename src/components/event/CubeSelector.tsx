import { SegmentedSelector } from "@/components/event/SegmentedSelector"
import { CUBE_OPTIONS, type CubeId } from "@/lib/events"

export function CubeSelector({
  value,
  onChange,
  showLabel = true,
  disabled = false,
}: {
  value: CubeId
  onChange: (value: CubeId) => void
  showLabel?: boolean
  disabled?: boolean
}) {
  return (
    <SegmentedSelector
      label="Cube"
      value={value}
      options={CUBE_OPTIONS}
      onChange={onChange}
      showLabel={showLabel}
      disabled={disabled}
    />
  )
}
