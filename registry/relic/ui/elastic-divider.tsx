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

// The line is drawn in a fixed coordinate space and stretched to fit:
// LONG units along the line, SHORT units across it.
const LONG = 1000
const SHORT = 100
const MIDDLE = SHORT / 2

export interface ElasticDividerProps
  extends Omit<React.ComponentProps<"div">, "ref"> {
  /** Lie flat between stacked content, or stand up between side-by-side content. */
  orientation?: "horizontal" | "vertical"
  /** Maximum distance in pixels the line can be pulled. */
  bend?: number
  /** Line thickness in pixels. */
  strokeWidth?: number
  /** How tight the string is. Higher snaps back faster. */
  stiffness?: number
  /** How much the line wobbles on release. Lower is wobblier. */
  damping?: number
  /** Size of the area (in pixels) that reacts to the cursor, across the line. */
  hitArea?: number
}

export function ElasticDivider({
  orientation = "horizontal",
  bend = 24,
  strokeWidth = 1,
  stiffness = 350,
  damping = 7,
  hitArea = 48,
  className,
  style,
  onPointerMove,
  onPointerLeave,
  ...props
}: ElasticDividerProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduceMotion = useReducedMotion()
  const vertical = orientation === "vertical"

  const pullAlong = useMotionValue(LONG / 2)
  const pullAcross = useMotionValue(0)

  // A quadratic curve passes halfway to its control point,
  // so the control point sits at twice the pull for the line to meet the cursor.
  const path = useTransform([pullAlong, pullAcross], ([along, across]: number[]) =>
    vertical
      ? `M ${MIDDLE} 0 Q ${MIDDLE + across * 2} ${along} ${MIDDLE} ${LONG}`
      : `M 0 ${MIDDLE} Q ${along} ${MIDDLE + across * 2} ${LONG} ${MIDDLE}`
  )

  const string = { type: "spring", stiffness, damping, mass: 0.6 } as const

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    onPointerMove?.(e)
    const el = ref.current
    if (reduceMotion || !el) return

    const rect = el.getBoundingClientRect()
    // Measure along the line and across it, whichever way it stands.
    const length = vertical ? rect.height : rect.width
    const thickness = vertical ? rect.width : rect.height
    const along = vertical ? e.clientY - rect.top : e.clientX - rect.left
    const across = vertical
      ? e.clientX - (rect.left + rect.width / 2)
      : e.clientY - (rect.top + rect.height / 2)
    const clamped = Math.max(-bend, Math.min(bend, across))

    animate(pullAlong, (along / length) * LONG, {
      type: "spring",
      stiffness: 500,
      damping: 40,
    })
    animate(pullAcross, (clamped / thickness) * SHORT, string)
  }

  function handlePointerLeave(e: React.PointerEvent<HTMLDivElement>) {
    onPointerLeave?.(e)
    // Let go: the spring snaps the line back with a wobble.
    animate(pullAcross, 0, string)
  }

  return (
    <div
      ref={ref}
      role="separator"
      aria-orientation={orientation}
      data-slot="elastic-divider"
      className={cn(
        "relative shrink-0 text-border",
        vertical ? "h-full self-stretch touch-pan-x" : "w-full touch-pan-y",
        className
      )}
      style={{ ...(vertical ? { width: hitArea } : { height: hitArea }), ...style }}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      {...props}
    >
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-0 size-full overflow-visible"
        viewBox={vertical ? `0 0 ${SHORT} ${LONG}` : `0 0 ${LONG} ${SHORT}`}
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
