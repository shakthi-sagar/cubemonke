import { Suspense } from "react"
import { BrowserRouter } from "react-router-dom"

import { AppRoutes } from "@/app/routes"
import { SeoManager } from "@/components/seo/SeoManager"
import { Toaster } from "@/components/ui/sonner"

function RouteFallback() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-background text-foreground">
      <div className="rounded-lg border border-border bg-card/50 px-5 py-3 text-xs font-black tracking-widest text-muted-foreground uppercase shadow-sm backdrop-blur-md">
        Loading
      </div>
    </div>
  )
}

export function App() {
  return (
    <BrowserRouter>
      <SeoManager />
      <Suspense fallback={<RouteFallback />}>
        <AppRoutes />
      </Suspense>
      <Toaster position="bottom-right" richColors closeButton />
    </BrowserRouter>
  )
}

export default App
