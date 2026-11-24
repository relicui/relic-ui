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

export interface RewriteTextProps
  extends Omit<React.ComponentProps<"span">, "children"> {
  /** The words to cycle through. The first one shows first. */
  words: string[]
  /** Seconds each word stays before it's rewritten. */
  hold?: number
  /** Milliseconds per typed letter (a little randomness is added). */
  typeSpeed?: number
  /** Show the "select all" highlight before deleting. */
  highlight?: boolean
  /** Extra classes for the caret, e.g. a color like "bg-amber-500". */
  caretClassName?: string
}

/**
 * Text that rewrites itself like someone editing it: the caret selects the
 * word, the letters blur away, and the next word is typed in.
 */
export function RewriteText({
  words,
  hold = 2.4,
  typeSpeed = 70,
  highlight = true,
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
        await wait(hold * 1000)
        if (cancelled) return
        if (highlight) {
          setSelected(true)
          await wait(450)
          if (cancelled) return
          setSelected(false)
        }
        setText("")
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
  }, [reduceMotion, wordsKey, hold, typeSpeed, highlight])

  return (
    <span
      data-slot="rewrite-text"
      className={cn("relative inline-flex items-baseline", className)}
      {...props}
    >
      <span className="sr-only">{words[0]}</span>
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
              initial={{ opacity: 0, y: "0.2em", filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              {ch}
            </motion.span>
          ))}
        </AnimatePresence>
      </span>
      {/* The caret glides with the text because of `layout`. */}
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
    </span>
  )
}
