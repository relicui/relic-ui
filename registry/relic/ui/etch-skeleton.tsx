"use client"

/**
 * Relic UI · Etch Skeleton
 * https://relic-ui.vercel.app/docs/etch-skeleton
 *
 * Copyright (c) 2026 Shubham Tambe
 * Open source under the MIT License: https://relic-ui.vercel.app/license
 */

import { motion, useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"

export interface EtchSkeletonProps
  extends Omit<React.ComponentProps<"div">, "children"> {
  /** Number of placeholder lines. */
  lines?: number
  /** Width of each line, e.g. ["100%", "90%", "60%"]. Repeats if shorter. */
  widths?: string[]
  /** Speed multiplier. 2 is twice as fast. */
  speed?: number
  /** Show a round avatar placeholder before the lines. */
  avatar?: boolean
  /** What screen readers announce. */
  label?: string
  /** Thickness of each line (and the avatar size with it). */
  size?: keyof typeof SIZES
  /** Show the caret that writes each line. */
  showCaret?: boolean
  /** Round or rounded-square avatar. */
  avatarShape?: "circle" | "square"
}

const DEFAULT_WIDTHS = ["100%", "92%", "100%", "84%"]

const SIZES = {
  sm: { line: "h-2", gap: "gap-2", avatar: "size-8" },
  default: { line: "h-3", gap: "gap-2.5", avatar: "size-10" },
  lg: { line: "h-4", gap: "gap-3", avatar: "size-12" },
} as const

/**
 * A loading placeholder where a caret writes each line from left to right,
 * instead of the usual shimmer, then fades and writes again.
 */
export function EtchSkeleton({
  lines = 3,
  widths,
  speed = 1,
  avatar = false,
  label = "Loading",
  size = "default",
  showCaret = true,
  avatarShape = "circle",
  className,
  ...props
}: EtchSkeletonProps) {
  const reduceMotion = useReducedMotion()
  const sizing = SIZES[size]
  const perLine = 0.85 / Math.max(speed, 0.1)
  const hold = 0.9 / Math.max(speed, 0.1)
  const total = lines * perLine + hold

  const widthOf = (i: number) => {
    if (i === lines - 1 && !widths) return "62%"
    const list = widths ?? DEFAULT_WIDTHS
    return list[i % list.length]
  }

  return (
    <div
      role="status"
      aria-label={label}
      data-slot="etch-skeleton"
      className={cn("flex w-full gap-4", className)}
      {...props}
    >
      {avatar && (
        <div
          aria-hidden
          className={cn(
            "shrink-0 bg-muted",
            sizing.avatar,
            avatarShape === "circle" ? "rounded-full" : "rounded-lg"
          )}
        />
      )}
      <div aria-hidden className={cn("flex min-w-0 flex-1 flex-col pt-0.5", sizing.gap)}>
        {Array.from({ length: lines }, (_, i) => {
          // This line is written between `start` and `end` of each cycle.
          const start = Math.max((i * perLine) / total, 0.001)
          const end = ((i + 1) * perLine) / total
          const fadeAt = 0.94
          return (
            <div
              key={i}
              className={cn("relative overflow-hidden rounded-full bg-muted", sizing.line)}
              style={{ width: widthOf(i) }}
            >
              {!reduceMotion && (
                <motion.div
                  className="absolute inset-y-0 left-0 bg-foreground/10"
                  initial={{ width: "0%" }}
                  animate={{
                    width: ["0%", "0%", "100%", "100%", "100%"],
                    opacity: [1, 1, 1, 1, 0],
                  }}
                  transition={{
                    duration: total,
                    times: [0, start, end, fadeAt, 1],
                    ease: "linear",
                    repeat: Infinity,
                  }}
                >
                  {showCaret && <motion.span
                    className="absolute inset-y-0 right-0 w-0.5 rounded-full bg-primary/70"
                    animate={{ opacity: [0, 0, 1, 1, 0, 0] }}
                    transition={{
                      duration: total,
                      times: [0, start, start + 0.001, end, end + 0.001, 1],
                      ease: "linear",
                      repeat: Infinity,
                    }}
                  />}
                </motion.div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
