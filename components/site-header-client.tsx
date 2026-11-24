"use client"

import { useEffect, useState, useSyncExternalStore } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { AnimatePresence, MotionConfig, motion } from "motion/react"
import { Moon, Search, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { RelicLogo } from "@/components/relic-logo"
import { siteConfig } from "@/lib/site"
import { switchTheme, THEME_TOGGLE_ID } from "@/lib/theme-transition"
import { cn } from "@/lib/utils"

const LINKS = [
  { href: "/components", label: "Components" },
  { href: "/docs", label: "Docs" },
  { href: "/license", label: "License" },
]

const SEARCH_INPUT_ID = "gallery-search"

function isActive(pathname: string, href: string) {
  if (href === "/docs") return pathname === "/docs" || pathname.startsWith("/docs/")
  return pathname === href
}

/* Scroll position as an external store, so there are no effects to sync. */
function subscribeScroll(callback: () => void) {
  window.addEventListener("scroll", callback, { passive: true })
  return () => window.removeEventListener("scroll", callback)
}
const getScrolled = () => window.scrollY > 24
const getServerScrolled = () => false

/**
 * The site header. At the top of the page it sits flat and full width; once
 * you scroll it gathers into a floating pill. The current page is marked by a
 * blinking gold caret, the Relic UI signature.
 */
export function SiteHeaderClient({ stars }: { stars: number | null }) {
  const pathname = usePathname()
  const router = useRouter()
  const scrolled = useSyncExternalStore(subscribeScroll, getScrolled, getServerScrolled)
  const [hovered, setHovered] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  function openSearch(e?: React.MouseEvent) {
    // Already on the gallery: just focus its search box.
    if (pathname === "/components") {
      e?.preventDefault()
      document.getElementById(SEARCH_INPUT_ID)?.focus()
    }
    setMenuOpen(false)
  }

  // "/" opens the gallery search from any page. Listens on window so a page's
  // own "/" shortcut (which runs first, on document) can claim the key.
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false)
      if (e.key !== "/" || e.defaultPrevented || e.metaKey || e.ctrlKey) return
      const target = e.target as HTMLElement | null
      const typing =
        target?.isContentEditable ||
        ["INPUT", "TEXTAREA", "SELECT"].includes(target?.tagName ?? "")
      if (typing || pathname === "/components") return
      e.preventDefault()
      router.push("/components#search")
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [pathname, router])

  return (
    <MotionConfig reducedMotion="user">
      <header className="fixed inset-x-0 top-0 z-50 px-3">
        <motion.div
          initial={false}
          animate={{
            maxWidth: scrolled ? 820 : 1152,
            marginTop: scrolled ? 10 : 0,
            height: scrolled ? 52 : 64,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 34 }}
          className={cn(
            "relative mx-auto flex items-center gap-2 border transition-[background-color,border-color,box-shadow,border-radius,padding] duration-300",
            scrolled
              ? "rounded-full border-border bg-background/80 pr-2 pl-4 shadow-lg shadow-black/5 backdrop-blur-md dark:shadow-black/40"
              : "rounded-none border-transparent bg-background/0 px-4"
          )}
        >
          <Link
            href="/"
            aria-label={`${siteConfig.name} home`}
            onClick={() => setMenuOpen(false)}
            className="group mr-2 shrink-0 rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <RelicLogo animated />
          </Link>

          {/* Desktop links */}
          <nav
            aria-label="Main"
            onMouseLeave={() => setHovered(null)}
            className="hidden items-center md:flex"
          >
            {LINKS.map((link) => {
              const active = isActive(pathname, link.href)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  onMouseEnter={() => setHovered(link.href)}
                  onFocus={() => setHovered(link.href)}
                  onBlur={() => setHovered(null)}
                  className={cn(
                    "relative isolate rounded-full px-3 py-1.5 text-sm transition-colors outline-none",
                    active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {hovered === link.href && (
                    <motion.span
                      layoutId="nav-hover"
                      className="absolute inset-0 -z-10 rounded-full bg-muted"
                      transition={{ type: "spring", stiffness: 500, damping: 36 }}
                    />
                  )}
                  <span className="inline-flex items-center gap-1.5">
                    {active && <ActiveCaret />}
                    {link.label}
                  </span>
                </Link>
              )
            })}
          </nav>

          <div className="flex-1" />

          {/* Search */}
          <Link
            href="/components#search"
            onClick={openSearch}
            className="hidden h-8 items-center gap-2 rounded-full border bg-muted/40 pr-1.5 pl-3 text-sm text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 sm:inline-flex"
          >
            <Search className="size-3.5" />
            <span className="pr-4">Search components</span>
            <kbd className="rounded-full border bg-background px-1.5 font-mono text-[10px]">
              /
            </kbd>
          </Link>

          <ThemeToggle />

          <GitHubStars stars={stars} />

          {/* Mobile menu button */}
          <button
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen((open) => !open)}
            className="relative inline-flex size-8 items-center justify-center rounded-full text-foreground transition-colors outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 md:hidden"
          >
            <motion.span
              aria-hidden
              className="absolute h-[1.5px] w-4 rounded-full bg-current"
              animate={menuOpen ? { rotate: 45, y: 0 } : { rotate: 0, y: -3 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
            <motion.span
              aria-hidden
              className="absolute h-[1.5px] w-4 rounded-full bg-current"
              animate={menuOpen ? { rotate: -45, y: 0 } : { rotate: 0, y: 3 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          </button>

          {/* Mobile menu */}
          <AnimatePresence>
            {menuOpen && (
              <motion.nav
                id="mobile-menu"
                aria-label="Main"
                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.98, transition: { duration: 0.15 } }}
                transition={{ type: "spring", stiffness: 420, damping: 32 }}
                className="absolute inset-x-0 top-full mt-2 origin-top rounded-2xl border bg-background/95 p-2 shadow-xl backdrop-blur-md md:hidden"
              >
                {[...LINKS, { href: "/components#search", label: "Search components" }].map(
                  (link, i) => {
                    const active = isActive(pathname, link.href)
                    return (
                      <motion.div
                        key={link.href}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.04 * i, duration: 0.2 }}
                      >
                        <Link
                          href={link.href}
                          aria-current={active ? "page" : undefined}
                          onClick={(e) =>
                            link.href.includes("#search") ? openSearch(e) : setMenuOpen(false)
                          }
                          className={cn(
                            "flex items-center gap-2 rounded-xl px-3 py-2.5 text-base transition-colors hover:bg-muted",
                            active ? "text-foreground" : "text-muted-foreground"
                          )}
                        >
                          {active && <ActiveCaret />}
                          {link.label}
                        </Link>
                      </motion.div>
                    )
                  }
                )}
                <div className="mt-1 border-t px-3 pt-3 pb-1">
                  <a
                    href={siteConfig.github}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                  >
                    <GitHubMark className="size-4" /> GitHub
                  </a>
                </div>
              </motion.nav>
            )}
          </AnimatePresence>
        </motion.div>
      </header>
      {/* Keeps page content below the fixed header. */}
      <div aria-hidden className="h-16" />
    </MotionConfig>
  )
}

/** The blinking gold caret that marks the current page. */
function ActiveCaret() {
  return (
    <span
      aria-hidden
      className="h-3.5 w-0.5 shrink-0 animate-caret-blink rounded-full bg-brand motion-reduce:animate-none"
    />
  )
}

/* -------------------------------------------------------------------------- */
/*                               Live star count                              */
/* -------------------------------------------------------------------------- */

const STAR_CACHE_KEY = "relic-ui:github-stars"
const STAR_CACHE_MS = 5 * 60 * 1000
const repoSlug = siteConfig.github.replace(/^https?:\/\/github\.com\//, "")

/**
 * Starts from the count the server rendered, then asks GitHub for the latest
 * one in the browser, so a new star shows up right away. The answer is kept
 * for 5 minutes so moving between pages doesn't ask GitHub again.
 */
function useLiveStars(initial: number | null) {
  const [live, setLive] = useState<number | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    async function refresh() {
      try {
        const cached = JSON.parse(sessionStorage.getItem(STAR_CACHE_KEY) ?? "null")
        if (cached && Date.now() - cached.at < STAR_CACHE_MS) {
          setLive(cached.count)
          return
        }
      } catch {
        // Storage can be blocked (private mode); just ask GitHub.
      }
      try {
        const res = await fetch(`https://api.github.com/repos/${repoSlug}`, {
          headers: { Accept: "application/vnd.github+json" },
          signal: controller.signal,
        })
        if (!res.ok) return
        const data: { stargazers_count?: unknown } = await res.json()
        if (typeof data.stargazers_count !== "number") return
        setLive(data.stargazers_count)
        try {
          sessionStorage.setItem(
            STAR_CACHE_KEY,
            JSON.stringify({ count: data.stargazers_count, at: Date.now() })
          )
        } catch {
          // Ignore storage errors.
        }
      } catch {
        // Offline or rate limited: keep the server's number.
      }
    }

    refresh()
    return () => controller.abort()
  }, [])

  return live ?? initial
}

/** Short form for big numbers: 2587 → "2.6k". */
function formatStars(n: number) {
  if (n < 1000) return String(n)
  return `${(n / 1000).toFixed(n < 10000 ? 1 : 0).replace(/\.0$/, "")}k`
}

/**
 * GitHub button with the live star count. The digits roll up into place
 * one after another, like the numbers on the Dial Number Input. The star
 * fills in on hover, a small invitation to click it.
 */
function GitHubStars({ stars: initial }: { stars: number | null }) {
  const stars = useLiveStars(initial)
  // Always show the number, even 0, so the count is visible from day one.
  const text = stars !== null ? formatStars(stars) : ""
  const label =
    stars === null
      ? "Relic UI on GitHub"
      : `Star Relic UI on GitHub, ${stars} ${stars === 1 ? "star" : "stars"}`

  return (
    <a
      href={siteConfig.github}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      className="group/stars hidden h-8 items-center gap-2 rounded-full border bg-background/60 pr-3 pl-2.5 text-sm text-muted-foreground transition-colors outline-none hover:border-foreground/25 hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 sm:inline-flex"
    >
      <GitHubMark className="size-4" />
      {stars !== null && (
        <>
          <span aria-hidden className="h-4 w-px bg-border" />
          <span aria-hidden className="inline-flex items-center gap-1">
            <svg
              viewBox="0 0 16 16"
              className="size-3.5 fill-transparent stroke-current transition-[fill] duration-300 group-hover/stars:fill-current"
              strokeWidth={1.3}
              strokeLinejoin="round"
            >
              <path d="M8 1.6l1.9 3.9 4.3.6-3.1 3 .7 4.3L8 11.4l-3.8 2 .7-4.3-3.1-3 4.3-.6z" />
            </svg>
            <span className="inline-flex overflow-hidden font-mono text-xs tabular-nums">
              {Array.from(text).map((ch, i) => (
                <motion.span
                  key={`${text}-${i}`}
                  className="inline-block"
                  initial={{ y: "100%", opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{
                    delay: 0.4 + i * 0.07,
                    type: "spring",
                    stiffness: 400,
                    damping: 28,
                  }}
                >
                  {ch}
                </motion.span>
              ))}
            </span>
          </span>
        </>
      )}
    </a>
  )
}

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()

  return (
    <button
      type="button"
      aria-label="Switch between light and dark mode"
      title="Toggle theme (D)"
      id={THEME_TOGGLE_ID}
      onClick={() => switchTheme(resolvedTheme === "dark" ? "light" : "dark", setTheme)}
      className="relative inline-flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      {/* Pure CSS swap, so it renders correctly before the theme is known. */}
      <Sun className="size-4 scale-100 rotate-0 transition-transform duration-300 dark:scale-0 dark:-rotate-90" />
      <Moon className="absolute size-4 scale-0 rotate-90 transition-transform duration-300 dark:scale-100 dark:rotate-0" />
    </button>
  )
}

function GitHubMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden className={className}>
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
  )
}
