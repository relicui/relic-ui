"use client"

/**
 * Relic UI · Week Pulse
 * https://relic-ui.vercel.app/docs/week-pulse
 *
 * Copyright (c) 2026 Shubham Tambe
 * Open source under the MIT License: https://relic-ui.vercel.app/license
 */

import { useMemo, useRef, useState } from "react"
import { MotionConfig, motion } from "motion/react"

import { cn } from "@/lib/utils"

export interface WeekPulseProps {
  /** 7 rows (days) of 24 numbers (hours). */
  data: number[][]
  /** Day names, top to bottom. */
  days?: string[]
  /** Color ramp for the cells. */
  scale?: "primary" | "heat" | "brand"
  shape?: "square" | "circle"
  /** Gap between cells in pixels. */
  gap?: number
  /** Show a total bar for every day and every hour. */
  showTotals?: boolean
  /** Make the busiest N hours pulse. 0 for none. */
  highlightTop?: number
  hourFormat?: "24h" | "12h"
  /** Word used in the tooltip, e.g. "visits", "orders". */
  unit?: string
  /** Format the numbers in the tooltip and totals. */
  formatValue?: (value: number) => string
  /** Ripple the cells in when they come into view. */
  animate?: boolean
  showLegend?: boolean
  onCellClick?: (cell: { day: number; hour: number; value: number }) => void
  /** Accessible name of the grid. */
  label?: string
  className?: string
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
const AMBER = "oklch(0.83 0.15 82)"
const RED = "oklch(0.62 0.22 30)"

function colorFor(t: number, scale: WeekPulseProps["scale"]) {
  if (t <= 0) return "color-mix(in oklch, var(--muted) 70%, transparent)"
  const p = Math.round(15 + t * 85)
  if (scale === "heat") {
    return t < 0.5
      ? `color-mix(in oklch, ${AMBER} ${Math.round(20 + t * 160)}%, var(--muted))`
      : `color-mix(in oklch, ${RED} ${Math.round((t - 0.5) * 200)}%, ${AMBER})`
  }
  return `color-mix(in oklch, var(${scale === "brand" ? "--brand" : "--primary"}) ${p}%, var(--muted))`
}

function hourText(h: number, format: "24h" | "12h") {
  if (format === "24h") return `${String(h % 24).padStart(2, "0")}:00`
  const n = h % 24
  return `${n % 12 === 0 ? 12 : n % 12} ${n < 12 ? "AM" : "PM"}`
}

function hourTick(h: number, format: "24h" | "12h") {
  if (format === "24h") return String(h)
  return `${h % 12 === 0 ? 12 : h % 12}${h < 12 ? "a" : "p"}`
}

/** Bars that grow in when seen (by scaling, which stays smooth), or just sit at their size. */
function grow(prop: "scaleX" | "scaleY", size: number, animate: boolean) {
  return animate
    ? { initial: { [prop]: 0 }, whileInView: { [prop]: size }, viewport: { once: true } }
    : { style: { [prop]: size } }
}

/**
 * A 7 × 24 heatmap of when things happen: visits, orders, messages. Hovering
 * draws a crosshair through the day and the hour, the busiest hours pulse,
 * and totals along the edges show the shape of the week at a glance.
 */
export function WeekPulse({
  data,
  days = DAYS,
  scale = "primary",
  shape = "square",
  gap = 3,
  showTotals = true,
  highlightTop = 3,
  hourFormat = "24h",
  unit = "visits",
  formatValue = (n) => n.toLocaleString(),
  animate = true,
  showLegend = true,
  onCellClick,
  label = "Activity by day and hour",
  className,
}: WeekPulseProps) {
  const [hover, setHover] = useState<{ d: number; h: number } | null>(null)
  const [focus, setFocus] = useState({ d: 0, h: 0 })
  const [focusVisible, setFocusVisible] = useState(false)
  const cells = useRef(new Map<number, HTMLElement>())

  const stats = useMemo(() => {
    let max = 0
    const flat: { d: number; h: number; v: number }[] = []
    const dayTotals = new Array<number>(7).fill(0)
    const hourTotals = new Array<number>(24).fill(0)
    for (let d = 0; d < 7; d++) {
      for (let h = 0; h < 24; h++) {
        const v = data[d]?.[h] ?? 0
        if (v > max) max = v
        dayTotals[d] += v
        hourTotals[h] += v
        flat.push({ d, h, v })
      }
    }
    flat.sort((a, b) => b.v - a.v)
    const top = new Set(flat.slice(0, highlightTop).filter((c) => c.v > 0).map((c) => c.d * 24 + c.h))
    return { max, dayTotals, hourTotals, top, maxDay: Math.max(...dayTotals, 1), maxHour: Math.max(...hourTotals, 1) }
  }, [data, highlightTop])

  const active = hover ?? (focusVisible ? focus : null)

  function move(d: number, h: number) {
    const nd = Math.min(6, Math.max(0, d))
    const nh = Math.min(23, Math.max(0, h))
    setFocus({ d: nd, h: nh })
    cells.current.get(nd * 24 + nh)?.focus()
  }

  function onKey(e: React.KeyboardEvent, d: number, h: number) {
    const map: Record<string, [number, number]> = {
      ArrowRight: [d, h + 1],
      ArrowLeft: [d, h - 1],
      ArrowDown: [d + 1, h],
      ArrowUp: [d - 1, h],
      Home: [d, 0],
      End: [d, 23],
    }
    const next = map[e.key]
    if (next) {
      e.preventDefault()
      move(next[0], next[1])
    } else if ((e.key === "Enter" || e.key === " ") && onCellClick) {
      e.preventDefault()
      onCellClick({ day: d, hour: h, value: data[d]?.[h] ?? 0 })
    }
  }

  const columns = `2.5rem repeat(24, minmax(0, 1fr))${showTotals ? " 3rem" : ""}`

  return (
    <MotionConfig reducedMotion="user">
      <div data-slot="week-pulse" className={cn("w-full text-xs", className)}>
        <div role="grid" aria-label={label} className="grid" style={{ gridTemplateColumns: columns, gap }} onMouseLeave={() => setHover(null)}>
          {/* Hour labels */}
          <div role="row" className="contents">
            <span />
            {Array.from({ length: 24 }, (_, h) => (
              <span
                key={h}
                role="columnheader"
                aria-label={hourText(h, hourFormat)}
                className={cn(
                  "text-center font-mono text-[10px] leading-4 transition-colors",
                  active?.h === h ? "font-semibold text-foreground" : "text-muted-foreground",
                  h % 3 !== 0 && active?.h !== h && "text-transparent"
                )}
              >
                {hourTick(h, hourFormat)}
              </span>
            ))}
            {showTotals && <span />}
          </div>

          {Array.from({ length: 7 }, (_, d) => (
            <div key={d} role="row" className="contents">
              <span
                role="rowheader"
                className={cn("flex items-center text-[11px] transition-colors", active?.d === d ? "font-semibold text-foreground" : "text-muted-foreground")}
              >
                {days[d]}
              </span>
              {Array.from({ length: 24 }, (_, h) => {
                const v = data[d]?.[h] ?? 0
                const t = stats.max ? v / stats.max : 0
                const isActive = active?.d === d && active?.h === h
                const inCross = active && (active.d === d || active.h === h)
                const top = stats.top.has(d * 24 + h)
                return (
                  <div
                    key={h}
                    role="gridcell"
                    tabIndex={focus.d === d && focus.h === h ? 0 : -1}
                    aria-label={`${days[d]} ${hourText(h, hourFormat)}: ${formatValue(v)} ${unit}`}
                    ref={(el) => {
                      if (el) cells.current.set(d * 24 + h, el)
                      else cells.current.delete(d * 24 + h)
                    }}
                    onMouseEnter={() => setHover({ d, h })}
                    onFocus={(e) => {
                      setFocus({ d, h })
                      setFocusVisible(e.currentTarget.matches(":focus-visible"))
                    }}
                    onBlur={() => setFocusVisible(false)}
                    onKeyDown={(e) => onKey(e, d, h)}
                    onClick={() => onCellClick?.({ day: d, hour: h, value: v })}
                    className={cn("relative aspect-square outline-none", onCellClick && "cursor-pointer", isActive && "z-10")}
                  >
                    <motion.span
                      className={cn(
                        "absolute inset-0 block transition-[opacity,box-shadow] duration-150",
                        shape === "circle" ? "rounded-full" : "rounded-[3px]",
                        active && !inCross && "opacity-40",
                        isActive && "ring-2 ring-foreground ring-offset-1 ring-offset-background"
                      )}
                      style={{ background: colorFor(t, scale) }}
                      initial={animate ? { scale: 0, opacity: 0 } : false}
                      whileInView={animate ? { scale: 1, opacity: 1 } : undefined}
                      viewport={{ once: true }}
                      transition={{ delay: (d + h) * 0.012, type: "spring", stiffness: 380, damping: 22 }}
                    />
                    {top && (
                      <span
                        aria-hidden
                        className={cn(
                          "pointer-events-none absolute inset-0 animate-ping border-2 border-current opacity-60 motion-reduce:hidden",
                          shape === "circle" ? "rounded-full" : "rounded-[3px]",
                          scale === "heat" ? "text-[oklch(0.62_0.22_30)]" : scale === "brand" ? "text-brand" : "text-primary"
                        )}
                        style={{ animationDuration: "2s" }}
                      />
                    )}
                    {isActive && (
                      <motion.span
                        role="tooltip"
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.15 }}
                        className={cn(
                          "pointer-events-none absolute bottom-full z-20 mb-2 rounded-lg border bg-popover px-2.5 py-1.5 whitespace-nowrap text-popover-foreground shadow-md",
                          h < 4 ? "left-0" : h > 19 ? "right-0" : "left-1/2 -translate-x-1/2"
                        )}
                      >
                        <span className="block text-[11px] text-muted-foreground">
                          {days[d]} · {hourText(h, hourFormat)}–{hourText(h + 1, hourFormat)}
                        </span>
                        <span className="font-mono text-sm font-semibold">{formatValue(v)}</span> <span className="text-muted-foreground">{unit}</span>
                        {top && <span className="ml-1.5 rounded bg-muted px-1 py-0.5 text-[10px] font-medium">Peak</span>}
                      </motion.span>
                    )}
                  </div>
                )
              })}
              {showTotals && (
                <span aria-hidden className="flex items-center gap-1.5 pl-1">
                  <motion.span
                    className={cn("h-1.5 w-full origin-left rounded-full", active?.d === d ? "bg-foreground" : "bg-muted-foreground/40")}
                    {...grow("scaleX", stats.dayTotals[d] / stats.maxDay, animate)}
                    transition={{ delay: 0.3 + d * 0.04, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  />
                </span>
              )}
            </div>
          ))}

          {showTotals && (
            <div aria-hidden className="contents">
              <span />
              {stats.hourTotals.map((total, h) => (
                <span key={h} className="flex h-7 items-start justify-center">
                  <motion.span
                    className={cn("h-full w-full max-w-2 origin-top rounded-full", active?.h === h ? "bg-foreground" : "bg-muted-foreground/40")}
                    {...grow("scaleY", Math.max(0.08, total / stats.maxHour), animate)}
                    transition={{ delay: 0.3 + h * 0.015, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  />
                </span>
              ))}
              <span />
            </div>
          )}
        </div>

        {showLegend && (
          <div className="mt-3 flex items-center justify-end gap-1.5 text-[11px] text-muted-foreground">
            <span>Less</span>
            {[0, 0.25, 0.5, 0.75, 1].map((t) => (
              <span key={t} className={cn("size-2.5", shape === "circle" ? "rounded-full" : "rounded-[2px]")} style={{ background: colorFor(t || 0.02, scale) }} />
            ))}
            <span>More</span>
          </div>
        )}
      </div>
    </MotionConfig>
  )
}
