"use client"

/**
 * Relic UI · Profile Deck
 * https://relic-ui.vercel.app/docs/profile-deck
 *
 * Copyright (c) 2026 Shubham Tambe
 * Open source under the MIT License: https://relic-ui.vercel.app/license
 */

import { useEffect, useId, useState } from "react"
import { MotionConfig, motion, useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"

export type Platform = "x" | "instagram" | "youtube" | "github" | "linkedin" | "twitch"

export type SocialProfile = {
  platform: Platform | (string & {})
  handle: string
  /** Shown big on the card. */
  followers: number
  /** Overrides the deck's name for this card. */
  name?: string
  /** Overrides the deck's avatar for this card. */
  avatar?: string
  bio?: string
  /** Extra numbers, e.g. { label: "Videos", value: 128 }. */
  stats?: { label: string; value: number | string }[]
  href?: string
  /** Your own icon instead of the built-in glyph. */
  icon?: React.ReactNode
}

export interface ProfileDeckProps {
  profiles: SocialProfile[]
  /** Your name, shown on every card. */
  name?: string
  /** Your picture (URL). Initials are used without one. */
  avatar?: string
  /** A neat stack, or cards fanned out like a hand. */
  layout?: "stack" | "fan"
  /** Color each card's band in the platform's color. */
  tint?: boolean
  /** Deal the next card every n seconds. 0 for off. */
  autoShuffle?: number
  /** The card on top (controlled). */
  index?: number
  onIndexChange?: (index: number) => void
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

/** Simple glyphs drawn for Relic UI (not the official logos). */
export function PlatformGlyph({ platform, className }: { platform: string; className?: string }) {
  const common = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, className: cn("size-4", className), "aria-hidden": true }
  switch (platform) {
    case "x":
      return (
        <svg {...common}>
          <path d="M5 4.5l14 15M19 4.5l-14 15" strokeWidth={2.2} />
        </svg>
      )
    case "instagram":
      return (
        <svg {...common}>
          <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
          <circle cx="12" cy="12" r="3.8" />
          <circle cx="17" cy="7" r="0.6" fill="currentColor" />
        </svg>
      )
    case "youtube":
      return (
        <svg {...common}>
          <rect x="2.5" y="5.5" width="19" height="13" rx="4" />
          <path d="M10.2 9.3v5.4l4.6-2.7z" fill="currentColor" />
        </svg>
      )
    case "github":
      return (
        <svg {...common}>
          <circle cx="6.5" cy="5.5" r="2" />
          <circle cx="6.5" cy="18.5" r="2" />
          <circle cx="17.5" cy="8" r="2" />
          <path d="M6.5 7.5v9M17.5 10c0 3.5-5 3-10 6.5" />
        </svg>
      )
    case "linkedin":
      return (
        <svg {...common}>
          <rect x="3.5" y="3.5" width="17" height="17" rx="3" />
          <path d="M8 10.5v6M8 7.5v.01M12 16.5v-6M12 13a2.5 2.5 0 0 1 5 0v3.5" />
        </svg>
      )
    case "twitch":
      return (
        <svg {...common}>
          <path d="M5 3.5h15v10l-4 4h-4l-3 3v-3H5z" />
          <path d="M11 8v4M15 8v4" />
        </svg>
      )
    default:
      return (
        <svg {...common}>
          <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />
        </svg>
      )
  }
}

const compact = (n: number) => new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(n)
const initials = (name?: string) =>
  (name ?? "?")
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

function Card({ profile, name, avatar, tint }: { profile: SocialProfile; name?: string; avatar?: string; tint: boolean }) {
  const p = info(profile.platform)
  const who = profile.name ?? name
  const pic = profile.avatar ?? avatar
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border bg-background shadow-lg">
      <div
        className="relative flex h-16 shrink-0 items-start justify-between p-3"
        style={{ background: tint ? `color-mix(in oklch, ${p.color} 16%, var(--background))` : "var(--muted)" }}
      >
        <span className="flex items-center gap-1.5 text-xs font-medium" style={{ color: tint ? p.color : undefined }}>
          {profile.icon ?? <PlatformGlyph platform={profile.platform} />}
          {p.name}
        </span>
        {profile.href && (
          <a
            href={profile.href}
            target="_blank"
            rel="noreferrer"
            onPointerDownCapture={(e) => e.stopPropagation()}
            className="rounded-full bg-background/80 px-2 py-0.5 text-[11px] font-medium transition-colors outline-none hover:bg-background focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            Visit ↗
          </a>
        )}
      </div>
      {/* relative: keeps the avatar above the colored band it overlaps. */}
      <div className="relative -mt-7 flex flex-1 flex-col gap-2 px-4 pb-4">
        <span className="flex size-14 items-center justify-center overflow-hidden rounded-full border-4 border-background bg-muted text-base font-semibold">
          {pic ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={pic} alt="" className="size-full object-cover" draggable={false} />
          ) : (
            initials(who)
          )}
        </span>
        <div className="min-w-0">
          {who && <div className="truncate font-semibold">{who}</div>}
          <div className="truncate text-sm text-muted-foreground">@{profile.handle.replace(/^@/, "")}</div>
        </div>
        {profile.bio && <p className="line-clamp-2 text-xs text-muted-foreground">{profile.bio}</p>}
        <div className="mt-auto flex items-end justify-between gap-3">
          <div>
            <div className="text-3xl font-semibold tracking-tight tabular-nums">{compact(profile.followers)}</div>
            <div className="text-xs text-muted-foreground">{p.unit}</div>
          </div>
          {profile.stats && (
            <dl className="flex gap-3 text-right">
              {profile.stats.slice(0, 2).map((s) => (
                <div key={s.label}>
                  <dt className="text-[10px] text-muted-foreground">{s.label}</dt>
                  <dd className="text-sm font-medium tabular-nums">{typeof s.value === "number" ? compact(s.value) : s.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * One person, every platform: profile cards stacked like a deck. Flick the
 * top card away (or use the arrow keys, or the platform tabs) to deal the
 * next one. Made for link-in-bio pages, creator sites and media kits.
 */
export function ProfileDeck({
  profiles,
  name,
  avatar,
  layout = "stack",
  tint = true,
  autoShuffle = 0,
  index: indexProp,
  onIndexChange,
  className,
}: ProfileDeckProps) {
  const [internal, setInternal] = useState(0)
  const n = profiles.length
  const top = n ? (((indexProp ?? internal) % n) + n) % n : 0
  const [paused, setPaused] = useState(false)
  const reduce = useReducedMotion()
  const id = useId()

  function go(next: number) {
    const i = ((next % n) + n) % n
    if (indexProp === undefined) setInternal(i)
    onIndexChange?.(i)
  }

  useEffect(() => {
    if (!autoShuffle || paused || n < 2) return
    const timer = window.setInterval(() => {
      const i = (top + 1) % n
      if (indexProp === undefined) setInternal(i)
      onIndexChange?.(i)
    }, autoShuffle * 1000)
    return () => window.clearInterval(timer)
  }, [autoShuffle, paused, n, top, indexProp, onIndexChange])

  if (!n) return null

  return (
    <MotionConfig reducedMotion="user">
      <div
        data-slot="profile-deck"
        className={cn("flex w-full max-w-xs flex-col items-center gap-4", className)}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
      >
        <div
          role="group"
          aria-roledescription="deck"
          aria-label={`${name ?? "Profile"} on ${n} platforms`}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight" || e.key === "ArrowDown") {
              e.preventDefault()
              go(top + 1)
            } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
              e.preventDefault()
              go(top - 1)
            }
          }}
          className="relative h-64 w-full rounded-2xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {profiles.map((profile, i) => {
            const depth = (i - top + n) % n
            const visible = depth < 4
            const fan = layout === "fan"
            return (
              <motion.div
                key={`${profile.platform}-${profile.handle}`}
                aria-hidden={depth !== 0}
                className={cn("absolute inset-0", depth === 0 ? "cursor-grab active:cursor-grabbing" : "pointer-events-none")}
                style={{ zIndex: n - depth, transformOrigin: fan ? "50% 120%" : "50% 100%" }}
                initial={false}
                animate={{
                  y: fan ? depth * 4 : depth * 12,
                  x: fan ? depth * 18 : 0,
                  scale: 1 - depth * (fan ? 0.03 : 0.05),
                  rotate: fan ? depth * 6 : 0,
                  opacity: visible ? 1 - depth * 0.12 : 0,
                }}
                transition={{ type: "spring", stiffness: 260, damping: 26 }}
                drag={depth === 0 && !reduce ? "x" : false}
                dragSnapToOrigin
                dragElastic={0.6}
                onDragEnd={(_, info) => {
                  if (Math.abs(info.offset.x) > 90 || Math.abs(info.velocity.x) > 500) go(top + (info.offset.x < 0 ? -1 : 1))
                }}
                whileDrag={{ rotate: 0, scale: 1.02 }}
              >
                <Card profile={profile} name={name} avatar={avatar} tint={tint} />
              </motion.div>
            )
          })}
        </div>

        {/* Platform buttons double as the deck's position. */}
        <div role="group" aria-label="Platforms" className={cn("relative z-10 flex gap-1 rounded-full border bg-background p-1", layout === "fan" && "mt-6")}>
          {profiles.map((profile, i) => (
            <button
              key={`${profile.platform}-${profile.handle}`}
              type="button"
              aria-current={i === top || undefined}
              aria-label={`${info(profile.platform).name}, ${compact(profile.followers)} ${info(profile.platform).unit}`}
              onClick={() => go(i)}
              className={cn(
                "relative flex size-8 items-center justify-center rounded-full transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                i === top ? "text-background" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {i === top && <motion.span layoutId={`${id}-tab`} className="absolute inset-0 rounded-full bg-foreground" transition={{ type: "spring", stiffness: 400, damping: 30 }} />}
              <span className="relative">{profile.icon ?? <PlatformGlyph platform={profile.platform} />}</span>
            </button>
          ))}
        </div>
        <span className="sr-only" aria-live="polite">
          {info(profiles[top].platform).name}: @{profiles[top].handle.replace(/^@/, "")}, {profiles[top].followers.toLocaleString("en-US")} {info(profiles[top].platform).unit}
        </span>
      </div>
    </MotionConfig>
  )
}
