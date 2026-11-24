"use client"

/**
 * Relic UI · Cohort Tide
 * https://relic-ui.vercel.app/docs/cohort-tide
 *
 * Copyright (c) 2026 Shubham Tambe
 * Open source under the MIT License: https://relic-ui.vercel.app/license
 */

import { useMemo, useRef, useState } from "react"
import { MotionConfig, motion } from "motion/react"

import { cn } from "@/lib/utils"

export type Cohort = {
  /** e.g. "Jan 6" or "Week 1". */
  label: string
  /** People who started in this cohort. */
  size?: number
  /** Share still here in each period, 0–1. Period 0 is usually 1. */
  values: number[]
}

export interface CohortTideProps {
  cohorts: Cohort[]
  /** Column heading for period i. */
  periodLabel?: (i: number) => string
  /** Word for one period in the tooltip, e.g. "Week", "Month". */
  periodName?: string
  /** A rising water level in every cell, or a plain color. */
  fill?: "tide" | "solid"
  scale?: "primary" | "brand" | "heat"
  /**
   * What lights up around the hovered cell. "diagonal" shows the same calendar
   * period across cohorts: handy for spotting a bad release or a holiday.
   */
  highlight?: "crosshair" | "diagonal"
  /** A weighted average row at the bottom. */
  showAverage?: boolean
  /** A column with each cohort's size. */
  showSize?: boolean
  /** Let the tide roll in when it comes into view. */
  animate?: boolean
  onCellClick?: (cell: { cohort: Cohort; period: number; value: number }) => void
  /** Accessible name of the grid. */
  label?: string
  className?: string
}

const pct = (n: number) => `${Math.round(n * 100)}%`

function tone(t: number, scale: CohortTideProps["scale"], strength: number) {
  const p = Math.round((0.12 + t * 0.88) * strength)
  if (scale === "heat") {
    const c = t > 0.5 ? "oklch(0.72 0.17 150)" : t > 0.25 ? "oklch(0.82 0.15 85)" : "oklch(0.64 0.2 30)"
    return `color-mix(in oklch, ${c} ${p}%, transparent)`
  }
  return `color-mix(in oklch, var(${scale === "brand" ? "--brand" : "--primary"}) ${p}%, transparent)`
}

/** A slow wave on top of each tide. */
function Wave({ color }: { color: string }) {
  return (
    <span aria-hidden className="absolute inset-x-0 -top-1.5 h-1.5 overflow-hidden">
      <motion.svg
        viewBox="0 0 40 6"
        preserveAspectRatio="none"
        className="h-full w-[200%]"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
      >
        <path d="M0 6 V3 Q5 0 10 3 T20 3 T30 3 T40 3 V6 Z" style={{ fill: color }} />
      </motion.svg>
    </span>
  )
}

/**
 * A retention cohort table where every cell holds a tide that rises to the
 * share of people still around. Hover a cell to light up its cohort and
 * period, or the whole calendar diagonal to catch one bad week.
 */
export function CohortTide({
  cohorts,
  periodLabel = (i) => `W${i}`,
  periodName = "Week",
  fill = "tide",
  scale = "primary",
  highlight = "crosshair",
  showAverage = true,
  showSize = true,
  animate = true,
  onCellClick,
  label = "Retention by cohort",
  className,
}: CohortTideProps) {
  const periods = Math.max(0, ...cohorts.map((c) => c.values.length))
  const [hover, setHover] = useState<{ r: number; c: number } | null>(null)
  const [focus, setFocus] = useState({ r: 0, c: 0 })
  const [focusVisible, setFocusVisible] = useState(false)
  const cells = useRef(new Map<string, HTMLElement>())

  const average = useMemo(
    () =>
      Array.from({ length: periods }, (_, c) => {
        let sum = 0
        let weight = 0
        for (const cohort of cohorts) {
          const v = cohort.values[c]
          if (v === undefined) continue
          const w = cohort.size ?? 1
          sum += v * w
          weight += w
        }
        return weight ? sum / weight : null
      }),
    [cohorts, periods]
  )

  const active = hover ?? (focusVisible ? focus : null)
  const lit = (r: number, c: number) => {
    if (!active) return true
    if (highlight === "diagonal") return r + c === active.r + active.c
    return r === active.r || c === active.c
  }

  function move(r: number, c: number) {
    const nr = Math.min(cohorts.length - 1, Math.max(0, r))
    const nc = Math.min(periods - 1, Math.max(0, c))
    setFocus({ r: nr, c: nc })
    cells.current.get(`${nr}-${nc}`)?.focus()
  }

  const columns = `minmax(4.5rem, auto)${showSize ? " 3.5rem" : ""} repeat(${periods}, minmax(2.5rem, 1fr))`

  return (
    <MotionConfig reducedMotion="user">
      <div data-slot="cohort-tide" className={cn("w-full overflow-x-auto text-xs", className)}>
        <div role="grid" aria-label={label} className="grid min-w-fit gap-1" style={{ gridTemplateColumns: columns }} onMouseLeave={() => setHover(null)}>
          <div role="row" className="contents">
            <span role="columnheader" className="px-1 py-1 text-[11px] font-medium text-muted-foreground">
              Cohort
            </span>
            {showSize && (
              <span role="columnheader" className="px-1 py-1 text-right text-[11px] font-medium text-muted-foreground">
                People
              </span>
            )}
            {Array.from({ length: periods }, (_, c) => (
              <span
                key={c}
                role="columnheader"
                className={cn(
                  "py-1 text-center font-mono text-[11px] transition-colors",
                  active && highlight === "crosshair" && active.c === c ? "font-semibold text-foreground" : "text-muted-foreground"
                )}
              >
                {periodLabel(c)}
              </span>
            ))}
          </div>

          {cohorts.map((cohort, r) => (
            <div key={r} role="row" className="contents">
              <span
                role="rowheader"
                className={cn("flex items-center px-1 transition-colors", active && highlight === "crosshair" && active.r === r ? "font-semibold text-foreground" : "text-muted-foreground")}
              >
                {cohort.label}
              </span>
              {showSize && <span className="flex items-center justify-end px-1 font-mono text-muted-foreground">{cohort.size?.toLocaleString() ?? "–"}</span>}
              {Array.from({ length: periods }, (_, c) => {
                const v = cohort.values[c]
                const has = v !== undefined
                const isActive = active?.r === r && active?.c === c
                return (
                  <div
                    key={c}
                    role="gridcell"
                    tabIndex={focus.r === r && focus.c === c ? 0 : -1}
                    aria-label={
                      has
                        ? `${cohort.label}, ${periodName} ${c}: ${pct(v)} retained${cohort.size ? `, ${Math.round(v * cohort.size).toLocaleString()} people` : ""}`
                        : `${cohort.label}, ${periodName} ${c}: not yet`
                    }
                    ref={(el) => {
                      if (el) cells.current.set(`${r}-${c}`, el)
                      else cells.current.delete(`${r}-${c}`)
                    }}
                    onMouseEnter={() => setHover({ r, c })}
                    onFocus={(e) => {
                      setFocus({ r, c })
                      setFocusVisible(e.currentTarget.matches(":focus-visible"))
                    }}
                    onBlur={() => setFocusVisible(false)}
                    onKeyDown={(e) => {
                      const map: Record<string, [number, number]> = {
                        ArrowRight: [r, c + 1],
                        ArrowLeft: [r, c - 1],
                        ArrowDown: [r + 1, c],
                        ArrowUp: [r - 1, c],
                        Home: [r, 0],
                        End: [r, periods - 1],
                      }
                      if (map[e.key]) {
                        e.preventDefault()
                        move(...map[e.key])
                      } else if ((e.key === "Enter" || e.key === " ") && has && onCellClick) {
                        e.preventDefault()
                        onCellClick({ cohort, period: c, value: v })
                      }
                    }}
                    onClick={() => has && onCellClick?.({ cohort, period: c, value: v })}
                    className={cn(
                      "relative flex h-9 items-center justify-center overflow-hidden rounded-md outline-none transition-[opacity,box-shadow] duration-150 focus-visible:ring-2 focus-visible:ring-ring",
                      has ? "bg-muted/50" : "bg-transparent",
                      !lit(r, c) && "opacity-35",
                      isActive && "ring-2 ring-foreground",
                      has && onCellClick && "cursor-pointer"
                    )}
                  >
                    {has && fill === "tide" && (
                      <motion.span
                        aria-hidden
                        className="absolute inset-x-0 bottom-0"
                        style={{ background: tone(v, scale, 70) }}
                        initial={animate ? { height: "0%" } : false}
                        whileInView={{ height: pct(v) }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.9, delay: (r + c) * 0.04, ease: [0.22, 1, 0.36, 1] }}
                      >
                        {v > 0.04 && v < 0.98 && <Wave color={tone(v, scale, 70)} />}
                      </motion.span>
                    )}
                    {has && fill === "solid" && <span aria-hidden className="absolute inset-0" style={{ background: tone(v, scale, 85) }} />}
                    {has && <span className="relative font-mono text-[11px] font-medium tabular-nums">{pct(v)}</span>}
                  </div>
                )
              })}
            </div>
          ))}

          {showAverage && (
            <div role="row" className="contents">
              <span role="rowheader" className="mt-1 flex items-center border-t px-1 pt-1 font-medium">
                Average
              </span>
              {showSize && (
                <span className="mt-1 flex items-center justify-end border-t px-1 pt-1 font-mono text-muted-foreground">
                  {cohorts.reduce((t, c) => t + (c.size ?? 0), 0).toLocaleString() || "–"}
                </span>
              )}
              {average.map((v, c) => (
                <span
                  key={c}
                  role="gridcell"
                  aria-label={v === null ? undefined : `Average, ${periodName} ${c}: ${pct(v)}`}
                  className="mt-1 flex items-center justify-center border-t pt-1 font-mono text-[11px] font-semibold tabular-nums"
                >
                  {v === null ? "" : pct(v)}
                </span>
              ))}
            </div>
          )}
        </div>
        {active && cohorts[active.r]?.values[active.c] !== undefined && (
          <p aria-hidden className="mt-2 text-[11px] text-muted-foreground">
            <span className="font-medium text-foreground">{cohorts[active.r].label}</span> · {periodName} {active.c} ·{" "}
            <span className="font-mono text-foreground">{pct(cohorts[active.r].values[active.c])}</span> still here
            {highlight === "diagonal" && <> · same calendar {periodName.toLowerCase()} lit across cohorts</>}
          </p>
        )}
      </div>
    </MotionConfig>
  )
}
