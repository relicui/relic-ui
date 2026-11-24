"use client"

/**
 * Relic UI · Suggestion Diff
 * https://relic-ui.vercel.app/docs/suggestion-diff
 *
 * Copyright (c) 2026 Shubham Tambe
 * Open source under the MIT License: https://relic-ui.vercel.app/license
 */

import { useMemo, useState } from "react"
import { AnimatePresence, MotionConfig, motion } from "motion/react"

import { cn } from "@/lib/utils"

type Op = { type: "same" | "del" | "add"; text: string }

const tokenize = (s: string) => s.split(/(\s+)/).filter(Boolean)

/** Word-level difference between two texts (longest common subsequence). */
function diffWords(a: string, b: string): Op[] {
  const x = tokenize(a)
  const y = tokenize(b)
  const dp = Array.from({ length: x.length + 1 }, () => new Array<number>(y.length + 1).fill(0))
  for (let i = x.length - 1; i >= 0; i--) {
    for (let j = y.length - 1; j >= 0; j--) {
      dp[i][j] = x[i] === y[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1])
    }
  }
  const ops: Op[] = []
  const push = (type: Op["type"], text: string) => {
    const last = ops[ops.length - 1]
    if (last && last.type === type) last.text += text
    else ops.push({ type, text })
  }
  let i = 0
  let j = 0
  while (i < x.length && j < y.length) {
    if (x[i] === y[j]) {
      push("same", x[i++])
      j++
    } else if (dp[i + 1][j] >= dp[i][j + 1]) push("del", x[i++])
    else push("add", y[j++])
  }
  while (i < x.length) push("del", x[i++])
  while (j < y.length) push("add", y[j++])
  return ops
}

export interface SuggestionDiffProps
  extends Omit<React.ComponentProps<"div">, "children"> {
  /** The text as it is now. */
  original: string
  /** The text the AI suggests. */
  suggestion: string
  onAccept?: () => void
  onReject?: () => void
  /** Show the Accept and Reject buttons. */
  showActions?: boolean
  /** Speed multiplier for the strike and typing animation. */
  speed?: number
  acceptLabel?: string
  rejectLabel?: string
}

/**
 * An AI edit shown inside the text itself: removed words are struck through,
 * new words type themselves in, and you accept or reject right there.
 */
export function SuggestionDiff({
  original,
  suggestion,
  onAccept,
  onReject,
  showActions = true,
  speed = 1,
  acceptLabel = "Accept",
  rejectLabel = "Reject",
  className,
  ...props
}: SuggestionDiffProps) {
  const [status, setStatus] = useState<"pending" | "accepted" | "rejected">("pending")
  const ops = useMemo(() => diffWords(original, suggestion), [original, suggestion])
  const pace = 1 / Math.max(speed, 0.1)

  // Strikes happen first, one after another; typing starts once they're done.
  const deletions = ops.filter((op) => op.type === "del").length
  const typingStart = 0.25 + deletions * 0.12 * pace
  const typedChars = ops
    .filter((op) => op.type === "add")
    .reduce((n, op) => n + op.text.length, 0)
  const actionsAt = typingStart + typedChars * 0.025 * pace + 0.15

  // Each deletion's order and each insertion's first character, worked out once.
  const order = useMemo(() => {
    const list: { del: number; char: number }[] = []
    let del = 0
    let char = 0
    for (const op of ops) {
      list.push({ del: op.type === "del" ? del : -1, char })
      if (op.type === "del") del += 1
      if (op.type === "add") char += op.text.length
    }
    return list
  }, [ops])

  return (
    <MotionConfig reducedMotion="user">
      <div
        role="group"
        aria-label="Suggested edit"
        data-slot="suggestion-diff"
        data-state={status}
        className={cn("text-sm leading-relaxed", className)}
        {...props}
      >
        <p>
          <AnimatePresence initial={false} mode="popLayout">
            {ops.map((op, k) => {
              if (op.type === "same") return <span key={k}>{op.text}</span>

              if (op.type === "del") {
                if (status === "accepted") return null
                const delay = 0.25 + order[k].del * 0.12 * pace
                return (
                  <motion.del
                    key={k}
                    exit={{ opacity: 0, filter: "blur(4px)", transition: { duration: 0.25 } }}
                    className={cn(
                      "relative rounded-[3px] no-underline transition-colors duration-300",
                      status === "pending" && "bg-destructive/10 text-muted-foreground"
                    )}
                  >
                    {op.text}
                    {status === "pending" && (
                      <motion.span
                        aria-hidden
                        className="absolute inset-x-0 top-1/2 h-px origin-left bg-destructive"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ delay, duration: 0.3 * pace, ease: "easeOut" }}
                      />
                    )}
                  </motion.del>
                )
              }

              if (status === "rejected") return null
              const start = order[k].char
              return (
                <motion.ins
                  key={k}
                  exit={{ opacity: 0, filter: "blur(4px)", transition: { duration: 0.25 } }}
                  className={cn(
                    "rounded-[3px] no-underline transition-colors duration-300",
                    status === "pending" && "bg-primary/10"
                  )}
                >
                  {Array.from(op.text).map((ch, c) => (
                    <motion.span
                      key={c}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: typingStart + (start + c) * 0.025 * pace, duration: 0.12 }}
                    >
                      {ch}
                    </motion.span>
                  ))}
                </motion.ins>
              )
            })}
          </AnimatePresence>
        </p>

        <div className="mt-3 flex h-8 items-center gap-2">
          {status === "pending" && showActions && (
            <motion.div
              className="flex gap-2"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: actionsAt, duration: 0.25 }}
            >
              <button
                type="button"
                onClick={() => {
                  setStatus("accepted")
                  onAccept?.()
                }}
                className="inline-flex h-8 items-center rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground transition-colors outline-none hover:bg-primary/90 focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {acceptLabel}
              </button>
              <button
                type="button"
                onClick={() => {
                  setStatus("rejected")
                  onReject?.()
                }}
                className="inline-flex h-8 items-center rounded-md border px-3 text-xs font-medium transition-colors outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {rejectLabel}
              </button>
            </motion.div>
          )}
          {status !== "pending" && (
            <motion.span
              role="status"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-muted-foreground"
            >
              {status === "accepted" ? "Suggestion accepted" : "Suggestion rejected"}
            </motion.span>
          )}
        </div>
      </div>
    </MotionConfig>
  )
}
