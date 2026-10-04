import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import {
  KEYBINDING_META,
  getKeyboardBindingChord,
  keyButtonFromEvent,
  keyChordId,
  keyboardBindingContext,
  normalizeKeyChord,
  setKeyboardBindingChord,
  type KeyButton,
  type KeyboardBindingId,
  type KeyChord,
  type KeyboardSettings,
  type SpeedcubeSettings,
} from "@/lib/settings"

type UseKeyRecorderArgs = {
  keyboard: KeyboardSettings
  updateSettings: (settings: Partial<SpeedcubeSettings>) => void
}

export function useKeyRecorder({
  keyboard,
  updateSettings,
}: UseKeyRecorderArgs) {
  const [recordingBinding, setRecordingBinding] =
    useState<KeyboardBindingId | null>(null)
  const [recordingChord, setRecordingChord] = useState<KeyChord>([])
  const pressedChordRef = useRef(new Map<string, KeyButton>())
  const bestChordRef = useRef<KeyChord>([])
  const metaById = useMemo(
    () => new Map(KEYBINDING_META.map((item) => [item.id, item])),
    []
  )

  const setRecorderBinding = useCallback(
    (bindingId: KeyboardBindingId | null) => {
      pressedChordRef.current.clear()
      bestChordRef.current = []
      setRecordingChord([])
      setRecordingBinding(bindingId)
    },
    []
  )

  useEffect(() => {
    if (!recordingBinding) return

    const commitChord = () => {
      const chord = normalizeKeyChord(bestChordRef.current)
      if (chord.length === 0) return

      updateSettings({
        keyboard: {
          ...keyboard,
          bindings: setKeyboardBindingChord(
            keyboard.bindings,
            recordingBinding,
            chord
          ),
        },
      })
    }

    const onKeyDown = (event: KeyboardEvent) => {
      event.preventDefault()
      event.stopPropagation()

      if (event.key === "Escape") {
        setRecorderBinding(null)
        return
      }

      const button = keyButtonFromEvent(event)
      pressedChordRef.current.set(button.code, button)

      const chord = normalizeKeyChord([...pressedChordRef.current.values()])
      if (chord.length >= bestChordRef.current.length) {
        bestChordRef.current = chord
      }

      setRecordingChord(chord)
    }

    const onKeyUp = (event: KeyboardEvent) => {
      event.preventDefault()
      event.stopPropagation()

      const button = keyButtonFromEvent(event)
      pressedChordRef.current.delete(button.code)

      const chord = normalizeKeyChord([...pressedChordRef.current.values()])
      setRecordingChord(chord)

      if (chord.length === 0 && bestChordRef.current.length > 0) {
        commitChord()
        setRecorderBinding(null)
      }
    }

    const onBlur = () => setRecorderBinding(null)

    window.addEventListener("keydown", onKeyDown, true)
    window.addEventListener("keyup", onKeyUp, true)
    window.addEventListener("blur", onBlur)
    return () => {
      window.removeEventListener("keydown", onKeyDown, true)
      window.removeEventListener("keyup", onKeyUp, true)
      window.removeEventListener("blur", onBlur)
    }
  }, [keyboard, recordingBinding, setRecorderBinding, updateSettings])

  const bindingConflict = useCallback(
    (bindingId: KeyboardBindingId) => {
      const chord = getKeyboardBindingChord(keyboard.bindings, bindingId)
      if (!chord) return null

      const context = keyboardBindingContext(bindingId)
      const conflict = KEYBINDING_META.find((candidate) => {
        if (candidate.id === bindingId) return false
        if (keyboardBindingContext(candidate.id) !== context) return false

        const candidateChord = getKeyboardBindingChord(
          keyboard.bindings,
          candidate.id
        )
        return (
          candidateChord && keyChordId(candidateChord) === keyChordId(chord)
        )
      })

      return conflict ? metaById.get(conflict.id)?.label : null
    },
    [keyboard.bindings, metaById]
  )

  return {
    recordingBinding,
    recordingChord,
    setRecorderBinding,
    bindingConflict,
  }
}
