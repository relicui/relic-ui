"use client"

/**
 * Relic UI · Citation Peek
 * https://relic-ui.vercel.app/docs/citation-peek
 *
 * Copyright (c) 2026 Shubham Tambe
 * Open source under the MIT License: https://relic-ui.vercel.app/license
 */

import { useEffect, useId, useMemo, useRef, useState } from "react"
import { AnimatePresence, MotionConfig, motion } from "motion/react"

import { cn } from "@/lib/utils"

export type Citation = {
  title: string
  url?: string
  /** Where it's from, e.g. "MDN". Defaults to the URL's domain. */
  source?: string
  /** A short quote from the source. */
  snippet?: string
}

type Segment = { kind: "text"; text: string } | { kind: "cite"; n: number }

/** Sentences, each split into text and [n] markers. */
function parse(text: string): Segment[][] {
  return text.split(/(?<=[.!?])\s+/).map((sentence) =>
    sentence
      .split(/(\[\d+\])/)
      .filter(Boolean)
      .map((part): Segment => {
        const match = part.match(/^\[(\d+)\]$/)
        return match ? { kind: "cite", n: Number(match[1]) } : { kind: "text", text: part }
      })
  )
}

function domainOf(c: Citation) {
  if (c.source) return c.source
  try {
    return c.url ? new URL(c.url).hostname.replace(/^www\./, "") : "Source"
  } catch {
    return "Source"
  }
}

export interface CitationPeekProps {
  /** The answer. Mark sources with [1], [2] … matching the citations list. */
  text: string
  citations: Citation[]
  /** Open source cards on hover, or on click. */
  trigger?: "hover" | "click"
  /** How the markers look. */
  marker?: "number" | "dot" | "pill"
  /** Where the card unfolds. */
  placement?: "top" | "bottom"
  /** Light up the sentence the open source supports. */
  highlightSentence?: boolean
  /** The open citation number (controlled), or null for none. */
  active?: number | null
  onActiveChange?: (active: number | null) => void
  className?: string
}

/**
 * An AI answer with its sources. Point at a citation and its source card
 * unfolds above it, while the sentence it supports lights up.
 */
export function CitationPeek({
  text,
  citations,
  trigger = "hover",
  marker = "number",
  placement = "top",
  highlightSentence = true,
  active: activeProp,
  onActiveChange,
  className,
}: CitationPeekProps) {
  const id = useId()
  const sentences = useMemo(() => parse(text), [text])
  const [internal, setInternal] = useState<number | null>(null)
  const active = activeProp === undefined ? internal : activeProp
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const rootRef = useRef<HTMLDivElement>(null)

  function setActive(next: number | null) {
    clearTimeout(closeTimer.current)
    if (activeProp === undefined) setInternal(next)
    onActiveChange?.(next)
  }
  function closeSoon() {
    clearTimeout(closeTimer.current)
    closeTimer.current = setTimeout(() => setActive(null), 160)
  }

  // Click mode: clicking elsewhere closes the card. Esc always does.
  useEffect(() => {
    if (active === null) return
    function onDown(e: PointerEvent) {
      if (trigger === "click" && !rootRef.current?.contains(e.target as Node)) setActive(null)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setActive(null)
    }
    document.addEventListener("pointerdown", onDown)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("pointerdown", onDown)
      document.removeEventListener("keydown", onKey)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, trigger])

  useEffect(() => () => clearTimeout(closeTimer.current), [])

  return (
    <MotionConfig reducedMotion="user">
      <div ref={rootRef} data-slot="citation-peek" className={cn("w-full text-sm leading-relaxed", className)}>
        <p>
          {sentences.map((segments, s) => {
            const lit = highlightSentence && active !== null && segments.some((seg) => seg.kind === "cite" && seg.n === active)
            return (
              <span key={s}>
                {s > 0 && " "}
                <span className={cn("rounded-[3px] transition-colors duration-300", lit && "bg-primary/10")}>
                  {segments.map((seg, k) => {
                    if (seg.kind === "text") return <span key={k}>{seg.text}</span>
                    const citation = citations[seg.n - 1]
                    if (!citation) return null
                    const open = active === seg.n
                    const cardId = `${id}-source-${seg.n}`
                    return (
                      <span
                        key={k}
                        className="relative inline-block align-baseline"
                        onPointerEnter={trigger === "hover" ? () => setActive(seg.n) : undefined}
                        onPointerLeave={trigger === "hover" ? closeSoon : undefined}
                      >
                        <button
                          type="button"
                          aria-label={`Source ${seg.n}: ${citation.title}`}
                          aria-expanded={open}
                          aria-controls={cardId}
                          onClick={() => setActive(open ? null : seg.n)}
                          onFocus={trigger === "hover" ? () => setActive(seg.n) : undefined}
                          className={cn(
                            "mx-0.5 inline-flex -translate-y-0.5 items-center justify-center align-middle font-mono text-[10px] font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                            marker === "number" && "h-4 min-w-4 rounded px-1",
                            marker === "dot" && "size-2.5 rounded-full",
                            marker === "pill" && "h-4.5 rounded-full px-1.5",
                            open
                              ? "bg-primary text-primary-foreground"
                              : marker === "dot"
                                ? "bg-muted-foreground/50 hover:bg-primary"
                                : "bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground"
                          )}
                        >
                          {marker === "number" ? seg.n : marker === "pill" ? domainOf(citation) : null}
                        </button>

                        <AnimatePresence>
                          {open && (
                            <motion.span
                              id={cardId}
                              role="dialog"
                              aria-label={`Source ${seg.n}`}
                              onPointerEnter={trigger === "hover" ? () => clearTimeout(closeTimer.current) : undefined}
                              onPointerLeave={trigger === "hover" ? closeSoon : undefined}
                              initial={{ opacity: 0, rotateX: placement === "top" ? 35 : -35, scale: 0.96 }}
                              animate={{ opacity: 1, rotateX: 0, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.12 } }}
                              transition={{ type: "spring", stiffness: 420, damping: 30 }}
                              style={{ transformOrigin: placement === "top" ? "bottom center" : "top center", transformPerspective: 600 }}
                              className={cn(
                                "absolute left-1/2 z-50 block w-64 -translate-x-1/2 rounded-xl border bg-popover p-3 text-left text-popover-foreground shadow-lg",
                                placement === "top" ? "bottom-full mb-2" : "top-full mt-2"
                              )}
                            >
                              <span className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span className="flex size-5 items-center justify-center rounded-md bg-muted font-mono text-[10px] font-semibold text-foreground uppercase">
                                  {domainOf(citation).charAt(0)}
                                </span>
                                <span className="truncate">{domainOf(citation)}</span>
                                <span className="ml-auto font-mono">[{seg.n}]</span>
                              </span>
                              <span className="mt-2 block line-clamp-2 font-medium">{citation.title}</span>
                              {citation.snippet && (
                                <span className="mt-1 block line-clamp-3 text-xs text-muted-foreground">“{citation.snippet}”</span>
                              )}
                              {citation.url && (
                                <a
                                  href={citation.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="mt-2 inline-flex items-center gap-1 text-xs font-medium underline-offset-4 hover:underline"
                                >
                                  Open source ↗
                                </a>
                              )}
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </span>
                    )
                  })}
                </span>
              </span>
            )
          })}
        </p>
      </div>
    </MotionConfig>
  )
}
