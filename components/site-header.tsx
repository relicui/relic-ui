import Link from "next/link"

import { RelicLogo } from "@/components/relic-logo"
import { siteConfig } from "@/lib/site"

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-4">
        <Link
          href="/"
          aria-label={`${siteConfig.name} home`}
          className="group rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {/* Breathes and glints quietly; blinks and glints on hover. */}
          <RelicLogo animated />
        </Link>
        <nav className="flex items-center gap-4 text-sm text-muted-foreground">
          <Link href="/docs" className="hover:text-foreground">
            Docs
          </Link>
          <a
            href={siteConfig.github}
            target="_blank"
            rel="noreferrer"
            className="hover:text-foreground"
          >
            GitHub
          </a>
        </nav>
      </div>
    </header>
  )
}
