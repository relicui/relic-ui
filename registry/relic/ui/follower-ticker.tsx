"use client"

/**
 * Relic UI · Follower Ticker
 * https://relic-ui.vercel.app/docs/follower-ticker
 *
 * Copyright (c) 2026 Shubham Tambe
 * Open source under the MIT License: https://relic-ui.vercel.app/license
 */

import { useState } from "react"
import { MotionConfig, motion } from "motion/react"

import { cn } from "@/lib/utils"

type Platform = "x" | "instagram" | "youtube" | "github" | "linkedin" | "twitch"

export interface FollowerTickerProps {
  platform: Platform | (string & {})
  /** Current followers. Change it and the digits roll. */
  count: number
  handle?: string
  /** Word after the number. Defaults to "subscribers" for YouTube, else "followers". */
  label?: string
  /** Goals to count towards. */
  milestones?: number[]
  /** A ring around the icon that fills towards the next milestone. */
  showRing?: boolean
  /** Show "520 to 13K" next to the count. */
  showNext?: boolean
  /** Stamp a little celebration when a milestone is crossed. */
  celebrate?: boolean
  /** Short numbers like 12.4K. */
  compact?: boolean
  size?: "sm" | "md" | "lg"
  /** Makes the whole badge a link to the profile. */
  href?: string
  /** Your own icon instead of the built-in glyph. */
  icon?: React.ReactNode
  locale?: string
  className?: string
}

const PLATFORMS: Record<Platform, { name: string; unit: string; color: string }> = {
  x: { name: "X", unit: "followers", color: "var(--foreground)" },
  instagram: { name: "Instagram", unit: "followers", color: "#E4405F" },
  youtube: { name: "YouTube", unit: "subscribers", color: "#FF0033" },
  github: { name: "GitHub", unit: "followers", color: "var(--foreground)" },
  linkedin: { name: "LinkedIn", unit: "followers", color: "#0A66C2" },
  twitch: { name: "Twitch", unit: "followers", color: "#9146FF" },
}
const info = (p: string) => PLATFORMS[p as Platform] ?? { name: p, unit: "followers", color: "var(--primary)" }

const DEFAULT_MILESTONES = [100, 500, 1_000, 5_000, 10_000, 25_000, 50_000, 100_000, 250_000, 500_000, 1_000_000, 5_000_000, 10_000_000]

/** Simple glyphs drawn for Relic UI (not the official logos). */
function Glyph({ platform }: { platform: string }) {
  const p = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.9, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, className: "size-[55%]", "aria-hidden": true }
  if (platform === "x") return <svg {...p}><path d="M5 4.5l14 15M19 4.5l-14 15" strokeWidth={2.3} /></svg>
  if (platform === "instagram")
    return <svg {...p}><rect x="3.5" y="3.5" width="17" height="17" rx="5" /><circle cx="12" cy="12" r="3.8" /><circle cx="17" cy="7" r="0.6" fill="currentColor" /></svg>
  if (platform === "youtube")
    return <svg {...p}><rect x="2.5" y="5.5" width="19" height="13" rx="4" /><path d="M10.2 9.3v5.4l4.6-2.7z" fill="currentColor" /></svg>
  if (platform === "github")
    return <svg {...p}><circle cx="6.5" cy="5.5" r="2" /><circle cx="6.5" cy="18.5" r="2" /><circle cx="17.5" cy="8" r="2" /><path d="M6.5 7.5v9M17.5 10c0 3.5-5 3-10 6.5" /></svg>
  if (platform === "linkedin")
    return <svg {...p}><rect x="3.5" y="3.5" width="17" height="17" rx="3" /><path d="M8 10.5v6M8 7.5v.01M12 16.5v-6M12 13a2.5 2.5 0 0 1 5 0v3.5" /></svg>
  if (platform === "twitch") return <svg {...p}><path d="M5 3.5h15v10l-4 4h-4l-3 3v-3H5z" /><path d="M11 8v4M15 8v4" /></svg>
  return <svg {...p}><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" /></svg>
}

function Digit({ n }: { n: number }) {
  return (
    <span className="relative inline-block h-[1em] w-[0.6em] overflow-hidden">
      <motion.span
        className="absolute inset-x-0 top-0 flex flex-col items-center"
        initial={false}
        animate={{ y: `${-n * 10}%` }}
        transition={{ type: "spring", stiffness: 150, damping: 19 }}
      >
        {Array.from({ length: 10 }, (_, i) => (
          <span key={i} className="flex h-[1em] items-center">
            {i}
          </span>
        ))}
      </motion.span>
    </span>
  )
}

const SIZES = {
  sm: { pill: "gap-2 py-1 pr-3 pl-1 text-sm", icon: "size-7", num: "text-sm" },
  md: { pill: "gap-2.5 py-1.5 pr-4 pl-1.5 text-sm", icon: "size-9", num: "text-lg" },
  lg: { pill: "gap-3 py-2 pr-5 pl-2 text-base", icon: "size-12", num: "text-2xl" },
}

/**
 * A follower count badge for X, Instagram, YouTube and more. Digits roll as
 * the number changes, a ring around the icon fills towards the next
 * milestone, and crossing one stamps a small celebration.
 */
export function FollowerTicker({
  platform,
  count,
  handle,
  label,
  milestones = DEFAULT_MILESTONES,
  showRing = true,
  showNext = true,
  celebrate = true,
  compact = false,
  size = "md",
  href,
  icon,
  locale,
  className,
}: FollowerTickerProps) {
  const p = info(platform)
  const unit = label ?? p.unit
  const s = SIZES[size]

  // Spot a milestone being crossed (React's "adjust state on prop change" pattern).
  const [prev, setPrev] = useState(count)
  const [stamp, setStamp] = useState<{ m: number; key: number } | null>(null)
  if (count !== prev) {
    const crossed = milestones.filter((m) => prev < m && count >= m).pop()
    if (crossed !== undefined && celebrate) setStamp({ m: crossed, key: (stamp?.key ?? 0) + 1 })
    setPrev(count)
  }

  const fmtCompact = (n: number) => new Intl.NumberFormat(locale ?? "en", { notation: "compact", maximumFractionDigits: 1 }).format(n)
  const text = compact ? fmtCompact(count) : count.toLocaleString(locale)
  const chars = Array.from(text)

  const sorted = [...milestones].sort((a, b) => a - b)
  const next = sorted.find((m) => m > count)
  const last = [...sorted].reverse().find((m) => m <= count) ?? 0
  const progress = next === undefined ? 1 : (count - last) / (next - last)
  const summary = `${count.toLocaleString(locale)} ${unit} on ${p.name}${handle ? ` (@${handle.replace(/^@/, "")})` : ""}${
    next !== undefined ? `. ${(next - count).toLocaleString(locale)} to go until ${fmtCompact(next)}.` : ""
  }`

  const Root = href ? "a" : "div"

  return (
    <MotionConfig reducedMotion="user">
      <Root
        data-slot="follower-ticker"
        {...(href ? { href, target: "_blank", rel: "noreferrer" } : {})}
        aria-label={summary}
        className={cn(
          "relative inline-flex items-center rounded-full border bg-background shadow-sm",
          href && "transition-colors outline-none hover:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/50",
          s.pill,
          className
        )}
      >
        <span className={cn("relative flex shrink-0 items-center justify-center rounded-full", s.icon)} style={{ color: p.color }}>
          <span className="absolute inset-[3px] rounded-full" style={{ background: `color-mix(in oklch, ${p.color} 12%, transparent)` }} />
          {showRing && (
            <svg aria-hidden viewBox="0 0 36 36" className="absolute inset-0 size-full -rotate-90">
              <circle cx="18" cy="18" r="16.5" fill="none" stroke="currentColor" strokeOpacity={0.12} strokeWidth={2} />
              <motion.circle
                cx="18"
                cy="18"
                r="16.5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                initial={false}
                animate={{ pathLength: Math.max(0.001, Math.min(progress, 1)) }}
                transition={{ type: "spring", stiffness: 80, damping: 18 }}
              />
            </svg>
          )}
          <span className="relative flex size-full items-center justify-center">{icon ?? <Glyph platform={platform} />}</span>
        </span>

        <span aria-hidden className="flex items-baseline gap-1.5 leading-none">
          <span className={cn("flex font-semibold tabular-nums", s.num)}>
            {chars.map((ch, i) => {
              const k = chars.length - i
              return /\d/.test(ch) ? (
                <Digit key={k} n={Number(ch)} />
              ) : (
                <span key={k} className="inline-block h-[1em]">
                  {ch}
                </span>
              )
            })}
          </span>
          <span className="text-muted-foreground">{unit}</span>
          {showNext && next !== undefined && (
            <span className="ml-1 hidden text-xs text-muted-foreground/80 sm:inline">
              · {fmtCompact(next - count)} to {fmtCompact(next)}
            </span>
          )}
        </span>

        {stamp && (
          <motion.span
            key={stamp.key}
            aria-hidden
            className="pointer-events-none absolute -top-3 left-6 z-10"
            initial={{ opacity: 0, scale: 0.3, rotate: -20, y: 6 }}
            animate={{ opacity: [0, 1, 1, 0], scale: [0.3, 1.15, 1, 0.9], rotate: [-20, -8, -8, -8], y: [6, -10, -10, -16] }}
            transition={{ duration: 2.4, times: [0, 0.15, 0.8, 1] }}
          >
            <span className="relative flex items-center justify-center">
              {Array.from({ length: 8 }, (_, r) => (
                <motion.span
                  key={r}
                  className="absolute h-1 w-1 rounded-full bg-brand"
                  initial={{ x: 0, y: 0, opacity: 1 }}
                  animate={{ x: Math.cos((r / 8) * Math.PI * 2) * 30, y: Math.sin((r / 8) * Math.PI * 2) * 22, opacity: 0 }}
                  transition={{ duration: 0.9, delay: 0.15, ease: "easeOut" }}
                />
              ))}
              <span className="rounded-md border-2 border-brand bg-background px-1.5 py-0.5 font-mono text-xs font-bold text-brand shadow-sm">
                {fmtCompact(stamp.m)}!
              </span>
            </span>
          </motion.span>
        )}
        <span className="sr-only" role="status">
          {stamp ? `Milestone reached: ${fmtCompact(stamp.m)} ${unit}` : ""}
        </span>
      </Root>
    </MotionConfig>
  )
}
