"use client"

/**
 * Relic UI · Stretch Tabs
 * https://relic-ui.vercel.app/docs/stretch-tabs
 *
 * Copyright (c) 2026 Shubham Tambe
 * Open source under the MIT License: https://relic-ui.vercel.app/license
 */

import { useLayoutEffect, useRef, useState } from "react"
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react"

import { cn } from "@/lib/utils"

export type StretchTabsItem = {
  value: string
  label: React.ReactNode
}

const VARIANTS = {
  pill: {
    list: "rounded-lg bg-muted p-1",
    indicator:
      "inset-y-1 rounded-md bg-background shadow-sm ring-1 ring-foreground/5 dark:bg-input/50",
  },
  underline: {
    list: "gap-1 border-b",
    indicator: "-bottom-px h-0.5 rounded-full bg-foreground",
  },
} as const

const SIZES = {
  sm: "h-7 px-2.5 text-xs",
  default: "h-8 px-3 text-sm",
  lg: "h-10 px-4 text-sm",
} as const

type Spring = { type: "spring"; stiffness: number; damping: number }

// The leading edge moves fast and the trailing edge follows slowly,
// which makes the indicator stretch in the direction of travel.
const STRETCH = {
  subtle: {
    lead: { type: "spring", stiffness: 500, damping: 40 },
    trail: { type: "spring", stiffness: 380, damping: 36 },
  },
  normal: {
    lead: { type: "spring", stiffness: 520, damping: 38 },
    trail: { type: "spring", stiffness: 240, damping: 28 },
  },
  elastic: {
    lead: { type: "spring", stiffness: 600, damping: 30 },
    trail: { type: "spring", stiffness: 150, damping: 16 },
  },
} as const satisfies Record<string, { lead: Spring; trail: Spring }>

export interface StretchTabsProps
  extends Omit<React.ComponentProps<"div">, "defaultValue" | "onChange"> {
  items: StretchTabsItem[]
  /** The selected tab (controlled). */
  value?: string
  /** The tab selected at first (uncontrolled). */
  defaultValue?: string
  onValueChange?: (value: string) => void
  /** Look of the tabs and indicator. */
  variant?: keyof typeof VARIANTS
  /** Height, padding and text size of each tab. */
  size?: keyof typeof SIZES
  /** How much the indicator stretches while moving. */
  stretch?: keyof typeof STRETCH
}

export function StretchTabs({
  items,
  value: valueProp,
  defaultValue,
  onValueChange,
  variant = "pill",
  size = "default",
  stretch = "normal",
  className,
  ...props
}: StretchTabsProps) {
  const [internalValue, setInternalValue] = useState(
    defaultValue ?? items[0]?.value
  )
  const value = valueProp ?? internalValue

  const listRef = useRef<HTMLDivElement>(null)
  const tabRefs = useRef(new Map<string, HTMLButtonElement>())
  const valueRef = useRef(value)
  const measured = useRef(false)

  const left = useMotionValue(0)
  const right = useMotionValue(0)
  const width = useTransform([left, right], ([l, r]: number[]) => r - l)
  const reduceMotion = useReducedMotion()

  function select(next: string) {
    if (valueProp === undefined) setInternalValue(next)
    onValueChange?.(next)
  }

  // Move the indicator when the selected tab changes.
  useLayoutEffect(() => {
    valueRef.current = value
    const tab = tabRefs.current.get(value)
    if (!tab) return

    const nextLeft = tab.offsetLeft
    const nextRight = nextLeft + tab.offsetWidth

    if (!measured.current || reduceMotion) {
      measured.current = true
      left.jump(nextLeft)
      right.jump(nextRight)
      return
    }

    const { lead, trail } = STRETCH[stretch]
    const movingRight = nextLeft > left.get()
    const leftAnim = animate(left, nextLeft, movingRight ? trail : lead)
    const rightAnim = animate(right, nextRight, movingRight ? lead : trail)
    return () => {
      leftAnim.stop()
      rightAnim.stop()
    }
  }, [value, reduceMotion, stretch, left, right])

  // Snap into place (no animation) when the layout changes size,
  // including when the size or variant changes.
  useLayoutEffect(() => {
    const list = listRef.current
    if (!list) return
    const snap = () => {
      const tab = tabRefs.current.get(valueRef.current)
      if (!tab) return
      left.jump(tab.offsetLeft)
      right.jump(tab.offsetLeft + tab.offsetWidth)
    }
    snap()
    const observer = new ResizeObserver(snap)
    observer.observe(list)
    return () => observer.disconnect()
  }, [left, right, size, variant])

  function handleKeyDown(e: React.KeyboardEvent, index: number) {
    const last = items.length - 1
    const next =
      e.key === "ArrowRight"
        ? index === last ? 0 : index + 1
        : e.key === "ArrowLeft"
          ? index === 0 ? last : index - 1
          : e.key === "Home"
            ? 0
            : e.key === "End"
              ? last
              : -1
    if (next === -1) return
    e.preventDefault()
    const item = items[next]
    select(item.value)
    tabRefs.current.get(item.value)?.focus()
  }

  return (
    <div
      ref={listRef}
      role="tablist"
      data-slot="stretch-tabs"
      data-variant={variant}
      className={cn(
        "relative inline-flex items-center",
        VARIANTS[variant].list,
        className
      )}
      {...props}
    >
      <motion.span
        aria-hidden
        className={cn("absolute left-0", VARIANTS[variant].indicator)}
        style={{ x: left, width }}
      />
      {items.map((item, index) => {
        const selected = item.value === value
        return (
          <button
            key={item.value}
            ref={(el) => {
              if (el) tabRefs.current.set(item.value, el)
              else tabRefs.current.delete(item.value)
            }}
            type="button"
            role="tab"
            aria-selected={selected}
            tabIndex={selected ? 0 : -1}
            data-state={selected ? "active" : "inactive"}
            onClick={() => select(item.value)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={cn(
              "relative z-10 inline-flex items-center gap-1.5 rounded-md font-medium whitespace-nowrap transition-colors",
              "outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
              SIZES[size],
              selected
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {item.label}
          </button>
        )
      })}
    </div>
  )
}
