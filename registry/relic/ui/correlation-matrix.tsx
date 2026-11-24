"use client"

/**
 * Relic UI · Correlation Matrix
 * https://relic-ui.vercel.app/docs/correlation-matrix
 *
 * Copyright (c) 2026 Shubham Tambe
 * Open source under the MIT License: https://relic-ui.vercel.app/license
 */

import { useMemo, useRef, useState } from "react"
import { LayoutGroup, MotionConfig, motion } from "motion/react"

import { cn } from "@/lib/utils"

export interface CorrelationMatrixProps {
  /** Variable names. */
  labels: string[]
  /** A square matrix of correlations from −1 to 1. */
  values: number[][]
  /** Keep your order, or shuffle related variables next to each other. */
  order?: "original" | "clustered"
  /** The whole square, or just the lower half (the upper half repeats it). */
  triangle?: "full" | "lower"
  /** Color squares, or dots that grow with the strength. */
  shape?: "square" | "circle"
  palette?: "blue-red" | "purple-green" | "brand"
  /** Print the numbers in the cells. */
  showValues?: boolean
  decimals?: number
  showLegend?: boolean
  onCellClick?: (cell: { row: string; col: string; value: number }) => void
  /** Accessible name of the grid. */
  label?: string
  className?: string
}

const PALETTES = {
  "blue-red": { neg: "oklch(0.6 0.17 250)", pos: "oklch(0.63 0.21 25)" },
  "purple-green": { neg: "oklch(0.56 0.2 300)", pos: "oklch(0.68 0.17 150)" },
  brand: { neg: "var(--muted-foreground)", pos: "var(--brand)" },
}

function strength(r: number) {
  const a = Math.abs(r)
  const word = a >= 0.7 ? "strong" : a >= 0.4 ? "moderate" : a >= 0.2 ? "weak" : "no real"
  return a < 0.2 ? `${word} link` : `${word} ${r > 0 ? "positive" : "negative"}`
}

/** Put the most related variables side by side (a simple greedy chain). */
function cluster(values: number[][]) {
  const n = values.length
  if (n < 3) return Array.from({ length: n }, (_, i) => i)
  const pull = (i: number) => values[i].reduce((t, v, j) => t + (i === j ? 0 : Math.abs(v)), 0)
  let start = 0
  for (let i = 1; i < n; i++) if (pull(i) > pull(start)) start = i
  const out = [start]
  const left = new Set(Array.from({ length: n }, (_, i) => i).filter((i) => i !== start))
  while (left.size) {
    const last = out[out.length - 1]
    let best = -1
    for (const j of left) if (best < 0 || Math.abs(values[last][j]) > Math.abs(values[last][best])) best = j
    out.push(best)
    left.delete(best)
  }
  return out
}

/**
 * A correlation heatmap that can reorder itself: switch to clustered and the
 * rows and columns glide around until related variables sit together. Hover
 * any cell for the pair and a plain-words reading of the number.
 */
export function CorrelationMatrix({
  labels,
  values,
  order = "original",
  triangle = "full",
  shape = "square",
  palette = "blue-red",
  showValues,
  decimals = 2,
  showLegend = true,
  onCellClick,
  label = "Correlation matrix",
  className,
}: CorrelationMatrixProps) {
  const n = labels.length
  const seq = useMemo(() => (order === "clustered" ? cluster(values) : Array.from({ length: n }, (_, i) => i)), [order, values, n])
  const pos = useMemo(() => {
    const p = new Array<number>(n)
    seq.forEach((v, k) => (p[v] = k))
    return p
  }, [seq, n])
  const [hover, setHover] = useState<{ i: number; j: number } | null>(null)
  const [focus, setFocus] = useState({ p: 0, q: 0 })
  const [focusVisible, setFocusVisible] = useState(false)
  const cells = useRef(new Map<string, HTMLElement>())
  const colors = PALETTES[palette]
  const printNumbers = showValues ?? n <= 8
  const shown = (p: number, q: number) => triangle === "full" || q <= p

  const active = hover ?? (focusVisible ? { i: seq[focus.p], j: seq[focus.q] } : null)

  function move(p: number, q: number) {
    const np = Math.min(n - 1, Math.max(0, p))
    let nq = Math.min(n - 1, Math.max(0, q))
    if (triangle === "lower") nq = Math.min(nq, np)
    setFocus({ p: np, q: nq })
    cells.current.get(`${seq[np]}-${seq[nq]}`)?.focus()
  }

  const fmt = (r: number) => r.toFixed(decimals).replace("-", "−")

  return (
    <MotionConfig reducedMotion="user">
      <div data-slot="correlation-matrix" className={cn("w-full text-xs", className)}>
        <LayoutGroup>
          <div
            role="grid"
            aria-label={label}
            className="grid gap-[3px]"
            style={{ gridTemplateColumns: `minmax(3rem, max-content) repeat(${n}, minmax(0, 1fr))` }}
            onMouseLeave={() => setHover(null)}
          >
            {/* Column labels, written upwards so long names fit. */}
            <span style={{ gridRow: 1, gridColumn: 1 }} />
            {labels.map((name, j) => (
              <motion.span
                key={`col-${j}`}
                layout
                role="columnheader"
                transition={{ type: "spring", stiffness: 220, damping: 26 }}
                style={{ gridRow: 1, gridColumn: pos[j] + 2 }}
                className={cn(
                  "flex h-20 items-end justify-center pb-1 [writing-mode:vertical-rl] rotate-180 truncate transition-colors",
                  active?.j === j ? "font-semibold text-foreground" : "text-muted-foreground"
                )}
              >
                {name}
              </motion.span>
            ))}

            {labels.map((name, i) => (
              <motion.span
                key={`row-${i}`}
                layout
                role="rowheader"
                transition={{ type: "spring", stiffness: 220, damping: 26 }}
                style={{ gridRow: pos[i] + 2, gridColumn: 1 }}
                className={cn("flex items-center justify-end truncate pr-2 transition-colors", active?.i === i ? "font-semibold text-foreground" : "text-muted-foreground")}
              >
                {name}
              </motion.span>
            ))}

            {labels.flatMap((_, i) =>
              labels.map((__, j) => {
                const p = pos[i]
                const q = pos[j]
                if (!shown(p, q)) return null
                const r = values[i]?.[j] ?? 0
                const a = Math.min(Math.abs(r), 1)
                const color = `color-mix(in oklch, ${r >= 0 ? colors.pos : colors.neg} ${Math.round(a * 100)}%, var(--muted))`
                const isActive = active?.i === i && active?.j === j
                const inCross = active && (active.i === i || active.j === j)
                return (
                  <motion.div
                    key={`${i}-${j}`}
                    layout
                    transition={{ type: "spring", stiffness: 220, damping: 26 }}
                    role="gridcell"
                    tabIndex={focus.p === p && focus.q === q ? 0 : -1}
                    aria-label={`${labels[i]} and ${labels[j]}: ${fmt(r)}, ${strength(r)}`}
                    ref={(el: HTMLDivElement | null) => {
                      if (el) cells.current.set(`${i}-${j}`, el)
                      else cells.current.delete(`${i}-${j}`)
                    }}
                    style={{ gridRow: p + 2, gridColumn: q + 2 }}
                    onMouseEnter={() => setHover({ i, j })}
                    onFocus={(e) => {
                      setFocus({ p, q })
                      setFocusVisible(e.currentTarget.matches(":focus-visible"))
                    }}
                    onBlur={() => setFocusVisible(false)}
                    onKeyDown={(e) => {
                      const map: Record<string, [number, number]> = {
                        ArrowRight: [p, q + 1],
                        ArrowLeft: [p, q - 1],
                        ArrowDown: [p + 1, q],
                        ArrowUp: [p - 1, q],
                        Home: [p, 0],
                        End: [p, n - 1],
                      }
                      if (map[e.key]) {
                        e.preventDefault()
                        move(...map[e.key])
                      } else if ((e.key === "Enter" || e.key === " ") && onCellClick) {
                        e.preventDefault()
                        onCellClick({ row: labels[i], col: labels[j], value: r })
                      }
                    }}
                    onClick={() => onCellClick?.({ row: labels[i], col: labels[j], value: r })}
                    className={cn(
                      "relative flex aspect-square items-center justify-center rounded-[4px] outline-none transition-opacity duration-150 focus-visible:ring-2 focus-visible:ring-ring",
                      shape === "circle" && "bg-muted/40",
                      active && !inCross && "opacity-40",
                      isActive && "z-10 ring-2 ring-foreground ring-offset-1 ring-offset-background",
                      onCellClick && "cursor-pointer"
                    )}
                  >
                    <span
                      aria-hidden
                      className={cn("absolute", shape === "circle" ? "rounded-full" : "inset-0 rounded-[4px]")}
                      style={
                        shape === "circle"
                          ? { background: `${r >= 0 ? colors.pos : colors.neg}`, width: `${Math.max(8, Math.sqrt(a) * 92)}%`, height: `${Math.max(8, Math.sqrt(a) * 92)}%` }
                          : { background: color }
                      }
                    />
                    {printNumbers && (
                      <span aria-hidden className={cn("relative font-mono text-[10px] tabular-nums", shape === "square" && a > 0.6 ? "text-white" : "text-foreground")}>
                        {i === j ? "" : fmt(r)}
                      </span>
                    )}
                  </motion.div>
                )
              })
            )}
          </div>
        </LayoutGroup>

        <div className="mt-3 flex min-h-5 flex-wrap items-center justify-between gap-3 text-[11px] text-muted-foreground">
          <span aria-hidden>
            {active ? (
              <>
                <span className="font-medium text-foreground">{labels[active.i]}</span> ↔ <span className="font-medium text-foreground">{labels[active.j]}</span>
                {" · "}
                <span className="font-mono text-foreground">{fmt(values[active.i]?.[active.j] ?? 0)}</span> · {strength(values[active.i]?.[active.j] ?? 0)}
              </>
            ) : (
              "Hover a cell to read the pair"
            )}
          </span>
          {showLegend && (
            <span className="flex items-center gap-1.5 font-mono">
              −1
              <span
                className="h-1.5 w-24 rounded-full"
                style={{ background: `linear-gradient(90deg, ${colors.neg}, var(--muted), ${colors.pos})` }}
              />
              +1
            </span>
          )}
        </div>
      </div>
    </MotionConfig>
  )
}
