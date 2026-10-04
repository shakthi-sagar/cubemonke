export const CUBE_OPTIONS = [
  { id: '2x2', label: '2x2', size: 2 },
  { id: '3x3', label: '3x3', size: 3 },
  { id: '4x4', label: '4x4', size: 4 },
] as const

export const LEADERBOARD_MODE_OPTIONS = [
  { id: 'standard', label: 'Standard' },
] as const

export const MODE_OPTIONS = [
  ...LEADERBOARD_MODE_OPTIONS,
  { id: 'custom', label: 'Custom' },
] as const

export type CubeId = (typeof CUBE_OPTIONS)[number]['id']
export type CubeSize = (typeof CUBE_OPTIONS)[number]['size']
export type ModeId = (typeof MODE_OPTIONS)[number]['id']
export type LeaderboardModeId = (typeof LEADERBOARD_MODE_OPTIONS)[number]['id']

export const DEFAULT_CUBE_ID: CubeId = '3x3'
export const DEFAULT_MODE_ID: ModeId = 'standard'

export const isCubeId = (value: string | null): value is CubeId =>
  CUBE_OPTIONS.some((option) => option.id === value)

export const isModeId = (value: string | null): value is ModeId =>
  MODE_OPTIONS.some((option) => option.id === value)

export const isLeaderboardModeId = (value: string | null): value is LeaderboardModeId =>
  LEADERBOARD_MODE_OPTIONS.some((option) => option.id === value)

export const normalizeCubeId = (value: string | null): CubeId => isCubeId(value) ? value : DEFAULT_CUBE_ID
export const normalizeModeId = (value: string | null): ModeId => isModeId(value) ? value : DEFAULT_MODE_ID
export const normalizeLeaderboardModeId = (value: string | null): LeaderboardModeId =>
  isLeaderboardModeId(value) ? value : DEFAULT_MODE_ID

export const cubeIdToSize = (cubeId: CubeId): CubeSize =>
  CUBE_OPTIONS.find((option) => option.id === cubeId)?.size ?? 3
