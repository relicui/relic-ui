"use client"

import { useEffect, useRef, useState } from "react"
import { AnimatePresence, MotionConfig, motion } from "motion/react"

const SHOW_FOR = 1800

/** The text being copied: the page selection, or the selected part of an input. */
function copiedText() {
  const selection = document.getSelection()?.toString() ?? ""
  if (selection) return selection
  const el = document.activeElement
  if (
    (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) &&
    el.selectionStart !== null &&
    el.selectionEnd !== null &&
    el.type !== "password"
  ) {
    return el.value.slice(el.selectionStart, el.selectionEnd)
  }
  return ""
}

/**
 * Site-wide copy feedback: whenever someone copies text anywhere on the
 * site (Ctrl+C, right-click → Copy, …), a small toast with a blinking gold
 * caret confirms it. Code blocks show their own effect, so they're skipped.
 */
export function CopyToast() {
  const [count, setCount] = useState<number | null>(null)
  // Bumped on every copy so repeated copies give a small pulse.
  const [pulse, setPulse] = useState(0)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => {
    function handleCopy(e: ClipboardEvent) {
      const target = e.target instanceof Element ? e.target : null
      // Code blocks (and their copy button) have their own animation.
      if (target?.closest("[data-code-block], [data-relic-copy]")) return
      const text = copiedText()
      if (!text) return

      setCount(Array.from(text).length)
      setPulse((p) => p + 1)
      clearTimeout(timer.current)
      timer.current = setTimeout(() => setCount(null), SHOW_FOR)
    }

    document.addEventListener("copy", handleCopy)
    return () => {
      document.removeEventListener("copy", handleCopy)
      clearTimeout(timer.current)
    }
  }, [])

  return (
    <MotionConfig reducedMotion="user">
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4"
      >
        <AnimatePresence>
          {count !== null && (
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.96, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: 8, scale: 0.98, filter: "blur(4px)" }}
              transition={{ type: "spring", stiffness: 420, damping: 30 }}
              className="flex items-center gap-2.5 rounded-full border bg-background/90 py-2 pr-4 pl-3 text-sm shadow-lg backdrop-blur"
            >
              <motion.span
                key={pulse}
                aria-hidden
                className="h-4 w-0.5 rounded-full bg-brand"
                initial={{ scaleY: 0.3 }}
                animate={{ scaleY: [0.3, 1.25, 1], opacity: [1, 1, 1, 0, 0, 1] }}
                transition={{
                  scaleY: { duration: 0.35, ease: "easeOut" },
                  opacity: { duration: 1.1, repeat: Infinity, delay: 0.35 },
                }}
              />
              <span className="font-medium">Copied</span>
              <span className="text-muted-foreground">
                · {count} {count === 1 ? "character" : "characters"}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MotionConfig>
  )
}
