export function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card/45 p-4 shadow-sm backdrop-blur-md">
      <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-2 font-mono text-2xl font-black text-foreground">{value}</div>
    </div>
  )
}
