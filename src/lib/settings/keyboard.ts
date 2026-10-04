export type KeyButton = {
  code: string
  key: string
}

export type KeyChord = KeyButton[]

export type KeyboardLayout = "visual" | "notation"

export const LAYER_SELECTOR_IDS = [
  "layer1",
  "layer2",
  "layer3",
  "layer4",
  "layer5",
  "layer6",
  "layer7",
  "layer8",
  "layer9",
] as const
export type LayerSelectorId = (typeof LAYER_SELECTOR_IDS)[number]

export const LAYER_TURN_DIRECTIONS = ["left", "right", "up", "down"] as const
export type LayerTurnDirection = (typeof LAYER_TURN_DIRECTIONS)[number]

export const VIEW_DIRECTIONS = ["left", "right", "up", "down"] as const
export type ViewDirection = (typeof VIEW_DIRECTIONS)[number]

export const NOTATION_TURNS = [
  "R",
  "RPrime",
  "L",
  "LPrime",
  "U",
  "UPrime",
  "D",
  "DPrime",
  "F",
  "FPrime",
  "B",
  "BPrime",
] as const
export type NotationTurn = (typeof NOTATION_TURNS)[number]

export type LayerTurnBindingId =
  | "layerTurnLeft"
  | "layerTurnRight"
  | "layerTurnUp"
  | "layerTurnDown"

export type ViewBindingId = "viewLeft" | "viewRight" | "viewUp" | "viewDown"

export type NotationBindingId =
  | "notationR"
  | "notationRPrime"
  | "notationL"
  | "notationLPrime"
  | "notationU"
  | "notationUPrime"
  | "notationD"
  | "notationDPrime"
  | "notationF"
  | "notationFPrime"
  | "notationB"
  | "notationBPrime"

export type KeyboardBindingId =
  | LayerSelectorId
  | LayerTurnBindingId
  | "faceTurnModifier"
  | ViewBindingId
  | NotationBindingId

export type KeyboardBindings = {
  layerSelectors: Record<LayerSelectorId, KeyChord>
  visual: {
    layerTurns: Record<LayerTurnDirection, KeyChord>
    faceTurnModifier: KeyChord
  }
  viewTurns: Record<ViewDirection, KeyChord>
  notation: {
    turns: Record<NotationTurn, KeyChord>
  }
}

export type KeyboardSettings = {
  layout: KeyboardLayout
  bindings: KeyboardBindings
}

export type KeybindingMeta = {
  id: KeyboardBindingId
  label: string
  description: string
  group:
    | "Layer selectors"
    | "Layer turns"
    | "Face modifier"
    | "Face change"
    | "Notation turns"
}

const MODIFIER_CODES = ["Control", "Shift", "Alt", "Meta"] as const
const MODIFIER_LABELS: Record<string, string> = {
  Control: "Ctrl",
  Shift: "Shift",
  Alt: "Alt",
  Meta: "Meta",
}

const LAYER_TURN_BINDINGS: Record<LayerTurnBindingId, LayerTurnDirection> = {
  layerTurnLeft: "left",
  layerTurnRight: "right",
  layerTurnUp: "up",
  layerTurnDown: "down",
}

const VIEW_BINDINGS: Record<ViewBindingId, ViewDirection> = {
  viewLeft: "left",
  viewRight: "right",
  viewUp: "up",
  viewDown: "down",
}

const NOTATION_BINDINGS: Record<NotationBindingId, NotationTurn> = {
  notationR: "R",
  notationRPrime: "RPrime",
  notationL: "L",
  notationLPrime: "LPrime",
  notationU: "U",
  notationUPrime: "UPrime",
  notationD: "D",
  notationDPrime: "DPrime",
  notationF: "F",
  notationFPrime: "FPrime",
  notationB: "B",
  notationBPrime: "BPrime",
}

const normalizeKeyCode = (code: string) => {
  if (code === "ControlLeft" || code === "ControlRight") return "Control"
  if (code === "ShiftLeft" || code === "ShiftRight") return "Shift"
  if (code === "AltLeft" || code === "AltRight") return "Alt"
  if (code === "MetaLeft" || code === "MetaRight") return "Meta"
  return code
}

const keyButtonSortRank = (button: KeyButton) => {
  const modifierIndex = MODIFIER_CODES.indexOf(
    button.code as (typeof MODIFIER_CODES)[number]
  )
  if (modifierIndex >= 0) return modifierIndex
  if (button.code.startsWith("Digit"))
    return 10 + Number(button.code.replace("Digit", ""))
  if (button.code.startsWith("Key")) return 30 + button.code.charCodeAt(3)
  if (button.code.startsWith("Arrow")) return 80
  return 100
}

export const normalizeKeyChord = (chord: unknown): KeyChord => {
  if (!Array.isArray(chord)) return []

  const buttons = new Map<string, KeyButton>()
  for (const item of chord) {
    if (!item || typeof item !== "object") continue
    const candidate = item as Partial<KeyButton>
    if (typeof candidate.code !== "string" || candidate.code.length === 0)
      continue

    const code = normalizeKeyCode(candidate.code)
    buttons.set(code, {
      code,
      key:
        typeof candidate.key === "string" && candidate.key.length > 0
          ? candidate.key
          : code,
    })
  }

  return [...buttons.values()].sort((left, right) => {
    const rankDelta = keyButtonSortRank(left) - keyButtonSortRank(right)
    return rankDelta === 0 ? left.code.localeCompare(right.code) : rankDelta
  })
}

const keyButton = (key: string, code: string): KeyButton => ({
  code: normalizeKeyCode(code),
  key,
})

const chord = (...buttons: KeyButton[]): KeyChord => normalizeKeyChord(buttons)

const cloneChord = (keyChord: KeyChord): KeyChord =>
  keyChord.map((button) => ({ ...button }))

const chordOrDefault = (candidate: unknown, fallback: KeyChord): KeyChord => {
  const normalized = normalizeKeyChord(candidate)
  return normalized.length > 0 ? normalized : cloneChord(fallback)
}

const recordFromEntries = <Key extends string, Value>(
  entries: Array<[Key, Value]>
): Record<Key, Value> => Object.fromEntries(entries) as Record<Key, Value>

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object"

const layerSelectorIndex = (id: LayerSelectorId) =>
  Number(id.replace("layer", "")) - 1

const defaultLayerSelectors = () =>
  recordFromEntries(
    LAYER_SELECTOR_IDS.map((id) => {
      const layerNumber = layerSelectorIndex(id) + 1
      return [id, chord(keyButton(String(layerNumber), `Digit${layerNumber}`))]
    })
  )

export const DEFAULT_KEYBOARD_BINDINGS: KeyboardBindings = {
  layerSelectors: defaultLayerSelectors(),
  visual: {
    layerTurns: {
      left: chord(keyButton("ArrowLeft", "ArrowLeft")),
      right: chord(keyButton("ArrowRight", "ArrowRight")),
      up: chord(keyButton("ArrowUp", "ArrowUp")),
      down: chord(keyButton("ArrowDown", "ArrowDown")),
    },
    faceTurnModifier: chord(keyButton("Space", "Space")),
  },
  viewTurns: {
    left: chord(keyButton("ArrowRight", "ArrowRight")),
    right: chord(keyButton("ArrowLeft", "ArrowLeft")),
    up: chord(keyButton("ArrowDown", "ArrowDown")),
    down: chord(keyButton("ArrowUp", "ArrowUp")),
  },
  notation: {
    turns: {
      R: chord(keyButton("r", "KeyR")),
      RPrime: chord(keyButton("Shift", "Shift"), keyButton("r", "KeyR")),
      L: chord(keyButton("l", "KeyL")),
      LPrime: chord(keyButton("Shift", "Shift"), keyButton("l", "KeyL")),
      U: chord(keyButton("u", "KeyU")),
      UPrime: chord(keyButton("Shift", "Shift"), keyButton("u", "KeyU")),
      D: chord(keyButton("d", "KeyD")),
      DPrime: chord(keyButton("Shift", "Shift"), keyButton("d", "KeyD")),
      F: chord(keyButton("f", "KeyF")),
      FPrime: chord(keyButton("Shift", "Shift"), keyButton("f", "KeyF")),
      B: chord(keyButton("b", "KeyB")),
      BPrime: chord(keyButton("Shift", "Shift"), keyButton("b", "KeyB")),
    },
  },
}

export const DEFAULT_KEYBOARD_SETTINGS: KeyboardSettings = {
  layout: "visual",
  bindings: DEFAULT_KEYBOARD_BINDINGS,
}

export const normalizeKeyboardBindings = (input: unknown): KeyboardBindings => {
  const data = isRecord(input) ? input : {}
  const layerSelectors = isRecord(data.layerSelectors)
    ? data.layerSelectors
    : {}
  const visual = isRecord(data.visual) ? data.visual : {}
  const layerTurns = isRecord(visual.layerTurns) ? visual.layerTurns : {}
  const viewTurns = isRecord(data.viewTurns) ? data.viewTurns : {}
  const notation = isRecord(data.notation) ? data.notation : {}
  const notationTurns = isRecord(notation.turns) ? notation.turns : {}

  return {
    layerSelectors: recordFromEntries(
      LAYER_SELECTOR_IDS.map((id) => [
        id,
        chordOrDefault(
          layerSelectors[id],
          DEFAULT_KEYBOARD_BINDINGS.layerSelectors[id]
        ),
      ])
    ),
    visual: {
      layerTurns: recordFromEntries(
        LAYER_TURN_DIRECTIONS.map((direction) => [
          direction,
          chordOrDefault(
            layerTurns[direction],
            DEFAULT_KEYBOARD_BINDINGS.visual.layerTurns[direction]
          ),
        ])
      ),
      faceTurnModifier: chordOrDefault(
        visual.faceTurnModifier,
        DEFAULT_KEYBOARD_BINDINGS.visual.faceTurnModifier
      ),
    },
    viewTurns: recordFromEntries(
      VIEW_DIRECTIONS.map((direction) => [
        direction,
        chordOrDefault(
          viewTurns[direction],
          DEFAULT_KEYBOARD_BINDINGS.viewTurns[direction]
        ),
      ])
    ),
    notation: {
      turns: recordFromEntries(
        NOTATION_TURNS.map((turn) => [
          turn,
          chordOrDefault(
            notationTurns[turn],
            DEFAULT_KEYBOARD_BINDINGS.notation.turns[turn]
          ),
        ])
      ),
    },
  }
}

export const normalizeKeyboardSettings = (input: unknown): KeyboardSettings => {
  const data = isRecord(input) ? input : {}
  return {
    layout: data.layout === "notation" ? "notation" : "visual",
    bindings: normalizeKeyboardBindings(data.bindings),
  }
}

export const KEYBINDING_META: KeybindingMeta[] = [
  ...LAYER_SELECTOR_IDS.map((id) => ({
    id,
    label: `Layer ${layerSelectorIndex(id) + 1}`,
    description: `Hold visible layer ${layerSelectorIndex(id) + 1}.`,
    group: "Layer selectors" as const,
  })),
  {
    id: "layerTurnLeft",
    label: "Layer left",
    description: "Move the selected horizontal layer left.",
    group: "Layer turns",
  },
  {
    id: "layerTurnRight",
    label: "Layer right",
    description: "Move the selected horizontal layer right.",
    group: "Layer turns",
  },
  {
    id: "layerTurnUp",
    label: "Column up",
    description: "Move the selected vertical layer upward.",
    group: "Layer turns",
  },
  {
    id: "layerTurnDown",
    label: "Column down",
    description: "Move the selected vertical layer downward.",
    group: "Layer turns",
  },
  {
    id: "faceTurnModifier",
    label: "Face turn modifier",
    description: "Use layer turn keys for front-depth turns.",
    group: "Face modifier",
  },
  {
    id: "viewLeft",
    label: "Face left",
    description: "Bring the current left face to the front.",
    group: "Face change",
  },
  {
    id: "viewRight",
    label: "Face right",
    description: "Bring the current right face to the front.",
    group: "Face change",
  },
  {
    id: "viewUp",
    label: "Face up",
    description: "Bring the current up face to the front.",
    group: "Face change",
  },
  {
    id: "viewDown",
    label: "Face down",
    description: "Bring the current down face to the front.",
    group: "Face change",
  },
  {
    id: "notationR",
    label: "R",
    description: "Turn the current right face clockwise.",
    group: "Notation turns",
  },
  {
    id: "notationRPrime",
    label: "R'",
    description: "Turn the current right face counter-clockwise.",
    group: "Notation turns",
  },
  {
    id: "notationL",
    label: "L",
    description: "Turn the current left face clockwise.",
    group: "Notation turns",
  },
  {
    id: "notationLPrime",
    label: "L'",
    description: "Turn the current left face counter-clockwise.",
    group: "Notation turns",
  },
  {
    id: "notationU",
    label: "U",
    description: "Turn the current up face clockwise.",
    group: "Notation turns",
  },
  {
    id: "notationUPrime",
    label: "U'",
    description: "Turn the current up face counter-clockwise.",
    group: "Notation turns",
  },
  {
    id: "notationD",
    label: "D",
    description: "Turn the current down face clockwise.",
    group: "Notation turns",
  },
  {
    id: "notationDPrime",
    label: "D'",
    description: "Turn the current down face counter-clockwise.",
    group: "Notation turns",
  },
  {
    id: "notationF",
    label: "F",
    description: "Turn the current front face clockwise.",
    group: "Notation turns",
  },
  {
    id: "notationFPrime",
    label: "F'",
    description: "Turn the current front face counter-clockwise.",
    group: "Notation turns",
  },
  {
    id: "notationB",
    label: "B",
    description: "Turn the current back face clockwise.",
    group: "Notation turns",
  },
  {
    id: "notationBPrime",
    label: "B'",
    description: "Turn the current back face counter-clockwise.",
    group: "Notation turns",
  },
]

export const keyButtonFromEvent = (event: KeyboardEvent): KeyButton => ({
  code: normalizeKeyCode(event.code || event.key),
  key: event.key,
})

export const keyChordId = (keyChord: KeyChord) =>
  normalizeKeyChord(keyChord)
    .map((button) => button.code)
    .join("+")

const keyButtonLabel = (button: KeyButton) => {
  if (button.code in MODIFIER_LABELS) return MODIFIER_LABELS[button.code]
  if (button.code.startsWith("Arrow"))
    return button.code.replace("Arrow", "Arrow ")
  if (button.code === "Space" || button.key === " ") return "Space"
  if (button.key.length === 1) return button.key.toUpperCase()
  return button.key
}

export const keyChordLabel = (keyChord: KeyChord) => {
  const labels = normalizeKeyChord(keyChord).map(keyButtonLabel)
  return labels.length > 0 ? labels.join(" + ") : "Unassigned"
}

export const keyboardBindingContext = (id: KeyboardBindingId) => {
  if (LAYER_SELECTOR_IDS.includes(id as LayerSelectorId)) return "selector"
  if (id === "faceTurnModifier") return "face-modifier"
  if (id in VIEW_BINDINGS) return "view"
  if (id in NOTATION_BINDINGS) return "notation"
  return "layer-turn"
}

export const getKeyboardBindingChord = (
  bindings: KeyboardBindings,
  id: KeyboardBindingId
) => {
  if (LAYER_SELECTOR_IDS.includes(id as LayerSelectorId)) {
    return bindings.layerSelectors[id as LayerSelectorId]
  }
  if (id === "faceTurnModifier") return bindings.visual.faceTurnModifier
  if (id in LAYER_TURN_BINDINGS) {
    return bindings.visual.layerTurns[idToLayerTurnDirection(id)]
  }
  if (id in VIEW_BINDINGS) return bindings.viewTurns[idToViewDirection(id)]
  if (id in NOTATION_BINDINGS) {
    return bindings.notation.turns[idToNotationTurn(id)]
  }
  return null
}

export const setKeyboardBindingChord = (
  bindings: KeyboardBindings,
  id: KeyboardBindingId,
  keyChord: KeyChord
): KeyboardBindings => {
  const next = normalizeKeyboardBindings(bindings)
  const normalized = normalizeKeyChord(keyChord)
  if (normalized.length === 0) return next

  if (LAYER_SELECTOR_IDS.includes(id as LayerSelectorId)) {
    next.layerSelectors[id as LayerSelectorId] = normalized
    return next
  }

  if (id === "faceTurnModifier") {
    next.visual.faceTurnModifier = normalized
    return next
  }

  if (id in LAYER_TURN_BINDINGS) {
    next.visual.layerTurns[idToLayerTurnDirection(id)] = normalized
    return next
  }

  if (id in VIEW_BINDINGS) {
    next.viewTurns[idToViewDirection(id)] = normalized
    return next
  }

  if (id in NOTATION_BINDINGS) {
    next.notation.turns[idToNotationTurn(id)] = normalized
  }

  return next
}

export const idToLayerTurnDirection = (id: KeyboardBindingId) =>
  LAYER_TURN_BINDINGS[id as LayerTurnBindingId]

export const idToViewDirection = (id: KeyboardBindingId) =>
  VIEW_BINDINGS[id as ViewBindingId]

export const idToNotationTurn = (id: KeyboardBindingId) =>
  NOTATION_BINDINGS[id as NotationBindingId]
