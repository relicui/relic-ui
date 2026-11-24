"use client"

/**
 * Relic UI · Smooth Caret Input
 * https://relic-ui.vercel.app/docs/smooth-caret-input
 *
 * Copyright (c) 2026 Shubham Tambe
 * Open source under the MIT License: https://relic-ui.vercel.app/license
 */

import { useCallback, useLayoutEffect, useRef, useState } from "react"
import {
  AnimatePresence,
  animate,
  motion,
  useAnimate,
  useMotionValue,
  useReducedMotion,
  useTransform,
  useVelocity,
  type TargetAndTransition,
} from "motion/react"

import { cn } from "@/lib/utils"

/* -------------------------------------------------------------------------- */
/*                                   Options                                  */
/* -------------------------------------------------------------------------- */

const VARIANTS = {
  default: "rounded-lg border bg-background shadow-xs",
  underline:
    "rounded-none border-0 border-b bg-transparent shadow-none has-[input:focus-visible]:ring-0",
  ghost:
    "rounded-lg border border-transparent bg-muted/60 shadow-none has-[input:focus-visible]:bg-background",
} as const

// Padding must match between the real input and the visible text layer.
const SIZES = {
  sm: { root: "h-8 text-sm", input: "px-2.5", layer: "right-2.5 left-2.5" },
  default: { root: "h-10 text-sm", input: "px-3", layer: "right-3 left-3" },
  lg: { root: "h-12 text-base", input: "px-4", layer: "right-4 left-4" },
} as const

const CARETS = {
  line: {
    box: "top-[calc(50%-0.6em)] h-[1.2em] w-0.5 -translate-x-px",
    fill: "rounded-full bg-primary",
  },
  block: {
    box: "top-[calc(50%-0.65em)] h-[1.3em] w-[0.6em]",
    fill: "rounded-[3px] bg-primary/25",
  },
  underline: {
    box: "top-[calc(50%+0.55em)] h-0.5 w-[0.6em]",
    fill: "rounded-full bg-primary",
  },
} as const

type Spring = { stiffness: number; damping: number }

const CARET_SPEEDS = {
  snappy: { stiffness: 1600, damping: 75 },
  smooth: { stiffness: 900, damping: 55 },
  // Slightly under-damped, so it drifts and settles.
  lazy: { stiffness: 260, damping: 26 },
} as const satisfies Record<string, Spring>

const LETTER_EFFECTS = {
  rise: { opacity: 0, y: "0.4em", filter: "blur(3px)" },
  fade: { opacity: 0 },
  blur: { opacity: 0, filter: "blur(6px)" },
  scale: { opacity: 0, scale: 0.3 },
  drop: { opacity: 0, y: "-0.5em" },
} as const satisfies Record<string, TargetAndTransition>

const LETTER_SETTLED = { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }

/* -------------------------------------------------------------------------- */
/*                               Text bookkeeping                             */
/* -------------------------------------------------------------------------- */

type Char = { id: number; ch: string; animate: boolean; delay: number }

let nextCharId = 0

// Pasted text ripples in letter by letter, but never takes longer than this.
const WAVE_STEP = 0.018
const WAVE_MAX = 0.35

function toChars(text: string, animate: boolean, wave = false): Char[] {
  return Array.from(text, (ch, i) => ({
    id: nextCharId++,
    ch,
    animate,
    delay: wave ? Math.min(i * WAVE_STEP, WAVE_MAX) : 0,
  }))
}

/**
 * Work out which characters were added, keeping the ids of the ones that
 * stayed. Only new characters mount, so only they play the enter animation,
 * and only removed characters play the exit animation.
 */
function diffChars(
  prev: Char[],
  text: string,
  animate: boolean,
  wave: boolean
): Char[] {
  const next = Array.from(text)
  let start = 0
  while (
    start < prev.length &&
    start < next.length &&
    prev[start].ch === next[start]
  ) {
    start++
  }
  let end = 0
  while (
    end < prev.length - start &&
    end < next.length - start &&
    prev[prev.length - 1 - end].ch === next[next.length - 1 - end]
  ) {
    end++
  }
  const inserted = next.slice(start, next.length - end).join("")
  return [
    ...prev.slice(0, start),
    ...toChars(inserted, animate, wave && inserted.length > 1),
    ...prev.slice(prev.length - end),
  ]
}

// Kerning and ligatures are turned off on both the real input and the
// visible text, so every character lines up exactly with the native caret.
const TEXT_METRICS = "[font-kerning:none] [font-variant-ligatures:none]"

const EASE_OUT = [0.22, 1, 0.36, 1] as const

/* -------------------------------------------------------------------------- */
/*                                  Component                                 */
/* -------------------------------------------------------------------------- */

export interface SmoothCaretInputProps
  extends Omit<React.ComponentProps<"input">, "ref" | "size"> {
  /** Look of the field. */
  variant?: keyof typeof VARIANTS
  /** Height, padding and text size. */
  size?: keyof typeof SIZES
  /** Shape of the caret. */
  caret?: keyof typeof CARETS
  /** Extra classes for the caret, e.g. a color like "bg-blue-500". */
  caretClassName?: string
  /** How the caret moves: a preset, or your own spring. */
  caretSpeed?: keyof typeof CARET_SPEEDS | Spring
  /** Whether the caret blinks while idle. */
  blink?: boolean
  /** How new letters appear. */
  letterEffect?: keyof typeof LETTER_EFFECTS | "none"
  /** Deleted letters blur away and the rest slide over to close the gap. */
  animateDelete?: boolean
  /** The caret stretches in the direction of travel on long jumps. */
  smear?: boolean
  /** Pasted text ripples in letter by letter. */
  pasteWave?: boolean
  /** The caret gives a small shake when typing past maxLength. */
  bumpOnLimit?: boolean
  /** Thickness of the line caret, in pixels. */
  caretWidth?: number
  /** Seconds each new letter takes to appear. */
  letterDuration?: number
  /** Show the caret even when the field isn't focused, e.g. for a typing demo. */
  alwaysShowCaret?: boolean
}

export function SmoothCaretInput({
  className,
  variant = "default",
  size = "default",
  caret = "line",
  caretClassName,
  caretSpeed = "smooth",
  blink = true,
  letterEffect = "rise",
  animateDelete = true,
  smear = true,
  pasteWave = true,
  bumpOnLimit = true,
  caretWidth,
  letterDuration = 0.22,
  alwaysShowCaret = false,
  value,
  defaultValue,
  onChange,
  onSelect,
  onFocus,
  onBlur,
  onScroll,
  onKeyDown,
  onPaste,
  maxLength,
  type = "text",
  ...props
}: SmoothCaretInputProps) {
  const reduceMotion = useReducedMotion()
  const inputRef = useRef<HTMLInputElement>(null)
  const stripRef = useRef<HTMLDivElement>(null)
  const liveIds = useRef<Set<number>>(new Set())
  const [blinkScope, animateBlink] = useAnimate<HTMLSpanElement>()
  const [bumpScope, animateBump] = useAnimate<HTMLSpanElement>()

  const isControlled = value !== undefined
  const [chars, setChars] = useState<Char[]>(() =>
    toChars(String(value ?? defaultValue ?? ""), false)
  )
  const [focused, setFocused] = useState(false)
  const [collapsed, setCollapsed] = useState(true)

  // Never draw real characters for passwords.
  const masked = type === "password"
  const motionOn = !reduceMotion
  const lettersOn = motionOn && letterEffect !== "none"
  const deleteOn = animateDelete && motionOn
  const spring =
    typeof caretSpeed === "string" ? CARET_SPEEDS[caretSpeed] : caretSpeed
  const sizing = SIZES[size]
  const caretShape = CARETS[caret]

  const caretX = useMotionValue(0)
  const stripX = useMotionValue(0)
  // Small moves keep the caret thin; fast, long jumps stretch it up to 5x.
  const caretSmear = useTransform(
    useVelocity(caretX),
    [-4000, -800, 800, 4000],
    [5, 1, 1, 5]
  )

  // Keep in sync when a controlled value is changed from outside.
  const text = chars.map((c) => c.ch).join("")
  if (isControlled && String(value) !== text) {
    setChars((prev) => diffChars(prev, String(value), lettersOn, false))
  }

  const measure = useCallback(
    (instant = false) => {
      const input = inputRef.current
      const strip = stripRef.current
      if (!input || !strip) return

      const caretIndex = input.selectionStart ?? input.value.length
      let x = 0
      let units = 0
      for (const el of Array.from(strip.children) as HTMLElement[]) {
        // Skip the caret and any letters that are still fading out.
        const id = el.dataset.id
        if (id === undefined || !liveIds.current.has(Number(id))) continue
        if (units >= caretIndex) break
        units += Number(el.dataset.units)
        x = el.offsetLeft + el.offsetWidth
      }

      stripX.set(-input.scrollLeft)
      if (instant || reduceMotion) caretX.jump(x)
      else animate(caretX, x, { type: "spring", ...spring })

      const blinker = blinkScope.current
      if (!blinker) return
      if (blink) {
        // Restart the blink so the caret stays solid while it's moving.
        animateBlink(
          blinker,
          { opacity: [1, 1, 0, 0, 1] },
          { duration: 1.1, times: [0, 0.5, 0.55, 0.95, 1], repeat: Infinity }
        )
      } else {
        animateBlink(blinker, { opacity: 1 }, { duration: 0 })
      }
    },
    [reduceMotion, caretX, stripX, spring, blink, blinkScope, animateBlink]
  )

  useLayoutEffect(() => {
    liveIds.current = new Set(chars.map((c) => c.id))
    measure()
  }, [chars, measure])

  function syncSelection() {
    const input = inputRef.current
    if (!input) return
    setCollapsed(input.selectionStart === input.selectionEnd)
    measure()
  }

  function bump() {
    if (!bumpOnLimit || !motionOn || !bumpScope.current) return
    animateBump(
      bumpScope.current,
      { x: [0, -4, 4, -3, 3, -1, 0] },
      { duration: 0.4, ease: "easeOut" }
    )
  }

  function selectionLength(input: HTMLInputElement) {
    return Math.abs((input.selectionEnd ?? 0) - (input.selectionStart ?? 0))
  }

  return (
    <div
      data-slot="smooth-caret-input"
      data-variant={variant}
      className={cn(
        "relative w-full min-w-0 transition-[color,background-color,border-color,box-shadow]",
        "has-[input:focus-visible]:border-ring has-[input:focus-visible]:ring-3 has-[input:focus-visible]:ring-ring/50",
        "has-[input:disabled]:pointer-events-none has-[input:disabled]:opacity-50",
        sizing.root,
        VARIANTS[variant],
        className
      )}
    >
      <input
        ref={inputRef}
        type={type}
        value={value}
        defaultValue={defaultValue}
        maxLength={maxLength}
        className={cn(
          "size-full rounded-[inherit] bg-transparent text-transparent caret-transparent outline-none",
          "placeholder:text-muted-foreground selection:bg-primary/20",
          sizing.input,
          TEXT_METRICS
        )}
        onChange={(e) => {
          setChars((prev) =>
            diffChars(prev, e.target.value, lettersOn, pasteWave && lettersOn)
          )
          onChange?.(e)
        }}
        onKeyDown={(e) => {
          onKeyDown?.(e)
          const input = e.currentTarget
          const isTyping =
            e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey
          if (
            isTyping &&
            maxLength !== undefined &&
            maxLength >= 0 &&
            input.value.length >= maxLength &&
            selectionLength(input) === 0
          ) {
            bump()
          }
        }}
        onPaste={(e) => {
          onPaste?.(e)
          const input = e.currentTarget
          const pasted = e.clipboardData.getData("text").length
          if (
            maxLength !== undefined &&
            maxLength >= 0 &&
            input.value.length - selectionLength(input) + pasted > maxLength
          ) {
            bump()
          }
        }}
        onSelect={(e) => {
          syncSelection()
          onSelect?.(e)
        }}
        onFocus={(e) => {
          setFocused(true)
          syncSelection()
          onFocus?.(e)
        }}
        onBlur={(e) => {
          setFocused(false)
          onBlur?.(e)
        }}
        onScroll={(e) => {
          stripX.set(-e.currentTarget.scrollLeft)
          onScroll?.(e)
        }}
        {...props}
      />

      {/* What you actually see: the typed text and the caret, drawn on top of the real input. */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-y-0 overflow-hidden",
          sizing.layer
        )}
      >
        <motion.div
          ref={stripRef}
          style={{ x: stripX }}
          className={cn(
            "relative flex h-full items-center whitespace-pre text-foreground",
            TEXT_METRICS
          )}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {chars.map((c) => (
              <motion.span
                key={c.id}
                data-id={c.id}
                data-units={c.ch.length}
                className="inline-block"
                layout={deleteOn ? "position" : false}
                initial={
                  c.animate && letterEffect !== "none"
                    ? LETTER_EFFECTS[letterEffect]
                    : false
                }
                animate={LETTER_SETTLED}
                exit={
                  deleteOn
                    ? {
                        opacity: 0,
                        scale: 0.6,
                        filter: "blur(3px)",
                        transition: { duration: 0.18, ease: "easeOut" },
                      }
                    : undefined
                }
                transition={{
                  duration: letterDuration,
                  ease: EASE_OUT,
                  delay: c.delay,
                  layout: { type: "spring", stiffness: 700, damping: 50 },
                }}
              >
                {masked ? "•" : c.ch}
              </motion.span>
            ))}
          </AnimatePresence>

          {/* Caret: position + smear → shake → blink */}
          <motion.span
            data-caret={caret}
            style={{
              x: caretX,
              scaleX: smear && motionOn ? caretSmear : 1,
              width: caret === "line" && caretWidth ? caretWidth : undefined,
            }}
            className={cn(
              "absolute left-0",
              caretShape.box,
              !((focused || alwaysShowCaret) && collapsed) && "invisible"
            )}
          >
            <span ref={bumpScope} className="block size-full">
              <span
                ref={blinkScope}
                className={cn("block size-full", caretShape.fill, caretClassName)}
              />
            </span>
          </motion.span>
        </motion.div>
      </div>
    </div>
  )
}
