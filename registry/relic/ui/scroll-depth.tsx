"use client"

/**
 * Relic UI · Scroll Depth
 * https://relic-ui.vercel.app/docs/scroll-depth
 *
 * Copyright (c) 2026 Shubham Tambe
 * Open source under the MIT License: https://relic-ui.vercel.app/license
 */

import { useId, useMemo, useState } from "react"
import { MotionConfig, motion } from "motion/react"

import { cn } from "@/lib/utils"

export interface ScrollDepthProps {
  /** Share of visitors (0–1) that reached each depth, top to bottom, evenly spaced. */
  reach?: number[]
  /** Or: the deepest point each visit reached (0–1). The curve is worked out for you. */
  sessions?: number[]
  /** The page or screenshot to lay the heat over. */
  children: React.ReactNode
  palette?: "heat" | "brand" | "mono"
  /** Opacity of the heat. */
  opacity?: number
  /** Where the first screen ends (0–1). Draws a "fold" line. */
  fold?: number
  /** Draw a line where reach drops below each of these shares, e.g. [0.75, 0.5, 0.25]. */
  markers?: number[]
  /** The drop-off curve beside the page (also a keyboard slider). */
  showGauge?: boolean
  /** Pour the heat in from the top when it comes into view. */
  animate?: boolean
  /** What a visitor is called in the labels. */
  unit?: string
  className?: string
}

const SAMPLES = 60
const HEAT: [number, number, number][] = [
  [37, 99, 235],
  [6, 182, 212],
  [132, 204, 22],
  [250, 204, 21],
  [249, 115, 22],
  [239, 68, 68],
]

function heat(t: number) {
  const x = Math.min(Math.max(t, 0), 1) * (HEAT.length - 1)
  const i = Math.min(Math.floor(x), HEAT.length - 2)
  const f = x - i
  return HEAT[i].map((v, k) => Math.round(v + (HEAT[i + 1][k] - v) * f)) as [number, number, number]
}

function colorAt(t: number, palette: ScrollDepthProps["palette"], opacity: number) {
  if (palette === "heat") {
    const [r, g, b] = heat(t)
    return `rgb(${r} ${g} ${b} / ${opacity})`
  }
  const base = palette === "brand" ? "var(--brand)" : "var(--foreground)"
  return `color-mix(in oklch, ${base} ${Math.round(t * opacity * 100)}%, transparent)`
}

/** The share of visitors who reached depth d, from either kind of input. */
function makeCurve(reach?: number[], sessions?: number[]) {
  return Array.from({ length: SAMPLES + 1 }, (_, s) => {
    const d = s / SAMPLES
    if (sessions && sessions.length) {
      let n = 0
      for (const x of sessions) if (x >= d) n++
      return n / sessions.length
    }
    if (!reach || reach.length === 0) return 1 - d
    if (reach.length === 1) return reach[0]
    const x = d * (reach.length - 1)
    const i = Math.min(Math.floor(x), reach.length - 2)
    return reach[i] + (reach[i + 1] - reach[i]) * (x - i)
  })
}

const pct = (n: number) => `${Math.round(n * 100)}%`

/**
 * An attention heatmap for long pages: warm where everyone reads, cooling as
 * people give up. Point anywhere to see how many visitors made it that far,
 * and see where the fold and the 50% line really fall.
 */
export function ScrollDepth({
  reach,
  sessions,
  children,
  palette = "heat",
  opacity = 0.45,
  fold,
  markers = [0.5],
  showGauge = true,
  animate = true,
  unit = "visitors",
  className,
}: ScrollDepthProps) {
  const gradientId = useId()
  const curve = useMemo(() => makeCurve(reach, sessions), [reach, sessions])
  const [probe, setProbe] = useState<number | null>(null)
  const at = (d: number) => curve[Math.round(Math.min(Math.max(d, 0), 1) * SAMPLES)]

  const gradient = useMemo(
    () => `linear-gradient(to bottom, ${curve.map((r, s) => `${colorAt(r, palette, opacity)} ${((s / SAMPLES) * 100).toFixed(2)}%`).join(", ")})`,
    [curve, palette, opacity]
  )

  // Where reach first drops below each marker.
  const lines = useMemo(
    () =>
      markers
        .map((m) => {
          const s = curve.findIndex((r) => r < m)
          return s > 0 ? { m, d: s / SAMPLES } : null
        })
        .filter((x): x is { m: number; d: number } => x !== null),
    [curve, markers]
  )

  const silhouette = useMemo(() => {
    const pts = curve.map((r, s) => `${(r * 100).toFixed(2)} ${((s / SAMPLES) * 100).toFixed(2)}`)
    return `M0 0 L${pts.join(" L")} L0 100 Z`
  }, [curve])

  function fromPointer(e: React.PointerEvent<HTMLElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    setProbe(Math.min(Math.max((e.clientY - rect.top) / rect.height, 0), 1))
  }

  return (
    <MotionConfig reducedMotion="user">
      <div data-slot="scroll-depth" className={cn("flex w-full gap-3", className)}>
        <div className="relative min-w-0 flex-1 overflow-hidden rounded-xl border" onPointerMove={fromPointer} onPointerLeave={() => setProbe(null)}>
          {children}
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{ background: gradient }}
            initial={animate ? { clipPath: "inset(0 0 100% 0)" } : false}
            whileInView={{ clipPath: "inset(0 0 0% 0)" }}
            viewport={{ once: true }}
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
          />

          {fold !== undefined && (
            <div aria-hidden className="pointer-events-none absolute inset-x-0 border-t border-dashed border-foreground/50" style={{ top: pct(fold) }}>
              <span className="absolute top-1 left-2 rounded bg-background/90 px-1.5 py-0.5 text-[10px] font-medium text-foreground shadow-sm">
                Fold · {pct(at(fold))} see it
              </span>
            </div>
          )}

          {lines.map(({ m, d }) => (
            <div key={m} aria-hidden className="pointer-events-none absolute inset-x-0 border-t border-foreground/30" style={{ top: pct(d) }}>
              <span className="absolute -top-2.5 right-2 rounded-full bg-foreground px-1.5 py-0.5 font-mono text-[10px] leading-none text-background">
                {pct(m)} drop here
              </span>
            </div>
          ))}

          {probe !== null && (
            <div aria-hidden className="pointer-events-none absolute inset-x-0 z-10 h-px bg-brand" style={{ top: pct(probe) }}>
              <span
                className={cn(
                  "absolute left-1/2 -translate-x-1/2 rounded-lg border bg-popover px-2.5 py-1 text-xs whitespace-nowrap text-popover-foreground shadow-md",
                  probe > 0.85 ? "bottom-2" : "top-2"
                )}
              >
                <span className="font-mono font-semibold">{pct(at(probe))}</span> of {unit} reach here
              </span>
            </div>
          )}
        </div>

        {showGauge && (
          <div
            role="slider"
            tabIndex={0}
            aria-label="Scroll depth"
            aria-orientation="vertical"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round((probe ?? 0) * 100)}
            aria-valuetext={`${pct(probe ?? 0)} down the page: ${pct(at(probe ?? 0))} of ${unit} get this far`}
            onPointerMove={fromPointer}
            onPointerLeave={() => setProbe(null)}
            onFocus={() => setProbe((p) => p ?? 0)}
            onBlur={() => setProbe(null)}
            onKeyDown={(e) => {
              const steps: Record<string, number> = { ArrowDown: 0.05, ArrowUp: -0.05, PageDown: 0.2, PageUp: -0.2 }
              const p = probe ?? 0
              let next: number | null = null
              if (e.key in steps) next = p + steps[e.key]
              else if (e.key === "Home") next = 0
              else if (e.key === "End") next = 1
              if (next !== null) {
                e.preventDefault()
                setProbe(Math.min(Math.max(next, 0), 1))
              }
            }}
            className="relative w-14 shrink-0 cursor-ns-resize rounded-xl border bg-muted/30 outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {/* The drop-off silhouette: wide where everyone is, thin where few remain. */}
            <svg aria-hidden viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-1 h-[calc(100%-0.5rem)] w-[calc(100%-0.5rem)]">
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  {curve
                    .filter((_, s) => s % 6 === 0)
                    .map((r, i, all) => (
                      <stop key={i} offset={i / (all.length - 1)} style={{ stopColor: colorAt(r, palette, 1) }} />
                    ))}
                </linearGradient>
              </defs>
              <motion.path
                d={silhouette}
                fill={`url(#${gradientId})`}
                initial={animate ? { opacity: 0 } : false}
                whileInView={{ opacity: 0.9 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.4 }}
              />
            </svg>
            {[0, 0.25, 0.5, 0.75].map((d) => (
              <span key={d} aria-hidden className="absolute right-1 font-mono text-[9px] text-muted-foreground" style={{ top: `calc(${pct(d)} + 2px)` }}>
                {pct(at(d))}
              </span>
            ))}
            {probe !== null && <span aria-hidden className="absolute inset-x-0 h-0.5 bg-brand" style={{ top: pct(probe) }} />}
          </div>
        )}
      </div>
    </MotionConfig>
  )
}
