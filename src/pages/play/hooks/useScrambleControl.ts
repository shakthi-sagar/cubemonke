import { useCallback, useEffect, useState } from "react"

import { formatQueue } from "@/lib/cube"
import { createScramble, parseScramble } from "@/lib/scramble"
import type { CubeMove } from "@/types/cube"
import type { PreparedScramble, TimerState } from "@/pages/play/types"

type UseScrambleControlArgs = {
  size: number
  isCustomMode: boolean
  timerState: TimerState
  scrambleCube: (moves: CubeMove[]) => void
  resetCube: () => void
}

export function useScrambleControl({
  size,
  isCustomMode,
  timerState,
  scrambleCube,
  resetCube,
}: UseScrambleControlArgs) {
  const [scramble, setScramble] = useState("")
  const [customScrambleText, setCustomScrambleText] = useState("")
  const [customScrambleError, setCustomScrambleError] = useState<string | null>(
    null
  )

  const prepareScrambledInspection = useCallback((): PreparedScramble => {
    const moves = createScramble(size)
    const text = formatQueue(moves)
    setScramble(text)
    scrambleCube(moves)
    return { text, moves }
  }, [size, scrambleCube])

  const applyCustomScramble = useCallback(
    (nextText = customScrambleText): PreparedScramble | null => {
      try {
        const moves = parseScramble(nextText, size)
        const normalizedText = nextText.trim()
        setCustomScrambleText(normalizedText)
        setCustomScrambleError(null)
        setScramble(normalizedText)
        scrambleCube(moves)
        return { text: normalizedText, moves }
      } catch (error) {
        setCustomScrambleError(
          error instanceof Error ? error.message : "Invalid custom scramble."
        )
        return null
      }
    },
    [customScrambleText, scrambleCube, size]
  )

  useEffect(() => {
    if (!isCustomMode || timerState !== "idle") return

    const timeoutId = window.setTimeout(() => {
      const text = customScrambleText.trim()
      if (!text) {
        setScramble("")
        setCustomScrambleError(null)
        resetCube()
        return
      }

      try {
        const moves = parseScramble(text, size)
        setCustomScrambleError(null)
        setScramble(text)
        scrambleCube(moves)
      } catch (error) {
        setCustomScrambleError(
          error instanceof Error ? error.message : "Invalid custom scramble."
        )
      }
    }, 180)

    return () => window.clearTimeout(timeoutId)
  }, [
    customScrambleText,
    isCustomMode,
    resetCube,
    scrambleCube,
    size,
    timerState,
  ])

  const appendCustomMove = useCallback(
    (move: string) => {
      const nextText = [customScrambleText.trim(), move]
        .filter(Boolean)
        .join(" ")
      applyCustomScramble(nextText)
    },
    [applyCustomScramble, customScrambleText]
  )

  const clearCustomScramble = useCallback(() => {
    setCustomScrambleText("")
    setCustomScrambleError(null)
    setScramble("")
    resetCube()
  }, [resetCube])

  const updateCustomScrambleText = useCallback((value: string) => {
    setCustomScrambleText(value)
    setCustomScrambleError(null)
  }, [])

  const resetScramble = useCallback(() => {
    setScramble("")
  }, [])

  return {
    scramble,
    customScrambleText,
    customScrambleError,
    prepareScrambledInspection,
    applyCustomScramble,
    appendCustomMove,
    clearCustomScramble,
    updateCustomScrambleText,
    resetScramble,
  }
}
