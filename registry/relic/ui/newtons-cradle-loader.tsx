"use client"

/**
 * Relic UI · Newton's Cradle Loader
 * https://relic-ui.vercel.app/docs/newtons-cradle-loader
 *
 * Copyright (c) 2026 Shubham Tambe
 * Open source under the MIT License: https://relic-ui.vercel.app/license
 */

import { motion, useReducedMotion, type Easing } from "motion/react"

import { cn } from "@/lib/utils"

const SIZES = { sm: 9, default: 13, lg: 18 } as const

export interface NewtonsCradleLoaderProps
  extends Omit<React.ComponentProps<"span">, "children"> {
  /** Number of balls. */
  balls?: number
  /** Seconds for one full back-and-forth. */
  duration?: number
  /** How far the end balls swing, in degrees. */
  angle?: number
  size?: keyof typeof SIZES
  /** What screen readers announce. */
  label?: string
}

/**
 * A Newton's cradle: the left ball swings out and back, its knock travels
 * through the row, and the right ball swings out in turn, with pendulum
 * timing (slow at the top, fast at the bottom).
 */
export function NewtonsCradleLoader({
  balls = 5,
  duration = 1.4,
  angle = 32,
  size = "default",
  label = "Loading",
  className,
  ...props
}: NewtonsCradleLoaderProps) {
  const reduceMotion = useReducedMotion()
  const ball = SIZES[size]
  const string = ball * 2.6
  const count = Math.max(balls, 2)

  const swing = (side: "left" | "right") => {
    if (reduceMotion) return {}
    const out = side === "left" ? angle : -angle
    return side === "left"
      ? {
          animate: { rotate: [0, out, 0, 0] },
          transition: {
            duration,
            times: [0, 0.25, 0.5, 1],
            ease: ["easeOut", "easeIn", "linear"] as Easing[],
            repeat: Infinity,
          },
        }
      : {
          animate: { rotate: [0, 0, out, 0] },
          transition: {
            duration,
            times: [0, 0.5, 0.75, 1],
            ease: ["linear", "easeOut", "easeIn"] as Easing[],
            repeat: Infinity,
          },
        }
  }

  return (
    <span
      role="status"
      aria-label={label}
      data-slot="newtons-cradle-loader"
      className={cn("inline-flex flex-col items-center", className)}
      {...props}
    >
      <span aria-hidden className="h-0.5 rounded-full bg-muted-foreground/50" style={{ width: count * ball + ball }} />
      <span aria-hidden className="flex">
        {Array.from({ length: count }, (_, i) => {
          const side = i === 0 ? "left" : i === count - 1 ? "right" : null
          return (
            <motion.span
              key={i}
              className="flex flex-col items-center"
              style={{ width: ball, originX: "50%", originY: "0%" }}
              {...(side ? swing(side) : {})}
            >
              <span className="w-px bg-muted-foreground/60" style={{ height: string }} />
              <span
                className="rounded-full shadow-sm"
                style={{
                  width: ball,
                  height: ball,
                  background:
                    "radial-gradient(circle at 35% 30%, var(--color-background) 0%, var(--color-foreground) 55%)",
                }}
              />
            </motion.span>
          )
        })}
      </span>
    </span>
  )
}
