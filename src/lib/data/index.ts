import { localAuthProvider, localDbProvider } from "@/lib/data/local"

export const authProvider = localAuthProvider
export const dbProvider = localDbProvider

export type {
  AuthProvider,
  AuthUser,
  AccountRepository,
  DatabaseProvider,
  PublicProfile,
  ReplayFilters,
  ReplayRepository,
  SettingsRepository,
  SignUpResult,
  SolveFilters,
  SolveRepository,
} from "@/lib/data/types"
