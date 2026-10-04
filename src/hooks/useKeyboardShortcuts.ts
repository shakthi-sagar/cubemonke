import { useEffect, useLayoutEffect, useMemo, useRef } from "react"

import {
  DEFAULT_KEYBOARD_SETTINGS,
  keyButtonFromEvent,
  type KeyButton,
  type KeyboardSettings,
} from "@/lib/settings"
import type { CubeMove, ViewerFaceMap } from "@/types/cube"
import {
  createShortcutBindingIndex,
  type ShortcutBindingIndex,
} from "@/hooks/keyboardShortcuts/bindings"
import { resolveKeyboardShortcut } from "@/hooks/keyboardShortcuts/resolver"

type ActiveMoveContext = {
  keyCode: string
}

type ShortcutRuntime = {
  cubeSize: number
  viewerMap: ViewerFaceMap
  onMove: (move: CubeMove) => void
  enabled: boolean
  bindingIndex: ShortcutBindingIndex
  keyboardSettings: KeyboardSettings
}

const isTypingTarget = (target: EventTarget | null) => {
  const element = target as HTMLElement | null
  return (
    element?.tagName === "INPUT" ||
    element?.tagName === "TEXTAREA" ||
    element?.isContentEditable
  )
}

export function useKeyboardShortcuts(
  cubeSize: number,
  viewerMap: ViewerFaceMap,
  onMove: (move: CubeMove) => void,
  enabled = true,
  keyboardSettings: KeyboardSettings = DEFAULT_KEYBOARD_SETTINGS
) {
  const bindingIndex = useMemo(
    () => createShortcutBindingIndex(keyboardSettings.bindings),
    [keyboardSettings.bindings]
  )
  const pressedKeysRef = useRef(new Map<string, KeyButton>())
  const activeMoveContextRef = useRef<ActiveMoveContext | null>(null)
  const runtimeRef = useRef<ShortcutRuntime>({
    cubeSize,
    viewerMap,
    onMove,
    enabled,
    bindingIndex,
    keyboardSettings,
  })

  useLayoutEffect(() => {
    runtimeRef.current = {
      cubeSize,
      viewerMap,
      onMove,
      enabled,
      bindingIndex,
      keyboardSettings,
    }
  }, [bindingIndex, cubeSize, enabled, keyboardSettings, onMove, viewerMap])

  useEffect(() => {
    if (enabled) return

    pressedKeysRef.current.clear()
    activeMoveContextRef.current = null
  }, [enabled])

  useEffect(() => {
    const clearKeyboardState = () => {
      pressedKeysRef.current.clear()
      activeMoveContextRef.current = null
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (isTypingTarget(event.target)) return

      const {
        bindingIndex,
        cubeSize,
        enabled,
        keyboardSettings,
        onMove,
        viewerMap,
      } = runtimeRef.current
      if (!enabled) return

      const button = keyButtonFromEvent(event)
      pressedKeysRef.current.set(button.code, button)
      const activeMoveContext = activeMoveContextRef.current

      if (event.repeat && activeMoveContext?.keyCode === button.code) {
        event.preventDefault()
        return
      }

      const resolution = resolveKeyboardShortcut({
        bindingIndex,
        pressedKeys: pressedKeysRef.current,
        triggerCode: button.code,
        cubeSize,
        viewerMap,
        keyboardLayout: keyboardSettings.layout,
      })
      if (resolution.type === "none") return

      event.preventDefault()
      if (resolution.type === "handled") return

      activeMoveContextRef.current = {
        keyCode: button.code,
      }
      onMove(resolution.move)
    }

    const onKeyUp = (event: KeyboardEvent) => {
      const { enabled } = runtimeRef.current
      if (!enabled) return

      const button = keyButtonFromEvent(event)
      pressedKeysRef.current.delete(button.code)

      if (activeMoveContextRef.current?.keyCode === button.code) {
        activeMoveContextRef.current = null
      }
    }

    window.addEventListener("keydown", onKeyDown)
    window.addEventListener("keyup", onKeyUp)
    window.addEventListener("blur", clearKeyboardState)
    return () => {
      window.removeEventListener("keydown", onKeyDown)
      window.removeEventListener("keyup", onKeyUp)
      window.removeEventListener("blur", clearKeyboardState)
      clearKeyboardState()
    }
  }, [])
}
