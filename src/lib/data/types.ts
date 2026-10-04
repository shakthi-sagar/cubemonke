import type { CubeId, ModeId } from "@/lib/events"
import type { ReplayRecord } from "@/lib/replays"
import type { CreateSolveInput, SolveRecord } from "@/lib/solves"
import type { SpeedcubeSettings } from "@/lib/settings"

export type AuthUser = {
  id: string | null
  email: string | null
  userName: string
  userSlug: string
  isAnonymous: boolean
  usernameCompleted: boolean
  emailConfirmed: boolean
}

export type SignUpResult = {
  user: AuthUser
  verificationRequired: boolean
}

export type PublicProfile = {
  userName: string
  userSlug: string
}

export type SolveFilters = {
  cube?: CubeId
  mode?: ModeId
  userSlug?: string
  leaderboardEligible?: boolean
  limit?: number
  offset?: number
}

export type ReplayFilters = {
  cube?: CubeId
  mode?: ModeId
  userSlug?: string
}

export type AuthProvider = {
  getCurrentUser: () => Promise<AuthUser>
  signIn: (input: { email: string; password: string }) => Promise<AuthUser>
  signUp: (input: {
    username: string
    email: string
    password: string
  }) => Promise<SignUpResult>
  signInWithGoogle: () => Promise<void>
  resendSignupVerification: (input: { email: string }) => Promise<void>
  sendPasswordReset: (input: { email: string }) => Promise<void>
  updatePassword: (input: { password: string }) => Promise<void>
  signOut: () => Promise<void>
}

export type SolveRepository = {
  create: (solve: CreateSolveInput) => Promise<SolveRecord>
  list: (filters?: SolveFilters) => Promise<SolveRecord[]>
  updateReplayId: (id: string, replayId: string | null) => Promise<void>
  delete: (id: string) => Promise<void>
}

export type ReplayRepository = {
  create: (replay: ReplayRecord) => Promise<ReplayRecord>
  list: (filters?: ReplayFilters) => Promise<ReplayRecord[]>
  get: (id: string) => Promise<ReplayRecord | null>
  delete: (id: string) => Promise<void>
}

export type SettingsRepository = {
  get: () => Promise<SpeedcubeSettings>
  save: (settings: SpeedcubeSettings) => Promise<void>
}

export type AccountRepository = {
  getPublicProfile: (userSlug: string) => Promise<PublicProfile | null>
  updateUsername: (username: string) => Promise<AuthUser>
  deleteUserData: () => Promise<void>
  deleteAccountData: () => Promise<void>
}

export type DatabaseProvider = {
  solves: SolveRepository
  replays: ReplayRepository
  settings: SettingsRepository
  account: AccountRepository
}
