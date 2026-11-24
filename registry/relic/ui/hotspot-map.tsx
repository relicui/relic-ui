"use client"

/**
 * Relic UI · Hotspot Map
 * https://relic-ui.vercel.app/docs/hotspot-map
 *
 * Copyright (c) 2026 Shubham Tambe
 * Open source under the MIT License: https://relic-ui.vercel.app/license
 */

import { useEffect, useId, useMemo, useRef, useState } from "react"
import { useInView, useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"

export type Hotspot = {
  /** 0 to 1 from the left edge. */
  x: number
  /** 0 to 1 from the top edge. */
  y: number
  /** When it happened, in any unit (used for replay order). */
  t?: number
  /** How much this click counts. */
  weight?: number
}

export interface HotspotMapProps {
  /** Recorded clicks, in 0–1 coordinates so they fit any size. */
  points: Hotspot[]
  /** The page or screenshot the heat sits on. */
  children?: React.ReactNode
  /** Spread of each click in pixels. */
  radius?: number
  /** How much heat each click adds, 0 to 1. */
  intensity?: number
  /** Opacity of the whole overlay. */
  opacity?: number
  palette?: "heat" | "brand" | "mono"
  /** Play the clicks back in the order they happened. */
  replay?: boolean
  /** Seconds a full replay takes. */
  replayDuration?: number
  /** Start again after the replay ends. */
  loop?: boolean
  /** Play, pause and a scrubber under the map (when replay is on). */
  showControls?: boolean
  /** A "few → many" color scale. */
  showLegend?: boolean
  /** Draw a small dot on every click too. */
  showPoints?: boolean
  /** Record clicks made on the content right here, live. */
  track?: boolean
  onTrack?: (point: Hotspot) => void
  /** Hide the heat (e.g. a toggle in your UI). */
  hidden?: boolean
  className?: string
}

const HEAT = ["#2563eb", "#06b6d4", "#84cc16", "#facc15", "#f97316", "#ef4444"]

function paletteColors(palette: HotspotMapProps["palette"], el: HTMLElement) {
  if (palette === "heat") return HEAT
  const style = getComputedStyle(el)
  const base = palette === "brand" ? style.getPropertyValue("--brand").trim() || "#d4a017" : style.color
  return [base, base, base, palette === "brand" ? "#fff7d6" : base]
}

function buildPalette(colors: string[]) {
  const c = document.createElement("canvas")
  c.width = 256
  c.height = 1
  const ctx = c.getContext("2d")
  if (!ctx) return null
  const g = ctx.createLinearGradient(0, 0, 256, 0)
  colors.forEach((color, i) => {
    try {
      g.addColorStop(i / (colors.length - 1), color)
    } catch {
      g.addColorStop(i / (colors.length - 1), "#888")
    }
  })
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 256, 1)
  return ctx.getImageData(0, 0, 256, 1).data
}

function makeBrush(r: number) {
  const c = document.createElement("canvas")
  c.width = c.height = r * 2
  const ctx = c.getContext("2d")
  if (ctx) {
    const g = ctx.createRadialGradient(r, r, 0, r, r, r)
    g.addColorStop(0, "rgba(0,0,0,1)")
    g.addColorStop(1, "rgba(0,0,0,0)")
    ctx.fillStyle = g
    ctx.fillRect(0, 0, r * 2, r * 2)
  }
  return c
}

/**
 * A click heatmap laid over any page or screenshot. Clicks pool into warm
 * spots, can be replayed in the order they happened, and new clicks can be
 * recorded live, so you can see where people actually try to interact.
 */
export function HotspotMap({
  points,
  children,
  radius = 28,
  intensity = 0.35,
  opacity = 0.75,
  palette = "heat",
  replay = false,
  replayDuration = 6,
  loop = true,
  showControls = true,
  showLegend = true,
  showPoints = false,
  track = false,
  onTrack,
  hidden = false,
  className,
}: HotspotMapProps) {
  const id = useId()
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const progressRef = useRef(replay ? 0 : 1)
  const [size, setSize] = useState({ w: 0, h: 0 })
  const [tracked, setTracked] = useState<Hotspot[]>([])
  const [progress, setProgress] = useState(replay ? 0 : 1)
  const [playing, setPlaying] = useState(replay)
  const [theme, setTheme] = useState(0)
  const inView = useInView(wrapRef)
  const reduce = useReducedMotion()

  // Every click on one timeline: given times first, then live ones after.
  const timeline = useMemo(() => {
    const all = [...points, ...tracked]
    let last = 0
    const timed = all.map((p, i) => {
      const t = p.t ?? (i < points.length ? i : last + 1)
      last = Math.max(last, t)
      return { ...p, t }
    })
    timed.sort((a, b) => a.t - b.t)
    const start = timed[0]?.t ?? 0
    const end = timed[timed.length - 1]?.t ?? 0
    return { list: timed, start, span: Math.max(end - start, 1e-9) }
  }, [points, tracked])

  // Keep the canvas the same size as the content.
  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setSize({ w: Math.round(width), h: Math.round(height) })
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Redraw when the theme changes (brand and mono colors come from CSS).
  useEffect(() => {
    const mo = new MutationObserver(() => setTheme((n) => n + 1))
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "style", "data-theme"] })
    return () => mo.disconnect()
  }, [])

  // The replay clock.
  const live = playing && inView && !reduce
  useEffect(() => {
    if (!live) return
    let raf = 0
    let last = performance.now()
    const hold = 1.2 / replayDuration // pause on the full picture before looping
    const tick = (now: number) => {
      const dt = (now - last) / 1000
      last = now
      let next = progressRef.current + dt / replayDuration
      if (next >= 1 + hold) {
        if (loop) next = 0
        else {
          next = 1
          setPlaying(false)
        }
      }
      progressRef.current = next
      setProgress(next)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [live, replayDuration, loop])

  const shown = reduce && playing ? 1 : Math.min(progress, 1)
  const cutoff = timeline.start + shown * timeline.span
  const count = timeline.list.filter((p) => p.t <= cutoff + 1e-9).length

  // Draw: pool alpha for every click, then color it through the palette.
  useEffect(() => {
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (!canvas || !wrap || !size.w || !size.h) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const W = Math.round(size.w * dpr)
    const H = Math.round(size.h * dpr)
    if (canvas.width !== W) canvas.width = W
    if (canvas.height !== H) canvas.height = H
    const ctx = canvas.getContext("2d", { willReadFrequently: true })
    if (!ctx) return
    ctx.clearRect(0, 0, W, H)
    const r = Math.max(2, Math.round(radius * dpr))
    const brush = makeBrush(r)
    const visible = timeline.list.filter((p) => p.t <= cutoff + 1e-9)
    for (const p of visible) {
      ctx.globalAlpha = Math.min(1, Math.max(0.01, intensity * (p.weight ?? 1)))
      ctx.drawImage(brush, p.x * W - r, p.y * H - r)
    }
    ctx.globalAlpha = 1
    const pal = buildPalette(paletteColors(palette, wrap))
    if (pal && visible.length) {
      const img = ctx.getImageData(0, 0, W, H)
      const d = img.data
      for (let i = 3; i < d.length; i += 4) {
        const a = d[i]
        if (!a) continue
        const j = a * 4
        d[i - 3] = pal[j]
        d[i - 2] = pal[j + 1]
        d[i - 1] = pal[j + 2]
        d[i] = Math.min(255, a * 1.8)
      }
      ctx.putImageData(img, 0, 0)
    }
    if (showPoints) {
      ctx.fillStyle = "rgba(255,255,255,0.9)"
      ctx.strokeStyle = "rgba(0,0,0,0.35)"
      ctx.lineWidth = dpr
      for (const p of visible) {
        ctx.beginPath()
        ctx.arc(p.x * W, p.y * H, 2 * dpr, 0, Math.PI * 2)
        ctx.fill()
        ctx.stroke()
      }
    }
  }, [size, timeline, cutoff, radius, intensity, palette, showPoints, theme])

  const legend = palette === "heat" ? HEAT : palette === "brand" ? ["transparent", "var(--brand)"] : ["transparent", "currentColor"]

  return (
    <div data-slot="hotspot-map" className={cn("flex w-full flex-col gap-2", className)}>
      <div
        ref={wrapRef}
        className={cn("relative overflow-hidden rounded-xl border", track && "cursor-crosshair")}
        onClickCapture={(e) => {
          if (!track) return
          const rect = e.currentTarget.getBoundingClientRect()
          const point = { x: (e.clientX - rect.left) / rect.width, y: (e.clientY - rect.top) / rect.height }
          setTracked((list) => [...list, point])
          onTrack?.(point)
          // Show the new click straight away.
          progressRef.current = 1
          setProgress(1)
          setPlaying(false)
        }}
        aria-describedby={`${id}-summary`}
      >
        {children}
        <canvas
          ref={canvasRef}
          aria-hidden
          className="pointer-events-none absolute inset-0 size-full transition-opacity duration-300"
          style={{ opacity: hidden ? 0 : opacity }}
        />
        <span id={`${id}-summary`} className="sr-only">
          Heatmap of {count} click{count === 1 ? "" : "s"}.
        </span>
      </div>

      {((replay && showControls) || showLegend) && (
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {replay && showControls && (
            <>
              <button
                type="button"
                onClick={() => {
                  if (!playing && progressRef.current >= 1) {
                    progressRef.current = 0
                    setProgress(0)
                  }
                  setPlaying(!playing)
                }}
                aria-label={playing ? "Pause replay" : "Play replay"}
                className="flex size-7 shrink-0 items-center justify-center rounded-full border bg-background text-foreground transition-colors outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/50"
              >
                {playing ? (
                  <svg viewBox="0 0 16 16" fill="currentColor" className="size-3">
                    <rect x="3.5" y="3" width="3" height="10" rx="1" />
                    <rect x="9.5" y="3" width="3" height="10" rx="1" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 16 16" fill="currentColor" className="size-3">
                    <path d="M4.5 3.2v9.6a.6.6 0 0 0 .9.5l7.6-4.8a.6.6 0 0 0 0-1L5.4 2.7a.6.6 0 0 0-.9.5z" />
                  </svg>
                )}
              </button>
              <input
                type="range"
                min={0}
                max={1000}
                value={Math.round(Math.min(progress, 1) * 1000)}
                aria-label="Replay position"
                aria-valuetext={`${count} of ${timeline.list.length} clicks`}
                onChange={(e) => {
                  const v = Number(e.target.value) / 1000
                  progressRef.current = v
                  setProgress(v)
                  setPlaying(false)
                }}
                className="h-1 min-w-0 flex-1 cursor-pointer accent-[var(--brand)]"
              />
              <span className="w-20 shrink-0 text-right font-mono tabular-nums">
                {count}/{timeline.list.length}
              </span>
            </>
          )}
          {showLegend && (
            <span className={cn("flex shrink-0 items-center gap-1.5", !(replay && showControls) && "ml-auto")}>
              Few
              <span className="h-1.5 w-16 rounded-full" style={{ background: `linear-gradient(90deg, ${legend.join(", ")})` }} />
              Many
            </span>
          )}
        </div>
      )}
    </div>
  )
}
