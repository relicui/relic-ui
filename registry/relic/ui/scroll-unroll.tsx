"use client"

/**
 * Relic UI · Scroll Unroll
 * https://relic-ui.vercel.app/docs/scroll-unroll
 *
 * Copyright (c) 2026 Shubham Tambe
 * Open source under the MIT License: https://relic-ui.vercel.app/license
 */

import { useId, useState } from "react"
import { AnimatePresence, MotionConfig, motion } from "motion/react"

import { cn } from "@/lib/utils"

export interface ScrollUnrollProps
  extends Omit<React.ComponentProps<"div">, "title"> {
  /** Text on the tag hanging from the top rod. */
  title?: React.ReactNode
  /** Unrolled (controlled). */
  open?: boolean
  /** Unrolled at first (uncontrolled). */
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

function Rod({ moving }: { moving?: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "relative block h-3.5 w-full rounded-full bg-gradient-to-b from-[#a06a37] via-[#7a4a22] to-[#4a2b12] shadow-md",
        moving && "transition-transform"
      )}
    >
      <span className="absolute top-1/2 -left-2 size-5 -translate-y-1/2 rounded-full bg-gradient-to-br from-[#8a5a2b] to-[#3b210c] shadow" />
      <span className="absolute top-1/2 -right-2 size-5 -translate-y-1/2 rounded-full bg-gradient-to-br from-[#8a5a2b] to-[#3b210c] shadow" />
    </span>
  )
}

/**
 * A parchment scroll that unrolls to reveal its content: the bottom rod rolls
 * down, the parchment opens out between the rods, and the writing fades in.
 */
export function ScrollUnroll({
  title = "Open the scroll",
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  children,
  className,
  ...props
}: ScrollUnrollProps) {
  const id = useId()
  const [internal, setInternal] = useState(defaultOpen)
  const open = openProp ?? internal

  function toggle() {
    const next = !open
    if (openProp === undefined) setInternal(next)
    onOpenChange?.(next)
  }

  return (
    <MotionConfig reducedMotion="user">
      <div
        data-slot="scroll-unroll"
        data-state={open ? "open" : "closed"}
        className={cn("flex w-full flex-col items-stretch px-2", className)}
        {...props}
      >
        <button
          type="button"
          aria-expanded={open}
          aria-controls={`${id}-parchment`}
          onClick={toggle}
          className="group relative z-10 rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <Rod />
          <span className="absolute top-full left-1/2 mt-1 -translate-x-1/2 rounded-b-md bg-[#7a4a22] px-2 py-0.5 font-serif text-[11px] whitespace-nowrap text-[#f3e6c8] shadow transition-transform group-hover:translate-y-0.5">
            {open ? "Roll up" : title}
          </span>
        </button>

        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              id={`${id}-parchment`}
              key="parchment"
              role="region"
              initial={{ height: 0 }}
              animate={{ height: "auto" }}
              exit={{ height: 0, transition: { duration: 0.55, ease: [0.4, 0, 0.2, 1] } }}
              transition={{ type: "spring", stiffness: 90, damping: 18 }}
              className="relative mx-2 -my-1.5 overflow-hidden bg-[#f1e4c6] text-[#3b2a16] dark:bg-[#2b2216] dark:text-[#eadcbc]"
            >
              {/* Curl shadows near the rods, and a little paper grain. */}
              <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-5 bg-gradient-to-b from-black/20 to-transparent" />
              <span aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-5 bg-gradient-to-t from-black/20 to-transparent" />
              <span aria-hidden className="pointer-events-none absolute inset-0 opacity-30 [background-image:radial-gradient(rgb(120_80_30/0.25)_1px,transparent_1px)] [background-size:5px_5px]" />
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, transition: { duration: 0.15 } }}
                transition={{ delay: 0.25, duration: 0.4 }}
                className="relative px-6 pt-9 pb-7 font-serif text-sm leading-relaxed"
              >
                {children}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className={cn("relative transition-[margin] duration-300", open ? "mt-0" : "mt-0.5")}>
          <Rod />
        </div>
      </div>
    </MotionConfig>
  )
}
