import { Code, Mail, Shield } from 'lucide-react'
import { Link } from 'react-router-dom'

const FOOTER_LINKS = [
  { label: 'contact', path: '/contact', icon: Mail, isExternal: false },
  { label: 'privacy', path: '/privacy', icon: Shield, isExternal: false },
  { label: 'source', path: 'https://github.com/shakthi-sagar/cubemonke', icon: Code, isExternal: true },
]

export function AppFooter() {
  return (
    <footer className="flex-shrink-0 px-6 py-4 text-[11px] font-semibold text-muted-foreground/70 md:px-8">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5">
          {FOOTER_LINKS.map((item) => {
            const Icon = item.icon

            if (item.isExternal) {
              return (
                <a
                  key={item.label}
                  href={item.path}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 transition hover:text-foreground cursor-pointer"
                >
                  <Icon className="h-3.5 w-3.5" />
                  {item.label}
                </a>
              )
            }

            return (
              <Link
                key={item.label}
                to={item.path}
                className="inline-flex items-center gap-1.5 transition hover:text-foreground cursor-pointer"
              >
                <Icon className="h-3.5 w-3.5" />
                {item.label}
              </Link>
            )
          })}
        </div>
      </div>
    </footer>
  )
}
