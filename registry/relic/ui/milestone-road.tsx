"use client"

/**
 * Relic UI · Milestone Road
 * https://relic-ui.vercel.app/docs/milestone-road
 *
 * Copyright (c) 2026 Shubham Tambe
 * Open source under the MIT License: https://relic-ui.vercel.app/license
 */

import { useMemo } from "react"
import { MotionConfig, motion } from "motion/react"

import { cn } from "@/lib/utils"

export type GrowthPoint = { date: string | Date; count: number }

export interface MilestoneRoadProps {
  /** Followers right now. */
  count: number
  /** Goals along the road. */
  milestones?: number[]
  /** Past counts with dates: used to date the milestones you passed and to project the next one. */
  history?: GrowthPoint[]
  /** How many milestones fit on the road at once. */
  visible?: number
  /** Word for what is counted. */
  unit?: string
  /** Estimate when the next milestones will be reached. */
  showProjection?: boolean
  /** What travels along the road: initials, an icon, an image … */
  marker?: React.ReactNode
  locale?: string
  className?: string
}

const DEFAULT_MILESTONES = [100, 500, 1_000, 2_500, 5_000, 10_000, 25_000, 50_000, 100_000, 250_000, 500_000, 1_000_000]
const DAY = 86_400_000

const toTime = (d: string | Date) => (d instanceof Date ? d.getTime() : new Date(d).getTime())

/**
 * The road to your next follower milestone. Passed milestones carry the date
 * you reached them, the next one shows when you'll likely get there at your
 * current pace, and a marker walks the road as the count grows.
 */
export function MilestoneRoad({
  count,
  milestones = DEFAULT_MILESTONES,
  history,
  visible = 5,
  unit = "followers",
  showProjection = true,
  marker,
  locale,
  className,
}: MilestoneRoadProps) {
  const compact = (n: number) => new Intl.NumberFormat(locale ?? "en", { notation: "compact", maximumFractionDigits: 1 }).format(n)
  // UTC keeps the server and browser in agreement, whatever their time zones.
  const date = (t: number) => new Intl.DateTimeFormat(locale ?? "en", { month: "short", day: "numeric", timeZone: "UTC" }).format(t)

  const model = useMemo(() => {
    const sorted = [...new Set(milestones)].sort((a, b) => a - b)
    const passed = sorted.filter((m) => m <= count).length
    const first = Math.max(0, Math.min(passed - 2, sorted.length - visible))
    const shown = sorted.slice(first, first + visible)
    const stops = first === 0 ? [0, ...shown] : shown

    // When each milestone was first reached, and the recent pace.
    const points = (history ?? []).map((h) => ({ t: toTime(h.date), c: h.count })).filter((p) => !Number.isNaN(p.t)).sort((a, b) => a.t - b.t)
    const reachedAt = new Map<number, number>()
    for (const m of shown) {
      const hit = points.find((p) => p.c >= m)
      if (hit) reachedAt.set(m, hit.t)
    }
    let perDay = 0
    if (points.length >= 2) {
      const last = points[points.length - 1]
      const from = points.find((p) => p.t >= last.t - 30 * DAY) ?? points[0]
      const days = (last.t - from.t) / DAY
      if (days > 0) perDay = (last.c - from.c) / days
    }
    // Projections count from the latest history point (no history, no projection).
    const now = points.length ? points[points.length - 1].t : 0

    // Where the marker sits along the road (0 to 1).
    let at = 1
    for (let i = 0; i < stops.length - 1; i++) {
      if (count < stops[i + 1]) {
        const local = Math.max(0, (count - stops[i]) / (stops[i + 1] - stops[i]))
        at = (i + local) / (stops.length - 1)
        break
      }
    }
    if (count < stops[0]) at = 0
    return { stops, reachedAt, perDay, now, at }
  }, [milestones, count, history, visible])

  const next = model.stops.find((m) => m > count)

  return (
    <MotionConfig reducedMotion="user">
      <div data-slot="milestone-road" className={cn("w-full overflow-x-clip px-4", className)}>
        <div className="relative h-28">
          {/* The road: walked part in gold, the rest dashed. */}
          <span aria-hidden className="absolute inset-x-0 top-14 h-0 border-t-2 border-dashed border-muted-foreground/30" />
          <motion.span
            aria-hidden
            className="absolute inset-x-0 top-[54px] h-[3px] origin-left rounded-full bg-brand"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: model.at }}
            viewport={{ once: true }}
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
          />

          <ol aria-label={`Milestones, ${count.toLocaleString(locale)} ${unit} so far`}>
            {model.stops.map((m, i) => {
              const x = (i / (model.stops.length - 1)) * 100
              const reached = m <= count
              const isNext = m === next
              const when = model.reachedAt.get(m)
              const days = isNext && model.perDay > 0 ? Math.ceil((m - count) / model.perDay) : null
              const description = m === 0
                ? "Start"
                : reached
                  ? `${compact(m)} reached${when ? ` on ${date(when)}` : ""}`
                  : days !== null && showProjection
                    ? `${compact(m)}: about ${days} day${days === 1 ? "" : "s"} away at the current pace`
                    : `${compact(m)}: ${(m - count).toLocaleString(locale)} to go`
              return (
                <li key={m} tabIndex={m === 0 ? -1 : 0} aria-label={description} className="group absolute top-0 -translate-x-1/2 outline-none" style={{ left: `${x}%` }}>
                  {/* Flag */}
                  {m > 0 && (
                    <span aria-hidden className="absolute bottom-[-52px] left-1/2 flex h-[52px] w-px -translate-x-1/2 items-start justify-start">
                      <span className={cn("h-full w-px", reached ? "bg-foreground/70" : "bg-muted-foreground/40")} />
                      <motion.span
                        className={cn(
                          "absolute top-0 left-px h-3.5 w-5 origin-left [clip-path:polygon(0_0,100%_25%,0_100%)]",
                          reached ? "bg-foreground" : isNext ? "bg-brand" : "bg-muted-foreground/30"
                        )}
                        animate={isNext ? { scaleX: [1, 0.82, 1] } : undefined}
                        transition={isNext ? { duration: 1.6, repeat: Infinity, ease: "easeInOut" } : undefined}
                      />
                    </span>
                  )}
                  <span
                    aria-hidden
                    className={cn(
                      "absolute top-[52px] left-1/2 size-2.5 -translate-x-1/2 rounded-full border-2 border-background",
                      reached ? "bg-foreground" : isNext ? "bg-brand" : "bg-muted-foreground/40",
                      "group-focus-visible:ring-2 group-focus-visible:ring-ring"
                    )}
                  />
                  <span aria-hidden className="absolute top-[70px] left-1/2 flex -translate-x-1/2 flex-col items-center text-center whitespace-nowrap">
                    <span className={cn("font-mono text-xs font-semibold", !reached && !isNext && "text-muted-foreground")}>{m === 0 ? "Start" : compact(m)}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {m === 0 ? "" : reached ? (when ? date(when) : "reached") : isNext && showProjection && days !== null ? `≈ ${date(model.now + days * DAY)}` : isNext ? `${compact(m - count)} to go` : ""}
                    </span>
                  </span>
                </li>
              )
            })}
          </ol>

          {/* The traveller */}
          {/* A full-width rail slides right; the traveller rides its left edge. */}
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-[38px] z-10"
            initial={{ x: "0%" }}
            whileInView={{ x: `${model.at * 100}%` }}
            viewport={{ once: true }}
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.span
              className="absolute left-0 flex size-8 -translate-x-1/2 items-center justify-center overflow-hidden rounded-full border-2 border-brand bg-background text-[11px] font-semibold shadow-md"
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
            >
              {marker ?? compact(count)}
            </motion.span>
          </motion.div>
        </div>

        {next !== undefined && (
          <p className="mt-2 text-center text-xs text-muted-foreground">
            <span className="font-mono font-medium text-foreground">{(next - count).toLocaleString(locale)}</span> {unit} to {compact(next)}
            {showProjection && model.perDay > 0 && (
              <>
                {" · "}+{Math.round(model.perDay).toLocaleString(locale)} a day lately
              </>
            )}
          </p>
        )}
      </div>
    </MotionConfig>
  )
}
