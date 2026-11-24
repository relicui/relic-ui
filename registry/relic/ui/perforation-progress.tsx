"use client"

/**
 * Relic UI · Perforation Progress
 * https://relic-ui.vercel.app/docs/perforation-progress
 *
 * Copyright (c) 2026 Shubham Tambe
 * Open source under the MIT License: https://relic-ui.vercel.app/license
 */

import { MotionConfig, motion, type Variants } from "motion/react"

import { cn } from "@/lib/utils"

export interface PerforationProgressProps
  extends Omit<React.ComponentProps<"div">, "children"> {
  /** Current progress. Leave it out for an indeterminate (unknown) state. */
  value?: number
  max?: number
  /** Number of dashes in the line. */
  segments?: number
  /** Text shown above the line. Also used as the accessible name. */
  label?: string
  /** Show the percentage next to the label. */
  showValue?: boolean
  /** Thickness of the dashes. */
  size?: keyof typeof THICKNESS
  /** Rounded or square dashes. */
  shape?: "pill" | "square"
  /** Space between dashes, in pixels. */
  gap?: number
  /** Play the wave across the line when it reaches 100%. */
  celebrate?: boolean
}

const THICKNESS = {
  sm: "h-1",
  default: "h-1.5",
  lg: "h-2.5",
} as const

// Each dash animates by name, so it only moves when its state changes.
const dash: Variants = {
  off: { scaleY: 1, y: 0, opacity: 1 },
  on: { scaleY: [1, 2.2, 1], y: 0, opacity: 1, transition: { duration: 0.3 } },
  // Completed: a wave travels along the line, like it's being torn.
  done: (i: number) => ({
    y: [0, -5, 0],
    scaleY: 1,
    opacity: 1,
    transition: { duration: 0.4, delay: i * 0.02, ease: "easeOut" },
  }),
  // Unknown progress: a pulse runs along the dashes.
  loading: (i: number) => ({
    opacity: [0.25, 1, 0.25],
    scaleY: 1,
    y: 0,
    transition: { duration: 1.2, delay: i * 0.05, repeat: Infinity },
  }),
}

/**
 * A progress bar drawn as a ticket's tear line. Dashes fill one by one,
 * and at 100% a little wave runs across the whole perforation.
 */
export function PerforationProgress({
  value,
  max = 100,
  segments = 24,
  label,
  showValue = false,
  size = "default",
  shape = "pill",
  gap = 3,
  celebrate = true,
  className,
  ...props
}: PerforationProgressProps) {
  const indeterminate = value === undefined || value === null
  const ratio = indeterminate ? 0 : Math.min(Math.max(value / max, 0), 1)
  const filled = Math.round(ratio * segments)
  const complete = !indeterminate && ratio >= 1

  return (
    <MotionConfig reducedMotion="user">
      <div
        role="progressbar"
        aria-label={label ?? "Progress"}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={indeterminate ? undefined : value}
        data-slot="perforation-progress"
        data-state={indeterminate ? "indeterminate" : complete ? "complete" : "loading"}
        className={cn("w-full", className)}
        {...props}
      >
        {(label || (showValue && !indeterminate)) && (
          <div className="mb-2 flex items-center justify-between gap-4 text-sm">
            <span className="font-medium">{label}</span>
            {showValue && !indeterminate && (
              <span className="text-muted-foreground tabular-nums">
                {Math.round(ratio * 100)}%
              </span>
            )}
          </div>
        )}
        <div className="flex items-center" style={{ gap }}>
          {Array.from({ length: segments }, (_, i) => {
            const on = indeterminate || i < filled
            const state = indeterminate
              ? "loading"
              : complete && celebrate
                ? "done"
                : on
                  ? "on"
                  : "off"
            return (
              <motion.span
                key={i}
                custom={i}
                variants={dash}
                initial={false}
                animate={state}
                className={cn(
                  "min-w-0 flex-1 transition-colors duration-300",
                  THICKNESS[size],
                  shape === "pill" ? "rounded-full" : "rounded-[1px]",
                  on ? "bg-primary" : "bg-muted"
                )}
              />
            )
          })}
        </div>
      </div>
    </MotionConfig>
  )
}
