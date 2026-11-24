"use client"

/**
 * Relic UI · Crumple Trash
 * https://relic-ui.vercel.app/docs/crumple-trash
 *
 * Copyright (c) 2026 Shubham Tambe
 * Open source under the MIT License: https://relic-ui.vercel.app/license
 */

import { useEffect, useRef, useState } from "react"
import { AnimatePresence, MotionConfig, motion, useAnimate, useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"

export type TrashItem = {
  id: string
  title: string
  description?: string
  icon?: React.ReactNode
}

export interface CrumpleTrashProps {
  /** The items in the list (you remove them in onDelete). */
  items: TrashItem[]
  /** Called once an item has been crumpled into the bin. */
  onDelete: (item: TrashItem) => void
  /** Called when Undo is pressed, with the item and where it was. */
  onRestore?: (item: TrashItem, index: number) => void
  /** Seconds the Undo bar stays. 0 hides Undo. */
  undoSeconds?: number
  /** Which corner the bin sits in. */
  binPosition?: "right" | "left"
  /** Show how many items are in the bin. */
  showCount?: boolean
  /** How high the paper ball arcs on its way to the bin, in pixels. */
  arc?: number
  /** Speed multiplier for the crumple and the throw. */
  speed?: number
  /** Shown when the list is empty. */
  emptyText?: string
  /** Called when the bin is pressed, e.g. to open a trash page. */
  onBinClick?: () => void
  className?: string
}

type Undo = { item: TrashItem; index: number; key: number }

function Bin({ open, count, showCount }: { open: boolean; count: number; showCount: boolean }) {
  return (
    <span className="relative block">
      <svg viewBox="0 0 32 36" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="h-9 w-8 overflow-visible">
        <motion.g
          style={{ transformBox: "fill-box", transformOrigin: "0% 100%" }}
          initial={false}
          animate={open ? { rotate: -38, y: -2 } : { rotate: 0, y: 0 }}
          transition={open ? { type: "spring", stiffness: 400, damping: 20 } : { type: "spring", stiffness: 600, damping: 9 }}
        >
          <path d="M4 9h24" />
          <path d="M12 9V6.5A1.5 1.5 0 0 1 13.5 5h5A1.5 1.5 0 0 1 20 6.5V9" />
        </motion.g>
        <path d="M7 13l1.6 17.2A2 2 0 0 0 10.6 32h10.8a2 2 0 0 0 2-1.8L25 13" fill="currentColor" fillOpacity={0.08} />
        <path d="M13 17v10M19 17v10" strokeOpacity={0.5} />
      </svg>
      {showCount && count > 0 && (
        <motion.span
          key={count}
          initial={{ scale: 0.4 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 600, damping: 14 }}
          className="absolute -top-1.5 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-foreground px-1 font-mono text-[10px] leading-none text-background"
        >
          {count}
        </motion.span>
      )}
    </span>
  )
}

function Row({
  item,
  index,
  binRef,
  arc,
  speed,
  onThrown,
  onFlying,
}: {
  item: TrashItem
  index: number
  binRef: React.RefObject<HTMLButtonElement | null>
  arc: number
  speed: number
  onThrown: (item: TrashItem, index: number) => void
  onFlying: (flying: boolean) => void
}) {
  const [scope, animate] = useAnimate<HTMLDivElement>()
  const reduce = useReducedMotion()
  const busy = useRef(false)
  const [lifted, setLifted] = useState(false)

  async function trash() {
    if (busy.current) return
    busy.current = true
    const card = scope.current
    const bin = binRef.current
    if (reduce || !card || !bin) {
      onThrown(item, index)
      return
    }
    const a = card.getBoundingClientRect()
    const b = bin.getBoundingClientRect()
    const ball = 30
    const dx = b.left + b.width / 2 - (a.left + a.width / 2)
    const dy = b.top + b.height * 0.35 - (a.top + a.height / 2)
    const t = 1 / Math.max(speed, 0.1)
    setLifted(true) // fly above the other rows

    // 1. Crumple: the text fades, creases appear, the sheet balls up.
    void animate(card.querySelectorAll("[data-content]"), { opacity: 0 }, { duration: 0.18 * t })
    void animate(card.querySelectorAll("[data-crease]"), { opacity: [0, 1] }, { duration: 0.25 * t })
    await animate(
      card,
      {
        scaleX: [1, 0.92, 0.6, ball / a.width],
        scaleY: [1, 0.7, 0.8, ball / a.height],
        rotate: [0, -3, 6, 90],
        borderRadius: ["12px", "18px", "40px", "999px"],
      },
      { duration: 0.42 * t, ease: "easeIn" }
    )
    // 2. Throw it in an arc into the bin.
    onFlying(true)
    await animate(
      card,
      {
        x: [0, dx * 0.5, dx],
        y: [0, Math.min(0, dy) - arc, dy],
        rotate: [90, 300, 420],
        scaleX: [ball / a.width, ball / a.width, (ball * 0.6) / a.width],
        scaleY: [ball / a.height, ball / a.height, (ball * 0.6) / a.height],
      },
      { duration: 0.55 * t, ease: "linear", times: [0, 0.45, 1] }
    )
    await animate(card, { opacity: 0 }, { duration: 0.08 })
    onFlying(false)
    onThrown(item, index)
  }

  return (
    <motion.li
      layout
      initial={{ opacity: 0, scale: 0.6, rotate: -20 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      exit={{ height: 0, marginTop: 0, opacity: 0, transition: { duration: 0.25 } }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className={cn("relative", lifted && "z-50")}
    >
      <div
        ref={scope}
        tabIndex={0}
        aria-label={item.description ? `${item.title}, ${item.description}` : item.title}
        aria-keyshortcuts="Delete"
        onKeyDown={(e) => {
          if (e.key === "Delete" || e.key === "Backspace") {
            e.preventDefault()
            void trash()
          }
        }}
        className="group relative z-10 flex items-center gap-3 overflow-hidden rounded-xl border bg-background p-3 shadow-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        {/* Creases that show while the sheet crumples. */}
        <svg data-crease aria-hidden viewBox="0 0 100 40" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 size-full text-foreground/25 opacity-0">
          <path d="M0 12L22 20 40 6 58 26 80 10 100 22M8 40L30 24 52 36 70 18 92 40M18 0L30 24M58 26L64 0" fill="none" stroke="currentColor" strokeWidth={0.6} vectorEffect="non-scaling-stroke" />
        </svg>
        <span data-content className="flex min-w-0 flex-1 items-center gap-3">
          {item.icon && <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground [&_svg]:size-4">{item.icon}</span>}
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium">{item.title}</span>
            {item.description && <span className="block truncate text-xs text-muted-foreground">{item.description}</span>}
          </span>
        </span>
        <button
          data-content
          type="button"
          aria-label={`Delete ${item.title}`}
          onClick={() => void trash()}
          className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors outline-none hover:bg-destructive/10 hover:text-destructive focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" className="size-4">
            <path d="M2.5 4.5h11M6 4.5V3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1.5M4 4.5l.7 8.6a1 1 0 0 0 1 .9h4.6a1 1 0 0 0 1-.9l.7-8.6" />
          </svg>
        </button>
      </div>
    </motion.li>
  )
}

/**
 * A list where deleting feels physical: the row crumples into a paper ball,
 * arcs into the bin, and the lid bounces shut. An Undo bar lets the item
 * spring back. Rows can also be trashed with the Delete key.
 */
export function CrumpleTrash({
  items,
  onDelete,
  onRestore,
  undoSeconds = 5,
  binPosition = "right",
  showCount = true,
  arc = 60,
  speed = 1,
  emptyText = "Nothing here. Nice and tidy.",
  onBinClick,
  className,
}: CrumpleTrashProps) {
  const binRef = useRef<HTMLButtonElement>(null)
  const [flying, setFlying] = useState(0)
  const [count, setCount] = useState(0)
  const [undo, setUndo] = useState<Undo | null>(null)
  const [announce, setAnnounce] = useState("")
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  function thrown(item: TrashItem, index: number) {
    onDelete(item)
    setCount((c) => c + 1)
    setAnnounce(`Moved ${item.title} to the trash.${onRestore && undoSeconds > 0 ? " Undo is available." : ""}`)
    if (onRestore && undoSeconds > 0) {
      window.clearTimeout(timer.current)
      setUndo({ item, index, key: Date.now() })
      timer.current = window.setTimeout(() => setUndo(null), undoSeconds * 1000)
    }
  }

  function restore() {
    if (!undo) return
    window.clearTimeout(timer.current)
    onRestore?.(undo.item, undo.index)
    setCount((c) => Math.max(0, c - 1))
    setAnnounce(`Restored ${undo.item.title}.`)
    setUndo(null)
  }

  const bin = (
    <button
      ref={binRef}
      type="button"
      onClick={onBinClick}
      aria-label={`Trash, ${count} item${count === 1 ? "" : "s"}`}
      className={cn(
        "flex shrink-0 items-center justify-center rounded-xl p-1.5 text-muted-foreground transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        onBinClick ? "hover:bg-muted hover:text-foreground" : "cursor-default",
        flying > 0 && "text-foreground"
      )}
    >
      <Bin open={flying > 0} count={count} showCount={showCount} />
    </button>
  )

  return (
    <MotionConfig reducedMotion="user">
      <div
        data-slot="crumple-trash"
        className={cn("flex w-full flex-col gap-3", className)}
        onKeyDown={(e) => {
          if (undo && (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z") {
            e.preventDefault()
            restore()
          }
        }}
      >
        <ul className="flex flex-col gap-2" aria-label="Items">
          <AnimatePresence initial={false}>
            {items.map((item, i) => (
              <Row
                key={item.id}
                item={item}
                index={i}
                binRef={binRef}
                arc={arc}
                speed={speed}
                onThrown={thrown}
                onFlying={(f) => setFlying((n) => Math.max(0, n + (f ? 1 : -1)))}
              />
            ))}
          </AnimatePresence>
          {items.length === 0 && (
            <motion.li initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
              {emptyText}
            </motion.li>
          )}
        </ul>

        <div className={cn("flex min-h-12 items-end gap-3", binPosition === "left" && "flex-row-reverse")}>
          <div className="min-w-0 flex-1">
            <AnimatePresence>
              {undo && (
                <motion.div
                  key={undo.key}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8, transition: { duration: 0.15 } }}
                  className="relative flex items-center gap-3 overflow-hidden rounded-xl border bg-background py-2 pr-2 pl-3 text-sm shadow-sm"
                >
                  <span className="min-w-0 flex-1 truncate text-muted-foreground">
                    <span className="text-foreground">{undo.item.title}</span> moved to trash
                  </span>
                  <button
                    type="button"
                    onClick={restore}
                    className="shrink-0 rounded-lg px-2.5 py-1 text-sm font-medium transition-colors outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/50"
                  >
                    Undo
                  </button>
                  <motion.span
                    aria-hidden
                    className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-brand"
                    initial={{ scaleX: 1 }}
                    animate={{ scaleX: 0 }}
                    transition={{ duration: undoSeconds, ease: "linear" }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {bin}
        </div>
        <span role="status" className="sr-only">
          {announce}
        </span>
      </div>
    </MotionConfig>
  )
}
