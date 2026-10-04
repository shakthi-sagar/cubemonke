import type {
  AuthProvider,
  AuthUser,
  DatabaseProvider,
  ReplayFilters,
  SolveFilters,
} from "@/lib/data/types"
import type { ReplayRecord } from "@/lib/replays"
import { normalizeSolveAnalyticsSnapshot, type SolveRecord } from "@/lib/solves"
import {
  DEFAULT_SPEEDCUBE_SETTINGS,
  normalizeSettings,
  readCachedSpeedcubeSettings,
  writeSpeedcubeSettings,
} from "@/lib/settings"
import { clear, getAll, getOne, put, remove } from "./db"

/**
 * Local-only data layer: there are no accounts or servers. The app always has
 * one local user, so every solve, personal best and replay is saved in this
 * browser (IndexedDB), and settings live in localStorage.
 */

const NAME_KEY = "cubemonke:name"
const LOCAL_SLUG = "me"

const readName = () => {
  try {
    return localStorage.getItem(NAME_KEY) || "You"
  } catch {
    return "You"
  }
}

const localUser = (): AuthUser => ({
  id: "local",
  email: null,
  userName: readName(),
  userSlug: LOCAL_SLUG,
  isAnonymous: false,
  usernameCompleted: true,
  emailConfirmed: true,
})

const noAccounts = () => {
  throw new Error("CubeMonke runs locally; there are no accounts.")
}

const newestFirst = <T extends { createdAt: string }>(a: T, b: T) =>
  b.createdAt.localeCompare(a.createdAt)

export const localAuthProvider: AuthProvider = {
  async getCurrentUser() {
    return localUser()
  },
  signIn: noAccounts,
  signUp: noAccounts,
  signInWithGoogle: noAccounts,
  resendSignupVerification: noAccounts,
  sendPasswordReset: noAccounts,
  updatePassword: noAccounts,
  async signOut() {},
}

export const localDbProvider: DatabaseProvider = {
  solves: {
    async create(solve) {
      const user = localUser()
      const record: SolveRecord = {
        id: solve.id,
        userId: user.id,
        userName: user.userName,
        userSlug: user.userSlug,
        timeMs: solve.timeMs,
        scramble: solve.scramble,
        replayId: solve.replayId,
        leaderboardEligible: solve.leaderboardEligible,
        analytics: normalizeSolveAnalyticsSnapshot(solve.analytics),
      }
      await put("solves", record)
      return record
    },
    async list(filters: SolveFilters = {}) {
      const solves = (await getAll<SolveRecord>("solves"))
        .map((solve) => ({
          ...solve,
          analytics: normalizeSolveAnalyticsSnapshot(solve.analytics),
        }))
        .filter(
          (solve) =>
            (!filters.cube || solve.analytics.cube === filters.cube) &&
            (!filters.mode || solve.analytics.mode === filters.mode) &&
            (filters.leaderboardEligible === undefined ||
              solve.leaderboardEligible === filters.leaderboardEligible)
        )
        .sort((a, b) => newestFirst(a.analytics, b.analytics))
      const offset = filters.offset ?? 0
      return solves.slice(
        offset,
        filters.limit ? offset + filters.limit : undefined
      )
    },
    async updateReplayId(id, replayId) {
      const solve = await getOne<SolveRecord>("solves", id)
      if (solve) await put("solves", { ...solve, replayId })
    },
    delete(id) {
      return remove("solves", id)
    },
  },
  replays: {
    async create(replay) {
      await put("replays", replay)
      return replay
    },
    async list(filters: ReplayFilters = {}) {
      return (await getAll<ReplayRecord>("replays"))
        .filter(
          (replay) =>
            (!filters.cube || replay.cube === filters.cube) &&
            (!filters.mode || replay.mode === filters.mode)
        )
        .sort(newestFirst)
    },
    get(id) {
      return getOne<ReplayRecord>("replays", id)
    },
    delete(id) {
      return remove("replays", id)
    },
  },
  settings: {
    async get() {
      return readCachedSpeedcubeSettings() ?? DEFAULT_SPEEDCUBE_SETTINGS
    },
    async save(settings) {
      writeSpeedcubeSettings(normalizeSettings(settings))
    },
  },
  account: {
    async getPublicProfile() {
      return null
    },
    async updateUsername(username) {
      try {
        localStorage.setItem(NAME_KEY, username)
      } catch {
        /* storage unavailable: keep the default name */
      }
      window.dispatchEvent(new Event("cubemonke-auth-change"))
      return localUser()
    },
    async deleteUserData() {
      await Promise.all([clear("solves"), clear("replays")])
    },
    async deleteAccountData() {
      await Promise.all([clear("solves"), clear("replays")])
      try {
        localStorage.removeItem(NAME_KEY)
      } catch {
        /* ignore */
      }
      window.dispatchEvent(new Event("cubemonke-auth-change"))
    },
  },
}
