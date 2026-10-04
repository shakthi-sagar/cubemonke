import { useEffect, useState } from 'react'
import { AlertTriangle, Save, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { authProvider, dbProvider } from '@/lib/data'
import type { AuthUser } from '@/lib/data'
import { usernameRulesText, validateUsername } from '@/lib/username'

export function AccountSettingsPage() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [username, setUsername] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSavingUsername, setIsSavingUsername] = useState(false)
  const [isDeletingData, setIsDeletingData] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function loadUser() {
      try {
        const currentUser = await authProvider.getCurrentUser()
        if (!isMounted) return
        setUser(currentUser)
        setUsername(currentUser.userName)
      } catch (nextError) {
        if (isMounted) setError(nextError instanceof Error ? nextError.message : 'Unable to load account settings.')
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    void loadUser()

    return () => {
      isMounted = false
    }
  }, [])

  const saveUsername = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setMessage(null)
    setIsSavingUsername(true)

    try {
      validateUsername(username)
      const updatedUser = await dbProvider.account.updateUsername(username)
      setUser(updatedUser)
      setUsername(updatedUser.userName)
      setMessage('Username updated.')
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Unable to update username.')
    } finally {
      setIsSavingUsername(false)
    }
  }

  const deleteUserData = async () => {
    const confirmed = window.confirm('Delete all solves and replays saved in this browser? This cannot be undone.')
    if (!confirmed) return

    setError(null)
    setMessage(null)
    setIsDeletingData(true)

    try {
      await dbProvider.account.deleteUserData()
      setMessage('Your solves and replays were deleted.')
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Unable to delete your data.')
    } finally {
      setIsDeletingData(false)
    }
  }


  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center p-6">
        <div className="rounded-lg border border-border bg-card/40 px-6 py-4 text-sm font-semibold text-muted-foreground shadow-sm backdrop-blur-md">
          Loading...
        </div>
      </div>
    )
  }


  return (
    <div className="mx-auto flex h-full w-full max-w-3xl flex-col gap-6 p-4 md:p-6">
      <div className="rounded-lg border border-border bg-card/40 p-6 shadow-sm backdrop-blur-md">
        <span className="text-[10px] font-black uppercase tracking-[0.24em] text-primary">Local data</span>
        <h1 className="mt-1 text-3xl font-black tracking-tight">Name and data</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Everything is saved in this browser only. There are no accounts.
        </p>
      </div>

      {message ? (
        <div className="rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-400">
          {message}
        </div>
      ) : null}

      {error ? (
        <div className="rounded-lg border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm font-semibold text-destructive">
          {error}
        </div>
      ) : null}

      <section className="rounded-lg border border-border bg-card/45 p-5 shadow-sm backdrop-blur-md">
        <div className="mb-4">
          <h2 className="text-sm font-black">Name</h2>
          <p className="mt-1 text-xs text-muted-foreground">Shown on your replays.</p>
        </div>
        <form onSubmit={saveUsername} className="flex flex-col gap-3 sm:flex-row">
          <input
            value={username}
            onChange={(event) => setUsername(event.target.value.toLowerCase())}
            className="h-11 flex-1 rounded-md border border-border bg-background px-3 text-sm font-semibold outline-none transition focus:border-primary"
            placeholder="Username"
            maxLength={20}
          />
          <Button type="submit" disabled={isSavingUsername || username.trim() === user?.userName}>
            <Save className="mr-1.5 h-3.5 w-3.5" />
            {isSavingUsername ? 'Saving...' : 'Save'}
          </Button>
        </form>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{usernameRulesText}</p>
      </section>

      <section className="rounded-lg border border-destructive/25 bg-destructive/5 p-5 shadow-sm backdrop-blur-md">
        <div className="mb-4 flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 text-destructive" />
          <div>
            <h2 className="text-sm font-black text-destructive">Danger zone</h2>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Deletes every solve and replay saved in this browser. Settings are kept.
            </p>
          </div>
        </div>

        <div className="flex">
          <Button type="button" variant="outline" disabled={isDeletingData} onClick={deleteUserData}>
            <Trash2 className="mr-1.5 h-3.5 w-3.5" />
            {isDeletingData ? 'Deleting...' : 'Delete solves & replays'}
          </Button>
        </div>
      </section>
    </div>
  )
}

export default AccountSettingsPage
