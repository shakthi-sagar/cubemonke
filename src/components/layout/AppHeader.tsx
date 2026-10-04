import { Film, Settings, Timer } from "lucide-react"
import { Link } from "react-router-dom"

import { AppLogo } from "@/components/layout/AppLogo"
import { ThemeToggle } from "@/components/layout/ThemeToggle"
import { UserMenu } from "@/components/layout/UserMenu"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type { AuthUser } from "@/lib/data"

const NAV_ITEMS = [
  { label: "Play", path: "/play", icon: Timer },
  { label: "Replays", path: "/replays", icon: Film },
  { label: "Settings", path: "/settings", icon: Settings },
]

type AppHeaderProps = {
  pathname: string
  user: AuthUser | null
  isLoading: boolean
  error: string | null
}

export function AppHeader({
  pathname,
  user,
  isLoading,
  error,
}: AppHeaderProps) {
  return (
    <header className="z-30 flex-shrink-0 bg-background px-6 py-4 md:px-8">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between">
        <div className="flex items-center gap-3 md:gap-4">
          <Link
            to="/play"
            className="group flex items-center gap-2.5 transition"
          >
            <AppLogo className="h-8 w-8 transition-all duration-300 group-hover:scale-105 group-hover:shadow-primary/45" />
            <span className="hidden font-mono text-base font-black tracking-tight text-foreground sm:inline">
              cubemonke
            </span>
          </Link>

          <nav className="flex items-center gap-1.5 border-l border-border/40 pl-3 md:pl-4">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon
              const isActive =
                item.path === "/play"
                  ? pathname === "/" || pathname === "/play"
                  : pathname === item.path

              return (
                <Tooltip key={item.path}>
                  <TooltipTrigger asChild>
                    <Link
                      to={item.path}
                      className={`relative rounded-lg p-2 transition-all duration-200 hover:bg-muted/50 ${
                        isActive
                          ? "text-primary"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Icon className="h-5 w-5 shrink-0" />
                      {isActive && (
                        <span className="absolute bottom-0 left-1/2 h-0.5 w-4 -translate-x-1/2 rounded-full bg-primary" />
                      )}
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs">
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              )
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <UserMenu
            user={user}
            isLoading={isLoading}
            error={error}
          />
        </div>
      </div>
    </header>
  )
}
