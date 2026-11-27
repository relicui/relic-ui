"use client"

/**
 * Relic UI · Visitor Count
 * https://relic-ui.vercel.app/docs/visitor-count
 *
 * Copyright (c) 2026 Shubham Tambe
 * Open source under the MIT License: https://relic-ui.vercel.app/license
 */

import { useId, useMemo, useState } from "react"
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
  /** How a point in history is described on hover. Defaults to one point per minute. */
  pointLabel?: (index: number, count: number) => string
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

const W = 100
const H = 40
const PAD = 5

/**
 * A smooth curve through the points that never overshoots them
 * (monotone cubic interpolation), so a dip never looks deeper than it was.
 */
function smoothPath(p: { x: number; y: number }[]) {
  const n = p.length
  if (n < 2) return ""
  const m: number[] = []
  for (let i = 0; i < n - 1; i++) m.push((p[i + 1].y - p[i].y) / (p[i + 1].x - p[i].x || 1))
  const t: number[] = [m[0]]
  for (let i = 1; i < n - 1; i++) t.push(m[i - 1] * m[i] <= 0 ? 0 : (m[i - 1] + m[i]) / 2)
  t.push(m[n - 2])
  for (let i = 0; i < n - 1; i++) {
    if (m[i] === 0) {
      t[i] = 0
      t[i + 1] = 0
      continue
    }
    const a = t[i] / m[i]
    const b = t[i + 1] / m[i]
    const s = a * a + b * b
    if (s > 9) {
      const k = 3 / Math.sqrt(s)
      t[i] = k * a * m[i]
      t[i + 1] = k * b * m[i]
    }
  }
  let d = `M${p[0].x.toFixed(2)} ${p[0].y.toFixed(2)}`
  for (let i = 0; i < n - 1; i++) {
    const h = (p[i + 1].x - p[i].x) / 3
    d += ` C${(p[i].x + h).toFixed(2)} ${(p[i].y + t[i] * h).toFixed(2)} ${(p[i + 1].x - h).toFixed(2)} ${(p[i + 1].y - t[i + 1] * h).toFixed(2)} ${p[i + 1].x.toFixed(2)} ${p[i + 1].y.toFixed(2)}`
  }
  return d
}

function Sparkline({
  values,
  locale = "en-US",
  pointLabel,
}: {
  values: number[]
  locale?: string
  pointLabel: (index: number, count: number) => string
}) {
  const id = useId()
  const [hover, setHover] = useState<number | null>(null)
  const { pts, line, area, peak } = useMemo(() => {
    const min = Math.min(...values)
    const max = Math.max(...values)
    const range = max - min || 1
    const pts = values.map((v, i) => ({ x: (i / Math.max(values.length - 1, 1)) * W, y: PAD + (1 - (v - min) / range) * (H - PAD * 2) }))
    const line = smoothPath(pts)
    return { pts, line, area: `${line} L${W} ${H} L0 ${H} Z`, peak: max }
  }, [values])

  const last = pts[pts.length - 1]
  const shown = hover !== null ? hover : null
  const at = (p: { x: number; y: number }) => ({ left: `${(p.x / W) * 100}%`, top: `${(p.y / H) * 100}%` })

  return (
    <div className="flex flex-col gap-1">
      <div
        className="relative h-14 w-full cursor-crosshair"
        onPointerMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect()
          const i = Math.round(((e.clientX - r.left) / r.width) * (values.length - 1))
          setHover(Math.min(values.length - 1, Math.max(0, i)))
        }}
        onPointerLeave={() => setHover(null)}
      >
        <svg aria-hidden viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="absolute inset-0 size-full overflow-visible">
          <defs>
            <linearGradient id={`${id}-fill`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" style={{ stopColor: "var(--primary)", stopOpacity: 0.22 }} />
              <stop offset="100%" style={{ stopColor: "var(--primary)", stopOpacity: 0 }} />
            </linearGradient>
          </defs>
          {/* A faint baseline and midline for scale. */}
          <line x1="0" x2={W} y1={H - 0.5} y2={H - 0.5} className="stroke-border" vectorEffect="non-scaling-stroke" />
          <line x1="0" x2={W} y1={H / 2} y2={H / 2} className="stroke-border" strokeDasharray="2 3" vectorEffect="non-scaling-stroke" />
          <motion.path
            initial={false}
            animate={{ d: area }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            fill={`url(#${id}-fill)`}
          />
          <motion.path
            initial={false}
            animate={{ d: line }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            fill="none"
            className="stroke-primary"
            strokeWidth={1.75}
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
          {shown !== null && (
            <line
              x1={pts[shown].x}
              x2={pts[shown].x}
              y1={0}
              y2={H}
              className="stroke-foreground/30"
              strokeDasharray="2 2"
              vectorEffect="non-scaling-stroke"
            />
          )}
        </svg>

        {/* Dots are HTML so they stay round however wide the graph is. */}
        {last && (
          <motion.span
            aria-hidden
            className="absolute size-2 -translate-x-1/2 -translate-y-1/2"
            initial={false}
            animate={at(last)}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="absolute inset-0 animate-ping rounded-full bg-brand/60 motion-reduce:hidden" />
            <span className="absolute inset-0 rounded-full bg-brand ring-2 ring-background" />
          </motion.span>
        )}
        {shown !== null && (
          <>
            <span aria-hidden className="absolute size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground ring-2 ring-background" style={at(pts[shown])} />
            <span
              aria-hidden
              className={cn(
                "pointer-events-none absolute -top-1 -translate-y-full rounded-md border bg-popover px-2 py-0.5 text-[11px] whitespace-nowrap text-popover-foreground shadow-sm",
                pts[shown].x < W * 0.2 ? "translate-x-0" : pts[shown].x > W * 0.8 ? "-translate-x-full" : "-translate-x-1/2"
              )}
              style={{ left: `${(pts[shown].x / W) * 100}%` }}
            >
              <span className="font-mono font-semibold">{values[shown].toLocaleString(locale)}</span>
              <span className="text-muted-foreground"> · {pointLabel(shown, values.length)}</span>
            </span>
          </>
        )}
      </div>
      <div aria-hidden className="flex justify-between font-mono text-[10px] text-muted-foreground">
        <span>{pointLabel(0, values.length)}</span>
        <span>peak {peak.toLocaleString(locale)}</span>
        <span>now</span>
      </div>
    </div>
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
  pointLabel = (i, n) => (i === n - 1 ? "now" : `${n - 1 - i} min ago`),
  compact = false,
  locale = "en-US",
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
                <span key={key} className="flex h-[1em] items-center">
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

        {showSparkline && history && history.length > 1 && <Sparkline values={history} locale={locale} pointLabel={pointLabel} />}
      </div>
    </MotionConfig>
  )
}
