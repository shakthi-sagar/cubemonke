import { useCallback, useEffect, useRef, useState } from 'react'

import {
  DEFAULT_SPEEDCUBE_SETTINGS,
  SETTINGS_STORAGE_KEY,
  normalizeSettings,
  readSpeedcubeSettings,
  type SpeedcubeSettings,
} from '@/lib/settings'
import { dbProvider } from '@/lib/data'

const settingsSnapshot = (settings: SpeedcubeSettings) =>
  JSON.stringify(normalizeSettings(settings))

export function useSpeedcubeSettings() {
  const [settings, setSettings] = useState<SpeedcubeSettings>(() => readSpeedcubeSettings())
  const [hasLoadedSettings, setHasLoadedSettings] = useState(false)
  const persistedSettingsRef = useRef(settingsSnapshot(settings))

  useEffect(() => {
    let isMounted = true

    dbProvider.settings
      .get()
      .then((savedSettings) => {
        if (!isMounted) return
        const normalizedSettings = normalizeSettings(savedSettings)
        persistedSettingsRef.current = settingsSnapshot(normalizedSettings)
        setSettings(normalizedSettings)
      })
      .catch(() => {
        if (!isMounted) return
        const cachedSettings = readSpeedcubeSettings()
        persistedSettingsRef.current = settingsSnapshot(cachedSettings)
        setSettings(cachedSettings)
      })
      .finally(() => {
        if (!isMounted) return
        setHasLoadedSettings(true)
      })

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    if (!hasLoadedSettings) return

    const nextSnapshot = settingsSnapshot(settings)
    if (nextSnapshot === persistedSettingsRef.current) return

    void dbProvider.settings
      .save(settings)
      .then(() => {
        persistedSettingsRef.current = nextSnapshot
      })
      .catch(() => {
        // Settings sync should not block solving.
      })
  }, [hasLoadedSettings, settings])

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.storageArea !== window.localStorage || event.key !== SETTINGS_STORAGE_KEY) return
      try {
        const nextSettings = normalizeSettings(event.newValue ? JSON.parse(event.newValue) : null)
        persistedSettingsRef.current = settingsSnapshot(nextSettings)
        setSettings(nextSettings)
      } catch {
        persistedSettingsRef.current = settingsSnapshot(DEFAULT_SPEEDCUBE_SETTINGS)
        setSettings(DEFAULT_SPEEDCUBE_SETTINGS)
      }
    }

    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const updateSettings = useCallback((next: Partial<SpeedcubeSettings>) => {
    setSettings((current) => normalizeSettings({ ...current, ...next }))
  }, [])

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SPEEDCUBE_SETTINGS)
  }, [])

  const importSettings = useCallback((text: string) => {
    const parsed = JSON.parse(text)
    setSettings(normalizeSettings(parsed))
  }, [])

  const exportSettings = useCallback(() => JSON.stringify(settings, null, 2), [settings])

  return {
    settings,
    setSettings,
    updateSettings,
    resetSettings,
    importSettings,
    exportSettings,
  }
}
