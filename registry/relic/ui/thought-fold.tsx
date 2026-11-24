"use client"

/**
 * Relic UI · Thought Fold
 * https://relic-ui.vercel.app/docs/thought-fold
 *
 * Copyright (c) 2026 Shubham Tambe
 * Open source under the MIT License: https://relic-ui.vercel.app/license
 */

import { useEffect, useId, useState } from "react"
import { AnimatePresence, MotionConfig, motion } from "motion/react"

import { cn } from "@/lib/utils"

export interface ThoughtFoldProps
  extends Omit<React.ComponentProps<"div">, "children"> {
  /** The reasoning steps to show when unfolded. */
  steps: React.ReactNode[]
  /** Still thinking: the scribble moves and the timer counts. */
  thinking?: boolean
  /** Seconds to show when done. Defaults to the time counted while thinking. */
  seconds?: number
  /** Unfolded (controlled). */
  open?: boolean
  /** Unfolded at first (uncontrolled). */
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** Text while thinking. */
  thinkingLabel?: string
}

/**
 * A "thinking" indicator: a caret scribbles while a timer counts. Click it and
 * the reasoning steps unfold like paper; click again and they fold away.
 */
export function ThoughtFold({
  steps,
  thinking = false,
  seconds,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  thinkingLabel = "Thinking",
  className,
  ...props
}: ThoughtFoldProps) {
  const id = useId()
  const [internalOpen, setInternalOpen] = useState(defaultOpen)
  const open = openProp ?? internalOpen
  const [elapsed, setElapsed] = useState(0)

  // Count seconds while thinking.
  useEffect(() => {
    if (!thinking) return
    const started = Date.now() - elapsed * 1000
    const timer = setInterval(() => setElapsed(Math.floor((Date.now() - started) / 1000)), 250)
    return () => clearInterval(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [thinking])

  const shown = seconds ?? elapsed
  const label = thinking ? `${thinkingLabel}… ${shown}s` : `Thought for ${shown}s`

  function toggle() {
    const next = !open
    if (openProp === undefined) setInternalOpen(next)
    onOpenChange?.(next)
  }

  return (
    <MotionConfig reducedMotion="user">
      <div data-slot="thought-fold" className={cn("w-full text-sm", className)} {...props}>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={`${id}-steps`}
          onClick={toggle}
          className="group inline-flex items-center gap-2 rounded-md py-1 pr-1.5 text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {/* The scribble: a caret doodling while it thinks. */}
          <svg aria-hidden viewBox="0 0 22 16" fill="none" className="h-4 w-5.5 text-primary">
            <motion.path
              d="M2 10 C 5 3, 8 15, 11 9 S 16 3, 19 9"
              stroke="currentColor"
              strokeWidth={1.6}
              strokeLinecap="round"
              initial={false}
              animate={
                thinking
                  ? { pathLength: [0, 1, 1], opacity: [1, 1, 0] }
                  : { pathLength: 1, opacity: 0.5 }
              }
              transition={
                thinking
                  ? { duration: 1.4, times: [0, 0.7, 1], repeat: Infinity, ease: "easeInOut" }
                  : { duration: 0.3 }
              }
            />
          </svg>
          <span className={cn("tabular-nums", thinking && "text-foreground/80")}>{label}</span>
          <svg
            aria-hidden
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            className={cn("size-3.5 transition-transform duration-300", open && "rotate-180")}
          >
            <path d="M4 6l4 4 4-4" />
          </svg>
        </button>

        <AnimatePresence initial={false}>
          {open && (
            <motion.ol
              id={`${id}-steps`}
              key="steps"
              initial={{ height: 0 }}
              animate={{ height: "auto" }}
              exit={{ height: 0, transition: { duration: 0.3, ease: [0.4, 0, 1, 1] } }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              style={{ perspective: 700 }}
              className="mt-1 ml-2.5 overflow-hidden border-l pl-4"
            >
              {steps.map((step, i) => (
                <motion.li
                  key={i}
                  style={{ transformOrigin: "top center" }}
                  initial={{ rotateX: -80, opacity: 0 }}
                  animate={{ rotateX: 0, opacity: 1 }}
                  exit={{ rotateX: -80, opacity: 0, transition: { duration: 0.2 } }}
                  transition={{ delay: i * 0.08, type: "spring", stiffness: 180, damping: 18 }}
                  className="py-1.5 text-muted-foreground"
                >
                  {step}
                  {thinking && i === steps.length - 1 && (
                    <span
                      aria-hidden
                      className="ml-1 inline-block h-3.5 w-0.5 translate-y-0.5 animate-pulse rounded-full bg-primary"
                    />
                  )}
                </motion.li>
              ))}
            </motion.ol>
          )}
        </AnimatePresence>
      </div>
    </MotionConfig>
  )
}
