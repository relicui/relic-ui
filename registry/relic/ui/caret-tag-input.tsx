"use client"

/**
 * Relic UI · Caret Tag Input
 * https://relic-ui.vercel.app/docs/caret-tag-input
 *
 * Copyright (c) 2026 Shubham Tambe
 * Open source under the MIT License: https://relic-ui.vercel.app/license
 */

import { useLayoutEffect, useRef, useState } from "react"
import {
  AnimatePresence,
  MotionConfig,
  animate,
  motion,
  useReducedMotion,
} from "motion/react"

import { cn } from "@/lib/utils"

export interface CaretTagInputProps {
  /** The tags (controlled). */
  value?: string[]
  /** The tags at first (uncontrolled). */
  defaultValue?: string[]
  onValueChange?: (tags: string[]) => void
  placeholder?: string
  /** Most tags allowed. */
  max?: number
  /** Keys that turn the typed text into a tag. */
  separators?: string[]
  /** Accessible name for the input. */
  label?: string
  /** Name for form submission. Tags are sent comma-separated. */
  name?: string
  disabled?: boolean
  className?: string
}

/**
 * A tag field where every tag is born from the caret: press Enter and the
 * word you typed lifts out of the input and flies into place as a chip.
 */
export function CaretTagInput({
  value: valueProp,
  defaultValue = [],
  onValueChange,
  placeholder = "Add a tag…",
  max,
  separators = ["Enter", ","],
  label = "Tags",
  name,
  disabled,
  className,
}: CaretTagInputProps) {
  const [internal, setInternal] = useState(defaultValue)
  const tags = valueProp ?? internal
  const [draft, setDraft] = useState("")
  const [announcement, setAnnouncement] = useState("")
  const reduceMotion = useReducedMotion()

  const inputRef = useRef<HTMLInputElement>(null)
  const chips = useRef(new Map<string, HTMLSpanElement>())
  // Where the new tag should fly from: the start of the typed text.
  const flight = useRef<{ tag: string; x: number; y: number } | null>(null)

  function update(next: string[]) {
    if (valueProp === undefined) setInternal(next)
    onValueChange?.(next)
  }

  function shake(el: Element | null | undefined) {
    if (!el || reduceMotion) return
    animate(el, { x: [0, -5, 5, -3, 3, 0] }, { duration: 0.35 })
  }

  function commit() {
    const tag = draft.trim()
    if (!tag) return
    if (tags.includes(tag)) {
      // Already there: wiggle the existing chip instead of adding a copy.
      shake(chips.current.get(tag))
      return
    }
    if (max !== undefined && tags.length >= max) {
      shake(inputRef.current?.parentElement)
      return
    }
    const input = inputRef.current
    if (input) {
      const rect = input.getBoundingClientRect()
      const paddingLeft = parseFloat(getComputedStyle(input).paddingLeft) || 0
      flight.current = {
        tag,
        x: rect.left + paddingLeft,
        y: rect.top + rect.height / 2,
      }
    }
    update([...tags, tag])
    setDraft("")
    setAnnouncement(`Added ${tag}`)
  }

  function remove(tag: string) {
    update(tags.filter((t) => t !== tag))
    setAnnouncement(`Removed ${tag}`)
    inputRef.current?.focus()
  }

  // Fly the newest chip from the caret to its place (a hand-made FLIP).
  useLayoutEffect(() => {
    const pending = flight.current
    if (!pending) return
    flight.current = null
    const chip = chips.current.get(pending.tag)
    if (!chip || reduceMotion) return
    const rect = chip.getBoundingClientRect()
    animate(
      chip,
      {
        x: [pending.x - rect.left, 0],
        y: [pending.y - (rect.top + rect.height / 2), 0],
        scale: [0.85, 1],
        opacity: [0.4, 1],
      },
      { type: "spring", stiffness: 420, damping: 30 }
    )
  }, [tags, reduceMotion])

  return (
    <MotionConfig reducedMotion="user">
      <div
        data-slot="caret-tag-input"
        onClick={() => inputRef.current?.focus()}
        className={cn(
          "flex min-h-10 w-full cursor-text flex-wrap items-center gap-1.5 rounded-lg border bg-background px-2 py-1.5 text-sm shadow-xs transition-[box-shadow,border-color]",
          "has-[input:focus-visible]:border-ring has-[input:focus-visible]:ring-3 has-[input:focus-visible]:ring-ring/50",
          disabled && "pointer-events-none opacity-50",
          className
        )}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {tags.map((tag) => (
            <motion.span
              key={tag}
              layout
              ref={(el) => {
                if (el) chips.current.set(tag, el)
                else chips.current.delete(tag)
              }}
              exit={{ opacity: 0, scale: 0.7, filter: "blur(3px)", transition: { duration: 0.15 } }}
              transition={{ layout: { type: "spring", stiffness: 500, damping: 36 } }}
              className="inline-flex h-7 items-center gap-1 rounded-md bg-secondary pr-1 pl-2 text-secondary-foreground"
            >
              {tag}
              <button
                type="button"
                aria-label={`Remove ${tag}`}
                onClick={(e) => {
                  e.stopPropagation()
                  remove(tag)
                }}
                className="inline-flex size-5 items-center justify-center rounded text-muted-foreground transition-colors outline-none hover:bg-background/60 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
              >
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" className="size-3">
                  <path d="M4 4l8 8M12 4l-8 8" />
                </svg>
              </button>
            </motion.span>
          ))}
        </AnimatePresence>

        <input
          ref={inputRef}
          aria-label={label}
          value={draft}
          disabled={disabled}
          placeholder={tags.length === 0 ? placeholder : ""}
          onChange={(e) => setDraft(e.target.value.replace(",", ""))}
          onKeyDown={(e) => {
            if (separators.includes(e.key)) {
              e.preventDefault()
              commit()
            } else if (e.key === "Backspace" && !draft && tags.length) {
              remove(tags[tags.length - 1])
            }
          }}
          onBlur={commit}
          className="h-7 min-w-24 flex-1 bg-transparent px-1 outline-none placeholder:text-muted-foreground"
        />

        {name && <input type="hidden" name={name} value={tags.join(",")} />}
        <span role="status" className="sr-only">
          {announcement}
        </span>
      </div>
    </MotionConfig>
  )
}
