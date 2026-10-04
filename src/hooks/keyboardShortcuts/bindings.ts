import {
  LAYER_SELECTOR_IDS,
  LAYER_TURN_DIRECTIONS,
  NOTATION_TURNS,
  VIEW_DIRECTIONS,
  normalizeKeyboardBindings,
  normalizeKeyChord,
  type KeyButton,
  type KeyChord,
  type KeyboardBindings,
  type LayerTurnDirection,
  type NotationTurn,
  type ViewDirection,
} from "@/lib/settings"

type IndexedBinding<Value> = {
  value: Value
  chord: KeyChord
  order: number
  codes: Set<string>
}

export type ShortcutBindingIndex = {
  layerSelectors: Array<IndexedBinding<number>>
  visualLayerTurns: Array<IndexedBinding<LayerTurnDirection>>
  faceTurnModifier: IndexedBinding<true>
  viewTurns: Array<IndexedBinding<ViewDirection>>
  notationTurns: Array<IndexedBinding<NotationTurn>>
}

const indexBinding = <Value>(
  value: Value,
  keyChord: KeyChord,
  order: number
): IndexedBinding<Value> => {
  const chord = normalizeKeyChord(keyChord)
  return {
    value,
    chord,
    order,
    codes: new Set(chord.map((button) => button.code)),
  }
}

export const createShortcutBindingIndex = (
  bindings: KeyboardBindings
): ShortcutBindingIndex => {
  const normalized = normalizeKeyboardBindings(bindings)

  return {
    layerSelectors: LAYER_SELECTOR_IDS.map((id, index) =>
      indexBinding(index, normalized.layerSelectors[id], index)
    ),
    visualLayerTurns: LAYER_TURN_DIRECTIONS.map((direction, index) =>
      indexBinding(direction, normalized.visual.layerTurns[direction], index)
    ),
    faceTurnModifier: indexBinding(true, normalized.visual.faceTurnModifier, 0),
    viewTurns: VIEW_DIRECTIONS.map((direction, index) =>
      indexBinding(direction, normalized.viewTurns[direction], index)
    ),
    notationTurns: NOTATION_TURNS.map((turn, index) =>
      indexBinding(turn, normalized.notation.turns[turn], index)
    ),
  }
}

export const pressedCodesFromKeys = (keys: Map<string, KeyButton>) =>
  new Set(normalizeKeyChord([...keys.values()]).map((button) => button.code))

const findSatisfiedBindings = <Value>(
  bindings: Array<IndexedBinding<Value>>,
  pressedCodes: Set<string>,
  eventCode?: string
) =>
  bindings.filter((binding) => {
    if (binding.chord.length === 0) return false
    if (eventCode && !binding.codes.has(eventCode)) return false
    return binding.chord.every((button) => pressedCodes.has(button.code))
  })

const hasStrictlyMoreSpecificMatch = <Value>(
  binding: IndexedBinding<Value>,
  matches: Array<IndexedBinding<Value>>
) => {
  const bindingCodes = new Set(binding.chord.map((button) => button.code))

  return matches.some((candidate) => {
    if (candidate === binding || candidate.chord.length <= binding.chord.length)
      return false

    for (const code of bindingCodes) {
      if (!candidate.codes.has(code)) return false
    }

    return true
  })
}

export const findSatisfiedValues = <Value>(
  bindings: Array<IndexedBinding<Value>>,
  pressedCodes: Set<string>,
  eventCode?: string
) => {
  const matches = findSatisfiedBindings(bindings, pressedCodes, eventCode)
  return matches
    .filter((binding) => !hasStrictlyMoreSpecificMatch(binding, matches))
    .map((binding) => binding.value)
}

export const findBestSatisfiedValue = <Value>(
  bindings: Array<IndexedBinding<Value>>,
  pressedCodes: Set<string>,
  eventCode?: string
) =>
  findSatisfiedBindings(bindings, pressedCodes, eventCode).sort(
    (left, right) => {
      const chordDelta = right.chord.length - left.chord.length
      return chordDelta === 0 ? left.order - right.order : chordDelta
    }
  )[0]?.value ?? null
