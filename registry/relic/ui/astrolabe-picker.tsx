"use client"

/**
 * Relic UI · Astrolabe Picker
 * https://relic-ui.vercel.app/docs/astrolabe-picker
 *
 * Copyright (c) 2026 Shubham Tambe
 * Open source under the MIT License: https://relic-ui.vercel.app/license
 */

import { useEffect, useRef, useState } from "react"
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react"

import { cn } from "@/lib/utils"

const GLYPHS = ["☉", "☽", "♃", "♄", "♂", "♀", "☿", "✶"]

export interface AstrolabePickerProps {
  /** The choices around the outer ring. */
  options: string[]
  /** The chosen option (controlled). */
  value?: string
  /** The option chosen at first (uncontrolled). */
  defaultValue?: string
  onValueChange?: (value: string) => void
  /** Diameter in pixels. */
  size?: number
  /** Accessible name. */
  label?: string
  className?: string
}

/**
 * Choose a value by turning the rings of an astrolabe. Drag the outer ring
 * (or use the arrow keys); it snaps the chosen option under the pointer while
 * the inner ring turns the other way, like an old star instrument.
 */
export function AstrolabePicker({
  options,
  value: valueProp,
  defaultValue,
  onValueChange,
  size = 240,
  label = "Choose an option",
  className,
}: AstrolabePickerProps) {
  const reduceMotion = useReducedMotion()
  const n = Math.max(options.length, 1)
  const step = 360 / n
  const [internal, setInternal] = useState(defaultValue ?? options[0])
  const value = valueProp ?? internal
  const index = Math.max(options.indexOf(value), 0)

  const rotation = useMotionValue(-index * step)
  const inner = useTransform(rotation, (r) => -r * 0.5)
  const ringRef = useRef<HTMLDivElement>(null)
  const drag = useRef<{ last: number } | null>(null)

  /** Turn the ring so `target` sits under the pointer, by the shortest way. */
  function settle(target: number) {
    const current = rotation.get()
    let goal = -target * step
    goal += 360 * Math.round((current - goal) / 360)
    animate(rotation, goal, reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 200, damping: 20 })
  }

  useEffect(() => {
    if (!drag.current) settle(index)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index])

  function choose(next: number) {
    const wrapped = ((next % n) + n) % n
    if (wrapped === index) settle(wrapped)
    if (valueProp === undefined) setInternal(options[wrapped])
    onValueChange?.(options[wrapped])
  }

  function angleOf(e: React.PointerEvent) {
    const rect = ringRef.current!.getBoundingClientRect()
    return (Math.atan2(e.clientY - (rect.top + rect.height / 2), e.clientX - (rect.left + rect.width / 2)) * 180) / Math.PI
  }

  const labelRadius = size / 2 - 22

  return (
    <div
      ref={ringRef}
      role="slider"
      tabIndex={0}
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={n - 1}
      aria-valuenow={index}
      aria-valuetext={options[index]}
      data-slot="astrolabe-picker"
      onKeyDown={(e) => {
        if (e.key === "ArrowRight" || e.key === "ArrowUp") {
          e.preventDefault()
          choose(index + 1)
        } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
          e.preventDefault()
          choose(index - 1)
        }
      }}
      onPointerDown={(e) => {
        // Capturing can fail (e.g. for a simulated or already-ended pointer);
        // the component still works without it.
        try {
          e.currentTarget.setPointerCapture(e.pointerId)
        } catch {
          // not capturable, carry on
        }
        drag.current = { last: angleOf(e) }
      }}
      onPointerMove={(e) => {
        if (!drag.current) return
        const now = angleOf(e)
        let delta = now - drag.current.last
        if (delta > 180) delta -= 360
        if (delta < -180) delta += 360
        drag.current.last = now
        rotation.set(rotation.get() + delta)
      }}
      onPointerUp={() => {
        if (!drag.current) return
        drag.current = null
        choose(Math.round(-rotation.get() / step))
      }}
      className={cn(
        "relative shrink-0 cursor-grab touch-none rounded-full select-none outline-none active:cursor-grabbing focus-visible:ring-3 focus-visible:ring-ring/50",
        className
      )}
      style={{ width: size, height: size }}
    >
      {/* Outer ring: ticks and the options. */}
      <motion.div
        aria-hidden
        className="absolute inset-0 rounded-full border bg-card shadow-sm"
        style={{ rotate: rotation }}
      >
        <svg viewBox="0 0 100 100" className="absolute inset-0 size-full text-muted-foreground/40">
          {Array.from({ length: 72 }, (_, i) => (
            <line
              key={i}
              x1="50" y1="1.5" x2="50" y2={i % 6 === 0 ? 5 : 3.2}
              stroke="currentColor"
              strokeWidth={i % 6 === 0 ? 0.6 : 0.35}
              transform={`rotate(${i * 5} 50 50)`}
            />
          ))}
        </svg>
        {options.map((option, i) => (
          <span
            key={option}
            className={cn(
              "absolute top-1/2 left-1/2 font-mono text-[10px] tracking-wider whitespace-nowrap uppercase transition-colors",
              i === index ? "font-semibold text-foreground" : "text-muted-foreground"
            )}
            style={{ transform: `translate(-50%, -50%) rotate(${i * step}deg) translateY(-${labelRadius}px)` }}
          >
            {option}
          </span>
        ))}
      </motion.div>

      {/* Inner ring: turns the other way, at half speed. */}
      <motion.div
        aria-hidden
        className="absolute inset-[24%] rounded-full border border-dashed border-muted-foreground/40"
        style={{ rotate: inner }}
      >
        {GLYPHS.map((glyph, i) => (
          <span
            key={i}
            className="absolute top-1/2 left-1/2 text-[10px] text-muted-foreground/70"
            style={{ transform: `translate(-50%, -50%) rotate(${i * 45}deg) translateY(-${size * 0.26 - 9}px)` }}
          >
            {glyph}
          </span>
        ))}
      </motion.div>

      {/* The pointer at the top. */}
      <svg aria-hidden viewBox="0 0 12 10" className="absolute -top-1 left-1/2 w-3 -translate-x-1/2 fill-primary">
        <path d="M0 0h12L6 10z" />
      </svg>

      {/* The hub shows the choice. */}
      <div className="absolute inset-[36%] flex items-center justify-center overflow-hidden rounded-full border bg-background text-center shadow-inner">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={value}
            initial={{ opacity: 0, scale: 0.7, filter: "blur(4px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.7, filter: "blur(4px)" }}
            transition={{ duration: 0.25 }}
            className="px-1 font-serif text-sm leading-tight font-semibold"
          >
            {value}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  )
}
