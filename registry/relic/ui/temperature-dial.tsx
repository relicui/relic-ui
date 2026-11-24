"use client"

/**
 * Relic UI · Temperature Dial
 * https://relic-ui.vercel.app/docs/temperature-dial
 *
 * Copyright (c) 2026 Shubham Tambe
 * Open source under the MIT License: https://relic-ui.vercel.app/license
 */

import { useEffect, useRef, useState } from "react"
import { useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"

type Dot = { hx: number; hy: number; x: number; y: number; vx: number; vy: number }

export interface TemperatureDialProps {
  /** The temperature (controlled). */
  value?: number
  /** The temperature at first (uncontrolled). */
  defaultValue?: number
  onValueChange?: (value: number) => void
  min?: number
  max?: number
  step?: number
  /** Names for the low, middle and high ranges. */
  labels?: [string, string, string]
  /** Number of particles in the chamber. */
  particles?: number
  /** Height of the particle chamber, in pixels. */
  chamberHeight?: number
  /** Show the number next to the label. */
  showValue?: boolean
  /** Text above the dial, also its accessible name. */
  label?: string
  className?: string
}

/**
 * An AI temperature (creativity) control you can see. Low values keep the
 * particles in calm, tidy rows; high values set them swarming freely.
 */
export function TemperatureDial({
  value: valueProp,
  defaultValue = 0.7,
  onValueChange,
  min = 0,
  max = 2,
  step = 0.1,
  labels = ["Precise", "Balanced", "Creative"],
  particles = 30,
  chamberHeight = 112,
  showValue = true,
  label = "Temperature",
  className,
}: TemperatureDialProps) {
  const reduceMotion = useReducedMotion()
  const [internal, setInternal] = useState(defaultValue)
  const value = valueProp ?? internal
  const heat = (value - min) / (max - min)
  const heatRef = useRef(heat)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)

  useEffect(() => {
    heatRef.current = heat
  }, [heat])

  // The particle chamber.
  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return
    let width = 0
    let height = 0
    let dots: Dot[] = []
    let color = "gray"
    let frame = 0

    function layout() {
      const rect = canvas!.getBoundingClientRect()
      width = rect.width
      height = rect.height
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas!.width = Math.round(width * dpr)
      canvas!.height = Math.round(height * dpr)
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
      const cols = Math.max(Math.round(Math.sqrt((particles * width) / Math.max(height, 1))), 1)
      const rows = Math.ceil(particles / cols)
      dots = Array.from({ length: particles }, (_, i) => {
        const hx = ((i % cols) + 0.5) * (width / cols)
        const hy = (Math.floor(i / cols) + 0.5) * (height / rows)
        return { hx, hy, x: hx, y: hy, vx: 0, vy: 0 }
      })
      color = getComputedStyle(canvas!).getPropertyValue("--primary").trim() || "gray"
    }

    function draw() {
      const t = reduceMotion ? 0 : heatRef.current
      ctx!.clearRect(0, 0, width, height)
      ctx!.fillStyle = color
      const pull = 0.004 + (1 - t) * 0.09
      const kick = t * t * 0.9
      for (const d of dots) {
        d.vx += (Math.random() - 0.5) * kick + (d.hx - d.x) * pull
        d.vy += (Math.random() - 0.5) * kick + (d.hy - d.y) * pull
        d.vx *= 0.9
        d.vy *= 0.9
        d.x += d.vx
        d.y += d.vy
        if (d.x < 3 || d.x > width - 3) d.vx *= -1
        if (d.y < 3 || d.y > height - 3) d.vy *= -1
        d.x = Math.min(Math.max(d.x, 3), width - 3)
        d.y = Math.min(Math.max(d.y, 3), height - 3)
        ctx!.globalAlpha = 0.45 + t * 0.5
        ctx!.beginPath()
        ctx!.arc(d.x, d.y, 2.2 + t * 0.8, 0, Math.PI * 2)
        ctx!.fill()
      }
      ctx!.globalAlpha = 1
      frame = requestAnimationFrame(draw)
    }

    layout()
    frame = requestAnimationFrame(draw)
    const observer = new ResizeObserver(layout)
    observer.observe(canvas)
    const theme = new MutationObserver(() => {
      color = getComputedStyle(canvas).getPropertyValue("--primary").trim() || "gray"
    })
    theme.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      theme.disconnect()
    }
  }, [particles, reduceMotion])

  function commit(next: number) {
    const snapped = Math.round((next - min) / step) * step + min
    const clean = Number(Math.min(Math.max(snapped, min), max).toFixed(4))
    if (clean === value) return
    if (valueProp === undefined) setInternal(clean)
    onValueChange?.(clean)
  }

  function fromPointer(clientX: number) {
    const rect = trackRef.current!.getBoundingClientRect()
    commit(min + ((clientX - rect.left) / rect.width) * (max - min))
  }

  const zone = heat < 1 / 3 ? 0 : heat < 2 / 3 ? 1 : 2

  return (
    <div data-slot="temperature-dial" className={cn("w-full", className)}>
      <div className="mb-2 flex items-baseline justify-between text-sm">
        <span className="font-medium">{label}</span>
        {showValue && <span className="font-mono text-muted-foreground tabular-nums">{value.toFixed(1)}</span>}
      </div>
      <canvas
        ref={canvasRef}
        aria-hidden
        className="block w-full rounded-xl border bg-muted/30"
        style={{ height: chamberHeight }}
      />
      <div
        ref={trackRef}
        onPointerDown={(e) => {
          // Capturing can fail (e.g. for a simulated or already-ended pointer);
          // the component still works without it.
          try {
            e.currentTarget.setPointerCapture(e.pointerId)
          } catch {
            // not capturable, carry on
          }
          dragging.current = true
          fromPointer(e.clientX)
        }}
        onPointerMove={(e) => dragging.current && fromPointer(e.clientX)}
        onPointerUp={() => (dragging.current = false)}
        onPointerCancel={() => (dragging.current = false)}
        className="relative mt-4 h-6 cursor-pointer touch-none select-none"
      >
        <span
          aria-hidden
          className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full"
          style={{
            background:
              "linear-gradient(to right, color-mix(in oklch, var(--primary) 55%, transparent), color-mix(in oklch, var(--destructive) 75%, transparent))",
          }}
        />
        <span
          role="slider"
          tabIndex={0}
          aria-label={label}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          aria-valuetext={`${value.toFixed(1)}, ${labels[zone]}`}
          onKeyDown={(e) => {
            const moves: Record<string, number> = {
              ArrowRight: value + step,
              ArrowUp: value + step,
              ArrowLeft: value - step,
              ArrowDown: value - step,
              Home: min,
              End: max,
            }
            if (e.key in moves) {
              e.preventDefault()
              commit(moves[e.key])
            }
          }}
          className="absolute top-1/2 size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-foreground/80 bg-background shadow-md transition-[left] duration-150 outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          style={{ left: `${heat * 100}%` }}
        />
      </div>
      <div className="mt-2 grid grid-cols-3 text-xs">
        {labels.map((name, i) => (
          <span
            key={name}
            className={cn(
              "transition-colors",
              i === 1 && "text-center",
              i === 2 && "text-right",
              i === zone ? "font-medium text-foreground" : "text-muted-foreground"
            )}
          >
            {name}
          </span>
        ))}
      </div>
    </div>
  )
}
