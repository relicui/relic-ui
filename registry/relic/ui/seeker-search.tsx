"use client"

/**
 * Relic UI · Seeker Search
 * https://relic-ui.vercel.app/docs/seeker-search
 *
 * Copyright (c) 2026 Shubham Tambe
 * Open source under the MIT License: https://relic-ui.vercel.app/license
 */

import { useEffect, useId, useMemo, useRef, useState } from "react"
import {
  AnimatePresence,
  MotionConfig,
  motion,
  useReducedMotion,
} from "motion/react"

import { cn } from "@/lib/utils"

export type SeekerItem = {
  value: string
  label: string
  description?: string
  /** Extra words that should also match, e.g. ["toggle", "on off"]. */
  keywords?: string[]
}

export interface SeekerSearchProps {
  items: SeekerItem[]
  /** Suggestions the placeholder types out, one after another. */
  placeholders?: string[]
  onSelect?: (item: SeekerItem) => void
  /** Shown when nothing matches. */
  emptyText?: string
  maxResults?: number
  /** Key that focuses the search from anywhere on the page. Empty to turn off. */
  shortcut?: string
  /** Accessible name for the input. */
  label?: string
  className?: string
}

/* -------------------------------------------------------------------------- */
/*                                   Helpers                                  */
/* -------------------------------------------------------------------------- */

function rank(item: SeekerItem, query: string) {
  const q = query.toLowerCase()
  const label = item.label.toLowerCase()
  if (label.startsWith(q)) return 0
  if (label.includes(q)) return 1
  if (item.keywords?.some((k) => k.toLowerCase().includes(q))) return 2
  if (item.description?.toLowerCase().includes(q)) return 3
  return -1
}

/** Wraps the part of `text` that matches `query` in a highlight. */
function Highlight({ text, query }: { text: string; query: string }) {
  const at = text.toLowerCase().indexOf(query.toLowerCase())
  if (!query || at === -1) return <>{text}</>
  return (
    <>
      {text.slice(0, at)}
      <mark className="rounded-[3px] bg-primary/15 px-px text-foreground">
        {text.slice(at, at + query.length)}
      </mark>
      {text.slice(at + query.length)}
    </>
  )
}

/** Types, holds and deletes each phrase in turn, like a person would. */
function useTypewriter(phrases: string[], active: boolean) {
  const [text, setText] = useState("")
  const key = phrases.join("\u0000")

  useEffect(() => {
    const list = key.split("\u0000").filter(Boolean)
    if (!active || list.length === 0) return
    let cancelled = false
    const timers: ReturnType<typeof setTimeout>[] = []
    const wait = (ms: number) =>
      new Promise<void>((resolve) => timers.push(setTimeout(resolve, ms)))

    async function run() {
      let index = 0
      while (!cancelled) {
        const phrase = list[index]
        for (let n = 1; n <= phrase.length; n++) {
          if (cancelled) return
          setText(phrase.slice(0, n))
          await wait(55 + Math.random() * 45)
        }
        await wait(1800)
        for (let n = phrase.length - 1; n >= 0; n--) {
          if (cancelled) return
          setText(phrase.slice(0, n))
          await wait(28)
        }
        await wait(300)
        index = (index + 1) % list.length
      }
    }

    run()
    return () => {
      cancelled = true
      timers.forEach(clearTimeout)
    }
  }, [key, active])

  return text
}

/* -------------------------------------------------------------------------- */
/*                                  Component                                 */
/* -------------------------------------------------------------------------- */

/**
 * A search box whose placeholder types its own suggestions. Results unfold
 * one after another, matches are highlighted, and everything works from the
 * keyboard (↑ ↓ Enter Esc, plus a shortcut key to jump in).
 */
export function SeekerSearch({
  items,
  placeholders = ["Search…"],
  onSelect,
  emptyText = "Nothing found.",
  maxResults = 6,
  shortcut = "/",
  label = "Search",
  className,
}: SeekerSearchProps) {
  const id = useId()
  const listId = `${id}-list`
  const inputRef = useRef<HTMLInputElement>(null)
  const reduceMotion = useReducedMotion()
  const [query, setQuery] = useState("")
  const [focused, setFocused] = useState(false)
  const [active, setActive] = useState(0)

  const typed = useTypewriter(placeholders, !query && !focused && !reduceMotion)
  const ghost = reduceMotion || focused ? (placeholders[0] ?? "") : typed

  const results = useMemo(() => {
    const q = query.trim()
    if (!q) return []
    return items
      .map((item) => ({ item, score: rank(item, q) }))
      .filter((r) => r.score >= 0)
      .sort((a, b) => a.score - b.score)
      .slice(0, maxResults)
      .map((r) => r.item)
  }, [items, query, maxResults])

  const open = focused && query.trim().length > 0
  const activeIndex = Math.min(active, Math.max(results.length - 1, 0))

  // A shortcut key focuses the search, unless you're already typing somewhere.
  useEffect(() => {
    if (!shortcut) return
    function handleKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null
      const typing =
        target?.isContentEditable ||
        ["INPUT", "TEXTAREA", "SELECT"].includes(target?.tagName ?? "")
      if (e.key === shortcut && !typing && !e.metaKey && !e.ctrlKey) {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    document.addEventListener("keydown", handleKey)
    return () => document.removeEventListener("keydown", handleKey)
  }, [shortcut])

  function choose(item: SeekerItem) {
    onSelect?.(item)
    setQuery("")
    setActive(0)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown" && results.length) {
      e.preventDefault()
      setActive((activeIndex + 1) % results.length)
    } else if (e.key === "ArrowUp" && results.length) {
      e.preventDefault()
      setActive((activeIndex - 1 + results.length) % results.length)
    } else if (e.key === "Enter" && results[activeIndex]) {
      e.preventDefault()
      choose(results[activeIndex])
    } else if (e.key === "Escape") {
      if (query) setQuery("")
      else inputRef.current?.blur()
    }
  }

  return (
    <MotionConfig reducedMotion="user">
      <div data-slot="seeker-search" className={cn("relative w-full", className)}>
        <div className="relative flex h-11 items-center rounded-xl border bg-background shadow-xs transition-[box-shadow,border-color] has-[input:focus-visible]:border-ring has-[input:focus-visible]:ring-3 has-[input:focus-visible]:ring-ring/50">
          <svg
            aria-hidden
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            className="ml-3.5 size-4 shrink-0 text-muted-foreground"
          >
            <circle cx="7" cy="7" r="4.5" />
            <path d="M10.5 10.5L14 14" />
          </svg>
          <input
            ref={inputRef}
            role="combobox"
            aria-label={label}
            aria-expanded={open}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={
              open && results[activeIndex] ? `${id}-option-${activeIndex}` : undefined
            }
            autoComplete="off"
            spellCheck={false}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setActive(0)
            }}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyDown={handleKeyDown}
            className="peer h-full min-w-0 flex-1 bg-transparent px-3 text-sm outline-none"
          />

          {/* The placeholder that types itself. */}
          {!query && (
            <span
              aria-hidden
              className="pointer-events-none absolute inset-y-0 left-10 flex items-center text-sm text-muted-foreground"
            >
              {ghost}
              {!focused && !reduceMotion && (
                <span className="ml-px inline-block h-4 w-px animate-pulse bg-primary" />
              )}
            </span>
          )}

          {shortcut && !focused && !query && (
            <kbd className="mr-3 rounded-md border bg-muted px-1.5 font-mono text-[11px] text-muted-foreground">
              {shortcut}
            </kbd>
          )}
        </div>

        <AnimatePresence>
          {open && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.98, transition: { duration: 0.12 } }}
              transition={{ type: "spring", stiffness: 500, damping: 34 }}
              className="absolute inset-x-0 top-full z-50 mt-2 origin-top overflow-hidden rounded-xl border bg-popover p-1 text-popover-foreground shadow-lg"
            >
              <ul id={listId} role="listbox" aria-label={label}>
                {results.map((item, i) => (
                  <motion.li
                    key={item.value}
                    id={`${id}-option-${i}`}
                    role="option"
                    aria-selected={i === activeIndex}
                    initial={{ opacity: 0, y: -4, filter: "blur(4px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{ delay: i * 0.035, duration: 0.2 }}
                    onMouseDown={(e) => e.preventDefault()}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => choose(item)}
                    className={cn(
                      "relative flex cursor-pointer flex-col rounded-lg px-3 py-2 text-sm",
                      i === activeIndex ? "bg-accent text-accent-foreground" : ""
                    )}
                  >
                    {i === activeIndex && (
                      <motion.span
                        layoutId={`${id}-marker`}
                        className="absolute top-2 bottom-2 left-0 w-0.5 rounded-full bg-primary"
                        transition={{ type: "spring", stiffness: 600, damping: 40 }}
                      />
                    )}
                    <span className="font-medium">
                      <Highlight text={item.label} query={query.trim()} />
                    </span>
                    {item.description && (
                      <span className="text-xs text-muted-foreground/80">
                        {item.description}
                      </span>
                    )}
                  </motion.li>
                ))}
                {results.length === 0 && (
                  <li className="px-3 py-6 text-center text-sm text-muted-foreground">
                    {emptyText}
                  </li>
                )}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MotionConfig>
  )
}
