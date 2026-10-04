import { Download, Upload } from 'lucide-react'
import { useRef, useState } from 'react'

import { Button } from '@/components/ui/button'

type ImportExportSectionProps = {
  importSettings: (text: string) => void
  exportSettings: () => string
}

export function ImportExportSection({
  importSettings,
  exportSettings,
}: ImportExportSectionProps) {
  const [importError, setImportError] = useState<string | null>(null)
  const importInputRef = useRef<HTMLInputElement | null>(null)

  const exportCurrentSettings = () => {
    const blob = new Blob([exportSettings()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'cubemonke-settings.json'
    link.click()
    URL.revokeObjectURL(url)
  }

  const applyImportedSettings = async (file: File | undefined) => {
    if (!file) return

    try {
      importSettings(await file.text())
      setImportError(null)
    } catch (error) {
      setImportError(error instanceof Error ? error.message : 'Invalid settings JSON.')
    }
  }

  return (
    <div className="flex flex-col gap-2 sm:items-end">
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          aria-label="Export settings"
          title="Export settings"
          className="h-10 w-10 px-0 sm:w-auto sm:px-6"
          onClick={exportCurrentSettings}
        >
          <Download className="h-4 w-4" />
          <span className="hidden sm:inline">Export</span>
        </Button>
        <Button
          type="button"
          aria-label="Import settings"
          title="Import settings"
          className="h-10 w-10 px-0 sm:w-auto sm:px-6"
          onClick={() => importInputRef.current?.click()}
        >
          <Upload className="h-4 w-4" />
          <span className="hidden sm:inline">Import</span>
        </Button>
      </div>

      <input
        ref={importInputRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={(event) => {
          void applyImportedSettings(event.target.files?.[0])
          event.currentTarget.value = ''
        }}
      />
      {importError ? <div className="text-xs font-medium text-destructive">{importError}</div> : null}
    </div>
  )
}
