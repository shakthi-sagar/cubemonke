import { Keyboard } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DEFAULT_KEYBOARD_SETTINGS,
  KEYBINDING_META,
  getKeyboardBindingChord,
  type KeyboardBindingId,
  type KeyboardSettings,
  type KeyChord,
  type SpeedcubeSettings,
} from "@/lib/settings"
import { KeyRecorder } from "@/pages/settings/components/KeyRecorder"

const VISUAL_KEYBINDING_GROUPS = [
  "Layer selectors",
  "Layer turns",
  "Face modifier",
  "Face change",
] as const
const NOTATION_KEYBINDING_GROUPS = [
  "Layer selectors",
  "Notation turns",
  "Face change",
] as const

type KeybindingsSectionProps = {
  keyboard: KeyboardSettings
  recordingBinding: KeyboardBindingId | null
  recordingChord: KeyChord
  updateSettings: (settings: Partial<SpeedcubeSettings>) => void
  setRecorderBinding: (bindingId: KeyboardBindingId | null) => void
  bindingConflict: (bindingId: KeyboardBindingId) => string | null | undefined
}

export function KeybindingsSection({
  keyboard,
  recordingBinding,
  recordingChord,
  updateSettings,
  setRecorderBinding,
  bindingConflict,
}: KeybindingsSectionProps) {
  const resetKeybindings = () => {
    updateSettings({ keyboard: DEFAULT_KEYBOARD_SETTINGS })
    setRecorderBinding(null)
  }

  return (
    <section className="rounded-lg border border-border bg-card/40 p-6 shadow-sm backdrop-blur-md">
      <div className="flex items-center justify-between gap-4 border-b border-border/40 pb-4">
        <h2 className="flex items-center gap-2 text-sm font-bold">
          <Keyboard className="h-4 w-4 text-primary" /> Keybinding Mapper
        </h2>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={resetKeybindings}
        >
          Reset Keys
        </Button>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() =>
            updateSettings({ keyboard: { ...keyboard, layout: "visual" } })
          }
          className={`rounded-lg border p-4 text-left transition-colors ${
            keyboard.layout === "visual"
              ? "border-primary bg-primary/10 text-foreground"
              : "border-border bg-background/30 text-muted-foreground hover:border-primary/50 hover:text-foreground"
          }`}
        >
          <span className="block text-xs font-bold tracking-wider uppercase">
            Visual Layer Controls
          </span>
          <span className="mt-1 block text-[11px] leading-relaxed">
            Hold numbers to target layers. Arrows move held layers or change
            faces.
          </span>
        </button>
        <button
          type="button"
          onClick={() =>
            updateSettings({ keyboard: { ...keyboard, layout: "notation" } })
          }
          className={`rounded-lg border p-4 text-left transition-colors ${
            keyboard.layout === "notation"
              ? "border-primary bg-primary/10 text-foreground"
              : "border-border bg-background/30 text-muted-foreground hover:border-primary/50 hover:text-foreground"
          }`}
        >
          <span className="block text-xs font-bold tracking-wider uppercase">
            Cube Notation Controls
          </span>
          <span className="mt-1 block text-[11px] leading-relaxed">
            Use R/F/U/L/D/B with Shift for prime turns. Hold numbers to target
            layers.
          </span>
        </button>
      </div>

      <div className="mt-6 space-y-5">
        {(keyboard.layout === "visual"
          ? VISUAL_KEYBINDING_GROUPS
          : NOTATION_KEYBINDING_GROUPS
        ).map((group) => (
          <div key={group} className="space-y-2">
            <div className="text-[10px] font-black tracking-[0.22em] text-muted-foreground uppercase">
              {group}
            </div>
            <div className="grid gap-2 md:grid-cols-2">
              {KEYBINDING_META.filter((item) => item.group === group).map(
                (item) => {
                  const chord = getKeyboardBindingChord(
                    keyboard.bindings,
                    item.id
                  )
                  if (!chord) return null

                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background/30 p-3"
                    >
                      <div>
                        <div className="text-xs font-bold">{item.label}</div>
                        <div className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
                          {item.description}
                        </div>
                      </div>
                      <KeyRecorder
                        bindingId={item.id}
                        chord={chord}
                        liveChord={recordingChord}
                        conflictLabel={bindingConflict(item.id) ?? undefined}
                        recordingBinding={recordingBinding}
                        onRecordStart={setRecorderBinding}
                      />
                    </div>
                  )
                }
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
