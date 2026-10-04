import { SettingsPreviewCube } from "@/components/settings/SettingsPreviewCube"
import { useSpeedcubeSettings } from "@/hooks/useSpeedcubeSettings"
import { CameraViewportSection } from "@/pages/settings/components/CameraViewportSection"
import { CubeColorsSection } from "@/pages/settings/components/CubeColorsSection"
import { ImportExportSection } from "@/pages/settings/components/ImportExportSection"
import { KeybindingsSection } from "@/pages/settings/components/KeybindingsSection"
import { TurnSpeedSection } from "@/pages/settings/components/TurnSpeedSection"
import { useKeyRecorder } from "@/pages/settings/hooks/useKeyRecorder"

export function SettingsPage() {
  const { settings, updateSettings, importSettings, exportSettings } =
    useSpeedcubeSettings()
  const {
    recordingBinding,
    recordingChord,
    setRecorderBinding,
    bindingConflict,
  } = useKeyRecorder({
    keyboard: settings.keyboard,
    updateSettings,
  })

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-4 md:p-6">
      <div className="flex flex-col gap-5 rounded-lg border border-border bg-card/40 p-6 shadow-sm backdrop-blur-md lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-black tracking-tight">Settings</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Tune your cube controls, colors, camera view, and saved preferences.
          </p>
        </div>
        <ImportExportSection
          importSettings={importSettings}
          exportSettings={exportSettings}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <TurnSpeedSection
            turnSpeed={settings.turnSpeed}
            updateSettings={updateSettings}
          />
          <CameraViewportSection
            cameraViewport={settings.cameraViewport}
            updateSettings={updateSettings}
          />
          <CubeColorsSection
            cubeColors={settings.cubeColors}
            updateSettings={updateSettings}
          />
        </div>

        <div className="space-y-6">
          <SettingsPreviewCube
            settings={settings}
            keyboardEnabled={recordingBinding === null}
          />
        </div>
      </div>

      <KeybindingsSection
        keyboard={settings.keyboard}
        recordingBinding={recordingBinding}
        recordingChord={recordingChord}
        updateSettings={updateSettings}
        setRecorderBinding={setRecorderBinding}
        bindingConflict={bindingConflict}
      />
    </div>
  )
}

export default SettingsPage
