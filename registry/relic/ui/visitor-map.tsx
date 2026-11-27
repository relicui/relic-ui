"use client"

/**
 * Relic UI · Visitor Map
 * https://relic-ui.vercel.app/docs/visitor-map
 *
 * Copyright (c) 2026 Shubham Tambe
 * Open source under the MIT License: https://relic-ui.vercel.app/license
 *
 * Land shapes: Natural Earth (public domain), baked into a 2.5° dot grid.
 */

import { useEffect, useMemo, useState } from "react"
import { AnimatePresence, MotionConfig, motion } from "motion/react"

import { cn } from "@/lib/utils"

export type VisitorPoint = {
  id?: string
  lat: number
  lng: number
  /** Place name shown in the tooltip, e.g. "Mumbai". */
  label?: string
  /** People there; bigger counts get bigger dots. */
  count?: number
}

export interface VisitorMapProps {
  points: VisitorPoint[]
  /** Your server or office: arcs flow from every visitor to here. */
  home?: { lat: number; lng: number; label?: string }
  /** Draw the moving arcs to home. */
  showArcs?: boolean
  /** Ripple rings around every visitor. */
  showPings?: boolean
  /** Visit each place in turn every n seconds, showing its tooltip. 0 for off. */
  autoCycle?: number
  /** Size of the land dots, 0.3 to 1. */
  dotSize?: number
  /** Color of the visitor dots. */
  color?: "brand" | "primary" | "emerald"
  /** Word used in the tooltip. */
  unit?: string
  /** Called when a place is clicked or chosen with Enter. */
  onPointClick?: (point: VisitorPoint) => void
  /** Accessible name of the map. */
  label?: string
  className?: string
}

const COLS = 144
const ROWS = 57
const STEP = 2.5
const TOP = 84

// 57 rows × 144 columns, 4 columns per hex digit; 1 is land.
const LAND = [
  "0000000001fe03ff00000000000000000000",
  "0000000079f7ffff8001e010000700000000",
  "00000010439fffff0002c000000000000000",
  "0000007cdf007fff00000001801ff801f000",
  "000003e5af003ffe0000000408fffff08000",
  "01f8001e67f83ff8000070001bffffffff00",
  "7c00002901a3e01ffffc00d0040000000000",
  "d80000000785e0fe3ff84300000000000000",
  "03ffffffe0080e00001effffffffffffffff",
  "07fbffffc0700200003e5ffffffffffffc60",
  "00603fffe07e000000063fffffffffff0180",
  "00001ffffe7f000002107ffffffffffc0380",
  "00000ffffe7fc0000bbfffffffffffff8200",
  "000007fffffd0000027fffffffffffff4000",
  "000003fffffce00001ffffffffffffff0000",
  "000003ffffff000001fff7e7fffffffe0000",
  "000003fffff000000f8de067fffffff8c000",
  "000003ffffc000000f12dff7ffffff608000",
  "000001ffff8000000f045ff3ffffff310000",
  "000000ffffc0000003f067ffffffff170000",
  "0000007fff0000000ff883ffffffff080000",
  "0000001ff20000000fffffffffffff800000",
  "0000002f810000001ffffbf7ffffff000000",
  "00000017800000003ffffdfadfffff000000",
  "00000003830000007ffffcff0ff7fc000000",
  "00000003884000007ffffefe07e7e0000000",
  "00000001f80000003ffffe7c0783e0800000",
  "000000001e0000007fffff780301f0800000",
  "00000000060000007fffffc00301f0c00000",
  "00000000023f00003ffffff0030120400000",
  "00000000017f00001ffffff0008000600000",
  "00000000007fe0000f3fffe0000283000000",
  "00000000007ff000000fffe0000106000000",
  "0000000000fff000000fff8000008e000000",
  "0000000000fffc00000fff000000ce850000",
  "0000000001ffff800007ff0000004001c000",
  "0000000000ffffc00007ff0000001801e000",
  "00000000007fffc00007ff00000000401000",
  "00000000007fff800007ff000000000e0000",
  "00000000003fff000007ff100000002c4000",
  "00000000001fff000007fe300000007fc000",
  "00000000000fff000007fc30000000ffe000",
  "00000000000ffe000003fc60000003fff000",
  "00000000000ff8000003fc20000007fff800",
  "00000000000ff8000003f800000003fff800",
  "00000000001ff0000001f000000003fff800",
  "00000000001fe0000001f000000003c7f800",
  "00000000001fc0000000000000000201f000",
  "00000000001f80000000000000000000f000",
  "00000000001e000000000000000000000002",
  "00000000003e000000000000000000002004",
  "00000000003c000000000000000000000010",
  "00000000003c000000000000000000000000",
  "000000000038000000000000100000000000",
  "000000000038000000000000000000000000",
  "00000000001c000000000000000000000000",
  "000000000000000000000000000000000000"
]

const project = (lat: number, lng: number) => ({
  x: (lng + 180) / STEP,
  y: (TOP - lat) / STEP,
})

const COLORS = {
  brand: { fill: "fill-brand", stroke: "stroke-brand", bg: "bg-brand" },
  primary: { fill: "fill-primary", stroke: "stroke-primary", bg: "bg-primary" },
  emerald: { fill: "fill-emerald-500", stroke: "stroke-emerald-500", bg: "bg-emerald-500" },
}

function landPath() {
  let d = ""
  for (let r = 0; r < ROWS; r++) {
    const row = LAND[r]
    for (let c = 0; c < COLS; c++) {
      const nibble = parseInt(row[c >> 2], 16)
      if (nibble & (8 >> (c & 3))) d += `M${c + 0.5} ${r + 0.5}h0`
    }
  }
  return d
}

let landCache: string | null = null

/**
 * A dotted world map of who's here right now. Every visitor pings where they
 * are, arcs carry their traffic home, and hovering, tabbing or the auto tour
 * shows each place with its count.
 */
export function VisitorMap({
  points,
  home,
  showArcs = true,
  showPings = true,
  autoCycle = 0,
  dotSize = 0.55,
  color = "brand",
  unit = "visitors",
  onPointClick,
  label = "Visitors around the world",
  className,
}: VisitorMapProps) {
  const [hover, setHover] = useState<number | null>(null)
  const [tour, setTour] = useState<number | null>(null)
  const land = useMemo(() => (landCache ??= landPath()), [])
  const c = COLORS[color]

  const placed = useMemo(() => {
    const max = Math.max(1, ...points.map((p) => p.count ?? 1))
    const h = home ? project(home.lat, home.lng) : null
    return points.map((p) => {
      const at = project(p.lat, p.lng)
      const size = 0.55 + Math.sqrt((p.count ?? 1) / max) * 0.9
      let arc = ""
      if (h) {
        const mx = (at.x + h.x) / 2
        const dist = Math.hypot(h.x - at.x, h.y - at.y)
        const my = (at.y + h.y) / 2 - dist * 0.35
        arc = `M${at.x} ${at.y} Q${mx} ${my} ${h.x} ${h.y}`
      }
      return { ...p, ...at, size, arc }
    })
  }, [points, home])

  // The auto tour: step through the places while nobody is pointing at one.
  useEffect(() => {
    if (!autoCycle || hover !== null || points.length === 0) return
    const timer = window.setInterval(() => setTour((t) => (t === null ? 0 : (t + 1) % points.length)), autoCycle * 1000)
    return () => window.clearInterval(timer)
  }, [autoCycle, hover, points.length])

  const active = hover ?? (autoCycle && tour !== null && tour < placed.length ? tour : null)
  const shown = active !== null ? placed[active] : null
  const homeAt = home ? project(home.lat, home.lng) : null

  return (
    <MotionConfig reducedMotion="user">
      <div data-slot="visitor-map" className={cn("relative w-full", className)}>
        <div className="relative w-full" style={{ aspectRatio: `${COLS} / ${ROWS}` }}>
          <svg aria-hidden viewBox={`0 0 ${COLS} ${ROWS}`} preserveAspectRatio="none" className="absolute inset-0 size-full overflow-visible">
            <path d={land} className="stroke-muted-foreground/30" strokeWidth={Math.min(1, Math.max(0.3, dotSize))} strokeLinecap="round" />

            {showArcs &&
              homeAt &&
              placed.map((p, i) => (
                <g key={`arc-${p.id ?? i}`} className={cn("transition-opacity duration-300", active !== null && active !== i && "opacity-20")}>
                  <path d={p.arc} fill="none" className={c.stroke} strokeOpacity={0.25} strokeWidth={0.25} />
                  <motion.path
                    d={p.arc}
                    fill="none"
                    className={c.stroke}
                    strokeWidth={0.45}
                    strokeLinecap="round"
                    pathLength={1}
                    strokeDasharray="0.12 1"
                    initial={{ strokeDashoffset: 1.12 }}
                    animate={{ strokeDashoffset: 0 }}
                    transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut", delay: (i * 0.37) % 2.4, repeatDelay: 0.6 }}
                  />
                </g>
              ))}

            {homeAt && (
              <g>
                <circle cx={homeAt.x} cy={homeAt.y} r={1.6} className="fill-background stroke-foreground" strokeWidth={0.4} />
                <circle cx={homeAt.x} cy={homeAt.y} r={0.6} className="fill-foreground" />
              </g>
            )}

            {placed.map((p, i) => (
              <g key={p.id ?? i} className={cn("transition-opacity duration-300", active !== null && active !== i && "opacity-50")}>
                {showPings && (
                  <motion.circle
                    cx={p.x}
                    cy={p.y}
                    className={c.fill}
                    initial={{ r: p.size, opacity: 0.5 }}
                    animate={{ r: p.size * 4, opacity: 0 }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut", delay: (i * 0.53) % 2.2 }}
                  />
                )}
                <circle cx={p.x} cy={p.y} r={active === i ? p.size * 1.4 : p.size} className={cn(c.fill, "transition-[r] duration-200")} />
              </g>
            ))}
          </svg>

          {/* Real, focusable targets on top of the dots. */}
          <ul aria-label={label} className="absolute inset-0">
            {placed.map((p, i) => (
              <li key={p.id ?? i} className="absolute" style={{ left: `${(p.x / COLS) * 100}%`, top: `${(p.y / ROWS) * 100}%` }}>
                <button
                  type="button"
                  aria-label={`${p.label ?? `${p.lat.toFixed(1)}, ${p.lng.toFixed(1)}`}: ${(p.count ?? 1).toLocaleString("en-US")} ${unit}`}
                  onMouseEnter={() => setHover(i)}
                  onMouseLeave={() => setHover(null)}
                  onFocus={() => setHover(i)}
                  onBlur={() => setHover(null)}
                  onClick={() => onPointClick?.(p)}
                  className={cn(
                    "absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    onPointClick ? "cursor-pointer" : "cursor-default"
                  )}
                />
              </li>
            ))}
          </ul>

          <AnimatePresence>
            {shown && (
              <motion.div
                key={active}
                role="tooltip"
                initial={{ opacity: 0, y: 4, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.12 } }}
                transition={{ duration: 0.18 }}
                className={cn(
                  "pointer-events-none absolute z-10 mb-3 -translate-y-full rounded-lg border bg-popover px-2.5 py-1.5 text-xs whitespace-nowrap text-popover-foreground shadow-md",
                  shown.x < COLS * 0.15 ? "" : shown.x > COLS * 0.85 ? "-translate-x-full" : "-translate-x-1/2"
                )}
                style={{ left: `${(shown.x / COLS) * 100}%`, top: `calc(${(shown.y / ROWS) * 100}% - 10px)` }}
              >
                <span className="flex items-center gap-1.5 font-medium">
                  <span className={cn("size-1.5 rounded-full", c.bg)} />
                  {shown.label ?? `${shown.lat.toFixed(1)}, ${shown.lng.toFixed(1)}`}
                </span>
                <span className="font-mono text-sm font-semibold">{(shown.count ?? 1).toLocaleString("en-US")}</span>{" "}
                <span className="text-muted-foreground">{unit}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </MotionConfig>
  )
}
