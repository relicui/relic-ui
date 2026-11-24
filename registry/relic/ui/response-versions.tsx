"use client"

/**
 * Relic UI · Response Versions
 * https://relic-ui.vercel.app/docs/response-versions
 *
 * Copyright (c) 2026 Shubham Tambe
 * Open source under the MIT License: https://relic-ui.vercel.app/license
 */

import { useState } from "react"
import { AnimatePresence, MotionConfig, motion, type Variants } from "motion/react"

import { cn } from "@/lib/utils"

const TRANSITIONS: Record<"blur" | "slide" | "fade", Variants> = {
  blur: {
    enter: { opacity: 0, filter: "blur(6px)" },
    center: { opacity: 1, filter: "blur(0px)" },
    exit: { opacity: 0, filter: "blur(6px)" },
  },
  slide: {
    enter: (dir: number) => ({ opacity: 0, x: dir * 28 }),
    center: { opacity: 1, x: 0 },
    exit: (dir: number) => ({ opacity: 0, x: dir * -28 }),
  },
  fade: {
    enter: { opacity: 0 },
    center: { opacity: 1 },
    exit: { opacity: 0 },
  },
}

export interface ResponseVersionsProps {
  /** Every version of the answer, oldest first. */
  versions: React.ReactNode[]
  /** The version shown (controlled), counting from 0. */
  index?: number
  /** The version shown at first. Defaults to the newest. */
  defaultIndex?: number
  onIndexChange?: (index: number) => void
  /** Called by the Regenerate button. Add the new answer to `versions`. */
  onRegenerate?: () => void
  /** A new version is being written: shows a shimmer instead of the text. */
  regenerating?: boolean
  /** How switching between versions looks. */
  transition?: keyof typeof TRANSITIONS
  /** Show "2 / 3". */
  showCounter?: boolean
  /** Jump to a new version as soon as it's added. */
  followNewest?: boolean
  /** Accessible name. */
  label?: string
  className?: string
}

/**
 * Several versions of an AI answer in one card. Step through them with
 * ‹ › and the card glides to each one's height, or ask for another; while it
 * writes, the text gives way to a soft shimmer.
 */
export function ResponseVersions({
  versions,
  index: indexProp,
  defaultIndex,
  onIndexChange,
  onRegenerate,
  regenerating = false,
  transition = "blur",
  showCounter = true,
  followNewest = true,
  label = "Response",
  className,
}: ResponseVersionsProps) {
  const [internal, setInternal] = useState(defaultIndex ?? Math.max(versions.length - 1, 0))
  const [direction, setDirection] = useState(1)
  const [seen, setSeen] = useState(versions.length)

  // A new version arrived: show it (when following the newest).
  if (seen !== versions.length) {
    const grew = versions.length > seen
    setSeen(versions.length)
    if (grew && followNewest && indexProp === undefined) {
      setInternal(versions.length - 1)
      setDirection(1)
    }
  }

  const count = versions.length
  const current = Math.min(Math.max(indexProp ?? internal, 0), Math.max(count - 1, 0))

  function go(delta: number) {
    const next = Math.min(Math.max(current + delta, 0), count - 1)
    if (next === current) return
    setDirection(delta)
    if (indexProp === undefined) setInternal(next)
    onIndexChange?.(next)
  }

  return (
    <MotionConfig reducedMotion="user">
      <motion.section
        layout
        aria-label={label}
        data-slot="response-versions"
        transition={{ layout: { type: "spring", stiffness: 300, damping: 32 } }}
        className={cn("w-full overflow-hidden rounded-xl border bg-card text-sm text-card-foreground", className)}
      >
        <div className="relative px-4 py-3.5 leading-relaxed">
          <AnimatePresence mode="popLayout" initial={false} custom={direction}>
            {regenerating ? (
              <motion.div
                key="writing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col gap-2.5 py-1"
                aria-label="Writing a new version"
                role="status"
              >
                {["100%", "92%", "64%"].map((w, i) => (
                  <motion.span
                    key={i}
                    className="h-3 rounded-full bg-muted"
                    style={{ width: w }}
                    animate={{ opacity: [0.45, 1, 0.45] }}
                    transition={{ duration: 1.3, repeat: Infinity, delay: i * 0.15 }}
                  />
                ))}
              </motion.div>
            ) : (
              <motion.div
                key={current}
                custom={direction}
                variants={TRANSITIONS[transition]}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              >
                {versions[current]}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <motion.div layout="position" className="flex items-center gap-1 border-t px-2 py-1.5 text-xs text-muted-foreground">
          <button
            type="button"
            aria-label="Previous version"
            disabled={current === 0 || regenerating}
            onClick={() => go(-1)}
            className="inline-flex size-7 items-center justify-center rounded-md transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 disabled:opacity-35 disabled:hover:bg-transparent"
          >
            <svg aria-hidden viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" className="size-3.5">
              <path d="M10 4l-4 4 4 4" />
            </svg>
          </button>
          {showCounter && (
            <span aria-live="polite" className="min-w-10 text-center font-mono tabular-nums">
              {current + 1} / {count}
            </span>
          )}
          <button
            type="button"
            aria-label="Next version"
            disabled={current >= count - 1 || regenerating}
            onClick={() => go(1)}
            className="inline-flex size-7 items-center justify-center rounded-md transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 disabled:opacity-35 disabled:hover:bg-transparent"
          >
            <svg aria-hidden viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" className="size-3.5">
              <path d="M6 4l4 4-4 4" />
            </svg>
          </button>
          {onRegenerate && (
            <button
              type="button"
              onClick={onRegenerate}
              disabled={regenerating}
              className="ml-auto inline-flex h-7 items-center gap-1.5 rounded-md px-2 transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 disabled:opacity-60"
            >
              <motion.svg
                aria-hidden
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.6}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-3.5"
                animate={regenerating ? { rotate: 360 } : { rotate: 0 }}
                transition={regenerating ? { duration: 0.9, repeat: Infinity, ease: "linear" } : { duration: 0.3 }}
              >
                <path d="M13.5 8a5.5 5.5 0 1 1-1.6-3.9M13.5 2.5v3h-3" />
              </motion.svg>
              {regenerating ? "Writing…" : "Regenerate"}
            </button>
          )}
        </motion.div>
      </motion.section>
    </MotionConfig>
  )
}
