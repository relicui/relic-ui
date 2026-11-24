"use client"

/**
 * Relic UI · Heat Mosaic
 * https://relic-ui.vercel.app/docs/heat-mosaic
 *
 * Copyright (c) 2026 Shubham Tambe
 * Open source under the MIT License: https://relic-ui.vercel.app/license
 */

import { useEffect, useMemo, useRef, useState } from "react"
import { MotionConfig, motion } from "motion/react"

import { cn } from "@/lib/utils"

export type MosaicItem = {
  id: string
  label: string
  /** Area of the tile: market cap, file size, revenue … */
  size: number
  /** Color of the tile: change, growth, error rate … (can be negative). */
  value: number
  /** Tiles with the same group sit together, and the group can be zoomed into. */
  group?: string
}

export interface HeatMosaicProps {
  items: MosaicItem[]
  /** Height in pixels (the width fills the container). */
  height?: number
  palette?: "green-red" | "blue-orange" | "brand"
  /** The value that gets the strongest color. Defaults to the largest one. */
  range?: number
  /** Format a value for the tiles and the readout. */
  format?: (value: number) => string
  /** Format a size for the readout. */
  formatSize?: (size: number) => string
  /** Click a group to zoom into it. */
  zoomable?: boolean
  showGroupLabels?: boolean
  /** Gap between tiles in pixels. */
  gap?: number
  onItemClick?: (item: MosaicItem) => void
  /** Accessible name of the map. */
  label?: string
  className?: string
}

type Rect = { x: number; y: number; w: number; h: number }

const PALETTES = {
  "green-red": { pos: "oklch(0.62 0.17 150)", neg: "oklch(0.6 0.21 25)" },
  "blue-orange": { pos: "oklch(0.72 0.17 60)", neg: "oklch(0.6 0.17 250)" },
  brand: { pos: "var(--brand)", neg: "var(--muted-foreground)" },
}

const HEADER = 18

/** Squarified treemap: tiles as close to squares as possible. */
function squarify<T extends { size: number }>(items: T[], rect: Rect): (T & Rect)[] {
  const total = items.reduce((t, i) => t + Math.max(i.size, 0), 0)
  if (!total || rect.w <= 0 || rect.h <= 0) return []
  const scale = (rect.w * rect.h) / total
  const nodes = items
    .filter((i) => i.size > 0)
    .sort((a, b) => b.size - a.size)
    .map((item) => ({ item, area: item.size * scale }))
  const out: (T & Rect)[] = []
  let { x, y, w, h } = rect

  const worst = (row: typeof nodes, side: number) => {
    let s = 0
    let max = 0
    let min = Infinity
    for (const n of row) {
      s += n.area
      max = Math.max(max, n.area)
      min = Math.min(min, n.area)
    }
    return Math.max((side * side * max) / (s * s), (s * s) / (side * side * min))
  }
  const place = (row: typeof nodes) => {
    const s = row.reduce((t, n) => t + n.area, 0)
    if (w >= h) {
      const cw = s / h
      let yy = y
      for (const n of row) {
        const nh = n.area / cw
        out.push({ ...n.item, x, y: yy, w: cw, h: nh })
        yy += nh
      }
      x += cw
      w -= cw
    } else {
      const rh = s / w
      let xx = x
      for (const n of row) {
        const nw = n.area / rh
        out.push({ ...n.item, x: xx, y, w: nw, h: rh })
        xx += nw
      }
      y += rh
      h -= rh
    }
  }

  let row: typeof nodes = []
  let i = 0
  while (i < nodes.length) {
    const side = Math.min(w, h)
    const next = [...row, nodes[i]]
    if (row.length === 0 || worst(next, side) <= worst(row, side)) {
      row = next
      i++
    } else {
      place(row)
      row = []
    }
  }
  if (row.length) place(row)
  return out
}

/**
 * A treemap heatmap: tile size is weight, tile color is change. Click a group
 * and the map zooms in, re-tiling that group to fill the space while the rest
 * slide away. Esc zooms back out.
 */
export function HeatMosaic({
  items,
  height = 360,
  palette = "green-red",
  range,
  format = (v) => `${v > 0 ? "+" : v < 0 ? "−" : ""}${Math.abs(v).toFixed(1)}%`,
  formatSize = (s) => s.toLocaleString(),
  zoomable = true,
  showGroupLabels = true,
  gap = 2,
  onItemClick,
  label = "Heat mosaic",
  className,
}: HeatMosaicProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)
  const [zoom, setZoom] = useState<string | null>(null)
  const [hover, setHover] = useState<string | null>(null)
  const [focusId, setFocusId] = useState<string | null>(null)
  const tiles = useRef(new Map<string, HTMLElement>())
  const colors = PALETTES[palette]

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => setWidth(Math.round(entry.contentRect.width)))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const max = range ?? Math.max(0.0001, ...items.map((i) => Math.abs(i.value)))
  const grouped = items.some((i) => i.group)

  const layout = useMemo(() => {
    const full: Rect = { x: 0, y: 0, w: width, h: height }
    const rects = new Map<string, Rect>()
    const groups: (Rect & { name: string; size: number })[] = []
    if (!width) return { rects, groups }
    if (!grouped) {
      for (const t of squarify(items, full)) rects.set(t.id, t)
      return { rects, groups }
    }
    const sums = new Map<string, number>()
    for (const i of items) sums.set(i.group ?? "Other", (sums.get(i.group ?? "Other") ?? 0) + Math.max(i.size, 0))
    for (const g of squarify(Array.from(sums, ([name, size]) => ({ name, size })), full)) {
      groups.push(g)
      const head = showGroupLabels && g.h > HEADER * 2.5 && g.w > 50 ? HEADER : 0
      const inner = { x: g.x, y: g.y + head, w: g.w, h: g.h - head }
      for (const t of squarify(items.filter((i) => (i.group ?? "Other") === g.name), inner)) rects.set(t.id, t)
    }
    return { rects, groups }
  }, [items, width, height, grouped, showGroupLabels])

  // When zoomed: the group's tiles re-tile the whole map; everything else is
  // pushed outward by the same zoom, so it slides off the edges.
  const view = useMemo(() => {
    const rects = new Map(layout.rects)
    const groups = new Map(layout.groups.map((g) => [g.name, g as Rect]))
    const g = zoom ? layout.groups.find((x) => x.name === zoom) : null
    if (!g || !width) return { rects, groups }
    const sx = width / g.w
    const sy = height / g.h
    const map = (r: Rect): Rect => ({ x: (r.x - g.x) * sx, y: (r.y - g.y) * sy, w: r.w * sx, h: r.h * sy })
    for (const [id, r] of rects) rects.set(id, map(r))
    for (const [name, r] of groups) groups.set(name, map(r))
    for (const t of squarify(items.filter((i) => (i.group ?? "Other") === zoom), { x: 0, y: 0, w: width, h: height })) rects.set(t.id, t)
    return { rects, groups }
  }, [layout, zoom, items, width, height])

  const order = useMemo(() => {
    const list = zoom ? items.filter((i) => (i.group ?? "Other") === zoom) : items
    return [...list].sort((a, b) => b.size - a.size)
  }, [items, zoom])

  const shown = items.find((i) => i.id === (hover ?? focusId))

  function choose(item: MosaicItem) {
    if (zoomable && grouped && !zoom) setZoom(item.group ?? "Other")
    else onItemClick?.(item)
  }

  function moveFocus(id: string, step: number) {
    const k = order.findIndex((i) => i.id === id)
    const next = order[Math.min(order.length - 1, Math.max(0, k + step))]
    if (next) {
      setFocusId(next.id)
      tiles.current.get(next.id)?.focus()
    }
  }

  const tabStop = focusId && order.some((i) => i.id === focusId) ? focusId : order[0]?.id

  return (
    <MotionConfig reducedMotion="user">
      <div
        data-slot="heat-mosaic"
        className={cn("flex w-full flex-col gap-2 text-xs", className)}
        onKeyDown={(e) => {
          if (e.key === "Escape" && zoom) {
            e.preventDefault()
            setZoom(null)
          }
        }}
      >
        {grouped && zoomable && (
          <nav aria-label="Zoom" className="flex h-6 items-center gap-1 text-muted-foreground">
            <button
              type="button"
              disabled={!zoom}
              onClick={() => setZoom(null)}
              className="rounded px-1.5 py-0.5 transition-colors outline-none enabled:hover:bg-muted enabled:hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 disabled:font-medium disabled:text-foreground"
            >
              All
            </button>
            {zoom && (
              <>
                <span aria-hidden>/</span>
                <span className="font-medium text-foreground" aria-current="page">
                  {zoom}
                </span>
                <span className="ml-auto text-[11px]">Esc to zoom out</span>
              </>
            )}
          </nav>
        )}

        <div ref={ref} role="list" aria-label={label} className="relative w-full overflow-hidden rounded-xl" style={{ height }} onMouseLeave={() => setHover(null)}>
          {items.map((item) => {
            const r = view.rects.get(item.id)
            if (!r) return null
            const t = Math.max(-1, Math.min(1, item.value / max))
            const strong = Math.abs(t) > 0.55
            const inZoom = !zoom || (item.group ?? "Other") === zoom
            const big = r.w > 58 && r.h > 34
            const mid = r.w > 34 && r.h > 18
            return (
              <motion.div
                key={item.id}
                role="listitem"
                className="absolute"
                initial={false}
                animate={{ x: r.x, y: r.y, width: Math.max(0, r.w - gap), height: Math.max(0, r.h - gap) }}
                transition={{ type: "spring", stiffness: 170, damping: 26 }}
              >
                <button
                  type="button"
                  tabIndex={inZoom && item.id === tabStop ? 0 : -1}
                  aria-hidden={!inZoom || undefined}
                  aria-label={`${item.label}${item.group ? `, ${item.group}` : ""}: ${format(item.value)}, size ${formatSize(item.size)}`}
                  ref={(el) => {
                    if (el) tiles.current.set(item.id, el)
                    else tiles.current.delete(item.id)
                  }}
                  onMouseEnter={() => setHover(item.id)}
                  onFocus={() => setFocusId(item.id)}
                  onClick={() => choose(item)}
                  onKeyDown={(e) => {
                    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key]
                    if (step) {
                      e.preventDefault()
                      moveFocus(item.id, step)
                    }
                  }}
                  className={cn(
                    "flex size-full flex-col items-start justify-end overflow-hidden rounded-[5px] p-1.5 text-left outline-none transition-[box-shadow,filter] duration-150 focus-visible:ring-2 focus-visible:ring-ring",
                    hover === item.id && "z-10 ring-2 ring-foreground brightness-110",
                    strong ? "text-white" : "text-foreground"
                  )}
                  style={{ background: `color-mix(in oklch, ${t >= 0 ? colors.pos : colors.neg} ${Math.round(12 + Math.abs(t) * 88)}%, var(--muted))` }}
                >
                  {mid && <span className="w-full truncate leading-tight font-semibold">{item.label}</span>}
                  {big && <span className="font-mono text-[11px] opacity-90">{format(item.value)}</span>}
                </button>
              </motion.div>
            )
          })}

          {showGroupLabels &&
            layout.groups.map((g) => {
              const r = view.groups.get(g.name)
              if (!r || r.h <= HEADER * 2.5 || r.w <= 50) return null
              return (
                <motion.span
                  key={`g-${g.name}`}
                  aria-hidden
                  className="pointer-events-none absolute truncate px-1.5 text-[10px] font-semibold tracking-wide text-muted-foreground uppercase"
                  initial={false}
                  animate={{ x: r.x, y: r.y, width: r.w, opacity: zoom ? 0 : 1 }}
                  transition={{ type: "spring", stiffness: 170, damping: 26 }}
                  style={{ height: HEADER, lineHeight: `${HEADER}px` }}
                >
                  {g.name}
                </motion.span>
              )
            })}
        </div>

        <p aria-hidden className="h-4 truncate text-[11px] text-muted-foreground">
          {shown ? (
            <>
              <span className="font-medium text-foreground">{shown.label}</span>
              {shown.group && <> · {shown.group}</>} · <span className="font-mono text-foreground">{format(shown.value)}</span> · size {formatSize(shown.size)}
            </>
          ) : grouped && zoomable && !zoom ? (
            "Click a tile to zoom into its group"
          ) : (
            "Hover a tile to read it"
          )}
        </p>
      </div>
    </MotionConfig>
  )
}
