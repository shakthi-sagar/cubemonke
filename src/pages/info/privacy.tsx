import { Shield } from 'lucide-react'

export function PrivacyPage() {
  const lastUpdated = 'October 4, 2026'

  return (
    <div className="mx-auto flex h-full w-full max-w-4xl flex-col gap-6 p-4 md:p-6 pt-10 pb-16">
      {/* Header */}
      <div className="rounded-lg border border-border bg-card/40 p-6 md:p-8 shadow-sm backdrop-blur-md">
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-black uppercase tracking-[0.24em] text-primary">Data Protection</span>
          <h1 className="text-3xl font-black tracking-tight">Privacy Policy</h1>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Shield className="h-3.5 w-3.5" /> Last updated: {lastUpdated}
          </p>
        </div>
      </div>

      {/* Privacy Body */}
      <div className="rounded-lg border border-border bg-card/40 p-6 md:p-8 shadow-sm backdrop-blur-md space-y-8 text-sm leading-relaxed text-muted-foreground">
        <section className="space-y-3">
          <h2 className="text-base font-black tracking-tight text-foreground">1. Everything stays on your device</h2>
          <p>
            CubeMonke has no accounts and no server. Your solves, replays, statistics and settings are stored in your browser (IndexedDB and localStorage) and never leave this device.
          </p>
        </section>
        <section className="space-y-3">
          <h2 className="text-base font-black tracking-tight text-foreground">2. No tracking or ads</h2>
          <p>
            CubeMonke does not use analytics, advertising or tracking cookies.
          </p>
        </section>
        <section className="space-y-3">
          <h2 className="text-base font-black tracking-tight text-foreground">3. Deleting your data</h2>
          <p>
            You can clear all saved solves and replays from Name &amp; Data in the menu, or by clearing this site&apos;s data in your browser. Clearing it cannot be undone.
          </p>
        </section>
        <section className="space-y-3">
          <h2 className="text-base font-black tracking-tight text-foreground">4. Contact</h2>
          <p>
            If you use the contact form, your message and email address are sent to us through FormSubmit so we can reply. CubeMonke is open source; the code is on <a href="https://github.com/shakthi-sagar/cubemonke" className="text-primary hover:underline">GitHub</a>.
          </p>
        </section>
      </div>
    </div>
  )
}

export default PrivacyPage
