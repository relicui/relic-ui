"use client"

/**
 * Relic UI · Deliberate Text
 * https://relic-ui.vercel.app/docs/deliberate-text
 *
 * Copyright (c) 2026 Shubham Tambe
 * Open source under the MIT License: https://relic-ui.vercel.app/license
 */

import { useEffect, useMemo, useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"

type Token = { options: string[]; space: boolean }

/**
 * "{quick|fast|swift}" marks a word the AI hesitates over; the last option
 * is the one it settles on. Everything else streams in normally.
 */
function parse(text: string): Token[] {
  return text
    .split(/(\{[^}]+\}|\s+)/)
    .filter(Boolean)
    .map((part) =>
      part.startsWith("{")
        ? { options: part.slice(1, -1).split("|"), space: false }
        : { options: [part], space: /^\s+$/.test(part) }
    )
}

export interface DeliberateTextProps
  extends Omit<React.ComponentProps<"p">, "children"> {
  /** The text. Write {a|b|c} where the AI should hesitate; it settles on the last option. */
  text: string
  /** Milliseconds per streamed word. */
  speed?: number
  /** How many times an uncertain word flickers before settling. */
  flickers?: number
  /** Underline the words it hesitated over; hover shows the alternatives. */
  markChoices?: boolean
  /** Start again after a pause once finished. */
  loop?: boolean
  /** Extra classes for the caret. */
  caretClassName?: string
  onComplete?: () => void
}

/**
 * Streaming text where uncertain words briefly flicker between alternatives
 * before settling, so you can watch the AI choose.
 */
export function DeliberateText({
  text,
  speed = 70,
  flickers = 4,
  markChoices = true,
  loop = false,
  caretClassName,
  onComplete,
  className,
  ...props
}: DeliberateTextProps) {
  const reduceMotion = useReducedMotion()
  const tokens = useMemo(() => parse(text), [text])
  const [count, setCount] = useState(0)
  const [flick, setFlick] = useState<number | null>(null)

  useEffect(() => {
    if (reduceMotion) return
    let cancelled = false
    const timers: ReturnType<typeof setTimeout>[] = []
    const wait = (ms: number) => new Promise<void>((r) => timers.push(setTimeout(r, ms)))

    async function run() {
      do {
        await wait(0)
        setCount(0)
        setFlick(null)
        await wait(200)
        for (let i = 0; i < tokens.length; i++) {
          if (cancelled) return
          const token = tokens[i]
          if (token.options.length > 1) {
            const choices = token.options.length - 1
            for (let f = 0; f < flickers; f++) {
              setFlick(f % choices)
              await wait(110)
              if (cancelled) return
            }
            setFlick(null)
          }
          setCount(i + 1)
          if (!token.space) await wait(speed + Math.random() * speed * 0.6)
        }
        onComplete?.()
        if (loop) await wait(2600)
      } while (loop && !cancelled)
    }

    run()
    return () => {
      cancelled = true
      timers.forEach(clearTimeout)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokens, speed, flickers, loop, reduceMotion])

  const finalText = tokens.map((t) => t.options[t.options.length - 1]).join("")
  const shown = reduceMotion ? tokens.length : count
  const streaming = !reduceMotion && shown < tokens.length
  const active = tokens[shown]

  return (
    <p data-slot="deliberate-text" className={cn("leading-relaxed", className)} {...props}>
      <span className="sr-only">{finalText}</span>
      <span aria-hidden>
        {tokens.slice(0, shown).map((token, i) => {
          const word = token.options[token.options.length - 1]
          if (token.options.length > 1 && markChoices) {
            return (
              <motion.span
                key={i}
                title={`Also considered: ${token.options.slice(0, -1).join(", ")}`}
                initial={{ backgroundColor: "color-mix(in oklch, var(--primary) 18%, transparent)" }}
                animate={{ backgroundColor: "color-mix(in oklch, var(--primary) 0%, transparent)" }}
                transition={{ duration: 1.2 }}
                className="rounded-[3px] underline decoration-primary/40 decoration-dotted underline-offset-4"
              >
                {word}
              </motion.span>
            )
          }
          return (
            <motion.span
              key={i}
              initial={{ opacity: 0, filter: "blur(3px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              transition={{ duration: 0.25 }}
            >
              {word}
            </motion.span>
          )
        })}
        {streaming && active && flick !== null && (
          <AnimatePresence mode="popLayout">
            <motion.span
              key={flick}
              className="text-muted-foreground"
              initial={{ opacity: 0, y: "0.25em", filter: "blur(3px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: "-0.25em", filter: "blur(3px)" }}
              transition={{ duration: 0.09 }}
            >
              {active.options[flick]}
            </motion.span>
          </AnimatePresence>
        )}
        {streaming && (
          <span
            className={cn(
              "ml-0.5 inline-block h-[1.05em] w-0.5 translate-y-[0.15em] animate-pulse rounded-full bg-primary",
              caretClassName
            )}
          />
        )}
      </span>
    </p>
  )
}
