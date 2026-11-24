"use client"

/**
 * Relic UI · Hold to Confirm Button
 * https://relic-ui.vercel.app/docs/hold-to-confirm-button
 *
 * Copyright (c) 2026 Shubham Tambe
 * Open source under the MIT License: https://relic-ui.vercel.app/license
 */

import { useEffect, useId, useRef, useState } from "react"
import { cva, type VariantProps } from "class-variance-authority"
import {
  animate,
  useMotionValue,
  type AnimationPlaybackControls,
} from "motion/react"

import { cn } from "@/lib/utils"

const holdToConfirmButtonVariants = cva(
  [
    "relative isolate inline-flex shrink-0 items-center justify-center gap-2 overflow-hidden",
    "rounded-lg border bg-background font-medium whitespace-nowrap text-foreground shadow-xs",
    "touch-manipulation select-none [-webkit-touch-callout:none]",
    "transition-transform duration-200 data-[state=holding]:scale-[0.97]",
    "outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  ],
  {
    variants: {
      size: {
        sm: "h-8 px-3 text-sm",
        default: "h-10 px-5 text-sm",
        lg: "h-12 px-7 text-base",
      },
    },
    defaultVariants: { size: "default" },
  }
)

const fillColor = {
  default: "bg-primary text-primary-foreground",
  destructive: "bg-destructive text-white",
} as const

type FillFrom = "left" | "right" | "center" | "bottom"

/** The clip-path that reveals `progress` (0–1) of the fill from a given side. */
function fillClip(from: FillFrom, progress: number) {
  const hidden = 100 - progress * 100
  switch (from) {
    case "right":
      return `inset(0 0 0 ${hidden}%)`
    case "center":
      return `inset(0 ${hidden / 2}% 0 ${hidden / 2}%)`
    case "bottom":
      return `inset(${hidden}% 0 0 0)`
    default:
      return `inset(0 ${hidden}% 0 0)`
  }
}

type HoldState = "idle" | "holding" | "confirmed"

const CONFIRM_KEYS = new Set([" ", "Enter"])

export interface HoldToConfirmButtonProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof holdToConfirmButtonVariants> {
  /** Called once the button has been held for the full duration. */
  onConfirm?: () => void
  /** Seconds the button must be held. */
  duration?: number
  /** Color of the fill. */
  variant?: keyof typeof fillColor
  /** Where the fill grows from. */
  fillFrom?: FillFrom
  /** Seconds the confirmed state stays before the button resets. */
  resetAfter?: number
  /** Content shown briefly after confirming, e.g. "Deleted". */
  confirmedChildren?: React.ReactNode
  /** Hint read by screen readers. */
  holdHint?: string
}

export function HoldToConfirmButton({
  className,
  size,
  variant = "default",
  duration = 1.2,
  fillFrom = "left",
  resetAfter = 1.2,
  onConfirm,
  confirmedChildren,
  holdHint = "Press and hold to confirm",
  children,
  disabled,
  onPointerDown,
  onPointerUp,
  onPointerLeave,
  onPointerCancel,
  onKeyDown,
  onKeyUp,
  onContextMenu,
  ...props
}: HoldToConfirmButtonProps) {
  const hintId = useId()
  const progress = useMotionValue(0)
  const fillRef = useRef<HTMLSpanElement>(null)

  const [state, setStateValue] = useState<HoldState>("idle")
  const stateRef = useRef<HoldState>("idle")
  const controls = useRef<AnimationPlaybackControls | null>(null)
  const resetTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const onConfirmRef = useRef(onConfirm)

  useEffect(() => {
    onConfirmRef.current = onConfirm
  }, [onConfirm])

  // Draw the fill straight onto the element on every frame (no re-renders).
  useEffect(() => {
    const el = fillRef.current
    if (!el) return
    const draw = (v: number) => {
      el.style.clipPath = fillClip(fillFrom, v)
    }
    draw(progress.get())
    return progress.on("change", draw)
  }, [fillFrom, progress])

  useEffect(
    () => () => {
      controls.current?.stop()
      clearTimeout(resetTimer.current)
    },
    []
  )

  function setState(next: HoldState) {
    stateRef.current = next
    setStateValue(next)
  }

  function start() {
    if (disabled || stateRef.current !== "idle") return
    setState("holding")
    controls.current?.stop()
    controls.current = animate(progress, 1, {
      // Resume from wherever the fill currently is.
      duration: duration * (1 - progress.get()),
      ease: "linear",
      onComplete: () => {
        if (stateRef.current !== "holding") return
        setState("confirmed")
        navigator.vibrate?.(15)
        onConfirmRef.current?.()
        resetTimer.current = setTimeout(() => {
          setState("idle")
          controls.current = animate(progress, 0, {
            duration: 0.4,
            ease: [0.4, 0, 0.2, 1],
          })
        }, resetAfter * 1000)
      },
    })
  }

  function cancel() {
    if (stateRef.current !== "holding") return
    setState("idle")
    controls.current?.stop()
    controls.current = animate(progress, 0, { duration: 0.25, ease: "easeOut" })
  }

  const content =
    state === "confirmed" && confirmedChildren ? confirmedChildren : children

  return (
    <>
      <button
        type="button"
        {...props}
        data-slot="hold-to-confirm-button"
        data-state={state}
        disabled={disabled}
        aria-describedby={hintId}
        className={cn(holdToConfirmButtonVariants({ size }), className)}
        onPointerDown={(e) => {
          onPointerDown?.(e)
          if (e.button === 0) start()
        }}
        onPointerUp={(e) => {
          onPointerUp?.(e)
          cancel()
        }}
        onPointerLeave={(e) => {
          onPointerLeave?.(e)
          cancel()
        }}
        onPointerCancel={(e) => {
          onPointerCancel?.(e)
          cancel()
        }}
        onKeyDown={(e) => {
          onKeyDown?.(e)
          if (CONFIRM_KEYS.has(e.key) && !e.repeat) {
            e.preventDefault()
            start()
          }
        }}
        onKeyUp={(e) => {
          onKeyUp?.(e)
          if (CONFIRM_KEYS.has(e.key)) cancel()
        }}
        onContextMenu={(e) => {
          onContextMenu?.(e)
          // Stop the long-press menu on touch devices.
          e.preventDefault()
        }}
      >
        <span className="inline-flex items-center gap-2">{content}</span>
        {/* A second copy of the label, revealed by the fill, so the text color flips exactly where the fill is. */}
        <span
          ref={fillRef}
          aria-hidden
          style={{ clipPath: fillClip(fillFrom, 0) }}
          className={cn(
            "pointer-events-none absolute inset-0 flex items-center justify-center gap-2",
            fillColor[variant]
          )}
        >
          {content}
        </span>
      </button>
      <span id={hintId} className="sr-only">
        {holdHint}
      </span>
      <span role="status" className="sr-only">
        {state === "confirmed" ? "Confirmed" : ""}
      </span>
    </>
  )
}

export { holdToConfirmButtonVariants }
