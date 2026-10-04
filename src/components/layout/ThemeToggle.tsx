import { Moon, Sun } from 'lucide-react'

import { useTheme } from '@/components/common/theme-provider'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={() => setTheme(isDark ? 'light' : 'dark')}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground transition-all duration-200 hover:bg-muted/50 cursor-pointer"
        >
          {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs">
        {isDark ? 'Light Mode' : 'Dark Mode'}
      </TooltipContent>
    </Tooltip>
  )
}
