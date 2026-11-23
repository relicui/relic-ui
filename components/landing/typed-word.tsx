"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"

const HOLD = 2400 // how long each word stays
const SELECT = 450 // how long the "select all" highlight shows
const PAUSE = 320 // gap after deleting, before typing
const KEY = 70 // base time per typed letter

/**
 * A word that rewrites itself like someone editing text: the caret selects
 * it, the letters blur away, and the next word is typed in.
 */
export function TypedWord({
  words,
  className,
}: {
  words: string[]
  className?: string
}) {
  const reduceMotion = useReducedMotion()
  const [text, setText] = useState(words[0])
  const [selected, setSelected] = useState(false)
  // Bumped for every new word so its letters get fresh keys and animate in.
  const [round, setRound] = useState(0)

  useEffect(() => {
    if (reduceMotion || words.length < 2) return
    let cancelled = false
    const timers: ReturnType<typeof setTimeout>[] = []
    const wait = (ms: number) =>
      new Promise<void>((resolve) => timers.push(setTimeout(resolve, ms)))

    async function run() {
      let index = 0
      while (!cancelled) {
        await wait(HOLD)
        if (cancelled) return
        setSelected(true)
        await wait(SELECT)
        if (cancelled) return
        setSelected(false)
        setText("")
        setRound((r) => r + 1)
        await wait(PAUSE)

        index = (index + 1) % words.length
        const word = words[index]
        for (let n = 1; n <= word.length; n++) {
          if (cancelled) return
          setText(word.slice(0, n))
          // A little irregular, like real typing.
          await wait(KEY + Math.random() * 60)
        }
      }
    }

    run()
    return () => {
      cancelled = true
      timers.forEach(clearTimeout)
    }
  }, [reduceMotion, words])

  return (
    <span className={cn("relative inline-flex items-baseline", className)}>
      <span
        className={cn(
          "relative inline-flex rounded-lg px-[0.04em] transition-colors duration-200",
          selected ? "bg-primary/15" : "bg-transparent"
        )}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {Array.from(text).map((ch, i) => (
            <motion.span
              key={`${round}-${i}`}
              className="inline-block"
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
        className="ml-[0.06em] inline-block h-[0.82em] w-[0.055em] translate-y-[0.08em] self-center rounded-full bg-brand"
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
