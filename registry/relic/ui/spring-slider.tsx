"use client"

/**
 * Relic UI · Spring Slider
 * https://relic-ui.vercel.app/docs/spring-slider
 *
 * Copyright (c) 2026 Shubham Tambe
 * Open source under the MIT License: https://relic-ui.vercel.app/license
 */

import { useEffect, useLayoutEffect, useRef, useState } from "react"
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react"

import { cn } from "@/lib/utils"

export interface SpringSliderProps {
  /** The value (controlled). */
  value?: number
  /** The value at first (uncontrolled). */
  defaultValue?: number
  onValueChange?: (value: number) => void
  min?: number
  max?: number
  step?: number
  /** How tight the spring is. Higher follows faster. */
  stiffness?: number
  /** How much it settles. Lower overshoots and wobbles more. */
  damping?: number
  /** Text above the slider, also its accessible name. */
  label?: string
  /** Show the value next to the label. */
  showValue?: boolean
  className?: string
}

/**
 * A slider whose handle hangs on a spring: it trails your finger, overshoots
 * and settles. Pull past either end and the track stretches like rubber,
 * then snaps back when you let go.
 */
export function SpringSlider({
  value: valueProp,
  defaultValue = 50,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  stiffness = 260,
  damping = 14,
  label = "Value",
  showValue = true,
  className,
}: SpringSliderProps) {
  const reduceMotion = useReducedMotion()
  const [internal, setInternal] = useState(defaultValue)
  const value = valueProp ?? internal
  const [width, setWidth] = useState(0)

  const trackRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)
  const latest = useRef(value)
  const thumb = useMotionValue(0)
  const stretch = useMotionValue(0)

  const safeWidth = Math.max(width, 1)
  const scaleX = useTransform(stretch, (s) => 1 + Math.abs(s) / safeWidth)
  const originX = useTransform(stretch, (s) => (s >= 0 ? 0 : 1))
  const spring = reduceMotion
    ? { duration: 0 }
    : ({ type: "spring", stiffness, damping } as const)

  const toPx = (v: number) => ((v - min) / (max - min)) * width

  useLayoutEffect(() => {
    const el = trackRef.current
    if (!el) return
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width))
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Follow value changes (keys, clicks, outside updates) with the spring.
  const placed = useRef(false)
  useEffect(() => {
    latest.current = value
    if (!width || dragging.current) return
    if (!placed.current) {
      placed.current = true
      thumb.jump(toPx(value))
      return
    }
    animate(thumb, toPx(value), spring)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, width])

  function commit(next: number) {
    const clean = Math.min(Math.max(Math.round((next - min) / step) * step + min, min), max)
    const fixed = Number(clean.toFixed(10))
    latest.current = fixed
    if (fixed === value) return
    if (valueProp === undefined) setInternal(fixed)
    onValueChange?.(fixed)
  }

  function follow(clientX: number) {
    const rect = trackRef.current!.getBoundingClientRect()
    const raw = clientX - rect.left
    const clamped = Math.min(Math.max(raw, 0), rect.width)
    const over = raw - clamped
    // Rubber band: the further you pull, the less it gives.
    stretch.set(Math.sign(over) * Math.min(Math.sqrt(Math.abs(over)) * 2.2, 16))
    animate(thumb, clamped, spring)
    commit(min + (clamped / rect.width) * (max - min))
  }

  function release() {
    if (!dragging.current) return
    dragging.current = false
    animate(stretch, 0, reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 500, damping: 10 })
    animate(thumb, toPx(latest.current), spring)
  }

  return (
    <div data-slot="spring-slider" className={cn("w-full", className)}>
      <div className="mb-3 flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        {showValue && <span className="font-mono text-muted-foreground tabular-nums">{value}</span>}
      </div>
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
          follow(e.clientX)
        }}
        onPointerMove={(e) => dragging.current && follow(e.clientX)}
        onPointerUp={release}
        onPointerCancel={release}
        className="relative h-6 cursor-pointer touch-none select-none"
      >
        <motion.div
          className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-muted"
          style={{ scaleX, originX }}
        >
          <motion.div className="absolute inset-y-0 left-0 rounded-full bg-primary" style={{ width: thumb }} />
        </motion.div>
        <motion.div
          role="slider"
          tabIndex={0}
          aria-label={label}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          onKeyDown={(e) => {
            const big = step * 10
            const moves: Record<string, number> = {
              ArrowRight: value + step,
              ArrowUp: value + step,
              ArrowLeft: value - step,
              ArrowDown: value - step,
              PageUp: value + big,
              PageDown: value - big,
              Home: min,
              End: max,
            }
            if (e.key in moves) {
              e.preventDefault()
              commit(moves[e.key])
            }
          }}
          className="absolute top-1/2 -ml-2.5 size-5 -translate-y-1/2 rounded-full border-2 border-primary bg-background shadow-md outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          style={{ x: thumb }}
        />
      </div>
    </div>
  )
}
