"use client"

/**
 * Relic UI · Elastic Divider
 * https://relic-ui.vercel.app/docs/elastic-divider
 *
 * Copyright (c) 2026 Shubham Tambe
 * Open source under the MIT License: https://relic-ui.vercel.app/license
 */

import { useRef } from "react"
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react"

import { cn } from "@/lib/utils"

// The line is drawn in a fixed coordinate space and stretched to fit.
const VIEW_WIDTH = 1000
const VIEW_HEIGHT = 100
const MIDDLE = VIEW_HEIGHT / 2

export interface ElasticDividerProps
  extends Omit<React.ComponentProps<"div">, "ref"> {
  /** Maximum distance in pixels the line can be pulled. */
  bend?: number
  /** Line thickness in pixels. */
  strokeWidth?: number
  /** How tight the string is. Higher snaps back faster. */
  stiffness?: number
  /** How much the line wobbles on release. Lower is wobblier. */
  damping?: number
}

export function ElasticDivider({
  className,
  bend = 24,
  strokeWidth = 1,
  stiffness = 350,
  damping = 7,
  onPointerMove,
  onPointerLeave,
  ...props
}: ElasticDividerProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduceMotion = useReducedMotion()

  const pullX = useMotionValue(VIEW_WIDTH / 2)
  const pullY = useMotionValue(0)

  // A quadratic curve passes halfway to its control point,
  // so the control point sits at twice the pull for the line to meet the cursor.
  const path = useTransform(
    [pullX, pullY],
    ([x, y]: number[]) =>
      `M 0 ${MIDDLE} Q ${x} ${MIDDLE + y * 2} ${VIEW_WIDTH} ${MIDDLE}`
  )

  const string = { type: "spring", stiffness, damping, mass: 0.6 } as const

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    onPointerMove?.(e)
    const el = ref.current
    if (reduceMotion || !el) return

    const rect = el.getBoundingClientRect()
    const offset = e.clientY - (rect.top + rect.height / 2)
    const clamped = Math.max(-bend, Math.min(bend, offset))

    animate(pullX, ((e.clientX - rect.left) / rect.width) * VIEW_WIDTH, {
      type: "spring",
      stiffness: 500,
      damping: 40,
    })
    animate(pullY, (clamped / rect.height) * VIEW_HEIGHT, string)
  }

  function handlePointerLeave(e: React.PointerEvent<HTMLDivElement>) {
    onPointerLeave?.(e)
    // Let go: the spring snaps the line back with a wobble.
    animate(pullY, 0, string)
  }

  return (
    <div
      ref={ref}
      role="separator"
      aria-orientation="horizontal"
      data-slot="elastic-divider"
      className={cn("relative h-12 w-full touch-pan-y text-border", className)}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      {...props}
    >
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-0 size-full overflow-visible"
        viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
        preserveAspectRatio="none"
      >
        <motion.path
          d={path}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  )
}
