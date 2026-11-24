"use client"

/**
 * Relic UI · Fold Accordion
 * https://relic-ui.vercel.app/docs/fold-accordion
 *
 * Copyright (c) 2026 Shubham Tambe
 * Open source under the MIT License: https://relic-ui.vercel.app/license
 */

import { useId, useRef, useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"

export type FoldAccordionItem = {
  value: string
  title: React.ReactNode
  content: React.ReactNode
}

const VARIANTS = {
  bordered: { root: "divide-y overflow-hidden rounded-xl border", item: "" },
  separated: { root: "flex flex-col gap-2", item: "overflow-hidden rounded-xl border" },
  plain: { root: "divide-y", item: "" },
} as const

const SPRINGINESS = {
  subtle: { type: "spring", stiffness: 260, damping: 30 },
  paper: { type: "spring", stiffness: 150, damping: 17, mass: 0.9 },
  bouncy: { type: "spring", stiffness: 170, damping: 10 },
} as const

const HEIGHT = { duration: 0.45, ease: [0.22, 1, 0.36, 1] } as const
const FOLD = { duration: 0.28, ease: [0.4, 0, 1, 1] } as const
const INSTANT = { duration: 0 } as const

export interface FoldAccordionProps
  extends Omit<React.ComponentProps<"div">, "defaultValue" | "onChange"> {
  items: FoldAccordionItem[]
  /** Allow more than one panel open at a time. */
  multiple?: boolean
  /** Open panels (controlled). */
  value?: string[]
  /** Panels open at first (uncontrolled). */
  defaultValue?: string[]
  onValueChange?: (value: string[]) => void
  /** Look of the accordion. */
  variant?: keyof typeof VARIANTS
  /** How the sheet settles as it unfolds. */
  springiness?: keyof typeof SPRINGINESS
  /** How far (in degrees) a closed panel is folded back. */
  foldAngle?: number
}

export function FoldAccordion({
  items,
  multiple = false,
  value: valueProp,
  defaultValue,
  onValueChange,
  variant = "bordered",
  springiness = "paper",
  foldAngle = 92,
  className,
  ...props
}: FoldAccordionProps) {
  const baseId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const reduceMotion = useReducedMotion()
  const [internalValue, setInternalValue] = useState<string[]>(
    defaultValue ?? []
  )
  const open = valueProp ?? internalValue

  function toggle(itemValue: string) {
    const isOpen = open.includes(itemValue)
    const next = isOpen
      ? open.filter((v) => v !== itemValue)
      : multiple
        ? [...open, itemValue]
        : [itemValue]
    if (valueProp === undefined) setInternalValue(next)
    onValueChange?.(next)
  }

  // Up / Down / Home / End move between headers (WAI-ARIA accordion pattern).
  function handleKeyDown(e: React.KeyboardEvent<HTMLButtonElement>) {
    const triggers = Array.from(
      rootRef.current?.querySelectorAll<HTMLButtonElement>(
        '[data-slot="fold-accordion-trigger"]'
      ) ?? []
    )
    const index = triggers.indexOf(e.currentTarget)
    const last = triggers.length - 1
    const next =
      e.key === "ArrowDown"
        ? index === last ? 0 : index + 1
        : e.key === "ArrowUp"
          ? index === 0 ? last : index - 1
          : e.key === "Home"
            ? 0
            : e.key === "End"
              ? last
              : -1
    if (next === -1) return
    e.preventDefault()
    triggers[next]?.focus()
  }

  const folded = { rotateX: -foldAngle, opacity: 0 }

  return (
    <div
      ref={rootRef}
      data-slot="fold-accordion"
      data-variant={variant}
      className={cn("w-full", VARIANTS[variant].root, className)}
      {...props}
    >
      {items.map((item, index) => {
        const isOpen = open.includes(item.value)
        const triggerId = `${baseId}-trigger-${index}`
        const panelId = `${baseId}-panel-${index}`

        return (
          <div
            key={item.value}
            data-state={isOpen ? "open" : "closed"}
            className={VARIANTS[variant].item}
          >
            <h3 className="flex">
              <button
                id={triggerId}
                type="button"
                data-slot="fold-accordion-trigger"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(item.value)}
                onKeyDown={handleKeyDown}
                className={cn(
                  "flex flex-1 items-center justify-between gap-4 py-4 text-left text-sm font-medium transition-colors",
                  "outline-none hover:bg-muted/40 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset",
                  variant === "plain" ? "px-1" : "px-4"
                )}
              >
                {item.title}
                <svg
                  aria-hidden
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={cn(
                    "size-4 shrink-0 text-muted-foreground transition-transform duration-300",
                    isOpen && "rotate-180"
                  )}
                >
                  <path d="M4 6l4 4 4-4" />
                </svg>
              </button>
            </h3>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  key="panel"
                  id={panelId}
                  role="region"
                  aria-labelledby={triggerId}
                  className="overflow-hidden"
                  style={{ perspective: 900 }}
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  exit={{ height: 0, transition: reduceMotion ? INSTANT : FOLD }}
                  transition={reduceMotion ? INSTANT : HEIGHT}
                >
                  {/* The sheet is hinged at its top edge and swings down into place, like unfolding paper. */}
                  <motion.div
                    className={cn(
                      "relative pb-4 text-sm text-muted-foreground",
                      variant === "plain" ? "px-1" : "px-4"
                    )}
                    style={{ transformOrigin: "top center" }}
                    initial={reduceMotion ? false : folded}
                    animate={{ rotateX: 0, opacity: 1 }}
                    exit={
                      reduceMotion
                        ? { opacity: 0, transition: INSTANT }
                        : { ...folded, transition: FOLD }
                    }
                    transition={SPRINGINESS[springiness]}
                  >
                    {item.content}
                    {/* Crease shadow that fades as the sheet flattens out. */}
                    <motion.span
                      aria-hidden
                      className="pointer-events-none absolute inset-0 bg-gradient-to-b from-foreground/15 via-foreground/5 to-transparent"
                      initial={reduceMotion ? false : { opacity: 1 }}
                      animate={{ opacity: 0 }}
                      exit={{ opacity: 1, transition: FOLD }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                    />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}
