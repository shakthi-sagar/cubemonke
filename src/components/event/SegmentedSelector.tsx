type SelectorOption<T extends string> = {
  id: T
  label: string
}

type SegmentedSelectorProps<T extends string> = {
  label: string
  value: T
  options: readonly SelectorOption<T>[]
  onChange: (value: T) => void
  showLabel?: boolean
  disabled?: boolean
}

export function SegmentedSelector<T extends string>({
  label,
  value,
  options,
  onChange,
  showLabel = true,
  disabled = false,
}: SegmentedSelectorProps<T>) {
  return (
    <div className="w-full space-y-1.5 md:w-fit">
      {showLabel ? (
        <div className="text-[10px] font-black tracking-[0.22em] text-muted-foreground uppercase">
          {label}
        </div>
      ) : null}

      <select
        aria-label={label}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value as T)}
        className="h-10 w-full rounded-md border border-border bg-background/70 px-3 text-xs font-black tracking-wider text-foreground uppercase transition outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:pointer-events-none disabled:opacity-50 md:hidden"
      >
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>

      <div className="hidden flex-wrap gap-1.5 rounded-md border border-border bg-muted/25 p-1 md:inline-flex">
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            disabled={disabled}
            onClick={() => onChange(option.id)}
            className={`rounded px-3.5 py-1.5 text-xs font-black tracking-wider uppercase transition-all ${
              value === option.id
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/10"
                : "text-muted-foreground hover:bg-background/70 hover:text-foreground"
            } disabled:pointer-events-none disabled:opacity-50`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
}
