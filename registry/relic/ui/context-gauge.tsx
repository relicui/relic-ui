"use client"

/**
 * Relic UI · Context Gauge
 * https://relic-ui.vercel.app/docs/context-gauge
 *
 * Copyright (c) 2026 Shubham Tambe
 * Open source under the MIT License: https://relic-ui.vercel.app/license
 */

import { MotionConfig, motion, type Variants } from "motion/react"

import { cn } from "@/lib/utils"

/** 12400 → "12.4k", 200000 → "200k". */
function compact(n: number) {
  if (n < 1000) return String(Math.round(n))
  const k = n / 1000
  return `${k.toFixed(k < 10 ? 1 : 0).replace(/\.0$/, "")}k`
}

const dash: Variants = {
  off: { scaleY: 1, opacity: 1 },
  on: { scaleY: [1, 2, 1], opacity: 1, transition: { duration: 0.3 } },
  warn: { scaleY: 1, opacity: [1, 0.45, 1], transition: { duration: 1.4, repeat: Infinity } },
}

export interface ContextGaugeProps
  extends Omit<React.ComponentProps<"div">, "children"> {
  /** How much of the context window is used (e.g. tokens). */
  used: number
  /** The size of the context window. */
  max: number
  label?: string
  /** What is being counted, shown after the numbers. */
  unit?: string
  /** Share of the window (0–1) after which the gauge turns into a warning. */
  warnAt?: number
  /** Number of dashes in the line. */
  segments?: number
}

/**
 * How full an AI's memory (context window) is, drawn as a ticket's tear line
 * with a stub that shows the percentage. Near the limit it turns red and pulses.
 */
export function ContextGauge({
  used,
  max,
  label = "Context",
  unit = "tokens",
  warnAt = 0.8,
  segments = 32,
  className,
  ...props
}: ContextGaugeProps) {
  const ratio = Math.min(Math.max(used / max, 0), 1)
  const filled = Math.round(ratio * segments)
  const warning = ratio >= warnAt
  const percent = Math.round(ratio * 100)

  return (
    <MotionConfig reducedMotion="user">
      <div
        role="meter"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={used}
        aria-valuetext={`${compact(used)} of ${compact(max)} ${unit} used, ${percent}%`}
        data-slot="context-gauge"
        data-state={warning ? "warning" : "ok"}
        className={cn("flex w-full items-stretch rounded-xl border bg-card text-sm", className)}
        {...props}
      >
        <div className="min-w-0 flex-1 p-3.5">
          <div className="flex items-baseline justify-between gap-3">
            <span className="font-medium">{label}</span>
            <span className="font-mono text-xs text-muted-foreground tabular-nums">
              {compact(used)} / {compact(max)} {unit}
            </span>
          </div>
          <div className="mt-2.5 flex items-center gap-[3px]">
            {Array.from({ length: segments }, (_, i) => {
              const on = i < filled
              return (
                <motion.span
                  key={i}
                  variants={dash}
                  initial={false}
                  animate={on ? (warning && i >= filled - 3 ? "warn" : "on") : "off"}
                  className={cn(
                    "h-1.5 min-w-0 flex-1 rounded-full transition-colors duration-500",
                    on ? (warning ? "bg-destructive" : "bg-primary") : "bg-muted"
                  )}
                />
              )
            })}
          </div>
        </div>
        {/* The stub, behind a perforation. */}
        <div className="relative flex w-16 shrink-0 flex-col items-center justify-center border-l-2 border-dashed">
          <span
            className={cn(
              "font-mono text-base font-semibold tabular-nums transition-colors",
              warning && "text-destructive"
            )}
          >
            {percent}%
          </span>
          <span className="text-[10px] tracking-wide text-muted-foreground uppercase">used</span>
        </div>
      </div>
    </MotionConfig>
  )
}
