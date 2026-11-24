"use client"

/**
 * Relic UI · Wax Seal Button
 * https://relic-ui.vercel.app/docs/wax-seal-button
 *
 * Copyright (c) 2026 Shubham Tambe
 * Open source under the MIT License: https://relic-ui.vercel.app/license
 */

import { useEffect, useRef, useState } from "react"
import { AnimatePresence, MotionConfig, motion } from "motion/react"

import { cn } from "@/lib/utils"

/** An irregular, hand-poured wax outline around a 50×50 box. */
const WAX_PATH = (() => {
  const points: string[] = []
  const bumps = 11
  for (let i = 0; i <= 60; i++) {
    const a = (i / 60) * Math.PI * 2
    const r = 22 + Math.sin(a * bumps) * 1.4 + Math.sin(a * 3 + 1) * 0.9
    points.push(`${(25 + Math.cos(a) * r).toFixed(2)},${(25 + Math.sin(a) * r).toFixed(2)}`)
  }
  return `M${points.join("L")}Z`
})()

export interface WaxSealButtonProps
  extends Omit<React.ComponentProps<"button">, "onClick"> {
  /** Called once the seal lands. */
  onSeal?: () => void
  /** What's pressed into the wax: a letter, a symbol or an icon. */
  emblem?: React.ReactNode
  /** Color of the wax. */
  waxColor?: string
  /** Seconds the seal stays before the button resets. 0 keeps it sealed. */
  resetAfter?: number
  /** Content shown once sealed, e.g. "Signed". */
  sealedChildren?: React.ReactNode
  onClick?: React.MouseEventHandler<HTMLButtonElement>
}

/**
 * Confirming feels like signing: pressing the button stamps a wax seal onto
 * it. The seal drops in, squashes, settles, and leaves a ripple behind.
 */
export function WaxSealButton({
  onSeal,
  emblem = "✶",
  waxColor = "#9b2226",
  resetAfter = 2.4,
  sealedChildren,
  children,
  className,
  disabled,
  onClick,
  ...props
}: WaxSealButtonProps) {
  const [sealed, setSealed] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => () => clearTimeout(timer.current), [])

  function seal(e: React.MouseEvent<HTMLButtonElement>) {
    onClick?.(e)
    if (e.defaultPrevented || sealed) return
    setSealed(true)
    navigator.vibrate?.(20)
    // The seal lands about halfway through its drop.
    setTimeout(() => onSeal?.(), 260)
    if (resetAfter > 0) {
      clearTimeout(timer.current)
      timer.current = setTimeout(() => setSealed(false), resetAfter * 1000)
    }
  }

  return (
    <MotionConfig reducedMotion="user">
      <button
        type="button"
        data-slot="wax-seal-button"
        data-state={sealed ? "sealed" : "open"}
        disabled={disabled}
        onClick={seal}
        className={cn(
          "relative inline-flex h-11 items-center rounded-lg border bg-background pr-14 pl-5 text-sm font-medium shadow-xs transition-[color,background-color,transform] active:scale-[0.97]",
          "outline-none hover:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/50",
          "disabled:pointer-events-none disabled:opacity-50",
          className
        )}
        {...props}
      >
        <span>{sealed && sealedChildren ? sealedChildren : children}</span>

        <AnimatePresence>
          {sealed && (
            <motion.span
              key="seal"
              aria-hidden
              className="pointer-events-none absolute top-1/2 -right-3 size-12 -translate-y-1/2"
              initial={{ opacity: 0, scale: 2.2, y: -34, rotate: -25 }}
              animate={{
                opacity: [0, 1, 1, 1],
                scale: [2.2, 0.86, 1.07, 1],
                y: [-34, 0, 0, 0],
                rotate: [-25, 0, -5, 0],
              }}
              exit={{ opacity: 0, scale: 0.8, filter: "blur(3px)", transition: { duration: 0.3 } }}
              transition={{ duration: 0.6, times: [0, 0.45, 0.72, 1], ease: "easeOut" }}
            >
              {/* The ripple where the wax hits. */}
              <motion.span
                className="absolute inset-0 rounded-full border-2"
                style={{ borderColor: waxColor }}
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: [0.7, 1.9], opacity: [0.55, 0] }}
                transition={{ delay: 0.27, duration: 0.6, ease: "easeOut" }}
              />
              <svg viewBox="0 0 50 50" className="relative size-full drop-shadow-md">
                <path d={WAX_PATH} fill={waxColor} />
                <circle cx="25" cy="25" r="15" fill="none" stroke="black" strokeOpacity="0.25" strokeWidth="1.5" />
                <circle cx="25" cy="25" r="15.8" fill="none" stroke="white" strokeOpacity="0.18" strokeWidth="0.8" />
              </svg>
              {/* The emblem, embossed into the wax. */}
              <span
                className="absolute inset-0 flex items-center justify-center font-serif text-base font-semibold text-white/85 [&_svg]:size-4"
                style={{ textShadow: "0 1px 0 rgb(0 0 0 / 0.35), 0 -1px 0 rgb(255 255 255 / 0.25)" }}
              >
                {emblem}
              </span>
            </motion.span>
          )}
        </AnimatePresence>
        <span role="status" className="sr-only">
          {sealed ? "Sealed" : ""}
        </span>
      </button>
    </MotionConfig>
  )
}
