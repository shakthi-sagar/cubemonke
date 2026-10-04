import { SegmentedSelector } from "@/components/event/SegmentedSelector"
import { MODE_OPTIONS, type ModeId } from "@/lib/events"

type ModeSelectorProps = {
  value: ModeId
  options?: readonly { id: ModeId; label: string }[]
  onChange: (value: ModeId) => void
  showLabel?: boolean
  disabled?: boolean
}

export function ModeSelector({
  value,
  options = MODE_OPTIONS,
  onChange,
  showLabel = true,
  disabled = false,
}: ModeSelectorProps) {
  return (
    <SegmentedSelector
      label="Mode"
      value={value}
      options={options}
      onChange={onChange}
      showLabel={showLabel}
      disabled={disabled}
    />
  )
}
