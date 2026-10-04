import {
  keyChordLabel,
  type KeyboardBindingId,
  type KeyChord,
} from "@/lib/settings"

type KeyRecorderProps = {
  bindingId: KeyboardBindingId
  chord: KeyChord
  liveChord: KeyChord
  conflictLabel?: string
  recordingBinding: KeyboardBindingId | null
  onRecordStart: (bindingId: KeyboardBindingId | null) => void
}

export function KeyRecorder({
  bindingId,
  chord,
  liveChord,
  conflictLabel,
  recordingBinding,
  onRecordStart,
}: KeyRecorderProps) {
  const isRecording = recordingBinding === bindingId
  const label = isRecording
    ? liveChord.length > 0
      ? keyChordLabel(liveChord)
      : "Press keys..."
    : keyChordLabel(chord)

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        className={`min-w-32 rounded-md border px-3 py-2 text-xs font-bold transition-colors ${
          isRecording
            ? "border-primary bg-primary text-primary-foreground"
            : conflictLabel
              ? "border-destructive/50 bg-destructive/10 text-destructive"
              : "border-border bg-muted/35 hover:border-primary/50 hover:bg-muted"
        }`}
        onClick={() => onRecordStart(isRecording ? null : bindingId)}
      >
        {label}
      </button>
      {conflictLabel ? (
        <span className="text-[10px] font-medium text-destructive">
          Conflicts with {conflictLabel}
        </span>
      ) : null}
    </div>
  )
}
