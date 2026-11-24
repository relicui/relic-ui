"use client"

/**
 * Relic UI · Hourglass Loader
 * https://relic-ui.vercel.app/docs/hourglass-loader
 *
 * Copyright (c) 2026 Shubham Tambe
 * Open source under the MIT License: https://relic-ui.vercel.app/license
 */

import { useId } from "react"
import { motion, useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"

const SIZES = { sm: 32, default: 48, lg: 72 } as const

// Glass bulbs in a 40×56 box; the neck is at y = 28.
const TOP_BULB = "M8 6 H32 C32 16 22.5 22 21 28 H19 C17.5 22 8 16 8 6 Z"
const BOTTOM_BULB = "M19 28 H21 C22.5 34 32 40 32 50 H8 C8 40 17.5 34 19 28 Z"

export interface HourglassLoaderProps
  extends Omit<React.ComponentProps<"span">, "children"> {
  /** Seconds for the sand to run through, before the glass flips. */
  duration?: number
  size?: keyof typeof SIZES
  /** Color of the sand. */
  sandColor?: string
  /** What screen readers announce. */
  label?: string
}

/**
 * Sand drains from the top bulb, piles up in the bottom one, and when it's
 * done the glass turns over and starts again.
 */
export function HourglassLoader({
  duration = 3,
  size = "default",
  sandColor = "#c9a15a",
  label = "Loading",
  className,
  ...props
}: HourglassLoaderProps) {
  const id = useId()
  const reduceMotion = useReducedMotion()
  const flip = 0.7
  const total = duration + flip
  const drained = duration / total
  const run = reduceMotion
    ? undefined
    : { duration: total, times: [0, drained, 1], repeat: Infinity, ease: "linear" as const }

  return (
    <span
      role="status"
      aria-label={label}
      data-slot="hourglass-loader"
      className={cn("inline-flex text-muted-foreground", className)}
      style={{ height: SIZES[size], width: (SIZES[size] * 40) / 56 }}
      {...props}
    >
      <motion.svg
        aria-hidden
        viewBox="0 0 40 56"
        className="size-full overflow-visible"
        animate={reduceMotion ? undefined : { rotate: [0, 0, 180] }}
        transition={
          reduceMotion
            ? undefined
            : { duration: total, times: [0, drained, 1], repeat: Infinity, ease: [0.65, 0, 0.35, 1] }
        }
      >
        <defs>
          <clipPath id={`${id}-top`}>
            <path d={TOP_BULB} />
          </clipPath>
          <clipPath id={`${id}-bottom`}>
            <path d={BOTTOM_BULB} />
          </clipPath>
        </defs>

        {/* Sand in the top bulb: its surface sinks toward the neck. */}
        <g clipPath={`url(#${id}-top)`}>
          <motion.rect
            x="0"
            width="40"
            height="30"
            fill={sandColor}
            initial={{ y: reduceMotion ? 17 : 10 }}
            animate={reduceMotion ? undefined : { y: [10, 28, 28] }}
            transition={run}
          />
        </g>

        {/* The thin falling stream. */}
        {!reduceMotion && (
          <motion.line
            x1="20" y1="28" x2="20" y2="49"
            stroke={sandColor}
            strokeWidth="1"
            strokeDasharray="1.5 2.5"
            animate={{ strokeDashoffset: [0, -16], opacity: [1, 1, 0, 0] }}
            transition={{
              strokeDashoffset: { duration: 0.5, repeat: Infinity, ease: "linear" },
              opacity: { duration: total, times: [0, drained - 0.02, drained, 1], repeat: Infinity },
            }}
          />
        )}

        {/* Sand piling up in the bottom bulb. */}
        <g clipPath={`url(#${id}-bottom)`}>
          <motion.rect
            x="0"
            width="40"
            height="30"
            fill={sandColor}
            initial={{ y: reduceMotion ? 42 : 50 }}
            animate={reduceMotion ? undefined : { y: [50, 36, 36] }}
            transition={run}
          />
        </g>

        {/* The glass and its wooden caps. */}
        <path d={TOP_BULB} fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
        <path d={BOTTOM_BULB} fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
        <rect x="4" y="2" width="32" height="4" rx="1.5" fill="currentColor" />
        <rect x="4" y="50" width="32" height="4" rx="1.5" fill="currentColor" />
      </motion.svg>
    </span>
  )
}
