"use client"

/**
 * Relic UI · Ticket Toast
 * https://relic-ui.vercel.app/docs/ticket-toast
 *
 * Copyright (c) 2026 Shubham Tambe
 * Open source under the MIT License: https://relic-ui.vercel.app/license
 */

import { useEffect, useState, useSyncExternalStore } from "react"
import { AnimatePresence, MotionConfig, motion, type Variants } from "motion/react"

import { cn } from "@/lib/utils"

/* -------------------------------------------------------------------------- */
/*                                    Store                                   */
/* -------------------------------------------------------------------------- */

export type TicketToastOptions = {
  title: React.ReactNode
  description?: React.ReactNode
  /** Content of the tear-off stub. Defaults to a close mark. */
  stub?: React.ReactNode
  /** Milliseconds before it tears itself off. Infinity keeps it open. */
  duration?: number
  /** Look of the toast. Adds a matching icon unless `icon` is given. */
  variant?: "default" | "success" | "error"
  /** A custom icon before the title. Pass null to show none. */
  icon?: React.ReactNode
  /** A button inside the toast, e.g. { label: "Undo", onClick }. */
  action?: { label: string; onClick: () => void }
}

type Toast = TicketToastOptions & { id: number }

let toasts: Toast[] = []
let nextId = 1
const listeners = new Set<() => void>()
const EMPTY: Toast[] = []

function emit() {
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/** Show a ticket toast. Accepts a title, or an options object. Returns its id. */
export function ticketToast(input: React.ReactNode | TicketToastOptions) {
  const options: TicketToastOptions =
    typeof input === "object" && input !== null && "title" in input
      ? (input as TicketToastOptions)
      : { title: input as React.ReactNode }
  const id = nextId++
  toasts = [...toasts, { ...options, id }]
  emit()
  return id
}

/** Tear off a toast early. */
ticketToast.dismiss = (id: number) => {
  toasts = toasts.filter((t) => t.id !== id)
  emit()
}

/* -------------------------------------------------------------------------- */
/*                                   Toaster                                  */
/* -------------------------------------------------------------------------- */

const POSITIONS = {
  "bottom-right": "right-0 bottom-0 items-end",
  "bottom-left": "bottom-0 left-0 items-start",
  "top-right": "top-0 right-0 items-end flex-col-reverse",
  "top-left": "top-0 left-0 items-start flex-col-reverse",
} as const

export interface TicketToasterProps {
  position?: keyof typeof POSITIONS
  /** Most toasts visible at once. Older ones wait their turn. */
  max?: number
  className?: string
}

/** Place once, near the root of your app. Toasts appear here. */
export function TicketToaster({
  position = "bottom-right",
  max = 3,
  className,
}: TicketToasterProps) {
  const all = useSyncExternalStore(subscribe, () => toasts, () => EMPTY)
  const items = all.slice(-Math.max(max, 1))

  return (
    <MotionConfig reducedMotion="user">
      <section
        aria-label="Notifications"
        aria-live="polite"
        className={cn(
          "pointer-events-none fixed z-[100] flex w-full max-w-sm flex-col gap-2 p-4",
          POSITIONS[position],
          className
        )}
      >
        <AnimatePresence initial={false}>
          {items.map((toast) => (
            <TicketToastItem key={toast.id} toast={toast} />
          ))}
        </AnimatePresence>
      </section>
    </MotionConfig>
  )
}

const ticket: Variants = {
  initial: { opacity: 0, y: 16, scale: 0.97 },
  enter: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 420, damping: 32 },
  },
  // The body leaves only after the stub has torn off.
  exit: {
    opacity: 0,
    x: 24,
    transition: { delay: 0.28, duration: 0.22, ease: "easeIn" },
  },
}

const stub: Variants = {
  initial: {},
  enter: {},
  exit: {
    y: 56,
    rotate: 16,
    opacity: 0,
    transition: { duration: 0.38, ease: [0.4, 0, 1, 1] },
  },
}

const VARIANT_ICONS = {
  default: null,
  success: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="8" r="6.5" />
      <path d="M5.2 8.2l1.9 1.9 3.7-3.9" />
    </svg>
  ),
  error: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
      <circle cx="8" cy="8" r="6.5" />
      <path d="M8 4.8v3.6M8 11h.01" />
    </svg>
  ),
} as const

function TicketToastItem({ toast }: { toast: Toast }) {
  const [paused, setPaused] = useState(false)
  const duration = toast.duration ?? 4000
  const variant = toast.variant ?? "default"
  const icon = toast.icon === undefined ? VARIANT_ICONS[variant] : toast.icon

  // Auto-dismiss, paused while the pointer is over the toast.
  useEffect(() => {
    if (paused || !Number.isFinite(duration)) return
    const timer = setTimeout(() => ticketToast.dismiss(toast.id), duration)
    return () => clearTimeout(timer)
  }, [paused, duration, toast.id])

  return (
    <motion.div
      layout
      role="status"
      variants={ticket}
      initial="initial"
      animate="enter"
      exit="exit"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      data-variant={variant}
      className={cn(
        "pointer-events-auto flex w-full rounded-xl border bg-background text-sm shadow-lg",
        variant === "error" && "border-destructive/40"
      )}
    >
      <div className="flex min-w-0 flex-1 gap-3 p-4">
        {icon && (
          <span
            aria-hidden
            className={cn(
              "mt-0.5 shrink-0 [&_svg]:size-4",
              variant === "error" ? "text-destructive" : "text-primary"
            )}
          >
            {icon}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <div className={cn("font-medium", variant === "error" && "text-destructive")}>
            {toast.title}
          </div>
          {toast.description && (
            <div className="mt-1 text-muted-foreground">{toast.description}</div>
          )}
          {toast.action && (
            <button
              type="button"
              onClick={() => {
                toast.action?.onClick()
                ticketToast.dismiss(toast.id)
              }}
              className="mt-2.5 inline-flex h-7 items-center rounded-md border px-2.5 text-xs font-medium transition-colors outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {toast.action.label}
            </button>
          )}
        </div>
      </div>
      <span aria-hidden className="my-2 border-l-2 border-dashed" />
      <motion.button
        type="button"
        variants={stub}
        style={{ transformOrigin: "top left" }}
        onClick={() => ticketToast.dismiss(toast.id)}
        aria-label="Dismiss notification"
        className="flex w-14 shrink-0 items-center justify-center rounded-r-xl bg-background text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        {toast.stub ?? (
          <svg
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.6}
            strokeLinecap="round"
            className="size-4"
          >
            <path d="M4 4l8 8M12 4l-8 8" />
          </svg>
        )}
      </motion.button>
    </motion.div>
  )
}
