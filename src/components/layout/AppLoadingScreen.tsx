import { AppLogo } from '@/components/layout/AppLogo'

export function AppLoadingScreen() {
  return (
    <div className="flex h-svh w-full flex-col items-center justify-center bg-background text-foreground animate-in fade-in duration-300">
      <div className="flex flex-col items-center gap-4">
        <AppLogo className="h-12 w-12 animate-pulse rounded-xl" />
        <div className="flex flex-col items-center gap-1.5 text-center">
          <span className="font-mono text-sm font-black tracking-tight">cubemonke</span>
          <div className="flex items-center gap-2 text-[10px] font-semibold text-muted-foreground">
            <span className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            Loading user session...
          </div>
        </div>
      </div>
    </div>
  )
}
