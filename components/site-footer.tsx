import { cacheLife } from "next/cache"
import Link from "next/link"

import { RelicMark } from "@/components/relic-logo"
import { siteConfig } from "@/lib/site"

const links = [
  { href: "/license", label: "License" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
  { href: "/sitemap.xml", label: "Sitemap" },
  { href: "/robots.txt", label: "robots.txt" },
]

// The year is cached and refreshed daily, so pages can still be prerendered.
async function CurrentYear() {
  "use cache"
  cacheLife("days")
  return new Date().getFullYear()
}

function Dot() {
  return (
    <span aria-hidden className="text-border">
      ·
    </span>
  )
}

export function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="inline-flex items-center gap-1.5">
            <RelicMark className="size-4" title="" />
            {siteConfig.name} © <CurrentYear />
          </span>
          <Dot />
          <span>Open source · MIT</span>
          {siteConfig.supportEmail && (
            <>
              <Dot />
              <span>
                Support:{" "}
                <a
                  href={`mailto:${siteConfig.supportEmail}`}
                  className="hover:text-foreground"
                >
                  {siteConfig.supportEmail}
                </a>
              </span>
            </>
          )}
        </p>
        <nav
          aria-label="Footer"
          className="flex flex-wrap items-center gap-x-2 gap-y-1"
        >
          {links.map((link, i) => (
            <span key={link.href} className="flex items-center gap-2">
              {i > 0 && <Dot />}
              <Link href={link.href} className="hover:text-foreground">
                {link.label}
              </Link>
            </span>
          ))}
          <Dot />
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
    </footer>
  )
}
