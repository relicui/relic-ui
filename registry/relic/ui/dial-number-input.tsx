"use client"

/**
 * Relic UI · Dial Number Input
 * https://relic-ui.vercel.app/docs/dial-number-input
 *
 * Copyright (c) 2026 Shubham Tambe
 * Open source under the MIT License: https://relic-ui.vercel.app/license
 */

import { useEffect, useRef, useState } from "react"
import {
  AnimatePresence,
  MotionConfig,
  motion,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react"

import { cn } from "@/lib/utils"

const TICK = 8 // pixels between ruler ticks (one tick = one step)

const SIZES = {
  sm: { dial: "h-20 w-28", digits: "text-2xl" },
  default: { dial: "h-24 w-32", digits: "text-3xl" },
  lg: { dial: "h-28 w-40", digits: "text-4xl" },
} as const

export interface DialNumberInputProps {
  /** The number (controlled). */
  value?: number
  /** The number at first (uncontrolled). */
  defaultValue?: number
  onValueChange?: (value: number) => void
  min?: number
  max?: number
  step?: number
  /** Accessible name, also shown under the dial. */
  label?: string
  /** Format the number for display, e.g. (v) => `${v}%`. */
  formatValue?: (value: number) => string
  /** Name for form submission. */
  name?: string
  /** Size of the dial. */
  size?: keyof typeof SIZES
  /** Pixels of vertical drag per step. Lower is more sensitive. */
  sensitivity?: number
  /** Going past max starts again at min, and the other way round. */
  wrap?: boolean
  /** Show the − and + buttons. */
  showButtons?: boolean
  /** Show the moving ruler under the number. */
  showRuler?: boolean
  disabled?: boolean
  className?: string
}

/**
 * A number you spin like a combination lock: drag up or down, scroll, or use
 * the arrow keys. Digits roll in the direction you turn, over a moving ruler.
 */
export function DialNumberInput({
  value: valueProp,
  defaultValue = 0,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  label = "Value",
  formatValue = (v) => String(v),
  name,
  size = "default",
  sensitivity = 10,
  wrap = false,
  showButtons = true,
  showRuler = true,
  disabled,
  className,
}: DialNumberInputProps) {
  const sizing = SIZES[size]
  const [internal, setInternal] = useState(defaultValue)
  const value = valueProp ?? internal
  const [direction, setDirection] = useState(1)
  const reduceMotion = useReducedMotion()
  const dialRef = useRef<HTMLDivElement>(null)
  const drag = useRef<{ y: number; value: number } | null>(null)

  const decimals = (String(step).split(".")[1] ?? "").length
  const clamp = (v: number) =>
    Number(Math.min(Math.max(v, min), max).toFixed(decimals))

  function change(next: number) {
    const intent = next > value ? 1 : -1
    // With wrap on, going past one end continues from the other.
    const wrapped = wrap
      ? next > max
        ? min
        : next < min
          ? max
          : next
      : next
    const clean = clamp(wrapped)
    if (clean === value) return
    setDirection(intent)
    if (valueProp === undefined) setInternal(clean)
    onValueChange?.(clean)
  }

  // The ruler glides with a spring as the value changes.
  const offset = useSpring((value / step) * TICK, { stiffness: 300, damping: 30 })
  const rulerPosition = useTransform(offset, (v) => `${-v}px 100%`)
  useEffect(() => {
    if (reduceMotion) offset.jump((value / step) * TICK)
    else offset.set((value / step) * TICK)
  }, [value, step, offset, reduceMotion])

  // Scrolling turns the dial, but only while it has focus, so the page
  // still scrolls normally when you're just passing by.
  const changeRef = useRef(change)
  useEffect(() => {
    changeRef.current = change
  })
  useEffect(() => {
    const el = dialRef.current
    if (!el) return
    function handleWheel(e: WheelEvent) {
      if (document.activeElement !== el) return
      e.preventDefault()
      changeRef.current(Number(el?.getAttribute("aria-valuenow")) + (e.deltaY < 0 ? step : -step))
    }
    el.addEventListener("wheel", handleWheel, { passive: false })
    return () => el.removeEventListener("wheel", handleWheel)
  }, [step])

  function handleKeyDown(e: React.KeyboardEvent) {
    const big = step * 10
    const moves: Record<string, number> = {
      ArrowUp: value + step,
      ArrowRight: value + step,
      ArrowDown: value - step,
      ArrowLeft: value - step,
      PageUp: value + big,
      PageDown: value - big,
      Home: min,
      End: max,
    }
    if (e.key in moves) {
      e.preventDefault()
      change(moves[e.key])
    }
  }

  const digits = {
    enter: (dir: number) => ({ y: dir > 0 ? "70%" : "-70%", opacity: 0, filter: "blur(4px)" }),
    center: { y: 0, opacity: 1, filter: "blur(0px)" },
    exit: (dir: number) => ({ y: dir > 0 ? "-70%" : "70%", opacity: 0, filter: "blur(4px)" }),
  }

  return (
    <MotionConfig reducedMotion="user">
      <div
        data-slot="dial-number-input"
        className={cn("inline-flex flex-col items-center gap-2", className)}
      >
        <div className="flex items-center gap-2">
          {showButtons && (
            <StepButton
              label={`Decrease ${label}`}
              disabled={disabled || (!wrap && value <= min)}
              onClick={() => change(value - step)}
            >
              <path d="M4 8h8" />
            </StepButton>
          )}

          <div
            ref={dialRef}
            role="spinbutton"
            tabIndex={disabled ? -1 : 0}
            aria-label={label}
            aria-valuenow={value}
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuetext={formatValue(value)}
            aria-disabled={disabled}
            onKeyDown={handleKeyDown}
            onPointerDown={(e) => {
              if (disabled) return
              // Capturing can fail (e.g. for a simulated or already-ended pointer);
              // the component still works without it.
              try {
                e.currentTarget.setPointerCapture(e.pointerId)
              } catch {
                // not capturable, carry on
              }
              e.currentTarget.focus()
              drag.current = { y: e.clientY, value }
            }}
            onPointerMove={(e) => {
              if (!drag.current) return
              const steps = Math.round(
                (drag.current.y - e.clientY) / Math.max(sensitivity, 1)
              )
              change(drag.current.value + steps * step)
            }}
            onPointerUp={() => (drag.current = null)}
            onPointerCancel={() => (drag.current = null)}
            className={cn(
              "relative flex cursor-ns-resize touch-none flex-col items-center justify-center overflow-hidden rounded-xl border bg-background shadow-xs select-none",
              sizing.dial,
              "outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
              disabled && "pointer-events-none opacity-50"
            )}
          >
            <div
              className={cn(
                "relative flex h-12 w-full items-center justify-center overflow-hidden",
                showRuler && "-mt-3"
              )}
            >
              <AnimatePresence mode="popLayout" initial={false} custom={direction}>
                <motion.span
                  key={value}
                  custom={direction}
                  variants={digits}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ type: "spring", stiffness: 500, damping: 34 }}
                  className={cn("font-semibold tracking-tight tabular-nums", sizing.digits)}
                >
                  {formatValue(value)}
                </motion.span>
              </AnimatePresence>
            </div>

            {/* The ruler: small ticks every step, tall ticks every 5 steps. */}
            {showRuler && <div
              aria-hidden
              className="absolute inset-x-0 bottom-2 h-4 [mask-image:linear-gradient(to_right,transparent,black_25%,black_75%,transparent)]"
            >
              <motion.div
                className="absolute inset-0 text-border"
                style={{
                  backgroundImage: `repeating-linear-gradient(to right, currentColor 0 1px, transparent 1px ${TICK}px)`,
                  backgroundSize: `${TICK}px 45%`,
                  backgroundRepeat: "repeat-x",
                  backgroundPosition: rulerPosition,
                }}
              />
              <motion.div
                className="absolute inset-0 text-muted-foreground/50"
                style={{
                  backgroundImage: `repeating-linear-gradient(to right, currentColor 0 1px, transparent 1px ${TICK * 5}px)`,
                  backgroundSize: `${TICK * 5}px 85%`,
                  backgroundRepeat: "repeat-x",
                  backgroundPosition: rulerPosition,
                }}
              />
              <span className="absolute bottom-0 left-1/2 h-full w-0.5 -translate-x-1/2 rounded-full bg-primary" />
            </div>}
          </div>

          {showButtons && (
            <StepButton
              label={`Increase ${label}`}
              disabled={disabled || (!wrap && value >= max)}
              onClick={() => change(value + step)}
            >
              <path d="M4 8h8M8 4v8" />
            </StepButton>
          )}
        </div>
        <span className="text-xs text-muted-foreground">{label}</span>
        {name && <input type="hidden" name={name} value={value} />}
      </div>
    </MotionConfig>
  )
}

function StepButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string
  disabled?: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="inline-flex size-8 items-center justify-center rounded-full border bg-background text-muted-foreground shadow-xs transition-colors outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-40"
    >
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" className="size-3.5">
        {children}
      </svg>
    </button>
  )
}
