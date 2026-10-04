import { useEffect } from "react"

import type { TimerState } from "@/pages/play/types"

type UseEnterTimerShortcutArgs = {
  timerState: TimerState
  onStartInspection: () => void
  onResetTimer: () => void
}

const isTypingTarget = (target: EventTarget | null) => {
  const element = target as HTMLElement | null
  return (
    element?.tagName === "INPUT" ||
    element?.tagName === "TEXTAREA" ||
    element?.isContentEditable
  )
}

export function useEnterTimerShortcut({
  timerState,
  onStartInspection,
  onResetTimer,
}: UseEnterTimerShortcutArgs) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isTypingTarget(event.target)) return
      if (event.key !== "Enter") return

      event.preventDefault()
      if (timerState === "idle") {
        onStartInspection()
      } else if (timerState === "stopped") {
        onResetTimer()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [timerState, onStartInspection, onResetTimer])
}
