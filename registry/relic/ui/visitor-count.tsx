"use client"

/**
 * Relic UI · Visitor Count
 * https://relic-ui.vercel.app/docs/visitor-count
 *
 * Copyright (c) 2026 Shubham Tambe
 * Open source under the MIT License: https://relic-ui.vercel.app/license
 */

import { useMemo, useState } from "react"
import { AnimatePresence, MotionConfig, motion } from "motion/react"

import { cn } from "@/lib/utils"

export interface VisitorCountProps {
  /** People here right now. */
  value: number
  /** Recent counts, oldest first (e.g. one per minute), for the sparkline. */
  history?: number[]
  label?: string
  /** Show the pulsing "Live" dot. */
  live?: boolean
  /** Make the live dot beat faster when there are more people. */
  heartbeat?: boolean
  /** The count that means "very busy" for the heartbeat. Defaults to the highest count seen. */
  max?: number
  /** Show a +/- chip when the count changes. */
  showDelta?: boolean
  /** Float a small dot up for every new arrival. */
  showArrivals?: boolean
  showSparkline?: boolean
  /** Short numbers like 12.4K. */
  compact?: boolean
  locale?: string
  size?: "sm" | "md" | "lg"
  className?: string
}

const SIZES = { sm: "text-3xl", md: "text-5xl", lg: "text-6xl" }

function Digit({ n }: { n: number }) {
  return (
    <span className="relative inline-block h-[1em] w-[0.62em] overflow-hidden">
      <motion.span
        className="absolute inset-x-0 top-0 flex flex-col items-center"
        initial={false}
        animate={{ y: `${-n * 10}%` }}
        transition={{ type: "spring", stiffness: 140, damping: 18 }}
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

function Sparkline({ values }: { values: number[] }) {
  const { line, area, last } = useMemo(() => {
    const min = Math.min(...values)
    const max = Math.max(...values)
    const range = max - min || 1
    const pts = values.map((v, i) => [(i / Math.max(values.length - 1, 1)) * 100, 28 - ((v - min) / range) * 24] as const)
    const line = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(2)} ${y.toFixed(2)}`).join(" ")
    return { line, area: `${line} L100 32 L0 32 Z`, last: pts[pts.length - 1] }
  }, [values])
  return (
    <svg aria-hidden viewBox="0 0 100 32" preserveAspectRatio="none" className="h-10 w-full overflow-visible">
      <path d={area} className="fill-primary/10" />
      <path d={line} fill="none" className="stroke-primary" strokeWidth={1.5} vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
      {last && <circle cx={last[0]} cy={last[1]} r={2.2} className="fill-brand" vectorEffect="non-scaling-stroke" />}
    </svg>
  )
}

/**
 * A live "people here now" counter. Digits roll like an odometer, a chip
 * shows the change, every arrival floats up as a dot, and the live dot beats
 * faster as the place gets busier.
 */
export function VisitorCount({
  value,
  history,
  label = "people here now",
  live = true,
  heartbeat = true,
  max,
  showDelta = true,
  showArrivals = true,
  showSparkline = true,
  compact = false,
  locale,
  size = "md",
  className,
}: VisitorCountProps) {
  // Remember the last value to show what changed (React's "adjust state on prop change" pattern).
  const [prev, setPrev] = useState(value)
  const [change, setChange] = useState({ delta: 0, key: 0 })
  if (value !== prev) {
    setPrev(value)
    setChange({ delta: value - prev, key: change.key + 1 })
  }

  const text = new Intl.NumberFormat(locale, compact ? { notation: "compact", maximumFractionDigits: 1 } : undefined).format(value)
  const chars = Array.from(text)
  const busiest = max ?? Math.max(value, ...(history ?? []), 1)
  const busy = Math.min(1, value / busiest)
  const beat = heartbeat ? 2.4 - busy * 1.8 : 2

  return (
    <MotionConfig reducedMotion="user">
      <div data-slot="visitor-count" className={cn("flex w-full flex-col gap-2", className)}>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {live && (
            <span className="relative flex size-2.5 items-center justify-center">
              <motion.span
                key={beat.toFixed(1)}
                aria-hidden
                className="absolute inset-0 rounded-full bg-emerald-500"
                animate={{ scale: [1, 2.6], opacity: [0.6, 0] }}
                transition={{ duration: beat, repeat: Infinity, ease: "easeOut" }}
              />
              <span className="relative size-2 rounded-full bg-emerald-500" />
            </span>
          )}
          {live && <span className="text-xs font-medium tracking-wide text-emerald-600 uppercase dark:text-emerald-400">Live</span>}
          <span>{label}</span>
        </div>

        <div className="relative flex items-end gap-3">
          <span className={cn("flex font-semibold tracking-tight tabular-nums leading-none", SIZES[size])} aria-hidden>
            {chars.map((ch, i) => {
              const key = chars.length - i // keep each place's identity as the number grows
              return /\d/.test(ch) ? (
                <Digit key={key} n={Number(ch)} />
              ) : (
                <span key={key} className="inline-block h-[1em]">
                  {ch}
                </span>
              )
            })}
          </span>
          <span className="sr-only" role="status">
            {value.toLocaleString(locale)} {label}
          </span>

          {showDelta && (
            <AnimatePresence>
              {change.delta !== 0 && (
                <motion.span
                  key={change.key}
                  aria-hidden
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: [0, 1, 1, 0], y: [6, 0, 0, -4] }}
                  transition={{ duration: 2.6, times: [0, 0.1, 0.8, 1] }}
                  className={cn(
                    "mb-1 rounded-full px-2 py-0.5 font-mono text-xs font-medium",
                    change.delta > 0 ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-muted text-muted-foreground"
                  )}
                >
                  {change.delta > 0 ? "▲ +" : "▼ "}
                  {Math.abs(change.delta).toLocaleString(locale)}
                </motion.span>
              )}
            </AnimatePresence>
          )}

          {showArrivals && change.delta > 0 && (
            <span key={change.key} aria-hidden className="pointer-events-none absolute bottom-full left-0 h-10 w-24">
              {Array.from({ length: Math.min(change.delta, 6) }, (_, i) => (
                <motion.span
                  key={i}
                  className="absolute bottom-0 size-1.5 rounded-full bg-brand"
                  style={{ left: `${10 + ((i * 37) % 80)}%` }}
                  initial={{ y: 8, opacity: 0, scale: 0.5 }}
                  animate={{ y: -28, opacity: [0, 1, 0], scale: 1 }}
                  transition={{ duration: 1.4, delay: i * 0.12, ease: "easeOut" }}
                />
              ))}
            </span>
          )}
        </div>

        {showSparkline && history && history.length > 1 && <Sparkline values={history} />}
      </div>
    </MotionConfig>
  )
}
