"use client"

/**
 * Relic UI · Caret Loader
 * https://relic-ui.vercel.app/docs/caret-loader
 *
 * Copyright (c) 2026 Shubham Tambe
 * Open source under the MIT License: https://relic-ui.vercel.app/license
 */

import { useEffect, useMemo, useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"

const SIZES = {
  sm: "text-xs",
  default: "text-sm",
  lg: "text-lg",
} as const

/** 0 → dots, a short pause, then back down to 0, and again. */
function buildSequence(dots: number) {
  const up = Array.from({ length: dots + 1 }, (_, i) => i)
  const down = [...up].reverse()
  return [...up, dots, dots, ...down.slice(1), 0]
}

export interface CaretLoaderProps
  extends Omit<React.ComponentProps<"span">, "children"> {
  /** Optional text before the dots, e.g. "Loading". */
  text?: React.ReactNode
  /** How many dots get typed. */
  dots?: number
  /** Speed multiplier. 2 is twice as fast. */
  speed?: number
  size?: keyof typeof SIZES
  /** What screen readers announce. */
  label?: string
  /** Extra classes for the caret, e.g. a color. */
  caretClassName?: string
}

/**
 * A caret that types a row of dots, deletes them and types them again,
 * like someone thinking out loud.
 */
export function CaretLoader({
  text,
  dots = 3,
  speed = 1,
  size = "default",
  label = "Loading",
  caretClassName,
  className,
  ...props
}: CaretLoaderProps) {
  const reduceMotion = useReducedMotion()
  const sequence = useMemo(() => buildSequence(dots), [dots])
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (reduceMotion) return
    const id = setInterval(
      () => setStep((s) => (s + 1) % sequence.length),
      190 / Math.max(speed, 0.1)
    )
    return () => clearInterval(id)
  }, [reduceMotion, sequence.length, speed])

  const count = reduceMotion ? dots : (sequence[step] ?? 0)

  return (
    <span
      role="status"
      aria-label={label}
      data-slot="caret-loader"
      className={cn(
        "inline-flex items-center text-muted-foreground",
        SIZES[size],
        className
      )}
      {...props}
    >
      {text && <span aria-hidden>{text}</span>}
      {/* Fixed width, so the text around the loader never shifts. */}
      <span
        aria-hidden
        className="relative inline-flex items-center"
        style={{ width: `${dots * 0.62 + 0.4}em` }}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {Array.from({ length: count }, (_, i) => (
            <motion.span
              key={i}
              className="inline-block w-[0.62em] text-center"
              initial={{ opacity: 0, y: "-0.3em", scale: 0.5 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.4, filter: "blur(2px)" }}
              transition={{ duration: 0.16 }}
            >
              •
            </motion.span>
          ))}
        </AnimatePresence>
        <motion.span
          layout
          className={cn(
            "ml-[0.1em] inline-block h-[1.15em] w-[0.12em] min-w-0.5 rounded-full bg-primary",
            caretClassName
          )}
          transition={{ layout: { type: "spring", stiffness: 700, damping: 40 } }}
        />
      </span>
    </span>
  )
}
