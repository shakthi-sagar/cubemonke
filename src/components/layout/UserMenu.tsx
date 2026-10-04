import { Settings, User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { AuthUser } from '@/lib/data'

type UserMenuProps = {
  user: AuthUser | null
  isLoading: boolean
  error: string | null
}

export function UserMenu({
  user,
  isLoading,
  error,
}: UserMenuProps) {
  const navigate = useNavigate()
  const displayName = isLoading ? 'Loading...' : user?.userName

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 p-1.5 pr-3 rounded-lg hover:bg-muted/50 border border-transparent hover:border-border/40 transition-all duration-200 group text-left cursor-pointer focus:outline-none">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-primary/20 bg-primary/10 text-primary transition-all duration-200 group-hover:bg-primary group-hover:text-primary-foreground">
            <User className="h-3.5 w-3.5" />
          </div>
          <div className="hidden sm:flex flex-col text-xs leading-none">
            <span className="font-semibold text-foreground truncate max-w-[100px]">
              {displayName}
            </span>
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side="bottom"
        align="end"
        className="w-[240px] border border-border bg-popover/90 backdrop-blur-md p-1.5 text-popover-foreground shadow-2xl rounded-xl mt-2 z-50"
      >
        <div className="px-3 py-2.5 border-b border-border/40 mb-1.5">
          <div className="text-xs font-semibold text-foreground">{user?.userName}</div>
          <p className="mt-1 text-[10px] leading-relaxed text-muted-foreground/80">
            Solves, replays and settings are saved in this browser only.
          </p>
          {error ? <p className="mt-2 text-[10px] font-semibold text-destructive">{error}</p> : null}
        </div>
        <DropdownMenuItem
          onClick={() => navigate('/account')}
          className="flex cursor-pointer items-center gap-2 px-3 py-2 text-xs font-medium uppercase tracking-wider text-muted-foreground hover:text-foreground focus:text-foreground focus:bg-muted/60 rounded-md"
        >
          <User className="h-3.5 w-3.5" /> Your Solves
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => navigate('/account/settings')}
          className="flex cursor-pointer items-center gap-2 px-3 py-2 text-xs font-medium uppercase tracking-wider text-muted-foreground hover:text-foreground focus:text-foreground focus:bg-muted/60 rounded-md"
        >
          <Settings className="h-3.5 w-3.5" /> Name & Data
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
