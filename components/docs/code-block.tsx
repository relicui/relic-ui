"use client"

import { useEffect, useRef, useState } from "react"
import { AnimatePresence, MotionConfig, motion } from "motion/react"
import { Check, Copy, X } from "lucide-react"

import { cn } from "@/lib/utils"

type Status = "idle" | "copied" | "failed"

const RESET_AFTER = 2000
const EASE = [0.65, 0, 0.35, 1] as const

/**
 * Copies text to the clipboard. The modern Clipboard API only works on
 * https:// and localhost, so on other http:// addresses (like a local
 * network IP) we fall back to the older copy command.
 */
async function writeToClipboard(text: string) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text)
    return
  }
  const previousFocus = document.activeElement as HTMLElement | null
  const textarea = document.createElement("textarea")
  // Lets the site-wide copy toast know this copy is already handled.
  textarea.setAttribute("data-relic-copy", "")
  textarea.value = text
  textarea.setAttribute("readonly", "")
  textarea.style.position = "fixed"
  textarea.style.opacity = "0"
  document.body.appendChild(textarea)
  textarea.select()
  const ok = document.execCommand("copy")
  textarea.remove()
  previousFocus?.focus()
  if (!ok) throw new Error("Copy command was rejected")
}

/**
 * A code block with the Relic UI copy moment: a gold caret sweeps across
 * the code, leaving a selection highlight, while the button turns into
 * "Copied".
 */
export function CodeBlock({
  code,
  className,
}: {
  code: string
  className?: string
}) {
  const [status, setStatus] = useState<Status>("idle")
  // Bumped on every copy so the sweep replays even on repeated clicks.
  const [sweep, setSweep] = useState(0)
  const resetTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => () => clearTimeout(resetTimer.current), [])

  function show(next: Status) {
    clearTimeout(resetTimer.current)
    setStatus(next)
    if (next === "copied") setSweep((s) => s + 1)
    resetTimer.current = setTimeout(() => setStatus("idle"), RESET_AFTER)
  }

  // Copy button.
  async function copy() {
    try {
      await writeToClipboard(code)
      show("copied")
    } catch {
      show("failed")
    }
  }

  // Copying by hand (Ctrl+C, right-click → Copy) gets the same moment.
  // The browser does the actual copying; we only show the feedback.
  function handleNativeCopy() {
    if (document.getSelection()?.toString()) show("copied")
  }

  return (
    // "user": people who ask for reduced motion get instant changes instead.
    <MotionConfig reducedMotion="user">
      <div
        data-code-block
        onCopy={handleNativeCopy}
        className={cn("relative flex rounded-lg border bg-muted/40", className)}
      >
        {/* The code scrolls on its own, so it can never slide under the button. */}
        <pre className="max-h-[480px] min-w-0 flex-1 overflow-auto p-4 pr-2 font-mono text-sm leading-relaxed">
          <code>{code}</code>
        </pre>

        {/* The button's own lane on the right, lined up with the first line. */}
        <div className="relative w-11 shrink-0">
          {/* The sweep: a selection highlight drawn by a gold caret. */}
          <AnimatePresence>
            {status === "copied" && (
              <motion.div
                key={sweep}
                aria-hidden
                className="pointer-events-none absolute inset-0 overflow-hidden rounded-lg"
                exit={{ opacity: 0, transition: { duration: 0.35 } }}
              >
                <motion.div
                  className="absolute inset-y-0 left-0 bg-brand/15"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 0.5, ease: EASE }}
                />
                <motion.div
                  className="absolute inset-y-2 w-0.5 -translate-x-full rounded-full bg-brand"
                  initial={{ left: "0%", opacity: 1 }}
                  animate={{ left: "100%", opacity: [1, 1, 0] }}
                  transition={{ duration: 0.5, ease: EASE }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            layout
            type="button"
            onClick={copy}
            aria-label={
              status === "copied"
                ? "Copied"
                : status === "failed"
                  ? "Copy failed"
                  : "Copy to clipboard"
            }
            transition={{
              layout: { type: "spring", stiffness: 500, damping: 35 },
            }}
            className={cn(
              "absolute top-3.5 right-2 inline-flex h-7 min-w-7 items-center justify-center gap-1.5 overflow-hidden rounded-md border border-transparent px-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-border hover:bg-background hover:text-foreground",
              "outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
              status === "copied" &&
                "border-brand/40 bg-background text-foreground"
            )}
          >
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={status}
                className="inline-flex"
                initial={{
                  opacity: 0,
                  scale: 0.4,
                  rotate: -45,
                  filter: "blur(4px)",
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  rotate: 0,
                  filter: "blur(0px)",
                }}
                exit={{
                  opacity: 0,
                  scale: 0.4,
                  rotate: 45,
                  filter: "blur(4px)",
                }}
                transition={{ duration: 0.22 }}
              >
                {status === "copied" ? (
                  <Check className="size-3.5 text-brand" />
                ) : status === "failed" ? (
                  <X className="size-3.5 text-destructive" />
                ) : (
                  <Copy className="size-3.5" />
                )}
              </motion.span>
            </AnimatePresence>
            <AnimatePresence initial={false}>
              {status !== "idle" && (
                <motion.span
                  className="whitespace-nowrap"
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {status === "copied" ? "Copied" : "Copy failed"}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>

        <span role="status" className="sr-only">
          {status === "copied"
            ? "Copied to clipboard"
            : status === "failed"
              ? "Copy failed"
              : ""}
        </span>
      </div>
    </MotionConfig>
  )
}
