"use client"

/**
 * Relic UI · Rewrite Text
 * https://relic-ui.vercel.app/docs/rewrite-text
 *
 * Copyright (c) 2026 Shubham Tambe
 * Open source under the MIT License: https://relic-ui.vercel.app/license
 */

import { useEffect, useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"

// How letters arrive and leave.
const LETTER_EFFECTS = {
  blur: {
    initial: { opacity: 0, y: "0.2em", filter: "blur(8px)" },
    exit: { opacity: 0, scale: 0.8, filter: "blur(10px)" },
  },
  rise: {
    initial: { opacity: 0, y: "0.45em" },
    exit: { opacity: 0, y: "-0.35em" },
  },
  fade: {
    initial: { opacity: 0 },
    exit: { opacity: 0 },
  },
} as const

export interface RewriteTextProps
  extends Omit<React.ComponentProps<"span">, "children"> {
  /** The words to cycle through. The first one shows first. */
  words: string[]
  /** Seconds each word stays before it's rewritten. */
  hold?: number
  /** Milliseconds per typed letter (a little randomness is added). */
  typeSpeed?: number
  /**
   * How the old word goes away: "select" highlights it and removes it at
   * once, "backspace" deletes it letter by letter.
   */
  deleteMode?: "select" | "backspace"
  /** How letters appear and disappear. "none" makes them snap in. */
  letterEffect?: keyof typeof LETTER_EFFECTS | "none"
  /** Keep cycling forever, or stop on the last word. */
  loop?: boolean
  /** Show the blinking caret. */
  showCaret?: boolean
  /** Extra classes for the caret, e.g. a color like "bg-amber-500". */
  caretClassName?: string
}

/**
 * Text that rewrites itself like someone editing it: the caret selects the
 * word (or backspaces through it), and the next word is typed in.
 */
export function RewriteText({
  words,
  hold = 2.4,
  typeSpeed = 70,
  deleteMode = "select",
  letterEffect = "blur",
  loop = true,
  showCaret = true,
  caretClassName,
  className,
  ...props
}: RewriteTextProps) {
  const reduceMotion = useReducedMotion()
  const [text, setText] = useState(words[0] ?? "")
  const [selected, setSelected] = useState(false)
  // Bumped for every new word so its letters get fresh keys and animate in.
  const [round, setRound] = useState(0)
  const wordsKey = words.join("\u0000")

  useEffect(() => {
    const list = wordsKey.split("\u0000")
    if (reduceMotion || list.length < 2) return
    let cancelled = false
    const timers: ReturnType<typeof setTimeout>[] = []
    const wait = (ms: number) =>
      new Promise<void>((resolve) => timers.push(setTimeout(resolve, ms)))

    async function run() {
      let index = 0
      while (!cancelled) {
        if (!loop && index === list.length - 1) return
        await wait(hold * 1000)
        if (cancelled) return

        const current = list[index]
        if (deleteMode === "select") {
          setSelected(true)
          await wait(450)
          if (cancelled) return
          setSelected(false)
          setText("")
        } else {
          for (let n = current.length - 1; n >= 0; n--) {
            if (cancelled) return
            setText(current.slice(0, n))
            await wait(Math.max(typeSpeed * 0.5, 25))
          }
        }
        setRound((r) => r + 1)
        await wait(320)

        index = (index + 1) % list.length
        const word = list[index]
        for (let n = 1; n <= word.length; n++) {
          if (cancelled) return
          setText(word.slice(0, n))
          await wait(typeSpeed + Math.random() * typeSpeed * 0.85)
        }
      }
    }

    run()
    return () => {
      cancelled = true
      timers.forEach(clearTimeout)
    }
  }, [reduceMotion, wordsKey, hold, typeSpeed, deleteMode, loop])

  const effect = letterEffect === "none" ? null : LETTER_EFFECTS[letterEffect]

  return (
    <span
      data-slot="rewrite-text"
      className={cn("relative inline-flex items-baseline", className)}
      {...props}
    >
      <span className="sr-only">{words[0]}</span>
      {/* An invisible strut keeps the line one line tall even while the word is
          empty, so the text around it never jumps up and down. */}
      <span aria-hidden className="inline-block w-0 select-none">&#8203;</span>
      <span
        aria-hidden
        className={cn(
          "relative inline-flex rounded-lg px-[0.04em] transition-colors duration-200",
          selected ? "bg-primary/15" : "bg-transparent"
        )}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {Array.from(text).map((ch, i) => (
            <motion.span
              key={`${round}-${i}`}
              className="inline-block whitespace-pre"
              initial={effect ? effect.initial : false}
              animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              exit={effect ? effect.exit : { opacity: 0, transition: { duration: 0 } }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              {ch}
            </motion.span>
          ))}
        </AnimatePresence>
      </span>
      {/* The caret glides with the text because of `layout`. */}
      {showCaret && (
        <motion.span
          layout
          aria-hidden
          className={cn(
            "ml-[0.06em] inline-block h-[0.82em] w-[0.055em] min-w-0.5 translate-y-[0.08em] self-center rounded-full bg-primary",
            caretClassName
          )}
          animate={
            reduceMotion
              ? { opacity: 0 }
              : { opacity: selected ? 0 : [1, 1, 0, 0, 1] }
          }
          transition={{
            layout: { type: "spring", stiffness: 700, damping: 45 },
            opacity: selected
              ? { duration: 0.1 }
              : { duration: 1.1, times: [0, 0.5, 0.55, 0.95, 1], repeat: Infinity },
          }}
        />
      )}
    </span>
  )
}
