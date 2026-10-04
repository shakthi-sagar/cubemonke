import type { KeyButton, KeyboardLayout } from "@/lib/settings"
import type { CubeMove, ViewerFaceMap } from "@/types/cube"
import {
  findBestSatisfiedValue,
  findSatisfiedValues,
  pressedCodesFromKeys,
  type ShortcutBindingIndex,
} from "@/hooks/keyboardShortcuts/bindings"
import {
  actionToFaceTurnMove,
  actionToLayerMove,
  actionToNotationMove,
  actionToViewMove,
} from "@/hooks/keyboardShortcuts/moves"

export type KeyboardShortcutResolution =
  | { type: "move"; move: CubeMove }
  | { type: "handled" }
  | { type: "none" }

type ResolveKeyboardShortcutArgs = {
  bindingIndex: ShortcutBindingIndex
  pressedKeys: Map<string, KeyButton>
  triggerCode: string
  cubeSize: number
  viewerMap: ViewerFaceMap
  keyboardLayout: KeyboardLayout
}

const moveResolution = (move: CubeMove | null): KeyboardShortcutResolution =>
  move ? { type: "move", move } : { type: "none" }

export const resolveKeyboardShortcut = ({
  bindingIndex,
  pressedKeys,
  triggerCode,
  cubeSize,
  viewerMap,
  keyboardLayout,
}: ResolveKeyboardShortcutArgs): KeyboardShortcutResolution => {
  const pressedCodes = pressedCodesFromKeys(pressedKeys)
  const selectedLayers = findSatisfiedValues(
    bindingIndex.layerSelectors,
    pressedCodes
  )
    .filter((layer) => layer >= 0 && layer < cubeSize)
    .sort((left, right) => left - right)

  const completedLayerSelector =
    findSatisfiedValues(bindingIndex.layerSelectors, pressedCodes, triggerCode)
      .length > 0
  if (completedLayerSelector) return { type: "handled" }

  const completedFaceModifier =
    findBestSatisfiedValue(
      [bindingIndex.faceTurnModifier],
      pressedCodes,
      triggerCode
    ) !== null
  if (completedFaceModifier) return { type: "handled" }

  if (keyboardLayout === "notation") {
    const notationTurn = findBestSatisfiedValue(
      bindingIndex.notationTurns,
      pressedCodes,
      triggerCode
    )
    if (notationTurn) {
      const layers = selectedLayers.length > 0 ? selectedLayers : [0]
      return moveResolution(
        actionToNotationMove(notationTurn, layers, viewerMap)
      )
    }

    const viewDirection = findBestSatisfiedValue(
      bindingIndex.viewTurns,
      pressedCodes,
      triggerCode
    )
    return moveResolution(
      viewDirection ? actionToViewMove(viewDirection, viewerMap) : null
    )
  }

  const layerTurnDirection = findBestSatisfiedValue(
    bindingIndex.visualLayerTurns,
    pressedCodes,
    triggerCode
  )
  const faceModifierHeld =
    findBestSatisfiedValue([bindingIndex.faceTurnModifier], pressedCodes) !==
    null

  if (selectedLayers.length > 0) {
    if (!layerTurnDirection) return { type: "none" }

    const move = faceModifierHeld
      ? actionToFaceTurnMove(layerTurnDirection, selectedLayers, viewerMap)
      : actionToLayerMove(layerTurnDirection, selectedLayers, viewerMap)

    return moveResolution(move)
  }

  if (faceModifierHeld && layerTurnDirection) return { type: "handled" }

  const viewDirection = findBestSatisfiedValue(
    bindingIndex.viewTurns,
    pressedCodes,
    triggerCode
  )
  return moveResolution(
    viewDirection ? actionToViewMove(viewDirection, viewerMap) : null
  )
}
