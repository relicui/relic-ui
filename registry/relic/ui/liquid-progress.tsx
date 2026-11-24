"use client"

/**
 * Relic UI · Liquid Progress
 * https://relic-ui.vercel.app/docs/liquid-progress
 *
 * Copyright (c) 2026 Shubham Tambe
 * Open source under the MIT License: https://relic-ui.vercel.app/license
 */

import { useEffect, useId, useRef } from "react"
import { useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"

export interface LiquidProgressProps
  extends Omit<React.ComponentProps<"div">, "children"> {
  /** Current progress. */
  value: number
  max?: number
  /** A round flask or a rounded tank. */
  shape?: "circle" | "tank"
  /** Width and height in pixels. */
  size?: number
  /** Show the percentage in the middle. */
  showValue?: boolean
  /** Accessible name. */
  label?: string
}

/**
 * Progress shown as liquid in a vessel. The surface keeps a gentle wave, the
 * level eases to each new value, and moving the pointer over it makes the
 * liquid slosh. The percentage flips color where the liquid covers it.
 */
export function LiquidProgress({
  value,
  max = 100,
  shape = "circle",
  size = 128,
  showValue = true,
  label = "Progress",
  className,
  onPointerMove,
  ...props
}: LiquidProgressProps) {
  const id = useId()
  const reduceMotion = useReducedMotion()
  const ratio = Math.min(Math.max(value / max, 0), 1)
  const percent = Math.round(ratio * 100)

  const front = useRef<SVGPathElement>(null)
  const back = useRef<SVGPathElement>(null)
  const clip = useRef<SVGPathElement>(null)
  const target = useRef(ratio)
  const slosh = useRef(0)

  useEffect(() => {
    target.current = ratio
  }, [ratio])

  useEffect(() => {
    let level = target.current
    let frame = 0
    let last = performance.now()
    let time = 0

    const surface = (y: number, amp: number, phase: number) => {
      let d = `M0 ${y}`
      for (let x = 0; x <= 100; x += 4) {
        d += ` L${x} ${(y + Math.sin(x * 0.075 + phase) * amp).toFixed(2)}`
      }
      return `${d} L100 110 L0 110 Z`
    }

    function draw(now: number) {
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      time += dt
      level += (target.current - level) * (reduceMotion ? 1 : Math.min(dt * 2.5, 1))
      slosh.current *= reduceMotion ? 0 : Math.pow(0.4, dt)
      const y = 100 - level * 100
      const amp = reduceMotion ? 0 : 2.2 + slosh.current
      const frontPath = surface(y, amp, time * 2.4)
      front.current?.setAttribute("d", frontPath)
      clip.current?.setAttribute("d", frontPath)
      back.current?.setAttribute("d", surface(y, amp * 0.8, time * 1.7 + 2))
      if (!reduceMotion) frame = requestAnimationFrame(draw)
    }

    frame = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(frame)
  }, [reduceMotion])

  const vessel =
    shape === "circle" ? (
      <circle cx="50" cy="50" r="48" />
    ) : (
      <rect x="2" y="2" width="96" height="96" rx="18" />
    )

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      data-slot="liquid-progress"
      onPointerMove={(e) => {
        onPointerMove?.(e)
        slosh.current = Math.min(slosh.current + Math.abs(e.movementX) * 0.18 + Math.abs(e.movementY) * 0.08, 9)
      }}
      className={cn("relative inline-flex shrink-0", className)}
      style={{ width: size, height: size }}
      {...props}
    >
      <svg viewBox="0 0 100 100" className="size-full">
        <defs>
          <clipPath id={`${id}-vessel`}>{vessel}</clipPath>
          <clipPath id={`${id}-liquid`}>
            <path ref={clip} />
          </clipPath>
        </defs>
        <g clipPath={`url(#${id}-vessel)`}>
          <rect width="100" height="100" className="fill-muted/60" />
          <path ref={back} className="fill-primary/35" />
          <path ref={front} className="fill-primary" />
        </g>
        <g className="fill-none stroke-border" strokeWidth="1.5">
          {vessel}
        </g>
        {showValue && (
          <>
            <text x="50" y="50" textAnchor="middle" dominantBaseline="central" className="fill-foreground font-mono text-[15px] font-semibold">
              {percent}%
            </text>
            {/* The same text in the liquid's contrast color, shown only under the liquid. */}
            <text
              x="50" y="50"
              textAnchor="middle"
              dominantBaseline="central"
              clipPath={`url(#${id}-liquid)`}
              className="fill-primary-foreground font-mono text-[15px] font-semibold"
            >
              {percent}%
            </text>
          </>
        )}
      </svg>
    </div>
  )
}
