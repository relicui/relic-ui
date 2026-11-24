"use client"

/**
 * Relic UI · Reach Rings
 * https://relic-ui.vercel.app/docs/reach-rings
 *
 * Copyright (c) 2026 Shubham Tambe
 * Open source under the MIT License: https://relic-ui.vercel.app/license
 */

import { useMemo, useState } from "react"
import { AnimatePresence, MotionConfig, motion } from "motion/react"

import { cn } from "@/lib/utils"

type Platform = "x" | "instagram" | "youtube" | "github" | "linkedin" | "twitch"

export type Reach = {
  platform: Platform | (string & {})
  followers: number
  handle?: string
  /** Ring color, if you want a different one. */
  color?: string
  /** Your own icon instead of the built-in glyph. */
  icon?: React.ReactNode
}

export interface ReachRingsProps {
  profiles: Reach[]
  /** Diameter in pixels. */
  size?: number
  /** Ring thickness in pixels. */
  thickness?: number
  /** Space between rings in pixels. */
  gap?: number
  /** How far round the biggest ring goes, in degrees. */
  sweep?: number
  /** Biggest audience on the outside. */
  sort?: boolean
  showLegend?: boolean
  /** Draw the rings in when they come into view. */
  animate?: boolean
  /** Words under the total. */
  label?: string
  className?: string
}

const PLATFORMS: Record<Platform, { name: string; color: string }> = {
  x: { name: "X", color: "var(--foreground)" },
  instagram: { name: "Instagram", color: "#E4405F" },
  youtube: { name: "YouTube", color: "#FF0033" },
  github: { name: "GitHub", color: "oklch(0.55 0.02 260)" },
  linkedin: { name: "LinkedIn", color: "#0A66C2" },
  twitch: { name: "Twitch", color: "#9146FF" },
}
const info = (p: string) => PLATFORMS[p as Platform] ?? { name: p, color: "var(--primary)" }

/** Simple glyphs drawn for Relic UI (not the official logos). */
function Glyph({ platform, className }: { platform: string; className?: string }) {
  const p = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, className, "aria-hidden": true }
  if (platform === "x") return <svg {...p}><path d="M5 4.5l14 15M19 4.5l-14 15" strokeWidth={2.4} /></svg>
  if (platform === "instagram")
    return <svg {...p}><rect x="3.5" y="3.5" width="17" height="17" rx="5" /><circle cx="12" cy="12" r="3.8" /></svg>
  if (platform === "youtube")
    return <svg {...p}><rect x="2.5" y="5.5" width="19" height="13" rx="4" /><path d="M10.2 9.3v5.4l4.6-2.7z" fill="currentColor" /></svg>
  if (platform === "github")
    return <svg {...p}><circle cx="6.5" cy="5.5" r="2" /><circle cx="6.5" cy="18.5" r="2" /><circle cx="17.5" cy="8" r="2" /><path d="M6.5 7.5v9M17.5 10c0 3.5-5 3-10 6.5" /></svg>
  if (platform === "linkedin")
    return <svg {...p}><rect x="3.5" y="3.5" width="17" height="17" rx="3" /><path d="M8 10.5v6M8 7.5v.01M12 16.5v-6M12 13a2.5 2.5 0 0 1 5 0v3.5" /></svg>
  if (platform === "twitch") return <svg {...p}><path d="M5 3.5h15v10l-4 4h-4l-3 3v-3H5z" /><path d="M11 8v4M15 8v4" /></svg>
  return <svg {...p}><circle cx="12" cy="12" r="8" /></svg>
}

const compact = (n: number) => new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(n)

function arc(c: number, r: number, deg: number) {
  const d = Math.min(Math.max(deg, 0.01), 359.99)
  const a = ((d - 90) * Math.PI) / 180
  const x = c + r * Math.cos(a)
  const y = c + r * Math.sin(a)
  return `M ${c} ${c - r} A ${r} ${r} 0 ${d > 180 ? 1 : 0} 1 ${x.toFixed(3)} ${y.toFixed(3)}`
}

/**
 * Your whole audience in one glance: a ring per platform, each as long as
 * that audience is big, with the combined reach in the middle. Point at a
 * ring (or a legend row) to see that platform's number and share.
 */
export function ReachRings({
  profiles,
  size = 220,
  thickness = 14,
  gap = 5,
  sweep = 290,
  sort = true,
  showLegend = true,
  animate = true,
  label = "total reach",
  className,
}: ReachRingsProps) {
  const [active, setActive] = useState<number | null>(null)
  const rings = useMemo(() => {
    const list = profiles.map((p, i) => ({ ...p, i }))
    if (sort) list.sort((a, b) => b.followers - a.followers)
    return list
  }, [profiles, sort])
  const max = Math.max(1, ...profiles.map((p) => p.followers))
  const total = profiles.reduce((t, p) => t + p.followers, 0)
  const c = size / 2
  const shown = active !== null ? rings.find((r) => r.i === active) : null

  return (
    <MotionConfig reducedMotion="user">
      <div data-slot="reach-rings" className={cn("flex flex-wrap items-center justify-center gap-6", className)} onMouseLeave={() => setActive(null)}>
        <div className="relative shrink-0" style={{ width: size, height: size }}>
          <svg viewBox={`0 0 ${size} ${size}`} className="size-full" role="img" aria-label={`${compact(total)} ${label} across ${profiles.length} platforms`}>
            {rings.map((ring, k) => {
              const r = c - thickness / 2 - k * (thickness + gap)
              if (r <= thickness / 2) return null
              const color = ring.color ?? info(ring.platform).color
              const dim = active !== null && active !== ring.i
              return (
                <g key={ring.i} className="transition-opacity duration-200" style={{ opacity: dim ? 0.3 : 1 }} onMouseEnter={() => setActive(ring.i)}>
                  <path d={arc(c, r, sweep)} fill="none" style={{ stroke: color }} strokeOpacity={0.12} strokeWidth={thickness} strokeLinecap="round" />
                  <motion.path
                    d={arc(c, r, (ring.followers / max) * sweep)}
                    fill="none"
                    style={{ stroke: color }}
                    strokeWidth={thickness}
                    strokeLinecap="round"
                    initial={animate ? { pathLength: 0 } : false}
                    whileInView={{ pathLength: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.1, delay: k * 0.12, ease: [0.22, 1, 0.36, 1] }}
                  />
                  {/* A wide invisible stroke makes the ring easy to point at. */}
                  <path d={arc(c, r, sweep)} fill="none" stroke="transparent" strokeWidth={thickness + gap} />
                </g>
              )
            })}
          </svg>

          {/* Platform marks where each ring starts. */}
          {rings.map((ring, k) => {
            const r = c - thickness / 2 - k * (thickness + gap)
            if (r <= thickness / 2) return null
            return (
              <span
                key={ring.i}
                aria-hidden
                className="pointer-events-none absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-center text-background"
                style={{ left: c, top: c - r, width: thickness * 0.7, height: thickness * 0.7 }}
              >
                {ring.icon ?? <Glyph platform={ring.platform} className="size-full" />}
              </span>
            )
          })}

          <div aria-hidden className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div
                key={shown ? shown.i : "total"}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
                className="flex flex-col items-center"
              >
                <span className="text-2xl font-semibold tracking-tight tabular-nums">{compact(shown ? shown.followers : total)}</span>
                <span className="text-[11px] text-muted-foreground">
                  {shown ? `${info(shown.platform).name} · ${Math.round((shown.followers / Math.max(total, 1)) * 100)}%` : label}
                </span>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {showLegend && (
          <ul className="flex min-w-36 flex-col gap-1 text-sm">
            {rings.map((ring) => {
              const color = ring.color ?? info(ring.platform).color
              return (
                <li key={ring.i}>
                  <button
                    type="button"
                    onMouseEnter={() => setActive(ring.i)}
                    onFocus={() => setActive(ring.i)}
                    onBlur={() => setActive(null)}
                    aria-label={`${info(ring.platform).name}${ring.handle ? ` @${ring.handle.replace(/^@/, "")}` : ""}: ${ring.followers.toLocaleString()}, ${Math.round(
                      (ring.followers / Math.max(total, 1)) * 100
                    )}% of reach`}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-md px-2 py-1 text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                      active === ring.i ? "bg-muted" : "hover:bg-muted/60"
                    )}
                  >
                    <span className="flex size-5 items-center justify-center" style={{ color }}>
                      {ring.icon ?? <Glyph platform={ring.platform} className="size-4" />}
                    </span>
                    <span className="flex-1 truncate text-muted-foreground">{info(ring.platform).name}</span>
                    <span className="font-mono text-xs font-medium tabular-nums">{compact(ring.followers)}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </MotionConfig>
  )
}
